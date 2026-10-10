import React, { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
export default function VoiceButton({ onTranscript, onError }) {
  const [recording, setRecording] = useState(false);
  const recognition = useRef(null);
  useEffect(() => () => recognition.current?.abort(), []);
  function dictate() {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      onError(
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
    engine.onresult = (event) =>
      onTranscript(event.results[0][0].transcript.slice(0, 4000));
    engine.onerror = () => {
      onError("No se pudo usar el micrófono. Puedes escribir tu consulta.");
      setRecording(false);
    };
    engine.onend = () => setRecording(false);
    try {
      engine.start();
      setRecording(true);
      onError("");
    } catch {
      onError("No se pudo iniciar el dictado.");
    }
  }
  return (
    <button
      type="button"
      className={`icon-btn ${recording ? "recording" : ""}`}
      aria-label={recording ? "Detener dictado" : "Dictar consulta"}
      onClick={dictate}
    >
      <Icon name="mic" />
    </button>
  );
}
