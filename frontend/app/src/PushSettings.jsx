import React, { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { enablePush, disablePush, pushAvailable } from "./push.js";
import { useApp } from "./AppContext.jsx";
export default function PushSettings({ promptOnly = false }) {
  const app = useApp();
  const [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const status = app.pushStatus || "";
  const active = status === "Activadas";
  const configured = active || status.startsWith("Desactivadas");
  const pending = status === "Activando notificaciones…";
  if (app.mode !== "real" || !pushAvailable() || (promptOnly && configured)) return null;
  async function change() {
    setBusy(true); setError("");
    try { await (active ? disablePush() : enablePush()); }
    catch { setError("No se pudo completar el cambio. Reintenta con conexión."); }
    finally { setBusy(false); }
  }
  return (
    <div className={`push-settings ${promptOnly ? "push-prompt" : ""}`}>
      <div className="push-settings-row">
        <span className="push-settings-icon">{active ? <BellRing size={21} /> : <Bell size={21} />}</span>
        <div><h3>{promptOnly ? "Activa los avisos" : "Notificaciones"}</h3>
          <p>{promptOnly ? "Entérate cuando tu gestor te escriba o avance tu trámite." : "Avisos de tus chats y trámites en este dispositivo."}</p></div>
        {!promptOnly && configured && <button type="button" role="switch" aria-checked={active} aria-label="Notificaciones en este dispositivo" className={`settings-switch ${active ? "on" : ""}`} disabled={busy} onClick={change}><span /></button>}
      </div>
      {(!configured || promptOnly) && <button className="btn dark-btn" disabled={busy || pending} onClick={change}>{busy || pending ? "Activando…" : "Activar notificaciones"}</button>}
      {!promptOnly && active && <p className="success push-feedback" role="status">Notificaciones activadas.</p>}
      {!promptOnly && status.startsWith("Desactivadas") && <p className="push-disabled push-feedback" role="status">{status}</p>}
      {!active && !status.startsWith("Desactivadas") && status && <p className="helper" role="status">{status}</p>}
      {!promptOnly && <p className="helper">Puedes cambiar este ajuste cuando quieras desde Mi Perfil.</p>}
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
