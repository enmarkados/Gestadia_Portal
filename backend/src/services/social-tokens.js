import { jwtVerify, createRemoteJWKSet } from "jose";
import { createHash, timingSafeEqual } from "node:crypto";
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const APPLE_ISSUER = "https://appleid.apple.com";
export function createSocialTokenVerifier({
  keySets = {},
  now = () => new Date(),
} = {}) {
  const google =
    keySets.google ||
    createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"), {
      timeoutDuration: 5000,
    });
  const apple =
    keySets.apple ||
    createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"), {
      timeoutDuration: 5000,
    });
  return async (attempt, idToken) => {
    if (
      !["apple", "google"].includes(attempt.provider) ||
      typeof idToken !== "string" ||
      idToken.length > 16384
    )
      throw new Error("Identidad inválida");
    const isApple = attempt.provider === "apple";
    const { payload } = await jwtVerify(idToken, isApple ? apple : google, {
      issuer: isApple ? APPLE_ISSUER : GOOGLE_ISSUERS,
      audience: attempt.audience,
      algorithms: ["RS256"],
      currentDate: now(),
      requiredClaims: ["sub", "exp", "iss", "aud", "nonce"],
    });
    if (
      typeof payload.nonce !== "string" ||
      typeof payload.sub !== "string" ||
      !payload.sub ||
      payload.sub.length > 191
    )
      throw new Error("Identidad inválida");
    const hash = createHash("sha256").update(payload.nonce).digest("hex");
    if (
      !/^[a-f0-9]{64}$/.test(attempt.nonceHash) ||
      !timingSafeEqual(
        Buffer.from(hash, "hex"),
        Buffer.from(attempt.nonceHash, "hex"),
      )
    )
      throw new Error("Desafío inválido");
    const verified =
      payload.email_verified === true || payload.email_verified === "true";
    const email =
      verified &&
      typeof payload.email === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) &&
      payload.email.length <= 191
        ? payload.email.toLowerCase()
        : null;
    return {
      issuer: isApple ? APPLE_ISSUER : GOOGLE_ISSUERS[0],
      subject: payload.sub,
      email,
      name: typeof payload.name === "string" ? payload.name.slice(0, 100) : "",
    };
  };
}
export const verifySocialToken = createSocialTokenVerifier();
