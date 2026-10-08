import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import Sheet from "./Sheet.jsx";
import PushSettings from "./PushSettings.jsx";
import Icon from "./Icon.jsx";
export default function Notifications({ onClose }) {
  const { data, mode, isClient } = useApp();
  const pending = data.notifications.filter((item) => !item.leida).length;
  const expediente = data.expedientes[0];
  return (
    <Sheet
      title="Notificaciones y Avisos"
      className="notifications-sheet"
      closeLabel="Cerrar notificaciones"
      onClose={onClose}
      icon={
        <span className={`notification-icon ${pending ? "priority" : ""}`}>
          <Icon name="bell" size={18} />
        </span>
      }
      subtitle={
        <p className={`notification-counter ${pending ? "priority" : ""}`}>
          {pending
            ? `${pending} ${pending === 1 ? "acción prioritaria pendiente" : "acciones prioritarias pendientes"}`
            : "Estás al día"}
        </p>
      }
    >
      <PushSettings />
      {!data.notifications.length ? (
        <div className="notification-empty">
          <span className="notification-check">
            <Icon name="check" size={24} />
          </span>
          <h3>Estás al día</h3>
          <p>
            No tienes notificaciones pendientes. Cuando inicies un trámite, aquí
            verás las actualizaciones y requerimientos de tu expediente.
          </p>
          <Link className="btn primary" to="/servicios" onClick={onClose}>
            Ver Servicios
          </Link>
        </div>
      ) : (
        <div className="notification-list">
          {data.notifications.map((item) => (
            <article
              key={item.id}
              className={`notification-card ${item.leida ? "" : "priority"}`}
            >
              <div className="notification-meta">
                <span>{item.leida ? "Actualización" : "Acción requerida"}</span>
                {!item.leida && (
                  <span
                    className="notification-unread"
                    aria-label="Pendiente"
                  />
                )}
              </div>
              <strong>
                {mode === "demo" && item.id === "demo-aviso" && expediente
                  ? `Actualización de tu expediente ${expediente.nPedido}`
                  : item.titulo}
              </strong>
              <p>
                {mode === "demo" && item.id === "demo-aviso"
                  ? `Tu gestor Juan Carlos Acero solicita que subas la foto del carnet original${expediente?.paisCanje ? ` de ${expediente.paisCanje}` : ""} y el psicotécnico.`
                  : item.mensaje || item.cuerpo}
              </p>
              {item.expedienteId && (
                <Link
                  className="notification-action"
                  to={`/tramites/${encodeURIComponent(item.expedienteId)}`}
                  onClick={onClose}
                >
                  Subir documentación ahora ›
                </Link>
              )}
            </article>
          ))}
          {mode === "demo" && isClient && expediente && (
            <article className="notification-card">
              <div className="notification-meta">Asignación</div>
              <strong>Juan Carlos Acero ha sido asignado a tu trámite</strong>
              <p>
                Canje de carnet extranjero
                {expediente.paisCanje
                  ? ` (${expediente.paisCanje} → España)`
                  : ""}{" "}
                en tramitación telemática.
              </p>
            </article>
          )}
        </div>
      )}
    </Sheet>
  );
}
