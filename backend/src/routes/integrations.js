// API de integración LidIA — contrato 1.0
// (docs/integraciones/2026-07-28-contrato-lidia-portal-v1-0.md)
import { Router } from 'express';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { db } from '../db.js';
import { catalogoLidia, listarCatalogoLidia, mapearPrefill, encolarEvento } from '../services/lidia.js';

export const integrationsRouter = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const E164_RE = /^\+[1-9]\d{6,14}$/;

const MENSAJES = {
  unauthorized: 'API key no válida',
  unsupported_schema_version: 'Versión de esquema no soportada',
  invalid_payload: 'Payload inválido',
  zoho_reference_invalid: 'Referencias Zoho no utilizables',
  catalog_code_no_disponible: 'Producto no habilitado',
  importe_no_coincide: 'Precio o moneda no coinciden con el catálogo',
  idempotency_conflict: 'La misma idempotency_key llegó con un payload distinto',
  checkout_intent_not_found: 'Intent inexistente',
  internal_error: 'Fallo temporal no detallado',
};

function errRes(res, status, error, extra = {}) {
  const trace_id = crypto.randomBytes(8).toString('hex');
  console.warn(`[lidia] ${status} ${error} trace=${trace_id}`);
  return res.status(status).json({ error, message: MENSAJES[error] || error, trace_id, ...extra });
}

function requireApiKey(req, res, next) {
  if (!config.lidia.enabled || req.headers['x-api-key'] !== config.lidia.apiKey) {
    return errRes(res, 401, 'unauthorized');
  }
  next();
}

const OBLIGATORIOS = [
  'idempotency_key', 'lidia_payment_id', 'lidia_payment_attempt_id',
  'lidia_session_id', 'lidia_contact_id', 'lidia_agent_id',
  'service', 'catalog_code', 'amount_minor', 'currency', 'telefono',
  'zoho_contact_id', 'zoho_deal_id',
];

// Formatos del contrato §6.4. Devuelve un mensaje de error o null.
function validarFormatos(b) {
  for (const k of OBLIGATORIOS) {
    if (b[k] === undefined || b[k] === null || b[k] === '') return `Falta el campo ${k}`;
  }
  for (const k of ['idempotency_key', 'lidia_payment_id', 'lidia_payment_attempt_id']) {
    if (typeof b[k] !== 'string' || !UUID_RE.test(b[k])) return `${k} debe ser un UUID en minúsculas`;
  }
  for (const k of ['lidia_session_id', 'lidia_contact_id', 'lidia_agent_id', 'zoho_contact_id', 'zoho_deal_id']) {
    if (typeof b[k] !== 'string' || b[k].length > 128) return `${k} debe ser una cadena de hasta 128 caracteres`;
  }
  if (!E164_RE.test(String(b.telefono))) return 'telefono debe usar formato E.164';
  if (!Number.isInteger(b.amount_minor) || b.amount_minor <= 0) return 'amount_minor debe ser un entero positivo';
  if (!/^[A-Z]{3}$/.test(String(b.currency))) return 'currency debe ser ISO 4217 en mayúsculas';
  return null;
}

function respuestaIntent(intent, reused) {
  return {
    schema_version: '1.0',
    checkout_intent_id: intent.publicId,
    lidia_payment_id: intent.lidiaPaymentId,
    lidia_payment_attempt_id: intent.lidiaPaymentAttemptId,
    url: `${config.baseUrl}/c/${intent.token}`,
    expires_at: intent.expiresAt.toISOString(),
    status: intent.estado,
    reused,
  };
}

integrationsRouter.post('/api/integrations/lidia/checkout-intent', requireApiKey, async (req, res) => {
  try {
    const b = req.body || {};
    if (b.schema_version !== '1.0') return errRes(res, 400, 'unsupported_schema_version');
    const errorFormato = validarFormatos(b);
    if (errorFormato) return errRes(res, 400, 'invalid_payload', { message: errorFormato });
    if (!/^\d+$/.test(b.zoho_contact_id) || !/^\d+$/.test(b.zoho_deal_id)) {
      return errRes(res, 409, 'zoho_reference_invalid');
    }
    const cat = catalogoLidia(b.catalog_code);
    if (!cat || cat.servicioSlug !== b.service) return errRes(res, 409, 'catalog_code_no_disponible');
    if (b.amount_minor !== cat.amountMinor || b.currency !== cat.currency) {
      return errRes(res, 409, 'importe_no_coincide', {
        amount_minor_catalogo: cat.amountMinor, currency_catalogo: cat.currency,
      });
    }

    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(b)).digest('hex');
    const existente = await db.checkoutIntent.findUnique({ where: { idempotencyKey: b.idempotency_key } });
    if (existente) {
      if (existente.payloadHash !== payloadHash) return errRes(res, 409, 'idempotency_conflict');
      // Se devuelve sea cual sea su estado (incluido expired) para que LidIA lo sepa.
      return res.status(200).json(respuestaIntent(existente, true));
    }

    if (b.replaces_checkout_intent_id) {
      // El sustituido queda cancelled sin evento: la regeneración la inicia
      // LidIA y así un callback atrasado del intento anterior no pisa al nuevo.
      await db.checkoutIntent.updateMany({
        where: { publicId: String(b.replaces_checkout_intent_id), estado: { in: ['active', 'opened', 'expired'] } },
        data: { estado: 'cancelled' },
      });
    }

    const intent = await db.checkoutIntent.create({
      data: {
        publicId: 'gci_' + crypto.randomBytes(12).toString('base64url'),
        token: crypto.randomBytes(18).toString('base64url'),
        idempotencyKey: b.idempotency_key,
        payloadHash,
        procedencia: 'lidia',
        servicioSlug: b.service,
        catalogCode: b.catalog_code,
        amountMinor: b.amount_minor,
        currency: b.currency,
        lidiaPaymentId: b.lidia_payment_id,
        lidiaPaymentAttemptId: b.lidia_payment_attempt_id,
        replacesId: b.replaces_checkout_intent_id || null,
        prefill: { ...(b.prefill || {}), telefono: b.telefono },
        origenMeta: {
          lidia_session_id: b.lidia_session_id,
          lidia_contact_id: b.lidia_contact_id,
          lidia_agent_id: b.lidia_agent_id,
          zoho_contact_id: b.zoho_contact_id,
          zoho_deal_id: b.zoho_deal_id,
          extra: b.extra ?? null,
        },
        estado: 'active',
        expiresAt: new Date(Date.now() + config.lidia.intentTtlDias * 24 * 3600 * 1000),
      },
    });
    res.status(201).json(respuestaIntent(intent, false));
  } catch (e) {
    console.error('[lidia] checkout-intent error:', e);
    errRes(res, 500, 'internal_error');
  }
});

// Catálogo de solo lectura: LidIA sincroniza precios contra la fuente de
// verdad y detecta desincronizaciones antes que un cliente real.
integrationsRouter.get('/api/integrations/lidia/catalog', requireApiKey, (_req, res) => {
  res.json({ schema_version: '1.0', products: listarCatalogoLidia() });
});

// Reconciliación (contrato §7): fuente de verdad si un callback se pierde.
integrationsRouter.get('/api/integrations/lidia/checkout-intents/:publicId', requireApiKey, async (req, res) => {
  try {
    const intent = await db.checkoutIntent.findUnique({ where: { publicId: req.params.publicId } });
    if (!intent) return errRes(res, 404, 'checkout_intent_not_found');
    const expediente = intent.expedienteId
      ? await db.expediente.findUnique({ where: { id: intent.expedienteId } })
      : null;
    res.json({
      schema_version: '1.0',
      checkout_intent_id: intent.publicId,
      lidia_payment_id: intent.lidiaPaymentId,
      lidia_payment_attempt_id: intent.lidiaPaymentAttemptId,
      status: intent.estado,
      url: `${config.baseUrl}/c/${intent.token}`,
      expires_at: intent.expiresAt.toISOString(),
      n_pedido: expediente?.nPedido ?? null,
      amount_minor: intent.amountMinor,
      currency: intent.currency,
      payment_method: expediente?.pagoMetodo ?? null,
      paid_at: expediente?.fechaPago ? new Date(expediente.fechaPago).toISOString() : null,
      updated_at: new Date(intent.updatedAt).toISOString(),
    });
  } catch (e) {
    console.error('[lidia] GET intent error:', e);
    errRes(res, 500, 'internal_error');
  }
});

// Resolución pública del enlace corto para el frontend. Devuelve SOLO el
// prellenado — nunca ids de Zoho/LidIA ni estado interno.
integrationsRouter.get('/api/checkout-intent/:token', async (req, res) => {
  try {
    const intent = await db.checkoutIntent.findUnique({ where: { token: req.params.token } });
    if (!intent || intent.estado === 'expired' || intent.estado === 'cancelled') {
      return res.status(404).json({ error: 'Enlace no válido o caducado' });
    }
    if (intent.estado === 'paid') {
      const expediente = intent.expedienteId
        ? await db.expediente.findUnique({ where: { id: intent.expedienteId } })
        : null;
      return res.json({ pagado: true, nPedido: expediente?.nPedido ?? null });
    }
    if (intent.expiresAt < new Date()) {
      return res.status(404).json({ error: 'Enlace no válido o caducado' });
    }
    if (intent.estado === 'active') {
      await db.checkoutIntent.update({ where: { id: intent.id }, data: { estado: 'opened' } });
      await encolarEvento('checkout.opened', intent);
    }
    res.json({ servicio: intent.servicioSlug, procedencia: intent.procedencia, prefill: mapearPrefill(intent.prefill) });
  } catch (e) {
    console.error('[lidia] GET token error:', e);
    res.status(500).json({ error: 'No se pudo procesar la solicitud. Inténtalo de nuevo.' });
  }
});
