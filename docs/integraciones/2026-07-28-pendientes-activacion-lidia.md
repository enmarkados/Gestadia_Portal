# Pendientes para activar la integración LidIA — ejecutar cuando LidIA dé el OK

**Fecha:** 2026-07-28
**Estado:** EN ESPERA de la respuesta de LidIA (fecha de ventana + su URL de
callback + su secreto HMAC). El código está en `main`, la migración de BD
aplicada en `gestadia_portal_db` y el contrato 1.0 cerrado. Cuando LidIA
confirme, ejecutar los 3 flecos en orden y después la prueba del flujo
completo.

---

## Fleco 1 — Deploy del código al servidor

El `main` con la integración está en GitHub pero **no desplegado en el
hosting** (Plesk, deploy por FTP).

1. Poner las credenciales FTP en el `.env` de la **raíz** del repo
   (plantilla en `.env.example`: `FTP_HOST`, `FTP_USER`, `FTP_PASS`,
   `FTP_SECURE=true`, `FTP_REMOTE_DIR`).
2. Compilar el frontend y lanzar el deploy:
   ```
   cd frontend && npm run build
   cd .. && node ftp-deploy.cjs
   ```
   (Sube `backend/`, `shared/` y `frontend/dist`; nunca sube ficheros `.env`.)
3. En el servidor: `cd backend && npm install && npm run migrate:deploy`
   (la migración ya está aplicada — el comando confirmará "up to date").
4. Reiniciar la app Node en Plesk (Passenger) y verificar:
   ```
   GET https://gestadia.com/api/health            → ok: true
   POST https://gestadia.com/api/integrations/lidia/checkout-intent  → 401 (sin api key = integración montada)
   GET https://gestadia.com/api/integrations/lidia/catalog (con api key) → 200 con canje_1_categoria activo
   ```
   (URL base confirmada el 2026-07-28: `https://gestadia.com` — health 200.
   `portal.gestadia.com` NUNCA ha existido: era un error arrastrado del
   `.env.production.example`, ya corregido. Entorno ÚNICO: no hay staging
   separado.)

## Fleco 2 — Credenciales e intercambio por canal seguro

**API key: YA GENERADA el 2026-07-28** (entorno único). Está guardada en el
`backend/.env` local (`LIDIA_API_KEY=…`, fichero no commiteado): copiarla de
ahí al `.env` del servidor y pasársela a LidIA por canal seguro.

**Recibimos de LidIA** por el mismo canal seguro:
- Secreto HMAC + `key_id` de los callbacks (ellos lo generan — acordado).
- URL base de su callback por entorno.

**Configurar en el `.env` del SERVIDOR** (no en el repo) y reiniciar:

```
LIDIA_API_KEY=<la generada para ese entorno>
LIDIA_CALLBACK_BASE_URL=<URL base de LidIA de ese entorno>
LIDIA_CALLBACK_SECRET=<su secreto HMAC>
LIDIA_CALLBACK_KEY_VERSION=<su key_id, p. ej. v1>
# opcional: LIDIA_INTENT_TTL_DIAS=7
```

Sin `LIDIA_API_KEY` la integración queda apagada (401 a todo, worker parado);
al ponerla y reiniciar, se activa endpoint + worker de callbacks.

**⚠️ Verificar también en el `.env` del servidor:** `BASE_URL=https://gestadia.com`.
El ejemplo de producción traía arrastrado `portal.gestadia.com` (dominio que
nunca existió); si el servidor lo heredó, los enlaces `/c/<token>` que el
agente manda por WhatsApp saldrían rotos. `config.baseUrl` construye esas URLs.

**Enviarles a la vez:** URL base del Portal por entorno + la API key.

## Fleco 3 — Contacto + Oportunidad de prueba en Zoho

Crear en el CRM (lo hacemos nosotros — se puede hacer con el conector Zoho
CRM de Claude o a mano):

- **Contacto de prueba:** nombre reconocible (p. ej. "Prueba LidIA Staging"),
  con `Mobile` en E.164 de un número de pruebas de WhatsApp.
- **Oportunidad de prueba** colgando de ese contacto: `Pipeline: CV con
  Pago`, `Servicio: Canje`, stage inicial cualquiera anterior al pago.
- Pasar a LidIA **ambos IDs** (`zoho_contact_id`, `zoho_deal_id`) con las
  credenciales del Fleco 2.

> Nota: el update económico del Portal hará `Stage → "Cerrado ganado"` +
> campos de pago sobre esa Oportunidad al completarse la prueba de pago.

---

## Prueba del flujo completo (ventana conjunta con LidIA)

Guion mínimo de la matriz §14 del contrato (el acta completa son los 20
casos; estos son los imprescindibles del happy path + seguridad):

1. **Creación:** su tool `generar_enlace_gestadia_portal` (o curl con su
   payload real) → `201` con `url` y `checkout_intent_id`. *(caso 1)*
2. **Idempotencia:** repetir el mismo POST → `200` + `reused: true`; cambiar
   un campo con la misma clave → `409 idempotency_conflict`. *(casos 2-3)*
3. **Rechazos:** `canje_2_categorias` → `409`; `amount_minor` incorrecto →
   `409` con `amount_minor_catalogo`. *(casos 4-5)*
4. **Apertura:** abrir el enlace → checkout prellenado + banner de
   verificación; LidIA recibe `checkout.opened`. *(caso 7)*
5. **Pago test:** tarjeta de test de Stripe (`4242 4242 4242 4242`) →
   página de gracias. *(caso 8; Bizum si está en staging, caso 9)*
6. **Zoho:** la Oportunidad de prueba pasa a "Cerrado ganado" con los campos
   económicos, `Lead_Source` intacto, contacto corregido solo por allowlist
   y `Mobile` intacto. **Exactamente una vez.** *(casos 16-18)*
7. **Callback:** LidIA recibe `payment.succeeded` firmado con
   `datos_confirmados` y `correcciones`; reenviado el mismo evento →
   `2xx` sin repetir efectos. *(caso 10)*
8. **Seguridad del callback:** firma inválida → su `401`; timestamp fuera de
   ventana → su `401`. *(casos 11-12)*
9. **Reconciliación:** simular pérdida del callback y consultar
   `GET /api/integrations/lidia/checkout-intents/{id}` → estado `paid` con
   `n_pedido`. *(caso 19)*
10. **Caducidad/regeneración:** intent caducado no se regenera solo; nueva
    petición con `replaces_checkout_intent_id` → el anterior queda
    `cancelled`. *(casos 13-15)*
11. **Caso 20 — PARCIAL en el acta:** comunicación post-pago solo dentro de
    la ventana de 24 h de WhatsApp (su plantilla de Meta sigue pendiente);
    cerrar con prueba puntual cuando la aprueben.

Herramientas de apoyo en nuestro lado durante la ventana:
- Outbox: tabla `LidiaEvento` (estados `pendiente/enviado/manual/
  reconciliar/agotado`) y replay manual con
  `node scripts/lidia-replay.mjs <event_id>` desde `backend/`.
- Logs del worker: prefijo `[lidia]` en la salida del backend.
