import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createDemo, DEMO_KEY, readDemo } from "./demo.js";
import { getToken, request, setToken, demoOnly } from "./api.js";
import { clearPluginSessions } from "./pluginStorage.js";
import {
  conversationsEnabled,
  clearConversationStorage,
} from "./conversationApi.js";
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
    if (mode === "real") refresh();
  }, [mode]);
  useEffect(() => {
    function expire() {
      clearConversationStorage();
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
    if (mode === "real" && conversationsEnabled())
      request("/api/app/v1/auth/sessions/current", { method: "DELETE" }).catch(
        () => {},
      );
    clearConversationStorage();
    epoch.current++;
    clearPluginSessions();
    setLoading(false);
    setToken(null);
    setError("");
    setData(reset ? createDemo(type) : readDemo() || createDemo(type));
    setMode("demo");
  }
  function logout() {
    if (mode === "real" && conversationsEnabled())
      request("/api/app/v1/auth/sessions/current", { method: "DELETE" }).catch(
        () => {},
      );
    clearConversationStorage();
    epoch.current++;
    clearPluginSessions();
    setLoading(false);
    setToken(null);
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
    const body = await request(
      conversationsEnabled() ? "/api/app/v1/auth/sessions" : "/api/auth/login",
      {
        auth: false,
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      },
    );
    if (version !== epoch.current)
      throw new Error("El acceso se ha cancelado al cambiar de sesión.");
    if (!body.token) throw new Error("No se pudo abrir la sesión.");
    epoch.current++;
    clearConversationStorage();
    clearPluginSessions();
    setToken(body.token);
    setData(EMPTY);
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
        refresh,
        startDemo,
        logout,
        deleteDemoAccount,
        login,
        saveProfile,
        markRead,
        isClient: data.expedientes.length > 0,
      }}
    >
      {children}
    </Context.Provider>
  );
}
