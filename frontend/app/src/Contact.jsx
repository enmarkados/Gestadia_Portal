import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, Phone, Check } from "lucide-react";
import { navigationState } from "./navigation.js";
import { useApp } from "./AppContext.jsx";
import { request } from "./api.js";
import Sheet from "./Sheet.jsx";
import ChatLoading from "./ChatLoading.jsx";
export default function Contact({ onClose, closing }) {
  const { data } = useApp(), navigate = useNavigate(), location = useLocation();
  const alive = useRef(true), key = useRef(crypto.randomUUID());
  const [target, setTarget] = useState(null), [error, setError] = useState(""), [busy, setBusy] = useState(false), [sent, setSent] = useState(null);
  const [form, setForm] = useState({ nombre: [data.profile?.nombre, data.profile?.apellidos].filter(Boolean).join(" "), telefono: data.profile?.telefono || "" });
  async function load() {
    setError("");
    try { const result = await request("/api/app/contact/context"); if (alive.current) setTarget(result); }
    catch { if (alive.current) { setTarget({ kind: "call" }); setError("No hemos podido comprobar tu gestor. Puedes solicitar que te llame."); } }
  }
  useEffect(() => { alive.current = true; load(); return () => { alive.current = false; }; }, []);
  async function submit(e) {
    e.preventDefault(); if (busy) return; setBusy(true); setError("");
    try {
      const result = await request("/api/app/contact/callback", { method: "POST", headers: { "Idempotency-Key": key.current }, body: JSON.stringify(form) });
      if (alive.current) setSent(result.status);
    } catch { if (alive.current) setError("No se pudo enviar la solicitud. Tus datos se conservan; vuelve a intentarlo."); }
    finally { if (alive.current) setBusy(false); }
  }
  async function openChat() {
    if (busy) return; setBusy(true); setError("");
    try {
      for (let n = 0; n < 20 && alive.current; n++) {
        const result = await request("/api/app/contact/chat", { method: "POST", headers: { "Idempotency-Key": key.current }, body: "{}" });
        if (!alive.current) return;
        if (!result.pending) { onClose(() => navigate(`/mensajes/gestor?conversacion=${encodeURIComponent(result.conversation.id)}&caso=${encodeURIComponent(result.conversation.case_ref)}`, { state: navigationState(location) })); return; }
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      if (alive.current) setError("Estamos preparando el chat. Vuelve a intentarlo; conservaremos la misma conversación.");
    } catch { if (alive.current) setError("El chat de tu gestor no está disponible ahora. Puedes solicitar una llamada o reintentar."); }
    finally { if (alive.current) setBusy(false); }
  }
  return <Sheet title="Hablar con un gestor" className="contact-sheet" onClose={onClose} closing={closing}>
    {sent ? <div className="contact-confirmation"><span className="notification-check"><Check size={25} /></span><h3>{sent === "confirmed" ? "Llamada solicitada" : "Solicitud registrada"}</h3><p>{sent === "confirmed" ? "Un gestor tiene tu solicitud y te llamará al teléfono indicado." : "Tus datos se han guardado. La confirmación del envío al gestor está pendiente; no necesitas volver a enviarlos."}</p><button className="btn secondary" onClick={onClose}>Volver a la app</button></div> : <>
      {!target && <ChatLoading compact label="Comprobando cómo puede atenderte tu gestor…" />}
      {target?.kind === "manager" && <div className="contact-manager"><span className="avatar dark"><MessageSquare size={21} /></span><div><strong>{target.manager_name}</strong><p>Tu gestor asignado</p></div></div>}
      <p className="contact-description">{target?.kind === "manager" ? "Habla con tu gestor sobre el trámite. Puedes abrir el chat o pedir que te llame." : "Déjanos tu nombre y teléfono para que un gestor te llame y te ayude con tu trámite."}</p>
      {target?.kind === "manager" && <><button className="btn dark-btn contact-chat" disabled={busy} onClick={openChat}><MessageSquare size={19} /><span>{busy ? "Abriendo chat…" : `Abrir chat con ${target.manager_name}`}</span></button><p className="contact-divider">O solicita una llamada</p></>}
      <form className="contact-form" onSubmit={submit}>
        <label>Nombre y apellidos<input autoComplete="name" type="text" required minLength={2} maxLength={120} placeholder="Tu nombre y apellidos" value={form.nombre} onChange={e => setForm(old => ({...old,nombre:e.target.value}))} disabled={busy} /></label>
        <label>Teléfono de contacto<input autoComplete="tel" type="tel" required placeholder="Tu teléfono, con prefijo si es internacional" value={form.telefono} onChange={e => setForm(old => ({...old,telefono:e.target.value}))} disabled={busy} /></label>
        <p className="helper">Usaremos estos datos para que un gestor contacte contigo por esta solicitud. <Link to="/legal/privacy" state={navigationState(location)}>Privacidad</Link></p>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn primary" disabled={busy}>{busy ? "Enviando…" : "Solicitar llamada de un gestor"}</button>
      </form>
    </>}
  </Sheet>;
}
