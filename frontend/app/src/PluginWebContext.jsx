import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { readPluginSession, storePluginSession } from "./pluginStorage.js";
import { nativeOrigin } from "./native.js";
const Context = createContext(null);
export const usePluginWeb = () => useContext(Context);
export const pluginConfig = () =>
  globalThis.GESTADIA_APP_CONFIG?.pluginWeb || {};
export const pluginConfigured = () =>
  Boolean(pluginConfig().key && pluginConfig().baseUrl);
export async function pluginRequest(
  path,
  { token, method = "GET", body, signal } = {},
) {
  const cfg = pluginConfig();
  const headers = {
    "X-Plugin-Key": cfg.key,
    "Content-Type": "application/json",
  };
  if (token) headers["X-Session-Token"] = token;
  if (nativeOrigin()) headers.Origin = nativeOrigin();
  let res;
  try {
    res = await fetch(
      `${cfg.baseUrl.replace(/\/$/, "")}/api/pluginweb${path}`,
      {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal,
      },
    );
  } catch {
    throw Object.assign(
      new Error("Se ha interrumpido la conexión con LidIA."),
      {
        status: 0,
      },
    );
  }
  const data = await res.json().catch(() => null);
  if (!res.ok)
    throw Object.assign(
      new Error(
        data?.error ||
          (res.status === 429
            ? "Has enviado demasiados mensajes. Espera antes de continuar."
            : "No se pudo conectar con LidIA."),
      ),
      {
        status: res.status,
      },
    );
  if (!data)
    throw Object.assign(
      new Error("LidIA ha devuelto una respuesta inesperada."),
      {
        status: 502,
      },
    );
  return data;
}
export function normalizeMessages(messages) {
  if (!Array.isArray(messages))
    throw new Error("El historial de LidIA no tiene el formato esperado.");
  return messages.map((msg) => ({
    content: String(msg.content || ""),
    role: msg.isUser ? "user" : msg.isSupport ? "manager" : "assistant",
    timestamp: msg.timestamp,
  }));
}
export function PluginWebProvider({
  children,
  enabled,
  identity = "visitante",
}) {
  const storageKey = `${pluginConfig().key || ""}:${identity}`;
  const saved = useRef(enabled ? readPluginSession(storageKey) : null);
  const [config, setConfig] = useState(null);
  const [session, setSession] = useState(saved.current);
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const [draft, setDraft] = useState("");
  const pendingRef = useRef(null);
  const latestMessages = useRef([]);
  function updatePending(value) {
    pendingRef.current = value;
    setPending(value);
  }
  const polling = useRef(false);
  const alive = useRef(true);
  const visitor = useRef(saved.current?.visitorId || null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (!enabled || !pluginConfigured()) return;
    let active = true;
    pluginRequest("/config")
      .then((value) => {
        if (active) setConfig(value);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [enabled]);
  async function reloadMessages() {
    if (!session || polling.current) return;
    polling.current = true;
    try {
      const items = normalizeMessages(
        await pluginRequest(
          `/sessions/${encodeURIComponent(session.sessionId)}/messages`,
          {
            token: session.sessionToken,
          },
        ),
      );
      if (!alive.current) return;
      latestMessages.current = items;
      setMessages(items);
      const current = pendingRef.current;
      if (current && items.length > current.baseline) {
        const received = items.slice(current.baseline);
        if (received.some((msg) => msg.role !== "user")) updatePending(null);
        else if (
          !current.confirmed &&
          received.some(
            (msg) => msg.role === "user" && msg.content === current.text,
          )
        )
          updatePending({
            ...current,
            confirmed: true,
          });
        if (
          received.some(
            (msg) => msg.role !== "user" || msg.content === current.text,
          )
        ) {
          setUncertain(false);
          setError("");
        }
      }
    } catch (err) {
      if (alive.current) {
        setError(err.message);
        if ([401, 403].includes(err.status)) {
          storePluginSession(storageKey, null);
          setSession(null);
          updatePending(null);
          setUncertain(false);
          setMessages([]);
        }
      }
    } finally {
      polling.current = false;
    }
  }
  useEffect(() => {
    if (!session) return;
    reloadMessages();
    const timer = setInterval(reloadMessages, 4000);
    return () => clearInterval(timer);
  }, [session, pending]);
  useEffect(() => {
    if (!pending || pending.confirmed) return;
    const timer = setTimeout(() => {
      setUncertain(true);
      setError(
        "Todavía no tenemos confirmación del resultado. Revisa el historial antes de volver a enviar para evitar mensajes duplicados.",
      );
    }, 90000);
    return () => clearTimeout(timer);
  }, [pending]);
  async function connect(formulario) {
    if (busy || !config) return;
    setBusy(true);
    setError("");
    try {
      if (!visitor.current) visitor.current = crypto.randomUUID();
      const result = await pluginRequest("/sessions", {
        method: "POST",
        body: {
          visitorId: visitor.current,
          ...(formulario
            ? {
                formulario,
              }
            : {}),
        },
      });
      if (!result.sessionId || !result.sessionToken)
        throw new Error("No se pudo abrir la conversación.");
      if (!alive.current) return;
      const items = normalizeMessages(result.historial || []);
      latestMessages.current = items;
      const connected = {
        sessionId: result.sessionId,
        sessionToken: result.sessionToken,
        visitorId: visitor.current,
      };
      storePluginSession(storageKey, connected);
      setMessages(items);
      setSession(connected);
    } catch (err) {
      if (alive.current) setError(err.message);
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  async function send(text) {
    if (
      !session ||
      (pendingRef.current && !pendingRef.current.confirmed) ||
      text.trim().length < 2 ||
      text.length > 4000
    )
      return;
    text = text.trim();
    setDraft("");
    setError("");
    setUncertain(false);
    const baseline = latestMessages.current.length;
    const attempt = {
      text,
      baseline,
      id: crypto.randomUUID(),
      confirmed: false,
    };
    updatePending(attempt);
    try {
      await pluginRequest(
        `/sessions/${encodeURIComponent(session.sessionId)}/messages`,
        {
          token: session.sessionToken,
          method: "POST",
          body: {
            text,
          },
          signal: AbortSignal.timeout(175000),
        },
      );
      if (alive.current && pendingRef.current?.id === attempt.id) {
        updatePending({
          ...pendingRef.current,
          confirmed: true,
        });
        setUncertain(false);
      }
    } catch (err) {
      if (!alive.current || pendingRef.current?.id !== attempt.id) return;
      if ([400, 401, 403, 429].includes(err.status)) {
        updatePending(null);
        setDraft(text);
        setError(err.message);
      } else {
        setUncertain(true);
        setError(
          "El envío puede seguir procesándose en LidIA. Estamos comprobando el historial; no reenvíes el mensaje todavía.",
        );
      }
    }
  }
  async function recoverDraft() {
    const attempt = pendingRef.current;
    if (!attempt || attempt.confirmed) return;
    await reloadMessages();
    if (
      !alive.current ||
      pendingRef.current?.id !== attempt.id ||
      pendingRef.current.confirmed
    )
      return;
    updatePending(null);
    setDraft(attempt.text);
    setUncertain(false);
    setError(
      "Texto recuperado. No hemos confirmado la entrega anterior; si lo envías de nuevo, podría duplicarse.",
    );
  }
  return (
    <Context.Provider
      value={{
        config,
        session,
        messages,
        busy,
        pending,
        uncertain,
        error,
        draft,
        setDraft,
        connect,
        send,
        reloadMessages,
        recoverDraft,
        configured: pluginConfigured(),
      }}
    >
      {children}
    </Context.Provider>
  );
}
