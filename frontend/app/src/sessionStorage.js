import { Capacitor } from "@capacitor/core";
import {
  SecureStorage,
  KeychainAccess,
} from "@aparajita/capacitor-secure-storage";
export function createSessionStore({ secure, revoke }) {
  let token = null,
    queue = Promise.resolve();
  const serialized = (fn) => {
    const result = queue.then(fn);
    queue = result.catch(() => {});
    return result;
  };
  const read = (key) => secure.get(key, false, false);
  const write = (key, value) =>
    secure.set(
      key,
      value,
      false,
      false,
      KeychainAccess.whenUnlockedThisDeviceOnly,
    );
  async function flush() {
    const pending = (await read("gestadia.pending-revocations")) || [];
    const remaining = [];
    for (const value of pending) {
      try {
        await revoke(value);
      } catch {
        remaining.push(value);
      }
    }
    await write("gestadia.pending-revocations", remaining);
  }
  return {
    get: () => token,
    initialize: () =>
      serialized(async () => {
        const pending = (await read("gestadia.pending-revocations")) || [];
        const saved = await read("gestadia.session");
        token =
          typeof saved === "string" && !pending.includes(saved) ? saved : null;
        await flush();
      }),
    set: (value) =>
      serialized(async () => {
        token = null;
        if (value) {
          await write("gestadia.session", value);
          token = value;
        } else await secure.remove("gestadia.session", false);
      }),
    logout: () => {
      const old = token;
      token = null;
      return serialized(async () => {
        if (old) {
          const pending = (await read("gestadia.pending-revocations")) || [];
          await write("gestadia.pending-revocations", [
            ...new Set([...pending, old]),
          ]);
        }
        await secure.remove("gestadia.session", false);
        await flush();
      });
    },
    discard: (value) =>
      serialized(async () => {
        const pending = (await read("gestadia.pending-revocations")) || [];
        await write("gestadia.pending-revocations", [
          ...new Set([...pending, value]),
        ]);
        await flush();
      }),
    flush: () => serialized(flush),
  };
}
async function revoke(token) {
  const config = globalThis.GESTADIA_APP_CONFIG || {};
  if (config.demoOnly) throw Error("demo");
  const response = await fetch(
    `${String(config.apiBaseUrl || "").replace(/\/$/, "")}/api/auth/logout`,
    { method: "POST", headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok && response.status !== 401)
    throw Error("revocación pendiente");
}
export const nativeSession = createSessionStore({
  secure: SecureStorage,
  revoke,
});
export async function initializeNativeSession() {
  if (!Capacitor.isNativePlatform()) return;
  for (const storage of [localStorage, sessionStorage])
    storage.removeItem("gestadia_app_token");
  if (globalThis.GESTADIA_APP_CONFIG?.demoOnly) {
    await nativeSession.set(null);
    return;
  }
  await nativeSession.initialize();
}
