import { test, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { AppIdentity, accountProof, recordAccountProof } from "./identity.js";
const url = new URL(process.env.DATABASE_URL || "http://invalid");
if (url.hostname !== "127.0.0.1" || url.pathname !== "/gestadia_app_test")
  throw new Error("Sólo BBDD efímera local de pruebas");
const db = new PrismaClient();
after(() => db.$disconnect());
async function user(t, extra = {}) {
  const u = await db.user.create({
    data: {
      email: `${crypto.randomUUID()}@example.test`,
      nombre: "Prueba",
      apellidos: "Local",
      passwordHash: await bcrypt.hash("test-only-password", 4),
      emailVerified: true,
      accountVerifiedAt: new Date("2026-10-05T10:00:00Z"),
      accountVerificationMethod: "email",
      ...extra,
    },
  });
  t.after(async () => {
    await db.appDeviceSession.deleteMany({ where: { userId: u.id } });
    await db.pushDevice.deleteMany({ where: { userId: u.id } });
    await db.appOperation.deleteMany({ where: { userId: u.id } });
    await db.authSession.deleteMany({ where: { userId: u.id } });
    await db.user.delete({ where: { id: u.id } });
  });
  return u;
}
test("emailVerified histórico no se atestigua sin evidencia fechada", () => {
  assert.throws(
    () => accountProof({ emailVerified: true, accountStatus: "active" }),
    { code: "identity_verification_required" },
  );
  assert.throws(
    () =>
      accountProof({
        emailVerified: true,
        accountStatus: "disabled",
        accountVerifiedAt: new Date(),
        accountVerificationMethod: "email",
      }),
    { code: "account_disabled" },
  );
});
test("login APP guarda sólo huella y logout revoca un dispositivo", async (t) => {
  const u = await user(t);
  const id = new AppIdentity(db);
  const a = await id.login(u.email, "test-only-password", "iPhone");
  const b = await id.login(u.email, "test-only-password", "Otro");
  assert.match(a.token, /^ga_/);
  const row = await db.appDeviceSession.findUnique({
    where: { id: a.session_id },
  });
  assert.notEqual(row.tokenHash, a.token);
  assert.equal((await id.authenticate(a.token)).user.id, u.id);
  await id.logout(a.token);
  await assert.rejects(id.authenticate(a.token), { code: "session_expired" });
  assert.equal((await id.authenticate(b.token)).user.id, u.id);
  await db.user.update({
    where: { id: u.id },
    data: { accountStatus: "disabled" },
  });
  await assert.rejects(id.authenticate(b.token), { code: "account_disabled" });
});
test("consumo de prueba registra fecha/método y revoca todas las sesiones anteriores", async (t) => {
  const u = await user(t);
  const id = new AppIdentity(db);
  const a = await id.login(u.email, "test-only-password", "iPhone");
  await recordAccountProof(
    db,
    u.id,
    "invitation",
    new Date("2026-10-05T11:00:00Z"),
  );
  const found = await db.user.findUnique({ where: { id: u.id } });
  assert.equal(accountProof(found).verified_at, "2026-10-05T11:00:00.000Z");
  assert.equal(found.accountVerificationMethod, "invitation");
  await assert.rejects(id.authenticate(a.token), { code: "session_expired" });
});
test("invitación consumida una sola vez incluso con dos peticiones concurrentes", async (t) => {
  const { consumeAccountProof } = await import("./identity.js");
  const invite = crypto.randomUUID();
  const u = await user(t, { inviteToken: invite });
  const outcomes = await Promise.allSettled([
    consumeAccountProof(db, u.id, invite, false, "hash-one"),
    consumeAccountProof(db, u.id, invite, false, "hash-two"),
  ]);
  assert.equal(outcomes.filter((x) => x.status === "fulfilled").length, 1);
  assert.equal(
    outcomes.find((x) => x.status === "rejected").reason.code,
    "verification_link_invalid",
  );
  const updated = await db.user.findUnique({ where: { id: u.id } });
  assert.equal(updated.inviteToken, null);
  assert.equal(updated.accountVerificationMethod, "invitation");
});

test("sesión móvil revocable abre conversaciones y su logout impide reutilizar el token", async (t) => {
  const { createSessionService } = await import("../services/auth-sessions.js");
  const u = await user(t);
  const secret = "fixture-mobile-conversations-only";
  const sessions = createSessionService({ db, secret, enabled: true });
  const { token } = await sessions.issue(u, "ios");
  const identity = new AppIdentity(db, { sessionSecret: secret });
  assert.equal((await identity.authenticate(token)).user.id, u.id);
  assert.equal((await identity.list(token)).length, 1);
  await identity.logout(token);
  await assert.rejects(identity.authenticate(token), { code: "session_expired" });
});

test("un JWT del Portal sin sesión móvil no autoriza conversaciones", async (t) => {
  const jwt = (await import("jsonwebtoken")).default;
  const u = await user(t);
  const secret = "fixture-mobile-conversations-only";
  const identity = new AppIdentity(db, { sessionSecret: secret });
  await assert.rejects(identity.authenticate(jwt.sign({ sub: u.id }, secret)), { code: "session_expired" });
});

test("retirada de acceso bloquea también una sesión APP anterior", async (t) => {
  const u = await user(t);
  const identity = new AppIdentity(db);
  const { token } = await identity.login(u.email, "test-only-password");
  await db.user.update({ where: { id: u.id }, data: { accessRevokedAt: new Date() } });
  await assert.rejects(identity.authenticate(token), { code: "account_disabled" });
});

test("renovar prueba de cuenta invalida también la sesión móvil anterior", async (t) => {
  const { createSessionService } = await import("../services/auth-sessions.js");
  const u = await user(t);
  const secret = "fixture-shared-revocation";
  const { token } = await createSessionService({ db, secret, enabled: true }).issue(u, "android");
  const identity = new AppIdentity(db, { sessionSecret: secret });
  await recordAccountProof(db, u.id, "email");
  await assert.rejects(identity.authenticate(token), { code: "session_expired" });
});

test("baja conversacional retira la sesión móvil y su registro push", async (t) => {
  const { createSessionService } = await import("../services/auth-sessions.js");
  const { revokeAccount } = await import("./lifecycle.js");
  const u = await user(t);
  const { token } = await createSessionService({ db, secret: "fixture-shared-revocation", enabled: true }).issue(u, "ios");
  const session = await db.authSession.findFirst({ where: { userId: u.id } });
  const device = await db.pushDevice.create({ data: { userId: u.id, sessionId: session.id, installationId: crypto.randomUUID(), transport: "apns", environment: "development", tokenHash: crypto.randomUUID(), tokenEncrypted: "fixture-only" } });
  await revokeAccount(db, u.id, { integrationId: "fixture-shared-revocation" });
  assert.ok((await db.authSession.findUnique({ where: { id: session.id } })).revokedAt);
  assert.equal((await db.pushDevice.findUnique({ where: { id: device.id } })).active, false);
  assert.ok(await db.appOperation.findFirst({ where: { userId: u.id, kind: "revocation" } }));
});
