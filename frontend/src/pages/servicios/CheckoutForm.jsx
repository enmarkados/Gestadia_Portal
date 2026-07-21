import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { postCheckout } from '../../lib/api.js';
import { PAISES, paisesOrdenados } from '@shared/paises-canje.js';
import { TIPOS_VIA, PROVINCIAS } from '@shared/direccion.js';
import { PREFIJOS, PREFIJO_DEFECTO } from '@shared/prefijos.js';
import styles from '../Checkout.module.css';

const EMPTY_FORM = {
  nombre: '', apellidos: '', email: '', prefijo: PREFIJO_DEFECTO, telefono: '',
  tipoDocumento: 'DNI', numDocumento: '', aceptaCondiciones: false,
  paisCanje: '', datosPais: {},
  direccion: { tipoVia: 'Calle', nombreVia: '', numero: '', bloque: '', portal: '', escalera: '', planta: '', puerta: '', km: '', codigoPostal: '', municipio: '', localidad: '', provincia: '' },
};

// El backend aún puede devolver URLs legacy con `.html`; se limpian antes de navegar.
function toReactRoute(url) {
  return url.replace('/gracias.html', '/gracias').replace('/checkout.html', '/checkout');
}

// Formulario de pago reutilizable. Se usa embebido en la ficha (ContratarCard)
// y en la página /checkout. Recibe `servicio` (slug + flags) y NO llama a la API.
export default function CheckoutForm({ servicio }) {
  const [searchParams] = useSearchParams();
  const cancelado = searchParams.get('cancelado');
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle'); // idle | sending | error
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  const grupos = paisesOrdenados();
  const camposPais = form.paisCanje ? (PAISES[form.paisCanje]?.camposExtra ?? []) : [];

  function handlePais(e) { setForm((f) => ({ ...f, paisCanje: e.target.value, datosPais: {} })); }
  function handleDatoPais(clave, value) { setForm((f) => ({ ...f, datosPais: { ...f.datosPais, [clave]: value } })); }
  function handleDireccion(campo, value) { setForm((f) => ({ ...f, direccion: { ...f.direccion, [campo]: value } })); }

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
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formTitle}>Tus datos</div>

      {cancelado && (
        <p className={`${styles.formStatus} ${styles.error}`} role="alert">
          El pago se canceló. Puedes intentarlo de nuevo cuando quieras.
        </p>
      )}

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
          <input className={styles.formInput} type="tel" id="checkout-telefono" name="telefono" autoComplete="tel" placeholder="Número de WhatsApp" value={form.telefono} onChange={handleChange} required style={{ flex: 1 }} />
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
  );
}
