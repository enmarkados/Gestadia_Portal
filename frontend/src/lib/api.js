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
