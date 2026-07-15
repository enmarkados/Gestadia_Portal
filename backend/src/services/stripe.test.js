import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePrice, getOrCreateCustomer, linkCustomerToZoho } from './stripe.js';

function fakeStripe() {
  const calls = { search: [], create: [], update: [], pricesList: [] };
  return {
    calls,
    prices: { list: async (args) => { calls.pricesList.push(args); return { data: [{ id: 'price_X' }] }; } },
    customers: {
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

test('linkCustomerToZoho actualiza external_id', async () => {
  const s = fakeStripe();
  await linkCustomerToZoho(s, 'cus_1', 'z9');
  assert.equal(s.calls.update[0].id, 'cus_1');
  assert.equal(s.calls.update[0].args.metadata.external_id, 'z9');
});
