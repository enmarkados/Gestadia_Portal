import styles from './Footer.module.css';

// NOTE: several links below point at preview-*.html targets that don't have
// a React route yet (only "/" exists so far — see Task 1's App.jsx). Per the
// migration plan, these stay as plain <a> tags for now and get converted to
// <Link> in the task that adds each corresponding route (Tasks 3–5).
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
          <a href="preview-tramites.html" className={styles.footerLink}>Trámites DGT</a>
          <a href="#" className={styles.footerLink}>Cómo funciona</a>
          <a href="#" className={styles.footerLink}>Sobre nosotros</a>
          <a href="preview-contacto.html" className={styles.footerLink}>Contacto</a>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <span className={styles.footerCopy}>© 2026 Gestadia. Todos los derechos reservados.</span>
        <div className={styles.footerLegal}>
          <a href="preview-aviso-legal.html">Aviso legal</a>
          <a href="preview-pagos-devoluciones.html">Pagos y devoluciones</a>
          <a href="preview-proteccion-datos.html">Protección de datos</a>
          <a href="preview-privacidad.html">Privacidad</a>
          <a href="preview-cookies.html">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
