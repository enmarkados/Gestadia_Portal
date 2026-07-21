import { SERVICIOS } from '@shared/servicios.js';
import CheckoutForm from './CheckoutForm.jsx';
// Reutiliza la tarjeta-precio de LeadForm.module.css (.checkout-*) y embebe el
// formulario de pago (CheckoutForm) directamente en la ficha, en lugar de un
// botón que navegaba a /checkout.
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
        <CheckoutForm servicio={SERVICIOS[slug]} />
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
