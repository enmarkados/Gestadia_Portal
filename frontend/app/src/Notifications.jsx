import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import Sheet from "./Sheet.jsx";
import Icon from "./Icon.jsx";
export default function Notifications({ onClose }) {
  const { data, markRead } = useApp();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  async function read(id) {
    setBusy(id);
    setError("");
    try {
      await markRead(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }
  return (
    <Sheet title="Notificaciones" onClose={onClose}>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {!data.notifications.length ? (
        <div className="empty">
          <Icon name="check" size={40} />
          <h3>Estás al día</h3>
          <p>No tienes notificaciones pendientes.</p>
        </div>
      ) : (
        <div className="stack">
          {data.notifications.map((n) => (
            <article
              key={n.id}
              className={`card notification ${n.leida ? "" : "unread"}`}
            >
              <strong>{n.titulo}</strong>
              <p>{n.mensaje || n.cuerpo}</p>
              {n.expedienteId && (
                <Link
                  className="text-btn"
                  to={`/tramites/${encodeURIComponent(n.expedienteId)}`}
                  onClick={onClose}
                >
                  Ver trámite
                </Link>
              )}
              {!n.leida && (
                <button
                  className="text-btn"
                  disabled={busy !== null}
                  onClick={() => read(n.id)}
                >
                  {busy === n.id ? "Guardando…" : "Marcar como leída"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </Sheet>
  );
}
