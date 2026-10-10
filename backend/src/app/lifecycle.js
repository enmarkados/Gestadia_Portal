import { randomUUID } from "node:crypto";
import {
  accountTransaction,
  claim,
  ownedConversation,
  queueContext,
  scopeKey,
} from "./store.js";
import { validateContract, UUID } from "./contracts.js";
import { AppProblem } from "./problem.js";
export async function setConversationAccess(
  db,
  userId,
  purpose,
  caseId,
  grant,
) {
  if (
    !["sondeo", "atencion"].includes(purpose) ||
    !UUID.test(userId) ||
    (caseId && !UUID.test(caseId))
  )
    throw new AppProblem(400, "invalid_context");
  const now = new Date(),
    validatedAt = new Date(grant.validated_at),
    validUntil = new Date(grant.valid_until);
  if (
    !grant.source_ref ||
    grant.source_ref.length > 128 ||
    !Number.isFinite(+validUntil) ||
    !Number.isFinite(+validatedAt) ||
    validatedAt > now ||
    validUntil <= now
  )
    throw new AppProblem(400, "invalid_context");
  validateContract("ConversationContextRequest", {
    schema_version: "1.0",
    portal_user_id: userId,
    context_revision: "1",
    validated_at: validatedAt.toISOString(),
    permissions: grant.permissions,
    case_ref: caseId || null,
    commercial_assignment_ref: grant.commercial_assignment_ref ?? null,
    manager_assignment_ref: grant.manager_assignment_ref ?? null,
    correlation_id: randomUUID(),
  });
  const scope = scopeKey(purpose, caseId);
  return accountTransaction(db, userId, async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user || user.accountStatus !== "active")
      throw new AppProblem(403, "account_disabled");
    if (
      caseId &&
      !(await tx.expediente.findFirst({
        where: { id: caseId, userId },
        select: { id: true },
      }))
    )
      throw new AppProblem(404, "conversation_not_found");
    const data = {
      purpose,
      caseId: caseId || null,
      permissions: grant.permissions,
      commercialAssignmentRef: grant.commercial_assignment_ref ?? null,
      managerAssignmentRef: grant.manager_assignment_ref ?? null,
      sourceRef: grant.source_ref,
      validatedAt,
      validUntil,
    };
    await tx.appConversationAccess.upsert({
      where: { userId_scopeKey: { userId, scopeKey: scope } },
      create: { userId, scopeKey: scope, ...data },
      update: data,
    });
    const conversations = await tx.appConversation.findMany({
      where: { userId, scopeKey: scope },
    });
    for (const c of conversations) await queueContext(tx, c, user, {});
  });
}
export async function revokeAccount(
  db,
  userId,
  config,
  reason = "account_disabled",
) {
  if (!["account_disabled", "account_deleted"].includes(reason))
    throw new AppProblem(400, "invalid_payload");
  return accountTransaction(db, userId, async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        accountStatus: reason === "account_deleted" ? "deleted" : "disabled",
      },
    });
    await tx.appDeviceSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    const cs = await tx.appConversation.findMany({
      where: { userId },
      select: { integrationId: true },
    });
    for (const integrationId of new Set(
      [...cs.map((c) => c.integrationId), config.integrationId].filter(Boolean),
    )) {
      // Account-level withdrawal is irreversible here; repeating never revives it.
      const existing = await tx.appOperation.findFirst({
        where: { userId, integrationId, kind: "revocation" },
      });
      if (existing) continue;
      const dto = {
        schema_version: "1.0",
        scope: "account",
        reason_code: reason,
        correlation_id: randomUUID(),
      };
      await claim(tx, {
        userId,
        integrationId,
        kind: "revocation",
        key: `revocation:${userId}`,
        request: dto,
      });
    }
  });
}
export async function deliverLifecycle(db, client, config, op) {
  if (!config.enabled || op.integrationId !== config.integrationId) return;
  const c = op.conversationId
    ? await db.appConversation.findUnique({ where: { id: op.conversationId } })
    : null;
  if (op.kind === "context") {
    const user = await db.user.findUnique({ where: { id: op.userId } });
    if (user?.accountStatus !== "active") return;
    // Withdraw a newer snapshot before recovering an obsolete unknown operation.
    if (
      BigInt(c.contextRevision) > BigInt(op.request.context_revision) &&
      op.status === "outcome_unknown" &&
      c.syncedRevision !== c.contextRevision
    )
      return;
    if (
      BigInt(c.contextRevision) > BigInt(op.request.context_revision) &&
      op.status === "prepared"
    ) {
      await db.appOperation.update({
        where: { id: op.id },
        data: { status: "superseded" },
      });
      return;
    }
  }
  const path =
    op.kind === "revocation"
      ? `/subjects/${op.userId}/revocations`
      : `/sessions/${c.remoteId}/context`;
  try {
    const r = await client.call(
      op.kind === "revocation" ? "revocation" : "context",
      "POST",
      path,
      op.userId,
      op.request,
      { idempotencyKey: op.idempotencyKey },
    );
    validateContract(
      op.kind === "revocation"
        ? "RevocationResponse"
        : "ConversationContextResponse",
      r.data,
      { response: true },
    );
    if (
      op.kind === "context" &&
      (r.data.conversation_id !== c.remoteId ||
        r.data.context_revision !== op.request.context_revision ||
        BigInt(r.data.current_context_revision) > BigInt(c.contextRevision))
    )
      throw new AppProblem(502, "invalid_upstream_response");
    await accountTransaction(db, op.userId, async (tx) => {
      await tx.appOperation.update({
        where: { id: op.id },
        data: {
          status: "admitted",
          response: r.data,
          httpStatus: r.status,
          errorCode: null,
        },
      });
      if (c) {
        const current = await tx.appConversation.findUnique({
          where: { id: c.id },
        });
        if (current.contextRevision === r.data.current_context_revision)
          await tx.appConversation.update({
            where: { id: c.id },
            data: { syncedRevision: r.data.current_context_revision },
          });
      }
    });
  } catch (e) {
    await accountTransaction(db, op.userId, async (tx) => {
      const current = await tx.appOperation.findUnique({
        where: { id: op.id },
      });
      if (["admitted", "superseded", "retired"].includes(current.status))
        return;
      if (
        op.kind === "context" &&
        e instanceof AppProblem &&
        e.status === 409 &&
        e.code === "stale_context"
      ) {
        const confirmed = await tx.appConversation.findUnique({
          where: { id: c.id },
        });
        if (
          confirmed?.remoteId === c.remoteId &&
          confirmed.userId === op.userId &&
          confirmed.integrationId === op.integrationId &&
          confirmed.contextRevision === confirmed.syncedRevision &&
          BigInt(confirmed.syncedRevision) > BigInt(op.request.context_revision)
        ) {
          // Preserve the rejected operation; the newer context is confirmed.
          await tx.appOperation.update({
            where: { id: op.id },
            data: {
              status: "superseded",
              errorCode: "stale_context",
              httpStatus: 409,
            },
          });
          return;
        }
      }
      await tx.appOperation.update({
        where: { id: op.id },
        data: {
          status: "outcome_unknown",
          errorCode: e instanceof AppProblem ? e.code : "runtime_unavailable",
        },
      });
    });
  }
}
export async function drainLifecycle(db, client, config) {
  if (!config.enabled) return;
  const pending = {
    integrationId: config.integrationId,
    status: { in: ["prepared", "outcome_unknown"] },
  };
  const orderBy = [{ updatedAt: "asc" }, { createdAt: "desc" }];
  async function deliverBatch(ops, priority = false) {
    for (let i = 0; i < ops.length; i += 4) {
      if (!priority) await drainRevocations();
      await Promise.all(
        ops
          .slice(i, i + 4)
          .map((op) => deliverLifecycle(db, client, config, op)),
      );
    }
  }
  async function drainRevocations() {
    await deliverBatch(
      await db.appOperation.findMany({
        where: { ...pending, kind: "revocation" },
        orderBy,
        take: 100,
      }),
      true,
    );
  }
  // Recheck the priority queue between bounded groups, including during the authority scan.
  await drainRevocations();
  // Refresh expiration/ownership from durable authority even when no device makes a request.
  let cursor;
  for (;;) {
    const page = await db.appConversation.findMany({
      where: {
        integrationId: config.integrationId,
        ...(cursor ? { id: { gt: cursor } } : {}),
      },
      orderBy: { id: "asc" },
      take: 100,
    });
    for (let i = 0; i < page.length; i++) {
      if (i % 10 === 0) await drainRevocations();
      const c = page[i];
      await accountTransaction(db, c.userId, async (tx) => {
        const u = await tx.user.findUnique({ where: { id: c.userId } });
        if (u?.accountStatus === "active")
          await queueContext(
            tx,
            await tx.appConversation.findUnique({ where: { id: c.id } }),
            u,
            config,
          );
      });
    }
    if (page.length < 100) break;
    cursor = page.at(-1).id;
  }
  const withdrawals = await db.appOperation.findMany({
    where: {
      ...pending,
      kind: "context",
      request: { path: "$.permissions", equals: [] },
    },
    orderBy,
    take: 100,
  });
  await deliverBatch(withdrawals);
  const ops = await db.appOperation.findMany({
    where: {
      ...pending,
      kind: "context",
      id: { notIn: withdrawals.map((x) => x.id) },
    },
    orderBy,
    take: 100,
  });
  await deliverBatch(ops);
}
