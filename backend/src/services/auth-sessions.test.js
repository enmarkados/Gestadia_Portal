import { test } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
let createSessionService;
try {
  ({ createSessionService } = await import("./auth-sessions.js"));
} catch {}
function fixture() {
  const sessions = new Map();
  const devices = [{ userId: "u1", sessionId: null, active: true }];
  const db = {
    authSession: {
      create: async ({ data }) => {
        sessions.set(data.id, data);
        devices[0].sessionId = data.id;
        return data;
      },
      findUnique: async ({ where }) => sessions.get(where.id),
      updateMany: async ({ where, data }) => {
        let count = 0;
        for (const s of sessions.values())
          if ((!where.id || s.id === where.id) && s.userId === where.userId) {
            Object.assign(s, data);
            count++;
          }
        return { count };
      },
    },
    pushDevice: {
      updateMany: async ({ where, data }) => {
        for (const d of devices)
          if (
            d.userId === where.userId &&
            (!where.sessionId || d.sessionId === where.sessionId)
          )
            Object.assign(d, data);
        return { count: 1 };
      },
    },
    $transaction: async (fn) => fn(db),
  };
  return { db, sessions, devices };
}
test("una sesión móvil lleva jti y queda revocable sin alterar JWT legacy", async () => {
  assert.equal(
    typeof createSessionService,
    "function",
    "Falta el servicio de sesiones",
  );
  const f = fixture();
  const service = createSessionService({
    db: f.db,
    secret: "test-secret",
    enabled: true,
  });
  const { token } = await service.issue(
    { id: "u1", email: "user@example.com" },
    "ios",
  );
  const p = jwt.verify(token, "test-secret");
  assert.equal(p.sub, "u1");
  assert.ok(p.jti);
  assert.ok(await service.verify(p));
  await service.revoke("u1", p.jti);
  assert.equal(await service.verify(p), null);
  assert.equal(f.devices[0].active, false);
});
test("una revocación ajena no retira otra sesión y el logout es idempotente", async () => {
  assert.equal(
    typeof createSessionService,
    "function",
    "Falta el servicio de sesiones",
  );
  const f = fixture();
  const s = createSessionService({
    db: f.db,
    secret: "test-secret",
    enabled: true,
  });
  const { token } = await s.issue(
    { id: "u1", email: "user@example.com" },
    "android",
  );
  const p = jwt.verify(token, "test-secret");
  await s.revoke("other", p.jti);
  assert.ok(await s.verify(p));
  await s.revoke("u1", p.jti);
  await s.revoke("u1", p.jti);
  assert.equal(await s.verify(p), null);
});
test("no emite sesiones con capacidades móviles desactivadas o plataforma falsa", async () => {
  assert.equal(
    typeof createSessionService,
    "function",
    "Falta el servicio de sesiones",
  );
  const f = fixture();
  await assert.rejects(
    createSessionService({
      db: f.db,
      secret: "test-secret",
      enabled: false,
    }).issue({ id: "u1" }, "ios"),
  );
  await assert.rejects(
    createSessionService({
      db: f.db,
      secret: "test-secret",
      enabled: true,
    }).issue({ id: "u1" }, "web"),
  );
});
test("la sesión vencida o sin correlación de propietario no autoriza", async () => {
  assert.equal(
    typeof createSessionService,
    "function",
    "Falta el servicio de sesiones",
  );
  const f = fixture();
  let now = new Date("2026-10-08T10:00:00Z");
  const s = createSessionService({
    db: f.db,
    secret: "test-secret",
    enabled: true,
    now: () => now,
  });
  const { token } = await s.issue({ id: "u1", email: "u@e.test" }, "ios");
  const p = jwt.decode(token);
  assert.equal(await s.verify({ ...p, sub: "other" }), null);
  now = new Date("2026-12-08T10:00:00Z");
  assert.equal(await s.verify(p), null);
  assert.equal(await s.verify({ sub: "u1" }), null);
});
