import { guestConversationApi } from "./guestConversations.js";
import DeliveryTicks from "./DeliveryTicks.jsx";
import ChatLoading from "./ChatLoading.jsx";
import { useFocusedFormScroll } from "./useFocusedFormScroll.js";
import { useReceiptSummaries } from "./useMessageReceipts.js";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { navigationState, accessState } from "./navigation.js";
import { getToken } from "./api.js";
import { useApp } from "./AppContext.jsx";
import { conversationApi } from "./conversationApi.js";
import {
  Search,
  X,
  RefreshCw,
  Pencil,
  ChevronRight,
  Sparkles,
  MessageSquare,
} from "lucide-react";
export function ConversationHome() {
  return (
    <section className="assistant-page lidia-home">
      <h1>¿Qué trámite de Tráfico necesitas gestionar hoy?</h1>
      <p className="muted">LidIA te ayuda a comprobar los requisitos de tu trámite.</p>
      <ConversationList kind="lidia" />
    </section>
  );
}
const interlocutor = (c) =>
  c.purpose === "sondeo" ? "LidIA" : c.manager_name || "Tu gestor";
const folded = (s) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("es");
const dateText = (s) =>
  new Date(s).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
export default function ConnectedMessages({ onContact }) {
  return <ConversationList kind="gestores" onContact={onContact} />;
}
export function ConversationList({ kind, onContact }) {
  const app = useApp();
  const signedIn = app ? app.mode === "real" : !!getToken();
  const isLidia = kind === "lidia";
  const location = useLocation();
  const [newKey] = useState(() => crypto.randomUUID());
  const renameTrigger = useRef(null);
  const [rows, setRows] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [query, setQuery] = useState(""),
    [editing, setEditing] = useState(null),
    [title, setTitle] = useState(""),
    [saving, setSaving] = useState(false),
    [saveError, setSaveError] = useState("");
  const renameFocus = useFocusedFormScroll(editing);
  async function loadRows() {
    const registered = signedIn ? (await conversationApi.list()).conversations : [];
    const guestRows = isLidia ? (await guestConversationApi.list().catch(() => ({ conversations: [] }))).conversations.filter(c => c.protocol === "v2") : [];
    return [...registered, ...guestRows].sort((a,b)=>Date.parse(b.last_message_at || b.created_at)-Date.parse(a.last_message_at || a.created_at));
  }
  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setRows(await loadRows());
    } catch {
      setError("No se pudieron recuperar tus conversaciones.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!signedIn && !isLidia) { setLoading(false); return; }
    let current = true;
    loadRows()
      .then((r) => {
        if (current) setRows(r);
      })
      .catch(() => {
        if (current) setError("No se pudieron recuperar tus conversaciones.");
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [signedIn]);
  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaveError("");
    try {
      const updated = await (rows.find(c=>c.id===editing)?.protocol === "v2" ? guestConversationApi : conversationApi).rename(
        editing,
        title.trim() || null,
      );
      setRows((old) =>
        old.map((c) => (c.id === editing ? { ...c, title: updated.title } : c)),
      );
      setEditing(null);
      renameTrigger.current?.focus();
    } catch {
      setSaveError("No se pudo guardar el nombre. Tu borrador se conserva.");
    } finally {
      setSaving(false);
    }
  }
  const scoped = useMemo(() => rows.filter(c => isLidia ? c.purpose === "sondeo" : c.purpose !== "sondeo"), [rows, isLidia]);
  const latest = scoped.find(c => c.status !== "closed") || scoped[0];
  const matches = useMemo(() => scoped.filter((c) =>
    folded(`${c.title || ""} ${interlocutor(c)}`).includes(
      folded(query.trim()),
    ),
  ), [scoped, query]);
  const summaries = useReceiptSummaries(matches);
  return (
    <section className={`messages-page connected-messages ${isLidia ? "lidia-history" : ""}`}>
      <div className="messages-title-row">
        {isLidia ? <h2>Tus conversaciones con LidIA</h2> : <h1>Mensajes</h1>}
        <button
          className="messages-refresh"
          aria-label="Actualizar conversaciones"
          title="Actualizar conversaciones"
          disabled={loading || (!signedIn && !isLidia)}
          onClick={refresh}
        >
          <RefreshCw size={18} aria-hidden="true" />
        </button>
      </div>
      {isLidia && <div className="lidia-home-actions">
        <Link className="lidia-home-action" to={`/lidia/conversacion?nueva=${newKey}`} state={navigationState(location)}>
          <span className="conversation-avatar assistant"><Sparkles size={21} aria-hidden="true" /></span>
          <span><strong>Nueva conversación con LidIA</strong><small>Consulta otro trámite</small></span>
          <ChevronRight size={19} aria-hidden="true" />
        </Link>
        {latest && <Link className="lidia-home-action resume" aria-label="Continuar conversación con LidIA" to={`/lidia/conversacion?conversacion=${encodeURIComponent(latest.id)}${latest.protocol === "v2" ? "&invitado=1" : ""}`} state={navigationState(location)}>
          <span className="conversation-avatar team"><MessageSquare size={21} aria-hidden="true" /></span>
          <span><strong>Continuar conversación</strong><small>{latest.title || "Tu última consulta con LidIA"}</small></span>
          <ChevronRight size={19} aria-hidden="true" />
        </Link>}
      </div>}
      {!isLidia && <p className="muted">Tus chats con gestores, atención al cliente y postventa.</p>}
      {!isLidia && onContact && <button className="btn dark-btn messages-contact" onClick={onContact}><MessageSquare size={18} aria-hidden="true" /> Hablar con un gestor</button>}
      {!signedIn && <p className="helper">{isLidia ? "Puedes consultar con LidIA sin registro. Si ya tienes cuenta, inicia sesión para recuperar tus conversaciones guardadas." : "Inicia sesión para recuperar los chats de tu gestor. También puedes solicitar una llamada sin tener cuenta."} {!isLidia && <Link to="/acceso" state={accessState(location)}>Iniciar sesión</Link>}</p>}
      <div className={`conversation-search ${!signedIn && !scoped.length ? "is-hidden" : ""}`}>
        <label className="sr-only" htmlFor="conversation-search">
          Buscar conversaciones
        </label>
        <Search size={18} aria-hidden="true" />
        <input
          id="conversation-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar conversaciones"
        />
        {query && (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => {
              setQuery("");
              document.getElementById("conversation-search")?.focus();
            }}
          >
            <X size={17} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="conversation-list-heading">
        <h2>{isLidia ? "Historial" : "Tus conversaciones"}</h2>
        {!loading && !error && (
          <span>
            {matches.length} {matches.length === 1 ? "chat" : "chats"}
          </span>
        )}
      </div>
      {error && (
        <p role="alert" className="error messages-feedback">
          {error}
        </p>
      )}
      {loading && (
        <ChatLoading label={rows.length ? "Actualizando conversaciones…" : "Cargando conversaciones…"} compact={rows.length > 0} />
      )}
      {!loading && !error && !matches.length && (
        <p role="status" className="messages-empty">
          {query
            ? "No hay conversaciones que coincidan."
            : isLidia ? "Tu historial de consultas aparecerá aquí." : "Aún no tienes chats con un gestor. Puedes solicitar una llamada para que te asesore."}
        </p>
      )}
      <ul className="conversation-list" aria-label="Conversaciones">
        {matches.map((c) => {
          const name = c.title || interlocutor(c);
          const status = !c.metadata_ready
            ? "Sin actualizar"
            : c.status === "closed"
              ? "Cerrada"
              : c.status === "waiting_for_support"
                ? "Pendiente de atención"
                : c.status === "in_support"
                  ? "En atención"
                  : "Abierta";
          return (
            <li className="conversation-card" key={c.id} data-receipt-conversation={c.id}>
              <div className="conversation-row">
                <Link
                  className="conversation-link"
                  state={navigationState(location)}
                  to={`${c.purpose === "sondeo" ? "/lidia/conversacion" : "/mensajes/gestor"}?conversacion=${encodeURIComponent(c.id)}${c.protocol === "v2" ? "&invitado=1" : ""}${c.case_ref ? "&caso=" + encodeURIComponent(c.case_ref) : ""}`}
                >
                  <span
                    className={`conversation-avatar ${c.purpose === "sondeo" ? "assistant" : "team"}`}
                    aria-hidden="true"
                  >
                    {c.purpose === "sondeo" ? (
                      <Sparkles size={20} />
                    ) : (
                      <MessageSquare size={20} />
                    )}
                  </span>
                  <div className="conversation-details">
                    <strong title={name}>{name}</strong>
                    <div className="conversation-info">
                      <span className="conversation-interlocutor">
                        {interlocutor(c)}
                      </span>
                      <span
                        className={`conversation-status ${!c.metadata_ready ? "unknown" : c.status === "closed" ? "closed" : c.status === "waiting_for_support" ? "waiting" : "open"}`}
                      >
                        {status}
                      </span>
                    </div>
                    {summaries[c.id]?.last_message && <div className="conversation-preview">
                      {summaries[c.id].last_message.role === "user" && <DeliveryTicks receipt={summaries[c.id].last_message.receipt} />}
                      <span>{summaries[c.id].last_message.text}</span>
                    </div>}
                    <dl className="conversation-dates">
                      <div>
                        <dt>Creada</dt>
                        <dd>
                          <time dateTime={c.created_at}>
                            {dateText(c.created_at)}
                          </time>
                        </dd>
                      </div>
                      <div>
                        <dt>Último mensaje</dt>
                        <dd>
                          {c.last_message_at ? (
                            <time dateTime={c.last_message_at}>
                              {dateText(c.last_message_at)}
                            </time>
                          ) : c.metadata_ready ? (
                            "Sin mensajes"
                          ) : (
                            "Sin actualizar"
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <ChevronRight
                    className="conversation-chevron"
                    size={17}
                    aria-hidden="true"
                  />
                </Link>
                <button
                  className="conversation-rename-trigger"
                  aria-label={`Renombrar ${name}`}
                  title="Renombrar conversación"
                  aria-expanded={editing === c.id}
                  aria-controls={
                    editing === c.id ? `rename-${c.id}` : undefined
                  }
                  disabled={saving}
                  onClick={(event) => {
                    renameTrigger.current = event.currentTarget;
                    setEditing(editing === c.id ? null : c.id);
                    setTitle(c.title || "");
                    setSaveError("");
                  }}
                >
                  <Pencil size={16} aria-hidden="true" />
                </button>
              </div>
              {editing === c.id && (
                <form
                  id={`rename-${c.id}`}
                  className="conversation-rename"
                  onSubmit={save}
                >
                  <label>
                    <span>Nombre de la conversación</span>
                    <input
                      {...renameFocus}
                      autoFocus
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={interlocutor(c)}
                      disabled={saving}
                      aria-describedby={`rename-help-${c.id}`}
                    />
                  </label>
                  <p id={`rename-help-${c.id}`} className="muted">
                    Deja el campo vacío para usar el nombre de origen.
                  </p>
                  {saveError && (
                    <p role="alert" className="error">
                      {saveError}
                    </p>
                  )}
                  <div className="conversation-rename-actions">
                    <button className="btn dark" disabled={saving}>
                      Guardar nombre
                    </button>
                    <button
                      type="button"
                      className="btn secondary"
                      disabled={saving}
                      onClick={() => {
                        setEditing(null);
                        renameTrigger.current?.focus();
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
