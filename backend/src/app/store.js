import { randomUUID } from "node:crypto";
import { profileContext, sameProfilePatch } from "./profile.js";
import { callbackScopeAllows } from './callback-access.js';
import { accountProof } from "./identity.js";
import { sha256, canonicalJson, semanticHash } from "./s2s.js";
import { AppProblem } from "./problem.js";
import { validateContract } from "./contracts.js";
import { validAppointmentReceipts } from './appointment-receipts.js';
export const scopeKey = (purpose, caseId) =>
  sha256(`${purpose}\0${caseId || ""}`);
export async function accountTransaction(db, userId, fn) {
  for (let n = 0; ; n++)
    try {
      return await db.$transaction(
        async (tx) => {
          await tx.$queryRaw`SELECT id FROM User WHERE id = ${userId} FOR UPDATE`;
          return fn(tx);
        },
        { isolationLevel: "ReadCommitted", maxWait: 10000, timeout: 10000 },
      );
    } catch (e) {
      if (n >= 3 || !(e.code === "P2034" || e.meta?.code === "1213")) throw e;
    }
}
export async function ownedConversation(tx, id, userId, integrationId) {
  const c = await tx.appConversation.findFirst({
    where: { id, userId, integrationId },
  });
  if (!c) throw new AppProblem(404, "conversation_not_found");
  if (
    c.caseId &&
    !(await tx.expediente.findFirst({
      where: { id: c.caseId, userId },
      select: { id: true },
    }))
  )
    throw new AppProblem(404, "conversation_not_found");
  return c;
}
export async function currentAccess(tx, c, user, config) {
  accountProof(user);
  const grant = await tx.appConversationAccess.findUnique({
    where: { userId_scopeKey: { userId: user.id, scopeKey: c.scopeKey } },
  });
  let permissions,
    commercial = null,
    manager = null,
    date;
  if (
    c.caseId &&
    !(await tx.expediente.findFirst({
      where: { id: c.caseId, userId: user.id },
      select: { id: true },
    }))
  ) {
    return {
      permissions: [],
      case_ref: null,
      commercial_assignment_ref: null,
      manager_assignment_ref: null,
      validated_at: (
        grant?.validatedAt || user.accountVerifiedAt
      ).toISOString(),
    };
  }
  if (grant) {
    const valid =
      grant.validUntil > new Date() && grant.validatedAt <= new Date();
    permissions = valid ? grant.permissions : [];
    date = valid ? grant.validatedAt : grant.validUntil;
    if (valid && permissions.length) {
      commercial = grant.commercialAssignmentRef;
      manager = grant.managerAssignmentRef;
    }
  } else {
    permissions = c.caseId
      ? []
      : [
          "history",
          ...(c.purpose === "sondeo" ? ["sondeo"] : []),
          ...(config.generalSupport ? ["support_handoff"] : []),
          ...(config.generalCommercial ? ["commercial_handoff"] : []),
        ];
    date = user.accountVerifiedAt;
  }
  // CRM authority is additional and belongs to this row, never the account's
  // shared sondeo grant. Removing/expiring the pilot preserves basic access.
  permissions = permissions.filter(p => !["crm_prepare", "callback_schedule"].includes(p));
  const callback = c.callbackGrant;
  const callbackValidated = new Date(callback?.validated_at), callbackUntil = new Date(callback?.valid_until), now = new Date();
  if (callbackScopeAllows(config, c, user.id, now) &&
      permissions.includes('history') && permissions.includes('sondeo') &&
      Array.isArray(callback?.permissions) && callback.permissions.length === 2 &&
      callback.permissions.includes('crm_prepare') && callback.permissions.includes('callback_schedule') &&
      typeof callback.source_ref === 'string' && callback.source_ref.length > 0 && callback.source_ref.length <= 128 &&
      Number.isFinite(+callbackValidated) && callbackValidated <= now && callbackUntil > now &&
      callbackUntil <= new Date(config.callbackAccess.scope.expires_at)) {
    permissions.push('crm_prepare', 'callback_schedule');
    date = new Date(Math.max(+date, +callbackValidated));
  }
  if (config.allowedPermissions) permissions = permissions.filter(p => config.allowedPermissions.includes(p));
  if (!permissions.includes("commercial_handoff")) commercial = null;
  if (!permissions.includes("manager_handoff")) manager = null;
  return {
    permissions: [...permissions].sort(),
    case_ref:
      permissions.includes("case_context") ||
      permissions.includes("manager_handoff")
        ? c.caseId
        : null,
    commercial_assignment_ref: commercial,
    manager_assignment_ref: manager,
    validated_at: date.toISOString(),
  };
}
export async function claim(
  tx,
  {
    userId,
    integrationId,
    conversationId = null,
    kind,
    key,
    logicalId = null,
    request,
    semanticRequest = request,
    remoteId = "",
  },
) {
  const scopeId = kind === "session" ? "" : conversationId || "",
    hash = semanticHash(kind, userId, remoteId, semanticRequest);
  const previous = await tx.appOperation.findFirst({
    where: {
      userId,
      integrationId,
      scopeId,
      kind,
      OR: [{ idempotencyKey: key }, ...(logicalId ? [{ logicalId }] : [])],
    },
  });
  if (previous) {
    if (previous.semanticHash !== hash)
      throw new AppProblem(409, "idempotency_conflict");
    if (
      previous.status === "retired" ||
      (previous.response && previous.retainedUntil <= new Date())
    )
      throw new AppProblem(410, "operation_retired");
    return { operation: previous, created: false };
  }
  const operation = await tx.appOperation.create({
    data: {
      userId,
      integrationId,
      conversationId,
      scopeId,
      kind,
      idempotencyKey: key,
      logicalId,
      semanticHash: hash,
      request,
      retainedUntil: new Date(Date.now() + 30 * 86400000),
    },
  });
  return { operation, created: true };
}
export async function queueContext(tx, c, user, config) {
  const access = await currentAccess(tx, c, user, config);
  if (!c.remoteId) return { conversation: c, access };
  const lastProfile = c.profileRevision && c.profileRevision !== "0" ? {
    profile_revision: c.profileRevision, profile: c.profilePatch,
  } : null;
  const admitted = lastProfile ? await tx.appOperation.findMany({
    where: { userId: user.id, integrationId: c.integrationId, conversationId: c.id, kind: "context", status: "admitted", request: { path: "$.profile_revision", equals: c.profileRevision } },
  }) : [];
  const awaitingProfile = !!lastProfile && !admitted.some(op => sameProfilePatch(op.request, lastProfile));
  const profile = profileContext(c, user, config.profileContext === true && !awaitingProfile);
  // Do not advance the baseline while the last patch is uncertain. Authority
  // changes can carry that exact patch and be delivered with priority.
  if (awaitingProfile) profile.wire = lastProfile;
  const hash = sha256(canonicalJson({ ...access, ...profile.wire }));
  if (c.contextHash !== hash) {
    const revision = String(BigInt(c.contextRevision) + 1n);
    if (revision.length > 20) throw new AppProblem(409, "context_conflict");
    const dto = {
      schema_version: "1.0",
      portal_user_id: user.id,
      context_revision: revision,
      ...access,
      ...profile.wire,
      correlation_id: randomUUID(),
    };
    validateContract("ConversationContextRequest", dto);
    c = await tx.appConversation.update({
      where: { id: c.id },
      data: { contextRevision: revision, contextHash: hash, context: dto, ...profile.data },
    });
    await claim(tx, {
      userId: user.id,
      integrationId: c.integrationId,
      conversationId: c.id,
      kind: "context",
      key: `context:${c.id}:${revision}`,
      logicalId: revision,
      request: dto,
      remoteId: c.remoteId,
    });
  }
  return { conversation: c, access };
}
export function conversationView(c, metadataReady = false) {
  return {
    id: c.id,
    purpose: c.purpose,
    case_ref: c.caseId,
    status: c.status,
    ready: !!c.remoteId,
    title: c.title ?? null,
    manager_name: c.managerName ?? null,
    created_at: (c.remoteCreatedAt || c.createdAt).toISOString(),
    last_message_at: c.lastMessageAt?.toISOString() ?? null,
    metadata_ready: metadataReady,
  };
}
export function receiptView(receipt, id, permissions = []) {
  if (!receipt) return null;
  const result = receipt.result && { ...receipt.result };
  if (result && (!Array.isArray(permissions) ||
    !['history', 'crm_prepare', 'callback_schedule'].every(p => permissions.includes(p)) ||
    !validAppointmentReceipts(receipt))) delete result.appointment_receipt;
  return {
    ...receipt,
    result,
    conversation_id: id,
    error: receipt.error
      ? {
          type: "urn:gestadia:app:problem:operation_failed",
          title: "operation_failed",
          status: receipt.error.status,
          code: "operation_failed",
          detail: "No se pudo completar la operación.",
          correlation_id: receipt.error.correlation_id,
          retryable: false,
        }
      : null,
  };
}
export function operationView(op, permissions = []) {
  return {
    id: op.id,
    operation: op.kind,
    status: op.status,
    error_code: op.errorCode,
    receipt: ["turn", "handoff"].includes(op.kind)
      ? receiptView(op.response, op.conversationId, permissions)
      : null,
  };
}
