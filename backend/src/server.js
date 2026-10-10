// Punto de entrada del servidor (Passenger y `npm start`). La app se DEFINE en
// app.js (createApp); aquí SIEMPRE se hace listen(). Passenger carga este
// fichero como startup file y necesita que arranque el servidor sin condiciones.
import { createApp } from "./app.js";
import { config } from "./config.js";
import {
  despacharEventosPendientes,
  expirarIntents,
} from "./services/lidia.js";

import { validateMobileConfig } from "./mobile-config.js";
const configErrors = validateMobileConfig(mobileConfig);
if (configErrors.length)
  throw new Error(`Configuración móvil incompleta: ${configErrors.join(", ")}`);
createApp()
  .listen(config.port, () => {
    console.log(`Gestadia backend ▸ ${config.baseUrl}`);
    console.log(
      `  Stripe: ${config.stripe.enabled ? "activo" : "MODO DEMO"} · Zoho: ${config.zoho.enabled ? "activo" : "off"} · SMTP: ${config.smtp.enabled ? "activo" : "consola"}`,
    );
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\nError: el puerto ${config.port} ya está en uso.\nCierra el proceso anterior o usa: PORT=3002 npm start\n`,
      );
      process.exit(1);
    }
    throw err;
  });

process.on("uncaughtException", (e) => console.error("uncaughtException:", e));
process.on("unhandledRejection", (e) =>
  console.error("unhandledRejection:", e),
);

// Worker de la integración LidIA: despacha la outbox de callbacks y caduca
// intents vencidos. Tolerante a reinicios (estado en BD, no en memoria).
if (config.lidia.enabled) {
  const worker = setInterval(() => {
    despacharEventosPendientes().catch((e) =>
      console.error("[lidia] despacho:", e.message),
    );
    expirarIntents().catch((e) =>
      console.error("[lidia] expiración:", e.message),
    );
  }, 30_000);

  // unref() es imprescindible bajo Passenger: al recargar la app deja el
  // proceso viejo drenando, y un timer "ref-ed" lo mantiene vivo para siempre.
  // El resultado eran workers zombis acumulándose en cada reinicio, cada uno
  // con la configuración con la que arrancó (URLs y secretos ya obsoletos).
  // Con unref el timer no sostiene el event loop: el proceso muere cuando su
  // servidor se cierra, y solo despacha el proceso vivo.
  worker.unref();

  // Passenger manda SIGTERM al reciclar: parar el worker de inmediato para no
  // solapar despachos entre el proceso saliente y el entrante.
  for (const señal of ["SIGTERM", "SIGINT"]) {
    process.on(señal, () => {
      clearInterval(worker);
      console.log(`[lidia] worker detenido por ${señal}`);
      process.exit(0);
    });
  }
}

// Outbox móvil durable. Un fallo del proveedor no bloquea el portal.
import { mobileConfig } from "./mobile-config.js";
import { pushService } from "./services/push/runtime.js";
if (mobileConfig.enabled && mobileConfig.push.enabled) {
  let running = false;
  const worker = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      await pushService.dispatch();
    } catch {
      console.error("[push] despacho pendiente");
    } finally {
      running = false;
    }
  }, 15000);
  worker.unref();
  for (const signal of ["SIGTERM", "SIGINT"])
    process.on(signal, () => clearInterval(worker));
}

import { accountDeletion, processAppleRevocations } from "./services/account-deletion.js";
if (mobileConfig.enabled) {
  let running = false;
  const worker = setInterval(async () => {
    if (running) return;
    running = true;
    try { await processAppleRevocations(); await accountDeletion.runPending(); }
    catch { console.error("[baja] actuación pendiente"); }
    finally { running = false; }
  }, 60000);
  worker.unref();
  for (const signal of ["SIGTERM", "SIGINT"])
    process.on(signal, () => clearInterval(worker));
}

import { db } from "./db.js";
import { cleanExpiredSocialAttempts } from "./services/apple-auth.js";
if (mobileConfig.enabled) {
  const worker = setInterval(
    () =>
      cleanExpiredSocialAttempts(db).catch(() =>
        console.error("[social] limpieza pendiente"),
      ),
    60000,
  );
  worker.unref();
  for (const signal of ["SIGTERM", "SIGINT"])
    process.on(signal, () => clearInterval(worker));
}

// Dedicated APP lifecycle worker. Inactive unless explicitly configured.
if (process.env.APP_CONVERSATIONS_ENABLED === 'true') {
  const { appConversationConfig } = await import('./config.js');
  const { db } = await import('./db.js');
  const { AppS2SClient } = await import('./app/s2s.js');
  const { drainLifecycle } = await import('./app/lifecycle.js');
  const appConfig = appConversationConfig(), appClient = new AppS2SClient(appConfig);
  let running = false;
  const worker = setInterval(async () => {
    if (running) return;
    running = true;
    try { await drainLifecycle(db, appClient, appConfig); }
    catch { console.error('[app] lifecycle pending; retry scheduled'); }
    finally { running = false; }
  }, 20000);
  worker.unref();
  for (const signal of ['SIGTERM','SIGINT']) process.on(signal, () => clearInterval(worker));
}
