import { Router } from 'express';
import Stripe from 'stripe';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { db } from '../db.js';
import { SERVICIOS, getServicio, validarDatosCanje } from '../catalog.js';
import { upsertContact, createDealForExpediente, addDealNote, updateDealPago, updateContactPermitidos } from '../services/zoho.js';
import { resolvePrice, getOrCreateCustomer, linkCustomerToZoho } from '../services/stripe.js';
import { notifyUser, sendEmail, transitionExpediente } from '../services/notify.js';
import { encolarEvento, construirDatosPago } from '../services/lidia.js';

export const checkoutRouter = Router();
const stripe = config.stripe.enabled ? new Stripe(config.stripe.secretKey) : null;

function nuevoNPedido() {
  const d = new Date();
  return `GST-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${crypto.randomInt(10000, 99999)}`;
}

// Catálogo público para pintar la página de checkout
checkoutRouter.get('/api/servicios', (_req, res) => {
  res.json(Object.values(SERVICIOS).map(({ slug, nombre, descripcion, precio, checklist, requierePais, requiereDireccion }) =>
    ({ slug, nombre, descripcion, precio, checklist, requierePais: !!requierePais, requiereDireccion: !!requiereDireccion })));
});

// Inicia el checkout: crea usuario (si no existe) + expediente y devuelve la URL de pago
checkoutRouter.post('/api/checkout', async (req, res) => {
  try {
    const { servicio: slug, nombre, apellidos, email, telefono, tipoDocumento, numDocumento, aceptaCondiciones } = req.body || {};
    const servicio = getServicio(slug);
    if (!servicio) return res.status(400).json({ error: 'Servicio no válido' });
    if (!nombre || !apellidos || !email) return res.status(400).json({ error: 'Nombre, apellidos y email son obligatorios' });
    if (!telefono) return res.status(400).json({ error: 'El teléfono es obligatorio' });
    if (!aceptaCondiciones) return res.status(400).json({ error: 'Debes aceptar las condiciones de contratación' });

    const { paisCanje, direccion, datosPais } = req.body || {};
    const errorCanje = validarDatosCanje(servicio, { paisCanje, direccion, datosPais });
    if (errorCanje) return res.status(400).json({ error: errorCanje });

    // Enlace de LidIA (contrato 1.0): si llega un token válido y vigente, el
    // expediente hereda la procedencia y la atribución del intent.
    const { token } = req.body || {};
    let intentLidia = null;
    if (token) {
      const candidato = await db.checkoutIntent.findUnique({ where: { token: String(token) } });
      if (candidato && ['active', 'opened'].includes(candidato.estado) && candidato.expiresAt > new Date()) {
        intentLidia = candidato;
      }
    }

    const emailNorm = String(email).trim().toLowerCase();
    let user = await db.user.findUnique({ where: { email: emailNorm } });
    if (!user) {
      user = await db.user.create({
        data: {
          email: emailNorm, nombre, apellidos,
          telefono: telefono || null,
          tipoDocumento: tipoDocumento || null,
          numDocumento: numDocumento || null,
          inviteToken: crypto.randomBytes(24).toString('hex'),
        },
      });
    }

    const expediente = await db.expediente.create({
      data: {
        nPedido: nuevoNPedido(),
        userId: user.id,
        servicioSlug: servicio.slug,
        titulo: servicio.nombre,
        importe: servicio.precio,
        estado: 'pago_pendiente',
        ...(servicio.requierePais ? { paisCanje } : {}),
        ...(servicio.requiereDireccion ? { direccion, datosPais: datosPais || {} } : {}),
        procedencia: intentLidia ? intentLidia.procedencia : 'web',
        ...(intentLidia ? { origenMeta: intentLidia.origenMeta } : {}),
      },
    });
    await db.eventoExpediente.create({ data: { expedienteId: expediente.id, estado: 'pago_pendiente' } });
    if (intentLidia) {
      await db.checkoutIntent.update({ where: { id: intentLidia.id }, data: { expedienteId: expediente.id } });
    }

    // --- MODO DEMO (sin claves de Stripe): simula el pago al instante ---
    if (!stripe) {
      await fulfillPayment(expediente.id, { ref: `demo_${crypto.randomBytes(6).toString('hex')}`, metodo: 'card' });
      return res.json({ demo: true, url: `/gracias.html?pedido=${expediente.nPedido}` });
    }

    const priceId = await resolvePrice(stripe, servicio.stripeLookupKey);
    const customer = await getOrCreateCustomer(stripe, user);
    if (!user.stripeCustomerId) {
      await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } });
    }
    const meta = { expedienteId: expediente.id, nPedido: expediente.nPedido, servicio: servicio.slug, canal: intentLidia ? intentLidia.procedencia : 'web' };
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'bizum'],
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: meta,
      payment_intent_data: { metadata: meta },
      success_url: `${config.baseUrl}/gracias?pedido=${expediente.nPedido}`,
      cancel_url: `${config.baseUrl}${servicio.href}?cancelado=1`,
    });
    res.json({ url: session.url });
  } catch (e) {
    console.error('checkout error:', e);
    res.status(500).json({ error: 'No se pudo iniciar el pago. Inténtalo de nuevo.' });
  }
});

/**
 * Confirma el pago de un expediente:
 * 1) marca pagado y registra método/referencia
 * 2) sincroniza con Zoho (contacto + trato)
 * 3) envía email de bienvenida con enlace para crear contraseña
 * 4) pasa el expediente a "falta documentación"
 */
export async function fulfillPayment(expedienteId, { ref, metodo }) {
  const expediente = await db.expediente.findUnique({
    where: { id: expedienteId }, include: { user: true },
  });
  if (!expediente || expediente.estado !== 'pago_pendiente') return; // idempotencia

  const servicio = getServicio(expediente.servicioSlug);
  const fin = new Date(Date.now() + 14 * 24 * 3600 * 1000);

  let updated = await db.expediente.update({
    where: { id: expediente.id },
    data: { estado: 'pagado', pagoRef: ref, pagoMetodo: metodo, fechaPago: new Date(), finDesistimiento: fin },
    include: { user: true },
  });
  await db.eventoExpediente.create({ data: { expedienteId: expediente.id, estado: 'pagado', nota: `Pago ${metodo} · ref ${ref}` } });

  // --- Zoho ---
  const metaLidia = updated.procedencia === 'lidia' ? (updated.origenMeta || {}) : {};
  const esLidia = updated.procedencia === 'lidia' && metaLidia.zoho_deal_id;
  try {
    if (esLidia) {
      // Contrato LidIA 1.0 §10.2: la Oportunidad ya existe — escritura
      // económica sobre ella, sin tocar Lead_Source, y contacto por allowlist.
      if (!updated.user.zohoContactId && metaLidia.zoho_contact_id) {
        const u = await db.user.update({ where: { id: updated.user.id }, data: { zohoContactId: String(metaLidia.zoho_contact_id) } });
        updated = { ...updated, user: u };
      }
      const ok = await updateDealPago(metaLidia.zoho_deal_id, updated);
      if (ok) {
        updated = await db.expediente.update({ where: { id: updated.id }, data: { zohoDealId: String(metaLidia.zoho_deal_id) }, include: { user: true } });
        await updateContactPermitidos(metaLidia.zoho_contact_id, updated.user);
      } else {
        // Fallback: un pago nunca se queda sin reflejo en CRM.
        const contactId = await upsertContact(updated.user);
        const dealId = await createDealForExpediente(updated, updated.user, servicio, contactId);
        if (dealId) {
          updated = await db.expediente.update({ where: { id: updated.id }, data: { zohoDealId: dealId }, include: { user: true } });
          await addDealNote(dealId, 'Aviso integración LidIA', `No se pudo actualizar la Oportunidad ${metaLidia.zoho_deal_id} de LidIA; se creó esta en su lugar.`);
        }
      }
    } else {
      const contactId = await upsertContact(updated.user);
      if (contactId && !updated.user.zohoContactId) {
        await db.user.update({ where: { id: updated.user.id }, data: { zohoContactId: contactId } });
      }
      if (contactId && updated.user.stripeCustomerId && stripe) {
        await linkCustomerToZoho(stripe, updated.user.stripeCustomerId, contactId);
      }
      const dealId = await createDealForExpediente(updated, updated.user, servicio, contactId);
      if (dealId) {
        updated = await db.expediente.update({ where: { id: updated.id }, data: { zohoDealId: dealId }, include: { user: true } });
      }
    }
  } catch (e) {
    console.error('Zoho sync error (el pago NO se pierde, reintentar manualmente):', e.message);
  }

  // --- Bienvenida + acceso al portal ---
  const u = updated.user;
  if (!u.passwordHash && u.inviteToken) {
    await sendEmail(u.email, `Pago recibido — accede a tu área de cliente de Gestadia`,
      `<p>Hola ${u.nombre},</p>
       <p>Hemos recibido tu pago de <strong>${updated.importe.toFixed(2)} €</strong> por <strong>${updated.titulo}</strong> (pedido ${updated.nPedido}).</p>
       <p>Crea tu contraseña para acceder a tu área de cliente y subir la documentación:</p>
       <p><a href="${config.baseUrl}/portal/crear-clave/${u.inviteToken}">Crear mi contraseña</a></p>
       <p>— El equipo de Gestadia</p>`);
  } else {
    await notifyUser(u, {
      titulo: `Pago recibido — pedido ${updated.nPedido}`,
      cuerpo: `Hemos recibido tu pago de ${updated.importe.toFixed(2)} € por ${updated.titulo}.`,
      expedienteId: updated.id,
    });
  }

  await transitionExpediente(updated, 'documentacion_pendiente', {
    nota: 'Sube la documentación necesaria desde tu área de cliente para que podamos empezar.',
  });

  // --- LidIA: cerrar el intent y notificar (idempotente por estado) ---
  try {
    const intent = await db.checkoutIntent.findFirst({ where: { expedienteId: updated.id } });
    if (intent && intent.estado !== 'paid') {
      await db.checkoutIntent.update({ where: { id: intent.id }, data: { estado: 'paid' } });
      const datos = construirDatosPago(intent, updated, updated.user);
      if (datos.correcciones?.length && updated.zohoDealId) {
        await addDealNote(updated.zohoDealId, 'Datos corregidos en el checkout',
          datos.correcciones.map((c) => `${c.campo} → ${c.valor_confirmado}`).join('\n'));
      }
      await encolarEvento('payment.succeeded', intent, datos);
    }
  } catch (e) {
    console.error('LidIA post-pago error (el pago NO se pierde):', e.message);
  }
}
