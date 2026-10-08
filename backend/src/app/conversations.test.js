import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AppIdentity } from "./identity.js";
import { AppProblem } from "./problem.js";
import { AppS2SClient } from "./s2s.js";
import { AppConversationService } from "./conversations.js";
import {
  setConversationAccess,
  revokeAccount,
  drainLifecycle,
  deliverLifecycle,
} from "./lifecycle.js";
const url = new URL(process.env.DATABASE_URL || "http://invalid");
if (url.hostname !== "127.0.0.1" || url.pathname !== "/gestadia_app_test")
  throw new Error("Sólo BBDD efímera local de pruebas");
const db = new PrismaClient();
after(() => db.$disconnect());
const config = {
  enabled: true,
  integrationId: "fixture-local",
  generalSupport: true,
  generalCommercial: false,
};
const now = () => new Date().toISOString();
function receipt(conv, turn, kind = "turn") {
  const date = now();
  return {
    schema_version: "1.0",
    operation_id: crypto.randomUUID(),
    operation: kind,
    conversation_id: conv,
    turn_id: turn,
    status: "accepted",
    receipt_revision: "1",
    state_revision: "1",
    accepted_at: date,
    updated_at: date,
    completed_at: null,
    retained_until: new Date(Date.now() + 30 * 86400000).toISOString(),
    result: null,
    error: null,
    retry_after_seconds: 3,
  };
}
class Remote {
  constructor() {
    this.operations = new Map();
    this.sessionCount = 0;
    this.lost = false;
    this.beforeReturn = null;
    this.contexts = [];
    this.closed = false;
    this.metadata = {};
    this.timelineUnavailable = false;
  }
  async call(cap, method, path, subject, dto, opts = {}) {
    if (path.endsWith("/timeline") && this.timelineUnavailable) throw new AppProblem(503, "runtime_unavailable");
    let r = this.operations.get(opts.idempotencyKey);
    if (!r) {
      if (path === "/sessions") {
        this.sessionCount++;
        r = {
          status: 201,
          data: {
            schema_version: "1.0",
            ...this.metadata,
            conversation_id: crypto.randomUUID(),
            lidia_session_id: "PRIVATE_INTERNAL",
            purpose: dto.purpose,
            status: "active",
            effective_agent: {
              id: 119,
              display_name: "LidIA",
              instruction_version: "PRIVATE_VERSION",
            },
            capabilities: ["history", "sondeo"],
            cursor: null,
            state_revision: "1",
          },
        };
      } else if (path.endsWith("/context")) {
        this.contexts.push(structuredClone(dto));
        r = {
          status: 200,
          data: {
            schema_version: "1.0",
            conversation_id: path.split("/")[2],
            operation_id: crypto.randomUUID(),
            context_revision: dto.context_revision,
            current_context_revision: dto.context_revision,
            state_revision: "2",
            persisted: true,
            replayed: false,
            effective_permissions: dto.permissions,
            applied_at: now(),
            enforcement_deadline: new Date(Date.now() + 60000).toISOString(),
            enforcement_status: "propagating",
            correlation_id: dto.correlation_id,
          },
        };
      } else if (path.endsWith("/turns"))
        r = { status: 202, data: receipt(path.split("/")[2], dto.turn_id) };
      else if (path.endsWith("/handoff"))
        r = { status: 202, data: receipt(path.split("/")[2], null, "handoff") };
      else if (path.endsWith("/revocations"))
        r = {
          status: 200,
          data: {
            schema_version: "1.0",
            scope: dto.scope,
            persisted: true,
            revoked_at: now(),
            revocation_version: "1",
            enforcement_deadline: new Date(Date.now() + 60000).toISOString(),
            enforcement_status: "propagating",
          },
        };
      else if (path.endsWith("/timeline") && opts.query?.turn_id) {
        const original = [...this.operations.values()].find(
          (x) => x.data.turn_id === opts.query.turn_id,
        );
        r = {
          status: 200,
          data: {
            schema_version: "1.0",
            conversation_id: path.split("/")[2],
            state_revision: "3",
            receipt: original.data,
          },
        };
      } else if (path.endsWith("/timeline"))
        r = {
          status: 200,
          data: {
            schema_version: "1.0",
            conversation_id: path.split("/")[2],
            ...this.metadata,
            items: [],
            next_cursor: null,
            has_more: false,
            conversation_status: this.closed ? "closed" : "active",
            effective_agent: {
              id: 119,
              display_name: "LidIA",
              instruction_version: "private",
            },
            support: {
              status: "none",
              operator_display_name: null,
              requested_at: null,
              assigned_at: null,
              attended_at: null,
              updated_at: now(),
            },
            turn_statuses: [],
            sondeo: null,
            state_revision: "3",
          },
        };
      else throw new Error(`Ruta inesperada ${path}`);
      if (opts.idempotencyKey) this.operations.set(opts.idempotencyKey, r);
    }
    if (this.beforeReturn) {
      const fn = this.beforeReturn;
      this.beforeReturn = null;
      await fn();
    }
    if (this.lost && !path.endsWith("/context")) {
      this.lost = false;
      throw new Error("lost reply");
    }
    return structuredClone(r);
  }
}
async function fixture(t) {
  const u = await db.user.create({
    data: {
      email: `${crypto.randomUUID()}@example.test`,
      nombre: "Local",
      apellidos: "Test",
      passwordHash: await bcrypt.hash("test-password", 4),
      emailVerified: true,
      accountVerifiedAt: new Date(),
      accountVerificationMethod: "email",
    },
  });
  t.after(async () => {
    for (const model of [
      "appOperation",
      "appConversationAccess",
      "appConversation",
      "appDeviceSession",
      "expediente",
    ])
      await db[model].deleteMany({ where: { userId: u.id } });
    await db.user.delete({ where: { id: u.id } });
  });
  const identity = new AppIdentity(db);
  const a = await identity.login(u.email, "test-password", "iPhone"),
    b = await identity.login(u.email, "test-password", "Otro");
  const remote = new Remote();
  const service = () => new AppConversationService(db, remote, config);
  return { u, a: a.token, b: b.token, remote, service };
}
test("dos nodos/dispositivos conservan la asociación y no exponen ids internos", async (t) => {
  const f = await fixture(t);
  const [a, b] = await Promise.all([
    f.service().start(f.a, { purpose: "sondeo" }, crypto.randomUUID()),
    f.service().start(f.b, { purpose: "sondeo" }, crypto.randomUUID()),
  ]);
  assert.equal(a.conversation.id, b.conversation.id);
  assert.equal(f.remote.sessionCount, 1);
  assert.equal(JSON.stringify(a).includes("PRIVATE"), false);
  assert.equal((await f.service().list(f.b))[0].id, a.conversation.id);
});
test("respuesta perdida conserva claim inicial y un retry explícito recupera sin nueva sesión", async (t) => {
  const f = await fixture(t);
  f.remote.lost = true;
  const a = await f
    .service()
    .start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  assert.equal(a.operation.status, "outcome_unknown");
  const b = await f
    .service()
    .start(f.b, { purpose: "sondeo" }, crypto.randomUUID());
  assert.equal(a.operation.id, b.operation.id);
  assert.equal(f.remote.sessionCount, 1);
  await f.service().retry(f.b, a.operation.id);
  const all = await f.service().list(f.b);
  assert.ok(all[0].ready);
  assert.equal(f.remote.sessionCount, 1);
});
test("turn_id no se repite y un cambio de payload causa conflicto, con recibo retirado tampoco se ejecuta", async (t) => {
  const f = await fixture(t);
  const a = await f
    .service()
    .start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  const dto = {
    turn_id: crypto.randomUUID(),
    kind: "text",
    text: "¿Puedo canjear mi permiso?",
  };
  const x = await f.service().turn(f.a, a.conversation.id, dto),
    y = await f.service().turn(f.b, a.conversation.id, dto);
  assert.equal(x.id, y.id);
  await assert.rejects(
    f.service().turn(f.a, a.conversation.id, { ...dto, text: "Otro texto" }),
    { code: "idempotency_conflict" },
  );
  await db.appOperation.update({
    where: { id: x.id },
    data: { retainedUntil: new Date(0) },
  });
  await assert.rejects(f.service().turn(f.a, a.conversation.id, dto), {
    code: "operation_retired",
  });
});
test("otro sujeto recibe 404 y una revocación durante HTTP bloquea incluso la respuesta recibida", async (t) => {
  const f = await fixture(t),
    g = await fixture(t);
  const a = await f
    .service()
    .start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  await assert.rejects(f.service().timeline(g.a, a.conversation.id), {
    code: "conversation_not_found",
  });
  f.remote.beforeReturn = () =>
    revokeAccount(db, f.u.id, config, "account_disabled");
  await assert.rejects(f.service().timeline(f.a, a.conversation.id), (e) =>
    ["session_expired", "account_disabled"].includes(e.code),
  );
  assert.equal(
    await db.appOperation.count({
      where: { userId: f.u.id, kind: "revocation" },
    }),
    1,
  );
  await drainLifecycle(db, f.remote, config);
  assert.equal(
    await db.appOperation.count({
      where: { userId: f.u.id, kind: "revocation", status: "admitted" },
    }),
    1,
  );
});
test("permiso retirado [] y expiración se propagan sin defaults; revisión grande exacta y aislamiento caso", async (t) => {
  const f = await fixture(t);
  const exp = await db.expediente.create({
    data: {
      userId: f.u.id,
      nPedido: crypto.randomUUID(),
      servicioSlug: "canje",
      titulo: "Caso local",
      importe: 1,
    },
  });
  await setConversationAccess(db, f.u.id, "atencion", exp.id, {
    permissions: ["history", "case_context", "manager_handoff"],
    manager_assignment_ref: "validated-manager",
    commercial_assignment_ref: null,
    validated_at: now(),
    valid_until: new Date(Date.now() + 60000).toISOString(),
    source_ref: "test-authority",
  });
  const a = await f
    .service()
    .start(f.a, { purpose: "atencion", case_ref: exp.id }, crypto.randomUUID());
  await f.service().timeline(f.a, a.conversation.id);
  await db.appConversation.update({
    where: { id: a.conversation.id },
    data: { contextRevision: "9007199254740992" },
  });
  await setConversationAccess(db, f.u.id, "atencion", exp.id, {
    permissions: [],
    manager_assignment_ref: null,
    commercial_assignment_ref: null,
    validated_at: now(),
    valid_until: new Date(Date.now() + 60000).toISOString(),
    source_ref: "withdrawal",
  });
  await assert.rejects(f.service().timeline(f.a, a.conversation.id), {
    code: "capability_denied",
  });
  const conv = await db.appConversation.findUnique({
    where: { id: a.conversation.id },
  });
  assert.equal(conv.contextRevision, "9007199254740993");
  const pending = await db.appOperation.findFirst({
    where: { conversationId: conv.id, kind: "context", status: "prepared" },
    orderBy: { createdAt: "desc" },
  });
  assert.deepEqual(pending.request.permissions, []);
  await drainLifecycle(db, f.remote, config);
  assert.deepEqual(f.remote.contexts.at(-1).permissions, []);
  await assert.rejects(
    f
      .service()
      .start(
        f.a,
        { purpose: "atencion", case_ref: crypto.randomUUID() },
        crypto.randomUUID(),
      ),
    { code: "conversation_not_found" },
  );
});
test("sesión cerrada recupera historial y no admite nuevos efectos", async (t) => {
  const f = await fixture(t);
  const a = await f
    .service()
    .start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  f.remote.closed = true;
  const timeline = await f.service().timeline(f.a, a.conversation.id);
  assert.equal(timeline.conversation_status, "closed");
  await assert.rejects(
    f.service().turn(f.a, a.conversation.id, {
      turn_id: crypto.randomUUID(),
      kind: "text",
      text: "Hola",
    }),
    { code: "conversation_closed" },
  );
});
test("key de inicio reutilizada en otro propósito se rechaza antes de HTTP", async (t) => {
  const f = await fixture(t),
    key = crypto.randomUUID();
  await f.service().start(f.a, { purpose: "sondeo" }, key);
  await assert.rejects(f.service().start(f.a, { purpose: "atencion" }, key), {
    code: "idempotency_conflict",
  });
  assert.equal(f.remote.sessionCount, 1);
});
test("replay de turno ya admitido en cerrada recupera recibo sin efecto nuevo", async (t) => {
  const f = await fixture(t);
  const a = await f
    .service()
    .start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  const dto = {
      turn_id: crypto.randomUUID(),
      kind: "text",
      text: "Consulta inicial",
    },
    first = await f.service().turn(f.a, a.conversation.id, dto);
  f.remote.closed = true;
  await f.service().timeline(f.a, a.conversation.id);
  const replay = await f.service().turn(f.b, a.conversation.id, dto);
  assert.equal(replay.id, first.id);
});
test("grant caducado y cambio de dueño generan retiro durable; nunca permiten historia privada", async (t) => {
  const f = await fixture(t),
    g = await fixture(t);
  const exp = await db.expediente.create({
    data: {
      userId: f.u.id,
      nPedido: crypto.randomUUID(),
      servicioSlug: "canje",
      titulo: "Privado",
      importe: 1,
    },
  });
  await setConversationAccess(db, f.u.id, "atencion", exp.id, {
    permissions: ["history", "case_context"],
    manager_assignment_ref: null,
    commercial_assignment_ref: null,
    validated_at: now(),
    valid_until: new Date(Date.now() + 60000).toISOString(),
    source_ref: "proof",
  });
  const a = await f
    .service()
    .start(f.a, { purpose: "atencion", case_ref: exp.id }, crypto.randomUUID());
  await f.service().timeline(f.a, a.conversation.id);
  await db.appConversationAccess.updateMany({
    where: { userId: f.u.id },
    data: { validUntil: new Date(0) },
  });
  await assert.rejects(f.service().timeline(f.a, a.conversation.id), {
    code: "capability_denied",
  });
  await drainLifecycle(db, f.remote, config);
  assert.deepEqual(f.remote.contexts.at(-1).permissions, []);
  await db.expediente.update({
    where: { id: exp.id },
    data: { userId: g.u.id },
  });
  await assert.rejects(f.service().timeline(f.a, a.conversation.id), {
    code: "conversation_not_found",
  });
});

test("retirar case_context conservando history oculta historial y recibos de caso", async (t) => {
  const f = await fixture(t);
  const exp = await db.expediente.create({
    data: {
      userId: f.u.id,
      nPedido: crypto.randomUUID(),
      servicioSlug: "canje",
      titulo: "Privado",
      importe: 1,
    },
  });
  const grant = {
    permissions: ["history", "case_context", "support_handoff"],
    manager_assignment_ref: null,
    commercial_assignment_ref: null,
    validated_at: now(),
    valid_until: new Date(Date.now() + 60000).toISOString(),
    source_ref: "proof",
  };
  await setConversationAccess(db, f.u.id, "atencion", exp.id, grant);
  const a = await f
    .service()
    .start(f.a, { purpose: "atencion", case_ref: exp.id }, crypto.randomUUID());
  const op = await f
    .service()
    .handoff(
      f.a,
      a.conversation.id,
      { target_kind: "support", reason: "Solicitar ayuda" },
      crypto.randomUUID(),
    );
  f.remote.beforeReturn = () =>
    setConversationAccess(db, f.u.id, "atencion", exp.id, {
      ...grant,
      permissions: ["history"],
      validated_at: now(),
    });
  await assert.rejects(f.service().timeline(f.a, a.conversation.id), {
    code: "capability_denied",
  });
  await assert.rejects(f.service().operation(f.a, op.id), {
    code: "capability_denied",
  });
  await assert.rejects(
    f
      .service()
      .start(
        f.a,
        { purpose: "atencion", case_ref: exp.id },
        crypto.randomUUID(),
      ),
    { code: "capability_denied" },
  );
});
test("cambio de revisión durante timeline descarta la respuesta anterior incluso con permisos conservados", async (t) => {
  const f = await fixture(t);
  const a = await f
    .service()
    .start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  f.remote.beforeReturn = () =>
    setConversationAccess(db, f.u.id, "sondeo", null, {
      permissions: ["history", "sondeo"],
      manager_assignment_ref: null,
      commercial_assignment_ref: null,
      validated_at: now(),
      valid_until: new Date(Date.now() + 60000).toISOString(),
      source_ref: "changed-proof",
    });
  await assert.rejects(f.service().timeline(f.a, a.conversation.id), {
    code: "context_unavailable",
  });
});
test("retry explícito de turno admitido en cerrada sólo recupera el recibo", async (t) => {
  const f = await fixture(t);
  const a = await f
    .service()
    .start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  const op = await f.service().turn(f.a, a.conversation.id, {
    turn_id: crypto.randomUUID(),
    kind: "text",
    text: "Consulta",
  });
  f.remote.closed = true;
  await f.service().timeline(f.a, a.conversation.id);
  assert.equal((await f.service().retry(f.a, op.id)).id, op.id);
});
test("consulta por turn_id reconcilia resultado incierto y usa la retención del recibo original", async (t) => {
  const f = await fixture(t);
  const a = await f
    .service()
    .start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  const dto = { turn_id: crypto.randomUUID(), kind: "text", text: "Consulta" };
  f.remote.lost = true;
  const op = await f.service().turn(f.a, a.conversation.id, dto);
  assert.equal(op.status, "outcome_unknown");
  const lookup = await f
    .service()
    .timeline(f.a, a.conversation.id, { turn_id: dto.turn_id });
  const reconciled = await db.appOperation.findUnique({ where: { id: op.id } });
  assert.equal(reconciled.status, "admitted");
  assert.equal(
    reconciled.retainedUntil.toISOString(),
    lookup.receipt.retained_until,
  );
  assert.equal(reconciled.response.turn_id, dto.turn_id);
});

test("key de inicio mantiene conflicto y retirada aunque ambos scopes ya tengan asociación", async (t) => {
  const f = await fixture(t),
    key = crypto.randomUUID();
  const a = await f.service().start(f.a, { purpose: "sondeo" }, key);
  await f.service().start(f.a, { purpose: "atencion" }, crypto.randomUUID());
  await assert.rejects(f.service().start(f.a, { purpose: "atencion" }, key), {
    code: "idempotency_conflict",
  });
  await db.appOperation.update({
    where: { id: a.operation.id },
    data: { retainedUntil: new Date(0) },
  });
  await assert.rejects(f.service().start(f.a, { purpose: "sondeo" }, key), {
    code: "operation_retired",
  });
});
test("dos retries concurrentes no degradan una confirmación por un timeout posterior", async (t) => {
  const f = await fixture(t);
  const a = await f
    .service()
    .start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  f.remote.lost = true;
  const op = await f.service().turn(f.a, a.conversation.id, {
    turn_id: crypto.randomUUID(),
    kind: "text",
    text: "Consulta",
  });
  let entered,
    release,
    calls = 0;
  const waiting = new Promise((r) => (entered = r)),
    gate = new Promise((r) => (release = r)),
    original = f.remote.call.bind(f.remote);
  f.remote.call = async (...args) => {
    if (args[2].endsWith("/turns") && ++calls === 1) {
      entered();
      await gate;
      throw new Error("late timeout");
    }
    return original(...args);
  };
  const slow = f.service().retry(f.a, op.id);
  await waiting;
  assert.equal((await f.service().retry(f.b, op.id)).status, "admitted");
  release();
  assert.equal((await slow).status, "admitted");
  assert.equal((await f.service().operation(f.a, op.id)).status, "admitted");
});

test("recibo confirmado de revisión mayor no se degrada por una respuesta anterior", async (t) => {
  const f = await fixture(t);
  const a = await f
    .service()
    .start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  f.remote.lost = true;
  const op = await f.service().turn(f.a, a.conversation.id, {
    turn_id: crypto.randomUUID(),
    kind: "text",
    text: "Consulta",
  });
  let entered,
    release,
    calls = 0;
  const waiting = new Promise((r) => (entered = r)),
    gate = new Promise((r) => (release = r)),
    original = f.remote.call.bind(f.remote);
  f.remote.call = async (...args) => {
    const result = await original(...args);
    if (args[2].endsWith("/turns")) {
      if (++calls === 1) {
        entered();
        await gate;
      } else {
        result.data.receipt_revision = "3";
        result.data.status = "completed";
        result.data.completed_at = now();
      }
    }
    return result;
  };
  const slow = f.service().retry(f.a, op.id);
  await waiting;
  await f.service().retry(f.b, op.id);
  release();
  await slow;
  const latest = await f.service().operation(f.a, op.id);
  assert.equal(latest.receipt.receipt_revision, "3");
  assert.equal(latest.receipt.status, "completed");
});
test("IDs remotos que sólo difieren en mayúsculas no colisionan", async (t) => {
  const f = await fixture(t),
    g = await fixture(t);
  const a = await f
      .service()
      .start(f.a, { purpose: "sondeo" }, crypto.randomUUID()),
    b = await g
      .service()
      .start(g.a, { purpose: "sondeo" }, crypto.randomUUID());
  await db.appConversation.update({
    where: { id: a.conversation.id },
    data: { remoteId: "Conv_A" },
  });
  await db.appConversation.update({
    where: { id: b.conversation.id },
    data: { remoteId: "conv_a" },
  });
});
test("worker entrega revocación antes de contextos lentos y del escaneo", async (t) => {
  const f = await fixture(t),
    g = await fixture(t);
  await f.service().start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  await g.service().start(g.a, { purpose: "sondeo" }, crypto.randomUUID());
  await revokeAccount(db, g.u.id, config, "account_disabled");
  const calls = [];
  const original = f.remote.call.bind(f.remote);
  f.remote.call = async (...args) => {
    calls.push(args[0]);
    return original(...args);
  };
  await drainLifecycle(db, f.remote, config);
  assert.equal(calls[0], "revocation");
});

test("respuesta inicial tardía no reabre una sesión ya cerrada por otro dispositivo", async (t) => {
  const f = await fixture(t);
  f.remote.lost = true;
  const a = await f
    .service()
    .start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  let entered,
    release,
    calls = 0;
  const waiting = new Promise((r) => (entered = r)),
    gate = new Promise((r) => (release = r)),
    original = f.remote.call.bind(f.remote);
  f.remote.call = async (...args) => {
    const result = await original(...args);
    if (args[2] === "/sessions" && ++calls === 1) {
      entered();
      await gate;
    }
    return result;
  };
  const slow = f.service().retry(f.a, a.operation.id);
  await waiting;
  await f.service().retry(f.b, a.operation.id);
  f.remote.closed = true;
  await f.service().timeline(f.b, a.conversation.id);
  release();
  await slow;
  const current = await db.appConversation.findUnique({
    where: { id: a.conversation.id },
  });
  assert.equal(current.status, "closed");
  assert.equal(current.stateRevision, "3");
});
test("revocación llegada durante lote de contextos se entrega antes del grupo siguiente", async (t) => {
  const contexts = [];
  for (let i = 0; i < 9; i++) {
    const f = await fixture(t);
    await f.service().start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
    contexts.push(f);
  }
  const g = await fixture(t),
    f = contexts[0];
  let entered, release;
  const waiting = new Promise((r) => (entered = r)),
    gate = new Promise((r) => (release = r)),
    original = f.remote.call.bind(f.remote),
    calls = [];
  f.remote.call = async (...args) => {
    calls.push(args[0]);
    if (args[0] === "context" && calls.length === 1) {
      entered();
      await gate;
    }
    return original(...args);
  };
  const draining = drainLifecycle(db, f.remote, config);
  await waiting;
  await revokeAccount(db, g.u.id, config, "account_disabled");
  release();
  await draining;
  const index = calls.indexOf("revocation");
  assert.ok(index >= 0 && index <= 4, JSON.stringify(calls));
});

test("proxy de handoff comercial conserva identity_link_required como rechazo definitivo", async (t) => {
  const f = await fixture(t);
  await setConversationAccess(db, f.u.id, "sondeo", null, {
    permissions: ["history", "sondeo", "commercial_handoff"],
    manager_assignment_ref: null,
    commercial_assignment_ref: null,
    validated_at: now(),
    valid_until: new Date(Date.now() + 60000).toISOString(),
    source_ref: "test-authority",
  });
  const a = await f
    .service()
    .start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  let calls = 0;
  const original = f.remote.call.bind(f.remote);
  f.remote.call = async (...args) => {
    if (args[0] === "handoff") {
      calls++;
      throw new AppProblem(409, "identity_link_required");
    }
    return original(...args);
  };
  const op = await f
    .service()
    .handoff(
      f.a,
      a.conversation.id,
      { target_kind: "commercial", reason: "Solicitar asesoramiento" },
      crypto.randomUUID(),
    );
  assert.equal(op.status, "failed");
  assert.equal(op.error_code, "identity_link_required");
  assert.equal(op.receipt, null);
  assert.equal(calls, 1);
});

test("respuestas locales LidIA atraviesan asociación, contexto, turno y proyección Portal", async (t) => {
  const f = await fixture(t);
  const samples = JSON.parse(
    readFileSync(
      new URL(
        "../../../docs/integraciones/fixtures/app-v1-service-samples.json",
        import.meta.url,
      ),
    ),
  ).responses;
  const remote = {
    call: async (cap, method, path, subject, dto, opts = {}) => {
      let body;
      if (cap === "session") body = samples.SessionResponse;
      else if (cap === "context")
        body = { ...samples.ContextAck, correlation_id: dto.correlation_id };
      else if (cap === "turn") body = samples.Receipt;
      else if (cap === "timeline")
        body = opts.query?.turn_id ? samples.ReceiptLookup : samples.Timeline;
      else throw new Error(`Unsupported fixture ${cap}`);
      return {
        status: cap === "turn" ? 202 : 200,
        data: structuredClone(body),
      };
    },
  };
  const service = new AppConversationService(db, remote, {
    ...config,
    generalSupport: false,
  });
  const start = await service.start(
    f.a,
    { purpose: "sondeo" },
    crypto.randomUUID(),
  );
  assert.notEqual(
    start.conversation.id,
    samples.SessionResponse.conversation_id,
  );
  assert.equal(JSON.stringify(start).includes("effective_agent"), false);
  const turn = await service.turn(f.a, start.conversation.id, {
    turn_id: samples.Receipt.turn_id,
    kind: "text",
    text: "Argentina",
  });
  assert.equal(turn.receipt.status, "accepted");
  const timeline = await service.timeline(f.a, start.conversation.id);
  assert.equal(timeline.conversation_id, start.conversation.id);
  assert.deepEqual(timeline.items, samples.Timeline.items);
  assert.deepEqual(timeline.sondeo, samples.Timeline.sondeo);
  assert.equal(timeline.has_more, false);
  assert.equal(timeline.next_cursor, samples.Timeline.next_cursor);
  assert.equal(
    timeline.turn_statuses[0].conversation_id,
    start.conversation.id,
  );
  assert.equal(Object.hasOwn(timeline, "effective_agent"), false);
  const lookup = await service.timeline(f.b, start.conversation.id, {
    turn_id: samples.Receipt.turn_id,
  });
  assert.equal(lookup.receipt.status, "completed");
  assert.equal(lookup.receipt.conversation_id, start.conversation.id);
  assert.equal(
    (await service.operation(f.b, turn.id)).receipt.receipt_revision,
    "3",
  );
});

const finalSamples = JSON.parse(
  readFileSync(
    new URL(
      "../../../docs/integraciones/fixtures/app-v1-service-samples-v2.json",
      import.meta.url,
    ),
  ),
).responses;
test("handoff local LidIA conserva completed/requested y routing_error no activa fallback", async (t) => {
  const f = await fixture(t),
    original = f.remote.call.bind(f.remote);
  let reject = false,
    httpCalls = 0;
  const errorClient = new AppS2SClient(
    {
      enabled: true,
      baseUrl: "https://lidia.test",
      audience: "test:app",
      integrationId: "fixture-local",
      keys: {
        handoff: {
          keyId: "test",
          secretBase64: Buffer.alloc(32, 1).toString("base64"),
        },
      },
    },
    {
      fetchImpl: async () => {
        httpCalls++;
        return new Response(JSON.stringify(finalSamples.RoutingError), {
          status: 409,
        });
      },
    },
  );
  f.remote.call = async (...args) => {
    if (args[0] === "handoff")
      return reject
        ? errorClient.call(...args)
        : { status: 202, data: structuredClone(finalSamples.HandoffReceipt) };
    const response = await original(...args);
    // Synthetic initializer binds this independent received receipt to its own test association.
    if (args[0] === "session")
      response.data.conversation_id =
        finalSamples.HandoffReceipt.conversation_id;
    return response;
  };
  const a = await f
    .service()
    .start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  const dto = { target_kind: "support", reason: "Solicitar atención" };
  const success = await f
    .service()
    .handoff(f.a, a.conversation.id, dto, crypto.randomUUID());
  assert.equal(success.status, "admitted");
  assert.equal(success.receipt.turn_id, null);
  assert.equal(success.receipt.status, "completed");
  assert.equal(success.receipt.result.handoff_status, "requested");
  assert.equal(success.receipt.conversation_id, a.conversation.id);
  reject = true;
  const denied = await f
    .service()
    .handoff(f.b, a.conversation.id, dto, crypto.randomUUID());
  assert.equal(denied.status, "failed");
  assert.equal(denied.error_code, "routing_unavailable");
  assert.equal(httpCalls, 1);
});
test("timeline de atención LidIA proyecta operador actual y misma asociación local", async (t) => {
  const f = await fixture(t),
    original = f.remote.call.bind(f.remote);
  f.remote.call = async (...args) => {
    if (args[0] === "timeline")
      return {
        status: 200,
        data: structuredClone(finalSamples.SupportTimeline),
      };
    const response = await original(...args);
    if (args[0] === "session")
      response.data.conversation_id =
        finalSamples.SupportTimeline.conversation_id;
    return response;
  };
  const a = await f
    .service()
    .start(f.a, { purpose: "atencion" }, crypto.randomUUID());
  const first = await f.service().timeline(f.a, a.conversation.id),
    other = await f.service().timeline(f.b, a.conversation.id);
  assert.equal(first.conversation_id, a.conversation.id);
  assert.equal(other.conversation_id, a.conversation.id);
  assert.equal(first.conversation_status, "in_support");
  assert.equal(first.support.operator_display_name, "Segundo");
  assert.equal(first.items[0].role, "operator");
  assert.equal(Object.hasOwn(first, "effective_agent"), false);
  assert.equal(
    (await db.appConversation.findUnique({ where: { id: a.conversation.id } }))
      .stateRevision,
    "8",
  );
});

async function staleContextFixture(t) {
  const f = await fixture(t);
  const grant = {
    permissions: ["history", "sondeo"], validated_at: now(),
    valid_until: new Date(Date.now() + 60000).toISOString(), source_ref: "local-stale-context",
  };
  await setConversationAccess(db, f.u.id, "sondeo", null, grant);
  const a = await f.service().start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  await f.service().timeline(f.a, a.conversation.id);
  const initial = await db.appOperation.findFirst({ where: { conversationId: a.conversation.id, kind: "context", status: "admitted" }, orderBy: { createdAt: "asc" } });
  assert.ok(initial);
  await setConversationAccess(db, f.u.id, "sondeo", null, { ...grant, permissions: ["history"], validated_at: now() });
  await f.service().timeline(f.a, a.conversation.id);
  const current = await db.appConversation.findUnique({ where: { id: a.conversation.id } });
  assert.ok(BigInt(current.syncedRevision) > BigInt(initial.request.context_revision));
  assert.equal(current.contextRevision, current.syncedRevision);
  const op = await db.appOperation.update({ where: { id: initial.id }, data: { status: "outcome_unknown", response: Prisma.DbNull, httpStatus: null } });
  return { f, current, op };
}
test("un contexto incierto rechazado como obsoleto se conserva superseded tras confirmar uno mayor", async (t) => {
  const { f, current, op } = await staleContextFixture(t);
  const rejecting = { call: async () => { throw new AppProblem(409, "stale_context"); } };
  await deliverLifecycle(db, rejecting, config, op);
  const retained = await db.appOperation.findUnique({ where: { id: op.id } });
  assert.equal(retained.status, "superseded");
  assert.equal(retained.errorCode, "stale_context");
  assert.equal(retained.httpStatus, 409);
  assert.equal(retained.response, null);
  assert.deepEqual(retained.request, op.request);
  assert.equal(retained.idempotencyKey, op.idempotencyKey);
  assert.equal(retained.retainedUntil.toISOString(), op.retainedUntil.toISOString());
  const conversation = await db.appConversation.findUnique({ where: { id: current.id } });
  assert.equal(conversation.contextRevision, current.contextRevision);
  assert.equal(conversation.syncedRevision, current.syncedRevision);
  assert.deepEqual(conversation.context.permissions, ["history"]);
  assert.ok(await db.appConversationAccess.findFirst({ where: { userId: f.u.id } }));
});
test("un contexto incierto no se descarta antes de confirmar la revisión superior", async (t) => {
  const { current, op } = await staleContextFixture(t);
  await db.appConversation.update({ where: { id: current.id }, data: { syncedRevision: op.request.context_revision } });
  let calls = 0;
  await deliverLifecycle(db, { call: async () => { calls++; throw new AppProblem(409, "stale_context"); } }, config, op);
  assert.equal(calls, 0);
  assert.equal((await db.appOperation.findUnique({ where: { id: op.id } })).status, "outcome_unknown");
});
test("un fallo de transporte no clasifica una operación incierta como contexto sustituido", async (t) => {
  const { op } = await staleContextFixture(t);
  await deliverLifecycle(db, { call: async () => { throw new AppProblem(503, "outcome_unknown"); } }, config, op);
  assert.equal((await db.appOperation.findUnique({ where: { id: op.id } })).status, "outcome_unknown");
});
test("stale_context nunca retira la entrega de una revocación de cuenta", async (t) => {
  const { f } = await staleContextFixture(t);
  await revokeAccount(db, f.u.id, config, "account_disabled");
  const op = await db.appOperation.findFirst({ where: { userId: f.u.id, kind: "revocation" } });
  await deliverLifecycle(db, { call: async () => { throw new AppProblem(409, "stale_context"); } }, config, op);
  assert.equal((await db.appOperation.findUnique({ where: { id: op.id } })).status, "outcome_unknown");
  assert.equal((await db.user.findUnique({ where: { id: f.u.id } })).accountStatus, "disabled");
});

test("la confirmación de otra asociación remota no sustituye una operación del vínculo anterior", async (t) => {
  const { current, op } = await staleContextFixture(t);
  await deliverLifecycle(db, { call: async () => {
    await db.appConversation.update({ where: { id: current.id }, data: { remoteId: crypto.randomUUID() } });
    throw new AppProblem(409, "stale_context");
  } }, config, op);
  assert.equal((await db.appOperation.findUnique({ where: { id: op.id } })).status, "outcome_unknown");
});
test("un stale_context con HTTP no definitivo conserva la incertidumbre", async (t) => {
  const { op } = await staleContextFixture(t);
  await deliverLifecycle(db, { call: async () => { throw new AppProblem(503, "stale_context"); } }, config, op);
  assert.equal((await db.appOperation.findUnique({ where: { id: op.id } })).status, "outcome_unknown");
});

test("una revisión que pierde confirmación durante la llamada no supera el contexto incierto", async (t) => {
  const { current, op } = await staleContextFixture(t);
  await deliverLifecycle(db, { call: async () => {
    await db.appConversation.update({ where: { id: current.id }, data: { syncedRevision: op.request.context_revision } });
    throw new AppProblem(409, "stale_context");
  } }, config, op);
  assert.equal((await db.appOperation.findUnique({ where: { id: op.id } })).status, "outcome_unknown");
});


test("nombre por cuenta persiste entre dispositivos sin alterar última actividad ni exponer otro chat", async (t) => {
  const f = await fixture(t), other = await fixture(t);
  f.remote.metadata = { created_at: "2026-10-07T10:00:00.000Z", last_message_at: "2026-10-07T10:05:00.000Z" };
  const a = await f.service().start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  const renamed = await f.service().rename(f.a, a.conversation.id, { title: "  Mi canje de Peru\u0301  " });
  assert.equal(renamed.title, "Mi canje de Perú");
  const row = (await f.service().list(f.b))[0];
  assert.equal(row.title, "Mi canje de Perú");
  assert.equal(row.last_message_at, "2026-10-07T10:05:00.000Z");
  assert.equal(row.created_at, "2026-10-07T10:00:00.000Z");
  assert.equal(row.metadata_ready, true);
  await assert.rejects(f.service().rename(other.a, a.conversation.id, { title: "Robado" }), { code: "conversation_not_found" });
  for (const body of [{ title: " " }, { title: "x".repeat(121) }, { title: "línea\nprivada" }, { title: "\ud800" }, { title: "Bien", operator_id: "privado" }])
    await assert.rejects(f.service().rename(f.a, a.conversation.id, body), { code: "invalid_payload" });
  await f.service().rename(f.a, a.conversation.id, { title: null });
  assert.equal((await f.service().list(f.b))[0].title, null);
});

test("fallo de metadatos conserva fechas confirmadas pero no acredita estado vigente ni ausencia de mensajes", async (t) => {
  const f = await fixture(t);
  f.remote.metadata = { created_at: "2026-10-07T10:00:00.000Z", last_message_at: "2026-10-07T10:05:00.000Z" };
  const a = await f.service().start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  f.remote.closed = true;
  assert.equal((await f.service().list(f.a))[0].status, "closed");
  f.remote.timelineUnavailable = true;
  const row = (await f.service().list(f.a))[0];
  assert.equal(row.metadata_ready, false);
  assert.equal(row.status, "closed");
  assert.equal(row.last_message_at, "2026-10-07T10:05:00.000Z");
  assert.equal(row.created_at, "2026-10-07T10:00:00.000Z");
  assert.equal(row.id, a.conversation.id);
});

test("cierre remoto abre otra sesión entre dos dispositivos sin reabrir ni perder idempotencia histórica", async (t) => {
  const f = await fixture(t), key = crypto.randomUUID();
  const old = await f.service().start(f.a, { purpose: "sondeo" }, key);
  const oldRemote = (await db.appConversation.findUnique({ where: { id: old.conversation.id } })).remoteId;
  const original = f.remote.call.bind(f.remote);
  f.remote.call = async (...args) => {
    const r = await original(...args);
    if (args[2] === `/sessions/${oldRemote}/timeline`)
      r.data.conversation_status = "closed";
    return r;
  };
  const [a,b] = await Promise.all([
    f.service().start(f.a, { purpose: "sondeo" }, crypto.randomUUID()),
    f.service().start(f.b, { purpose: "sondeo" }, crypto.randomUUID()),
  ]);
  assert.notEqual(a.conversation.id, old.conversation.id);
  assert.equal(a.conversation.id, b.conversation.id);
  assert.equal(f.remote.sessionCount, 2);
  const replay = await f.service().start(f.b, { purpose: "sondeo" }, key);
  assert.equal(replay.conversation.id, old.conversation.id);
  assert.equal(replay.conversation.status, "closed");
  assert.equal((await f.service().list(f.b)).length, 2);
  const rows = await db.appConversation.findMany({ where: { userId: f.u.id } });
  assert.equal(rows[0].scopeKey, rows[1].scopeKey);
});

test("fuente indisponible bloquea nueva sesión en vez de suponer el cierre", async (t) => {
  const f = await fixture(t);
  await f.service().start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  f.remote.timelineUnavailable = true;
  await assert.rejects(f.service().start(f.b, { purpose: "sondeo" }, crypto.randomUUID()), { code: "runtime_unavailable" });
  assert.equal(f.remote.sessionCount, 1);
});

test("nueva conversación explícita conserva dos chats activos e historial aislado del mismo scope", async (t) => {
  const f = await fixture(t);
  const old = await f.service().start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  const fresh = await f.service().start(f.a, { purpose: "sondeo", create_new: true }, crypto.randomUUID());
  assert.notEqual(old.conversation.id, fresh.conversation.id);
  assert.equal(f.remote.sessionCount, 2);
  const rows = await db.appConversation.findMany({ where: { userId: f.u.id } });
  assert.equal(rows.length, 2); assert.equal(new Set(rows.map(c => c.remoteId)).size, 2);
  assert.ok(rows.every(c => c.status === "active"));
  for (const c of rows) assert.equal((await f.service().timeline(f.b, c.id)).conversation_id, c.id);
  assert.equal((await f.service().list(f.b)).length, 2);
  const resumed = await f.service().start(f.b, { purpose: "sondeo" }, crypto.randomUUID());
  assert.equal(resumed.conversation.id, fresh.conversation.id);
  assert.equal(f.remote.sessionCount, 2);
  const ops = await db.appOperation.findMany({ where: { userId: f.u.id, kind: "session" } });
  assert.ok(ops.every(op => !Object.hasOwn(op.request, "create_new") && op.request.resume_conversation_id === null));
});
test("nueva conversación es idempotente entre dispositivos y rechaza cambiar intención con la misma clave", async (t) => {
  const f = await fixture(t), key = crypto.randomUUID(), input = { purpose: "sondeo", create_new: true };
  const [a, b] = await Promise.all([f.service().start(f.a, input, key), f.service().start(f.b, input, key)]);
  assert.equal(a.conversation.id, b.conversation.id); assert.equal(f.remote.sessionCount, 1);
  await assert.rejects(f.service().start(f.b, { purpose: "sondeo" }, key), { code: "idempotency_conflict" });
  const normalKey = crypto.randomUUID();
  // An independent normal operation allows legacy replay with false or omitted.
  const g = await fixture(t);
  const normal = await g.service().start(g.a, { purpose: "sondeo" }, normalKey);
  assert.equal((await g.service().start(g.b, { purpose: "sondeo", create_new: false }, normalKey)).conversation.id, normal.conversation.id);
  await assert.rejects(g.service().start(g.b, input, normalKey), { code: "idempotency_conflict" });
});
test("pérdida de respuesta al crear otra sesión recupera la misma sin afectar la anterior", async (t) => {
  const f = await fixture(t);
  const old = await f.service().start(f.a, { purpose: "sondeo" }, crypto.randomUUID());
  f.remote.lost = true; const key = crypto.randomUUID(), input = { purpose: "sondeo", create_new: true };
  const pending = await f.service().start(f.a, input, key);
  assert.equal(pending.operation.status, "outcome_unknown");
  const replay = await f.service().start(f.b, input, key);
  assert.equal(replay.conversation.id, pending.conversation.id); assert.equal(replay.operation.id, pending.operation.id);
  assert.equal(f.remote.sessionCount, 2);
  await f.service().retry(f.b, replay.operation.id);
  const recovered = await f.service().start(f.b, input, key);
  assert.ok(recovered.conversation.ready); assert.equal(f.remote.sessionCount, 2);
  assert.equal((await f.service().timeline(f.a, old.conversation.id)).conversation_status, "active");
});
test("crear otro chat rechaza flags inválidos, atención y expediente ajeno", async (t) => {
  const f = await fixture(t);
  for (const input of [{ purpose: "sondeo", create_new: "true" }, { purpose: "sondeo", create_new: null }, { purpose: "atencion", create_new: true }])
    await assert.rejects(f.service().start(f.a, input, crypto.randomUUID()), { code: "invalid_payload" });
  await assert.rejects(f.service().start(f.a, { purpose: "sondeo", case_ref: crypto.randomUUID(), create_new: true }, crypto.randomUUID()), { code: "conversation_not_found" });
  assert.equal(f.remote.sessionCount, 0);
});

test("recuperar chat pendiente por id no sustituye otro más antiguo por el último del scope", async (t) => {
  const f = await fixture(t); f.remote.lost = true;
  const old = await f.service().start(f.a, { purpose: "sondeo", create_new: true }, crypto.randomUUID());
  const latest = await f.service().start(f.a, { purpose: "sondeo", create_new: true }, crypto.randomUUID());
  const recovered = await f.service().start(f.b, { purpose: "sondeo", conversation_id: old.conversation.id }, crypto.randomUUID());
  assert.equal(recovered.conversation.id, old.conversation.id); assert.equal(recovered.operation.id, old.operation.id);
  assert.notEqual(recovered.conversation.id, latest.conversation.id); assert.equal(f.remote.sessionCount, 2);
  const g = await fixture(t);
  await assert.rejects(g.service().start(g.a, { purpose: "sondeo", conversation_id: old.conversation.id }, crypto.randomUUID()), { code: "conversation_not_found" });
  await assert.rejects(f.service().start(f.a, { purpose: "atencion", conversation_id: old.conversation.id }, crypto.randomUUID()), { code: "conversation_not_found" });
  await assert.rejects(f.service().start(f.a, { purpose: "sondeo", conversation_id: old.conversation.id, create_new: true }, crypto.randomUUID()), { code: "invalid_payload" });
});
