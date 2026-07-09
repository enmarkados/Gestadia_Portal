import { test, expect } from '@playwright/test';

const BASE = process.env.BACKEND_URL || 'http://localhost:3001';

test('GET /api/health returns ok', async ({ request }) => {
  const res = await request.get(`${BASE}/api/health`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
});

test('GET /api/servicios returns the catalog', async ({ request }) => {
  const res = await request.get(`${BASE}/api/servicios`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.some((s) => s.slug === 'canje')).toBe(true);
});

test('POST /api/leads with valid payload returns ok:true', async ({ request }) => {
  const res = await request.post(`${BASE}/api/leads`, {
    data: {
      nombre: 'TEST SMOKE E2E — borrar',
      telefono: '600111222',
      email: 'test-smoke-e2e@example.com',
      tramite: 'Canje de Carnet Extranjero',
    },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
});
