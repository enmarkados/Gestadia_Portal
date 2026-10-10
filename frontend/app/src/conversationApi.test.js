import { beforeEach, afterEach, it, expect, vi } from "vitest";
import {
  conversationApi,
  rememberPending,
  readPending,
  clearConversationStorage,
} from "./conversationApi.js";
import { setToken } from "./api.js";
beforeEach(() => {
  sessionStorage.clear();
  window.GESTADIA_APP_CONFIG = { demoOnly: false, conversationsEnabled: true };
  setToken("ga_test");
});
afterEach(() => vi.unstubAllGlobals());
it("el móvil envía acciones versionadas sólo a Portal y conserva turn_id en retry", async () => {
  const calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, opts) => {
      calls.push({ url, opts });
      return {
        ok: true,
        status: 202,
        json: async () => ({ id: "op", status: "admitted" }),
      };
    }),
  );
  const dto = {
    turn_id: "33333333-3333-4333-8333-333333333333",
    kind: "action",
    presentation_id: "offer",
    presentation_revision: "2",
    action_id: "yes",
  };
  await conversationApi.turn("local-conversation", dto);
  await conversationApi.turn("local-conversation", dto);
  expect(calls.map((x) => x.url)).toEqual([
    "/api/app/v1/conversations/local-conversation/turns",
    "/api/app/v1/conversations/local-conversation/turns",
  ]);
  expect(calls[0].opts.body).toBe(calls[1].opts.body);
  expect(JSON.parse(calls[0].opts.body)).toEqual(dto);
  expect(calls[0].opts.headers.get("X-Gestadia-Signature")).toBeNull();
});
it("pendiente se recupera sólo dentro de su cuenta y logout borra el almacenamiento de conversación", () => {
  rememberPending("u1", "c1", { turn_id: "fixed", text: "consulta" });
  expect(readPending("u1", "c1").text).toBe("consulta");
  expect(readPending("u2", "c1")).toBeNull();
  clearConversationStorage();
  expect(readPending("u1", "c1")).toBeNull();
});
it("demo o feature inactiva bloquean cualquier fetch", async () => {
  const f = vi.fn();
  vi.stubGlobal("fetch", f);
  window.GESTADIA_APP_CONFIG.conversationsEnabled = false;
  await expect(conversationApi.list()).rejects.toThrow();
  expect(f).not.toHaveBeenCalled();
});
