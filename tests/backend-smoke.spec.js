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
  expect(body.some((s) => s.slug === 'canje-carnet')).toBe(true);
});

test('POST /api/leads with valid payload returns ok:true', async ({ request }) => {
  // 600111222 and 600111223 already collided with pre-existing Zoho Leads
  // (DUPLICATE_DATA). Using 600111224 — explicitly approved by the user for
  // this exact value — so this smoke test exercises a real, successful Zoho
  // Lead creation end to end. If this number is ever consumed by a future
  // Zoho Lead, re-running this test will need a fresh approved number.
  const res = await request.post(`${BASE}/api/leads`, {
    data: {
      nombre: 'TEST SMOKE E2E — borrar',
      telefono: '600111224',
      email: 'test-smoke-e2e@example.com',
      tramite: 'Canje de Carnet Extranjero',
    },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
});
