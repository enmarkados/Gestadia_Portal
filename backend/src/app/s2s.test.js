import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  signRequest,
  semanticHash,
  canonicalQuery,
  AppS2SClient,
} from "./s2s.js";
import { validateContract } from "./contracts.js";
const fixture = (name) =>
  JSON.parse(
    readFileSync(
      new URL(`../../../docs/integraciones/fixtures/${name}`, import.meta.url),
    ),
  );
for (const name of [
  "app-s2s-v1-vectors.json",
  "app-context-v1-1-vectors.json",
]) {
  const f = fixture(name);
  for (const v of f.positives)
    test(`firma exacta ${name} ${v.id}`, () => {
      const got = signRequest(
        v,
        Buffer.from(v.body_base64, "base64"),
        Buffer.from(f.keys_hex[v.key_id], "hex"),
      );
      assert.equal(got.canonical, v.canonical);
      assert.equal(got.signature, v.signature);
      if (v.semantic_sha256)
        assert.equal(
          semanticHash(
            name.startsWith("app-context") ? "context" : "turn",
            v.subject,
            v.encoded_path.split("/").at(-2),
            v.request || JSON.parse(Buffer.from(v.body_base64, "base64")),
          ),
          v.semantic_sha256,
        );
    });
}
test("query sólo permite target canónico y no combina turn_id con cursor", () => {
  assert.equal(
    canonicalQuery({ limit: "50", cursor: "c+/= v" }),
    "cursor=c%2B%2F%3D%20v&limit=50",
  );
  for (const q of [
    { limit: "01" },
    { agent: "119" },
    { turn_id: "11111111-1111-4111-8111-111111111111", cursor: "x" },
    { cursor: "á" },
  ])
    assert.throws(() => canonicalQuery(q));
});
test("validador rechaza Unicode inválido/propiedades privilegiadas y admite 4000 escalares", () => {
  const t = {
    schema_version: "1.0",
    turn_id: "33333333-3333-4333-8333-333333333333",
    kind: "text",
    text: "😀".repeat(4000),
    correlation_id: "test",
  };
  assert.equal(validateContract("TurnRequest", t), true);
  for (const bad of [
    { ...t, text: "\ud800" },
    { ...t, text: " " },
    { ...t, targetUserId: 3 },
    { ...t, text: "😀".repeat(4001) },
  ])
    assert.throws(() => validateContract("TurnRequest", bad));
});
test("cliente deshabilitado no hace HTTP; errores externos nunca exponen el body", async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls++;
    return new Response(
      JSON.stringify({ code: "capability_denied", detail: "PRIVATE_SECRET" }),
      { status: 403 },
    );
  };
  const cfg = {
    enabled: false,
    baseUrl: "https://lidia.test",
    audience: "lidia:test:dev:app",
    integrationId: "test",
    keys: {
      turn: {
        keyId: "test",
        secretBase64: Buffer.alloc(32, 1).toString("base64"),
      },
    },
  };
  let c = new AppS2SClient(cfg, { fetchImpl });
  await assert.rejects(
    c.call(
      "turn",
      "POST",
      "/sessions/x/turns",
      "11111111-1111-4111-8111-111111111111",
      {},
      { idempotencyKey: "test-idempotent-01" },
    ),
    { code: "runtime_unavailable" },
  );
  assert.equal(calls, 0);
  c = new AppS2SClient({ ...cfg, enabled: true }, { fetchImpl });
  await assert.rejects(
    c.call(
      "turn",
      "POST",
      "/sessions/x/turns",
      "11111111-1111-4111-8111-111111111111",
      {},
      { idempotencyKey: "test-idempotent-01" },
    ),
    (e) => e.status === 403 && !e.message.includes("PRIVATE_SECRET"),
  );
  assert.equal(calls, 1);
  await assert.rejects(
    c.call(
      "turn",
      "POST",
      "/../admin",
      "11111111-1111-4111-8111-111111111111",
      {},
      {},
    ),
  );
  assert.equal(calls, 1);
});

test("handoff completed con requested valida el recibo sin acreditar operador", () => {
  const date = "2026-10-05T10:15:00.000Z";
  const receipt = {
    schema_version: "1.0",
    operation_id: "22222222-2222-4222-8222-222222222222",
    operation: "handoff",
    conversation_id: "session-1",
    turn_id: null,
    status: "completed",
    receipt_revision: "2",
    state_revision: "3",
    accepted_at: date,
    updated_at: date,
    completed_at: date,
    retained_until: "2026-11-04T10:15:00.000Z",
    result: {
      message_ids: [],
      presentation_ids: [],
      sondeo_result_id: null,
      sondeo_result_revision: null,
      handoff_status: "requested",
    },
    error: null,
    retry_after_seconds: null,
  };
  assert.equal(validateContract("Receipt", receipt, { response: true }), true);
  assert.equal(receipt.result.handoff_status, "requested");
});
test("409 identity_link_required conserva código y oculta detalle privado sin fallback", async () => {
  let calls = 0;
  const client = new AppS2SClient(
    {
      enabled: true,
      baseUrl: "https://lidia.test",
      audience: "lidia:test:dev:app",
      integrationId: "test",
      keys: {
        handoff: {
          keyId: "handoff-test",
          secretBase64: Buffer.alloc(32, 1).toString("base64"),
        },
      },
    },
    {
      fetchImpl: async () => {
        calls++;
        return new Response(
          JSON.stringify({
            code: "identity_link_required",
            detail: "PRIVATE_LINK_DATA",
          }),
          { status: 409 },
        );
      },
    },
  );
  await assert.rejects(
    client.call(
      "handoff",
      "POST",
      "/sessions/session-1/handoff",
      "11111111-1111-4111-8111-111111111111",
      { target_kind: "commercial" },
      { idempotencyKey: "commercial-request-1" },
    ),
    (e) =>
      e.status === 409 &&
      e.code === "identity_link_required" &&
      !e.message.includes("PRIVATE_LINK_DATA"),
  );
  assert.equal(calls, 1);
});

// Received samples from local LidIA services; fixture data, never a connected runtime.
const serviceSamples = fixture("app-v1-service-samples.json");
for (const [name, response] of Object.entries(serviceSamples.responses)) {
  const contract = name === "ContextAck" ? "ConversationContextResponse" : name;
  test(`muestra de servicio LidIA valida ${name}`, () => {
    assert.equal(serviceSamples.fixture_only, true);
    assert.equal(
      validateContract(contract, response, { response: true }),
      true,
    );
  });
}

const finalServiceSamples = fixture("app-v1-service-samples-v2.json");
const sampleContracts = {
  ContextAck: "ConversationContextResponse",
  HandoffReceipt: "Receipt",
  SupportTimeline: "Timeline",
  RoutingError: "Error",
};
for (const [name, response] of Object.entries(finalServiceSamples.responses)) {
  test(`muestra final LidIA valida ${name}`, () => {
    assert.equal(finalServiceSamples.fixture_only, true);
    assert.equal(
      validateContract(sampleContracts[name] || name, response, {
        response: true,
      }),
      true,
    );
  });
}


test("metadatos aditivos admiten UTC y null sin aceptar fechas inválidas ni campos privados", () => {
  const session = {
    schema_version: "1.0", conversation_id: "session-meta", lidia_session_id: "private",
    purpose: "sondeo", status: "active",
    effective_agent: { id: 119, display_name: "LidIA", instruction_version: "test" },
    capabilities: ["history", "sondeo"], cursor: null, state_revision: "1",
  };
  const timeline = {
    schema_version: "1.0", conversation_id: "session-meta", items: [], next_cursor: null,
    has_more: false, conversation_status: "closed", effective_agent: session.effective_agent,
    support: { status: "none", operator_display_name: null, requested_at: null,
      assigned_at: null, attended_at: null, updated_at: "2026-10-07T12:00:00.000Z" },
    turn_statuses: [], sondeo: null, state_revision: "2",
  };
  for (const [name, old] of [["SessionResponse", session], ["Timeline", timeline]]) {
    assert.equal(validateContract(name, old, { response: true }), true);
    const meta = { ...old, created_at: "2026-10-07T12:00:00.1234567Z", last_message_at: null };
    assert.equal(validateContract(name, meta, { response: true }), true);
    assert.equal(validateContract(name, { ...meta, last_message_at: "2026-10-07T12:05:00.000Z" }, { response: true }), true);
    for (const bad of [{ created_at: "invalid" }, { created_at: "2026-10-07T12:00:00+02:00" },
      { last_message_at: "invalid" }, { operator_id: "private" }])
      assert.throws(() => validateContract(name, { ...meta, ...bad }, { response: true }), { code: "invalid_upstream_response" });
  }
});

test("cliente firma recibos por IDs/summary y ACK sin ampliar rutas o capacidades",async()=>{
  const requests=[];
  const key={keyId:"test",secretBase64:Buffer.alloc(32,1).toString("base64")};
  const c=new AppS2SClient({enabled:true,baseUrl:"https://lidia.test",audience:"lidia:test:dev:app",integrationId:"test",keys:{timeline:key,turn:key,context:key}},{fetchImpl:async(url,opts)=>{requests.push({url,opts});return new Response('{}',{status:200});}});
  await c.call("timeline","GET","/sessions/chat-1/message-receipts","11111111-1111-4111-8111-111111111111",null,{query:{message_ids:"m1,m2"}});
  assert.ok(requests[0].url.endsWith("?message_ids=m1%2Cm2"));
  await c.call("timeline","GET","/sessions/chat-1/message-receipts","11111111-1111-4111-8111-111111111111",null,{query:{summary:"true"}});
  await c.call("turn","POST","/sessions/chat-1/message-receipts","11111111-1111-4111-8111-111111111111",{ack_id:"22222222-2222-4222-8222-222222222222"},{idempotencyKey:"test-idempotent-01"});
  assert.equal(requests[2].opts.headers['Idempotency-Key'],"test-idempotent-01");
  for(const [role,method,q] of [["context","POST",{}],["timeline","GET",{summary:"true",cursor:"x"}],["timeline","GET",{message_ids:"m1,m1"}]])
    await assert.rejects(c.call(role,method,"/sessions/chat-1/message-receipts","11111111-1111-4111-8111-111111111111",{}, {query:q,idempotencyKey:"test-idempotent-01"}),{code:"invalid_payload"});
  assert.equal(requests.length,3);
});
