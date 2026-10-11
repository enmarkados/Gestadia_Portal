import React from "react";
import { Link, useLocation } from "react-router-dom";
import { navigationState } from "./navigation.js";
import { useApp } from "./AppContext.jsx";
import Sheet from "./Sheet.jsx";
import PushSettings from "./PushSettings.jsx";
import Icon from "./Icon.jsx";
export default function Notifications({ onClose, closing }) {
  const location = useLocation();
  const { data } = useApp();
  const pending = data.notifications.filter((item) => !item.leida).length;
  return (
    <Sheet
      title="Notificaciones y Avisos"
      className="notifications-sheet"
      closeLabel="Cerrar notificaciones"
      onClose={onClose}
      closing={closing}
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
              <strong>{item.titulo}</strong>
              <p>{item.mensaje || item.cuerpo}</p>
              {item.expedienteId && (
                <Link
                  className="notification-action"
                  to={`/tramites/${encodeURIComponent(item.expedienteId)}`}
                  state={navigationState(location)}
                  onClick={onClose}
                >
                  Subir documentación ahora ›
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
    </Sheet>
  );
}
