import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

// Define la app Express (sin arrancarla). El arranque (listen) vive en
// server.js, para poder importar createApp en los tests sin levantar el server.
export function createApp() {
  const app = express();
  app.set('trust proxy', 1); // detrás del proxy de Plesk/Passenger → req.ip = IP real del cliente
  app.use(helmet({ contentSecurityPolicy: false })); // cabeceras de seguridad (CSP off: la SPA usa estilos inline)

  // Los webhooks de Stripe necesitan el body en crudo → se montan ANTES del json()
  // (y NO se limitan por rate: son de Stripe, no del usuario).
  app.use(webhooksRouter);
  app.use(express.json({ limit: '1mb' }));

  // Rate limiting (solo /api): frena fuerza bruta en login y spam en formularios.
  app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 500, standardHeaders: true, legacyHeaders: false }));
  app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiados intentos. Espera unos minutos.' } }));
  const writeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas solicitudes. Espera unos minutos.' } });
  app.use('/api/leads', writeLimiter);
  app.use('/api/checkout', writeLimiter);

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
    // No filtrar detalles internos: solo se devuelve el mensaje en errores "seguros"
    // (validación de subida de ficheros); el resto, mensaje genérico.
    const safe = err.name === 'MulterError' || /^Solo se admiten/.test(err.message || '');
    const status = safe ? 400 : (Number.isInteger(err.status) && err.status >= 400 && err.status < 500 ? err.status : 500);
    res.status(status).json({ error: safe ? err.message : 'No se pudo procesar la solicitud. Inténtalo de nuevo.' });
  });

  return app;
}
