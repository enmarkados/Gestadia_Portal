// Punto de entrada del servidor (Passenger y `npm start`). La app se DEFINE en
// app.js (createApp); aquí SIEMPRE se hace listen(). Passenger carga este
// fichero como startup file y necesita que arranque el servidor sin condiciones.
import { createApp } from './app.js';
import { config } from './config.js';
import { despacharEventosPendientes, expirarIntents } from './services/lidia.js';

createApp().listen(config.port, () => {
  console.log(`Gestadia backend ▸ ${config.baseUrl}`);
  console.log(`  Stripe: ${config.stripe.enabled ? 'activo' : 'MODO DEMO'} · Zoho: ${config.zoho.enabled ? 'activo' : 'off'} · SMTP: ${config.smtp.enabled ? 'activo' : 'consola'}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nError: el puerto ${config.port} ya está en uso.\nCierra el proceso anterior o usa: PORT=3002 npm start\n`);
    process.exit(1);
  }
  throw err;
});

process.on('uncaughtException', (e) => console.error('uncaughtException:', e));
process.on('unhandledRejection', (e) => console.error('unhandledRejection:', e));

// Worker de la integración LidIA: despacha la outbox de callbacks y caduca
// intents vencidos. Tolerante a reinicios (estado en BD, no en memoria).
if (config.lidia.enabled) {
  setInterval(() => {
    despacharEventosPendientes().catch((e) => console.error('[lidia] despacho:', e.message));
    expirarIntents().catch((e) => console.error('[lidia] expiración:', e.message));
  }, 30_000);
}
