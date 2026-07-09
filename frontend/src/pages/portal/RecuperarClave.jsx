import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import { forgotPassword } from '../../lib/api.js';
import styles from './AuthCard.module.css';

// New page (Task 8). POST /api/auth/forgot always returns { ok: true }
// whether or not the account exists (backend/src/routes/auth.js — "no
// filtrar cuentas"), so this page always shows the same "revisa tu email"
// message and never distinguishes success/failure to the caller.
export default function RecuperarClave() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      await forgotPassword(email);
    } finally {
      // Same message regardless of whether the request succeeded or the
      // account exists — the backend response is intentionally uniform.
      setStatus('sent');
    }
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.pageEyebrow}>Área de cliente</div>
          <h1 className={styles.pageTitle}>Recupera tu acceso</h1>
          <p className={styles.pageSub}>Te enviaremos un enlace para crear una nueva contraseña.</p>
        </div>
      </div>

      <div className={styles.body}>
        {status === 'sent' ? (
          <p className={`${styles.formStatus} ${styles.success}`} role="status">
            Si existe una cuenta con ese email, recibirás un enlace para crear una nueva contraseña.
          </p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="recuperar-email">Email</label>
              <input className={styles.formInput} type="email" id="recuperar-email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <button type="submit" className={styles.formSubmit} disabled={status === 'sending'}>
              {status === 'sending' ? 'Enviando…' : 'Enviar enlace'}
            </button>

            <p className={styles.formNote}>
              <Link to="/portal/login">Volver a entrar</Link>
            </p>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}
