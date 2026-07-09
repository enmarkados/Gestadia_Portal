import { getToken, clearToken } from './auth.js';

const BASE = ''; // same-origin in prod; Vite dev proxy handles /api in dev

export async function postLead({ nombre, telefono, email, tramite }) {
  const res = await fetch(`${BASE}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, telefono, email, tramite }),
  });
  const body = await res.json();
  if (!res.ok || !body.ok) throw new Error(body.error || 'Error al enviar el formulario');
  return body;
}

export async function getServicios() {
  const res = await fetch('/api/servicios');
  if (!res.ok) throw new Error('No se pudo cargar el catálogo de servicios');
  return res.json();
}

export async function postCheckout(payload) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'No se pudo iniciar el pago');
  return body;
}

// ---------- Portal de cliente (Task 8) ----------
// authedFetch attaches the bearer token from lib/auth.js to every portal
// API call. On a 401 (expired/invalid token — see backend/src/middleware/
// auth.js's requireAuth) it clears the stored token and hard-redirects to
// the login page centrally here, instead of every page having to repeat
// that check on catch.
async function authedFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${getToken()}` },
  });
  if (res.status === 401) {
    clearToken();
    window.location.href = '/portal/login';
    throw new Error('Sesión caducada, vuelve a entrar');
  }
  return res;
}

export async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'No se pudo iniciar sesión');
  return body; // { token, nombre }
}

// Backend's /api/auth/set-password handles both post-checkout invite
// tokens and password-reset tokens under the same `token` body param
// (backend/src/routes/auth.js) — CrearClave.jsx uses this for both flows.
export async function setPassword(token, password) {
  const res = await fetch('/api/auth/set-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'No se pudo crear la contraseña');
  return body;
}

export async function forgotPassword(email) {
  const res = await fetch('/api/auth/forgot', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function getMe() {
  const res = await authedFetch('/api/me');
  return res.json();
}

export async function patchMe(data) {
  const res = await authedFetch('/api/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.json();
}

export async function getExpedientes() {
  const res = await authedFetch('/api/expedientes');
  return res.json();
}

export async function getExpediente(id) {
  const res = await authedFetch(`/api/expedientes/${id}`);
  if (res.status === 404) throw new Error('Expediente no encontrado');
  return res.json();
}

export async function uploadDocumento(expedienteId, clave, file) {
  const formData = new FormData();
  formData.append('clave', clave);
  formData.append('fichero', file);
  const res = await authedFetch(`/api/expedientes/${expedienteId}/documentos`, { method: 'POST', body: formData });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'No se pudo subir el documento');
  return body;
}

export async function getNotificaciones() {
  const res = await authedFetch('/api/notificaciones');
  return res.json();
}

export async function markNotificacionLeida(id) {
  const res = await authedFetch(`/api/notificaciones/${id}/leer`, { method: 'POST' });
  return res.json();
}
