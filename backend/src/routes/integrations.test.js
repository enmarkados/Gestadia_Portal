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
