import { test } from 'node:test';
import assert from 'node:assert/strict';

test('config.zoho.enabled is false without credentials', async () => {
  process.env.ZOHO_CLIENT_ID = '';
  process.env.ZOHO_CLIENT_SECRET = '';
  process.env.ZOHO_REFRESH_TOKEN = '';
  const { config } = await import('./config.js');
  assert.equal(config.zoho.enabled, false);
});

test('config.stripe.enabled is true when STRIPE_SECRET_KEY is set', async () => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  const { config } = await import('./config.js?t=' + Date.now());
  assert.equal(config.stripe.enabled, true);
});
