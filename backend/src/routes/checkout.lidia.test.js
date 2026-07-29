import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

function fakeDbCheckout() {
  const users = new Map(); const expedientes = new Map(); const intents = new Map(); const eventosExp = [];
  return {
    users, expedientes, intents, eventosExp,
    user: {
      findUnique: async ({ where }) => [...users.values()].find((u) => u.email === where.email || u.id === where.id) || null,
      create: async ({ data }) => { const u = { id: `u${users.size + 1}`, zohoContactId: null, stripeCustomerId: null, passwordHash: null, ...data }; users.set(u.id, u); return u; },
      update: async ({ where, data }) => { const u = users.get(where.id); Object.assign(u, data); return u; },
    },
    expediente: {
      create: async ({ data }) => { const e = { id: `e${expedientes.size + 1}`, ...data }; expedientes.set(e.id, e); return e; },
      findUnique: async ({ where, include }) => { const e = expedientes.get(where.id); return e ? { ...e, ...(include?.user ? { user: users.get(e.userId) } : {}) } : null; },
      update: async ({ where, data, include }) => { const e = expedientes.get(where.id); Object.assign(e, data); return { ...e, ...(include?.user ? { user: users.get(e.userId) } : {}) }; },
    },
    eventoExpediente: { create: async ({ data }) => { eventosExp.push(data); return data; } },
    checkoutIntent: {
      findUnique: async ({ where }) => [...intents.values()].find((i) => i.token === where.token || i.id === where.id) || null,
      findFirst: async ({ where }) => [...intents.values()].find((i) => i.expedienteId === where.expedienteId) || null,
      update: async ({ where, data }) => { const i = intents.get(where.id); Object.assign(i, data); return i; },
    },
  };
}

const cfgDemo = {
  baseUrl: 'http://portal.test', jwtSecret: 's',
  stripe: { secretKey: '', get enabled() { return false; } },
  zoho: { get enabled() { return false; } },
  smtp: { get enabled() { return false; } },
  lidia: { apiKey: 'k', callbackBaseUrl: '', callbackSecret: '', callbackKeyVersion: 'v1', intentTtlDias: 7, get callbackUrl() { return ''; }, get enabled() { return true; } },
};

function intentDemo(db) {
  const intent = {
    id: 'ci1', publicId: 'gci_1', token: 'tok-lidia-1', idempotencyKey: 'k1', payloadHash: 'h',
    procedencia: 'lidia', servicioSlug: 'canje-carnet', catalogCode: 'canje_1_categoria',
    amountMinor: 21000, currency: 'EUR',
    lidiaPaymentId: 'b093ce58-8dc9-4c3e-b4c3-85851b24cf66',
    lidiaPaymentAttemptId: 'ee151822-573c-42d6-8a0a-5fe80f0f0f36',
    prefill: { nombre: 'Anna', apellidos: 'García', email: 'ana@example.com', telefono: '+34600111222' },
    origenMeta: { lidia_session_id: '184237', zoho_contact_id: '111', zoho_deal_id: '222' },
    estado: 'opened', expiresAt: new Date(Date.now() + 86400000), expedienteId: null,
  };
  db.intents.set(intent.id, intent);
  return intent;
}

async function montarCheckout(db, zohoMock, lidiaMock, notifyMock) {
  mock.module('../config.js', { namedExports: { config: cfgDemo } });
  mock.module('../db.js', { namedExports: { db } });
  mock.module('../services/zoho.js', { namedExports: zohoMock });
  mock.module('../services/stripe.js', { namedExports: { resolvePrice: async () => 'price', getOrCreateCustomer: async () => ({ id: 'cus' }), linkCustomerToZoho: async () => {} } });
  mock.module('../services/notify.js', { namedExports: notifyMock ?? { sendEmail: async () => {}, notifyUser: async () => {}, transitionExpediente: async () => {} } });
  mock.module('../services/lidia.js', { namedExports: lidiaMock });
  const { checkoutRouter } = await import('./checkout.js?t=' + Date.now() + Math.random());
  const app = express();
  app.use(express.json());
  app.use(checkoutRouter);
  return app.listen(0);
}

function bodyCheckout(extra = {}) {
  return {
    servicio: 'canje-carnet', nombre: 'Ana', apellidos: 'García López',
    email: 'ana@example.com', telefono: '+34600999888', tipoDocumento: 'NIE',
    numDocumento: 'X1234567L', aceptaCondiciones: true,
    paisCanje: 'colombia', datosPais: {},
    direccion: { tipoVia: 'Calle', nombreVia: 'Mayor', numero: '1', codigoPostal: '28001', municipio: 'Madrid', localidad: '', provincia: 'Madrid', bloque: '', portal: '', escalera: '', planta: '', puerta: '', km: '' },
    ...extra,
  };
}

test('checkout con token LidIA: expediente con procedencia, deal actualizado (no creado) y evento encolado', async () => {
  const db = fakeDbCheckout();
  intentDemo(db);
  const llamadas = { updateDeal: 0, createDeal: 0, eventos: [] };
  const zohoMock = {
    upsertContact: async () => 'contacto-nuevo',
    createDealForExpediente: async () => { llamadas.createDeal++; return 'deal-nuevo'; },
    addDealNote: async () => {},
    updateDealPago: async (dealId) => { llamadas.updateDeal++; assert.equal(dealId, '222'); return true; },
    updateContactPermitidos: async () => {},
  };
  const lidiaMock = {
    encolarEvento: async (tipo, _intent, extra) => { llamadas.eventos.push({ tipo, extra }); return 'evt_x'; },
    construirDatosPago: () => ({ n_pedido: 'X', status: 'paid', amount_minor: 21000, currency: 'EUR', payment_method: 'card', datos_confirmados: {}, correcciones: [] }),
    catalogoLidia: () => null, mapearPrefill: () => ({}),
  };
  const server = await montarCheckout(db, zohoMock, lidiaMock);
  const res = await fetch(`http://localhost:${server.address().port}/api/checkout`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyCheckout({ token: 'tok-lidia-1' })),
  });
  assert.equal(res.status, 200);
  const expediente = [...db.expedientes.values()][0];
  assert.equal(expediente.procedencia, 'lidia');
  assert.equal(expediente.origenMeta.zoho_deal_id, '222');
  assert.equal(llamadas.updateDeal, 1);      // se actualizó el deal de LidIA
  assert.equal(llamadas.createDeal, 0);      // NO se creó deal nuevo
  assert.equal(db.intents.get('ci1').estado, 'paid');
  assert.equal(db.intents.get('ci1').expedienteId, expediente.id);
  assert.deepEqual(llamadas.eventos.map((e) => e.tipo), ['payment.succeeded']);
  const usuario = [...db.users.values()][0];
  assert.equal(usuario.zohoContactId, '111'); // enlazado al contacto de LidIA
  server.close(); mock.reset();
});

test('checkout con token LidIA: si el update del deal falla, cae al flujo actual (crear deal)', async () => {
  const db = fakeDbCheckout();
  intentDemo(db);
  const llamadas = { createDeal: 0, notas: [] };
  const zohoMock = {
    upsertContact: async () => 'contacto-nuevo',
    createDealForExpediente: async () => { llamadas.createDeal++; return 'deal-fallback'; },
    addDealNote: async (dealId, titulo) => { llamadas.notas.push({ dealId, titulo }); },
    updateDealPago: async () => false,
    updateContactPermitidos: async () => {},
  };
  const lidiaMock = {
    encolarEvento: async () => 'evt_x',
    construirDatosPago: () => ({ correcciones: [] }),
    catalogoLidia: () => null, mapearPrefill: () => ({}),
  };
  const server = await montarCheckout(db, zohoMock, lidiaMock);
  await fetch(`http://localhost:${server.address().port}/api/checkout`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyCheckout({ token: 'tok-lidia-1' })),
  });
  assert.equal(llamadas.createDeal, 1);
  assert.ok(llamadas.notas.some((n) => n.dealId === 'deal-fallback'));
  server.close(); mock.reset();
});

test('si el email de bienvenida falla, LidIA SIGUE siendo notificada del pago', async () => {
  // Caso real (2026-07-29): el cliente tenía un buzón inexistente, el SMTP
  // lanzó excepción y abortaba fulfillPayment antes de avisar a LidIA.
  const db = fakeDbCheckout();
  intentDemo(db);
  const llamadas = { eventos: [] };
  const zohoMock = {
    upsertContact: async () => 'c1', createDealForExpediente: async () => 'd1', addDealNote: async () => {},
    updateDealPago: async () => true, updateContactPermitidos: async () => {},
  };
  const lidiaMock = {
    encolarEvento: async (tipo) => { llamadas.eventos.push(tipo); return 'evt_x'; },
    construirDatosPago: () => ({ correcciones: [] }),
    catalogoLidia: () => null, mapearPrefill: () => ({}),
  };
  const notifyRoto = {
    sendEmail: async () => { throw new Error('550 5.1.1 recipient rejected'); },
    notifyUser: async () => { throw new Error('550 5.1.1 recipient rejected'); },
    transitionExpediente: async () => {},
  };
  const server = await montarCheckout(db, zohoMock, lidiaMock, notifyRoto);
  const res = await fetch(`http://localhost:${server.address().port}/api/checkout`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyCheckout({ token: 'tok-lidia-1' })),
  });
  assert.equal(res.status, 200);
  assert.deepEqual(llamadas.eventos, ['payment.succeeded'], 'el evento debe emitirse pese al email fallido');
  assert.equal(db.intents.get('ci1').estado, 'paid', 'el intent debe cerrarse igualmente');
  server.close(); mock.reset();
});

test('si la transición de estado falla, LidIA SIGUE siendo notificada', async () => {
  const db = fakeDbCheckout();
  intentDemo(db);
  const llamadas = { eventos: [] };
  const zohoMock = {
    upsertContact: async () => 'c1', createDealForExpediente: async () => 'd1', addDealNote: async () => {},
    updateDealPago: async () => true, updateContactPermitidos: async () => {},
  };
  const lidiaMock = {
    encolarEvento: async (tipo) => { llamadas.eventos.push(tipo); return 'evt_x'; },
    construirDatosPago: () => ({ correcciones: [] }),
    catalogoLidia: () => null, mapearPrefill: () => ({}),
  };
  const notifyRoto = {
    sendEmail: async () => {}, notifyUser: async () => {},
    transitionExpediente: async () => { throw new Error('Zoho no responde'); },
  };
  const server = await montarCheckout(db, zohoMock, lidiaMock, notifyRoto);
  await fetch(`http://localhost:${server.address().port}/api/checkout`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyCheckout({ token: 'tok-lidia-1' })),
  });
  assert.deepEqual(llamadas.eventos, ['payment.succeeded']);
  server.close(); mock.reset();
});

test('checkout sin token: regresión intacta (procedencia web, flujo Zoho actual)', async () => {
  const db = fakeDbCheckout();
  const llamadas = { createDeal: 0, updateDeal: 0 };
  const zohoMock = {
    upsertContact: async () => 'c1',
    createDealForExpediente: async () => { llamadas.createDeal++; return 'd1'; },
    addDealNote: async () => {},
    updateDealPago: async () => { llamadas.updateDeal++; return true; },
    updateContactPermitidos: async () => {},
  };
  const lidiaMock = { encolarEvento: async () => 'e', construirDatosPago: () => ({ correcciones: [] }), catalogoLidia: () => null, mapearPrefill: () => ({}) };
  const server = await montarCheckout(db, zohoMock, lidiaMock);
  const res = await fetch(`http://localhost:${server.address().port}/api/checkout`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyCheckout()),
  });
  assert.equal(res.status, 200);
  const expediente = [...db.expedientes.values()][0];
  assert.equal(expediente.procedencia, 'web');
  assert.equal(llamadas.createDeal, 1);
  assert.equal(llamadas.updateDeal, 0);
  server.close(); mock.reset();
});
