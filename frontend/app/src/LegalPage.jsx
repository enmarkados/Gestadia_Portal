import React from "react";
import { Link, useLocation } from "react-router-dom";
import { connectedLegalDocuments } from "../../../shared/legal-content.js";
import { useApp } from "./AppContext.jsx";
import { demoOnly } from "./api.js";
import { legalDocuments } from "./legalContent.js";
import AccountDeletion from "./AccountDeletion.jsx";
import { backNavigation } from "./navigation.js";
import Icon from "./Icon.jsx";

export default function LegalPage({ kind }) {
  const location = useLocation();
  const app = useApp();
  const connected = !demoOnly() && app?.mode !== "demo";
  const document = (connected ? connectedLegalDocuments : legalDocuments)[kind];
  const back = backNavigation(location, "/acceso");
  return (
    <section className="legal-page">
      <div className="card legal-intro">
        <span className="legal-document-icon">
          <Icon name={document.icon} size={28} />
        </span>
        <p className="eyebrow">{connected ? "GESTADIA" : "GESTADIA · VERSIÓN DE DEMOSTRACIÓN"}</p>
        <h1>{document.title}</h1>
        <p className="muted">{document.subtitle}</p>
        <p className="helper">Actualizado el {connected ? "10" : "3"} de octubre de 2026</p>
      </div>
      <nav className="legal-navigation" aria-label="Documentos legales">
        {[
          ["privacy", "Privacidad"],
          ["terms", "Términos"],
          ["support", "Soporte"],
          ["delete-account", "Eliminar cuenta"],
        ].map(([key, label]) => (
          <Link
            key={key}
            to={`/legal/${key}`}
            state={location.state}
            replace
            aria-current={kind === key ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <article className="card legal-content">
        {document.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </section>
        ))}
        {connected && ["support", "delete-account"].includes(kind) && (
          <p><a href={kind === "delete-account" ? "mailto:info@gestadia.com?subject=Eliminar%20mi%20cuenta%20Gestadia" : "mailto:info@gestadia.com"}>
            {kind === "delete-account" ? "Solicitar eliminación por correo" : "Escribir a Gestadia"}
          </a></p>
        )}
        {connected && kind === "terms" && (
          <p><a href="https://gestadia.com/aviso-legal">Aviso legal</a> · <a href="https://gestadia.com/pagos-devoluciones">Pagos y devoluciones</a></p>
        )}
        {kind === "delete-account" && (!connected || app?.mode === "real") && <AccountDeletion />}
      </article>
      <Link className="btn secondary" to={back.to} state={back.state} replace>
        {back.label}
      </Link>
    </section>
  );
}
