import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import { AppProblem } from "../problem.js";
const schema = JSON.parse(
  readFileSync(new URL("./contracts/app-v2-schema.json", import.meta.url)),
);
const ajv = new Ajv2020({
  strict: false,
  coerceTypes: false,
  removeAdditional: false,
});
ajv.addSchema(schema);
const validators = new Map(
  Object.keys(schema.$defs).map((name) => [
    name,
    ajv.compile({ $ref: `${schema.$id}#/$defs/${name}` }),
  ]),
);
const dates = new Set([
  "attested_at",
  "expires_at",
  "verified_at",
  "validated_at",
  "confirmed_at",
  "persisted_at",
]);
function validValues(value, seen = new Set(), depth = 0) {
  if (depth > 32) return false;
  if (typeof value === "string") return value.isWellFormed();
  if (!value || typeof value !== "object") return true;
  if (seen.has(value)) return false;
  seen.add(value);
  const valid = Object.entries(value).every(([key, v]) => {
    if (!key.isWellFormed() || !validValues(v, seen, depth + 1)) return false;
    if (dates.has(key)) {
      const date = new Date(v);
      return (
        typeof v === "string" &&
        Number.isFinite(date.getTime()) &&
        date.toISOString() === v
      );
    }
    return true;
  });
  seen.delete(value);
  return valid;
}
export function validateContractV2(name, dto) {
  const valid = validators.get(name);
  const bad = () => {
    throw new AppProblem(400, "invalid_payload");
  };
  if (!valid || !validValues(dto) || !valid(dto)) bad();
  if (name === "textTurn" && !dto.text.trim()) bad();
  if (
    name === "messageReceiptAck" &&
    dto.message_ids.some((id) => !/^[A-Za-z0-9_-]{1,128}$/.test(id))
  )
    bad();
  if (name === "session" && dto.identity.kind === "guest") {
    const ttl =
      new Date(dto.identity.expires_at) - new Date(dto.identity.attested_at);
    if (ttl <= 0 || ttl > 86400000) bad();
  }
  if (name === "contactRequest") {
    const controls = /[\x00-\x1f\x7f]/;
    if (
      !dto.name.trim() ||
      controls.test(dto.name) ||
      (!dto.phone && !dto.email)
    )
      bad();
    if (
      dto.phone !== null &&
      (controls.test(dto.phone) ||
        !/^\+?[0-9][0-9 ()-]*$/.test(dto.phone.trim()))
    )
      bad();
    if (
      dto.email !== null &&
      (controls.test(dto.email) || !/^[^@\s]+@[^@\s]+$/.test(dto.email))
    )
      bad();
  }
  return true;
}
export const UUID_V2 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const REVISION_V2 = /^(0|[1-9][0-9]{0,19})$/;
