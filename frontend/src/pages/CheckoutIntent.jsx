import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CheckoutCard from '../components/CheckoutCard.jsx';
import CheckoutForm from './servicios/CheckoutForm.jsx';
import { getCheckoutIntent, getServicios } from '../lib/api.js';
import styles from './Checkout.module.css';

// Página /c/:token — aterrizaje de los enlaces de pago que el agente de LidIA
// envía por WhatsApp. Resuelve el intent, prellena el checkout y muestra el
// banner de verificación. Caducado/inválido → checkout normal con aviso.
export default function CheckoutIntent() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [intent, setIntent] = useState(null);
  const [servicios, setServicios] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getCheckoutIntent(token)
      .then((data) => {
        if (cancelled) return;
        if (data.pagado) navigate(`/gracias?pedido=${data.nPedido || ''}`, { replace: true });
        else setIntent(data);
      })
      .catch(() => { if (!cancelled) navigate('/checkout?enlace=caducado', { replace: true }); });
    return () => { cancelled = true; };
  }, [token, navigate]);

  useEffect(() => {
    let cancelled = false;
    getServicios().then((data) => { if (!cancelled) setServicios(data); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const servicio = intent && servicios ? servicios.find((s) => s.slug === intent.servicio) : null;

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.pageEyebrow}>Pago seguro</div>
          <h1 className={styles.pageTitle}>Contratar servicio</h1>
          <p className={styles.pageSub}>Revisa tus datos, paga y sigue tu trámite desde tu área de cliente.</p>
        </div>
      </div>
      <div className={styles.body}>
        {!servicio && <p className={styles.loading}>Cargando…</p>}
        {servicio && (
          <>
            <CheckoutCard nombre={servicio.nombre} descripcion={servicio.descripcion} precio={servicio.precio} />
            <CheckoutForm servicio={servicio} prefill={intent.prefill} procedencia={intent.procedencia} intentToken={token} />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
