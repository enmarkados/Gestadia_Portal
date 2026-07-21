import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CheckoutCard from '../components/CheckoutCard.jsx';
import CheckoutForm from './servicios/CheckoutForm.jsx';
import { getServicios } from '../lib/api.js';
import styles from './Checkout.module.css';

// Página /checkout (reserva / enlaces directos). El formulario vive en
// CheckoutForm, compartido con la tarjeta de la ficha.
export default function Checkout() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get('servicio') || '';

  const [servicios, setServicios] = useState(null); // null = loading
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getServicios()
      .then((data) => { if (!cancelled) setServicios(data); })
      .catch((err) => { if (!cancelled) setLoadError(err.message || 'No se pudo cargar el catálogo de servicios'); });
    return () => { cancelled = true; };
  }, []);

  const servicio = servicios ? (servicios.find((s) => s.slug === slug) || servicios[0]) : null;

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.pageEyebrow}>Pago seguro</div>
          <h1 className={styles.pageTitle}>Contratar servicio</h1>
          <p className={styles.pageSub}>Rellena tus datos, paga y sigue tu trámite desde tu área de cliente.</p>
        </div>
      </div>

      <div className={styles.body}>
        {loadError && <p className={`${styles.formStatus} ${styles.error}`} role="alert">{loadError}</p>}
        {!loadError && !servicio && <p className={styles.loading}>Cargando…</p>}
        {servicio && (
          <>
            <CheckoutCard nombre={servicio.nombre} descripcion={servicio.descripcion} precio={servicio.precio} />
            <CheckoutForm servicio={servicio} />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
