import { Link, NavLink, useNavigate } from 'react-router-dom';
import { clearToken } from '../../lib/auth.js';
import styles from './PortalLayout.module.css';

// Shared chrome for the 4 authenticated portal pages (Task 8). Functional
// inspiration from unir/public/portal.html's <header class="top">/<nav
// class="tabs"> (sibling repo, read-only) — rebuilt with react-router
// <NavLink> instead of hash-based tabs, and styled to match this app's
// established graphite/red visual language (Header.module.css) rather than
// the reference repo's own styles.css.
function navLinkClass({ isActive }) {
  return isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;
}

export default function PortalLayout({ title, subtitle, children }) {
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate('/portal/login');
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link to="/" className={styles.logo}>gestadia<span>.</span></Link>
        <nav className={styles.nav}>
          <NavLink to="/portal/mis-servicios" className={navLinkClass}>Mis servicios</NavLink>
          <NavLink to="/portal/mis-datos" className={navLinkClass}>Mis datos</NavLink>
          <NavLink to="/portal/notificaciones" className={navLinkClass}>Notificaciones</NavLink>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>Cerrar sesión</button>
        </nav>
      </header>

      <main className={styles.main}>
        {(title || subtitle) && (
          <div className={styles.mainHeader}>
            {title && <h1 className={styles.title}>{title}</h1>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
