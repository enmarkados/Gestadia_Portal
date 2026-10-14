import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createAppGuestRouter } from './app-guest.js';
import { AppGuestService } from '../app/v2/guest.js';

async function serve(t, config) {
  let writes = 0;
  const db = { appGuestInstallation: { create() { writes++; throw Error('unexpected write'); } } };
  const service = new AppGuestService(db, config, { client: { call() { throw Error('unexpected upstream'); } } });
  const app = express();
  app.use(express.json());
  app.use('/api/app/guest', createAppGuestRouter({ db, config, service }));
  app.use((error, req, res, next) => res.status(500).json({ error: 'generic error' }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return { url: `http://127.0.0.1:${server.address().port}`, writes: () => writes };
}

test('guest unavailable preserves its 503 problem without creating an installation', async t => {
  const server = await serve(t, { enabled: true, guestEnabled: false, integrationId: 'qa-guest' });
  const response = await fetch(`${server.url}/api/app/guest/installations`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  });
  assert.equal(response.status, 503);
  assert.match(response.headers.get('content-type'), /application\/problem\+json/);
  const body = await response.json();
  assert.equal(body.code, 'runtime_unavailable');
  assert.equal(body.retryable, true);
  assert.equal(server.writes(), 0);
});

test('an invalid guest credential remains a 401 problem without querying a conversation', async t => {
  const server = await serve(t, { enabled: true, guestEnabled: true, integrationId: 'qa-guest' });
  const response = await fetch(`${server.url}/api/app/guest/conversations`, { headers: { 'X-App-Guest': 'invalid' } });
  assert.equal(response.status, 401);
  assert.equal((await response.json()).code, 'guest_session_expired');
  assert.equal(server.writes(), 0);
});
