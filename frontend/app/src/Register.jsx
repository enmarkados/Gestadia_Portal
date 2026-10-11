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
        Tu cuenta Gestadia se crea cuando contratas un servicio. Con el mismo
        email y contraseña accedes a la app y al portal para gestionar tus trámites.
        Si has recibido el correo de acceso, usa su enlace para crear tu contraseña.
      </p>
      <Link
        className="btn primary"
        to="/acceso"
        state={authFlowState(location)}
      >
        Iniciar sesión
      </Link>
      <Link className="btn secondary" to="/servicios" state={authFlowState(location)}>Ver servicios</Link>
      <p className="helper">Puedes hablar con LidIA sin contratar un servicio ni crear una cuenta.</p>
      <Link className="text-btn" to="/" state={authFlowState(location)}>Ir a LidIA</Link>
      <LegalLinks compact />
    </section>
  );
}
