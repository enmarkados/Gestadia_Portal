import { randomUUID } from "node:crypto";
import { digest } from "./mobile-crypto.js";
const denied = () => {
  throw Object.assign(new Error("Sesión móvil o dispositivo no válido"), {
    status: 403,
  });
};
export function createPushService({
  db,
  enabled,
  environment,
  seal,
  open,
  send,
  now = () => new Date(),
}) {
  async function validSession(tx, actor) {
    if (!enabled || !actor?.session) denied();
    const s = await tx.authSession.findUnique({
      where: { id: actor.session.id },
      include: { user: true },
    });
    if (
      !s ||
      s.userId !== actor.user.id ||
      s.revokedAt ||
      s.expiresAt <= now() ||
      s.user.accessRevokedAt
    )
      denied();
    return s;
  }
  const due = () => ({
    OR: [
      { status: "pending", nextAttemptAt: { lte: now() } },
      { status: "sending", lockedUntil: { lte: now() } },
    ],
  });
  return {
    async register(input, actor) {
      if (
        !/^[a-zA-Z0-9-]{20,100}$/.test(input.installationId || "") ||
        typeof input.token !== "string" ||
        input.token.length < 32 ||
        input.token.length > 4096
      )
        denied();
      return db.$transaction(async (tx) => {
        const session = await validSession(tx, actor);
        const transport = session.platform === "ios" ? "apns" : "fcm";
        if (
          input.transport !== transport ||
          (transport === "apns" && !/^[a-fA-F0-9]{64,200}$/.test(input.token))
        )
          denied();
        const tokenHash = digest(`${transport}:${input.token}`);
        const existing = await tx.pushDevice.findUnique({
          where: { installationId: input.installationId },
        });
        if (
          existing?.active &&
          (existing.userId !== actor.user.id ||
            existing.sessionId !== session.id)
        ) {
          const oldSession = await tx.authSession.findUnique({
            where: { id: existing.sessionId },
          });
          if (
            oldSession &&
            !oldSession.revokedAt &&
            oldSession.expiresAt > now()
          )
            denied();
        }
        const sameToken = await tx.pushDevice.findUnique({
          where: { tokenHash },
        });
        if (sameToken && sameToken.installationId !== input.installationId)
          denied();
        const data = {
          userId: actor.user.id,
          sessionId: session.id,
          transport,
          environment: transport === "apns" ? environment : "production",
          tokenHash,
          tokenEncrypted: seal(input.token, `push:${input.installationId}`),
          active: true,
        };
        return tx.pushDevice.upsert({
          where: { installationId: input.installationId },
          create: { installationId: input.installationId, ...data },
          update: data,
        });
      });
    },
    async revoke(installationId, actor) {
      if (!actor?.session) denied();
      await db.pushDevice.updateMany({
        where: {
          installationId,
          userId: actor.user.id,
          sessionId: actor.session.id,
        },
        data: { active: false },
      });
    },
    async notify(data) {
      return db.$transaction(async (tx) => {
        const notification = await tx.notificacion.create({ data });
        if (enabled) {
          const devices = await tx.pushDevice.findMany({
            where: {
              userId: data.userId,
              active: true,
              user: { accessRevokedAt: null },
              session: { revokedAt: null, expiresAt: { gt: now() } },
            },
          });
          if (devices.length)
            await tx.pushDelivery.createMany({
              data: devices.map((d) => ({
                notificationId: notification.id,
                deviceId: d.id,
              })),
            });
        }
        return notification;
      });
    },
    async dispatch() {
      if (!enabled) return;
      const rows = await db.pushDelivery.findMany({
        where: due(),
        take: 25,
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });
      for (const candidate of rows) {
        const claimId = randomUUID();
        const claimed = await db.pushDelivery.updateMany({
          where: { id: candidate.id, ...due() },
          data: {
            status: "sending",
            claimId,
            lockedUntil: new Date(now().getTime() + 60000),
            attempts: { increment: 1 },
          },
        });
        if (claimed.count !== 1) continue;
        const row = await db.pushDelivery.findUnique({
          where: { id: candidate.id },
          include: {
            notification: true,
            device: { include: { session: true, user: true } },
          },
        });
        const d = row.device;
        const valid =
          d.active &&
          !d.user.accessRevokedAt &&
          !d.session.revokedAt &&
          d.session.expiresAt > now() &&
          row.notification.userId === d.userId;
        if (!valid) {
          await db.pushDelivery.updateMany({
            where: { id: row.id, claimId },
            data: { status: "cancelled", lockedUntil: null },
          });
          continue;
        }
        let result;
        try {
          result = await send({
            transport: d.transport,
            environment: d.environment,
            token: open(d.tokenEncrypted, `push:${d.installationId}`),
            payload: { notificationId: row.notificationId },
          });
        } catch {
          result = { accepted: false, reason: "provider_unavailable" };
        }
        if (result.invalidToken)
          await db.pushDevice.updateMany({
            where: { id: d.id, tokenHash: d.tokenHash },
            data: { active: false },
          });
        const terminal =
          result.invalidToken || result.permanent || row.attempts >= 5;
        await db.pushDelivery.updateMany({
          where: { id: row.id, claimId },
          data: {
            status: result.accepted
              ? "accepted"
              : terminal
                ? "failed"
                : "pending",
            acceptedAt: result.accepted ? now() : null,
            lastError: result.accepted
              ? null
              : String(result.reason || "provider_unavailable").slice(0, 100),
            lockedUntil: null,
            claimId: null,
            nextAttemptAt: new Date(
              now().getTime() + Math.min(3600000, 30000 * 2 ** row.attempts),
            ),
          },
        });
      }
    },
  };
}
