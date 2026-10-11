import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { config } from "../config.js";
import { mobileConfig } from "../mobile-config.js";
export function createSessionService({
  db,
  secret,
  enabled,
  now = () => new Date(),
}) {
  return {
    async issue(user, platform) {
      if (
        !enabled ||
        !["ios", "android"].includes(platform) ||
        user.accessRevokedAt
      )
        throw Object.assign(new Error("Acceso móvil no disponible"), {
          status: 403,
        });
      const createdAt = now();
      const expiresAt = new Date(createdAt.getTime() + 30 * 86400000);
      const id = randomUUID();
      await db.authSession.create({
        data: { id, userId: user.id, platform, createdAt, expiresAt },
      });
      return {
        token: jwt.sign(
          {
            sub: user.id,
            email: user.email,
            jti: id,
            iat: Math.floor(createdAt.getTime() / 1000),
            exp: Math.floor(expiresAt.getTime() / 1000),
          },
          secret,
          { algorithm: "HS256" },
        ),
      };
    },
    async verify(payload) {
      if (!payload.jti) return null;
      const row = await db.authSession.findUnique({
        where: { id: payload.jti },
      });
      return row &&
        row.userId === payload.sub &&
        !row.revokedAt &&
        row.expiresAt > now()
        ? row
        : null;
    },
    async revoke(userId, id) {
      await db.$transaction(async (tx) => {
        await tx.authSession.updateMany({
          where: { id, userId },
          data: { revokedAt: now() },
        });
        await tx.pushDevice.updateMany({
          where: { userId, sessionId: id },
          data: { active: false },
        });
      });
    },
    async revokeAll(userId) {
      await db.$transaction(async (tx) => {
        await tx.authSession.updateMany({
          where: { userId },
          data: { revokedAt: now() },
        });
        await tx.pushDevice.updateMany({
          where: { userId },
          data: { active: false },
        });
      });
    },
  };
}
export const mobileSessions = createSessionService({
  db,
  secret: config.jwtSecret,
  enabled: mobileConfig.enabled,
});
