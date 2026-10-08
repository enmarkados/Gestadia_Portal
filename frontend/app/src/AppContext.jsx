import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createDemo, DEMO_KEY, readDemo } from "./demo.js";
import {
  getToken,
  request,
  setToken,
  demoOnly,
  platform,
  logoutSession,
} from "./api.js";
import { clearPluginSessions } from "./pluginStorage.js";
import { socialClient } from "./social-auth.js";
import { connectPush, pushAvailable } from "./push.js";
import { nativeSession } from "./sessionStorage.js";
const Context = createContext(null);
export const useApp = () => useContext(Context);
const EMPTY = {
  profile: null,
  expedientes: [],
  notifications: [],
  consultations: [],
  managerMessages: [],
};
export function AppProvider({ children }) {
  const epoch = useRef(0);
  const [mode, setMode] = useState(() => {
    if (demoOnly()) {
      setToken(null);
      clearPluginSessions();
      return "demo";
    }
    return getToken() ? "real" : "visitante";
  });
  const [data, setData] = useState(() =>
    demoOnly() ? readDemo() || createDemo() : EMPTY,
  );
  const [loading, setLoading] = useState(false);
  const [pushStatus, setPushStatus] = useState("");
  const [error, setError] = useState("");
  async function refresh() {
    const version = epoch.current;
    setLoading(true);
    setError("");
    try {
      const [profile, expedientes, notifications] = await Promise.all([
        request("/api/me"),
        request("/api/expedientes"),
        request("/api/notificaciones"),
      ]);
      if (!Array.isArray(expedientes) || !Array.isArray(notifications))
        throw new Error("El portal ha devuelto un formato inesperado.");
      if (version === epoch.current)
        setData((old) => ({
          ...old,
          profile,
          expedientes,
          notifications,
        }));
    } catch (err) {
      if (version === epoch.current) setError(err.message);
    } finally {
      if (version === epoch.current) setLoading(false);
    }
  }
  useEffect(() => {
    if (mode !== "real" || !pushAvailable()) return;
    let disposed = false,
      cleanup;
    connectPush(setPushStatus, () => refresh())
      .then((fn) => {
        if (disposed) fn();
        else cleanup = fn;
      })
      .catch(() =>
        setPushStatus("Avisos no disponibles. Reintenta con conexión."),
      );
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [mode, data.profile?.id]);
  useEffect(() => {
    if (mode === "real") refresh();
  }, [mode]);
  useEffect(() => {
    function expire() {
      epoch.current++;
      clearPluginSessions();
      setLoading(false);
      setMode("visitante");
      setData(EMPTY);
      setError("Tu sesión ha caducado. Vuelve a entrar.");
    }
    window.addEventListener("gestadia-session-expired", expire);
    return () => window.removeEventListener("gestadia-session-expired", expire);
  }, []);
  useEffect(() => {
    if (mode === "demo") {
      try {
        localStorage.setItem(DEMO_KEY, JSON.stringify(data));
      } catch {
        /* almacenamiento no disponible */
      }
    }
  }, [data, mode]);
  function startDemo(type = "cliente", reset = false) {
    epoch.current++;
    socialClient.cancel().catch(() => {});
    clearPluginSessions();
    setLoading(false);
    setToken(null);
    setError("");
    setData(reset ? createDemo(type) : readDemo() || createDemo(type));
    setMode("demo");
  }
  function logout() {
    epoch.current++;
    socialClient.cancel().catch(() => {});
    clearPluginSessions();
    setLoading(false);
    const closed = logoutSession();
    closed?.catch(() =>
      setError(
        "Cierre local realizado; la revocación del servidor sigue pendiente. Abre la app con conexión para completarla.",
      ),
    );
    setMode("visitante");
    setData(EMPTY);
    setError("");
  }
  function deleteDemoAccount() {
    if (mode !== "demo")
      throw new Error(
        "El borrado de cuentas reales no está conectado en esta versión.",
      );
    // If storage cannot be erased, keep the session and report the failure.
    localStorage.removeItem(DEMO_KEY);
    logout();
  }
  async function login(email, password) {
    const version = epoch.current;
    const body = await request("/api/auth/login", {
      auth: false,
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        platform: platform(),
      }),
    });
    if (version !== epoch.current)
      throw new Error("El acceso se ha cancelado al cambiar de sesión.");
    if (!body.token) throw new Error("No se pudo abrir la sesión.");
    epoch.current++;
    clearPluginSessions();
    await setToken(body.token);
    setData(EMPTY);
    setMode("real");
  }
  async function acceptSession(token) {
    const version = epoch.current;
    await setToken(token);
    if (version !== epoch.current) {
      if (platform()) await nativeSession.discard(token);
      if (getToken() === token) await setToken(null);
      throw new Error("El acceso se ha cancelado al cambiar de sesión.");
    }
    epoch.current++;
    clearPluginSessions();
    setData(EMPTY);
    setError("");
    setMode("real");
  }
  async function saveProfile(profile) {
    const version = epoch.current;
    if (mode === "real")
      await request("/api/me", {
        method: "PATCH",
        body: JSON.stringify(profile),
      });
    if (version !== epoch.current) return;
    setData((old) => ({
      ...old,
      profile,
    }));
  }
  async function markRead(id) {
    const version = epoch.current;
    if (mode === "real")
      await request(`/api/notificaciones/${encodeURIComponent(id)}/leer`, {
        method: "POST",
      });
    if (version !== epoch.current) return;
    setData((old) => ({
      ...old,
      notifications: old.notifications.map((n) =>
        n.id === id
          ? {
              ...n,
              leida: true,
            }
          : n,
      ),
    }));
  }
  return (
    <Context.Provider
      value={{
        mode,
        data,
        setData,
        loading,
        error,
        pushStatus,
        refresh,
        startDemo,
        logout,
        deleteDemoAccount,
        requestDeletion: async () => {
          const result = await request("/api/me/deletion-request", {
            method: "POST",
            body: JSON.stringify({ confirm: true }),
          });
          logout();
          return result;
        },
        login,
        acceptSession,
        saveProfile,
        markRead,
        isClient: data.expedientes.length > 0,
      }}
    >
      {children}
    </Context.Provider>
  );
}
