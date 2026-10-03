import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import Icon from "./Icon.jsx";
import ChatComposer from "./ChatComposer.jsx";
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
  const [voiceStatus, setVoiceStatus] = useState("");
  const [composerHost, setComposerHost] = useState(null);
  useLayoutEffect(() => {
    setComposerHost(document.getElementById("manager-composer"));
  }, []);
  const expediente = data.expedientes[0];
  const end = useRef(null);
  const previousMessageCount = useRef(data.managerMessages.length);
  useEffect(() => {
    if (data.managerMessages.length > previousMessageCount.current)
      end.current?.scrollIntoView?.({ block: "end" });
    previousMessageCount.current = data.managerMessages.length;
  }, [data.managerMessages]);
  function send() {
    if (input.trim().length < 2) return;
    setData((old) => ({
      ...old,
      managerMessages: [
        ...old.managerMessages,
        {
          role: "user",
          content: input.trim(),
          time: new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    }));
    setInput("");
  }
  return (
    <section className="manager-chat-page">
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
          {expediente && (
            <div className="manager-expediente">
              <span>
                ✓ Expediente {expediente.nPedido} · Juan Carlos Acero asignado
              </span>
            </div>
          )}
          <div className="conversation" aria-live="polite">
            {data.managerMessages.map((msg, i) => (
              <div
                key={msg.id || i}
                className={`bubble ${msg.role} ${msg.documents?.length ? "with-documents" : ""}`}
              >
                <div className="bubble-meta">
                  <strong className="bubble-author">
                    {msg.role === "user" ? "Tú" : "Juan Carlos Acero"}
                  </strong>
                  {msg.time && <span className="bubble-time">{msg.time}</span>}
                </div>
                <p>
                  {msg.emphasis && msg.content.includes(msg.emphasis) ? (
                    <>
                      {msg.content.slice(0, msg.content.indexOf(msg.emphasis))}
                      <strong>{msg.emphasis}</strong>
                      {msg.content.slice(
                        msg.content.indexOf(msg.emphasis) + msg.emphasis.length,
                      )}
                    </>
                  ) : (
                    msg.content
                  )}
                </p>
                {msg.documents?.length > 0 && expediente && (
                  <div className="manager-document-list">
                    {msg.documents.map((doc) => (
                      <div className="manager-document-row" key={doc.clave}>
                        <span>{doc.label}</span>
                        <Link
                          to={`/tramites/${encodeURIComponent(expediente.id)}?documento=${encodeURIComponent(doc.clave)}`}
                          aria-label={`Subir ${doc.label.replace(/^\d+\. /, "")}`}
                        >
                          Subir
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={end} />
          </div>
          {composerHost &&
            createPortal(
              <ChatComposer
                value={input}
                onChange={setInput}
                onSend={send}
                label="Mensaje para el gestor"
                sendLabel="Enviar mensaje de ejemplo"
                onDictate={() =>
                  setVoiceStatus(
                    "El dictado está desactivado en esta demostración.",
                  )
                }
                status={voiceStatus}
              />,
              composerHost,
            )}
        </>
      )}
    </section>
  );
}
