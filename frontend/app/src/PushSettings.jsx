import React, { useState } from "react";
import { enablePush, disablePush, pushAvailable } from "./push.js";
import { useApp } from "./AppContext.jsx";
export default function PushSettings() {
  const app = useApp();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (app.mode !== "real" || !pushAvailable()) return null;
  async function run(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch {
      setError("No se pudo cambiar la inscripción. Reintenta con conexión.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="card">
      <h3>Avisos en este dispositivo</h3>
      <p>
        Recibe avisos de actualizaciones de Gestadia. El detalle se consulta al
        abrir la app.
      </p>
      <p role="status">{app.pushStatus}</p>
      <button
        className="btn secondary"
        disabled={busy}
        onClick={() => run(enablePush)}
      >
        Activar notificaciones
      </button>
      <button
        className="text-btn"
        disabled={busy}
        onClick={() => run(disablePush)}
      >
        Desactivar en este dispositivo
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
