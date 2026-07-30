import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePrice, getOrCreateCustomer, linkCustomerToZoho } from './stripe.js';

function fakeStripe({ customerExiste = true } = {}) {
  const calls = { search: [], create: [], update: [], pricesList: [], retrieve: [] };
  return {
    calls,
    prices: { list: async (args) => { calls.pricesList.push(args); return { data: [{ id: 'price_X' }] }; } },
    customers: {
      retrieve: async (id) => {
        calls.retrieve.push(id);
        if (!customerExiste) throw Object.assign(new Error(`No such customer: '${id}'`), { code: 'resource_missing' });
        return { id };
      },
      search: async (args) => { calls.search.push(args); return { data: [] }; },
      create: async (args) => { calls.create.push(args); return { id: 'cus_NEW' }; },
      update: async (id, args) => { calls.update.push({ id, args }); return { id }; },
    },
  };
}

test('resolvePrice devuelve el price id del lookup_key', async () => {
  const s = fakeStripe();
  const id = await resolvePrice(s, 'gestadia_portal_transferencia');
  assert.equal(id, 'price_X');
  assert.deepEqual(s.calls.pricesList[0].lookup_keys, ['gestadia_portal_transferencia']);
});

test('getOrCreateCustomer crea con metadata de Zoho cuando no existe', async () => {
  const s = fakeStripe();
  const c = await getOrCreateCustomer(s, { id: 'u1', email: 'a@a.com', nombre: 'Ana', apellidos: 'Ruiz', zohoContactId: 'z1' });
  assert.equal(c.id, 'cus_NEW');
  const meta = s.calls.create[0].metadata;
  assert.equal(meta.external_provider, 'zoho');
  assert.equal(meta.external_id, 'z1');
  assert.equal(meta.portal_user_id, 'u1');
});

test('getOrCreateCustomer incluye el documento identificativo si se conoce', async () => {
  const s = fakeStripe();
  await getOrCreateCustomer(s, { id: 'u1', email: 'a@a.com', nombre: 'Ana', apellidos: 'Ruiz', tipoDocumento: 'NIE', numDocumento: 'X1234567L' });
  const meta = s.calls.create[0].metadata;
  assert.equal(meta.tipo_documento, 'NIE');
  assert.equal(meta.num_documento, 'X1234567L');
});

test('getOrCreateCustomer no inventa campos de documento si no los hay', async () => {
  const s = fakeStripe();
  await getOrCreateCustomer(s, { id: 'u1', email: 'a@a.com', nombre: 'Ana' });
  const meta = s.calls.create[0].metadata;
  assert.equal('tipo_documento' in meta, false);
  assert.equal('num_documento' in meta, false);
});

test('getOrCreateCustomer reutiliza el customer guardado si existe en este modo', async () => {
  const s = fakeStripe({ customerExiste: true });
  const c = await getOrCreateCustomer(s, { id: 'u1', email: 'a@a.com', nombre: 'Ana', stripeCustomerId: 'cus_VIEJO' });
  assert.equal(c.id, 'cus_VIEJO');
  assert.deepEqual(s.calls.retrieve, ['cus_VIEJO']);
  assert.equal(s.calls.create.length, 0);
});

test('getOrCreateCustomer crea uno nuevo si el guardado es de otro modo de Stripe', async () => {
  // Caso real: customer creado en una ventana STRIPE_MODE=dev que no existe en live.
  const s = fakeStripe({ customerExiste: false });
  const c = await getOrCreateCustomer(s, { id: 'u1', email: 'a@a.com', nombre: 'Ana', stripeCustomerId: 'cus_DE_TEST' });
  assert.equal(c.id, 'cus_NEW');
  assert.deepEqual(s.calls.retrieve, ['cus_DE_TEST']);
  assert.equal(s.calls.create.length, 1);
});

test('linkCustomerToZoho actualiza external_id', async () => {
  const s = fakeStripe();
  await linkCustomerToZoho(s, 'cus_1', 'z9');
  assert.equal(s.calls.update[0].id, 'cus_1');
  assert.equal(s.calls.update[0].args.metadata.external_id, 'z9');
});
