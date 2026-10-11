import { Link } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import styles from './Privacidad.module.css';

import { connectedLegalDocuments } from "@shared/legal-content.js";
export default function Privacidad() {
  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.breadcrumb}><Link to="/">Inicio</Link> / Política de privacidad</div>
          <h1 className={styles.pageTitle}>Política de Privacidad</h1>
          <p className={styles.pageSubtitle}>Última actualización: 10 de octubre de 2026</p>
        </div>
      </div>
      <div className={styles.legalBody}>
        {connectedLegalDocuments.privacy.sections.map(section => (
          <section key={section.title} className={styles.legalSection}>
            <h2>{section.title}</h2>
            {section.paragraphs.map(text => <p key={text}>{text}</p>)}
          </section>
        ))}
        <section className={styles.legalSection}>
          <h2>Información y solicitudes</h2>
          <p><Link to="/cookies">Política de cookies</Link> · <a href="https://app.gestadia.com/legal/delete-account">Eliminar tu cuenta Gestadia</a> · <a href="mailto:info@gestadia.com">Contactar con Gestadia</a></p>
        </section>
      </div>
      <Footer />
    </div>
  );
}
