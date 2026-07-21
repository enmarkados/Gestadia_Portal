import { useState } from 'react';
import { SERVICIOS } from '@shared/servicios.js';
import CheckoutForm from './CheckoutForm.jsx';
// Reutiliza la tarjeta-precio de LeadForm.module.css (.checkout-*). La tarjeta
// muestra precio + botón "Contratar ahora"; al pulsarlo se despliega el
// formulario de pago (CheckoutForm) ahí mismo, sin cambiar de página.
import styles from './LeadForm.module.css';

export default function ContratarCard({ slug, servicio, precio, includes }) {
  const [mostrarForm, setMostrarForm] = useState(false);

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
        {mostrarForm ? (
          <CheckoutForm servicio={SERVICIOS[slug]} />
        ) : (
          <button type="button" className={styles.checkoutBtn} onClick={() => setMostrarForm(true)}>
            Contratar ahora →
          </button>
        )}
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
