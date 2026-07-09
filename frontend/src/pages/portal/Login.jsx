import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import { login } from '../../lib/api.js';
import { saveToken } from '../../lib/auth.js';
import styles from './AuthCard.module.css';

// New page (Task 8) — no preview-*.html source; functional inspiration
// from unir/public/app.js's vistaLogin() (sibling repo, read-only), rebuilt
// as a real form with saveToken()+navigate() instead of hash routing.
// Visual language reuses the page-header + centered-card form pattern
// already established by Checkout.jsx/Contacto.jsx.
export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | error
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
      const body = await login(form.email, form.password);
      saveToken(body.token);
      navigate('/portal/mis-servicios');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'No se pudo iniciar sesión');
    }
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.pageEyebrow}>Área de cliente</div>
          <h1 className={styles.pageTitle}>Entrar</h1>
          <p className={styles.pageSub}>Accede a tu área de cliente para seguir tus trámites.</p>
        </div>
      </div>

      <div className={styles.body}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="login-email">Email</label>
            <input className={styles.formInput} type="email" id="login-email" name="email" autoComplete="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="login-password">Contraseña</label>
            <input className={styles.formInput} type="password" id="login-password" name="password" autoComplete="current-password" value={form.password} onChange={handleChange} required />
          </div>

          {status === 'error' && (
            <p className={`${styles.formStatus} ${styles.error}`} role="alert">{errorMsg}</p>
          )}

          <button type="submit" className={styles.formSubmit} disabled={status === 'sending'}>
            {status === 'sending' ? 'Entrando…' : 'Entrar'}
          </button>

          <p className={styles.formNote}>
            <Link to="/portal/recuperar">He olvidado mi contraseña</Link>
          </p>
        </form>
      </div>

      <Footer />
    </div>
  );
}
