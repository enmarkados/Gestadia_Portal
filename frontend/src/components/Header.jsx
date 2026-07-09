import { Link } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header() {
  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.navLogo}>gestadia</Link>
      <div className={styles.navLinks}>
        <a href="#servicios" className={styles.navLink}>Trámites DGT</a>
        <a href="#como-funciona" className={styles.navLink}>Cómo funciona</a>
        <Link to="/contacto" className={styles.navLink}>Contacto</Link>
        <a href="https://wa.me/34684462670" target="_blank" rel="noopener" className={styles.navCta} style={{ background: '#25D366' }}>WhatsApp →</a>
      </div>
    </nav>
  );
}
