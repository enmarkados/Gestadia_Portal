import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import Icon from "./Icon.jsx";
export default function Messages({ onContact }) {
  const { data, isClient } = useApp();
  return (
    <section>
      <p className="eyebrow">EN CONTACTO CONTIGO</p>
      <h1>Mensajes</h1>
      <p className="muted">
        Tu consulta con LidIA y la comunicación con tu gestor, en un mismo
        lugar.
      </p>
      <div className="stack">
        {isClient && (
          <Link className="card thread" to="/mensajes/gestor">
            <span className="avatar dark">JA</span>
            <div>
              <strong>Juan Carlos Acero</strong>
              <p>Consulta sobre tu expediente</p>
            </div>
            <Icon name="arrow" size={18} />
          </Link>
        )}
        <Link className="card thread" to="/">
          <span className="avatar red">
            <Icon name="spark" />
          </span>
          <div>
            <strong>LidIA</strong>
            <p>
              {data.consultations.length
                ? `${data.consultations.length} consultas preparadas`
                : "Prepara una nueva consulta"}
            </p>
          </div>
          <Icon name="arrow" size={18} />
        </Link>
      </div>
      {data.consultations.length > 0 && (
        <>
          <h2>Consultas preparadas</h2>
          <div className="stack">
            {data.consultations.map((item, i) => (
              <div className="card" key={`${item.date}-${i}`}>
                <strong>
                  {item.topic === "canje-carnet"
                    ? "Canje de carnet"
                    : item.topic === "transferencia"
                      ? "Transferencia de vehículo"
                      : "Duplicado de carnet"}
                </strong>
                <p className="helper">Pendiente de revisión por un gestor</p>
                <dl>
                  {Object.entries(item.answers).map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </>
      )}
      <button className="btn secondary" onClick={onContact}>
        Hablar con un gestor
      </button>
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
