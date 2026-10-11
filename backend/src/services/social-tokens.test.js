import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPair, SignJWT, exportJWK, createLocalJWKSet } from "jose";
import { createHash } from "node:crypto";
let createSocialTokenVerifier;
try {
  ({ createSocialTokenVerifier } = await import("./social-tokens.js"));
} catch {}
const { privateKey, publicKey } = await generateKeyPair("RS256");
const jwk = await exportJWK(publicKey);
jwk.kid = "fixture";
const keys = createLocalJWKSet({ keys: [jwk] });
const date = new Date("2026-10-08T10:00:00Z");
const attempt = {
  provider: "google",
  audience: "fixture.apps.googleusercontent.com",
  nonceHash: createHash("sha256").update("nonce-fixture").digest("hex"),
};
async function token(overrides = {}) {
  return new SignJWT({
    sub: "stable-subject",
    email: "ana@example.com",
    email_verified: true,
    nonce: "nonce-fixture",
    ...overrides,
  })
    .setProtectedHeader({ alg: "RS256", kid: "fixture" })
    .setIssuer(overrides.iss || "https://accounts.google.com")
    .setAudience(overrides.aud || attempt.audience)
    .setExpirationTime(new Date(overrides.exp || "2026-10-08T10:05:00Z"))
    .sign(privateKey);
}
test("valida firma y devuelve sujeto estable, correo verificado y emisor", async () => {
  assert.equal(
    typeof createSocialTokenVerifier,
    "function",
    "Falta la verificación social",
  );
  const verify = createSocialTokenVerifier({
    keySets: { google: keys },
    now: () => date,
  });
  const claims = await verify(attempt, await token());
  assert.equal(claims.subject, "stable-subject");
  assert.equal(claims.email, "ana@example.com");
  assert.equal(claims.issuer, "https://accounts.google.com");
});
for (const [name, overrides] of [
  ["audiencia ajena", { aud: "other" }],
  ["emisor ajeno", { iss: "https://evil.example" }],
  ["nonce ajeno", { nonce: "other" }],
  ["token vencido", { exp: "2026-10-08T09:59:00Z" }],
])
  test(`rechaza ${name} aunque la firma sea válida`, async () => {
    assert.equal(
      typeof createSocialTokenVerifier,
      "function",
      "Falta la verificación social",
    );
    await assert.rejects(
      createSocialTokenVerifier({ keySets: { google: keys }, now: () => date })(
        attempt,
        await token(overrides),
      ),
    );
  });
test("correo no verificado no permite alta aunque se identifique al sujeto", async () => {
  assert.equal(
    typeof createSocialTokenVerifier,
    "function",
    "Falta la verificación social",
  );
  const claims = await createSocialTokenVerifier({
    keySets: { google: keys },
    now: () => date,
  })(attempt, await token({ email_verified: false }));
  assert.equal(claims.email, null);
});
test("un ID token con firma manipulada nunca valida", async () => {
  assert.equal(
    typeof createSocialTokenVerifier,
    "function",
    "Falta la verificación social",
  );
  const good = await token();
  const parts = good.split(".");
  parts[2] = Buffer.from("invalid").toString("base64url");
  await assert.rejects(
    createSocialTokenVerifier({ keySets: { google: keys }, now: () => date })(
      attempt,
      parts.join("."),
    ),
  );
});
