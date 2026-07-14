import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import { setPassword } from '../../lib/api.js';
import { saveToken } from '../../lib/auth.js';
import styles from './AuthCard.module.css';

// New page (Task 8). Reads the `:token` route param and posts it to
// POST /api/auth/set-password (backend/src/routes/auth.js), which accepts
// this same `token` param for two different flows — a post-checkout
// invite link (Gracias.jsx's "Ir a mi área de cliente" email) and a
// password-reset link (RecuperarClave.jsx's forgot-password email). The
// backend distinguishes them server-side (inviteToken vs resetToken
// lookup); this page doesn't need to know which one it is.
export default function CrearClave() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPasswordValue] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const body = await setPassword(token, password);
      saveToken(body.token);
      navigate('/portal/mis-servicios');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'No se pudo crear la contraseña');
    }
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.pageEyebrow}>Área de cliente</div>
          <h1 className={styles.pageTitle}>Crea tu contraseña</h1>
          <p className={styles.pageSub}>Con ella accederás a tu área de cliente siempre que quieras.</p>
        </div>
      </div>

      <div className={styles.body}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="crear-clave-password">Nueva contraseña (mínimo 8 caracteres)</label>
            <input
              className={styles.formInput}
              type="password"
              id="crear-clave-password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPasswordValue(e.target.value)}
              required
            />
          </div>

          {status === 'error' && (
            <p className={`${styles.formStatus} ${styles.error}`} role="alert">{errorMsg}</p>
          )}

          <button type="submit" className={styles.formSubmit} disabled={status === 'sending'}>
            {status === 'sending' ? 'Guardando…' : 'Guardar y entrar'}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}
