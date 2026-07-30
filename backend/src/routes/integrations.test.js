import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

const cfgFake = {
  baseUrl: 'http://portal.test',
  lidia: {
    apiKey: 'clave-test', callbackBaseUrl: 'http://lidia.test',
    callbackSecret: 'secreto-test', callbackKeyVersion: 'v1', intentTtlDias: 7,
    get callbackUrl() { return 'http://lidia.test/api/integrations/gestadia-portal/payment-events'; },
    get enabled() { return true; },
  },
  stripe: { enabled: false }, zoho: { enabled: false }, smtp: { enabled: false },
};

export function fakeDb() {
  const intents = new Map();
  const eventos = [];
  const buscar = (where) => [...intents.values()].find((i) =>
    (where.id && i.id === where.id) ||
    (where.idempotencyKey && i.idempotencyKey === where.idempotencyKey) ||
    (where.token && i.token === where.token) ||
    (where.publicId && i.publicId === where.publicId)) || null;
  return {
    intents, eventos,
    checkoutIntent: {
      findUnique: async ({ where }) => buscar(where),
      findFirst: async ({ where }) => [...intents.values()].find((i) => !where?.expedienteId || i.expedienteId === where.expedienteId) || null,
      create: async ({ data }) => {
        const intent = { id: `ci${intents.size + 1}`, expedienteId: null, createdAt: new Date(), updatedAt: new Date(), ...data };
        intents.set(intent.id, intent);
        return intent;
      },
      update: async ({ where, data }) => { const i = buscar(where); Object.assign(i, data, { updatedAt: new Date() }); return i; },
      updateMany: async ({ where, data }) => {
        const i = buscar({ publicId: where.publicId });
        if (i && (!where.estado || where.estado.in.includes(i.estado))) { Object.assign(i, data); return { count: 1 }; }
        return { count: 0 };
      },
      findMany: async () => [...intents.values()],
    },
    lidiaEvento: {
      create: async ({ data }) => { eventos.push({ id: `ev${eventos.length + 1}`, ...data }); return eventos.at(-1); },
      findMany: async () => eventos,
      update: async ({ where, data }) => { const e = eventos.find((x) => x.id === where.id || x.eventId === where.eventId); Object.assign(e, data); return e; },
      findUnique: async ({ where }) => eventos.find((x) => x.eventId === where.eventId) || null,
    },
    expediente: { findUnique: async () => null },
  };
}

export async function montarApp(db) {
  mock.module('../config.js', { namedExports: { config: cfgFake } });
  mock.module('../db.js', { namedExports: { db } });
  // lidia.js debe reimportarse fresco en cada test: si queda cacheado conserva
  // el mock de db del primer test y encolarEvento escribiría en la fake antigua.
  const lidia = await import('../services/lidia.js?t=' + Date.now() + Math.random());
  mock.module('../services/lidia.js', { namedExports: { ...lidia } });
  const { integrationsRouter } = await import('./integrations.js?t=' + Date.now() + Math.random());
  const app = express();
  app.use(express.json());
  app.use(integrationsRouter);
  return app.listen(0);
}

export function bodyValido(extra = {}) {
  return {
    schema_version: '1.0',
    idempotency_key: '6be7f522-1149-45a5-bbd0-58cf420e3d53',
    lidia_payment_id: 'b093ce58-8dc9-4c3e-b4c3-85851b24cf66',
    lidia_payment_attempt_id: 'ee151822-573c-42d6-8a0a-5fe80f0f0f36',
    lidia_session_id: '184237', lidia_contact_id: '9317', lidia_agent_id: '178',
    service: 'canje-carnet', catalog_code: 'canje_1_categoria',
    amount_minor: 21000, currency: 'EUR', telefono: '+34600111222',
    zoho_contact_id: '572576000012345678', zoho_deal_id: '572576000087654321',
    ...extra,
  };
}

export async function postIntent(port, body, apiKey = 'clave-test') {
  return fetch(`http://localhost:${port}/api/integrations/lidia/checkout-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'X-Api-Key': apiKey } : {}) },
    body: JSON.stringify(body),
  });
}

test('sin api key valida → 401 unauthorized con trace_id', async () => {
  const server = await montarApp(fakeDb());
  const res = await postIntent(server.address().port, bodyValido(), 'clave-mala');
  const body = await res.json();
  assert.equal(res.status, 401);
  assert.equal(body.error, 'unauthorized');
  assert.ok(body.trace_id);
  server.close(); mock.reset();
});

test('schema_version desconocida → 400 unsupported_schema_version', async () => {
  const server = await montarApp(fakeDb());
  const res = await postIntent(server.address().port, bodyValido({ schema_version: '2.0' }));
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'unsupported_schema_version');
  server.close(); mock.reset();
});

test('payload inválido → 400 invalid_payload (falta campo, UUID malo, E.164 malo)', async () => {
  const server = await montarApp(fakeDb());
  const port = server.address().port;
  for (const roto of [
    { telefono: undefined }, { idempotency_key: 'no-es-uuid' },
    { telefono: '600111222' }, { amount_minor: 210.5 }, { currency: 'eur' },
  ]) {
    const res = await postIntent(port, bodyValido(roto));
    assert.equal(res.status, 400, JSON.stringify(roto));
    assert.equal((await res.json()).error, 'invalid_payload');
  }
  server.close(); mock.reset();
});

test('ids de Zoho no numéricos → 409 zoho_reference_invalid', async () => {
  const server = await montarApp(fakeDb());
  const res = await postIntent(server.address().port, bodyValido({ zoho_deal_id: 'zcrm_x' }));
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'zoho_reference_invalid');
  server.close(); mock.reset();
});

test('canje_2_categorias → 409 catalog_code_no_disponible', async () => {
  const server = await montarApp(fakeDb());
  const res = await postIntent(server.address().port, bodyValido({ catalog_code: 'canje_2_categorias' }));
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'catalog_code_no_disponible');
  server.close(); mock.reset();
});

test('importe distinto del catálogo → 409 importe_no_coincide con catálogo en céntimos', async () => {
  const server = await montarApp(fakeDb());
  const res = await postIntent(server.address().port, bodyValido({ amount_minor: 20000 }));
  const body = await res.json();
  assert.equal(res.status, 409);
  assert.equal(body.error, 'importe_no_coincide');
  assert.equal(body.amount_minor_catalogo, 21000);
  assert.equal(body.currency_catalogo, 'EUR');
  server.close(); mock.reset();
});

test('misma idempotency_key y mismo payload → 200 con el mismo intent y reused true', async () => {
  const db = fakeDb();
  const server = await montarApp(db);
  const port = server.address().port;
  const r1 = await postIntent(port, bodyValido());
  const b1 = await r1.json();
  const r2 = await postIntent(port, bodyValido());
  const b2 = await r2.json();
  assert.equal(r2.status, 200);
  assert.equal(b2.reused, true);
  assert.equal(b2.checkout_intent_id, b1.checkout_intent_id);
  assert.equal(db.intents.size, 1);
  server.close(); mock.reset();
});

test('misma idempotency_key con payload distinto → 409 idempotency_conflict', async () => {
  const server = await montarApp(fakeDb());
  const port = server.address().port;
  await postIntent(port, bodyValido());
  const res = await postIntent(port, bodyValido({ telefono: '+34699999999' }));
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'idempotency_conflict');
  server.close(); mock.reset();
});

test('replaces_checkout_intent_id cancela el intent sustituido y crea uno nuevo', async () => {
  const db = fakeDb();
  const server = await montarApp(db);
  const port = server.address().port;
  const b1 = await (await postIntent(port, bodyValido())).json();
  const res = await postIntent(port, bodyValido({
    idempotency_key: '11111111-2222-4333-8444-555555555555',
    lidia_payment_attempt_id: '99999999-8888-4777-8666-555555555555',
    replaces_checkout_intent_id: b1.checkout_intent_id,
  }));
  const b2 = await res.json();
  assert.equal(res.status, 201);
  assert.equal(b2.lidia_payment_id, 'b093ce58-8dc9-4c3e-b4c3-85851b24cf66'); // mismo ciclo
  assert.notEqual(b2.checkout_intent_id, b1.checkout_intent_id);
  const anterior = [...db.intents.values()].find((i) => i.publicId === b1.checkout_intent_id);
  assert.equal(anterior.estado, 'cancelled');
  server.close(); mock.reset();
});

test('creación válida → 201 con la respuesta del contrato §6.6', async () => {
  const db = fakeDb();
  const server = await montarApp(db);
  const res = await postIntent(server.address().port, bodyValido());
  const body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(body.schema_version, '1.0');
  assert.match(body.checkout_intent_id, /^gci_/);
  assert.equal(body.lidia_payment_id, 'b093ce58-8dc9-4c3e-b4c3-85851b24cf66');
  assert.match(body.url, /^http:\/\/portal\.test\/c\/.+/);
  assert.equal(body.status, 'active');
  assert.equal(body.reused, false);
  assert.ok(body.expires_at > new Date().toISOString());
  const intent = [...db.intents.values()][0];
  assert.equal(intent.procedencia, 'lidia');
  assert.equal(intent.origenMeta.zoho_deal_id, '572576000087654321');
  assert.equal(intent.prefill.telefono, '+34600111222');
  server.close(); mock.reset();
});

test('GET catálogo: 401 sin api key; con ella lista productos con activo/inactivo', async () => {
  const server = await montarApp(fakeDb());
  const port = server.address().port;
  const sinKey = await fetch(`http://localhost:${port}/api/integrations/lidia/catalog`);
  assert.equal(sinKey.status, 401);
  const res = await fetch(`http://localhost:${port}/api/integrations/lidia/catalog`, { headers: { 'X-Api-Key': 'clave-test' } });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.schema_version, '1.0');
  const activo = body.products.find((p) => p.catalog_code === 'canje_1_categoria');
  assert.deepEqual(activo, { service: 'canje-carnet', catalog_code: 'canje_1_categoria', amount_minor: 21000, currency: 'EUR', active: true });
  const inactivo = body.products.find((p) => p.catalog_code === 'canje_2_categorias');
  assert.equal(inactivo.active, false);
  assert.equal(inactivo.amount_minor, null);
  server.close(); mock.reset();
});

test('GET autenticado devuelve el estado completo; 404 si no existe', async () => {
  const db = fakeDb();
  const server = await montarApp(db);
  const port = server.address().port;
  const creado = await (await postIntent(port, bodyValido())).json();
  const res = await fetch(`http://localhost:${port}/api/integrations/lidia/checkout-intents/${creado.checkout_intent_id}`, { headers: { 'X-Api-Key': 'clave-test' } });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.checkout_intent_id, creado.checkout_intent_id);
  assert.equal(body.status, 'active');
  assert.equal(body.amount_minor, 21000);
  assert.equal(body.n_pedido, null);
  // payment_ref debe existir en la respuesta (null si aún no hay pago): permite
  // completar el ledger al cerrar por reconciliación, sin esperar al callback.
  assert.ok('payment_ref' in body, 'el GET debe incluir payment_ref');
  assert.equal(body.payment_ref, null);
  const res404 = await fetch(`http://localhost:${port}/api/integrations/lidia/checkout-intents/gci_nope`, { headers: { 'X-Api-Key': 'clave-test' } });
  assert.equal(res404.status, 404);
  assert.equal((await res404.json()).error, 'checkout_intent_not_found');
  server.close(); mock.reset();
});

test('GET público devuelve solo prellenado mapeado, marca opened y encola el evento una vez', async () => {
  const db = fakeDb();
  const server = await montarApp(db);
  const port = server.address().port;
  await postIntent(port, bodyValido({ prefill: { nombre: 'Ana', pais_canje: 'CO', tipo_documento: 'PASAPORTE', direccion: 'Calle X 1' } }));
  const token = [...db.intents.values()][0].token;
  const res = await fetch(`http://localhost:${port}/api/checkout-intent/${token}`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.servicio, 'canje-carnet');
  assert.equal(body.procedencia, 'lidia');
  assert.equal(body.prefill.nombre, 'Ana');
  assert.equal(body.prefill.paisCanje, 'colombia');
  assert.equal(body.prefill.tipoDocumento, 'Pasaporte');
  assert.equal(body.prefill.telefono, '+34600111222');
  assert.equal(body.prefill.direccion, undefined);          // texto libre: no se prellena
  assert.equal(body.zoho_deal_id, undefined);               // jamás ids internos
  assert.equal([...db.intents.values()][0].estado, 'opened');
  assert.equal(db.eventos.filter((e) => e.eventType === 'checkout.opened').length, 1);
  await fetch(`http://localhost:${port}/api/checkout-intent/${token}`); // segunda apertura
  assert.equal(db.eventos.filter((e) => e.eventType === 'checkout.opened').length, 1); // sigue 1
  server.close(); mock.reset();
});

test('GET público: token desconocido o intent expirado/cancelado → 404; pagado → {pagado, nPedido}', async () => {
  const db = fakeDb();
  const server = await montarApp(db);
  const port = server.address().port;
  await postIntent(port, bodyValido());
  const intent = [...db.intents.values()][0];
  assert.equal((await fetch(`http://localhost:${port}/api/checkout-intent/no-existe`)).status, 404);
  intent.estado = 'expired';
  assert.equal((await fetch(`http://localhost:${port}/api/checkout-intent/${intent.token}`)).status, 404);
  intent.estado = 'paid';
  intent.expedienteId = 'e1';
  db.expediente.findUnique = async () => ({ id: 'e1', nPedido: 'GST-202607-11111' });
  const res = await fetch(`http://localhost:${port}/api/checkout-intent/${intent.token}`);
  const body = await res.json();
  assert.equal(body.pagado, true);
  assert.equal(body.nPedido, 'GST-202607-11111');
  server.close(); mock.reset();
});
