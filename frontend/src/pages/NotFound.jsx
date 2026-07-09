import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import styles from './NotFound.module.css';

// Catch-all route (final review finding #3) — an unmatched deep link falls
// through the Express SPA fallback to index.html, then React Router routes
// it here instead of rendering a blank app shell. Reuses the "centered
// card" pattern established by Gracias.jsx.
export default function NotFound() {
  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.body}>
        <div className={styles.card}>
          <span className={styles.badge}>Error 404</span>
          <h1 className={styles.title}>Página no encontrada</h1>
          <p className={styles.text}>
            Lo sentimos, la página que buscas no existe o se ha movido.
          </p>
          <Link to="/" className={styles.btn}>Volver al inicio</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
