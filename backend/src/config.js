import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3001,
  baseUrl: process.env.BASE_URL || 'http://localhost:3001',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-cambiar',

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
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
};
