import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
  timingSafeEqual,
} from "node:crypto";
import { mobileConfig } from "../mobile-config.js";
export const digest = (value) =>
  createHash("sha256").update(value).digest("hex");
export function sameDigest(a, b) {
  return (
    typeof a === "string" &&
    typeof b === "string" &&
    /^[a-f0-9]{64}$/.test(a) &&
    /^[a-f0-9]{64}$/.test(b) &&
    timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"))
  );
}
export function createMobileCrypto(encodedKey) {
  const key = Buffer.from(encodedKey || "", "base64");
  if (key.length !== 32)
    throw new Error("Falta una clave móvil de cifrado de 32 bytes");
  return {
    seal(value, purpose) {
      const iv = randomBytes(12);
      const cipher = createCipheriv("aes-256-gcm", key, iv);
      cipher.setAAD(Buffer.from(`gestadia:${purpose}`));
      const data = Buffer.concat([
        cipher.update(value, "utf8"),
        cipher.final(),
      ]);
      return [
        "v1",
        iv.toString("base64url"),
        cipher.getAuthTag().toString("base64url"),
        data.toString("base64url"),
      ].join(".");
    },
    open(value, purpose) {
      const [version, iv, tag, data, ...extra] = String(value).split(".");
      if (version !== "v1" || extra.length || !iv || !tag || data === undefined)
        throw new Error("Credencial cifrada inválida");
      const decipher = createDecipheriv(
        "aes-256-gcm",
        key,
        Buffer.from(iv, "base64url"),
      );
      decipher.setAAD(Buffer.from(`gestadia:${purpose}`));
      decipher.setAuthTag(Buffer.from(tag, "base64url"));
      return Buffer.concat([
        decipher.update(Buffer.from(data, "base64url")),
        decipher.final(),
      ]).toString("utf8");
    },
  };
}
export const sealCredential = (value, purpose) =>
  createMobileCrypto(mobileConfig.encryptionKey).seal(value, purpose);
export const openCredential = (value, purpose) =>
  createMobileCrypto(mobileConfig.encryptionKey).open(value, purpose);
