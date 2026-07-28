// Integración LidIA (contrato 1.0: docs/integraciones/2026-07-28-contrato-lidia-portal-v1-0.md)
import crypto from 'node:crypto';
import { getServicio } from '../catalog.js';
import { claveDesdeISO } from '../../../shared/paises-canje.js';
import { config } from '../config.js';
import { db } from '../db.js';

// Fase 1: solo una categoría. canje_2_categorias se activará añadiendo la
// entrada cuando negocio publique el precio (cambio compatible 1.x).
const CATALOGO_LIDIA = {
  canje_1_categoria: { servicioSlug: 'canje-carnet' },
};

export function catalogoLidia(code) {
  const c = CATALOGO_LIDIA[code];
  if (!c) return null;
  const servicio = getServicio(c.servicioSlug);
  return { ...c, amountMinor: Math.round(servicio.precio * 100), currency: 'EUR' };
}

const TIPO_DOC_ENTRADA = { DNI: 'DNI', NIE: 'NIE', PASAPORTE: 'Pasaporte' };

// Prefill del contrato (§6.2) → campos del CheckoutForm. Todo lo no mapeable
// se omite: el cliente lo completa a mano. `direccion` llega como texto libre
// y es solo informativa (confirmación 1.0): no prellena el formulario.
export function mapearPrefill(prefill) {
  const p = prefill || {};
  const out = {};
  if (p.nombre) out.nombre = String(p.nombre);
  if (p.apellidos) out.apellidos = String(p.apellidos);
  if (p.email) out.email = String(p.email);
  const tipo = TIPO_DOC_ENTRADA[String(p.tipo_documento || '').toUpperCase()];
  if (tipo) out.tipoDocumento = tipo;
  if (p.num_documento) out.numDocumento = String(p.num_documento);
  const clave = claveDesdeISO(p.pais_canje);
  if (clave) out.paisCanje = clave;
  if (p.telefono) out.telefono = String(p.telefono);
  return out;
}

// ---------- Outbox de callbacks (contrato §8-§9) ----------

export function firmarCallback(rawBody, timestampSegundos) {
  const firma = crypto.createHmac('sha256', config.lidia.callbackSecret)
    .update(`${timestampSegundos}.${rawBody}`).digest('hex');
  return `${config.lidia.callbackKeyVersion}=${firma}`;
}

// Persiste el cuerpo EXACTO serializado una sola vez: la firma del contrato
// (§8.2) es sobre el body literal, no sobre un JSON re-serializado.
export async function encolarEvento(eventType, intent, extra = {}) {
  const eventId = 'evt_' + crypto.randomBytes(12).toString('base64url');
  const payload = JSON.stringify({
    schema_version: '1.0',
    event_id: eventId,
    event_type: eventType,
    occurred_at: new Date().toISOString(),
    checkout_intent_id: intent.publicId,
    lidia_payment_id: intent.lidiaPaymentId,
    lidia_payment_attempt_id: intent.lidiaPaymentAttemptId,
    lidia_session_id: intent.origenMeta?.lidia_session_id ?? null,
    ...extra,
  });
  await db.lidiaEvento.create({
    data: { eventId, eventType, checkoutIntentId: intent.id, payload, estado: 'pendiente', intentos: 0, proximoIntento: new Date() },
  });
  return eventId;
}

// Reintentos del contrato §9 (minutos). El intento n falla → espera BACKOFF_MIN[n-1].
const BACKOFF_MIN = [1, 10, 60, 360, 1440];

export async function despacharEventosPendientes(fetchImpl = fetch) {
  if (!config.lidia.callbackUrl || !config.lidia.callbackSecret) return;
  const pendientes = await db.lidiaEvento.findMany({
    where: { estado: 'pendiente', proximoIntento: { lte: new Date() } }, take: 20,
  });
  for (const ev of pendientes) {
    const timestamp = Math.floor(Date.now() / 1000);
    let status = 0;
    try {
      const res = await fetchImpl(config.lidia.callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gestadia-Key-Id': config.lidia.callbackKeyVersion,
          'X-Gestadia-Timestamp': String(timestamp),
          'X-Gestadia-Signature': firmarCallback(ev.payload, timestamp),
        },
        body: ev.payload,
      });
      status = res.status;
    } catch { status = 0; } // fallo de red → reintento
    const n = ev.intentos + 1;
    let estado;
    if (status >= 200 && status < 300) estado = 'enviado';
    else if (status === 400 || status === 401) estado = 'manual';
    else if (status === 409) estado = 'reconciliar';
    else estado = n > BACKOFF_MIN.length ? 'agotado' : 'pendiente';
    const data = { estado, intentos: n, ultimaRespuesta: String(status) };
    if (estado === 'pendiente') data.proximoIntento = new Date(Date.now() + BACKOFF_MIN[n - 1] * 60_000);
    if (estado === 'agotado' || estado === 'manual' || estado === 'reconciliar') {
      console.error(`[lidia] evento ${ev.eventId} → ${estado} (HTTP ${status}, ${n} intentos). Replay: node scripts/lidia-replay.mjs ${ev.eventId}`);
    }
    await db.lidiaEvento.update({ where: { id: ev.id }, data });
  }
}

export async function expirarIntents() {
  const vencidos = await db.checkoutIntent.findMany({
    where: { estado: { in: ['active', 'opened'] }, expiresAt: { lt: new Date() } },
  });
  for (const intent of vencidos) {
    await db.checkoutIntent.update({ where: { id: intent.id }, data: { estado: 'expired' } });
    await encolarEvento('checkout.expired', intent);
  }
}
