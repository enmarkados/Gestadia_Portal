import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import ChatComposer from "./ChatComposer.jsx";
import { useApp } from "./AppContext.jsx";
import { detectTopic, TOPICS } from "./qualification.js";
import { demoOnly } from "./api.js";
export default function Assistant({ onContact }) {
  const { data, setData } = useApp();
  const [composerHost, setComposerHost] = useState(null);
  useLayoutEffect(() => {
    setComposerHost(document.getElementById("lidia-composer"));
  }, []);
  const [topic, setTopic] = useState(data.assistantState?.topic || null);
  const [answers, setAnswers] = useState(data.assistantState?.answers || {});
  const [messages, setMessages] = useState(data.assistantState?.messages || []);
  const [input, setInput] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [recording, setRecording] = useState(false);
  const recognition = useRef(null);
  const end = useRef(null);
  const step = topic ? Object.keys(answers).length : 0;
  const question = TOPICS[topic]?.questions[step];
  useEffect(() => {
    setData((old) => ({
      ...old,
      assistantState: {
        topic,
        answers,
        messages,
      },
    }));
  }, [topic, answers, messages]);
  useEffect(() => {
    end.current?.scrollIntoView?.({
      block: "end",
    });
  }, [messages]);
  useEffect(() => () => recognition.current?.abort(), []);
  function start(slug, text) {
    setTopic(slug);
    setAnswers({});
    setMessages([
      {
        role: "user",
        content: text || TOPICS[slug].label,
      },
      {
        role: "assistant",
        content: `Vamos a recoger los datos para que un gestor revise tu caso. ${TOPICS[slug].questions[0].text}`,
      },
    ]);
  }
  function send(text = input) {
    if (text.trim().length < 2) return;
    text = text.trim();
    setInput("");
    if (!topic) {
      const found = detectTopic(text);
      if (found) start(found, text);
      else
        setMessages((old) => [
          ...old,
          {
            role: "user",
            content: text,
          },
          {
            role: "assistant",
            content:
              "Puedo ayudarte a preparar un canje, una transferencia o un duplicado. Elige un trámite o solicita que un gestor revise tu consulta.",
          },
        ]);
      return;
    }
    if (!question) {
      setMessages((old) => [
        ...old,
        {
          role: "user",
          content: text,
        },
        {
          role: "assistant",
          content:
            "He añadido tu comentario. Un gestor debe confirmar los requisitos de tu caso antes de presentar el trámite.",
        },
      ]);
      return;
    }
    const nextAnswers = {
      ...answers,
      [question.key]: text,
    };
    setAnswers(nextAnswers);
    const nextQuestion = TOPICS[topic].questions[step + 1];
    setMessages((old) => [
      ...old,
      {
        role: "user",
        content: text,
      },
      {
        role: "assistant",
        content: nextQuestion
          ? nextQuestion.text
          : "Gracias. Ya tenemos tus respuestas iniciales. La viabilidad y la documentación definitiva quedan pendientes de revisión por un gestor. Puedes consultar el servicio o solicitar una llamada.",
      },
    ]);
    if (!nextQuestion)
      setData((old) => ({
        ...old,
        profile: nextAnswers.paisCanje
          ? {
              ...old.profile,
              paisCanje: nextAnswers.paisCanje,
            }
          : old.profile,
        consultations: [
          {
            topic,
            answers: nextAnswers,
            date: new Date().toISOString(),
          },
          ...old.consultations,
        ],
      }));
  }
  function dictate() {
    if (demoOnly()) {
      setVoiceError(
        "El dictado está desactivado en esta demo sin conexiones. Puedes escribir tu consulta.",
      );
      return;
    }
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceError(
        "Tu navegador no admite dictado. Puedes usar el micrófono del teclado o escribir.",
      );
      return;
    }
    if (recording) {
      recognition.current?.stop();
      return;
    }
    const engine = new Recognition();
    recognition.current = engine;
    engine.lang = "es-ES";
    engine.onresult = (event) => setInput(event.results[0][0].transcript);
    engine.onerror = () => {
      setVoiceError(
        "No se pudo usar el micrófono. Puedes escribir tu consulta.",
      );
      setRecording(false);
    };
    engine.onend = () => setRecording(false);
    try {
      engine.start();
      setRecording(true);
      setVoiceError("");
    } catch {
      setVoiceError("No se pudo iniciar el dictado.");
    }
  }
  const composer = (
    <ChatComposer
      value={input}
      onChange={setInput}
      onSend={send}
      onDictate={dictate}
      label="Tu consulta"
      sendLabel="Enviar consulta"
      recording={recording}
      status={voiceError}
    />
  );
  return (
    <section className="assistant-page">
      {!messages.length ? (
        <>
          <h1>¿Qué trámite de Tráfico necesitas gestionar hoy?</h1>
          <p className="muted">
            Nuestro asistente LidIA cualifica tus requisitos al instante. Tras
            contratar, tu gestor tramita tu expediente sin cita previa.
          </p>
          <div className="stack">
            {Object.entries(TOPICS).map(([slug, value]) => (
              <button
                key={slug}
                className="card option"
                onClick={() => start(slug)}
              >
                <span>
                  {slug === "canje-carnet"
                    ? "Quiero canjear mi carnet de conducir extranjero"
                    : slug === "transferencia"
                      ? "Cómo transferir un coche y cambiar titular"
                      : "He perdido el carnet y necesito un duplicado urgente"}
                </span>
                <span className="probe-chevron" aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="section-head">
            <div>
              <p className="eyebrow">LIDIA</p>
              <h1 className="compact-title">Tu consulta</h1>
            </div>
            <button
              className="text-btn"
              onClick={() => {
                setMessages([]);
                setTopic(null);
                setAnswers({});
              }}
            >
              Nueva consulta
            </button>
          </div>
          <div className="conversation" aria-live="polite">
            {messages.map((msg, i) => (
              <div className={`bubble ${msg.role}`} key={i}>
                {msg.content}
              </div>
            ))}
            {question && (
              <div className="chips">
                {question.options.map((answer) => (
                  <button key={answer} onClick={() => send(answer)}>
                    {answer}
                  </button>
                ))}
              </div>
            )}
            {topic && !question && (
              <div className="stack">
                <Link
                  className="btn primary"
                  to={`/servicios?servicio=${topic}`}
                >
                  Ver Servicios DGT
                </Link>
                <button className="btn secondary" onClick={onContact}>
                  Hablar con un gestor
                </button>
              </div>
            )}
            <div ref={end} />
          </div>
        </>
      )}
      {composerHost && createPortal(composer, composerHost)}
    </section>
  );
}
