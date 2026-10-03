import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import { request, demoOnly } from "./api.js";
import Sheet from "./Sheet.jsx";
export default function Contact({ onClose }) {
  const { isClient, mode, data } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: data.profile?.nombre || "",
    email: data.profile?.email || "",
    telefono: data.profile?.telefono || "",
    tramite: "Consulta general",
  });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode !== "demo" && !demoOnly()) {
        const health = await request("/api/health", {
          auth: false,
        });
        if (health.zoho !== "activo")
          throw new Error(
            "La solicitud de llamada no está disponible ahora. Inténtalo más tarde.",
          );
        const response = await request("/api/leads", {
          auth: false,
          method: "POST",
          body: JSON.stringify(form),
        });
        if (!response.ok) throw new Error("No se pudo registrar la solicitud.");
      }
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Sheet title="Hablar con un gestor" onClose={onClose}>
      {sent ? (
        <div className="empty">
          <h3>
            {mode === "demo" || demoOnly()
              ? "Solicitud de ejemplo completada"
              : "Solicitud recibida"}
          </h3>
          <p>
            {mode === "demo" || demoOnly()
              ? "No se ha enviado ninguna solicitud. En la app conectada, tu gestor recibirá los datos de contacto."
              : "Un gestor revisará tu solicitud y se pondrá en contacto contigo."}
          </p>
          <button className="btn secondary" onClick={onClose}>
            Volver a la app
          </button>
        </div>
      ) : (
        <>
          <div className="manager-identity">
            <span className="avatar dark">JA</span>
            <div>
              <strong>Juan Carlos Acero</strong>
              <p>Gestor colegiado · Gestadia</p>
            </div>
          </div>
          {isClient && (
            <button
              className="btn dark-btn"
              onClick={() => {
                onClose();
                navigate("/mensajes/gestor");
              }}
            >
              Abrir chat con Juan Carlos
            </button>
          )}
          <h3>Solicitar una llamada</h3>
          <form className="form-card" onSubmit={submit}>
            {[
              ["nombre", "Nombre", "text"],
              ["telefono", "Teléfono", "tel"],
              ["email", "Email", "email"],
            ].map(([key, label, type]) => (
              <label key={key}>
                {label}
                <input
                  type={type}
                  required
                  value={form[key]}
                  onChange={(e) =>
                    setForm((old) => ({
                      ...old,
                      [key]: e.target.value,
                    }))
                  }
                />
              </label>
            ))}
            <label>
              Trámite
              <select
                value={form.tramite}
                onChange={(e) =>
                  setForm((old) => ({
                    ...old,
                    tramite: e.target.value,
                  }))
                }
              >
                <option>Consulta general</option>
                <option>Canje de carnet</option>
                <option>Transferencia de vehículo</option>
                <option>Duplicado de carnet</option>
              </select>
            </label>
            <label className="checkbox">
              <input type="checkbox" required />
              {demoOnly()
                ? "Quiero probar esta solicitud de ejemplo."
                : "Acepto que Gestadia utilice estos datos para atender mi solicitud."}
            </label>
            {demoOnly() ? (
              <Link className="text-btn" to="/informacion" onClick={onClose}>
                Acerca de la demostración
              </Link>
            ) : (
              <a
                className="text-btn"
                href="https://gestadia.com/privacidad"
                target="_blank"
                rel="noreferrer"
              >
                Política de privacidad
              </a>
            )}
            {mode === "demo" && (
              <p className="notice">
                Demostración: no se enviará la solicitud.
              </p>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="btn primary" disabled={busy}>
              {busy ? "Enviando…" : "Solicitar llamada"}
            </button>
          </form>
        </>
      )}
    </Sheet>
  );
}
