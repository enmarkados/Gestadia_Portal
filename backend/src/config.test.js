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

test('perfil firmado exige opt-in independiente de cada integración',async()=>{
 const {appConversationConfig}=await import('./config.js');
 const off=appConversationConfig({APP_CONVERSATIONS_ENABLED:'true'});
 assert.equal(off.profileContext,false);assert.equal(off.nativeSondeo.profileContext,false);
 const general=appConversationConfig({APP_LIDIA_PROFILE_CONTEXT_ENABLED:'true'});
 assert.equal(general.profileContext,true);assert.equal(general.nativeSondeo.profileContext,false);
 const sondeo=appConversationConfig({APP_LIDIA_SONDEO_PROFILE_CONTEXT_ENABLED:'true'});
 assert.equal(sondeo.profileContext,false);assert.equal(sondeo.nativeSondeo.profileContext,true);
});

test('agenda acotada queda apagada por defecto y no amplía sondeo', async () => {
 const {appConversationConfig}=await import('./config.js');
 const cfg=appConversationConfig({});
 assert.equal(cfg.callbackAccess?.enabled,false);
 assert.equal(cfg.callbackAccess?.scope,null);
 assert.deepEqual(cfg.nativeSondeo.allowedPermissions,['sondeo','history']);
});
test('agenda exige ámbito cerrado con cuenta conversación integración y caducidad', async () => {
 const {appConversationConfig}=await import('./config.js');
 const scope={portal_user_id:'11111111-1111-4111-8111-111111111111',conversation_id:'22222222-2222-4222-8222-222222222222',integration_id:'native',expires_at:'2026-10-12T00:00:00.000Z'};
 for(const value of [undefined,'{}','null','[]','invalid',JSON.stringify({...scope,conversation_id:'*'}),JSON.stringify({...scope,integration_id:123}),JSON.stringify({...scope,expires_at:'not-a-date'}),JSON.stringify({...scope,zohoContactId:'123'})]) {
  assert.throws(()=>appConversationConfig({APP_LIDIA_CALLBACK_ENABLED:'true',APP_LIDIA_CALLBACK_SCOPE_JSON:value}),e=>e.code==='runtime_unavailable');
 }
 const cfg=appConversationConfig({APP_LIDIA_CALLBACK_ENABLED:'true',APP_LIDIA_CALLBACK_SCOPE_JSON:JSON.stringify(scope),APP_LIDIA_INTEGRATION_ID:'old',APP_LIDIA_SONDEO_INTEGRATION_ID:'native'});
 assert.equal(cfg.callbackAccess.enabled,true);
 assert.deepEqual(cfg.callbackAccess.scope,scope);
 assert.deepEqual(cfg.nativeSondeo.allowedPermissions,['sondeo','history','crm_prepare','callback_schedule']);
 const off=appConversationConfig({APP_LIDIA_CALLBACK_SCOPE_JSON:JSON.stringify(scope)});
 assert.equal(off.callbackAccess.enabled,false);
 assert.deepEqual(off.nativeSondeo.allowedPermissions,['sondeo','history']);
});
