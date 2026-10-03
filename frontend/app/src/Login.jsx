import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import { demoOnly } from "./api.js";
import Icon from "./Icon.jsx";

export default function Login() {
  const app = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [recovery, setRecovery] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (demoOnly()) app.startDemo("cliente", true);
      else await app.login(email, password);
      setPassword("");
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-page">
      <p className="eyebrow">BIENVENIDO A GESTADIA</p>
      <h1>Tu gestoría, siempre contigo.</h1>
      <p className="muted">
        Accede a tus trámites, documentación y conversaciones en un solo lugar.
      </p>
      <form className="card form-card" onSubmit={submit}>
        <h2>Iniciar sesión</h2>
        <label>
          Email
          <input
            type="email"
            autoComplete="username"
            placeholder="tu@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Contraseña
          <span className="password-field">
            <input
              type={visible ? "text" : "password"}
              aria-label="Contraseña"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="icon-btn password-toggle"
              type="button"
              aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={visible}
              onClick={() => setVisible(!visible)}
            >
              <Icon name={visible ? "eyeOff" : "eye"} size={22} />
            </button>
          </span>
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button className="btn primary" disabled={busy}>
          {busy ? "Entrando…" : "Entrar al portal"}
        </button>
        {demoOnly() ? (
          <button
            className="text-btn password-recovery"
            type="button"
            onClick={() => setRecovery(true)}
          >
            ¿Has olvidado tu contraseña?
          </button>
        ) : (
          <a
            className="text-btn password-recovery"
            href="https://gestadia.com/portal/recuperar"
          >
            ¿Has olvidado tu contraseña?
          </a>
        )}
        {recovery && (
          <p role="status" className="notice">
            En esta demo puedes entrar con cualquier email válido y una
            contraseña de ejemplo. No se envían emails ni se guardan
            contraseñas.
          </p>
        )}
        {demoOnly() && (
          <p className="notice">
            Demostración: estos datos no se envían. Usa una contraseña de
            ejemplo.
          </p>
        )}
      </form>
      <p className="auth-switch">
        ¿Es tu primera vez?{" "}
        <Link className="text-btn" to="/registro">
          Crear cuenta
        </Link>
      </p>
      <button
        className="btn secondary"
        onClick={() => {
          app.startDemo();
          navigate("/");
        }}
      >
        Explorar la demostración
      </button>
    </section>
  );
}
