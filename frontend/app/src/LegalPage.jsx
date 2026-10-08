import React from "react";
import { Link, useLocation } from "react-router-dom";
import { legalDocuments } from "./legalContent.js";
import AccountDeletion from "./AccountDeletion.jsx";
import { backNavigation } from "./navigation.js";
import Icon from "./Icon.jsx";

export default function LegalPage({ kind }) {
  const location = useLocation();
  const document = legalDocuments[kind];
  const back = backNavigation(location, "/acceso");
  return (
    <section className="legal-page">
      <div className="card legal-intro">
        <span className="legal-document-icon">
          <Icon name={document.icon} size={28} />
        </span>
        <p className="eyebrow">GESTADIA · VERSIÓN DE DEMOSTRACIÓN</p>
        <h1>{document.title}</h1>
        <p className="muted">{document.subtitle}</p>
        <p className="helper">Actualizado el 3 de octubre de 2026</p>
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
        {kind === "delete-account" && <AccountDeletion />}
      </article>
      <Link className="btn secondary" to={back.to} state={back.state} replace>
        {back.label}
      </Link>
    </section>
  );
}
