import { Link } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import styles from './Cookies.module.css';

// Migrated from preview-cookies.html (style lines 7-47, body from line 49).
// <nav>/<footer> replaced with <Header />/<Footer /> (Task 2). Static
// content page, no form/script to reproduce. The breadcrumb "Inicio" link
// now points at "/" (Task 5).
export default function Cookies() {
  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.breadcrumb}><Link to="/">Inicio</Link> / Política de cookies</div>
          <h1 className={styles.pageTitle}>Política de Cookies</h1>
        </div>
      </div>

      <div className={styles.legalBody}>
        <p className={styles.legalIntro}>En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico, te informamos sobre el uso de cookies en este sitio web.</p>

        <div className={styles.legalSection}>
          <h2>¿Qué son las cookies?</h2>
          <p>Una cookie es un fichero que se descarga en el ordenador o dispositivo del usuario al acceder a determinados sitios web. Las cookies permiten al sitio web almacenar y recuperar información sobre los hábitos de navegación del usuario. No dañan el equipo y mejoran la usabilidad del sitio.</p>
          <p>Continuar navegando por este sitio web implica la aceptación del uso de cookies tal y como se describe en esta política.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>Tipos de cookies utilizadas</h2>
          <table className={styles.cookiesTable}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Técnicas</strong></td>
                <td>Necesarias para el funcionamiento básico del sitio. No pueden desactivarse sin afectar al funcionamiento.</td>
              </tr>
              <tr>
                <td><strong>De sesión</strong></td>
                <td>Se eliminan automáticamente al cerrar el navegador. No se almacenan de forma permanente.</td>
              </tr>
              <tr>
                <td><strong>Persistentes</strong></td>
                <td>Permanecen en el dispositivo durante un período determinado o hasta que el usuario las elimine.</td>
              </tr>
              <tr>
                <td><strong>De personalización</strong></td>
                <td>Permiten recordar preferencias del usuario como idioma o región.</td>
              </tr>
              <tr>
                <td><strong>De análisis</strong></td>
                <td>Permiten cuantificar el número de usuarios y analizar su comportamiento de forma agregada y anónima.</td>
              </tr>
              <tr>
                <td><strong>Publicitarias</strong></td>
                <td>Gestionan los espacios publicitarios del sitio web.</td>
              </tr>
              <tr>
                <td><strong>De comportamiento</strong></td>
                <td>Almacenan información sobre el comportamiento de los usuarios para mostrar publicidad personalizada.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.legalSection}>
          <h2>Cómo gestionar o desactivar las cookies</h2>
          <p>Puedes permitir, bloquear o eliminar las cookies instaladas en tu dispositivo configurando las opciones de tu navegador:</p>
          <ul>
            <li><strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios.</li>
            <li><strong>Mozilla Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio.</li>
            <li><strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos del sitio web.</li>
            <li><strong>Microsoft Edge:</strong> Configuración → Privacidad, búsqueda y servicios → Cookies.</li>
            <li><strong>Opera:</strong> Configuración → Avanzado → Privacidad y seguridad → Cookies.</li>
          </ul>
          <p>Ten en cuenta que deshabilitar todas las cookies puede afectar al correcto funcionamiento de algunas partes del sitio web.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
