import React from "react";
import { Link, useLocation } from "react-router-dom";
import { authFlowState } from "./navigation.js";
import LegalLinks from "./LegalLinks.jsx";
export default function Register() {
  const location = useLocation();
  return (
    <section className="auth-page">
      <h1>Tu cuenta Gestadia</h1>
      <p>
        Usa el acceso compartido con tu portal. Si has recibido una invitación,
        verifica el correo y crea tu contraseña mediante ese enlace.
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
}
