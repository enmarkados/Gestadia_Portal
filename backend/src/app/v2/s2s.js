import { createHash, createHmac, randomBytes } from "node:crypto";
import { AppProblem } from "../problem.js";
import { validateContractV2, UUID_V2, REVISION_V2 } from "./contracts.js";
const PREFIX = "/api/integrations/lidia/app/v2";
const ID = "[A-Za-z0-9_-]{1,128}",
  UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const IDEM = /^[A-Za-z0-9._:-]{16,128}$/;
const actorPattern = new RegExp(`^(guest|account):${UUID}$`);
const bad = () => {
  throw new AppProblem(400, "invalid_payload");
};
const unavailable = () => {
  throw new AppProblem(503, "runtime_unavailable");
};
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const encode = (v) =>
  encodeURIComponent(v).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
function positive(v) {
  return typeof v === "string" && /^[1-9][0-9]{0,19}$/.test(v);
}
export function canonicalQueryV2(path, query = {}) {
  if (!query || typeof query !== "object" || Array.isArray(query)) bad();
  const keys = Object.keys(query);
  if (/\/timeline$/.test(path)) {
    if (
      keys.some((k) => !["cursor", "limit", "turn_id"].includes(k)) ||
      ("turn_id" in query && keys.length !== 1)
    )
      bad();
    if (
      "limit" in query &&
      !/^(?:[1-9]|[1-9][0-9]|100)$/.test(String(query.limit))
    )
      bad();
    if ("turn_id" in query && !UUID_V2.test(query.turn_id)) bad();
    if (
      "cursor" in query &&
      (typeof query.cursor !== "string" ||
        !/^[\x20-\x7e]{1,2048}$/.test(query.cursor))
    )
      bad();
  } else if (/\/message-receipts$/.test(path)) {
    if (
      keys.length !== 1 ||
      keys.some((k) => !["message_ids", "turn_id", "summary"].includes(k))
    )
      bad();
    if ("turn_id" in query && !UUID_V2.test(query.turn_id)) bad();
    if ("summary" in query && query.summary !== "true") bad();
    if ("message_ids" in query) {
      if (typeof query.message_ids !== "string") bad();
      const ids = query.message_ids.split(",");
      if (
        ids.length > 50 ||
        new Set(ids).size !== ids.length ||
        ids.some((id) => !new RegExp(`^${ID}$`).test(id))
      )
        bad();
    }
  } else if (new RegExp(`/contact-requests/${UUID}$`).test(path)) {
    if (keys.length !== 1 || !positive(query.intent_revision)) bad();
  } else if (new RegExp(`^/subjects/${UUID}/operations$`).test(path)) {
    if (
      keys.length !== 2 ||
      query.operation !== "session" ||
      !IDEM.test(query.idempotency_key)
    )
      bad();
  } else if (keys.length) bad();
  return keys
    .sort()
    .map((k) => `${encode(k)}=${encode(String(query[k]))}`)
    .join("&");
}
export function signRequestV2(fields, bodyBytes, secretBytes) {
  if (!Buffer.isBuffer(secretBytes) || secretBytes.length < 32) unavailable();
  const {
    audience,
    key_id,
    timestamp,
    nonce,
    method,
    encoded_path,
    canonical_query,
    subject,
    actor,
    access_revision,
    idempotency_key,
  } = fields;
  if (
    [
      audience,
      key_id,
      timestamp,
      nonce,
      method,
      encoded_path,
      canonical_query,
      subject,
      actor,
      access_revision,
      idempotency_key,
    ].some((v) => typeof v !== "string")
  )
    bad();
  if (
    !/^[-A-Za-z0-9:._]{1,128}$/.test(audience) ||
    !/^[A-Za-z0-9_-]{1,64}$/.test(key_id) ||
    !/^(0|[1-9][0-9]{0,12})$/.test(timestamp) ||
    !/^[0-9a-f]{32}$/.test(nonce) ||
    !UUID_V2.test(subject) ||
    !actorPattern.test(actor) ||
    !REVISION_V2.test(access_revision) ||
    !["POST", "GET"].includes(method) ||
    typeof encoded_path !== "string" ||
    !encoded_path.startsWith(PREFIX + "/") ||
    !/^\/[A-Za-z0-9_/-]+$/.test(encoded_path) ||
    typeof canonical_query !== "string" ||
    !Buffer.isBuffer(bodyBytes)
  )
    bad();
  if (bodyBytes.length > 32768) throw new AppProblem(413, "payload_too_large");
  if (method === "POST") {
    if (!IDEM.test(idempotency_key) || canonical_query !== "") bad();
  } else {
    if (idempotency_key !== "" || bodyBytes.length) bad();
    const params = new URLSearchParams(canonical_query),
      pairs = [...params];
    if (
      new Set(pairs.map(([k]) => k)).size !== pairs.length ||
      canonicalQueryV2(
        encoded_path.slice(PREFIX.length),
        Object.fromEntries(pairs),
      ) !== canonical_query
    )
      bad();
  }
  const body_sha256 = sha256(bodyBytes);
  const canonical = [
    "gestadia-app-s2s-v2",
    audience,
    key_id,
    timestamp,
    nonce,
    method,
    encoded_path,
    canonical_query,
    subject,
    actor,
    access_revision,
    idempotency_key,
    body_sha256,
  ].join("\n");
  return {
    canonical,
    body_sha256,
    signature: `app-v2=${createHmac("sha256", secretBytes).update(canonical, "utf8").digest("hex")}`,
  };
}
// Only routes with an explicit v2 capability are transport-enabled here.
function route(method, path, dto) {
  if (method === "POST" && path === "/sessions")
    return ["app.sessions.write", "session"];
  const m = new RegExp(
    `^/sessions/${ID}/(turns|timeline|context|bindings|message-receipts|handoff)$`,
  ).exec(path);
  if (m) {
    if (method === "GET" && m[1] === "timeline") return ["app.timeline.read"];
    if (method === "GET" && m[1] === "message-receipts")
      return ["app.timeline.read"];
    if (method === "POST")
      return {
        turns: [
          "app.turns.write",
          dto?.kind === "text" ? "textTurn" : "actionTurn",
        ],
        context: ["app.context.attest", "context"],
        bindings: ["app.bindings.write", "binding"],
        "message-receipts": ["app.turns.write", "messageReceiptAck"],
        handoff: ["app.handoff.request", "handoff"],
      }[m[1]];
  }
  if (
    method === "GET" &&
    new RegExp(`^/sessions/${ID}/bindings/${UUID}$`).test(path)
  )
    return ["app.bindings.read"];
  if (
    method === "GET" &&
    (new RegExp(`^/sessions/${ID}/operations/${UUID}$`).test(path) ||
      new RegExp(`^/subjects/${UUID}/operations$`).test(path))
  )
    return ["app.timeline.read"];
  if (
    method === "POST" &&
    new RegExp(`^/subjects/${UUID}/revocations$`).test(path)
  )
    return ["app.subjects.revoke", "revocation"];
}
function authorityMatches(name, dto, authority, path) {
  if (
    dto?.conversation_subject_id &&
    dto.conversation_subject_id !== authority.subject
  )
    bad();
  if (
    name === "session" &&
    `${dto.identity.kind}:${dto.identity.actor_id}` !== authority.actor
  )
    bad();
  if (
    name === "context" &&
    authority.actor.startsWith("guest:") &&
    (dto.permissions.some((p) => !["sondeo", "history"].includes(p)) ||
      dto.case_ref !== null ||
      dto.commercial_assignment_ref !== null ||
      dto.manager_assignment_ref !== null)
  )
    throw new AppProblem(403, "capability_denied");
  if (name === "binding") {
    const expectedActor =
      dto.phase === "prepare"
        ? `guest:${dto.source_guest_id}`
        : `account:${dto.target_portal_user_id}`;
    if (
      authority.actor !== expectedActor ||
      dto.expected_access_revision !== authority.access_revision ||
      dto.verified_account_identity.actor_id !== dto.target_portal_user_id
    )
      bad();
  }
  if (
    name === "revocation" &&
    (path !== `/subjects/${authority.subject}/revocations` ||
      (dto.scope === "account" && !authority.actor.startsWith("account:")) ||
      (dto.scope === "guest" && !authority.actor.startsWith("guest:")))
  )
    bad();
  if (name === "handoff" && authority.actor.startsWith("guest:"))
    throw new AppProblem(403, "capability_denied");
}
const upstreamCodes = new Set([
  "invalid_payload",
  "conversation_not_found",
  "capability_denied",
  "stale_access",
  "stale_action",
  "binding_in_progress",
  "binding_blocked",
  "binding_conflict",
  "idempotency_conflict",
  "conversation_subject_conflict",
  "contact_request_conflict",
  "identity_link_required",
  "receipt_retired",
  "operation_retired",
  "authority_unavailable",
  "rate_limited",
  "outcome_unknown",
  "runtime_unavailable",
]);
export class AppS2SClientV2 {
  constructor(
    config = {},
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
    authority,
    dto,
    { idempotencyKey, query = {}, validateResponse } = {},
  ) {
    const c = this.config;
    if (c.enabled !== true || typeof validateResponse !== "function")
      unavailable();
    const selected = route(method, path, dto);
    if (
      !selected ||
      selected[0] !== capability ||
      !authority ||
      typeof authority.subject !== "string" ||
      !UUID_V2.test(authority.subject) ||
      typeof authority.actor !== "string" ||
      !actorPattern.test(authority.actor) ||
      typeof authority.access_revision !== "string" ||
      !REVISION_V2.test(authority.access_revision)
    )
      bad();
    if (
      Object.keys(authority).length !== 3 ||
      Object.keys(authority).some(
        (k) => !["subject", "actor", "access_revision"].includes(k),
      )
    )
      bad();
    if (!query || typeof query !== "object" || Array.isArray(query)) bad();
    if (
      method === "GET" &&
      path.startsWith("/subjects/") &&
      path !== `/subjects/${authority.subject}/operations`
    )
      bad();
    if (
      authority.actor.startsWith("guest:") &&
      c.guestEnabled !== true &&
      capability !== "app.subjects.revoke"
    )
      unavailable();
    let base;
    try {
      base = new URL(c.baseUrl);
    } catch {
      unavailable();
    }
    const key = c.keys?.[capability];
    if (
      base.protocol !== "https:" ||
      base.username ||
      base.password ||
      base.pathname !== "/" ||
      base.search ||
      base.hash ||
      typeof c.integrationId !== "string" ||
      !/^[-A-Za-z0-9:._]{1,128}$/.test(c.integrationId) ||
      typeof c.audience !== "string" ||
      !/^[-A-Za-z0-9:._]{1,128}$/.test(c.audience) ||
      typeof key?.keyId !== "string" ||
      !/^[A-Za-z0-9_-]{1,64}$/.test(key.keyId) ||
      typeof key?.secretBase64 !== "string" ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
        key.secretBase64,
      )
    )
      unavailable();
    const secret = Buffer.from(key.secretBase64, "base64");
    if (secret.length < 32) unavailable();
    let body, qs;
    if (method === "POST") {
      if (Object.keys(query).length || !IDEM.test(idempotencyKey)) bad();
      validateContractV2(selected[1], dto);
      authorityMatches(selected[1], dto, authority, path);
      body = Buffer.from(JSON.stringify(dto), "utf8");
      qs = "";
    } else {
      if (dto !== undefined || idempotencyKey !== undefined) bad();
      body = Buffer.alloc(0);
      qs = canonicalQueryV2(path, query);
    }
    const timestamp = String(Math.floor(this.clock() / 1000)),
      nonce = this.nonce();
    const signed = signRequestV2(
      {
        audience: c.audience,
        key_id: key.keyId,
        timestamp,
        nonce,
        method,
        encoded_path: PREFIX + path,
        canonical_query: qs,
        subject: authority.subject,
        actor: authority.actor,
        access_revision: authority.access_revision,
        idempotency_key: method === "POST" ? idempotencyKey : "",
      },
      body,
      secret,
    );
    const headers = {
      "X-Gestadia-Key-Id": key.keyId,
      "X-Gestadia-Timestamp": timestamp,
      "X-Gestadia-Nonce": nonce,
      "X-Gestadia-Subject": authority.subject,
      "X-Gestadia-Actor": authority.actor,
      "X-Gestadia-Access-Revision": authority.access_revision,
      "X-Gestadia-Signature": signed.signature,
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
      if (res.status >= 300 && res.status < 400) throw new Error("redirect");
      const chunks = [];
      let size = 0;
      for await (const chunk of res.body) {
        size += chunk.length;
        if (size > 1048576) throw new Error("limit");
        chunks.push(chunk);
      }
      const bytes = Buffer.concat(chunks);
      if (bytes.subarray(0, 3).equals(Buffer.from([239, 187, 191])))
        throw new Error("BOM");
      data = JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(bytes),
      );
    } catch {
      throw new AppProblem(502, "invalid_upstream_response");
    }
    if (!res.ok)
      throw new AppProblem(
        res.status === 401 ? 503 : res.status,
        res.status !== 401 && upstreamCodes.has(data?.code)
          ? data.code
          : "runtime_unavailable",
      );
    try {
      if ((await validateResponse(data)) !== true) throw new Error("invalid");
    } catch {
      throw new AppProblem(502, "invalid_upstream_response");
    }
    return { status: res.status, data };
  }
}
