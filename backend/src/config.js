import 'dotenv/config';

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
  return {
    enabled: env.APP_CONVERSATIONS_ENABLED === 'true',
    integrationId: env.APP_LIDIA_INTEGRATION_ID || '', baseUrl: env.APP_LIDIA_BASE_URL || '', audience: env.APP_LIDIA_AUDIENCE || '',
    keys: { session: key('SESSION'), timeline: key('READ'), turn: key('TURN'), handoff: key('HANDOFF'), context: key('CONTEXT'), revocation: key('REVOCATION') },
    generalSupport: env.APP_LIDIA_GENERAL_SUPPORT === 'true', generalCommercial: env.APP_LIDIA_GENERAL_COMMERCIAL === 'true',
  };
}

// v2 remains a separate, unmounted transport; never reuse v1 credentials.
export function appV2ConversationConfig(env = process.env) {
  const roles = {'app.sessions.write':'SESSION','app.timeline.read':'READ','app.turns.write':'TURN','app.handoff.request':'HANDOFF','app.context.attest':'CONTEXT','app.bindings.write':'BINDING_WRITE','app.bindings.read':'BINDING_READ','app.subjects.revoke':'REVOCATION'};
  return {
    enabled: env.APP_V2_ENABLED === 'true', guestEnabled: env.APP_V2_GUEST_ENABLED === 'true',
    integrationId: env.APP_V2_LIDIA_INTEGRATION_ID || '', baseUrl: env.APP_V2_LIDIA_BASE_URL || '', audience: env.APP_V2_LIDIA_AUDIENCE || '',
    keys: Object.fromEntries(Object.entries(roles).map(([cap,role])=>[cap,{keyId:env[`APP_V2_LIDIA_${role}_KEY_ID`]||'',secretBase64:env[`APP_V2_LIDIA_${role}_SECRET_BASE64`]||''}])),
  };
}
