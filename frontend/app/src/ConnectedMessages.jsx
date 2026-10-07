import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { conversationApi } from "./conversationApi.js";
export function ConversationHome() {
  return (
    <section className="assistant-page">
      <h1>¿Qué trámite de Tráfico necesitas gestionar hoy?</h1>
      <p className="muted">
        Consulta con LidIA los requisitos de tu canje y recupera tus
        conversaciones.
      </p>
      <Link className="card option" to="/lidia/conversacion">
        Abrir conversación con LidIA <span aria-hidden="true">›</span>
      </Link>
    </section>
  );
}
const interlocutor = (c) => c.purpose === "sondeo" ? "LidIA" : "Equipo Gestadia";
const folded = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("es");
const dateText = (s) => new Date(s).toLocaleString("es-ES", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
});
export default function ConnectedMessages() {
  const [rows, setRows] = useState([]), [error, setError] = useState(""),
    [loading, setLoading] = useState(true), [query, setQuery] = useState(""),
    [editing, setEditing] = useState(null), [title, setTitle] = useState(""),
    [saving, setSaving] = useState(false), [saveError, setSaveError] = useState("");
  async function refresh() {
    setLoading(true); setError("");
    try { setRows((await conversationApi.list()).conversations); }
    catch { setError("No se pudieron recuperar tus conversaciones."); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    let current = true;
    conversationApi.list().then(r => { if (current) setRows(r.conversations); })
      .catch(() => { if (current) setError("No se pudieron recuperar tus conversaciones."); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, []);
  async function save(event) {
    event.preventDefault(); if (saving) return;
    setSaving(true); setSaveError("");
    try {
      const updated = await conversationApi.rename(editing, title.trim() || null);
      setRows(old => old.map(c => c.id === editing ? { ...c, title: updated.title } : c));
      setEditing(null);
    } catch { setSaveError("No se pudo guardar el nombre. Tu borrador se conserva."); }
    finally { setSaving(false); }
  }
  const matches = rows.filter(c => folded(`${c.title || ""} ${interlocutor(c)}`).includes(folded(query.trim())));
  return (
    <section className="messages-page connected-messages">
      <div className="messages-title-row">
        <h1>Mensajes</h1>
        <button className="text-btn" disabled={loading} onClick={refresh}>Actualizar</button>
      </div>
      <p className="muted">Tus conversaciones con LidIA y el equipo de Gestadia.</p>
      <div className="new-conversation-links">
        <Link className="card option" to="/lidia/conversacion">Consulta con LidIA <span aria-hidden="true">›</span></Link>
        <Link className="card option" to="/mensajes/gestor">Atención Gestadia <span aria-hidden="true">›</span></Link>
      </div>
      <label className="conversation-search">
        <span>Buscar conversaciones</span>
        <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nombre, LidIA o Equipo Gestadia" />
      </label>
      {error && <p role="alert" className="error">{error}</p>}
      {loading && <p role="status" className="muted">Actualizando conversaciones…</p>}
      {!loading && !error && !matches.length && <p className="muted">{query ? "No hay conversaciones que coincidan." : "Aún no tienes conversaciones."}</p>}
      <div className="stack">
        {matches.map(c => {
          const name = c.title || interlocutor(c);
          const status = !c.metadata_ready ? "Sin actualizar" : c.status === "closed" ? "Cerrada"
            : c.status === "waiting_for_support" ? "Pendiente de atención" : c.status === "in_support" ? "En atención" : "Abierta";
          return <article className="card conversation-card" key={c.id}>
            <div className="conversation-card-heading">
              <Link className="conversation-link" to={`${c.purpose === "sondeo" ? "/lidia/conversacion" : "/mensajes/gestor"}?conversacion=${encodeURIComponent(c.id)}${c.case_ref ? "&caso=" + encodeURIComponent(c.case_ref) : ""}`}>
                <strong>{name}</strong>
                {c.title && <span className="muted conversation-interlocutor">{interlocutor(c)}</span>}
              </Link>
              <span className={`conversation-status ${!c.metadata_ready ? "unknown" : c.status === "closed" ? "closed" : "open"}`}>{status}</span>
            </div>
            <dl className="conversation-dates">
              <div><dt>Creada</dt><dd><time dateTime={c.created_at}>{dateText(c.created_at)}</time></dd></div>
              <div><dt>Último mensaje</dt><dd>{c.last_message_at ? <time dateTime={c.last_message_at}>{dateText(c.last_message_at)}</time> : c.metadata_ready ? "Sin mensajes" : "Sin actualizar"}</dd></div>
            </dl>
            {editing === c.id ? <form className="conversation-rename" onSubmit={save}>
              <label><span>Nombre de la conversación</span><input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder={interlocutor(c)} disabled={saving} /></label>
              <p className="muted">Deja el campo vacío para usar el nombre de origen.</p>
              {saveError && <p role="alert" className="error">{saveError}</p>}
              <div className="conversation-rename-actions"><button className="btn dark" disabled={saving}>Guardar nombre</button><button type="button" className="text-btn" disabled={saving} onClick={() => setEditing(null)}>Cancelar</button></div>
            </form> : <button className="text-btn conversation-rename-trigger" aria-label={`Renombrar ${name}`} onClick={() => { setEditing(c.id); setTitle(c.title || ""); setSaveError(""); }}>Renombrar</button>}
          </article>;
        })}
      </div>
    </section>
  );
}
