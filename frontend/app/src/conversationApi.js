import { request, demoOnly } from "./api.js";
export const conversationsEnabled = () =>
  !demoOnly() && globalThis.GESTADIA_APP_CONFIG?.conversationsEnabled === true;
const prefix = "gestadia_app_conversation_v1:";
const storageKey = (user, id) => `${prefix}${user}:${id}`;
export function rememberPending(user, id, dto) {
  sessionStorage.setItem(storageKey(user, id), JSON.stringify(dto));
}
export function readPending(user, id) {
  try {
    return JSON.parse(sessionStorage.getItem(storageKey(user, id)) || "null");
  } catch {
    return null;
  }
}
export function clearPending(user, id) {
  sessionStorage.removeItem(storageKey(user, id));
}
export function clearConversationStorage() {
  for (const key of Object.keys(sessionStorage))
    if (key.startsWith(prefix)) sessionStorage.removeItem(key);
}
async function call(path, options = {}) {
  if (!conversationsEnabled())
    throw new Error("Las conversaciones conectadas no están habilitadas.");
  return request(`/api/app/v1${path}`, options);
}
const post = (path, body, extra = {}) =>
  call(path, { method: "POST", body: JSON.stringify(body), ...extra });
export const conversationApi = {
  list: () => call("/conversations"),
  start: (purpose, caseRef, key) =>
    post(
      "/conversations",
      { purpose, case_ref: caseRef || null },
      { headers: { "Idempotency-Key": key } },
    ),
  timeline: (id, query = {}) => {
    const q = new URLSearchParams(query);
    return call(
      `/conversations/${encodeURIComponent(id)}/timeline${q.size ? "?" + q : ""}`,
    );
  },
  turn: (id, dto) =>
    post(`/conversations/${encodeURIComponent(id)}/turns`, dto),
  handoff: (id, target, key) =>
    post(
      `/conversations/${encodeURIComponent(id)}/handoff`,
      { target_kind: target, reason: "Atención solicitada desde la APP" },
      { headers: { "Idempotency-Key": key } },
    ),
  operation: (id) => call(`/operations/${encodeURIComponent(id)}`),
  retry: (id) => post(`/operations/${encodeURIComponent(id)}/retry`, {}),
};
