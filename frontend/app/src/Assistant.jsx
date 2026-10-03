import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import { useApp } from "./AppContext.jsx";
import { detectTopic, TOPICS } from "./qualification.js";
import { demoOnly } from "./api.js";
export default function Assistant({ onContact }) {
  const { data, setData, mode } = useApp();
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
      setVoiceError("El dictado está desactivado en esta demo sin conexiones. Puedes escribir tu consulta.");
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
  return (
    <section className="assistant-page">
      {!messages.length ? (
        <>
          <p className="eyebrow">TU ASISTENTE DE TRÁFICO</p>
          <h1>¿Qué trámite de Tráfico necesitas gestionar hoy?</h1>
          <p className="muted">
            Nuestro asistente LidIA te ayuda a preparar tu consulta. Tu gestor
            revisa los requisitos y acompaña tu trámite.
          </p>
          <div className="assistant-intro">
            <span className="avatar red">
              <Icon name="spark" />
            </span>
            <div>
              <strong>Consulta con LidIA</strong>
              <p>Sondeo inicial, paso a paso</p>
            </div>
          </div>
          <h2 className="small-heading">Consultas habituales</h2>
          <div className="stack">
            {Object.entries(TOPICS).map(([slug, value]) => (
              <button
                key={slug}
                className="card option"
                onClick={() => start(slug)}
              >
                <span>{value.label}</span>
                <Icon name="arrow" size={18} />
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
      <p className="helper">
        Sondeo guiado ·{" "}
        {mode === "demo"
          ? "Demostración, sin envío al gestor"
          : "Revisión por gestor pendiente"}
      </p>
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <textarea
          aria-label="Tu consulta"
          rows="1"
          maxLength={4000}
          placeholder="¿Qué necesitas?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          type="button"
          className={`icon-btn ${recording ? "recording" : ""}`}
          aria-label={recording ? "Detener dictado" : "Dictar consulta"}
          onClick={dictate}
        >
          <Icon name="mic" />
        </button>
        <button
          className="send-btn"
          disabled={input.trim().length < 2}
          aria-label="Enviar consulta"
        >
          <Icon name="send" size={20} />
        </button>
      </form>
      {voiceError && (
        <p role="status" className="helper">
          {voiceError}
        </p>
      )}
    </section>
  );
}
