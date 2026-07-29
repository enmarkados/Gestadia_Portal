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

test('STRIPE_MODE selecciona las claves dev o pro', async () => {
  process.env.STRIPE_SECRET_KEY = '';
  process.env.STRIPE_SECRET_KEY_DEV = 'sk_test_dev';
  process.env.STRIPE_WEBHOOK_SECRET_DEV = 'whsec_dev';
  process.env.STRIPE_SECRET_KEY_PRO = 'rk_live_pro';
  process.env.STRIPE_WEBHOOK_SECRET_PRO = 'whsec_pro';

  process.env.STRIPE_MODE = 'dev';
  const dev = (await import('./config.js?t=' + Date.now() + 'a')).config;
  assert.equal(dev.stripe.mode, 'dev');
  assert.equal(dev.stripe.secretKey, 'sk_test_dev');
  assert.equal(dev.stripe.webhookSecret, 'whsec_dev');

  process.env.STRIPE_MODE = 'pro';
  const pro = (await import('./config.js?t=' + Date.now() + 'b')).config;
  assert.equal(pro.stripe.mode, 'pro');
  assert.equal(pro.stripe.secretKey, 'rk_live_pro');
  assert.equal(pro.stripe.webhookSecret, 'whsec_pro');

  // Por defecto (sin STRIPE_MODE) → pro
  delete process.env.STRIPE_MODE;
  const def = (await import('./config.js?t=' + Date.now() + 'c')).config;
  assert.equal(def.stripe.mode, 'pro');
});
