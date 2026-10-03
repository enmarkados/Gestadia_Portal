import React from "react";
import Icon from "./Icon.jsx";

export default function ChatComposer({
  value,
  onChange,
  onSend,
  onDictate,
  label,
  sendLabel,
  recording = false,
  status,
}) {
  return (
    <>
      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
      >
        <textarea
          aria-label={label}
          rows="1"
          maxLength={4000}
          placeholder="¿Qué necesitas?"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              onSend();
            }
          }}
        />
        <button
          type="button"
          className={`icon-btn ${recording ? "recording" : ""}`}
          aria-label={recording ? "Detener dictado" : "Dictar consulta"}
          onClick={onDictate}
        >
          <Icon name="mic" size={20} />
        </button>
        <button className="send-btn" aria-label={sendLabel}>
          <Icon name="send" size={18} />
        </button>
      </form>
      {status && (
        <p role="status" className="helper">
          {status}
        </p>
      )}
    </>
  );
}
