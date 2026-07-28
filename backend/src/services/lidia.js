// Integración LidIA (contrato 1.0: docs/integraciones/2026-07-28-contrato-lidia-portal-v1-0.md)
import crypto from 'node:crypto';
import { getServicio } from '../catalog.js';
import { claveDesdeISO } from '../../../shared/paises-canje.js';
import { config } from '../config.js';
import { db } from '../db.js';

// Fase 1: solo una categoría activa. canje_2_categorias existe en el contrato
// pero sin precio de negocio: se activará poniendo activo:true (y su precio en
// el catálogo de servicios) — cambio compatible 1.x.
const CATALOGO_LIDIA = {
  canje_1_categoria: { servicioSlug: 'canje-carnet', activo: true },
  canje_2_categorias: { servicioSlug: 'canje-carnet', activo: false },
};

export function catalogoLidia(code) {
  const c = CATALOGO_LIDIA[code];
  if (!c || !c.activo) return null;
  const servicio = getServicio(c.servicioSlug);
  return { ...c, amountMinor: Math.round(servicio.precio * 100), currency: 'EUR' };
}

// Catálogo de solo lectura para que LidIA sincronice precios automáticamente
// y detecte desincronizaciones antes de que las sufra un cliente real.
export function listarCatalogoLidia() {
  return Object.entries(CATALOGO_LIDIA).map(([catalog_code, c]) => ({
    service: c.servicioSlug,
    catalog_code,
    amount_minor: c.activo ? Math.round(getServicio(c.servicioSlug).precio * 100) : null,
    currency: 'EUR',
    active: c.activo,
  }));
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

const TIPO_DOC_SALIDA = { DNI: 'DNI', NIE: 'NIE', Pasaporte: 'PASAPORTE' };

// Cuerpo de negocio del evento payment.succeeded (contrato §8.4).
// `correcciones` = diff entre lo que mandó LidIA y lo confirmado por el
// cliente; el teléfono se incluye SOLO a título informativo (§8.6).
export function construirDatosPago(intent, expediente, user) {
  const confirmados = {
    nombre: user.nombre,
    apellidos: user.apellidos,
    email: user.email,
    tipo_documento: TIPO_DOC_SALIDA[user.tipoDocumento] || (user.tipoDocumento ? 'OTRO' : null),
    num_documento: user.numDocumento || null,
    telefono: user.telefono || null,
  };
  const mapeado = mapearPrefill(intent.prefill);
  const previos = {
    nombre: mapeado.nombre,
    apellidos: mapeado.apellidos,
    email: mapeado.email,
    tipo_documento: mapeado.tipoDocumento ? TIPO_DOC_SALIDA[mapeado.tipoDocumento] : undefined,
    num_documento: mapeado.numDocumento,
    telefono: mapeado.telefono,
  };
  const correcciones = [];
  for (const [campo, previo] of Object.entries(previos)) {
    if (previo !== undefined && confirmados[campo] && previo !== confirmados[campo]) {
      correcciones.push({ campo, valor_confirmado: confirmados[campo] });
    }
  }
  return {
    n_pedido: expediente.nPedido,
    status: 'paid',
    amount_minor: intent.amountMinor,
    currency: intent.currency,
    payment_method: expediente.pagoMetodo || 'card',
    // Referencia del cobro (payment_intent de Stripe) — pedida por LidIA para
    // su ledger (2026-07-28); es la misma que escribimos en Ref_pago del Deal.
    payment_ref: expediente.pagoRef || null,
    datos_confirmados: confirmados,
    correcciones,
  };
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
