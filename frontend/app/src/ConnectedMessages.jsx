import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { navigationState } from "./navigation.js";
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
  const location = useLocation();
  return (
    <section className="assistant-page">
      <h1>¿Qué trámite de Tráfico necesitas gestionar hoy?</h1>
      <p className="muted">
        Consulta con LidIA los requisitos de tu canje y recupera tus
        conversaciones.
      </p>
      <Link
        className="card option"
        to="/lidia/conversacion"
        state={navigationState(location)}
      >
        Abrir conversación con LidIA <span aria-hidden="true">›</span>
      </Link>
    </section>
  );
}
const interlocutor = (c) =>
  c.purpose === "sondeo" ? "LidIA" : "Equipo Gestadia";
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
export default function ConnectedMessages() {
  const location = useLocation();
  const renameTrigger = useRef(null);
  const [rows, setRows] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [query, setQuery] = useState(""),
    [editing, setEditing] = useState(null),
    [title, setTitle] = useState(""),
    [saving, setSaving] = useState(false),
    [saveError, setSaveError] = useState("");
  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setRows((await conversationApi.list()).conversations);
    } catch {
      setError("No se pudieron recuperar tus conversaciones.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    let current = true;
    conversationApi
      .list()
      .then((r) => {
        if (current) setRows(r.conversations);
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
  }, []);
  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaveError("");
    try {
      const updated = await conversationApi.rename(
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
  const matches = rows.filter((c) =>
    folded(`${c.title || ""} ${interlocutor(c)}`).includes(
      folded(query.trim()),
    ),
  );
  return (
    <section className="messages-page connected-messages">
      <div className="messages-title-row">
        <h1>Mensajes</h1>
        <button
          className="messages-refresh"
          aria-label="Actualizar conversaciones"
          title="Actualizar conversaciones"
          disabled={loading}
          onClick={refresh}
        >
          <RefreshCw size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="conversation-search">
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
      <nav className="new-conversation-links" aria-label="Iniciar conversación">
        <Link to="/lidia/conversacion" state={navigationState(location)}>
          <Sparkles size={17} aria-hidden="true" />
          <span>Consulta con LidIA</span>
        </Link>
        <Link to="/mensajes/gestor" state={navigationState(location)}>
          <MessageSquare size={17} aria-hidden="true" />
          <span>Atención Gestadia</span>
        </Link>
      </nav>
      <div className="conversation-list-heading">
        <h2>Tus conversaciones</h2>
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
        <p role="status" className="muted messages-feedback">
          Actualizando conversaciones…
        </p>
      )}
      {!loading && !error && !matches.length && (
        <p role="status" className="messages-empty">
          {query
            ? "No hay conversaciones que coincidan."
            : "Aún no tienes conversaciones. Inicia una consulta con LidIA o contacta con el equipo."}
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
            <li className="conversation-card" key={c.id}>
              <div className="conversation-row">
                <Link
                  className="conversation-link"
                  state={navigationState(location)}
                  to={`${c.purpose === "sondeo" ? "/lidia/conversacion" : "/mensajes/gestor"}?conversacion=${encodeURIComponent(c.id)}${c.case_ref ? "&caso=" + encodeURIComponent(c.case_ref) : ""}`}
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
                      className="text-btn"
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
