import { db as defaultDb } from "../db.js";
import { openCredential } from "./mobile-crypto.js";
import { revokeApple } from "./apple-auth.js";
import { revokeAccountAccess } from "../app/lifecycle.js";
import { appConversationConfig } from "../config.js";
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
}) {
  return {
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
          create: { userId: session.userId },
          update: {},
        });
        await tx.user.update({
          where: { id: session.userId },
          data: {
            accessRevokedAt: now(),
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
  };
}
export const accountDeletion = createAccountDeletion({ db: defaultDb });
export async function processAppleRevocations() {
  const rows = await defaultDb.socialIdentity.findMany({
    where: {
      provider: "apple",
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
      await revokeApple(
        openCredential(row.appleRefreshEncrypted, `apple:${row.subject}`),
        row.appleAudience,
      );
      await defaultDb.socialIdentity.update({
        where: { id: row.id },
        data: { appleRevokedAt: new Date(), appleRefreshEncrypted: null },
      });
    } catch {
      console.error("[apple] revocación pendiente");
    }
  }
}
