import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import {
  SecureStorage,
  KeychainAccess,
} from "@aparajita/capacitor-secure-storage";
export function createSessionStore({ secure, revoke }) {
  let token = null,
    generation = 0,
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
  async function enqueue(value) {
    if (!value) return;
    const pending = (await read("gestadia.pending-revocations")) || [];
    await write("gestadia.pending-revocations", [
      ...new Set([...pending, value]),
    ]);
  }
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
    return { pending: remaining.length };
  }
  function retire(network) {
    generation++;
    const old = token;
    token = null;
    return serialized(async () => {
      await enqueue(old);
      await enqueue(await read("gestadia.session"));
      token = null;
      await secure.remove("gestadia.session", false);
      return network
        ? flush()
        : {
            pending: ((await read("gestadia.pending-revocations")) || [])
              .length,
          };
    });
  }
  return {
    get: () => token,
    initialize: () =>
      serialized(async () => {
        const pending = (await read("gestadia.pending-revocations")) || [];
        const saved = await read("gestadia.session");
        token =
          typeof saved === "string" && !pending.includes(saved) ? saved : null;
        return flush();
      }),
    set: (value) => {
      const version = ++generation;
      token = null;
      return serialized(async () => {
        if (version !== generation) {
          await enqueue(value);
          await flush();
          throw Error("El acceso se ha cancelado al cambiar de sesión.");
        }
        if (!value) return secure.remove("gestadia.session", false);
        try {
          await write("gestadia.session", value);
        } catch (error) {
          // El JWT emitido sigue requiriendo revocación aunque Keychain falle.
          await enqueue(value);
          await flush();
          throw error;
        }
        if (version !== generation) {
          await enqueue(value);
          await secure.remove("gestadia.session", false);
          await flush();
          throw Error("El acceso se ha cancelado al cambiar de sesión.");
        }
        token = value;
      });
    },
    logout: () => retire(true),
    retireSaved: () => retire(false),
    discard: (value) =>
      serialized(async () => {
        await enqueue(value);
        return flush();
      }),
    flush: () => serialized(flush),
  };
}
async function revoke(token) {
  const config = globalThis.GESTADIA_APP_CONFIG || {};
  if (config.demoOnly) throw Error("demo");
  const response = await fetch(
    `${String(config.apiBaseUrl || "").replace(/\/$/, "")}/api/auth/logout`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    },
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
    await nativeSession.retireSaved();
    return;
  }
  await nativeSession.initialize();
}

export async function watchSessionRevocations({
  store = nativeSession,
  app = App,
  target = window,
  onStatus,
}) {
  let alive = true;
  const recover = async () => {
    try {
      const status = await store.flush();
      if (alive) onStatus(status);
    } catch {
      if (alive) onStatus({ pending: 1 });
    }
  };
  target.addEventListener("online", recover);
  let listener;
  try {
    listener = await app.addListener("appStateChange", ({ isActive }) => {
      if (isActive) recover();
    });
  } catch {
    target.removeEventListener("online", recover);
    throw Error("No se pudo observar la conexión de la sesión.");
  }
  recover();
  return () => {
    alive = false;
    target.removeEventListener("online", recover);
    listener.remove();
  };
}
