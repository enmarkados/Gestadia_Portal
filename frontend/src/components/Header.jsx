import { Link } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header() {
  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.navLogo}>gestadia<span>.</span></Link>
      <div className={styles.navLinks}>
        {/* preview-*.html nav points "Trámites DGT" at either the home
            page's #servicios anchor or (from other pages) the trámites
            page itself. Since /tramites is now a real route, linking there
            directly works correctly from every page (a harmless no-op
            re-navigation when already on /tramites). */}
        <Link to="/tramites" className={styles.navLink}>Trámites DGT</Link>
        {/* Known, deferred discrepancy: preview-contacto.html's real nav
            omits "Cómo funciona" entirely, but Header is shared across all
            pages and has no per-page nav variants yet — out of scope here. */}
        <a href="#como-funciona" className={styles.navLink}>Cómo funciona</a>
        <Link to="/contacto" className={styles.navLink}>Contacto</Link>
        <a href="https://wa.me/34684462670" target="_blank" rel="noopener" className={styles.navCta} style={{ background: '#25D366' }}>WhatsApp →</a>
      </div>
    </nav>
  );
}
