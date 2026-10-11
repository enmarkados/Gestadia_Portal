import { test } from 'node:test';
import assert from 'node:assert/strict';
const base = process.env.GESTADIA_ROUTE_TEST_URL;
test('la conversación APP carga directamente y conserva el bloqueo del antiguo proxy LidIA', { skip: !base }, async () => {
  for (const path of ['/lidia/conversacion', '/lidia/conversacion/']) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.match(await response.text(), /\/assets\/index-.*\.js/);
    assert.match(response.headers.get('cache-control'), /no-cache/);
  }
  assert.equal((await fetch(`${base}/lidia/api/health`)).status, 503);
});
