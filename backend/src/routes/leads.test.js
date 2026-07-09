import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'node:http';

test('POST /api/leads returns 400 when required fields are missing', async () => {
  mock.module('../services/zoho.js', { namedExports: { createLead: async () => 'lead1' } });
  const { leadsRouter } = await import('./leads.js?t=' + Date.now());
  const app = express();
  app.use(express.json());
  app.use(leadsRouter);
  const server = app.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Ana' }),
  });
  assert.equal(res.status, 400);
  server.close();
  mock.reset();
});

test('POST /api/leads returns the lead id on success', async () => {
  mock.module('../services/zoho.js', { namedExports: { createLead: async () => 'lead1' } });
  const { leadsRouter } = await import('./leads.js?t=' + Date.now() + 1);
  const app = express();
  app.use(express.json());
  app.use(leadsRouter);
  const server = app.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Ana Ruiz', telefono: '600111222', email: 'ana@example.com', tramite: 'Canje de Carnet Extranjero' }),
  });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.id, 'lead1');
  server.close();
});
