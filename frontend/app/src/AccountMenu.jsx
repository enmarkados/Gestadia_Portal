import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { navigationState, accessState } from "./navigation.js";
import { useApp } from "./AppContext.jsx";
import Sheet from "./Sheet.jsx";
import Icon from "./Icon.jsx";

export function AccountAvatar({ profile }) {
  const name = [profile?.nombre, profile?.apellidos].filter(Boolean).join(" ");
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <span className="account-avatar" aria-hidden="true">
      {initials || <Icon name="user" size={28} />}
    </span>
  );
}

export default function AccountMenu({ onClose, closing, anchorRef }) {
  const app = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const profile = app.data.profile;
  const name = [profile?.nombre, profile?.apellidos].filter(Boolean).join(" ");
  function open(path, state = path === "/acceso" ? accessState(location) : navigationState(location)) {
    onClose(() => navigate(path, { state }));
  }
  return (
    <Sheet
      title="Cuenta"
      className="account-menu"
      closeLabel="Cerrar menú de cuenta"
      onClose={onClose}
      closing={closing}
      presentation="menu"
      anchorRef={anchorRef}
    >
      <div className="account-summary">
        <AccountAvatar profile={profile} />
        <div>
          <strong>{name || "Usuario Gestadia"}</strong>
          <p>{profile?.email || "Sin sesión iniciada"}</p>
        </div>
      </div>
      <div className="account-menu-actions">
        {app.mode === "visitante" ? (
          <button onClick={() => open("/acceso")}>
            <Icon name="user" />
            Iniciar sesión
            <Icon name="arrow" size={18} />
          </button>
        ) : (
          <>
            <button onClick={() => open("/cuenta")}>
              <Icon name="settings" />
              Mi Perfil
              <Icon name="arrow" size={18} />
            </button>
            <button
              className="account-logout"
              onClick={() => {
                app.logout();
                open("/acceso", { from: "/" });
              }}
            >
              <Icon name="logout" />
              Cerrar Sesión
            </button>
          </>
        )}
      </div>
    </Sheet>
  );
}
