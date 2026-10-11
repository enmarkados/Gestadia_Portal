import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { usePluginWeb } from "./PluginWebContext.jsx";
import { TOPICS } from "./qualification.js";
import Icon from "./Icon.jsx";
import AssistantContent from "./AssistantContent.jsx";
import VoiceButton from "./VoiceButton.jsx";
import { useMessageMotion } from "./motion.jsx";
export default function PlatformChat({ onContact, manager = false }) {
  const chat = usePluginWeb();

  const animatedMessages = useMessageMotion(chat.messages, !!chat.session && chat.messages.length > 0);
  const end = useRef(null);
  const [voiceError, setVoiceError] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });
  useEffect(() => {
    end.current?.scrollIntoView?.({
      block: "end",
    });
  }, [chat.messages, chat.pending]);
  const fields = (chat.config?.camposFormulario || []).filter((item) =>
    ["nombre", "telefono", "email"].includes(item.campo),
  );
  const showForm =
    chat.config?.modoFormulario !== "desactivado" && fields.length > 0;
  const pendingInHistory =
    chat.pending &&
    chat.messages.length > chat.pending.baseline &&
    chat.messages
      .slice(chat.pending.baseline)
      .some((msg) => msg.role === "user" && msg.content === chat.pending.text);
  return (
    <section className="assistant-page">
      <div className="section-head">
        <div>
          <p className="eyebrow">
            {manager ? "TU GESTOR" : "LIDIA · GESTADIA"}
          </p>
          <h1 className="compact-title">
            {manager
              ? "Habla con tu gestor"
              : "¿Qué trámite necesitas gestionar?"}
          </h1>
        </div>
        {manager && (
          <button
            className="icon-btn"
            aria-label="Solicitar llamada"
            onClick={onContact}
          >
            <Icon name="phone" />
          </button>
        )}
      </div>
      {chat.error && (
        <p className="error" role="alert">
          {chat.error}
        </p>
      )}
      {!chat.configured ? (
        <div className="card empty">
          <span className="avatar red">
            <Icon name="spark" size={28} />
          </span>
          <h2>Tu conversación con Gestadia</h2>
          <p>
            La conexión con LidIA está pendiente de configuración. Puedes
            consultar los servicios.
          </p>
          <Link className="btn primary" to="/servicios">
            Ver servicios DGT
          </Link>
        </div>
      ) : !chat.session ? (
        <>
          <p className="muted">
            {manager
              ? "LidIA y tu gestor participan en la misma conversación. El gestor interviene cuando la plataforma asigna atención humana."
              : "Conversa con el agente de Gestadia y recibe sus respuestas aquí."}
          </p>
          <form
            className="card form-card"
            onSubmit={(event) => {
              event.preventDefault();
              chat.connect(showForm ? form : undefined);
            }}
          >
            {showForm && (
              <>
                <h2>Antes de comenzar</h2>
                {fields.map((field) => (
                  <label key={field.campo}>
                    {field.campo === "nombre"
                      ? "Nombre"
                      : field.campo === "email"
                        ? "Email"
                        : "Teléfono"}
                    <input
                      type={
                        field.campo === "email"
                          ? "email"
                          : field.campo === "telefono"
                            ? "tel"
                            : "text"
                      }
                      required={
                        chat.config?.modoFormulario === "obligatorio" &&
                        field.requerido
                      }
                      value={form[field.campo]}
                      onChange={(e) =>
                        setForm((old) => ({
                          ...old,
                          [field.campo]: e.target.value,
                        }))
                      }
                    />
                  </label>
                ))}
                <p className="helper">
                  Estos datos se enviarán a Gestadia para atender tu consulta.{" "}
                  <a
                    className="text-btn"
                    href="https://gestadia.com/privacidad"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Privacidad
                  </a>
                </p>
              </>
            )}
            <button
              className="btn primary"
              disabled={chat.busy || !chat.config}
            >
              {chat.busy
                ? "Conectando…"
                : chat.config
                  ? "Comenzar conversación"
                  : "Comprobando conexión…"}
            </button>
            {chat.config?.modoFormulario === "omitible" && (
              <button
                className="btn secondary"
                type="button"
                disabled={chat.busy || !chat.config}
                onClick={() => chat.connect()}
              >
                Continuar sin estos datos
              </button>
            )}
          </form>
        </>
      ) : (
        <>
          <p className="helper">
            {manager
              ? "Atención humana en la conversación de Gestadia"
              : "Conectado a LidIA"}{" "}
            · Sincronización automática
          </p>
          <div className="conversation" aria-live="polite">
            {chat.messages.map((msg, i) => (
              <div
                className={`bubble ${msg.role}`}
                data-motion-new={animatedMessages.has(msg.message_id ?? msg.id ?? i) || undefined}
                key={`${msg.timestamp}-${i}`}
              >
                {msg.role === "manager" && (
                  <strong className="sender-label">Gestor · </strong>
                )}
                <AssistantContent content={msg.content} />
              </div>
            ))}
            {chat.pending && !pendingInHistory && (
              <div className="bubble user" data-motion-new>{chat.pending.text}</div>
            )}
            {chat.pending && (
              <p role="status" className="helper">
                {chat.uncertain
                  ? "Comprobando el estado del envío…"
                  : chat.pending.confirmed
                    ? "Mensaje recibido · Esperando respuesta de Gestadia"
                    : "Enviando a Gestadia…"}
              </p>
            )}
            {!chat.messages.length && !chat.pending && (
              <div className="chips">
                {Object.values(TOPICS).map((topic) => (
                  <button
                    key={topic.label}
                    onClick={() => chat.send(topic.label)}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            )}
            <div ref={end} />
          </div>
          {chat.uncertain && (
            <div className="stack">
              <button className="btn secondary" onClick={chat.reloadMessages}>
                Comprobar historial
              </button>
              <p className="helper">
                Si no aparece en el historial, puedes recuperar el texto. El
                primer envío podría llegar más tarde.
              </p>
              <button className="text-btn" onClick={chat.recoverDraft}>
                Recuperar texto sin reenviar
              </button>
            </div>
          )}
          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              chat.send(chat.draft);
            }}
          >
            <textarea
              aria-label="Mensaje a Gestadia"
              placeholder="¿Qué necesitas?"
              rows="1"
              maxLength={4000}
              value={chat.draft}
              onChange={(e) => chat.setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  chat.send(chat.draft);
                }
              }}
            />
            <VoiceButton onTranscript={chat.setDraft} onError={setVoiceError} />
            <button
              className="send-btn"
              disabled={
                Boolean(chat.pending && !chat.pending.confirmed) ||
                chat.draft.trim().length < 2
              }
              aria-label="Enviar a Gestadia"
            >
              <Icon name="send" />
            </button>
          </form>
          {voiceError && (
            <p role="status" className="helper">
              {voiceError}
            </p>
          )}
        </>
      )}
    </section>
  );
}
