import React from "react";
export default function ChatLoading({ label = "Cargando mensajes…", compact = false }) {
  return <div className={`chat-loading${compact ? " is-compact" : ""}`} role="status" aria-live="polite" aria-atomic="true">
    <picture aria-hidden="true">
      <source media="(prefers-reduced-motion: reduce)" srcSet="/loading/gestadia-loading-still.png" />
      <img src="/loading/gestadia-loading.gif" width="48" height="48" alt="" />
    </picture>
    <p>{label}</p>
  </div>;
}
