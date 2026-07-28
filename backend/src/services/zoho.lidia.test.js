import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

const cfgZoho = {
  zoho: {
    clientId: 'id', clientSecret: 'sec', refreshToken: 'rt',
    accountsUrl: 'https://accounts.test', apiUrl: 'https://api.test', apiVersion: 'v6',
    get enabled() { return true; },
  },
  lidia: { get enabled() { return false; } },
  stripe: { enabled: false }, smtp: { enabled: false }, baseUrl: 'http://portal.test',
};

function stubFetch(llamadas) {
  return async (url, opts = {}) => {
    llamadas.push({ url: String(url), opts });
    if (String(url).includes('/oauth/v2/token')) {
      return { ok: true, status: 200, json: async () => ({ access_token: 'tok', expires_in: 3600 }) };
    }
    return { ok: true, status: 200, json: async () => ({ data: [{ status: 'success', details: { id: 'x' } }] }) };
  };
}

const expedienteDemo = { pagoMetodo: 'bizum', pagoRef: 'pi_123', nPedido: 'GST-202607-12345', importe: 210 };

test('updateDealPago hace PUT económico al deal sin tocar Lead_Source ni Pipeline', async (t) => {
  const llamadas = [];
  const originalFetch = global.fetch;
  global.fetch = stubFetch(llamadas);
  t.after(() => { global.fetch = originalFetch; });
  mock.module('../config.js', { namedExports: { config: cfgZoho } });
  const { updateDealPago } = await import('./zoho.js?t=' + Date.now() + Math.random());
  const ok = await updateDealPago('5725760000876', expedienteDemo);
  assert.equal(ok, true);
  const put = llamadas.find((c) => c.opts.method === 'PUT' && c.url.includes('/Deals'));
  const registro = JSON.parse(put.opts.body).data[0];
  assert.equal(registro.id, '5725760000876');
  assert.equal(registro.Stage, 'Cerrado ganado');
  assert.equal(registro.Pago_Confirmado, true);
  assert.equal(registro.M_todos_de_pago, 'Bizum');
  assert.equal(registro.N_Pedido, 'GST-202607-12345');
  assert.equal(registro.Amount, 210);
  assert.equal(registro.Lead_Source, undefined);
  assert.equal(registro.Pipeline, undefined);
  mock.reset();
});

test('updateContactPermitidos actualiza solo la allowlist y nunca Mobile', async (t) => {
  const llamadas = [];
  const originalFetch = global.fetch;
  global.fetch = stubFetch(llamadas);
  t.after(() => { global.fetch = originalFetch; });
  mock.module('../config.js', { namedExports: { config: cfgZoho } });
  const { updateContactPermitidos } = await import('./zoho.js?t=' + Date.now() + Math.random());
  await updateContactPermitidos('5725760000123', {
    nombre: 'Ana', apellidos: 'García López', email: 'ana@example.com',
    telefono: '+34600999888', tipoDocumento: 'NIE', numDocumento: 'X1234567L',
  });
  const put = llamadas.find((c) => c.opts.method === 'PUT' && c.url.includes('/Contacts'));
  const registro = JSON.parse(put.opts.body).data[0];
  assert.equal(registro.First_Name, 'Ana');
  assert.equal(registro.Last_Name, 'García López');
  assert.equal(registro.Email, 'ana@example.com');
  assert.equal(registro.N_de_documento, 'X1234567L');
  assert.equal(registro.Mobile, undefined);
  assert.equal(registro.Phone, undefined);
  assert.equal(registro.Lead_Source, undefined);
  mock.reset();
});
