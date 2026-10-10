import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const wire = JSON.parse(
  readFileSync(
    new URL(
      "../../../../docs/integraciones/fixtures/app-v2-vectors-r2.json",
      import.meta.url,
    ),
  ),
);
const start = JSON.parse(wire.vectors[0].body_json),
  subject = start.conversation_subject_id;
const base = { schema_version: "2.0", correlation_id: "test" };
const contact = {
  ...base,
  intent_id: subject,
  intent_revision: "1",
  result_id: subject,
  result_revision: "9007199254740993",
  name: "Ana Ruiz",
  phone: "600 111 222",
  email: null,
  purpose: "contacto_gestor",
  consent: "confirmed",
  confirmed_at: "2026-10-05T09:59:00.000Z",
  source_message_ids: [subject],
};
test("schema runtime es copia exacta del artefacto r2", () => {
  const bytes = readFileSync(
    new URL("./contracts/app-v2-schema.json", import.meta.url),
  );
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    "7e164b639a64add04bcc61d8f6bec935f3dd2faa9c3ad33c2c05a3cc54bfe714",
  );
});
test("requests válidos conservan Unicode y campos declarados sin coerción", async () => {
  const { validateContractV2 } = await import("./contracts.js");
  assert.equal(validateContractV2("session", start), true);
  const turn = JSON.parse(wire.vectors.at(-1).body_json);
  assert.equal(validateContractV2("textTurn", turn), true);
  assert.equal(validateContractV2("contactRequest", contact), true);
  assert.equal(
    validateContractV2("contactRequest", {
      ...contact,
      phone: null,
      email: "ana@example.com",
    }),
    true,
  );
  assert.equal(contact.phone, "600 111 222");
});
test("esquemas cerrados rechazan v1, campos libres, UUID/revisiones y Unicode malformados", async () => {
  const { validateContractV2 } = await import("./contracts.js");
  for (const dto of [
    { ...start, schema_version: "1.0" },
    { ...start, project_id: 11 },
    { ...start, conversation_subject_id: "NOT_UUID" },
    { ...start, identity: { ...start.identity, user_id: subject } },
    { ...start, correlation_id: "\ud800" },
  ])
    assert.throws(() => validateContractV2("session", dto), {
      code: "invalid_payload",
    });
  for (const dto of [
    { ...contact, result_revision: 1 },
    { ...contact, intent_revision: "0" },
    { ...contact, source_message_ids: [subject, subject] },
  ])
    assert.throws(() => validateContractV2("contactRequest", dto), {
      code: "invalid_payload",
    });
});
test("vigencia guest no excede 24h, no retrocede ni admite fechas imposibles", async () => {
  const { validateContractV2 } = await import("./contracts.js");
  for (const identity of [
    { ...start.identity, expires_at: "2026-10-06T10:00:00.000Z" },
    { ...start.identity, expires_at: start.identity.attested_at },
    { ...start.identity, attested_at: "2026-02-30T09:59:00.000Z" },
  ])
    assert.throws(() => validateContractV2("session", { ...start, identity }), {
      code: "invalid_payload",
    });
});
test("contacto exige nombre y canal real; no inventa prefijo ni acepta controles", async () => {
  const { validateContractV2 } = await import("./contracts.js");
  for (const dto of [
    { ...contact, phone: null, email: null },
    { ...contact, name: " " },
    { ...contact, phone: " " },
    { ...contact, phone: "600\n111" },
    { ...contact, phone: null, email: "invalid" },
    { ...contact, phone: null, email: "a@@example.com" },
    { ...contact, confirmed_at: "2026-13-05T09:59:00.000Z" },
  ])
    assert.throws(() => validateContractV2("contactRequest", dto), {
      code: "invalid_payload",
    });
});
test("turno vacío/cíclico y nombre de contrato desconocido se rechazan", async () => {
  const { validateContractV2 } = await import("./contracts.js");
  const turn = JSON.parse(wire.vectors.at(-1).body_json);
  assert.throws(() => validateContractV2("textTurn", { ...turn, text: " " }), {
    code: "invalid_payload",
  });
  const cyclic = { ...turn };
  cyclic.self = cyclic;
  assert.throws(() => validateContractV2("textTurn", cyclic), {
    code: "invalid_payload",
  });
  assert.throws(() => validateContractV2("Unknown", turn), {
    code: "invalid_payload",
  });
});
