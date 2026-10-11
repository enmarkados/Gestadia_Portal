import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const wire = JSON.parse(
  readFileSync(
    new URL(
      "../../../../docs/integraciones/fixtures/app-v2-vectors-r2.json",
      import.meta.url,
    ),
  ),
);
const subject = wire.vectors[0].subject,
  guest = wire.vectors[0].actor;
const authority = { subject, actor: guest, access_revision: "1" };
const payload = JSON.parse(wire.vectors.at(-1).body_json);
const path = "/sessions/chat/turns",
  capability = "app.turns.write";
const secret = Buffer.from(wire.secret_base64, "base64");
const key = { keyId: "v2-key", secretBase64: wire.secret_base64 };
const cfg = {
  enabled: true,
  guestEnabled: true,
  integrationId: "test",
  baseUrl: "https://lidia.test",
  audience: wire.vectors[0].audience,
  keys: {
    [capability]: key,
    "app.timeline.read": key,
    "app.sessions.write": key,
    "app.subjects.revoke": key,
  },
};
const options = {
  idempotencyKey: "turn-stable-key-0001",
  validateResponse: (d) => d?.ok === true,
};
async function client(
  config = cfg,
  fetchImpl = async () => new Response('{"ok":true}'),
) {
  const { AppS2SClientV2 } = await import("./s2s.js");
  return new AppS2SClientV2(config, {
    fetchImpl,
    clock: () => 1791180000000,
    nonce: () => wire.vectors[0].nonce,
  });
}
for (const v of wire.vectors)
  test(`v2 bytes exactos: ${v.name}`, async () => {
    const { signRequestV2 } = await import("./s2s.js");
    const got = signRequestV2(
      { ...v, encoded_path: v.path, canonical_query: v.query },
      Buffer.from(v.body_json),
      secret,
    );
    assert.equal(got.canonical, v.canonical);
    assert.equal(got.signature, v.signature);
    assert.equal(got.body_sha256, v.body_sha256);
    assert.equal(got.canonical.split("\n").length, 13);
    assert.equal(got.canonical.endsWith("\n"), false);
  });
test("v2 firma sujeto/actor/revisión, valida metadatos y separa dominio v1", async () => {
  const { signRequestV2 } = await import("./s2s.js");
  const v = wire.vectors[0],
    f = { ...v, encoded_path: v.path, canonical_query: v.query };
  for (const change of [
    { actor: "account:33333333-3333-4333-8333-333333333333" },
    { access_revision: "2" },
    { subject: "33333333-3333-4333-8333-333333333333" },
  ])
    assert.notEqual(
      signRequestV2({ ...f, ...change }, Buffer.from(v.body_json), secret)
        .signature,
      v.signature,
    );
  for (const change of [
    { audience: "x\ninject" },
    { nonce: "x" },
    { actor: "guest:OTHER" },
    { access_revision: "01" },
    { encoded_path: "/api/integrations/lidia/app/v1/sessions" },
    { canonical_query: "cursor=a+b" },
  ])
    assert.throws(
      () =>
        signRequestV2({ ...f, ...change }, Buffer.from(v.body_json), secret),
      { code: "invalid_payload" },
    );
  assert.throws(
    () => signRequestV2(f, Buffer.from(v.body_json), Buffer.alloc(8)),
    { code: "runtime_unavailable" },
  );
});
test("query v2 recupera revisión exacta y aplica RFC3986 sin alterar revisiones grandes", async () => {
  const { canonicalQueryV2 } = await import("./s2s.js");
  assert.equal(
    canonicalQueryV2(
      "/sessions/chat/contact-requests/44444444-4444-4444-8444-444444444444",
      { intent_revision: "9007199254740993" },
    ),
    "intent_revision=9007199254740993",
  );
  assert.equal(
    canonicalQueryV2("/sessions/chat/timeline", {
      limit: "50",
      cursor: "c+/= !'()",
    }),
    "cursor=c%2B%2F%3D%20%21%27%28%29&limit=50",
  );
  assert.equal(
    canonicalQueryV2(`/subjects/${subject}/operations`, {
      operation: "session",
      idempotency_key: "start-stable-key-001",
    }),
    "idempotency_key=start-stable-key-001&operation=session",
  );
  for (const [p, q] of [
    [path, { limit: "50" }],
    ["/sessions/chat/timeline", { limit: "01" }],
    ["/sessions/chat/timeline", { agent: "119" }],
    ["/sessions/chat/timeline", { turn_id: subject, cursor: "x" }],
    [
      "/sessions/chat/contact-requests/44444444-4444-4444-8444-444444444444",
      {},
    ],
    [
      `/subjects/${subject}/operations`,
      { operation: "turn", idempotency_key: "start-stable-key-001" },
    ],
  ])
    assert.throws(() => canonicalQueryV2(p, q), { code: "invalid_payload" });
});
test("cliente valida DTO y firma los mismos bytes enviados; no exporta claves", async () => {
  let request;
  const c = await client(cfg, async (url, init) => {
    request = { url, init };
    return new Response('{"ok":true}');
  });
  assert.deepEqual(
    await c.call(capability, "POST", path, authority, payload, options),
    { status: 200, data: { ok: true } },
  );
  assert.equal(
    request.url,
    "https://lidia.test/api/integrations/lidia/app/v2/sessions/chat/turns",
  );
  assert.equal(request.init.redirect, "manual");
  assert.equal(request.init.headers["X-Gestadia-Actor"], guest);
  assert.equal(request.init.headers["X-Gestadia-Access-Revision"], "1");
  const { signRequestV2 } = await import("./s2s.js");
  assert.equal(
    request.init.headers["X-Gestadia-Signature"],
    signRequestV2(
      {
        audience: cfg.audience,
        key_id: key.keyId,
        timestamp: "1791180000",
        nonce: wire.vectors[0].nonce,
        method: "POST",
        encoded_path: "/api/integrations/lidia/app/v2" + path,
        canonical_query: "",
        subject,
        actor: guest,
        access_revision: "1",
        idempotency_key: options.idempotencyKey,
      },
      request.init.body,
      secret,
    ).signature,
  );
  assert.equal(request.init.headers["Idempotency-Key"], options.idempotencyKey);
});
test("lectura firma query exacta y no envía cuerpo ni Idempotency-Key", async () => {
  let request;
  const c = await client(cfg, async (url, init) => {
    request = { url, init };
    return new Response('{"ok":true}');
  });
  await c.call(
    "app.timeline.read",
    "GET",
    "/sessions/chat/timeline",
    authority,
    undefined,
    {
      query: { limit: "1" },
      validateResponse: options.validateResponse,
    },
  );
  assert.equal(request.init.body, undefined);
  assert.equal(request.init.headers["Idempotency-Key"], undefined);
  assert.ok(request.url.endsWith("?limit=1"));
});
test("flags off, claves v1, destino arbitrario y falta de validador no hacen HTTP", async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls++;
    return new Response('{"ok":true}');
  };
  for (const config of [
    { ...cfg, enabled: false },
    { ...cfg, guestEnabled: false },
    { ...cfg, keys: { turn: key } },
    { ...cfg, baseUrl: "http://lidia.test" },
    { ...cfg, baseUrl: "https://lidia.test/else" },
    { ...cfg, baseUrl: "https://user:pass@lidia.test" },
  ])
    await assert.rejects(
      (await client(config, fetchImpl)).call(
        capability,
        "POST",
        path,
        authority,
        payload,
        options,
      ),
      { code: "runtime_unavailable" },
    );
  await assert.rejects(
    (await client(cfg, fetchImpl)).call(
      capability,
      "POST",
      path,
      authority,
      payload,
      { idempotencyKey: options.idempotencyKey },
    ),
    { code: "runtime_unavailable" },
  );
  assert.equal(calls, 0);
});
test("r3 bloquea contacto reservado aunque se inyecte una clave válida", async () => {
  let calls = 0;
  const c = await client(
    { ...cfg, keys: { ...cfg.keys, "app.contact_requests.read": key } },
    async () => {
      calls++;
      return new Response('{"ok":true}');
    },
  );
  await assert.rejects(
    c.call(
      "app.contact_requests.read",
      "GET",
      "/sessions/chat/contact-requests/44444444-4444-4444-8444-444444444444",
      authority,
      undefined,
      {
        query: { intent_revision: "1" },
        validateResponse: options.validateResponse,
      },
    ),
    { code: "invalid_payload" },
  );
  assert.equal(calls, 0);
});
test("método/ruta/capacidad, autoridad y campos privilegiados se rechazan antes de HTTP", async () => {
  let calls = 0;
  const c = await client(cfg, async () => {
    calls++;
    return new Response('{"ok":true}');
  });
  for (const [cap, method, p, a, dto, opts] of [
    [capability, "DELETE", path, authority, payload, options],
    ["app.sessions.write", "POST", path, authority, payload, options],
    [
      capability,
      "POST",
      "/sessions/chat/../../admin",
      authority,
      payload,
      options,
    ],
    [
      capability,
      "POST",
      path,
      { ...authority, actor: "account:other" },
      payload,
      options,
    ],
    [
      capability,
      "POST",
      path,
      authority,
      { ...payload, agent_id: 119 },
      options,
    ],
    [
      capability,
      "POST",
      path,
      authority,
      payload,
      { ...options, query: { cursor: "x" } },
    ],
  ])
    await assert.rejects(c.call(cap, method, p, a, dto, opts), {
      code: "invalid_payload",
    });
  assert.equal(calls, 0);
});
test("inicio no permite cambiar actor/sujeto y guest no amplía permisos de contexto", async () => {
  let calls = 0;
  const c = await client(
    { ...cfg, keys: { ...cfg.keys, "app.context.attest": key } },
    async () => {
      calls++;
      return new Response('{"ok":true}');
    },
  );
  const start = JSON.parse(wire.vectors[0].body_json);
  await assert.rejects(
    c.call(
      "app.sessions.write",
      "POST",
      "/sessions",
      { ...authority, access_revision: "0" },
      {
        ...start,
        identity: {
          ...start.identity,
          actor_id: "33333333-3333-4333-8333-333333333333",
        },
      },
      options,
    ),
    { code: "invalid_payload" },
  );
  const context = {
    schema_version: "2.0",
    conversation_subject_id: subject,
    context_revision: "1",
    validated_at: "2026-10-05T09:59:00.000Z",
    permissions: ["sondeo", "case_context"],
    case_ref: null,
    commercial_assignment_ref: null,
    manager_assignment_ref: null,
    correlation_id: "test",
  };
  await assert.rejects(
    c.call(
      "app.context.attest",
      "POST",
      "/sessions/chat/context",
      authority,
      context,
      options,
    ),
    { code: "capability_denied" },
  );
  assert.equal(calls, 0);
});
test("retirar un visitante sigue siendo control posible con guest data off", async () => {
  const c = await client({ ...cfg, guestEnabled: false });
  await c.call(
    "app.subjects.revoke",
    "POST",
    `/subjects/${subject}/revocations`,
    authority,
    {
      schema_version: "2.0",
      scope: "guest",
      reason_code: "identity_conflict",
      correlation_id: "test",
    },
    options,
  );
});
test("timeout ambiguo no reintenta ni expone error externo", async () => {
  let calls = 0;
  const c = await client(cfg, async () => {
    calls++;
    throw new Error("PRIVATE_SECRET");
  });
  await assert.rejects(
    c.call(capability, "POST", path, authority, payload, options),
    (e) =>
      e.code === "outcome_unknown" && !e.message.includes("PRIVATE_SECRET"),
  );
  assert.equal(calls, 1);
});
test("redirect, respuesta no validada, JSON inválido o enorme se rechazan", async () => {
  for (const response of [
    () =>
      new Response("", {
        status: 302,
        headers: { Location: "https://evil.test" },
      }),
    () => new Response('{"ok":false,"secret":"PRIVATE"}'),
    () => new Response("not JSON"),
    () => new Response("x".repeat(1048577)),
  ]) {
    let calls = 0;
    const c = await client(cfg, async () => {
      calls++;
      return response();
    });
    await assert.rejects(
      c.call(capability, "POST", path, authority, payload, options),
      { code: "invalid_upstream_response" },
    );
    assert.equal(calls, 1);
  }
});
test("error remoto conocido preserva código, sin detalles privados ni auth en móvil", async () => {
  const c = await client(
    cfg,
    async () =>
      new Response('{"code":"contact_request_conflict","detail":"PRIVATE"}', {
        status: 409,
      }),
  );
  await assert.rejects(
    c.call(capability, "POST", path, authority, payload, options),
    (e) =>
      e.code === "contact_request_conflict" &&
      e.status === 409 &&
      !e.message.includes("PRIVATE"),
  );
  const auth = await client(
    cfg,
    async () =>
      new Response('{"code":"invalid_integration_auth"}', { status: 401 }),
  );
  await assert.rejects(
    auth.call(capability, "POST", path, authority, payload, options),
    { code: "runtime_unavailable", status: 503 },
  );
});
test("autoridad cerrada no sobrescribe destino de firma y tipos no se coercionan", async () => {
  let calls = 0;
  const c = await client(cfg, async () => {
    calls++;
    return new Response('{"ok":true}');
  });
  await assert.rejects(
    c.call(
      capability,
      "POST",
      path,
      {
        ...authority,
        encoded_path: "/api/integrations/lidia/app/v2/sessions/another/turns",
      },
      payload,
      options,
    ),
    { code: "invalid_payload" },
  );
  await assert.rejects(
    (
      await client({ ...cfg, audience: undefined }, async () => {
        calls++;
        return new Response('{"ok":true}');
      })
    ).call(capability, "POST", path, authority, payload, options),
    { code: "runtime_unavailable" },
  );
  const { signRequestV2 } = await import("./s2s.js");
  const v = wire.vectors[0],
    f = { ...v, encoded_path: v.path, canonical_query: v.query };
  for (const change of [
    { key_id: undefined },
    { access_revision: 1 },
    { timestamp: 1791180000 },
  ])
    assert.throws(
      () =>
        signRequestV2({ ...f, ...change }, Buffer.from(v.body_json), secret),
      { code: "invalid_payload" },
    );
  assert.equal(calls, 0);
});

test("matriz confirmada recupera inicio y operación con autoridad actual", async () => {
  const urls = [];
  const c = await client(cfg, async (url) => {
    urls.push(url);
    return new Response('{"ok":true}');
  });
  const read = { validateResponse: options.validateResponse };
  await c.call(
    "app.timeline.read",
    "GET",
    `/subjects/${subject}/operations`,
    authority,
    undefined,
    {
      ...read,
      query: { idempotency_key: "start-stable-key-001", operation: "session" },
    },
  );
  await c.call(
    "app.timeline.read",
    "GET",
    `/sessions/chat/operations/${subject}`,
    authority,
    undefined,
    read,
  );
  assert.equal(
    urls[0],
    `https://lidia.test/api/integrations/lidia/app/v2/subjects/${subject}/operations?idempotency_key=start-stable-key-001&operation=session`,
  );
  assert.equal(
    urls[1],
    `https://lidia.test/api/integrations/lidia/app/v2/sessions/chat/operations/${subject}`,
  );
});
test("matriz confirmada lee y confirma recibos sin mezclar query ni IDs", async () => {
  const urls = [];
  const c = await client(cfg, async (url, init) => {
    urls.push({ url, init });
    return new Response('{"ok":true}');
  });
  const read = { validateResponse: options.validateResponse };
  const receiptPath = "/sessions/chat/message-receipts";
  await c.call("app.timeline.read", "GET", receiptPath, authority, undefined, {
    ...read,
    query: { summary: "true" },
  });
  await c.call("app.timeline.read", "GET", receiptPath, authority, undefined, {
    ...read,
    query: { message_ids: "msg-1,msg-2" },
  });
  const dto = {
    schema_version: "2.0",
    ack_id: subject,
    state: "read",
    message_ids: ["msg-1"],
    correlation_id: "test",
  };
  await c.call("app.turns.write", "POST", receiptPath, authority, dto, options);
  assert.ok(urls[0].url.endsWith("?summary=true"));
  assert.ok(urls[1].url.endsWith("?message_ids=msg-1%2Cmsg-2"));
  assert.deepEqual(JSON.parse(urls[2].init.body), dto);
  for (const query of [
    { summary: "true", turn_id: subject },
    { summary: "false" },
    { message_ids: "msg-1,msg-1" },
    { message_ids: "bad/id" },
    {},
  ])
    await assert.rejects(
      c.call("app.timeline.read", "GET", receiptPath, authority, undefined, {
        ...read,
        query,
      }),
      { code: "invalid_payload" },
    );
  await assert.rejects(
    c.call(
      "app.turns.write",
      "POST",
      receiptPath,
      authority,
      { ...dto, message_ids: ["bad/id"] },
      options,
    ),
    { code: "invalid_payload" },
  );
  assert.equal(urls.length, 3);
});
test("matriz confirmada mantiene handoff protegido para cuenta", async () => {
  let calls = 0;
  const c = await client(
    { ...cfg, keys: { ...cfg.keys, "app.handoff.request": key } },
    async () => {
      calls++;
      return new Response('{"ok":true}');
    },
  );
  const dto = {
    schema_version: "2.0",
    target_kind: "support",
    reason: "Necesito ayuda",
    correlation_id: "test",
  };
  await assert.rejects(
    c.call(
      "app.handoff.request",
      "POST",
      "/sessions/chat/handoff",
      authority,
      dto,
      options,
    ),
    { code: "capability_denied" },
  );
  await c.call(
    "app.handoff.request",
    "POST",
    "/sessions/chat/handoff",
    { ...authority, actor: `account:${subject}` },
    dto,
    options,
  );
  assert.equal(calls, 1);
});
test("binding conserva expected_access_revision exacta al header y replay", async () => {
  let calls = 0;
  const target = "33333333-3333-4333-8333-333333333333";
  const c = await client(
    { ...cfg, keys: { ...cfg.keys, "app.bindings.write": key } },
    async () => {
      calls++;
      return new Response('{"ok":true}');
    },
  );
  const dto = {
    schema_version: "2.0",
    binding_id: subject,
    phase: "prepare",
    conversation_subject_id: subject,
    source_guest_id: guest.slice(6),
    target_portal_user_id: target,
    expected_access_revision: "2",
    verified_account_identity: {
      kind: "account",
      actor_id: target,
      attested_at: "2026-10-05T09:59:00.000Z",
      verification_level: "account_verified",
      verified_at: "2026-10-05T09:59:00.000Z",
      method: "email",
      account_status: "active",
    },
    source_control_ref: "opaque",
    correlation_id: "test",
  };
  await assert.rejects(
    c.call(
      "app.bindings.write",
      "POST",
      "/sessions/chat/bindings",
      authority,
      dto,
      options,
    ),
    { code: "invalid_payload" },
  );
  await c.call(
    "app.bindings.write",
    "POST",
    "/sessions/chat/bindings",
    { ...authority, access_revision: "2" },
    dto,
    options,
  );
  assert.equal(calls, 1);
});
