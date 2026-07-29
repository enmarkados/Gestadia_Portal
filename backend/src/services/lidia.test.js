import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { catalogoLidia, mapearPrefill } from './lidia.js';
import { config } from '../config.js';
import { claveDesdeISO } from '../../../shared/paises-canje.js';

test('catalogoLidia resuelve canje_1_categoria con el precio del catálogo', () => {
  const cat = catalogoLidia('canje_1_categoria');
  assert.equal(cat.servicioSlug, 'canje-carnet');
  assert.equal(cat.amountMinor, 21000);
  assert.equal(cat.currency, 'EUR');
});

test('catalogoLidia devuelve null para códigos no habilitados', () => {
  assert.equal(catalogoLidia('canje_2_categorias'), null);
  assert.equal(catalogoLidia(''), null);
  assert.equal(catalogoLidia(undefined), null);
});

test('config.lidia expone TTL, key version y callbackUrl con la ruta fija del contrato', () => {
  // Robusto al .env local: valida forma y coherencia, no valores concretos.
  assert.ok(Number.isInteger(config.lidia.intentTtlDias) && config.lidia.intentTtlDias > 0);
  assert.ok(config.lidia.callbackKeyVersion.length > 0);
  if (config.lidia.callbackBaseUrl) {
    assert.ok(config.lidia.callbackUrl.endsWith('/api/integrations/gestadia-portal/payment-events'));
    assert.ok(config.lidia.callbackUrl.startsWith(config.lidia.callbackBaseUrl));
  } else {
    assert.equal(config.lidia.callbackUrl, ''); // sin base → integración de salida apagada
  }
  assert.equal(config.lidia.enabled, !!config.lidia.apiKey);
});

test('claveDesdeISO mapea alfa-2 a claves del catálogo', () => {
  assert.equal(claveDesdeISO('CO'), 'colombia');
  assert.equal(claveDesdeISO('gb'), 'reino-unido');
  assert.equal(claveDesdeISO('DE'), 'alemania');
  assert.equal(claveDesdeISO('US'), null); // no canjeable
  assert.equal(claveDesdeISO(''), null);
});

test('mapearPrefill traduce el prefill del contrato al formato del formulario', () => {
  const out = mapearPrefill({
    nombre: 'Ana', apellidos: 'García López', email: 'ana@example.com',
    tipo_documento: 'PASAPORTE', num_documento: 'X1234567L',
    pais_canje: 'CO', direccion: 'Calle Ejemplo 10, Madrid', telefono: '+34600111222',
  });
  assert.deepEqual(out, {
    nombre: 'Ana', apellidos: 'García López', email: 'ana@example.com',
    tipoDocumento: 'Pasaporte', numDocumento: 'X1234567L',
    paisCanje: 'colombia', telefono: '+34600111222',
  });
});

test('mapearPrefill omite lo no mapeable sin romper', () => {
  assert.deepEqual(mapearPrefill({ tipo_documento: 'OTRO', pais_canje: 'US' }), {});
  assert.deepEqual(mapearPrefill(undefined), {});
});

// ---------- Outbox / firma / expiración (con config y db falsos) ----------

const cfgLidia = {
  baseUrl: 'http://portal.test',
  lidia: {
    apiKey: 'k', callbackBaseUrl: 'http://lidia.test', callbackSecret: 'secreto-test',
    callbackKeyVersion: 'v1', intentTtlDias: 7,
    get callbackUrl() { return 'http://lidia.test/api/integrations/gestadia-portal/payment-events'; },
    get enabled() { return true; },
  },
  zoho: { enabled: false }, stripe: { enabled: false }, smtp: { enabled: false },
};

function dbEventos() {
  const eventos = [];
  const intents = [];
  return {
    eventos, intents,
    lidiaEvento: {
      create: async ({ data }) => { eventos.push({ id: `ev${eventos.length + 1}`, intentos: 0, ...data }); return eventos.at(-1); },
      findMany: async ({ where }) => eventos.filter((e) => e.estado === 'pendiente' && e.proximoIntento <= (where?.proximoIntento?.lte ?? new Date())),
      update: async ({ where, data }) => { const e = eventos.find((x) => x.id === where.id); Object.assign(e, data); return e; },
    },
    checkoutIntent: {
      findMany: async () => intents.filter((i) => ['active', 'opened'].includes(i.estado) && i.expiresAt < new Date()),
      update: async ({ where, data }) => { const i = intents.find((x) => x.id === where.id); Object.assign(i, data); return i; },
    },
  };
}

const intentDemo = {
  id: 'ci1', publicId: 'gci_test1', lidiaPaymentId: 'b093ce58-8dc9-4c3e-b4c3-85851b24cf66',
  lidiaPaymentAttemptId: 'ee151822-573c-42d6-8a0a-5fe80f0f0f36',
  origenMeta: { lidia_session_id: '184237' }, estado: 'active',
  expiresAt: new Date(Date.now() + 1000), amountMinor: 21000, currency: 'EUR', prefill: {},
};

async function cargarLidia(db) {
  mock.module('../config.js', { namedExports: { config: cfgLidia } });
  mock.module('../db.js', { namedExports: { db } });
  return import('./lidia.js?t=' + Date.now() + Math.random());
}

test('firmarCallback firma timestamp.body con HMAC-SHA256 hex y prefijo de clave', async () => {
  const db = dbEventos();
  const { firmarCallback } = await cargarLidia(db);
  const esperado = 'v1=' + crypto.createHmac('sha256', 'secreto-test').update('1785235351.{"a":1}').digest('hex');
  assert.equal(firmarCallback('{"a":1}', 1785235351), esperado);
  mock.reset();
});

test('occurred_at es el instante del cobro y emitted_at el de encolado', async () => {
  // Antes occurred_at llevaba el momento de encolado: LidIA no podía medir
  // nuestro tramo de proceso ni conocer el instante real del pago.
  const db = dbEventos();
  const { encolarEvento } = await cargarLidia(db);
  const cobro = '2026-07-29T18:26:29.489Z';
  await encolarEvento('payment.succeeded', intentDemo, { paid_at: cobro, n_pedido: 'GST-1' });
  const cuerpo = JSON.parse(db.eventos[0].payload);
  assert.equal(cuerpo.occurred_at, cobro, 'occurred_at debe ser el instante del cobro');
  assert.equal(cuerpo.paid_at, cobro);
  assert.ok(cuerpo.emitted_at > cobro, 'emitted_at debe ser posterior (momento de encolar)');
  mock.reset();
});

test('sin paid_at (eventos que no son de pago) occurred_at es el momento de encolar', async () => {
  const db = dbEventos();
  const { encolarEvento } = await cargarLidia(db);
  await encolarEvento('checkout.opened', intentDemo);
  const cuerpo = JSON.parse(db.eventos[0].payload);
  assert.equal(cuerpo.occurred_at, cuerpo.emitted_at);
  assert.equal(cuerpo.paid_at, undefined);
  mock.reset();
});

test('encolarEvento persiste el cuerpo exacto del contrato como string', async () => {
  const db = dbEventos();
  const { encolarEvento } = await cargarLidia(db);
  const eventId = await encolarEvento('checkout.opened', intentDemo);
  assert.match(eventId, /^evt_/);
  const ev = db.eventos[0];
  assert.equal(ev.eventType, 'checkout.opened');
  const cuerpo = JSON.parse(ev.payload);
  assert.equal(cuerpo.schema_version, '1.0');
  assert.equal(cuerpo.event_id, eventId);
  assert.equal(cuerpo.checkout_intent_id, 'gci_test1');
  assert.equal(cuerpo.lidia_session_id, '184237');
  mock.reset();
});

test('despachar: 2xx → enviado con cabeceras de firma correctas', async () => {
  const db = dbEventos();
  const { encolarEvento, despacharEventosPendientes, firmarCallback } = await cargarLidia(db);
  await encolarEvento('checkout.opened', intentDemo);
  let visto;
  await despacharEventosPendientes(async (url, opts) => { visto = { url, opts }; return { status: 200 }; });
  assert.equal(db.eventos[0].estado, 'enviado');
  assert.equal(visto.url, 'http://lidia.test/api/integrations/gestadia-portal/payment-events');
  assert.equal(visto.opts.headers['X-Gestadia-Key-Id'], 'v1');
  const ts = Number(visto.opts.headers['X-Gestadia-Timestamp']);
  assert.equal(visto.opts.headers['X-Gestadia-Signature'], firmarCallback(visto.opts.body, ts));
  mock.reset();
});

test('despachar: 400/401 → manual; 409 → reconciliar; 5xx → reintento con backoff', async () => {
  for (const [status, esperado] of [[400, 'manual'], [401, 'manual'], [409, 'reconciliar'], [503, 'pendiente']]) {
    const db = dbEventos();
    const { encolarEvento, despacharEventosPendientes } = await cargarLidia(db);
    await encolarEvento('payment.succeeded', intentDemo);
    await despacharEventosPendientes(async () => ({ status }));
    assert.equal(db.eventos[0].estado, esperado, `status ${status}`);
    if (esperado === 'pendiente') {
      assert.equal(db.eventos[0].intentos, 1);
      assert.ok(db.eventos[0].proximoIntento > new Date()); // reprogramado a +1 min
    }
    mock.reset();
  }
});

test('despachar: al sexto fallo el evento queda agotado', async () => {
  const db = dbEventos();
  const { encolarEvento, despacharEventosPendientes } = await cargarLidia(db);
  await encolarEvento('payment.succeeded', intentDemo);
  for (let i = 0; i < 6; i++) {
    db.eventos[0].proximoIntento = new Date(0); // fuerza elegibilidad
    await despacharEventosPendientes(async () => ({ status: 500 }));
  }
  assert.equal(db.eventos[0].estado, 'agotado');
  assert.equal(db.eventos[0].intentos, 6);
  mock.reset();
});

test('construirDatosPago calcula datos confirmados y correcciones (teléfono informativo)', async () => {
  const db = dbEventos();
  const { construirDatosPago } = await cargarLidia(db);
  const intent = {
    ...intentDemo,
    prefill: { nombre: 'Anna', apellidos: 'García López', email: 'vieja@example.com', telefono: '+34600111222', tipo_documento: 'NIE', num_documento: 'X1234567L' },
  };
  const user = { nombre: 'Ana', apellidos: 'García López', email: 'ana@example.com', telefono: '+34600999888', tipoDocumento: 'NIE', numDocumento: 'X1234567L' };
  const expediente = { nPedido: 'GST-202607-12345', pagoMetodo: 'bizum', pagoRef: 'pi_test_123', fechaPago: new Date('2026-07-29T18:26:29.489Z') };
  const datos = construirDatosPago(intent, expediente, user);
  assert.equal(datos.paid_at, '2026-07-29T18:26:29.489Z', 'paid_at debe ser el instante real del cobro');
  assert.equal(datos.n_pedido, 'GST-202607-12345');
  assert.equal(datos.status, 'paid');
  assert.equal(datos.amount_minor, 21000);
  assert.equal(datos.payment_method, 'bizum');
  assert.equal(datos.payment_ref, 'pi_test_123'); // pedida por LidIA para su ledger
  assert.equal(datos.datos_confirmados.nombre, 'Ana');
  assert.equal(datos.datos_confirmados.tipo_documento, 'NIE');
  const campos = datos.correcciones.map((c) => c.campo).sort();
  assert.deepEqual(campos, ['email', 'nombre', 'telefono']);
  assert.equal(datos.correcciones.find((c) => c.campo === 'email').valor_confirmado, 'ana@example.com');
  mock.reset();
});

test('expirarIntents marca expired y encola checkout.expired', async () => {
  const db = dbEventos();
  db.intents.push({ ...intentDemo, expiresAt: new Date(Date.now() - 1000) });
  const { expirarIntents } = await cargarLidia(db);
  await expirarIntents();
  assert.equal(db.intents[0].estado, 'expired');
  assert.equal(db.eventos[0]?.eventType, 'checkout.expired');
  mock.reset();
});
