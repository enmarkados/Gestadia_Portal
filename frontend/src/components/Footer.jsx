import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

// "Trámites DGT" and "Contacto" were converted to <Link> in Task 3, which
// is what adds the "/tramites" and "/contacto" routes. The 5 legal-page
// links below were converted to <Link> in Task 5, which adds their routes
// (/aviso-legal, /pagos-devoluciones, /proteccion-datos, /privacidad,
// /cookies). "Cómo funciona" and "Sobre nosotros" stay as plain <a href="#">
// — no corresponding route exists yet.
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div>
          <span className={styles.footerLogo}>gestadia</span>
          <div className={styles.footerInfo}>
            <span className={styles.footerInfoLine}>Paseo de la Castellana 143, 2A · 28046 Madrid</span>
            <span className={styles.footerInfoLine}><a href="tel:910600314">910 600 314</a> · <a href="https://wa.me/34684462670">WhatsApp 684 46 26 70</a></span>
            <span className={styles.footerInfoLine}><a href="mailto:info@gestadia.com">info@gestadia.com</a></span>
            <span className={styles.footerInfoLine} style={{ marginTop: '4px', color: '#999' }}>Servicio de tramitación DGT de Defensa Legal Consumidores</span>
          </div>
        </div>
        <div className={styles.footerLinks}>
          <Link to="/tramites" className={styles.footerLink}>Trámites DGT</Link>
          <a href="#" className={styles.footerLink}>Cómo funciona</a>
          <a href="#" className={styles.footerLink}>Sobre nosotros</a>
          <Link to="/contacto" className={styles.footerLink}>Contacto</Link>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <span className={styles.footerCopy}>© 2026 Gestadia. Todos los derechos reservados.</span>
        <div className={styles.footerLegal}>
          <Link to="/aviso-legal">Aviso legal</Link>
          <Link to="/pagos-devoluciones">Pagos y devoluciones</Link>
          <Link to="/proteccion-datos">Protección de datos</Link>
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
