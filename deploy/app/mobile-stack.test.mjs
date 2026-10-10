import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const base = process.env.GESTADIA_STACK_TEST_URL;
const publicFile = process.env.GESTADIA_STACK_TEST_CONFIG;
test('stack conectado: configuracion, proxy, autenticacion y SPA', { skip: !base || !publicFile }, async () => {
  const expected = JSON.parse(readFileSync(publicFile, 'utf8'));
  const config = await fetch(`${base}/app-config.json`);
  assert.equal(config.status, 200);
  assert.match(config.headers.get('cache-control'), /no-store/);
  assert.deepEqual(await config.json(), expected);
  const capabilities = await fetch(`${base}/api/mobile/capabilities`);
  assert.equal(capabilities.status, 200);
  const actual = await capabilities.json();
  assert.equal(actual.appId, expected.appId);
  assert.equal(actual.mobileEnabled, true);
  assert.equal(actual.pushEnabled, expected.push.enabled);
  assert.equal(actual.google.webClientId, expected.social.google.webClientId);
  assert.equal(actual.google.iosClientId, expected.social.google.iosClientId);
  assert.equal(actual.apple.serviceId, expected.social.apple.androidServiceId);
  const push = await fetch(`${base}/api/push/devices`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  assert.equal(push.status, 401);
  for (const path of ['/api/checkout', '/api/leads', '/api/expedientes/1/documentos', '/api/integrations/zoho']) {
    const blocked = await fetch(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    assert.equal(blocked.status, 404, `ruta fuera del servicio móvil: ${path}`);
  }
  assert.equal((await fetch(`${base}/lidia/api/health`)).status, 503);
  const route = await fetch(`${base}/cuenta`);
  assert.equal(route.status, 200);
  assert.match(await route.text(), /Gestadia/);
});
