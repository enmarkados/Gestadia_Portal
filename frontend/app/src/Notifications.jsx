import React, { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, Mail, MailOpen, ChevronRight } from "lucide-react";
import { navigationState } from "./navigation.js";
import { notificationDestination } from "./notificationDestination.js";
import { useApp } from "./AppContext.jsx";
import Sheet from "./Sheet.jsx";
import PushSettings from "./PushSettings.jsx";
import Icon from "./Icon.jsx";
function Notice({ item, onOpen, onRead, busy }) {
  const gesture = useRef(null), suppressClick = useRef(false);
  const [offset, setOffset] = useState(0), [dragging, setDragging] = useState(false);
  const action = item.leida ? "Marcar como no leída" : "Marcar como leída";
  function reset() { gesture.current = null; setOffset(0); setDragging(false); }
  return <article className={`notification-swipe ${item.leida ? "" : "unread"}`}>
    <div className="notification-swipe-action" aria-hidden="true">{item.leida ? <Mail size={20} /> : <Check size={20} />}</div>
    <div className={`notification-card ${dragging ? "dragging" : ""}`} style={{ transform: `translateX(${offset}px)` }}
      onPointerDown={e => { suppressClick.current = false; if (!busy && e.isPrimary !== false && e.button === 0) gesture.current = { x: e.clientX, y: e.clientY, id: e.pointerId }; }}
      onPointerMove={e => {
        const g = gesture.current; if (!g || g.id !== e.pointerId) return;
        const x = e.clientX - g.x, y = e.clientY - g.y;
        if (!dragging && Math.abs(y) > Math.abs(x) && Math.abs(y) > 8) { reset(); return; }
        if (Math.abs(x) > 10 && Math.abs(x) > Math.abs(y)) { setDragging(true); suppressClick.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); setOffset(Math.max(-96, Math.min(0, x))); }
      }}
      onPointerUp={() => { const apply = offset < -64; reset(); if (apply) onRead(item); }} onPointerCancel={reset}>
      <div className="notification-meta"><span>{item.leida ? "Leída" : "No leída"}</span><time dateTime={item.createdAt}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : ""}</time></div>
      <Link className="notification-content" to={notificationDestination(item)} onClick={e => { e.preventDefault(); if (suppressClick.current) { suppressClick.current = false; return; } if (!dragging && !busy) onOpen(item); }}>
        <div><strong>{item.titulo}</strong><p>{item.mensaje || item.cuerpo}</p></div><ChevronRight size={18} aria-hidden="true" />
      </Link>
      <button type="button" className="notification-read-action" disabled={busy} onClick={() => onRead(item)}>{item.leida ? <Mail size={15} /> : <MailOpen size={15} />} {action}</button>
    </div>
  </article>;
}
export default function Notifications({ onClose, closing }) {
  const location = useLocation(), navigate = useNavigate();
  const { data, setNotificationRead } = useApp();
  const [filter, setFilter] = useState("all"), [busy, setBusy] = useState(null), [error, setError] = useState("");
  const pending = data.notifications.filter(item => !item.leida).length;
  const items = data.notifications.filter(item => filter === "all" || (filter === "read" ? item.leida : !item.leida));
  async function read(item, value = !item.leida, open = false) {
    if (busy) return;
    setBusy(item.id); setError("");
    try {
      if (item.leida !== value) await setNotificationRead(item.id, value);
      if (open) onClose(() => navigate(notificationDestination(item), { state: navigationState(location) }));
    } catch { setError("No se pudo actualizar el aviso. Reintenta con conexión."); }
    finally { setBusy(null); }
  }
  return <Sheet title="Notificaciones" className="notifications-sheet" closeLabel="Cerrar notificaciones" onClose={onClose} closing={closing}
    icon={<span className={`notification-icon ${pending ? "priority" : ""}`}><Icon name="bell" size={18} /></span>}
    subtitle={<p className={`notification-counter ${pending ? "priority" : ""}`}>{pending ? `${pending} ${pending === 1 ? "aviso sin leer" : "avisos sin leer"}` : "Estás al día"}</p>}>
    <PushSettings promptOnly />
    {!!data.notifications.length && <div className="notification-filters" role="group" aria-label="Filtrar notificaciones">
      {[["all", "Todas"], ["unread", "No leídas"], ["read", "Leídas"]].map(([value,label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}{value === "unread" && pending > 0 && <span>{pending}</span>}</button>)}
    </div>}
    {error && <p className="error" role="alert">{error}</p>}
    {!items.length ? <div className="notification-empty"><span className="notification-check"><Icon name="check" size={24} /></span><h3>{filter === "unread" ? "Todo leído" : filter === "read" ? "Sin avisos leídos" : "Estás al día"}</h3>
      <p>{data.notifications.length ? "Prueba otro filtro para ver tus avisos." : "Aquí aparecerán los mensajes de tu gestor y las actualizaciones de tus trámites."}</p>
      {!data.notifications.length && <Link className="btn primary" to="/servicios" onClick={e => { e.preventDefault(); onClose(() => navigate("/servicios", {state:navigationState(location)})); }}>Ver Servicios</Link>}
    </div> : <div className="notification-list">{items.map(item => <Notice key={item.id} item={item} busy={busy === item.id} onRead={read} onOpen={item => read(item, true, true)} />)}<p className="helper notification-gesture-hint">Desliza un aviso a la izquierda para cambiar su estado de lectura.</p></div>}
  </Sheet>;
}
