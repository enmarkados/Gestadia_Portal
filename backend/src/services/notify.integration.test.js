import { test, mock, after } from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { createPushService } from "./push.js";
const url = new URL(process.env.DATABASE_URL || "http://invalid");
if (url.hostname !== "127.0.0.1" || url.pathname !== "/gestadia_app_test") throw new Error("Sólo DB local efímera");
const db = new PrismaClient();
after(() => db.$disconnect());
const mails = [];
const pushService = createPushService({ db, enabled: true, environment: "development", seal: x => x, open: x => x, send: async () => ({ accepted: true }) });
mock.module("../config.js", { namedExports: { config: { baseUrl: "https://portal.example.test", smtp: { enabled: true, host: "smtp.example.test", port: 465, user: "fixture", pass: "fixture", from: "fixture@example.test" } } } });
// Únicamente la salida SMTP se sustituye; productor, transacción y filas son reales.
mock.module("nodemailer", { defaultExport: { createTransport: () => ({ sendMail: async data => { mails.push(data); return { messageId: "fixture" }; } }), getTestMessageUrl: () => false } });
mock.module("./push/runtime.js", { namedExports: { pushService } });
const { notifyUser } = await import("./notify.js");
test("productor Portal conserva email y bandeja y genera entrega durable por dispositivo", async (t) => {
  const id = crypto.randomUUID();
  const user = await db.user.create({ data: { email: `${id}@example.test`, nombre: "Prueba", apellidos: "Local" } });
  t.after(async () => {
    await db.pushDelivery.deleteMany({ where: { device: { userId: user.id } } });
    await db.pushDevice.deleteMany({ where: { userId: user.id } });
    await db.notificacion.deleteMany({ where: { userId: user.id } });
    await db.authSession.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });
  });
  const session = await db.authSession.create({ data: { id, userId: user.id, platform: "ios", expiresAt: new Date(Date.now() + 600000) } });
  await pushService.register({ installationId: id, transport: "apns", token: id.replaceAll("-", "").repeat(2) }, { user, session });
  await notifyUser(user, { titulo: "Expediente actualizado", cuerpo: "Información de prueba" });
  const notice = await db.notificacion.findFirst({ where: { userId: user.id } });
  assert.equal(notice.titulo, "Expediente actualizado");
  assert.equal(await db.pushDelivery.count({ where: { notificationId: notice.id, status: "pending" } }), 1);
  assert.equal(mails[0].to, user.email);
  assert.equal(mails[0].subject, "Expediente actualizado");
  assert.match(mails[0].html, /https:\/\/portal.example.test\/portal\/mis-servicios/);
  const failing = createPushService({ db: { $transaction: fn => db.$transaction(async tx => { await fn(tx); throw new Error("fixture_commit_failure"); }) }, enabled: true });
  await assert.rejects(failing.notify({ userId: user.id, titulo: "Rollback", cuerpo: "Prueba" }), /fixture_commit_failure/);
  assert.equal(await db.notificacion.count({ where: { userId: user.id } }), 1);
  assert.equal(await db.pushDelivery.count({ where: { notificationId: notice.id } }), 1);
});
