import { Link } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import styles from './ProteccionDatos.module.css';

// Migrated from preview-proteccion-datos.html (style lines 7-42, body from
// line 44). <nav>/<footer> replaced with <Header />/<Footer /> (Task 2).
// Static content page, no form/script to reproduce. The breadcrumb
// "Inicio" link now points at "/" (Task 5).
//
// NOTE: not in the original migration plan's page list (see brief) — a
// real preview-proteccion-datos.html page exists in the repo and was
// added after the plan was written, so it's included here to close that
// gap.
export default function ProteccionDatos() {
  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.breadcrumb}><Link to="/">Inicio</Link> / Protección de datos</div>
          <h1 className={styles.pageTitle}>Política de Protección de Datos</h1>
        </div>
      </div>

      <div className={styles.legalBody}>
        <p className={styles.legalIntro}>Responsable del tratamiento: <strong>Defensa Legal Consumidores S.L.</strong> · NIF: B01813336 · info@gestadia.com. Normativa aplicable: Reglamento (UE) 2016/679 (RGPD) y legislación española vigente.</p>

        <div className={styles.legalSection}>
          <h2>Compromiso con la protección de datos</h2>
          <p>Defensa Legal Consumidores S.L. asume la máxima responsabilidad y compromiso con el establecimiento, implementación y mantenimiento de esta política de protección de datos, conforme al RGPD y la normativa española aplicable.</p>
          <p>Esta política vincula a todo el personal de la organización, quien debe conocerla, aplicarla y reportar cualquier mejora identificada. Se revisa periódicamente para garantizar su conformidad normativa.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>Principios fundamentales</h2>
          <ol>
            <li><strong>Protección desde el diseño:</strong> implementamos medidas técnicas y organizativas desde el origen del tratamiento, incluyendo seudonimización cuando procede.</li>
            <li><strong>Protección por defecto:</strong> solo tratamos los datos estrictamente necesarios para cada finalidad específica.</li>
            <li><strong>Ciclo de vida completo:</strong> protegemos los datos durante toda su existencia, desde la recogida hasta la eliminación.</li>
            <li><strong>Licitud, lealtad y transparencia:</strong> el tratamiento se realiza de forma lícita, leal y transparente para el interesado.</li>
            <li><strong>Limitación de finalidad:</strong> los datos no se reutilizan para finalidades incompatibles con las originalmente declaradas.</li>
            <li><strong>Minimización de datos:</strong> recogemos únicamente los datos necesarios, pertinentes y no excesivos.</li>
            <li><strong>Exactitud:</strong> mantenemos los datos correctos y actualizados, suprimiendo o rectificando los inexactos.</li>
            <li><strong>Plazo limitado:</strong> conservamos los datos solo durante el tiempo necesario para la finalidad declarada.</li>
            <li><strong>Integridad y confidencialidad:</strong> aplicamos medidas de seguridad adecuadas contra accesos no autorizados, pérdida o destrucción.</li>
            <li><strong>Información y formación:</strong> todo el personal recibe formación adecuada en materia de protección de datos.</li>
          </ol>
        </div>

        <div className={styles.legalSection}>
          <h2>Ejercicio de derechos</h2>
          <p>El interesado puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad dirigiéndose a <strong>info@gestadia.com</strong>, indicando el derecho que desea ejercer y adjuntando copia de su DNI/NIE.</p>
          <p>Asimismo, tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es) si considera que el tratamiento no es conforme a la normativa vigente.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
