import { useEffect, useState } from 'react';
import PortalLayout from '../../components/portal/PortalLayout.jsx';
import { getMe, patchMe } from '../../lib/api.js';
import styles from './MisDatos.module.css';

const EMPTY_FORM = { nombre: '', apellidos: '', email: '', telefono: '', tipoDocumento: 'DNI', numDocumento: '' };

// New page (Task 8). GET /api/me returns { id, email, nombre, apellidos,
// telefono, tipoDocumento, numDocumento } (backend/src/routes/portal.js);
// PATCH /api/me accepts a subset of the editable fields (email is
// read-only — there's no email field in the PATCH payload backend-side).
export default function MisDatos() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((data) => {
        if (cancelled) return;
        setForm({
          nombre: data.nombre || '', apellidos: data.apellidos || '', email: data.email || '',
          telefono: data.telefono || '', tipoDocumento: data.tipoDocumento || 'DNI', numDocumento: data.numDocumento || '',
        });
      })
      .catch((err) => { if (!cancelled) setLoadError(err.message || 'No se pudieron cargar tus datos'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('saving');
    setErrorMsg('');
    try {
      await patchMe({
        nombre: form.nombre, apellidos: form.apellidos, telefono: form.telefono,
        tipoDocumento: form.tipoDocumento, numDocumento: form.numDocumento,
      });
      setStatus('saved');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'No se pudieron guardar los cambios');
    }
  }

  return (
    <PortalLayout title="Mis datos" subtitle="Mantén tu información de contacto actualizada.">
      {loadError && <p className={styles.error} role="alert">{loadError}</p>}
      {!loadError && loading && <p className={styles.loading}>Cargando…</p>}

      {!loading && !loadError && (
        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="datos-nombre">Nombre</label>
              <input className={styles.formInput} type="text" id="datos-nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="datos-apellidos">Apellidos</label>
              <input className={styles.formInput} type="text" id="datos-apellidos" name="apellidos" value={form.apellidos} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="datos-email">Email</label>
              <input className={styles.formInput} type="email" id="datos-email" name="email" value={form.email} disabled />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="datos-telefono">Teléfono</label>
              <input className={styles.formInput} type="tel" id="datos-telefono" name="telefono" value={form.telefono} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="datos-tipoDocumento">Tipo de documento</label>
              <select className={`${styles.formInput} ${styles.formSelect}`} id="datos-tipoDocumento" name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange}>
                <option value="DNI">DNI</option>
                <option value="NIE">NIE</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="datos-numDocumento">Nº de documento</label>
              <input className={styles.formInput} type="text" id="datos-numDocumento" name="numDocumento" value={form.numDocumento} onChange={handleChange} />
            </div>
          </div>

          {status === 'saved' && <p className={`${styles.formStatus} ${styles.success}`} role="status">Datos guardados.</p>}
          {status === 'error' && <p className={`${styles.formStatus} ${styles.errorText}`} role="alert">{errorMsg}</p>}

          <button type="submit" className={styles.formSubmit} disabled={status === 'saving'}>
            {status === 'saving' ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      )}

      <p className={styles.gdprNote}>
        Para ejercer tus derechos de acceso, rectificación o supresión (RGPD), escríbenos a{' '}
        <a href="mailto:privacidad@gestadia.com">privacidad@gestadia.com</a>.
      </p>
    </PortalLayout>
  );
}
