import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CheckoutCard from '../components/CheckoutCard.jsx';
import { getServicios, postCheckout } from '../lib/api.js';
import { PAISES, paisesOrdenados } from '@shared/paises-canje.js';
import { TIPOS_VIA, PROVINCIAS } from '@shared/direccion.js';
import { PREFIJOS, PREFIJO_DEFECTO } from '@shared/prefijos.js';
import styles from './Checkout.module.css';

const EMPTY_FORM = {
  nombre: '', apellidos: '', email: '', prefijo: PREFIJO_DEFECTO, telefono: '',
  tipoDocumento: 'DNI', numDocumento: '', aceptaCondiciones: false,
  paisCanje: '', datosPais: {},
  direccion: { tipoVia: 'Calle', nombreVia: '', numero: '', bloque: '', portal: '', escalera: '', planta: '', puerta: '', km: '', codigoPostal: '', municipio: '', localidad: '', provincia: '' },
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

  const grupos = paisesOrdenados();
  const camposPais = form.paisCanje ? (PAISES[form.paisCanje]?.camposExtra ?? []) : [];

  function handlePais(e) {
    setForm((f) => ({ ...f, paisCanje: e.target.value, datosPais: {} }));
  }
  function handleDatoPais(clave, value) {
    setForm((f) => ({ ...f, datosPais: { ...f.datosPais, [clave]: value } }));
  }
  function handleDireccion(campo, value) {
    setForm((f) => ({ ...f, direccion: { ...f.direccion, [campo]: value } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!servicio) return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const { paisCanje, datosPais, direccion, prefijo, telefono, ...persona } = form;
      const telefonoFull = `${prefijo}${String(telefono).replace(/\D/g, '')}`;
      const extra = {};
      if (servicio.requierePais) { extra.paisCanje = paisCanje; extra.datosPais = datosPais; }
      if (servicio.requiereDireccion) { extra.direccion = direccion; }
      const body = await postCheckout({ servicio: servicio.slug, ...persona, telefono: telefonoFull, ...extra });
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

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="checkout-email">Email</label>
                <input className={styles.formInput} type="email" id="checkout-email" name="email" autoComplete="email" value={form.email} onChange={handleChange} required />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="checkout-telefono">Teléfono móvil</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select className={`${styles.formInput} ${styles.formSelect}`} style={{ width: 'auto', flex: '0 0 auto' }} aria-label="Prefijo" title={PREFIJOS.find((p) => p.codigo === form.prefijo)?.pais} value={form.prefijo} onChange={(e) => setForm((f) => ({ ...f, prefijo: e.target.value }))}>
                    {PREFIJOS.map((p) => <option key={`${p.codigo}-${p.pais}`} value={p.codigo}>{p.bandera} {p.codigo}</option>)}
                  </select>
                  <input className={styles.formInput} type="tel" id="checkout-telefono" name="telefono" autoComplete="tel" placeholder="Ej. 600 123 456" value={form.telefono} onChange={handleChange} required style={{ flex: 1 }} />
                </div>
                <p className={styles.formNote}>Debe ser un número de <strong>móvil</strong> (no un fijo): te contactaremos por ahí.</p>
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

              {servicio.requierePais && (
                <>
                  <div className={styles.formTitle}>País del permiso</div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="checkout-pais">País del permiso</label>
                    <select className={`${styles.formInput} ${styles.formSelect}`} id="checkout-pais" name="paisCanje" value={form.paisCanje} onChange={handlePais} required>
                      <option value="">— Selecciona el país —</option>
                      <optgroup label="Con convenio">
                        {grupos.convenio.map((p) => <option key={p.clave} value={p.clave}>{p.nombre}</option>)}
                      </optgroup>
                      <optgroup label="Unión Europea / EEE">
                        {grupos.ue.map((p) => <option key={p.clave} value={p.clave}>{p.nombre}</option>)}
                      </optgroup>
                    </select>
                  </div>
                  {camposPais.map((c) => (
                    <div className={styles.formGroup} key={c.clave}>
                      <label className={styles.formLabel} htmlFor={`checkout-${c.clave}`}>{c.label}</label>
                      <input className={styles.formInput} type="text" id={`checkout-${c.clave}`} value={form.datosPais[c.clave] || ''} onChange={(e) => handleDatoPais(c.clave, e.target.value)} required />
                    </div>
                  ))}
                </>
              )}

              {servicio.requiereDireccion && (
                <>
                  <div className={styles.formTitle}>Dirección de envío del permiso</div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="dir-tipoVia">Tipo de vía</label>
                      <select className={`${styles.formInput} ${styles.formSelect}`} id="dir-tipoVia" value={form.direccion.tipoVia} onChange={(e) => handleDireccion('tipoVia', e.target.value)}>
                        {TIPOS_VIA.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="dir-nombreVia">Nombre de vía</label>
                      <input className={styles.formInput} type="text" id="dir-nombreVia" value={form.direccion.nombreVia} onChange={(e) => handleDireccion('nombreVia', e.target.value)} required />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="dir-numero">Número</label>
                      <input className={styles.formInput} type="text" id="dir-numero" value={form.direccion.numero} onChange={(e) => handleDireccion('numero', e.target.value)} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="dir-cp">Código postal</label>
                      <input className={styles.formInput} type="text" id="dir-cp" value={form.direccion.codigoPostal} onChange={(e) => handleDireccion('codigoPostal', e.target.value)} required />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="dir-municipio">Municipio</label>
                      <input className={styles.formInput} type="text" id="dir-municipio" value={form.direccion.municipio} onChange={(e) => handleDireccion('municipio', e.target.value)} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="dir-provincia">Provincia</label>
                      <select className={`${styles.formInput} ${styles.formSelect}`} id="dir-provincia" value={form.direccion.provincia} onChange={(e) => handleDireccion('provincia', e.target.value)} required>
                        <option value="">— Provincia —</option>
                        {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="dir-bloque">Bloque / Portal / Escalera / Planta / Puerta (opcional)</label>
                      <input className={styles.formInput} type="text" id="dir-bloque" placeholder="Bloque 2, Portal A, 3º B" value={form.direccion.bloque} onChange={(e) => handleDireccion('bloque', e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              <div className={styles.formCheck}>
                <input type="checkbox" id="checkout-acepta" name="aceptaCondiciones" checked={form.aceptaCondiciones} onChange={handleChange} required />
                <label htmlFor="checkout-acepta">
                  He leído y acepto las <Link to="/pagos-devoluciones" target="_blank" rel="noopener">condiciones de contratación</Link> y la <a href="/privacidad" target="_blank" rel="noopener">política de privacidad</a>. Solicito el inicio inmediato del servicio y entiendo que, una vez ejecutado por completo, perderé el derecho de desistimiento.
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
