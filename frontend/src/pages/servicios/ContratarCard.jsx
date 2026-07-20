import { Link } from 'react-router-dom';
// Reutiliza la tarjeta-precio de LeadForm.module.css (.checkout-*). Sustituye
// al antiguo formulario de lead ("Solicita información") por un CTA de compra
// que lleva al checkout (/checkout?servicio=<slug>), con un enlace de WhatsApp
// para dudas.
import styles from './LeadForm.module.css';

export default function ContratarCard({ slug, servicio, precio, includes }) {
  return (
    <div className={styles.checkoutCard}>
      <div className={styles.checkoutPriceBlock}>
        <div className={styles.checkoutService}>{servicio}</div>
        <div className={styles.checkoutPrice}>{precio}<sub>IVA incluido</sub></div>
        <div className={styles.checkoutIncludes}>
          {includes.map((inc) => (
            <span key={inc}>{inc}</span>
          ))}
        </div>
      </div>

      <div className={styles.checkoutBody}>
        <Link
          to={`/checkout?servicio=${slug}`}
          className={styles.checkoutBtn}
          style={{ display: 'block', textDecoration: 'none' }}
        >
          Contratar ahora →
        </Link>
        <div className={styles.checkoutDivider} />
        <div className={styles.checkoutWhatsapp}>
          💬 ¿Tienes dudas?{' '}
          <a href="https://wa.me/34684462670" target="_blank" rel="noopener" style={{ color: '#166534', fontWeight: 700, textDecoration: 'none' }}>
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
