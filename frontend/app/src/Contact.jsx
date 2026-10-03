import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import { demoOnly } from "./api.js";
import Sheet from "./Sheet.jsx";
import Icon from "./Icon.jsx";
export default function Contact({ onClose }) {
  const { isClient, mode, data } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: [data.profile?.nombre, data.profile?.apellidos]
      .filter(Boolean)
      .join(" "),
    telefono: data.profile?.telefono || "",
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  function submit(event) {
    event.preventDefault();
    if (mode !== "demo" && !demoOnly()) {
      setError("La solicitud de llamada aún no está conectada.");
      return;
    }
    setSent(true);
  }
  return (
    <Sheet
      title="Hablar con un gestor"
      className="contact-sheet"
      onClose={onClose}
      subtitle={
        !sent && isClient ? (
          <p className="manager-status">
            ✓ Juan Carlos Acero (Gestor asignado)
            {mode === "demo" ? " de guardia" : ""}
          </p>
        ) : null
      }
    >
      {sent ? (
        <div className="empty">
          <h3>Solicitud de ejemplo completada</h3>
          <p>
            No se ha enviado ninguna solicitud. En la app conectada, tu gestor
            recibirá los datos de contacto.
          </p>
          <button className="btn secondary" onClick={onClose}>
            Volver a la app
          </button>
        </div>
      ) : (
        <>
          <p className="contact-description">
            {isClient
              ? "Atención directa en la app con tu gestor asignado sin esperas ni desplazamientos."
              : "Solicita llamada de asesoramiento con un gestor sin compromiso."}
          </p>
          {isClient && (
            <>
              <button
                className="btn dark-btn contact-chat"
                onClick={() => {
                  onClose();
                  navigate("/mensajes/gestor");
                }}
              >
                <Icon name="message" size={20} />
                <span>Abrir Chat en la App con Juan Carlos</span>
              </button>
              <p className="contact-divider">o solicita que te llamemos</p>
            </>
          )}
          <form className="contact-form" onSubmit={submit}>
            <label>
              <span className="sr-only">Nombre y apellidos</span>
              <input
                type="text"
                autoComplete="name"
                placeholder="Tu nombre y apellidos *"
                required
                value={form.nombre}
                onChange={(e) =>
                  setForm((old) => ({ ...old, nombre: e.target.value }))
                }
              />
            </label>
            <label>
              <span className="sr-only">Teléfono de contacto</span>
              <input
                type="tel"
                autoComplete="tel"
                placeholder="Teléfono de contacto *"
                required
                value={form.telefono}
                onChange={(e) =>
                  setForm((old) => ({ ...old, telefono: e.target.value }))
                }
              />
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="btn primary">
              Solicitar llamada de un gestor
            </button>
          </form>
        </>
      )}
    </Sheet>
  );
}
