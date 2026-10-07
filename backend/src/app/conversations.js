import { randomUUID } from "node:crypto";
import { AppIdentity, accountProof } from "./identity.js";
import { AppProblem } from "./problem.js";
import { validateContract, UUID, IDEM } from "./contracts.js";
import {
  accountTransaction,
  scopeKey,
  ownedConversation,
  currentAccess,
  queueContext,
  claim,
  conversationView,
  operationView,
  receiptView,
} from "./store.js";
import { semanticHash } from "./s2s.js";
import { deliverLifecycle } from "./lifecycle.js";
function requireAccess(c, access, permission = "history") {
  // Case messages and receipts are not classified individually: fail closed as a whole.
  if (
    !access.permissions.includes(permission) ||
    (c.caseId && !access.permissions.includes("case_context"))
  )
    throw new AppProblem(403, "capability_denied");
}
async function recordReceipt(tx, operationId, receipt, httpStatus = 200) {
  const current = await tx.appOperation.findUnique({
    where: { id: operationId },
  });
  if (
    current.response?.receipt_revision &&
    BigInt(current.response.receipt_revision) >=
      BigInt(receipt.receipt_revision)
  )
    return;
  await tx.appOperation.update({
    where: { id: operationId },
    data: {
      response: receipt,
      status: "admitted",
      errorCode: null,
      httpStatus,
      retainedUntil: new Date(receipt.retained_until),
    },
  });
}
export class AppConversationService {
  constructor(db, client, config) {
    Object.assign(this, { db, client, config });
    this.identity = new AppIdentity(db);
  }
  enabled() {
    if (!this.config.enabled || !this.config.integrationId)
      throw new AppProblem(503, "runtime_unavailable");
  }
  async authorized(token, fn) {
    this.enabled();
    const { user } = await this.identity.authenticate(token);
    return accountTransaction(this.db, user.id, async (tx) => {
      const current = await new AppIdentity(tx).authenticate(token);
      return fn(tx, current.user, current.session);
    });
  }
  async list(token) {
    const candidates = await this.authorized(token, (tx, user) =>
      tx.appConversation.findMany({
        where: { userId: user.id, integrationId: this.config.integrationId },
        orderBy: { createdAt: "desc" },
      }),
    );
    const confirmed = new Set();
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(4, candidates.length) }, async () => {
      while (next < candidates.length) {
        const c = candidates[next++];
        if (!c.remoteId) continue;
        try {
          const t = await this.timeline(token, c.id, { limit: "1" });
          if (t.metadata_ready) confirmed.add(c.id);
        } catch {
          // Keep previously confirmed values; never claim the cached status is current.
        }
      }
    }));
    return this.authorized(token, async (tx, user) => {
      const rows = await tx.appConversation.findMany({
        where: { userId: user.id, integrationId: this.config.integrationId },
        orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
      });
      const result = [];
      for (const row of rows) {
        try { await ownedConversation(tx, row.id, user.id, this.config.integrationId); }
        catch (e) { if (e.code === "conversation_not_found") continue; throw e; }
        result.push(conversationView(row, confirmed.has(row.id)));
      }
      return result;
    });
  }
  async rename(token, id, input) {
    if (!input || Object.keys(input).length !== 1 || !Object.hasOwn(input, "title"))
      throw new AppProblem(400, "invalid_payload");
    let title = input.title;
    if (title !== null) {
      if (typeof title !== "string" || !title.isWellFormed() || /\p{Cc}/u.test(title))
        throw new AppProblem(400, "invalid_payload");
      title = title.trim().normalize("NFC");
      if (!title || [...title].length > 120) throw new AppProblem(400, "invalid_payload");
    }
    return this.authorized(token, async (tx, user) => {
      const c = await ownedConversation(tx, id, user.id, this.config.integrationId);
      requireAccess(c, await currentAccess(tx, c, user, this.config));
      return conversationView(await tx.appConversation.update({ where: { id }, data: { title } }));
    });
  }
  async start(token, input, key) {
    if (
      !input ||
      Object.keys(input).some((k) => !["purpose", "case_ref"].includes(k)) ||
      !["sondeo", "atencion"].includes(input.purpose) ||
      (input.case_ref && !UUID.test(input.case_ref)) ||
      !IDEM.test(key || "")
    )
      throw new AppProblem(400, "invalid_payload");
    // Refresh the candidate before choosing between resuming it and opening a new session.
    // Replay of an old idempotency key keeps its original historical association.
    const candidate = await this.authorized(token, async (tx, user) => {
      const previous = await tx.appOperation.findUnique({
        where: { userId_integrationId_scopeId_kind_idempotencyKey: {
          userId: user.id, integrationId: this.config.integrationId, scopeId: "",
          kind: "session", idempotencyKey: key,
        } },
      });
      if (previous) return null;
      return tx.appConversation.findFirst({
        where: { userId: user.id, integrationId: this.config.integrationId,
          scopeKey: scopeKey(input.purpose, input.case_ref || null), status: { not: "closed" } },
        orderBy: { createdAt: "desc" },
      });
    });
    if (candidate?.remoteId) await this.timeline(token, candidate.id, { limit: "1" });
    const state = await this.authorized(token, async (tx, user) => {
      const caseId = input.case_ref || null;
      if (
        caseId &&
        !(await tx.expediente.findFirst({
          where: { id: caseId, userId: user.id },
          select: { id: true },
        }))
      )
        throw new AppProblem(404, "conversation_not_found");
      const previous = await tx.appOperation.findUnique({
        where: {
          userId_integrationId_scopeId_kind_idempotencyKey: {
            userId: user.id,
            integrationId: this.config.integrationId,
            scopeId: "",
            kind: "session",
            idempotencyKey: key,
          },
        },
      });
      if (previous) {
        if (
          previous.request.purpose !== input.purpose ||
          previous.request.case_ref !== caseId
        )
          throw new AppProblem(409, "idempotency_conflict");
        const conversation = await ownedConversation(
          tx,
          previous.conversationId,
          user.id,
          this.config.integrationId,
        );
        requireAccess(
          conversation,
          await currentAccess(tx, conversation, user, this.config),
        );
        if (
          previous.status === "retired" ||
          (previous.response && previous.retainedUntil <= new Date())
        )
          throw new AppProblem(410, "operation_retired");
        return { conversation, operation: previous, created: false };
      }
      const scope = scopeKey(input.purpose, caseId);
      let c = await tx.appConversation.findFirst({
        where: { userId: user.id, integrationId: this.config.integrationId,
          scopeKey: scope, status: { not: "closed" } },
        orderBy: { createdAt: "desc" },
      });
      if (c) requireAccess(c, await currentAccess(tx, c, user, this.config));
      if (c?.remoteId)
        return { conversation: c, operation: null, created: false };
      if (c) {
        const operation = await tx.appOperation.findFirst({
          where: { conversationId: c.id, kind: "session" },
        });
        return { conversation: c, operation, created: false };
      }
      c = await tx.appConversation.create({
        data: {
          userId: user.id,
          integrationId: this.config.integrationId,
          scopeKey: scope,
          purpose: input.purpose,
          caseId,
        },
      });
      const access = await currentAccess(tx, c, user, this.config);
      requireAccess(c, access);
      if (caseId && !access.permissions.includes("case_context"))
        throw new AppProblem(403, "capability_denied");
      const request = {
        schema_version: "1.0",
        portal_user_id: user.id,
        purpose: c.purpose,
        identity: accountProof(user),
        correlation_id: randomUUID(),
        resume_conversation_id: null,
        case_ref: access.case_ref,
        client_key: null,
      };
      validateContract("SessionRequest", request);
      const { operation, created } = await claim(tx, {
        userId: user.id,
        integrationId: this.config.integrationId,
        conversationId: c.id,
        kind: "session",
        key,
        request,
      });
      return { conversation: c, operation, created };
    });
    if (state.created) await this.dispatch(state.operation);
    return this.authorized(token, async (tx, user) => {
      const c = await ownedConversation(
          tx,
          state.conversation.id,
          user.id,
          this.config.integrationId,
        ),
        op = state.operation
          ? await tx.appOperation.findUnique({
              where: { id: state.operation.id },
            })
          : null;
      requireAccess(c, await currentAccess(tx, c, user, this.config));
      return {
        conversation: conversationView(c),
        operation: op ? operationView(op) : null,
      };
    });
  }
  async context(token, id, permission) {
    const state = await this.authorized(token, async (tx, user) =>
      queueContext(
        tx,
        await ownedConversation(tx, id, user.id, this.config.integrationId),
        user,
        this.config,
      ),
    );
    requireAccess(state.conversation, state.access, permission || "history");
    const c = state.conversation;
    if (!c.remoteId) throw new AppProblem(409, "session_pending");
    if (c.contextRevision !== c.syncedRevision) {
      const op = await this.db.appOperation.findFirst({
        where: {
          conversationId: c.id,
          kind: "context",
          logicalId: c.contextRevision,
        },
      });
      await deliverLifecycle(this.db, this.client, this.config, op);
    }
    return this.authorized(token, async (tx, user) => {
      const current = await ownedConversation(
          tx,
          id,
          user.id,
          this.config.integrationId,
        ),
        access = await currentAccess(tx, current, user, this.config);
      requireAccess(current, access, permission || "history");
      if (current.contextRevision !== current.syncedRevision)
        throw new AppProblem(503, "context_unavailable");
      return { conversation: current, access };
    });
  }
  async timeline(token, id, query = {}) {
    const { conversation: c } = await this.context(token, id, "history");
    const r = await this.client.call(
      "timeline",
      "GET",
      `/sessions/${c.remoteId}/timeline`,
      c.userId,
      null,
      { query },
    );
    validateContract(query.turn_id ? "ReceiptLookup" : "Timeline", r.data, {
      response: true,
    });
    if (r.data.conversation_id !== c.remoteId)
      throw new AppProblem(502, "invalid_upstream_response");
    await this.context(token, id, "history");
    return this.authorized(token, async (tx, user) => {
      const current = await ownedConversation(
        tx,
        id,
        user.id,
        this.config.integrationId,
      );
      const access = await currentAccess(tx, current, user, this.config);
      requireAccess(current, access);
      if (
        current.contextRevision !== c.contextRevision ||
        current.contextRevision !== current.syncedRevision ||
        BigInt(r.data.state_revision) < BigInt(current.stateRevision)
      )
        throw new AppProblem(503, "context_unavailable");
      const receipts = query.turn_id ? [r.data.receipt] : r.data.turn_statuses;
      for (const receipt of receipts) {
        if (
          receipt.conversation_id !== c.remoteId ||
          receipt.operation !== "turn" ||
          (query.turn_id && receipt.turn_id !== query.turn_id)
        )
          throw new AppProblem(502, "invalid_upstream_response");
        const op = await tx.appOperation.findFirst({
          where: {
            conversationId: id,
            kind: "turn",
            logicalId: receipt.turn_id,
          },
        });
        if (op) await recordReceipt(tx, op.id, receipt);
      }
      await tx.appConversation.update({
        where: { id },
        data: {
          stateRevision: r.data.state_revision,
          ...(query.turn_id ? {} : {
            status: r.data.conversation_status,
            ...(r.data.created_at !== undefined ? { remoteCreatedAt: new Date(r.data.created_at) } : {}),
            ...(Object.hasOwn(r.data, "last_message_at") ? {
              lastMessageAt: r.data.last_message_at === null ? null : new Date(r.data.last_message_at),
            } : {}),
          }),
        },
      });
      if (query.turn_id)
        return {
          receipt: receiptView(r.data.receipt, id),
          state_revision: r.data.state_revision,
        };
      const pending = await tx.appOperation.findMany({
        where: {
          conversationId: id,
          kind: { in: ["session", "turn", "handoff"] },
          status: { in: ["prepared", "outcome_unknown"] },
        },
        orderBy: { createdAt: "asc" },
      });
      // effective_agent and all identity/CRM fields are deliberately omitted from the mobile projection.
      return {
        schema_version: "1.0",
        conversation_id: id,
        items: r.data.items,
        next_cursor: r.data.next_cursor,
        has_more: r.data.has_more,
        conversation_status: r.data.conversation_status,
        created_at: r.data.created_at ?? (current.remoteCreatedAt || current.createdAt).toISOString(),
        last_message_at: r.data.last_message_at ?? null,
        metadata_ready: r.data.created_at !== undefined && Object.hasOwn(r.data, "last_message_at"),
        support: r.data.support,
        turn_statuses: r.data.turn_statuses.map((receipt) =>
          receiptView(receipt, id),
        ),
        sondeo: r.data.sondeo,
        state_revision: r.data.state_revision,
        permissions: access.permissions,
        pending_operations: pending.map(operationView),
      };
    });
  }
  async turn(token, id, input) {
    if (
      !input ||
      Object.keys(input).some(
        (k) =>
          ![
            "turn_id",
            "kind",
            "text",
            "presentation_id",
            "presentation_revision",
            "action_id",
          ].includes(k),
      )
    )
      throw new AppProblem(400, "invalid_payload");
    const dto = {
      schema_version: "1.0",
      ...input,
      correlation_id: randomUUID(),
    };
    validateContract("TurnRequest", dto);
    const existing = await this.recover(
      token,
      id,
      "turn",
      `turn:${dto.turn_id}`,
      dto,
      dto.turn_id,
    );
    if (existing) return existing;
    const { conversation: c } = await this.context(token, id, "history");
    if (c.status === "closed") throw new AppProblem(409, "conversation_closed");
    if (
      c.purpose === "sondeo" &&
      !c.context?.permissions.includes("sondeo") &&
      c.status === "active"
    )
      throw new AppProblem(403, "capability_denied");
    return this.submit(
      token,
      id,
      "turn",
      `turn:${dto.turn_id}`,
      dto,
      dto.turn_id,
    );
  }
  async handoff(token, id, input, key) {
    if (
      !input ||
      Object.keys(input).some((k) => !["target_kind", "reason"].includes(k)) ||
      !IDEM.test(key || "")
    )
      throw new AppProblem(400, "invalid_payload");
    const dto = {
      schema_version: "1.0",
      ...input,
      correlation_id: randomUUID(),
    };
    validateContract("HandoffRequest", dto);
    const existing = await this.recover(token, id, "handoff", key, dto);
    if (existing) return existing;
    const permission = {
      commercial: "commercial_handoff",
      manager: "manager_handoff",
      support: "support_handoff",
    }[dto.target_kind];
    const { conversation: c } = await this.context(token, id, permission);
    if (c.status === "closed") throw new AppProblem(409, "conversation_closed");
    return this.submit(token, id, "handoff", key, dto);
  }
  async recover(token, id, kind, key, request, logicalId = null) {
    const op = await this.authorized(token, async (tx, user) => {
      const c = await ownedConversation(
        tx,
        id,
        user.id,
        this.config.integrationId,
      );
      const row = await tx.appOperation.findFirst({
        where: {
          conversationId: id,
          kind,
          OR: [{ idempotencyKey: key }, ...(logicalId ? [{ logicalId }] : [])],
        },
      });
      if (
        row &&
        row.semanticHash !== semanticHash(kind, user.id, c.remoteId, request)
      )
        throw new AppProblem(409, "idempotency_conflict");
      return row;
    });
    return op ? this.operation(token, op.id) : null;
  }
  async submit(token, id, kind, key, request, logicalId = null) {
    const state = await this.authorized(token, async (tx, user) => {
      const c = await ownedConversation(
          tx,
          id,
          user.id,
          this.config.integrationId,
        ),
        access = await currentAccess(tx, c, user, this.config);
      if (
        !access.permissions.includes("history") ||
        c.contextRevision !== c.syncedRevision
      )
        throw new AppProblem(403, "capability_denied");
      if (
        kind === "handoff" &&
        !access.permissions.includes(`${request.target_kind}_handoff`)
      )
        throw new AppProblem(403, "capability_denied");
      if (c.status === "closed")
        throw new AppProblem(409, "conversation_closed");
      return claim(tx, {
        userId: user.id,
        integrationId: this.config.integrationId,
        conversationId: id,
        kind,
        key,
        request,
        logicalId,
        remoteId: c.remoteId,
      });
    });
    if (state.created) await this.dispatch(state.operation);
    return this.operation(token, state.operation.id);
  }
  async operation(token, id) {
    return this.authorized(token, async (tx, user) => {
      const op = await tx.appOperation.findFirst({
        where: {
          id,
          userId: user.id,
          integrationId: this.config.integrationId,
          kind: { in: ["session", "turn", "handoff"] },
        },
      });
      if (!op) throw new AppProblem(404, "operation_not_found");
      if (op.conversationId) {
        const c = await ownedConversation(
            tx,
            op.conversationId,
            user.id,
            this.config.integrationId,
          ),
          access = await currentAccess(tx, c, user, this.config);
        requireAccess(c, access);
      }
      if (
        op.status === "retired" ||
        (op.response && op.retainedUntil <= new Date())
      )
        throw new AppProblem(410, "operation_retired");
      return operationView(op);
    });
  }
  async retry(token, id) {
    await this.operation(token, id);
    const op = await this.db.appOperation.findUnique({ where: { id } });
    if (op.status === "admitted") return this.operation(token, id);
    if (op.kind !== "session") {
      const perm =
        op.kind === "handoff" ? `${op.request.target_kind}_handoff` : "history";
      await this.context(token, op.conversationId, perm);
      const c = await this.db.appConversation.findUnique({
        where: { id: op.conversationId },
      });
      if (c.status === "closed")
        throw new AppProblem(409, "conversation_closed");
    }
    if (op.status !== "admitted") await this.dispatch(op);
    return this.operation(token, id);
  }
  async dispatch(op) {
    const c = await this.db.appConversation.findUnique({
      where: { id: op.conversationId },
    });
    const path =
      op.kind === "session"
        ? "/sessions"
        : `/sessions/${c.remoteId}/${op.kind === "turn" ? "turns" : "handoff"}`;
    try {
      const r = await this.client.call(
        op.kind,
        "POST",
        path,
        op.userId,
        op.request,
        { idempotencyKey: op.idempotencyKey },
      );
      validateContract(
        op.kind === "session" ? "SessionResponse" : "Receipt",
        r.data,
        { response: true },
      );
      if (
        (op.kind === "session" &&
          (r.data.purpose !== c.purpose ||
            (c.remoteId && r.data.conversation_id !== c.remoteId))) ||
        (op.kind !== "session" &&
          (r.data.conversation_id !== c.remoteId ||
            r.data.operation !== op.kind ||
            r.data.turn_id !== op.logicalId))
      )
        throw new AppProblem(502, "invalid_upstream_response");
      await accountTransaction(this.db, op.userId, async (tx) => {
        if (op.kind === "session") {
          const current = await tx.appOperation.findUnique({
            where: { id: op.id },
          });
          if (current.status !== "admitted")
            await tx.appOperation.update({
              where: { id: op.id },
              data: {
                status: "admitted",
                response: r.data,
                httpStatus: r.status,
                errorCode: null,
              },
            });
        } else await recordReceipt(tx, op.id, r.data, r.status);
        if (op.kind === "session") {
          const current = await tx.appConversation.findUnique({
            where: { id: c.id },
          });
          if (current.remoteId && current.remoteId !== r.data.conversation_id)
            throw new AppProblem(502, "invalid_upstream_response");
          if (!current.remoteId)
            await tx.appConversation.update({
              where: { id: c.id },
              data: {
                remoteId: r.data.conversation_id,
                status: r.data.status,
                stateRevision: r.data.state_revision,
                ...(r.data.created_at !== undefined ? { remoteCreatedAt: new Date(r.data.created_at) } : {}),
                ...(Object.hasOwn(r.data, "last_message_at") ? {
                  lastMessageAt: r.data.last_message_at === null ? null : new Date(r.data.last_message_at),
                } : {}),
              },
            });
        }
      });
    } catch (e) {
      const known =
        e instanceof AppProblem && e.status >= 400 && e.status < 500;
      await accountTransaction(this.db, op.userId, async (tx) => {
        const current = await tx.appOperation.findUnique({
          where: { id: op.id },
        });
        if (["admitted", "retired"].includes(current.status)) return;
        await tx.appOperation.update({
          where: { id: op.id },
          data: {
            status:
              e.status === 410
                ? "retired"
                : known
                  ? "failed"
                  : "outcome_unknown",
            errorCode: e instanceof AppProblem ? e.code : "runtime_unavailable",
          },
        });
      });
    }
  }
}
