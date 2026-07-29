import { Router, raw, json } from 'express';
import Stripe from 'stripe';
import { config } from '../config.js';
import { db } from '../db.js';
import { faseToEstado } from '../catalog.js';
import { fulfillPayment } from './checkout.js';
import { transitionExpediente } from '../services/notify.js';

export const webhooksRouter = Router();
const stripe = config.stripe.enabled ? new Stripe(config.stripe.secretKey) : null;

// Método de pago REALMENTE usado. `session.payment_method_types` es la lista de
// métodos PERMITIDOS (['card','bizum']), no el elegido — por eso hay que leer el
// tipo del cargo del PaymentIntent. Función pura para poder testearla.
export function metodoDeSesion(paymentIntent, session) {
  return paymentIntent?.latest_charge?.payment_method_details?.type
    || session?.payment_method_types?.[0]
    || 'card';
}

// ------------------------------------------------------------
// STRIPE → backend  (configurar en dashboard: checkout.session.completed)
// ------------------------------------------------------------
webhooksRouter.post('/webhooks/stripe', raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(400).send('Stripe no configurado');
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], config.stripe.webhookSecret);
  } catch (e) {
    console.error('Firma de webhook Stripe inválida:', e.message);
    return res.status(400).send('Firma inválida');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Solo se cumple el pedido si el pago está CONFIRMADO (no en métodos asíncronos aún pendientes)
    if (session.payment_status !== 'paid') {
      return res.json({ received: true, ignored: 'unpaid' });
    }
    const expedienteId = session.metadata?.expedienteId;
    // El evento trae la sesión sin expandir; recuperamos el cargo para saber el
    // método real (tarjeta vs Bizum). Si falla, caemos al primer método permitido.
    let metodo;
    try {
      const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ['payment_intent.latest_charge'] });
      metodo = metodoDeSesion(full.payment_intent, session);
    } catch (e) {
      console.error('No se pudo recuperar el método de pago, uso fallback:', e.message);
      metodo = metodoDeSesion(null, session);
    }
    if (expedienteId) {
      await fulfillPayment(expedienteId, { ref: session.payment_intent || session.id, metodo });
    }
  }
  res.json({ received: true });
});

// ------------------------------------------------------------
// ZOHO → backend  (workflow de Zoho "al editar Trato" con webhook)
// Body esperado (configurar en Zoho con merge fields):
//   { "dealId": "${Tratos.ID de registro}",
//     "nPedido": "${Tratos.N. Pedido}",
//     "fase": "${Tratos.Fase del canje}"  (o el campo de fase del servicio) }
// Header requerido: X-Gestadia-Secret: <ZOHO_WEBHOOK_SECRET>
// ------------------------------------------------------------
webhooksRouter.post('/webhooks/zoho', json(), async (req, res) => {
  const secreto = req.headers['x-gestadia-secret'] || req.query.secret;
  if (config.zoho.webhookSecret && secreto !== config.zoho.webhookSecret) {
    return res.status(401).json({ error: 'Secreto inválido' });
  }
  const { dealId, nPedido, fase } = req.body || {};
  if (!fase || (!dealId && !nPedido)) return res.status(400).json({ error: 'Faltan dealId/nPedido o fase' });

  const expediente = await db.expediente.findFirst({
    where: dealId ? { zohoDealId: String(dealId) } : { nPedido: String(nPedido) },
    include: { user: true },
  });
  if (!expediente) return res.status(404).json({ error: 'Expediente no encontrado' });

  const estado = faseToEstado(expediente.servicioSlug, fase);
  if (!estado) {
    console.warn(`Fase Zoho sin mapear para ${expediente.servicioSlug}: "${fase}"`);
    return res.json({ ok: true, ignorada: fase });
  }

  await transitionExpediente(expediente, estado, { faseZoho: fase });
  res.json({ ok: true, estado });
});
