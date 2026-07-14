import styles from './CheckoutCard.module.css';

// Reusable price/description summary panel for the real payment checkout
// (Task 7), reusing the same "checkout card" visual language already
// established by pages/servicios/LeadForm.jsx's `.checkout-card` /
// `.checkout-price-block` (itself lifted from every preview-*.html
// trámite page's "Solicitar información" sidebar). LeadForm's version is
// a lead-capture panel with a fixed price string; this one is the
// catalog-driven summary shown at the top of Checkout.jsx, so it takes
// the raw `{nombre, descripcion, precio}` shape returned by
// GET /api/servicios instead of pre-formatted strings.
export default function CheckoutCard({ nombre, descripcion, precio }) {
  return (
    <div className={styles.checkoutCard}>
      <div className={styles.service}>{nombre}</div>
      {descripcion && <p className={styles.description}>{descripcion}</p>}
      <div className={styles.price}>
        {Number(precio).toFixed(2)} €<sub>IVA incluido</sub>
      </div>
    </div>
  );
}
