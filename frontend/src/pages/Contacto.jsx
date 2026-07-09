import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { postLead } from '../lib/api.js';
import styles from './Contacto.module.css';

const TRAMITE_OPTIONS = [
  'Canje de Carnet Extranjero',
  'Transferencia de Vehículo',
  'Duplicado de Carnet de Conducir',
  'Duplicado por Cambio de Datos',
  'Duplicado Permiso de Circulación',
  'Baja de Vehículo',
  'Cancelación de Reserva de Dominio',
  'Permiso Internacional de Conducir',
  'Otro',
];

const EMPTY_FORM = { nombre: '', apellidos: '', email: '', telefono: '', tramite: '', mensaje: '' };

// Migrated from preview-contacto.html (body lines 98-254). <nav>/<footer>
// replaced with <Header />/<Footer /> (Task 2).
//
// NOTE: unlike what the task brief assumed, preview-contacto.html has no
// inline <script> at all — its <form> has no name/id attributes and no
// submit handler; it's entirely static markup. There is nothing to
// "reproduce" behavior-wise. The submit handler below is therefore new
// code, designed to satisfy the fixed `postLead({ nombre, telefono, email,
// tramite })` contract from lib/api.js (Step 1) and backend's leads route
// (backend/src/routes/leads.js), which requires all four fields non-empty:
//   - "Nombre" + "Apellidos" are combined into the single `nombre` field
//     postLead expects (both are still collected from the user).
//   - "Trámite de interés" is optional in the UI copy ("(opcional)") but
//     required by the backend, so an empty selection falls back to
//     'Consulta general' rather than 404 the user with silently failing
//     leads.
//   - "Mensaje" has no corresponding field in postLead's fixed signature,
//     so it's collected in local state but not sent — there is no backend
//     field for it yet.
// Labels got explicit htmlFor/id pairs (the original HTML had none) so the
// fields are addressable via getByLabelText in tests and accessible to
// screen readers.
export default function Contacto() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      await postLead({
        nombre: [form.nombre, form.apellidos].filter(Boolean).join(' ').trim(),
        telefono: form.telefono,
        email: form.email,
        tramite: form.tramite || 'Consulta general',
      });
      setStatus('success');
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Error al enviar el formulario');
    }
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.breadcrumb}><Link to="/">Inicio</Link> / <span>Contacto</span></div>
          <div className={styles.pageEyebrow}>Estamos aquí para ayudarte</div>
          <h1 className={styles.pageTitle}>¿Tienes alguna duda?</h1>
          <p className={styles.pageSub}>Cuéntanos qué necesitas y te respondemos en menos de 24 horas. También puedes escribirnos directamente por WhatsApp.</p>
        </div>
      </div>

      <div className={styles.contactBody}>
        {/* FORMULARIO */}
        <div className={styles.contactFormWrap}>
          <div className={styles.formTitle}>Envíanos un mensaje</div>
          <p className={styles.formSub}>Rellena el formulario y uno de nuestros especialistas se pondrá en contacto contigo.</p>

          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="contacto-nombre">Nombre</label>
                <input className={styles.formInput} type="text" id="contacto-nombre" name="nombre" placeholder="Tu nombre" value={form.nombre} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="contacto-apellidos">Apellidos</label>
                <input className={styles.formInput} type="text" id="contacto-apellidos" name="apellidos" placeholder="Tus apellidos" value={form.apellidos} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="contacto-email">Email</label>
                <input className={styles.formInput} type="email" id="contacto-email" name="email" placeholder="tu@email.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="contacto-telefono">Teléfono</label>
                <input className={styles.formInput} type="tel" id="contacto-telefono" name="telefono" placeholder="+34 600 000 000" value={form.telefono} onChange={handleChange} required />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="contacto-tramite">Trámite de interés</label>
              <select className={`${styles.formInput} ${styles.formSelect}`} id="contacto-tramite" name="tramite" value={form.tramite} onChange={handleChange}>
                <option value="">Selecciona un trámite (opcional)</option>
                {TRAMITE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="contacto-mensaje">Mensaje</label>
              <textarea className={`${styles.formInput} ${styles.formTextarea}`} id="contacto-mensaje" name="mensaje" placeholder="Cuéntanos en qué podemos ayudarte..." value={form.mensaje} onChange={handleChange} />
            </div>

            <button type="submit" className={styles.formSubmit} disabled={status === 'sending'}>
              {status === 'sending' ? 'Enviando…' : 'Enviar mensaje →'}
            </button>
            <p className={styles.formNote}>Al enviar este formulario aceptas nuestra <a href="#" style={{ color: '#aaa' }}>política de privacidad</a>. Nunca compartimos tus datos con terceros.</p>

            {status === 'success' && (
              <p className={`${styles.formStatus} ${styles.success}`} role="status">Gracias, hemos recibido tu mensaje. Te contactaremos en menos de 24 horas.</p>
            )}
            {status === 'error' && (
              <p className={`${styles.formStatus} ${styles.error}`} role="alert">{errorMsg}</p>
            )}
          </form>
        </div>

        {/* SIDEBAR */}
        <div className={styles.contactSidebar}>
          <a href="https://wa.me/34684462670" target="_blank" rel="noopener" className={styles.whatsappBtn} style={{ marginBottom: '16px', display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            Escríbenos por WhatsApp
          </a>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l1.27-.84a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
              Contacto directo
            </div>
            <div className={styles.sidebarItem}>
              <div>
                <div className={styles.sidebarItemLabel}>Teléfono</div>
                <div className={styles.sidebarItemVal}><a href="tel:910600314">910 600 314</a></div>
              </div>
            </div>
            <div className={styles.sidebarItem}>
              <div>
                <div className={styles.sidebarItemLabel}>WhatsApp</div>
                <div className={styles.sidebarItemVal}><a href="https://wa.me/34684462670">684 46 26 70</a></div>
              </div>
            </div>
            <div className={styles.sidebarItem}>
              <div>
                <div className={styles.sidebarItemLabel}>Email</div>
                <div className={styles.sidebarItemVal}><a href="mailto:info@gestadia.com">info@gestadia.com</a></div>
              </div>
            </div>
            <div className={styles.sidebarItem}>
              <div>
                <div className={styles.sidebarItemLabel}>Dirección</div>
                <div className={styles.sidebarItemVal}>Paseo de la Castellana 143, 2A<br />28046 Madrid</div>
              </div>
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              Horario de atención
            </div>
            <div className={styles.hoursRow}>Lunes — Jueves <span>8:00 – 17:00</span></div>
            <div className={styles.hoursRow}>Viernes <span>8:00 – 14:00</span></div>
            <div className={styles.hoursRow}>Sábado <span style={{ color: '#bbb', fontWeight: 400 }}>Cerrado</span></div>
            <div className={styles.hoursRow}>Domingo <span style={{ color: '#bbb', fontWeight: 400 }}>Cerrado</span></div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
