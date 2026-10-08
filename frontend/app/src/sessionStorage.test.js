import { it, expect, vi } from "vitest";
import { createSessionStore } from "./sessionStorage.js";
function fixture() {
  const map = new Map();
  return {
    get: vi.fn(async (k) => map.get(k) || null),
    set: vi.fn(async (k, v) => map.set(k, v)),
    remove: vi.fn(async (k) => map.delete(k)),
  };
}
it("token nativo sólo en almacén seguro, revocación pendiente y sin restaurar sesión cerrada", async () => {
  const secure = fixture();
  let online = false;
  const revoke = vi.fn(async () => {
    if (!online) throw Error("offline");
  });
  const store = createSessionStore({ secure, revoke });
  await store.initialize();
  await store.set("secret");
  expect(store.get()).toBe("secret");
  await store.logout();
  expect(store.get()).toBe(null);
  const restarted = createSessionStore({ secure, revoke });
  await restarted.initialize();
  expect(restarted.get()).toBe(null);
  expect(secure.get).toHaveBeenCalledWith(
    "gestadia.pending-revocations",
    false,
    false,
  );
  online = true;
  await restarted.flush();
  expect(await secure.get("gestadia.pending-revocations")).toEqual([]);
});
it("escritura segura fallida no abre sesión y no restaura token antiguo", async () => {
  const secure = fixture();
  secure.set.mockRejectedValueOnce(Error("keychain"));
  const store = createSessionStore({ secure, revoke: vi.fn() });
  await expect(store.set("secret")).rejects.toThrow();
  expect(store.get()).toBe(null);
});

it("logout invalida escritura pendiente y encola el token nuevo para revocar", async () => {
  const secure = fixture();
  let release, started;
  const writing = new Promise((r) => (started = r));
  const original = secure.set;
  secure.set = vi.fn(async (k, v, ...args) => {
    if (k === "gestadia.session") {
      started();
      await new Promise((r) => (release = r));
    }
    return original(k, v, ...args);
  });
  const revoke = vi.fn();
  const store = createSessionStore({ secure, revoke });
  const login = store.set("late-session");
  await writing;
  const logout = store.logout();
  release();
  await Promise.allSettled([login, logout]);
  expect(store.get()).toBe(null);
  expect(revoke).toHaveBeenCalledWith("late-session");
});
it("demo conserva revocación del token guardado sin llamar al servidor", async () => {
  const secure = fixture();
  await secure.set("gestadia.session", "old-session");
  const revoke = vi.fn();
  const store = createSessionStore({ secure, revoke });
  await store.retireSaved();
  expect(store.get()).toBe(null);
  expect(await secure.get("gestadia.pending-revocations")).toEqual([
    "old-session",
  ]);
  expect(await secure.get("gestadia.session")).toBe(null);
  expect(revoke).not.toHaveBeenCalled();
});
it("logout offline devuelve estado pendiente, flush devuelve cierre completo al reconectar", async () => {
  const secure = fixture();
  let online = false;
  const store = createSessionStore({
    secure,
    revoke: async () => {
      if (!online) throw Error("offline");
    },
  });
  await store.set("session");
  expect(await store.logout()).toEqual({ pending: 1 });
  online = true;
  expect(await store.flush()).toEqual({ pending: 0 });
});
it("retoma revocaciones pendientes al reconectar y volver al primer plano", async () => {
  const { watchSessionRevocations } = await import("./sessionStorage.js");
  expect(typeof watchSessionRevocations).toBe("function");
  let foreground;
  const removed = vi.fn();
  const app = {
    addListener: vi.fn(async (_, cb) => {
      foreground = cb;
      return { remove: removed };
    }),
  };
  const target = new EventTarget();
  const store = { flush: vi.fn(async () => ({ pending: 0 })) };
  const status = vi.fn();
  const cleanup = await watchSessionRevocations({
    store,
    app,
    target,
    onStatus: status,
  });
  await Promise.resolve();
  target.dispatchEvent(new Event("online"));
  await Promise.resolve();
  foreground({ isActive: true });
  await Promise.resolve();
  await Promise.resolve();
  expect(store.flush).toHaveBeenCalledTimes(3);
  expect(status).toHaveBeenCalledWith({ pending: 0 });
  cleanup();
  expect(removed).toHaveBeenCalledOnce();
  target.dispatchEvent(new Event("online"));
  expect(store.flush).toHaveBeenCalledTimes(3);
});
