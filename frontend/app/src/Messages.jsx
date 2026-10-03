import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import Icon from "./Icon.jsx";
export default function Messages() {
  const { data, setData, mode, isClient } = useApp();
  const expediente = data.expedientes[0];
  const managerLast = data.managerMessages.at(-1);
  const assistantLast = data.assistantState?.messages?.at(-1);
  function newConsultation() {
    if (mode === "demo")
      setData((old) => ({
        ...old,
        assistantState: { topic: null, answers: {}, messages: [] },
      }));
  }
  return (
    <section className="messages-page">
      <p className="eyebrow">CENTRO DE COMUNICACIONES</p>
      <h1>Mensajes</h1>
      <p className="muted messages-description">
        Tus conversaciones activas con tu gestor asignado y el asistente LidIA.
      </p>
      <Link className="card new-consultation" to="/" onClick={newConsultation}>
        <span className="avatar red">
          <Icon name="spark" size={20} />
        </span>
        <div>
          <strong>Nueva consulta con LidIA</strong>
          <p>Diagnóstico previo y requisitos DGT en 1 min</p>
        </div>
        <span className="new-consultation-plus" aria-hidden="true">
          +
        </span>
      </Link>
      <h2 className="threads-heading">Conversaciones activas</h2>
      <div className="stack messages-threads">
        {isClient && (
          <Link
            className="card message-thread manager-thread"
            to="/mensajes/gestor"
          >
            <div className="thread-heading">
              <span className="avatar dark">JA</span>
              <div className="thread-details">
                <strong>Juan Carlos Acero</strong>
                <p>
                  {expediente
                    ? `Exp. ${expediente.nPedido} · ${expediente.paisCanje ? `Canje ${expediente.paisCanje}` : expediente.titulo}`
                    : "Tu gestor asignado"}
                </p>
              </div>
            </div>
            {managerLast && (
              <p className="thread-preview">
                {managerLast.role === "user" ? "Tú" : "Juan Carlos"}:{" "}
                {managerLast.content}
              </p>
            )}
          </Link>
        )}
        <Link className="card message-thread assistant-thread" to="/">
          <div className="thread-heading">
            <span className="avatar red">
              <Icon name="spark" size={20} />
            </span>
            <div className="thread-details">
              <div className="thread-name">
                <strong>LidIA</strong>
                <span className="assistant-badge">IA Gestadia</span>
              </div>
              <p>Sondeo y Diagnóstico Previo DGT</p>
            </div>
          </div>
          <p className="thread-preview">
            {assistantLast?.role === "user" ? "Tú" : "LidIA"}:{" "}
            {assistantLast?.content ||
              "¿Qué trámite de Tráfico necesitas gestionar hoy?"}
          </p>
        </Link>
      </div>
    </section>
  );
}
export function ManagerChat({ onContact }) {
  const { mode, data, setData, isClient } = useApp();
  const [input, setInput] = useState("");
  const end = useRef(null);
  useEffect(() => {
    end.current?.scrollIntoView?.({
      block: "end",
    });
  }, [data.managerMessages]);
  function send(event) {
    event.preventDefault();
    if (input.trim().length < 2) return;
    setData((old) => ({
      ...old,
      managerMessages: [
        ...old.managerMessages,
        {
          role: "user",
          content: input.trim(),
        },
      ],
    }));
    setInput("");
  }
  return (
    <section>
      <div className="section-head">
        <Link
          className="icon-btn"
          to="/mensajes"
          aria-label="Volver a mensajes"
        >
          <Icon name="back" />
        </Link>
        <h1 className="compact-title">Habla con tu gestor</h1>
        <button
          className="icon-btn"
          aria-label="Solicitar llamada"
          onClick={onContact}
        >
          <Icon name="phone" />
        </button>
      </div>
      {mode !== "demo" || !isClient ? (
        <div className="card empty">
          <span className="avatar dark">JA</span>
          <h2>Contacto con tu gestor</h2>
          <p>
            La mensajería directa en la app aún no está conectada. Puedes
            solicitar una llamada para consultar tu expediente.
          </p>
          <button className="btn primary" onClick={onContact}>
            Solicitar llamada
          </button>
        </div>
      ) : (
        <>
          <p className="notice">
            Chat de demostración · Los mensajes no se envían al gestor.
          </p>
          <div className="conversation" aria-live="polite">
            {data.managerMessages.map((msg, i) => (
              <div key={i} className={`bubble ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            <Link
              className="card option"
              to={`/tramites/${data.expedientes[0].id}`}
            >
              <span>Revisar documentación del expediente</span>
              <Icon name="arrow" />
            </Link>
            <div ref={end} />
          </div>
          <form className="composer" onSubmit={send}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows="1"
              placeholder="Escribe a tu gestor…"
              aria-label="Mensaje para el gestor"
            />
            <button
              className="send-btn"
              disabled={input.trim().length < 2}
              aria-label="Enviar mensaje de ejemplo"
            >
              <Icon name="send" />
            </button>
          </form>
        </>
      )}
    </section>
  );
}
