import React, { useState } from "react";
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

function PasswordSettings() {
  return (
    <div>
      <p className="helper">Puedes recuperar tu acceso desde el portal.</p>
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
}

export default function Account() {
  const app = useApp();
  const [profile, setProfile] = useState(app.data.profile || {});
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setBusy(true);
    try {
      await app.saveProfile(profile);
      setStatus("Datos guardados en el portal.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  if (app.mode === "visitante") return <Login />;
  const savedProfile = app.data.profile;
  const name = [savedProfile?.nombre, savedProfile?.apellidos]
    .filter(Boolean)
    .join(" ");
  return (
    <section className="account-page">
      <h1>Mi Perfil</h1>
      <div className="card account-card">
        <div className="account-hero">
          <AccountAvatar profile={savedProfile} />
          <div>
            <h2>{name || "Usuario Gestadia"}</h2>
            <p>{savedProfile?.email || "Cuenta Gestadia"}</p>
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
            <SectionHeading icon="shield" title="Datos y privacidad">
              Gestiona el acceso a tu cuenta.
            </SectionHeading>
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
