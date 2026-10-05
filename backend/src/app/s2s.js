import { createHash, createHmac, randomBytes } from "node:crypto";
import { UUID, IDEM } from "./contracts.js";
import { AppProblem } from "./problem.js";
const PREFIX = "/api/integrations/lidia/app/v1";
const allowed =
  /^\/(sessions|sessions\/[A-Za-z0-9_-]{1,128}\/(turns|timeline|handoff|context)|subjects\/[0-9a-f-]{36}\/revocations)$/;
export const sha256 = (bytes) =>
  createHash("sha256").update(bytes).digest("hex");
// JCS for validated contract values: finite numbers, well-formed Unicode and plain JSON.
export function canonicalJson(value) {
  if (typeof value === "string" && !value.isWellFormed())
    throw new AppProblem(400, "invalid_payload");
  if (typeof value === "number" && !Number.isFinite(value))
    throw new AppProblem(400, "invalid_payload");
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((k) => `${canonicalJson(k)}:${canonicalJson(value[k])}`)
    .join(",")}}`;
}
export function semanticHash(operation, subject, conversationId, dto) {
  const normalized = { ...dto };
  delete normalized.correlation_id;
  if (operation === "session")
    for (const k of ["resume_conversation_id", "case_ref", "client_key"])
      normalized[k] ??= null;
  if (operation === "context")
    normalized.permissions = [...normalized.permissions].sort();
  return sha256(
    canonicalJson({
      operation,
      subject,
      conversation_id: conversationId || "",
      dto: normalized,
    }),
  );
}
const encode = (v) =>
  encodeURIComponent(v).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
export function canonicalQuery(query = {}) {
  const keys = Object.keys(query);
  if (
    keys.some((k) => !["cursor", "limit", "turn_id"].includes(k)) ||
    ("turn_id" in query && keys.length !== 1)
  )
    throw new AppProblem(400, "invalid_payload");
  if (
    "limit" in query &&
    !/^(?:[1-9]|[1-9][0-9]|100)$/.test(String(query.limit))
  )
    throw new AppProblem(400, "invalid_payload");
  if ("turn_id" in query && !UUID.test(query.turn_id))
    throw new AppProblem(400, "invalid_payload");
  if (
    "cursor" in query &&
    (typeof query.cursor !== "string" ||
      !/^[\x20-\x7e]{1,2048}$/.test(query.cursor))
  )
    throw new AppProblem(400, "invalid_payload");
  return keys
    .sort()
    .map((k) => `${encode(k)}=${encode(String(query[k]))}`)
    .join("&");
}
export function signRequest(fields, bodyBytes, secretBytes) {
  if (secretBytes.length < 32) throw new AppProblem(503, "runtime_unavailable");
  const digest = sha256(bodyBytes);
  const canonical = [
    fields.domain || "gestadia-app-s2s-v1",
    fields.audience,
    fields.key_id,
    fields.timestamp,
    fields.nonce,
    fields.method,
    fields.encoded_path,
    fields.canonical_query || "",
    fields.subject,
    fields.idempotency_key || "",
    digest,
  ].join("\n");
  return {
    canonical,
    body_sha256: digest,
    signature: createHmac("sha256", secretBytes)
      .update(canonical, "utf8")
      .digest("hex"),
  };
}
const upstreamCodes = new Set([
  "invalid_payload",
  "invalid_context",
  "capability_denied",
  "identity_link_required",
  "conversation_not_found",
  "turn_not_found",
  "stale_action",
  "idempotency_conflict",
  "context_conflict",
  "stale_context",
  "case_context_conflict",
  "operation_retired",
  "receipt_retired",
  "cursor_expired",
  "routing_unavailable",
  "rate_limited",
  "runtime_unavailable",
  "conversation_closed",
]);
export class AppS2SClient {
  constructor(
    config,
    {
      fetchImpl = fetch,
      clock = () => Date.now(),
      nonce = () => randomBytes(16).toString("hex"),
    } = {},
  ) {
    Object.assign(this, { config, fetchImpl, clock, nonce });
  }
  async call(
    capability,
    method,
    path,
    subject,
    dto,
    { idempotencyKey, query = {} } = {},
  ) {
    const c = this.config;
    if (!c.enabled) throw new AppProblem(503, "runtime_unavailable");
    let base;
    try {
      base = new URL(c.baseUrl);
    } catch {
      throw new AppProblem(503, "runtime_unavailable");
    }
    const key = c.keys?.[capability];
    if (
      base.protocol !== "https:" ||
      base.username ||
      base.password ||
      base.pathname !== "/" ||
      base.search ||
      base.hash ||
      !c.integrationId ||
      !/^[-A-Za-z0-9:._]{1,128}$/.test(c.audience || "") ||
      !/^[-A-Za-z0-9_]{1,64}$/.test(key?.keyId || "")
    )
      throw new AppProblem(503, "runtime_unavailable");
    if (
      !allowed.test(path) ||
      !UUID.test(subject) ||
      (method !== "POST" && method !== "GET") ||
      (method === "GET" && !path.endsWith("/timeline")) ||
      (method === "POST" &&
        (path.endsWith("/timeline") ||
          Object.keys(query).length ||
          !IDEM.test(idempotencyKey)))
    )
      throw new AppProblem(400, "invalid_payload");
    const secretText = key.secretBase64 || "";
    if (
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
        secretText,
      )
    )
      throw new AppProblem(503, "runtime_unavailable");
    const secret = Buffer.from(secretText, "base64");
    const body =
      method === "GET"
        ? Buffer.alloc(0)
        : Buffer.from(JSON.stringify(dto), "utf8");
    if (body.length > 32768) throw new AppProblem(413, "payload_too_large");
    const qs = canonicalQuery(query),
      timestamp = String(Math.floor(this.clock() / 1000)),
      nonce = this.nonce();
    const { signature } = signRequest(
      {
        audience: c.audience,
        key_id: key.keyId,
        timestamp,
        nonce,
        method,
        encoded_path: PREFIX + path,
        canonical_query: qs,
        subject,
        idempotency_key: method === "POST" ? idempotencyKey : "",
      },
      body,
      secret,
    );
    const headers = {
      "X-Gestadia-Key-Id": key.keyId,
      "X-Gestadia-Timestamp": timestamp,
      "X-Gestadia-Nonce": nonce,
      "X-Gestadia-Subject": subject,
      "X-Gestadia-Signature": `app-v1=${signature}`,
      Accept: "application/json",
    };
    if (method === "POST")
      Object.assign(headers, {
        "Idempotency-Key": idempotencyKey,
        "Content-Type": "application/json",
      });
    let res;
    try {
      res = await this.fetchImpl(
        `${base.origin}${PREFIX}${path}${qs ? "?" + qs : ""}`,
        {
          method,
          headers,
          ...(method === "POST" ? { body } : {}),
          redirect: "manual",
          signal: AbortSignal.timeout(c.timeoutMs || 15000),
        },
      );
    } catch {
      throw new AppProblem(503, "outcome_unknown");
    }
    let data;
    try {
      const chunks = [];
      let size = 0;
      for await (const chunk of res.body) {
        size += chunk.length;
        if (size > 1048576) throw new Error("limit");
        chunks.push(chunk);
      }
      data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      throw new AppProblem(502, "invalid_upstream_response");
    }
    if (!res.ok)
      throw new AppProblem(
        res.status === 401 ? 503 : res.status,
        upstreamCodes.has(data.code) ? data.code : "runtime_unavailable",
      );
    return { status: res.status, data };
  }
}
