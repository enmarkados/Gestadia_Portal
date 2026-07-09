import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CheckoutCard from '../components/CheckoutCard.jsx';
import { getServicios, postCheckout } from '../lib/api.js';
import styles from './Checkout.module.css';

const EMPTY_FORM = {
  nombre: '', apellidos: '', email: '', telefono: '',
  tipoDocumento: 'DNI', numDocumento: '', aceptaCondiciones: false,
};

// New page (Task 7) — there is no preview-*.html source for checkout; the
// original vanilla-JS reference lives at unir/public/checkout.html + app.js
// (a sibling repo, read-only inspiration for copy/fields, not migrated
// 1:1). Visual language reuses the "checkout card" pattern already
// established by pages/servicios/LeadForm.jsx and the form-field styling
// established by Contacto.jsx, rather than inventing a new design.
//
// URL-mismatch handling: backend/src/routes/checkout.js (part of the
// sibling backend plan) still returns legacy `/gracias.html?pedido=...`
// and `/checkout.html?servicio=...&cancelado=1` URLs — leftovers from the
// original static-HTML design. This page does not touch that route file
// (out of scope here); instead the submit handler below strips `.html`
// from whatever `url` the backend returns before navigating, so redirects
// land on this app's real routes (`/gracias`, `/checkout`) regardless of
// the backend's legacy string.
function toReactRoute(url) {
  return url.replace('/gracias.html', '/gracias').replace('/checkout.html', '/checkout');
}

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get('servicio') || '';
  const cancelado = searchParams.get('cancelado');

  const [servicios, setServicios] = useState(null); // null = loading
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle'); // idle | sending | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    getServicios()
      .then((data) => { if (!cancelled) setServicios(data); })
      .catch((err) => { if (!cancelled) setLoadError(err.message || 'No se pudo cargar el catálogo de servicios'); });
    return () => { cancelled = true; };
  }, []);

  const servicio = servicios ? (servicios.find((s) => s.slug === slug) || servicios[0]) : null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!servicio) return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const body = await postCheckout({ servicio: servicio.slug, ...form });
      window.location.href = toReactRoute(body.url);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'No se pudo iniciar el pago');
    }
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.breadcrumb}><Link to="/">Inicio</Link> / <span>Contratar</span></div>
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

            {cancelado && (
              <p className={`${styles.formStatus} ${styles.error}`} role="alert">
                El pago se canceló. Puedes intentarlo de nuevo cuando quieras.
              </p>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formTitle}>Tus datos</div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="checkout-nombre">Nombre</label>
                  <input className={styles.formInput} type="text" id="checkout-nombre" name="nombre" autoComplete="given-name" value={form.nombre} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="checkout-apellidos">Apellidos</label>
                  <input className={styles.formInput} type="text" id="checkout-apellidos" name="apellidos" autoComplete="family-name" value={form.apellidos} onChange={handleChange} required />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="checkout-email">Email</label>
                  <input className={styles.formInput} type="email" id="checkout-email" name="email" autoComplete="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="checkout-telefono">Teléfono móvil</label>
                  <input className={styles.formInput} type="tel" id="checkout-telefono" name="telefono" autoComplete="tel" value={form.telefono} onChange={handleChange} />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="checkout-tipoDocumento">Tipo de documento</label>
                  <select className={`${styles.formInput} ${styles.formSelect}`} id="checkout-tipoDocumento" name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange}>
                    <option value="DNI">DNI</option>
                    <option value="NIE">NIE</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="checkout-numDocumento">Nº de documento</label>
                  <input className={styles.formInput} type="text" id="checkout-numDocumento" name="numDocumento" autoComplete="off" value={form.numDocumento} onChange={handleChange} />
                </div>
              </div>

              <div className={styles.formCheck}>
                <input type="checkbox" id="checkout-acepta" name="aceptaCondiciones" checked={form.aceptaCondiciones} onChange={handleChange} required />
                <label htmlFor="checkout-acepta">
                  He leído y acepto las <a href="/condiciones" target="_blank" rel="noopener">condiciones de contratación</a> y la <a href="/privacidad" target="_blank" rel="noopener">política de privacidad</a>. Solicito el inicio inmediato del servicio y entiendo que, una vez ejecutado por completo, perderé el derecho de desistimiento.
                </label>
              </div>

              {status === 'error' && (
                <p className={`${styles.formStatus} ${styles.error}`} role="alert">{errorMsg}</p>
              )}

              <button type="submit" className={styles.formSubmit} disabled={status === 'sending'}>
                {status === 'sending' ? 'Procesando…' : 'Pagar con tarjeta o Bizum'}
              </button>
              <p className={styles.formNote}>Al pagar crearemos tu cuenta automáticamente y te enviaremos un email para establecer tu contraseña.</p>
            </form>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
