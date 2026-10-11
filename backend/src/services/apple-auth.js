import { readFile } from "node:fs/promises";
import { importPKCS8, SignJWT } from "jose";
import { mobileConfig } from "../mobile-config.js";
async function clientSecret(audience) {
  const c = mobileConfig.apple;
  if (
    ![c.clientId, c.serviceId].includes(audience) ||
    !c.keyId ||
    !c.teamId ||
    !c.privateKeyFile
  )
    throw new Error("Apple no configurado");
  const key = await importPKCS8(
    await readFile(c.privateKeyFile, "utf8"),
    "ES256",
  );
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: c.keyId })
    .setIssuer(c.teamId)
    .setSubject(audience)
    .setAudience("https://appleid.apple.com")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(key);
}
export async function exchangeApple(code, audience, redirectUrl) {
  if (typeof code !== "string" || !code || code.length > 4096)
    throw new Error("Código Apple inválido");
  const body = new URLSearchParams({
    client_id: audience,
    client_secret: await clientSecret(audience),
    code,
    grant_type: "authorization_code",
  });
  if (redirectUrl) body.set("redirect_uri", redirectUrl);
  const response = await fetch("https://appleid.apple.com/auth/token", {
    method: "POST",
    body,
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Apple rechazó el intercambio");
  return response.json();
}
export async function revokeApple(token, audience) {
  const response = await fetch("https://appleid.apple.com/auth/revoke", {
    method: "POST",
    body: new URLSearchParams({
      client_id: audience,
      client_secret: await clientSecret(audience),
      token,
      token_type_hint: "refresh_token",
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Revocación Apple pendiente");
}

// Limpieza durable de intentos abandonados: revoca primero la concesión Apple.
// Un intento consumido pertenece a SocialIdentity y su revocación usa esa fila.
export async function cleanExpiredSocialAttempts(db, now = new Date()) {
  const rows = await db.socialAuthAttempt.findMany({
    where: { expiresAt: { lt: now }, status: { not: "consumed" } },
    take: 100,
  });
  const { openCredential } = await import("./mobile-crypto.js");
  for (const row of rows) {
    try {
      if (row.appleRefreshEncrypted && row.claims?.subject)
        await revokeApple(
          openCredential(
            row.appleRefreshEncrypted,
            `apple:${row.claims.subject}`,
          ),
          row.audience,
        );
      await db.socialAuthAttempt.deleteMany({
        where: {
          id: row.id,
          status: { not: "consumed" },
          expiresAt: { lt: now },
        },
      });
    } catch {
      console.error("[social] limpieza pendiente");
    }
  }
  await db.socialAuthAttempt.deleteMany({
    where: {
      status: "consumed",
      consumedAt: { lt: new Date(now.getTime() - 86400000) },
    },
  });
}
