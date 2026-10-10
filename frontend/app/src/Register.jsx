import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import { conversationsEnabled } from "./conversationApi.js";
import Icon from "./Icon.jsx";
import LegalLinks from "./LegalLinks.jsx";
import {
  accessDestination,
  authFlowState,
  navigationState,
} from "./navigation.js";

export default function Register() {
  const app = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  function submit(event) {
    event.preventDefault();
    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    app.startDemo("lead", true);
    app.setData((old) => ({
      ...old,
      profile: {
        ...old.profile,
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
      },
    }));
    setForm((old) => ({ ...old, password: "", confirm: "" }));
    const destination = accessDestination(location);
    navigate(destination.to, { state: destination.state, replace: true });
  }
  if (conversationsEnabled())
    return (
      <section className="auth-page">
        <h1>Tu cuenta Gestadia</h1>
        <p>
          Usa el acceso compartido con tu portal. Si has recibido una
          invitación, verifica el correo y crea tu contraseña mediante ese
          enlace.
        </p>
        <Link
          className="btn primary"
          to="/acceso"
          state={authFlowState(location)}
        >
          Iniciar sesión
        </Link>
        <LegalLinks compact />
      </section>
    );
  return (
    <section className="auth-page">
      <p className="eyebrow">EMPIEZA CON GESTADIA</p>
      <h1>Crea tu espacio.</h1>
      <p className="muted">
        Prepara tu próxima gestión y ten toda la información a mano.
      </p>
      <form className="card form-card" onSubmit={submit}>
        <h2>Crear cuenta</h2>
        <label>
          Nombre
          <input
            required
            autoComplete="given-name"
            maxLength={100}
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
        </label>
        <label>
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Teléfono <span className="helper">(opcional)</span>
          <input
            type="tel"
            autoComplete="tel"
            maxLength={30}
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />
        </label>
        <label>
          Contraseña
          <span className="password-field">
            <input
              required
              type={showPassword ? "text" : "password"}
              aria-label="Contraseña"
              autoComplete="new-password"
              aria-describedby="password-helper"
              minLength={8}
              maxLength={128}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              className="icon-btn password-toggle"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              <Icon name={showPassword ? "eyeOff" : "eye"} size={22} />
            </button>
          </span>
        </label>
        <p id="password-helper" className="helper">
          Al menos 8 caracteres.
        </p>
        <label>
          Repetir contraseña
          <span className="password-field">
            <input
              required
              type={showConfirmation ? "text" : "password"}
              aria-label="Repetir contraseña"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
            <button
              type="button"
              className="icon-btn password-toggle"
              aria-label={
                showConfirmation
                  ? "Ocultar repetición de contraseña"
                  : "Mostrar repetición de contraseña"
              }
              aria-pressed={showConfirmation}
              onClick={() => setShowConfirmation(!showConfirmation)}
            >
              <Icon name={showConfirmation ? "eyeOff" : "eye"} size={22} />
            </button>
          </span>
        </label>
        <p className="notice">
          Registro de demostración: no crea una cuenta real ni envía datos. Las
          contraseñas no se guardan.
        </p>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button className="btn primary">Crear cuenta de ejemplo</button>
        <Link
          className="text-btn"
          to="/informacion"
          state={navigationState(location)}
        >
          Acerca de esta demostración
        </Link>
      </form>
      <p className="auth-switch">
        ¿Ya tienes cuenta?{" "}
        <Link className="text-btn" to="/acceso" state={authFlowState(location)}>
          Iniciar sesión
        </Link>
      </p>
      <LegalLinks compact />
    </section>
  );
}
