import 'dotenv/config';
import { AppProblem } from './app/problem.js';

export const config = {
  port: process.env.PORT || 3001,
  baseUrl: process.env.BASE_URL || 'http://localhost:3001',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-cambiar',

  // Stripe con conmutador de entorno por STRIPE_MODE:
  //   STRIPE_MODE=dev  → claves de PRUEBA (…_DEV): pagos simulados, tarjeta 4242
  //   STRIPE_MODE=pro  → claves REALES (…_PRO): cobros de verdad (por defecto)
  // Así no hay que intercambiar claves para hacer pruebas: se cambia solo
  // STRIPE_MODE y se reinicia. Fallback a las variables legacy
  // (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET) si no existen las _DEV/_PRO.
  stripe: {
    get mode() { return (process.env.STRIPE_MODE || 'pro').toLowerCase() === 'dev' ? 'dev' : 'pro'; },
    get secretKey() {
      const porModo = this.mode === 'dev' ? process.env.STRIPE_SECRET_KEY_DEV : process.env.STRIPE_SECRET_KEY_PRO;
      return porModo || process.env.STRIPE_SECRET_KEY || '';
    },
    get webhookSecret() {
      const porModo = this.mode === 'dev' ? process.env.STRIPE_WEBHOOK_SECRET_DEV : process.env.STRIPE_WEBHOOK_SECRET_PRO;
      return porModo || process.env.STRIPE_WEBHOOK_SECRET || '';
    },
    get enabled() { return !!this.secretKey; },
  },

  zoho: {
    clientId: process.env.ZOHO_CLIENT_ID || '',
    clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
    refreshToken: process.env.ZOHO_REFRESH_TOKEN || '',
    accountsUrl: process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.eu',
    apiUrl: process.env.ZOHO_API_URL || 'https://www.zohoapis.eu',
    apiVersion: process.env.ZOHO_API_VERSION || 'v6',
    webhookSecret: process.env.ZOHO_WEBHOOK_SECRET || '',
    leadSourceDefault: process.env.ZOHO_LEAD_SOURCE_DEFAULT || 'Formulario Web',
    leadStatusDefault: process.env.ZOHO_LEAD_STATUS_DEFAULT || 'No contactado',
    pageSourceDefault: process.env.ZOHO_PAGE_SOURCE_DEFAULT || 'GESTADIA',
    campaignId: process.env.ZOHO_CAMPAIGN_ID || '',
    assignmentRuleId: process.env.ZOHO_ASSIGNMENT_RULE_ID || '',
    get enabled() { return !!(this.clientId && this.clientSecret && this.refreshToken); },
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'Gestadia <hola@gestadia.com>',
    get enabled() { return !!this.host; },
  },

  lidia: {
    apiKey: process.env.LIDIA_API_KEY || '',
    callbackBaseUrl: process.env.LIDIA_CALLBACK_BASE_URL || '',
    callbackSecret: process.env.LIDIA_CALLBACK_SECRET || '',
    callbackKeyVersion: process.env.LIDIA_CALLBACK_KEY_VERSION || 'v1',
    intentTtlDias: Number(process.env.LIDIA_INTENT_TTL_DIAS || 7),
    get callbackUrl() {
      // Ruta relativa fija del contrato 1.0 (§8.1); solo cambia la base por entorno.
      return this.callbackBaseUrl ? `${this.callbackBaseUrl}/api/integrations/gestadia-portal/payment-events` : '';
    },
    get enabled() { return !!this.apiKey; },
  },
};

// APP conversacional: credenciales exclusivas por facultad; nunca reutilizar plugin/WhatsApp.
export function appConversationConfig(env = process.env) {
  const key = role => ({ keyId: env[`APP_LIDIA_${role}_KEY_ID`] || '', secretBase64: env[`APP_LIDIA_${role}_SECRET_BASE64`] || '' });
  const base = {
    enabled: env.APP_CONVERSATIONS_ENABLED === 'true',
    integrationId: env.APP_LIDIA_INTEGRATION_ID || '', baseUrl: env.APP_LIDIA_BASE_URL || '', audience: env.APP_LIDIA_AUDIENCE || '',
    keys: { session: key('SESSION'), timeline: key('READ'), turn: key('TURN'), handoff: key('HANDOFF'), context: key('CONTEXT'), revocation: key('REVOCATION') },
    generalSupport: env.APP_LIDIA_GENERAL_SUPPORT === 'true', generalCommercial: env.APP_LIDIA_GENERAL_COMMERCIAL === 'true',
  };
  const nativeKey = role => ({
    keyId: env[`APP_LIDIA_SONDEO_${role}_KEY_ID`] || '',
    secretBase64: env[`APP_LIDIA_SONDEO_${role}_SECRET_BASE64`] || key(role).secretBase64,
  });
  return { ...base, nativeSondeo: {
    ...base,
    createNew: env.APP_LIDIA_SONDEO_ENABLED === 'true',
    integrationId: env.APP_LIDIA_SONDEO_INTEGRATION_ID || '',
    audience: env.APP_LIDIA_SONDEO_AUDIENCE || '',
    keys: { session: nativeKey('SESSION'), timeline: nativeKey('READ'), turn: nativeKey('TURN'), context: nativeKey('CONTEXT'), revocation: nativeKey('REVOCATION') },
    generalSupport: false, generalCommercial: false, allowedPermissions: ['sondeo', 'history'],
  } };
}

export function appConversationIntegrations(config) {
  const native = config.nativeSondeo;
  if (!config.enabled || !native || !(native.createNew || native.integrationId || native.audience)) return [config];
  const unavailable = () => { throw new AppProblem(503, 'runtime_unavailable'); };
  if (!native.integrationId || native.integrationId.length > 128 || native.integrationId === config.integrationId ||
      !/^[-A-Za-z0-9:._]{1,128}$/.test(native.audience || '') || native.audience === config.audience) unavailable();
  const ids = new Set(Object.values(config.keys || {}).map(key => key.keyId).filter(Boolean));
  for (const role of ['session', 'timeline', 'turn', 'context', 'revocation']) {
    const key = native.keys?.[role];
    if (!/^[-A-Za-z0-9_]{1,64}$/.test(key?.keyId || '') || ids.has(key.keyId) ||
        !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(key.secretBase64 || '') ||
        Buffer.from(key.secretBase64 || '', 'base64').length < 32) unavailable();
    ids.add(key.keyId);
  }
  return [config, native];
}
