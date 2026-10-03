import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.navLogo} onClick={closeMenu}>gestadia<span>.</span></Link>
      
      <button
        type="button"
        className={`${styles.menuBtn} ${menuOpen ? styles.menuBtnOpen : ''}`}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuOpen}
      >
        <span className={styles.menuIcon} />
      </button>

      <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
        <Link to="/tramites" className={styles.navLink} onClick={closeMenu}>Trámites DGT</Link>
        <a href="#como-funciona" className={styles.navLink} onClick={closeMenu}>Cómo funciona</a>
        <Link to="/contacto" className={styles.navLink} onClick={closeMenu}>Contacto</Link>
        <a href="https://wa.me/34684462670" target="_blank" rel="noopener" className={styles.navCta} style={{ background: '#25D366' }} onClick={closeMenu}>WhatsApp →</a>
      </div>
    </nav>
  );
}

