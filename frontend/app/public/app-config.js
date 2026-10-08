// Configuración pública; editar en el hosting sin recompilar. Nunca incluir secretos.
window.GESTADIA_APP_CONFIG = {
  apiBaseUrl: '', // mismo origen; /api debe apuntar al backend del portal
  checkoutBaseUrl: 'https://gestadia.com',
  conversationsEnabled: false, // API autenticada APP; activar sólo tras validar DEV.
  demoEnabled: true,
  demoOnly: true, // Primera versión: sin llamadas al portal ni a LidIA.
  pluginWeb: { baseUrl: '/lidia', key: '' }, // clave PÚBLICA; nunca AdminSecret
};
