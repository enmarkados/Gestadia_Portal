import { test } from "node:test";
import assert from "node:assert/strict";
let createMobileCrypto;
try {
  ({ createMobileCrypto } = await import("./mobile-crypto.js"));
} catch {}
test("cifra credenciales y detecta manipulación o contexto ajeno", () => {
  assert.equal(typeof createMobileCrypto, "function", "Falta cifrado móvil");
  const box = createMobileCrypto(Buffer.alloc(32, 7).toString("base64"));
  const encrypted = box.seal("private-token", "push");
  assert.ok(!encrypted.includes("private-token"));
  assert.equal(box.open(encrypted, "push"), "private-token");
  assert.throws(() => box.open(encrypted, "apple"));
  const parts = encrypted.split(".");
  parts[3] = Buffer.from("tampered").toString("base64url");
  assert.throws(() => box.open(parts.join("."), "push"));
});
test("una clave ausente o corta no usa secretos alternativos", () => {
  assert.equal(typeof createMobileCrypto, "function", "Falta cifrado móvil");
  assert.throws(() => createMobileCrypto(""));
  assert.throws(() => createMobileCrypto("short"));
});
