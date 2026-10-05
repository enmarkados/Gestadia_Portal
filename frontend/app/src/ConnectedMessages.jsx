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
export default function ConnectedMessages() {
  const [rows, setRows] = useState([]),
    [error, setError] = useState("");
  useEffect(() => {
    let current = true;
    conversationApi
      .list()
      .then((r) => {
        if (current) setRows(r.conversations);
      })
      .catch(() => {
        if (current) setError("No se pudieron recuperar tus conversaciones.");
      });
    return () => {
      current = false;
    };
  }, []);
  return (
    <section className="messages-page">
      <h1>Mensajes</h1>
      <p className="muted">
        Tus conversaciones con LidIA y el equipo de Gestadia.
      </p>
      <Link className="card option" to="/lidia/conversacion">
        Consulta con LidIA
      </Link>
      <Link className="card option" to="/mensajes/gestor">
        Atención Gestadia
      </Link>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="stack">
        {rows.map((c) => (
          <Link
            className="card"
            key={c.id}
            to={`${c.purpose === "sondeo" ? "/lidia/conversacion" : "/mensajes/gestor"}?conversacion=${encodeURIComponent(c.id)}${c.case_ref ? "&caso=" + encodeURIComponent(c.case_ref) : ""}`}
          >
            <strong>
              {c.purpose === "sondeo" ? "LidIA" : "Equipo Gestadia"}
            </strong>
            <p>
              {c.status === "closed"
                ? "Historial de conversación"
                : "Abrir conversación"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
