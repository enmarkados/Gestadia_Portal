import { db as defaultDb } from "../db.js";
import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import { accountTransaction } from "../app/store.js";
import { sealCredential, openCredential } from "./mobile-crypto.js";
import { revokeApple } from "./apple-auth.js";
import { revokeAccountAccess } from "../app/lifecycle.js";
import { config, appConversationConfig } from "../config.js";
import { deletionInventory, validateDeletionDecision } from "./account-deletion-review.js";
const denied = () => {
  throw Object.assign(
    new Error("Vuelve a iniciar sesión antes de solicitar el borrado"),
    { status: 403 },
  );
};
export function createAccountDeletion({
  db,
  now = () => new Date(),
  conversationConfig = appConversationConfig(),
  seal = sealCredential,
  open = openCredential,
  sendCompletion = async (to, subject, html, messageId) => {
    if (!config.smtp.enabled) throw new Error("completion_mail_unavailable");
    const smtp = nodemailer.createTransport({
      host: config.smtp.host, port: config.smtp.port, secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
      connectionTimeout: 20000, socketTimeout: 30000,
    });
    const sent = await smtp.sendMail({ from: config.smtp.from, to, subject, html, messageId });
    if (!sent.accepted?.length) throw new Error("completion_mail_not_accepted");
  },
}) {
  let pendingCursor;
  return {
    async requestVerified(userId, {actorRef, authorityRef, verified}) {
      if (verified !== true || typeof actorRef !== "string" || !actorRef.trim() || typeof authorityRef !== "string" || !authorityRef.trim() || actorRef.length > 1000 || authorityRef.length > 1000) throw new Error("ownership_verification_required");
      return accountTransaction(db, userId, async tx => {
        const user = await tx.user.findUnique({where:{id:userId}});
        if (!user || user.accessRevokedAt || user.accountStatus !== "active") throw new Error("active_account_required");
        const request = await tx.accountDeletionRequest.create({data:{userId,contactEmailEncrypted:seal(user.email,`deletion:${userId}`)}});
        await tx.user.update({where:{id:userId},data:{passwordHash:null,inviteToken:null,resetToken:null,resetTokenExp:null,accessRevokedAt:now()}});
        await revokeAccountAccess(tx,userId,conversationConfig);
        await tx.accountDeletionReview.create({data:{requestId:request.id,action:"verified_intake",actorRef,authorityRef,inventoryHash:"intake",decision:{ownershipVerified:true,verificationRef:authorityRef}}});
        return {id:request.id,status:request.status};
      });
    },
    async request(actor, confirm) {
      if (
        confirm !== true ||
        !actor?.session ||
        actor.session.createdAt < new Date(now().getTime() - 600000)
      )
        denied();
      return db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM User WHERE id = ${actor.user.id} FOR UPDATE`;
        const session = await tx.authSession.findUnique({
          where: { id: actor.session.id },
          include: { user: true },
        });
        if (
          !session ||
          session.userId !== actor.user.id ||
          session.revokedAt ||
          session.expiresAt <= now() ||
          session.createdAt < new Date(now().getTime() - 600000) ||
          session.user.accessRevokedAt
        )
          denied();
        const request = await tx.accountDeletionRequest.upsert({
          where: { userId: session.userId },
          create: { userId: session.userId, contactEmailEncrypted: seal(session.user.email, `deletion:${session.userId}`) },
          update: {},
        });
        await tx.user.update({
          where: { id: session.userId },
          data: {
            accessRevokedAt: now(),
            passwordHash: null,
            inviteToken: null,
            resetToken: null,
            resetTokenExp: null,
          },
        });
        await revokeAccountAccess(tx, session.userId, conversationConfig);
        return {
          id: request.id,
          status: request.status,
          message:
            "Solicitud registrada. Acceso retirado; eliminación de datos pendiente de revisión y obligaciones de conservación.",
        };
      });
    },
    async process(userId) {
      return accountTransaction(db, userId, async (tx) => {
        const request = await tx.accountDeletionRequest.findUnique({ where: { userId }, include: { user: true } });
        if (!request || request.status === "completed") return request;
        if (!request.user.accessRevokedAt) throw new Error("account_access_not_revoked");
        const pendingActions = [];
        const inventory = await deletionInventory(tx, userId);
        const reviews = await tx.accountDeletionReview.findMany({ where: { requestId: request.id, action: "review", inventoryHash: inventory.hash }, orderBy: { createdAt: "desc" }, take: 1 });
        let decision;
        if (reviews[0]) { try { decision = validateDeletionDecision(reviews[0].decision, inventory); } catch {} }
        if (inventory.cases.length && !decision) pendingActions.push("service_retention_review");
        if (inventory.remotes.length && !decision) pendingActions.push("remote_data_review");
        if (await tx.socialIdentity.count({ where: { userId, provider: "apple", appleRevokedAt: null } })) pendingActions.push("apple_revocation");
        if (await tx.appOperation.count({ where: { userId, kind: "revocation", status: { not: "admitted" } } })) pendingActions.push("app_access_revocation");
        if (pendingActions.length) return tx.accountDeletionRequest.update({
          where: { id: request.id }, data: { result: { pendingActions }, status: "pending_review" },
        });
        const identities = await tx.socialIdentity.findMany({ where: { userId } });
        const sessions = await tx.authSession.findMany({ where: { userId }, select: { id: true } });
        await tx.socialAuthAttempt.deleteMany({ where: { OR: [
          { linkUserId: userId }, { authSessionId: { in: sessions.map(s => s.id) } },
          ...identities.map(i => ({ provider: i.provider, claims: { path: "$.subject", equals: i.subject } })),
        ] } });
        await tx.pushDelivery.deleteMany({ where: { OR: [{ device: { userId } }, { notification: { userId } }] } });
        await tx.pushDevice.deleteMany({ where: { userId } });
        await tx.notificacion.deleteMany({ where: { userId } });
        await tx.authSession.deleteMany({ where: { userId } });
        await tx.appDeviceSession.deleteMany({ where: { userId } });
        await tx.socialIdentity.deleteMany({ where: { userId } });
        await tx.appOperation.deleteMany({ where: { userId } });
        await tx.appConversationAccess.deleteMany({ where: { userId } });
        await tx.appConversation.deleteMany({ where: { userId } });
        await tx.user.update({ where: { id: userId }, data: {
          accountStatus: "deleted", email: `deleted-${userId}@deleted.invalid`, nombre: "Cuenta eliminada", apellidos: "",
          passwordHash: null, telefono: null, tipoDocumento: null, numDocumento: null,
          zohoContactId: null, stripeCustomerId: null, emailVerified: false, accountVerifiedAt: null, accountVerificationMethod: null,
          inviteToken: null, resetToken: null, resetTokenExp: null,
        } });
        const retainedCategories = [
          ...(decision?.cases || []).map(c => ({ category: c.category, basis: c.basis, criterion: c.criterion })),
          ...(decision?.remotes || []).filter(r => r.outcome === "retained").map(r => ({ category: r.category, basis: r.basis, criterion: r.criterion })),
          ...(decision?.profile ? [{ category: decision.profile.category, basis: decision.profile.basis, criterion: decision.profile.criterion }] : []),
        ];
        const retained = decision?.profile && Object.fromEntries(decision.profile.fields.map(field => [field, request.user[field]]));
        return tx.accountDeletionRequest.update({ where: { id: request.id }, data: {
          status: "completed", completedAt: now(), notificationStatus: "pending",
          retainedDataEncrypted: retained ? seal(JSON.stringify(retained), `retention:${request.id}`) : null,
          result: { pendingActions: [], retainedCategories, reviewId: reviews[0]?.id || null, removedCategories: ["account_profile", "credentials", "sessions", "social_identities", "push_registrations", "inbox", "local_conversation_data"] },
        } });
      });
    },
    async sendCompletions({userId} = {}) {
      await db.accountDeletionRequest.updateMany({where:{notificationStatus:"sending",notificationAttempts:{gte:5},notificationLockedUntil:{lte:now()}},data:{notificationStatus:"failed",notificationClaimId:null,notificationLockedUntil:null}});
      const rows = await db.accountDeletionRequest.findMany({ where: {
        ...(userId?{userId}:{}),
        status: "completed", contactEmailEncrypted: { not: null }, notificationAttempts: { lt: 5 },
        OR: [
          { notificationStatus: "pending", OR: [{ notificationNextAttempt: null }, { notificationNextAttempt: { lte: now() } }] },
          { notificationStatus: "sending", notificationLockedUntil: { lte: now() } },
        ],
      }, take: 20 });
      for (const row of rows) {
        const claimId = randomUUID();
        const claim = await db.accountDeletionRequest.updateMany({ where: {
          id: row.id, notificationStatus: row.notificationStatus, notificationClaimId: row.notificationClaimId,
        }, data: { notificationStatus: "sending", notificationClaimId: claimId, notificationLockedUntil: new Date(now().getTime() + 60000), notificationAttempts: { increment: 1 } } });
        if (claim.count !== 1) continue;
        try {
          const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
          const retained = row.result?.retainedCategories || [];
          const detail = retained.length ? `<p>Se conservan los siguientes datos de servicio, separados del acceso a tu cuenta:</p><ul>${retained.map(r=>`<li>${escape(r.category)}. Motivo: ${escape(r.basis)}. Plazo o criterio: ${escape(r.criterion)}.</li>`).join('')}</ul>` : "<p>Esta solicitud no mantiene datos de servicio bajo una decisión de conservación.</p>";
          await sendCompletion(open(row.contactEmailEncrypted, `deletion:${row.userId}`), "Resultado de eliminación de tu cuenta Gestadia", `<p>Hemos eliminado tu cuenta Gestadia y los datos asociados que ya no eran necesarios.</p>${detail}<p>Para consultas: info@gestadia.com.</p>`, `<deletion-${row.id}@gestadia.com>`);
          await db.accountDeletionRequest.updateMany({ where: { id: row.id, notificationClaimId: claimId }, data: { notificationStatus: "accepted", contactEmailEncrypted: null, notificationClaimId: null, notificationLockedUntil: null, notificationNextAttempt: null } });
        } catch {
          await db.accountDeletionRequest.updateMany({ where: { id: row.id, notificationClaimId: claimId }, data: { notificationStatus: row.notificationAttempts >= 4 ? "failed" : "pending", notificationClaimId: null, notificationLockedUntil: null, notificationNextAttempt: new Date(now().getTime() + 60000) } });
        }
      }
    },
    async runPending({userId} = {}) {
      const rows = await db.accountDeletionRequest.findMany({where:{status:"pending_review",...(userId?{userId}:{})},select:{id:true,userId:true},orderBy:{id:"asc"},take:25,...(!userId&&pendingCursor?{cursor:{id:pendingCursor},skip:1}:{})});
      pendingCursor = rows.length === 25 ? rows.at(-1).id : undefined;
      // Revisar también solicitudes posteriores: una revisión pendiente no bloquea la cola.
      for (const row of rows) { try { await this.process(row.userId); } catch { console.error("[baja] ejecución pendiente"); } }
      await this.sendCompletions({userId});
    },
  };
}
export const accountDeletion = createAccountDeletion({ db: defaultDb });
export async function processAppleRevocations({ db = defaultDb, open = openCredential, revoke = revokeApple, userId } = {}) {
  const rows = await db.socialIdentity.findMany({
    where: {
      provider: "apple",
      ...(userId ? {userId} : {}),
      appleRefreshEncrypted: { not: null },
      appleRevokedAt: null,
      user: {
        accessRevokedAt: { not: null },
        deletionRequest: { isNot: null },
      },
    },
    take: 20,
  });
  for (const row of rows) {
    try {
      await revoke(
        open(row.appleRefreshEncrypted, `apple:${row.subject}`),
        row.appleAudience,
      );
      await db.socialIdentity.update({
        where: { id: row.id },
        data: { appleRevokedAt: new Date(), appleRefreshEncrypted: null },
      });
    } catch {
      console.error("[apple] revocación pendiente");
    }
  }
}
