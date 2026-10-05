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
