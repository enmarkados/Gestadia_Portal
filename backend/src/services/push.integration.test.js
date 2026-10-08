import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
const url = process.env.GESTADIA_MOBILE_TEST_DATABASE_URL;
const enabled =
  !!url &&
  new URL(url).hostname === "127.0.0.1" &&
  new URL(url).pathname === "/gestadia_mobile_test";
test(
  "Push: sesión, propietario, rotación, doble worker y revocación",
  { skip: !enabled },
  async () => {
    const { createPushService } = await import("./push.js");
    const db = new PrismaClient({ datasourceUrl: url });
    const id = randomUUID();
    let calls = [];
    const svc = createPushService({
      db,
      enabled: true,
      environment: "development",
      seal: (t) => "sealed:" + t,
      open: (t) => t.slice(7),
      send: async (d) => {
        calls.push(d);
        return { accepted: true };
      },
    });
    try {
      const user = await db.user.create({
        data: { email: `${id}@example.com`, nombre: "Fixture", apellidos: "" },
      });
      const session = await db.authSession.create({
        data: {
          id,
          userId: user.id,
          platform: "ios",
          expiresAt: new Date(Date.now() + 100000),
        },
      });
      const actor = { user, session };
      await assert.rejects(
        svc.register(
          { installationId: id, token: "a".repeat(64), transport: "apns" },
          { user },
        ),
      );
      await assert.rejects(
        svc.register(
          { installationId: id, token: "a".repeat(64), transport: "fcm" },
          actor,
        ),
      );
      const device = await svc.register(
        {
          installationId: id,
          token: "a".repeat(64),
          transport: "apns",
          userId: "other",
          environment: "production",
        },
        actor,
      );
      assert.equal(device.userId, user.id);
      assert.equal(device.environment, "development");
      const n = await svc.notify({
        userId: user.id,
        titulo: "Información privada",
        cuerpo: "DOCUMENTO",
        expedienteId: null,
      });
      assert.equal(
        await db.pushDelivery.count({ where: { notificationId: n.id } }),
        1,
      );
      await Promise.all([svc.dispatch(), svc.dispatch()]);
      assert.equal(calls.length, 1);
      assert.deepEqual(calls[0].payload, { notificationId: n.id });
      assert.equal(JSON.stringify(calls[0]).includes("DOCUMENTO"), false);
      await svc.register(
        { installationId: id, token: "b".repeat(64), transport: "apns" },
        actor,
      );
      assert.equal(
        await db.pushDevice.count({ where: { installationId: id } }),
        1,
      );
      await svc.notify({ userId: user.id, titulo: "X", cuerpo: "Y" });
      await db.authSession.update({
        where: { id },
        data: { revokedAt: new Date() },
      });
      await svc.dispatch();
      assert.equal(calls.length, 1);
    } finally {
      await db.pushDelivery.deleteMany({
        where: { device: { installationId: id } },
      });
      await db.pushDevice.deleteMany({ where: { installationId: id } });
      await db.notificacion.deleteMany({
        where: { user: { email: `${id}@example.com` } },
      });
      await db.authSession.deleteMany({ where: { id } });
      await db.user.deleteMany({ where: { email: `${id}@example.com` } });
      await db.$disconnect();
    }
  },
);

test(
  "Push: cinco intentos agotados no se reenvían y el envío lento conserva su lease",
  { skip: !enabled },
  async () => {
    const { createPushService } = await import("./push.js");
    const db = new PrismaClient({ datasourceUrl: url });
    const id = randomUUID();
    let calls = 0,
      started,
      release,
      result = { accepted: true };
    const sending = new Promise((r) => (started = r));
    const svc = createPushService({
      db,
      enabled: true,
      environment: "development",
      seal: (t) => t,
      open: (t) => t,
      leaseMs: 240,
      renewEveryMs: 60,
      send: async () => {
        calls++;
        started();
        await new Promise((r) => (release = r));
        return result;
      },
    });
    try {
      const user = await db.user.create({
        data: { email: `${id}@example.com`, nombre: "Lease", apellidos: "" },
      });
      const session = await db.authSession.create({
        data: {
          id,
          userId: user.id,
          platform: "android",
          expiresAt: new Date(Date.now() + 60000),
        },
      });
      const device = await svc.register(
        { installationId: id, token: "x".repeat(64), transport: "fcm" },
        { user, session },
      );
      const exhausted = await svc.notify({
        userId: user.id,
        titulo: "X",
        cuerpo: "Y",
      });
      await db.pushDelivery.updateMany({
        where: { notificationId: exhausted.id },
        data: {
          status: "sending",
          attempts: 5,
          lockedUntil: new Date(Date.now() - 1000),
        },
      });
      const empty = svc.dispatch();
      await Promise.race([empty, sending]);
      assert.equal(calls, 0, "No sexto envío");
      await empty;
      assert.equal(
        (
          await db.pushDelivery.findFirst({
            where: { notificationId: exhausted.id },
          })
        ).status,
        "failed",
      );
      const slow = await svc.notify({
        userId: user.id,
        titulo: "X",
        cuerpo: "Y",
      });
      const first = svc.dispatch();
      await sending;
      await new Promise((r) => setTimeout(r, 420));
      const second = svc.dispatch();
      await Promise.race([second, new Promise((r) => setTimeout(r, 50))]);
      assert.equal(calls, 1, "El segundo worker no roba un envío aún activo");
      release();
      await Promise.all([first, second]);
      const row = await db.pushDelivery.findFirst({
        where: { notificationId: slow.id },
      });
      assert.equal(row.status, "accepted");
      assert.equal(row.attempts, 1);
      const lostStarted = new Promise((r) => (started = r));
      result = { accepted: false, invalidToken: true };
      const lostNotification = await svc.notify({
        userId: user.id,
        titulo: "X",
        cuerpo: "Y",
      });
      const late = svc.dispatch();
      await lostStarted;
      await db.pushDelivery.updateMany({
        where: { notificationId: lostNotification.id },
        data: { claimId: "another-worker" },
      });
      release();
      await late;
      assert.equal(
        (await db.pushDevice.findUnique({ where: { id: device.id } })).active,
        true,
        "Respuesta sin propiedad no desactiva dispositivo",
      );
      assert.equal(
        (
          await db.pushDelivery.findFirst({
            where: { notificationId: lostNotification.id },
          })
        ).claimId,
        "another-worker",
      );
    } finally {
      release?.();
      await db.pushDelivery.deleteMany({
        where: { device: { installationId: id } },
      });
      await db.pushDevice.deleteMany({ where: { installationId: id } });
      await db.notificacion.deleteMany({
        where: { user: { email: `${id}@example.com` } },
      });
      await db.authSession.deleteMany({ where: { id } });
      await db.user.deleteMany({ where: { email: `${id}@example.com` } });
      await db.$disconnect();
    }
  },
);
