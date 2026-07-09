import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

beforeEach(() => {
  process.env.ZOHO_CLIENT_ID = 'id';
  process.env.ZOHO_CLIENT_SECRET = 'secret';
  process.env.ZOHO_REFRESH_TOKEN = 'refresh';
});

test('createLead posts to the Leads endpoint with mapped Servicio and normalized phone', async () => {
  const calls = [];
  global.fetch = mock.fn(async (url, opts) => {
    calls.push({ url: String(url), opts });
    if (String(url).includes('/oauth/v2/token')) {
      return { json: async () => ({ access_token: 'tok', expires_in: 3600 }) };
    }
    return { json: async () => ({ data: [{ status: 'success', details: { id: 'lead1' } }] }) };
  });

  const { createLead } = await import('./zoho.js?t=' + Date.now());
  const id = await createLead(
    { nombre: 'Ana Ruiz', telefono: '600111222', email: 'ana@example.com', tramite: 'Canje de Carnet Extranjero' },
    '1.2.3.4'
  );

  assert.equal(id, 'lead1');
  const leadCall = calls.find((c) => c.url.includes('/Leads'));
  const body = JSON.parse(leadCall.opts.body);
  assert.equal(body.data[0].Phone, '+34600111222');
  assert.equal(body.data[0].Campa_a, 'Canje');
  assert.equal(body.data[0].Last_Name, 'Ruiz');
  assert.equal(body.data[0].First_Name, 'Ana');
});

test('upsertContact creates a contact when none exists', async () => {
  global.fetch = mock.fn(async (url) => {
    if (String(url).includes('/oauth/v2/token')) return { json: async () => ({ access_token: 'tok', expires_in: 3600 }) };
    if (String(url).includes('/Contacts/search')) return { status: 200, json: async () => ({ data: [] }) };
    return { json: async () => ({ data: [{ details: { id: 'contact1' } }] }) };
  });
  const { upsertContact } = await import('./zoho.js?t=' + Date.now());
  const id = await upsertContact({ nombre: 'Ana', apellidos: 'Ruiz', email: 'ana@example.com' });
  assert.equal(id, 'contact1');
});
