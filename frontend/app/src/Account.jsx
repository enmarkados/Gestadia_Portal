import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import Login from "./Login.jsx";
import { ProfileFields } from "./Services.jsx";
import { AccountAvatar } from "./AccountMenu.jsx";
import AccountDeletion from "./AccountDeletion.jsx";
import LegalLinks from "./LegalLinks.jsx";
import SocialAccess from "./SocialAccess.jsx";
import PushSettings from "./PushSettings.jsx";
import Icon from "./Icon.jsx";

function SectionHeading({ icon, title, children }) {
  return (
    <div className="account-section-heading">
      <span>
        <Icon name={icon} />
      </span>
      <div>
        <h2>{title}</h2>
        {children && <p className="helper">{children}</p>}
      </div>
    </div>
  );
}

function PreferenceSwitch({ label, checked, onChange, disabled }) {
  return (
    <div className="preference-row">
      <strong>{label}</strong>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        disabled={disabled}
        className="preference-switch"
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}

function PasswordSettings() {
  const { mode } = useApp();
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });
  const [visible, setVisible] = useState({});
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  function submit(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    if (values.next !== values.confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (values.next === values.current) {
      setError("La nueva contraseña debe ser diferente de la actual.");
      return;
    }
    if (mode !== "demo") {
      setError(
        "El cambio de contraseña real no está conectado en esta versión.",
      );
      return;
    }
    setValues({ current: "", next: "", confirm: "" });
    setVisible({});
    setStatus(
      "Ejemplo completado. No se ha cambiado una contraseña real ni se ha guardado la contraseña escrita.",
    );
  }
  if (mode !== "demo")
    return (
      <div>
        <p className="helper">
          El cambio de contraseña desde la app aún no está disponible. Puedes
          recuperar tu acceso desde el portal.
        </p>
        <a
          className="text-btn"
          href="https://gestadia.com/portal/recuperar"
          target="_blank"
          rel="noopener noreferrer"
        >
          Recuperar acceso
        </a>
      </div>
    );
  return (
    <form className="form-card" onSubmit={submit}>
      <p className="helper">
        Usa contraseñas de ejemplo. En esta demostración no se valida la
        contraseña actual ni se guardan contraseñas.
      </p>
      {[
        ["current", "Contraseña actual"],
        ["next", "Nueva contraseña"],
        ["confirm", "Confirmar nueva contraseña"],
      ].map(([key, label]) => (
        <label key={key}>
          {label}
          <span className="password-field">
            <input
              aria-label={label}
              required
              minLength={key === "current" ? 1 : 8}
              maxLength={128}
              autoComplete={
                key === "current" ? "current-password" : "new-password"
              }
              type={visible[key] ? "text" : "password"}
              value={values[key]}
              onChange={(event) =>
                setValues({ ...values, [key]: event.target.value })
              }
            />
            <button
              type="button"
              className="icon-btn password-toggle"
              aria-label={`${visible[key] ? "Ocultar" : "Mostrar"} ${label.toLowerCase()}`}
              aria-pressed={!!visible[key]}
              onClick={() => setVisible({ ...visible, [key]: !visible[key] })}
            >
              <Icon name={visible[key] ? "eyeOff" : "eye"} />
            </button>
          </span>
        </label>
      ))}
      <p className="helper">Nueva contraseña: al menos 8 caracteres.</p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {status && (
        <p className="success" role="status">
          {status}
        </p>
      )}
      <button className="btn dark-btn">
        <Icon name="key" size={18} />
        Cambiar contraseña
      </button>
    </form>
  );
}

export default function Account() {
  const app = useApp();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(app.data.profile || {});
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preferenceStatus, setPreferenceStatus] = useState("");
  if (app.mode === "visitante") return <Login />;
  const savedProfile = app.data.profile;
  const name = [savedProfile?.nombre, savedProfile?.apellidos]
    .filter(Boolean)
    .join(" ");
  const preferences = app.data.preferences || {};
  function savePreference(key, checked) {
    if (app.mode !== "demo") return;
    app.setData((old) => ({
      ...old,
      preferences: { ...old.preferences, [key]: checked },
    }));
    setPreferenceStatus(
      "Preferencia guardada en este dispositivo. No se han activado permisos ni conexiones externas.",
    );
  }
  async function submit(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setBusy(true);
    try {
      await app.saveProfile(profile);
      setStatus(
        app.mode === "demo"
          ? "Datos actualizados en la demostración."
          : "Datos guardados en el portal.",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="account-page">
      <h1>Mi Perfil</h1>
      {app.mode === "demo" && (
        <div className="card form-card demo-profile-selector">
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
      <div className="card account-card">
        <div className="account-hero">
          <AccountAvatar profile={savedProfile} />
          <div>
            <h2>{name || "Usuario Gestadia"}</h2>
            <p>{savedProfile?.email || "Perfil de ejemplo"}</p>
            <span className="account-badge">
              {app.isClient ? "Cliente" : "Lead"}
            </span>
          </div>
        </div>
        <div className="account-body">
          <section className="account-section">
            <SectionHeading icon="user" title="Información personal">
              Revisa tus datos antes de presentar un trámite. Guardarlos no
              presenta ningún expediente.
            </SectionHeading>
            <form className="form-card" onSubmit={submit}>
              <ProfileFields
                profile={profile}
                setProfile={setProfile}
                required
              />
              <p className="helper">
                El correo electrónico no se puede cambiar.
              </p>
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
              <button className="btn dark-btn" disabled={busy}>
                {busy ? "Guardando…" : "Guardar cambios"}
              </button>
            </form>
          </section>
          <section className="account-section">
            <SectionHeading icon="key" title="Seguridad" />
            <PasswordSettings />
          </section>
          <section className="account-section">
            <SectionHeading icon="bell" title="Notificaciones del móvil">
              Elige si quieres recibir avisos sobre tu actividad y tus trámites.
            </SectionHeading>
            <PreferenceSwitch
              label="Avisos push"
              checked={!!preferences.push}
              disabled={app.mode !== "demo"}
              onChange={(checked) => savePreference("push", checked)}
            />
            <div className="preference-explanation">
              <strong>
                Estado:{" "}
                {preferences.push
                  ? "Preferencia activada en el ejemplo"
                  : "Desactivados"}
              </strong>
              <p className="helper">
                {app.mode === "demo"
                  ? "Esta preferencia sólo se guarda en el ejemplo. No solicita permisos ni registra el dispositivo."
                  : "Los avisos push aún no están disponibles. Se podrán activar cuando conectemos las notificaciones del móvil."}
              </p>
            </div>
          </section>
          <section className="account-section">
            <SectionHeading icon="shield" title="Datos y privacidad">
              Controla tus preferencias y el acceso a tu cuenta.
            </SectionHeading>
            <div className="account-preferences">
              <h3>Preferencias de privacidad</h3>
              <p className="helper">
                {app.mode === "demo"
                  ? "Estos ajustes sólo se guardan en el ejemplo. No activan medición ni diagnósticos remotos."
                  : "Estas preferencias aún no están disponibles en la app conectada."}
              </p>
              {[
                ["analytics", "Analítica de producto"],
                ["marketing", "Medición de campañas Meta/Google"],
                ["diagnostics", "Diagnóstico técnico de errores"],
              ].map(([key, label]) => (
                <PreferenceSwitch
                  key={key}
                  label={label}
                  checked={!!preferences[key]}
                  disabled={app.mode !== "demo"}
                  onChange={(checked) => savePreference(key, checked)}
                />
              ))}
            </div>
            {preferenceStatus && (
              <p role="status" className="success">
                {preferenceStatus}
              </p>
            )}
            <AccountDeletion />
          </section>
        </div>
      </div>
      {app.mode === "real" && <SocialAccess purpose="link" />}
      <PushSettings />
      <LegalLinks />
    </section>
  );
}
