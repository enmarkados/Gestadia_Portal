import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { leadsRouter } from './routes/leads.js';
import { checkoutRouter } from './routes/checkout.js';
import { authRouter } from './routes/auth.js';
import { portalRouter } from './routes/portal.js';
import { webhooksRouter } from './routes/webhooks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIST = path.join(__dirname, '..', '..', 'frontend', 'dist');

export function createApp() {
  const app = express();

  // Los webhooks de Stripe necesitan el body en crudo → se montan ANTES del json()
  app.use(webhooksRouter);
  app.use(express.json({ limit: '1mb' }));

  app.use(leadsRouter);
  app.use(authRouter);
  app.use(checkoutRouter);
  app.use(portalRouter);

  app.get('/api/health', (_req, res) => res.json({
    ok: true,
    stripe: config.stripe.enabled ? 'activo' : 'MODO DEMO (pago simulado)',
    zoho: config.zoho.enabled ? 'activo' : 'desactivado (solo log)',
    email: config.smtp.enabled ? 'activo' : 'consola',
  }));

  // En producción, sirve el build de React y hace fallback a index.html
  // para cualquier ruta que no sea /api ni /webhooks (React Router).
  app.use(express.static(FRONTEND_DIST));
  app.get(/^(?!\/api|\/webhooks).*/, (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'), (err) => {
      if (err) res.status(404).send('Frontend no compilado — ejecuta `npm run build` en frontend/');
    });
  });

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(400).json({ error: err.message || 'Error inesperado' });
  });

  return app;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
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
}

process.on('uncaughtException', (e) => console.error('uncaughtException:', e));
process.on('unhandledRejection', (e) => console.error('unhandledRejection:', e));
