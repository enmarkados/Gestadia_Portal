import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './server.js';

test('GET /api/health responds ok', async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/api/health`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.ok, true);
  server.close();
});

test('GET /api/servicios responds with the catalog', async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/api/servicios`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(body));
  assert.ok(body.some((s) => s.slug === 'canje-carnet'));
  const canje = body.find((s) => s.slug === 'canje-carnet');
  assert.equal(canje.requierePais, true);
  assert.equal(canje.requiereDireccion, true);
  server.close();
});
