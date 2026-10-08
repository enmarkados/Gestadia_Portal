import React from "react";
import { Link, useLocation } from "react-router-dom";
import { navigationState } from "./navigation.js";

export default function LegalLinks({ compact = false }) {
  const location = useLocation();
  return (
    <section
      className={compact ? "legal-links compact" : "card legal-links"}
      aria-label="Legal y soporte"
    >
      {!compact && (
        <>
          <h2>Legal y soporte</h2>
          <p className="helper">
            Consulta las condiciones de Gestadia y la ayuda sobre tu cuenta,
            trámites y documentos.
          </p>
        </>
      )}
      <nav aria-label="Información legal y soporte">
        <Link to="/legal/privacy" state={navigationState(location)}>
          Privacidad
        </Link>
        <Link to="/legal/terms" state={navigationState(location)}>
          Términos
        </Link>
        <Link to="/legal/support" state={navigationState(location)}>
          Soporte
        </Link>
      </nav>
    </section>
  );
}
