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
