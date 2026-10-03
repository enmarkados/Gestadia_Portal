import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import { demoEnabled, demoOnly } from "./api.js";
import Login from "./Login.jsx";
import { ProfileFields } from "./Services.jsx";
export default function Account() {
  const app = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(app.data.profile || {});
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (app.mode === "visitante" && demoOnly()) return <Login />;
  async function submit(e) {
    e.preventDefault();
    setError("");
    setStatus("");
    setBusy(true);
    try {
      if (app.mode === "visitante") {
        await app.login(email, password);
        setPassword("");
        navigate("/tramites");
      } else {
        await app.saveProfile(profile);
        setStatus(
          app.mode === "demo"
            ? "Datos actualizados en la demostración."
            : "Datos guardados en el portal.",
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <p className="eyebrow">TU ESPACIO GESTADIA</p>
      <h1>{app.mode === "visitante" ? "Entrar al portal" : "Mi cuenta"}</h1>
      {app.mode === "visitante" ? (
        <>
          <p className="muted">
            Accede con el email y la contraseña de tu cuenta Gestadia.
          </p>
          <form className="card form-card" onSubmit={submit}>
            <label>
              Email
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="btn primary" disabled={busy}>
              {busy ? "Entrando…" : "Entrar al portal"}
            </button>
            <a
              className="text-btn"
              href="https://gestadia.com/portal/recuperar"
            >
              Recuperar contraseña
            </a>
          </form>
          {demoEnabled() && (
            <div className="card form-card">
              <h2>Descubre la app</h2>
              <p className="helper">
                Recorre la experiencia con datos ficticios, sin enviar
                documentos ni solicitudes.
              </p>
              <button
                className="btn secondary"
                onClick={() => {
                  app.startDemo();
                  navigate("/");
                }}
              >
                Probar demostración
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <form className="card form-card" onSubmit={submit}>
            <h2>Datos personales</h2>
            <p className="helper">
              Revisa tus datos antes de presentar el trámite. Guardarlos no
              autoriza ni presenta ningún expediente.
            </p>
            <ProfileFields profile={profile} setProfile={setProfile} required />
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            {status && (
              <p role="status" className="success">
                {status}
              </p>
            )}
            <button className="btn primary" disabled={busy}>
              {busy ? "Guardando…" : "Guardar datos"}
            </button>
          </form>
          {app.mode === "demo" && (
            <div className="card form-card">
              <h2>Perfil de demostración</h2>
              <div className="chips">
                <button
                  onClick={() => {
                    app.startDemo("cliente", true);
                    navigate("/");
                  }}
                >
                  Cliente con trámite
                </button>
                <button
                  onClick={() => {
                    app.startDemo("lead", true);
                    navigate("/");
                  }}
                >
                  Lead sin trámite
                </button>
              </div>
              <p className="helper">
                Cambiar de perfil reinicia los datos ficticios.
              </p>
            </div>
          )}
          {demoOnly() && (
            <div className="card form-card">
              <h2>Acceso y registro</h2>
              <Link className="btn secondary" to="/acceso">
                Iniciar sesión
              </Link>
              <Link className="text-btn" to="/registro">
                Crear cuenta
              </Link>
              <Link className="text-btn" to="/informacion">
                Acerca de la demostración
              </Link>
            </div>
          )}
          <button
            className="btn secondary"
            onClick={() => {
              app.logout();
              navigate("/");
            }}
          >
            Cerrar sesión
          </button>
        </>
      )}
    </section>
  );
}
