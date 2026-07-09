import { test, expect } from '@playwright/test';

const BASE = process.env.FRONTEND_URL || 'http://localhost:5173';

test('home page renders the hero heading', async ({ page }) => {
  await page.goto(BASE);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('checkout flow in demo mode reaches the gracias page', async ({ page }) => {
  await page.goto(`${BASE}/checkout?servicio=canje`);
  await page.getByLabel(/nombre/i).fill('Ana');
  await page.getByLabel(/apellidos/i).fill('Ruiz');
  await page.getByLabel(/^email/i).fill(`ana-${Date.now()}@example.com`);
  await page.getByLabel(/acepto las condiciones/i).check();
  await page.getByRole('button', { name: /pagar/i }).click();
  await page.waitForURL(/\/gracias/);
  await expect(page.getByText(/GST-/)).toBeVisible();
});
