import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CheckoutCard from '../components/CheckoutCard.jsx';
import CheckoutForm from './servicios/CheckoutForm.jsx';
import { getServicios } from '../lib/api.js';
import styles from './Checkout.module.css';

// Parsea query params para rellenar automáticamente los datos si se llega
// desde LidIA, la app móvil o un enlace directo con parámetros.
function extractPrefill(searchParams) {
  const rawNombre = searchParams.get('nombre') || '';
  const rawApellidos = searchParams.get('apellidos') || '';
  let nombre = rawNombre;
  let apellidos = rawApellidos;

  // Si solo se proporciona nombre completo y no apellidos, separar en nombre y apellidos
  if (rawNombre && !rawApellidos && rawNombre.trim().includes(' ')) {
    const parts = rawNombre.trim().split(/\s+/);
    nombre = parts[0];
    apellidos = parts.slice(1).join(' ');
  }

  const email = searchParams.get('email') || '';
  const telefono = searchParams.get('telefono') || searchParams.get('tel') || searchParams.get('phone') || '';
  const numDocumento = searchParams.get('numDocumento') || searchParams.get('dni') || searchParams.get('nie') || searchParams.get('documento') || '';
  
  let tipoDocumento = searchParams.get('tipoDocumento');
  if (!tipoDocumento && numDocumento) {
    tipoDocumento = /^[XYZxyz]/i.test(numDocumento.trim()) ? 'NIE' : 'DNI';
  }

  const paisCanje = searchParams.get('paisCanje') || searchParams.get('pais') || '';

  const hasAny = nombre || apellidos || email || telefono || numDocumento || paisCanje;
  if (!hasAny) return null;

  const prefill = {};
  if (nombre) prefill.nombre = nombre;
  if (apellidos) prefill.apellidos = apellidos;
  if (email) prefill.email = email;
  if (telefono) prefill.telefono = telefono;
  if (numDocumento) prefill.numDocumento = numDocumento;
  if (tipoDocumento) prefill.tipoDocumento = tipoDocumento;
  if (paisCanje) prefill.paisCanje = paisCanje.toLowerCase();

  return prefill;
}

// Página /checkout (reserva / enlaces directos). El formulario vive en
// CheckoutForm, compartido con la tarjeta de la ficha.
export default function Checkout() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get('servicio') || '';
  const enlaceCaducado = searchParams.get('enlace') === 'caducado';
  const procedencia = searchParams.get('procedencia') || (searchParams.get('origen') === 'app' ? 'lidia' : '');
  const prefill = useMemo(() => extractPrefill(searchParams), [searchParams]);

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
        {enlaceCaducado && (
          <p className={styles.formStatus} role="status">
            El enlace de pago ha caducado, pero puedes contratar igualmente rellenando tus datos.
          </p>
        )}
        {loadError && <p className={`${styles.formStatus} ${styles.error}`} role="alert">{loadError}</p>}
        {!loadError && !servicio && <p className={styles.loading}>Cargando…</p>}
        {servicio && (
          <>
            <CheckoutCard nombre={servicio.nombre} descripcion={servicio.descripcion} precio={servicio.precio} />
            <CheckoutForm servicio={servicio} prefill={prefill} procedencia={procedencia} />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
