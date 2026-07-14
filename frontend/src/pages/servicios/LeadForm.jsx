import { useState } from 'react';
import { postLead } from '../../lib/api.js';
import styles from './LeadForm.module.css';

// Shared "Solicita información" checkout-card sidebar, used by all 8 trámite
// pages (Task 4). Its CSS (.checkout-card, .checkout-price-block,
// .checkout-service, .checkout-price, .checkout-includes, .checkout-body,
// .form-label, .form-input, .checkout-btn, .checkout-security,
// .checkout-divider, .checkout-whatsapp, .lead-form-title, .lead-form-sub)
// is byte-identical across every preview-*.html trámite page's <style>
// block, so it's extracted once here (LeadForm.module.css) instead of
// duplicated into each page's own module.css — the only page-specific
// inputs are the price-block content (servicio/precio/includes) and the
// `tramite` string sent to postLead.
//
// Behavior mirrors each source page's inline <script> exactly: on submit,
// require all three fields (native `required` + a manual trim-check,
// matching the original's `if (!nombre || !telefono || !email) return;`),
// disable the button and show "Enviando..." while in flight, and on success
// replace the form with the same "¡Solicitud recibida!" + WhatsApp-link
// confirmation the original's showSuccess() injected via innerHTML. On
// failure the original silently re-enables the button with no visible error
// message — reproduced as-is (no new error UI invented).
export default function LeadForm({ servicio, precio, includes, tramite }) {
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.telefono.trim() || !form.email.trim()) return;
    setStatus('sending');
    try {
      await postLead({ nombre: form.nombre, telefono: form.telefono, email: form.email, tramite });
      setStatus('success');
    } catch {
      setStatus('idle');
    }
  }

  return (
    <div className={styles.checkoutCard}>
      <div className={styles.checkoutPriceBlock}>
        <div className={styles.checkoutService}>{servicio}</div>
        <div className={styles.checkoutPrice}>{precio}<sub>IVA incluido</sub></div>
        <div className={styles.checkoutIncludes}>
          {includes.map((inc) => (
            <span key={inc}>{inc}</span>
          ))}
        </div>
      </div>

      <div className={styles.checkoutBody}>
        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px', color: '#16a34a' }}>✓</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>¡Solicitud recibida!</div>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '20px' }}>Te llamamos en menos de 24 horas hábiles.</p>
            <a
              href="https://wa.me/34684462670"
              target="_blank"
              rel="noopener"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: '#fff', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}
            >
              💬 Escríbenos por WhatsApp
            </a>
          </div>
        ) : (
          <>
            <div className={styles.leadFormTitle}>Solicita información</div>
            <p className={styles.leadFormSub}>Te llamamos en menos de 24 horas</p>
            <form onSubmit={handleSubmit}>
              <label className={styles.formLabel} htmlFor="lead-nombre">Nombre</label>
              <input id="lead-nombre" className={styles.formInput} type="text" name="nombre" placeholder="María García" value={form.nombre} onChange={handleChange} required />
              <label className={styles.formLabel} htmlFor="lead-telefono">Teléfono</label>
              <input id="lead-telefono" className={styles.formInput} type="tel" name="telefono" placeholder="+34 600 000 000" value={form.telefono} onChange={handleChange} required />
              <label className={styles.formLabel} htmlFor="lead-email">Email</label>
              <input id="lead-email" className={styles.formInput} type="email" name="email" placeholder="maria@email.com" value={form.email} onChange={handleChange} required />
              <button type="submit" className={styles.checkoutBtn} disabled={status === 'sending'}>
                {status === 'sending' ? 'Enviando...' : 'Solicitar información →'}
              </button>
            </form>
            <div className={styles.checkoutDivider} />
            <div className={styles.checkoutWhatsapp}>
              💬 ¿Prefieres escribir? <a href="https://wa.me/34684462670" target="_blank" rel="noopener" style={{ color: '#166534', fontWeight: 700, textDecoration: 'none' }}>Escríbenos por WhatsApp</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
