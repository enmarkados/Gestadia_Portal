# Diseño — Integración LidIA → checkout con procedencia (referrer)

**Fecha:** 2026-07-24 · v3 del 2026-07-28
**Estado:** CONTRATO 1.0 CERRADO — listo para implementar.
**Fuente de verdad del API:** `docs/integraciones/2026-07-28-contrato-lidia-portal-v1-0.md`
(contrato acordado; este spec define el diseño interno del Portal contra él).
**Confirmación enviada:** `docs/integraciones/2026-07-28-confirmacion-contrato-1-0.md`.

## Contexto

El agente dedicado GestadIA de LidIA (WhatsApp) cualifica al lead, garantiza
Contacto + Oportunidad verificados en Zoho y, con confirmación explícita del
cliente, su tool dedicada `generar_enlace_gestadia_portal` pide a Portal un
checkout. Portal devuelve un enlace corto a un checkout prellenado; el cliente
revisa (banner de verificación), acepta condiciones y paga; Portal escribe el
resultado económico en la Oportunidad existente y notifica a LidIA con
callbacks firmados. Regla de colaboración con LidIA: sus tools sirven a varios
agentes — nunca pedir modificar una existente, siempre tool nueva scoped a
nuestro agente.

Hoy el portal no tiene procedencia en el checkout (`metadata.canal: 'web'`
fijo) y `fulfillPayment` siempre crea Deal nuevo en Zoho.

## Fase 1 (cerrada en contrato)

- Solo `service: canje-carnet` + `catalog_code: canje_1_categoria` →
  `amount_minor: 21000`, `currency: EUR`. `canje_2_categorias` →
  `409 catalog_code_no_disponible` (sin precio de negocio aún; activarlo será
  cambio compatible).
- Caducidad por defecto 7 días, configurable (`LIDIA_INTENT_TTL_DIAS`).
- Sin regeneración automática de enlaces; sin tocar teléfono/`Mobile`; sin
  volcado de `extra` como nota en Zoho.

## Diseño interno del Portal

### 1. Ruta de integración — `backend/src/routes/integrations.js` (nueva)

- **`POST /api/integrations/lidia/checkout-intent`** — auth `X-Api-Key`
  (`config.lidia.apiKey`), rate limit 60 req/min.
  - Valida por orden: api key (`401 unauthorized`) → `schema_version === '1.0'`
    (`400 unsupported_schema_version`) → payload/formatos §6.4 del contrato
    (`400 invalid_payload`; UUIDs minúsculas, E.164, ISO 4217, ids ≤128) →
    Zoho ids no vacíos/numéricos (`409 zoho_reference_invalid`) →
    `catalog_code` operativo (`409 catalog_code_no_disponible`) →
    `amount_minor`+`currency` vs catálogo (`409 importe_no_coincide` con
    `amount_minor_catalogo` y `currency_catalogo`).
  - Idempotencia: `idempotency_key` única + hash SHA-256 del payload
    normalizado. Misma clave + mismo hash → `200` con el intent existente y
    `reused: true` (cualquier `status`, incluido `expired`, para que LidIA lo
    sepa). Misma clave + hash distinto → `409 idempotency_conflict`.
  - `replaces_checkout_intent_id`: si llega, el intent referenciado pasa a
    `cancelled` (sin evento — la regeneración la inicia LidIA; evita que un
    callback atrasado pise al activo). Nueva clave + nuevo attempt id → intent
    nuevo con el mismo `lidia_payment_id`.
  - Respuesta `201` (creado) / `200` (reutilizado): `schema_version`,
    `checkout_intent_id` (`gci_…`), `lidia_payment_id`,
    `lidia_payment_attempt_id`, `url`, `expires_at`, `status`, `reused`.
  - Errores siempre `{ error, message, trace_id }` (trace_id generado por
    petición y logueado).
- **`GET /api/integrations/lidia/checkout-intents/:checkoutIntentId`** — auth
  `X-Api-Key`. Respuesta §7.2 del contrato (incluye `n_pedido`,
  `amount_minor`, `payment_method`, `paid_at` cuando esté pagado).
  `404 checkout_intent_not_found`.
- **`GET /api/checkout-intent/:token`** (público, para el frontend): **solo**
  `servicio`, `procedencia` y `prefill` mapeado a formato del formulario.
  Nunca ids Zoho/LidIA ni estado interno. Caducado/desconocido → `404`.
  Primera apertura: `status → opened` + encola `checkout.opened`.

### 2. Modelo `CheckoutIntent` (Prisma)

```prisma
model CheckoutIntent {
  id                    String   @id @default(uuid())
  publicId              String   @unique            // "gci_" + ULID-like
  token                 String   @unique            // opaco para /c/<token>
  idempotencyKey        String   @unique
  payloadHash           String                       // detección idempotency_conflict
  procedencia           String                       // 'lidia'
  servicioSlug          String
  catalogCode           String
  amountMinor           Int
  currency              String   @default("EUR")
  lidiaPaymentId        String
  lidiaPaymentAttemptId String
  replacesId            String?                      // publicId del intent sustituido
  prefill               Json                         // tal cual llegó
  origenMeta            Json                         // session/contact/agent ids, zoho ids, extra
  estado                String   @default("active")  // active|opened|paid|expired|cancelled
  expiresAt             DateTime
  expedienteId          String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([lidiaPaymentId])
}
```

### 3. Outbox de callbacks — tabla `LidiaEvento`

`id` interno + `eventId` (`evt_…`, único), `eventType`
(`payment.succeeded | checkout.opened | checkout.expired`),
`checkoutIntentId`, `payload` (Json — cuerpo EXACTO serializado una vez y
persistido como string para que la firma sea estable), `estado`
(`pendiente | enviado | manual | reconciliar | agotado`), `intentos`,
`proximoIntento`, `ultimaRespuesta`.

Worker (setInterval en server.js, tolerante a reinicios):

- Firma en el momento del envío: `X-Gestadia-Timestamp` (segundos Unix) +
  `X-Gestadia-Key-Id` (`config.lidia.callbackKeyVersion`) +
  `X-Gestadia-Signature: v1=hex(HMAC-SHA256(secret, timestamp + "." + body))`.
- Política por respuesta de LidIA: `2xx` → `enviado`; `400`/`401` → `manual`
  (sin reintento automático, log + nota en Deal); `409` → `reconciliar`
  (log destacado); `429`/`5xx`/error de red → reintento con backoff
  1 min / 10 min / 1 h / 6 h / 24 h; agotados → `agotado` + `addDealNote`.
- Replay manual: `backend/scripts/lidia-replay.mjs <event_id>` reencola.
- El mismo worker marca `expired` los intents vencidos (`active`/`opened`) y
  encola `checkout.expired`.

### 4. Expediente y checkout

- `Expediente`: campos nuevos `procedencia String @default("web")` y
  `origenMeta Json?`. Stripe metadata: `canal: procedencia`.
- `POST /api/checkout` acepta `token` opcional: si es de un intent
  `active`/`opened` no caducado → el expediente hereda `procedencia` +
  `origenMeta` y se enlaza `expedienteId`. Sin token → flujo actual intacto.
- Un intent `paid` en `/c/<token>` → redirige a `/gracias?pedido=<nPedido>`.

### 5. Frontend

- Ruta `/c/:token`: resuelve el intent público; válido → checkout del
  servicio con `CheckoutForm` prellenado; caducado/inválido → checkout normal
  + aviso suave ("el enlace ha caducado, puedes contratar igualmente").
- `CheckoutForm` recibe `prefill` + `procedencia`; con `lidia` muestra banner
  destacado: "Estos datos los hemos recogido en tu conversación de WhatsApp —
  revísalos con calma antes de pagar, sobre todo nombre y apellidos". Submit
  incluye `token`.
- Mapeos de prellenado (backend, en el GET público):
  - `pais_canje` ISO 3166-1 alfa-2 → clave interna (mapa nuevo `ISO_A_CLAVE`
    en `shared/paises-canje.js`: `CO→colombia`, `GB→reino-unido`, …). Sin
    correspondencia → no se prellena.
  - `tipo_documento`: `PASAPORTE→Pasaporte`; `OTRO`/desconocido → no se
    prellena.
  - `direccion` string → NO prellena (informativa, queda en `prefill`
    persistido). Objeto estructurado → posible extensión 1.x.

### 6. `fulfillPayment`

- Con `procedencia 'lidia'` + `zoho_deal_id`:
  - `PUT` a la Oportunidad existente: `Stage 'Cerrado ganado'`,
    `Pago_Confirmado`, `Fecha_de_pago`, `M_todos_de_pago`, `Ref_pago`,
    `N_Pedido`, `Amount`, `Fecha_M_xima_para_Desistimiento`. `Lead_Source`
    intacto. No crea Deal.
  - Contacto (`zoho_contact_id` → `user.zohoContactId`): actualiza SOLO
    allowlist `First_Name`, `Last_Name`, `Email`, tipo/nº documento con lo
    confirmado. `Mobile` jamás. Correcciones → nota en el Deal.
  - Fallback: update fallido → crear Deal (flujo actual) + nota. Un pago nunca
    queda sin CRM.
- Marca intent `paid`, `paid_at`, y encola `payment.succeeded` con
  `amount_minor`, `payment_method` (`card`/`bizum`), `datos_confirmados` y
  `correcciones` como array `[{ campo, valor_confirmado }]` (diff prefill vs
  confirmado; teléfono incluido solo a título informativo — discrepancia de
  teléfono se registra para revisión).
- Logs: nunca `num_documento` completo ni PII innecesaria (redacción).

### 7. Config nueva (`config.lidia`)

`enabled`, `apiKey`, `callbackUrl` (base por entorno + ruta fija
`/api/integrations/gestadia-portal/payment-events`), `callbackSecret`,
`callbackKeyVersion` (`v1`), `intentTtlDias` (7), `rateLimitPorMinuto` (60).
Sin secretos en Git.

## Testing

Cubrir la matriz §14 del contrato en lo que toca a Portal, siguiendo los
patrones de test existentes:

- Intent: auth; `unsupported_schema_version`; `invalid_payload` (UUID/E.164/
  ISO 4217); `zoho_reference_invalid`; `catalog_code_no_disponible`;
  `importe_no_coincide` (con `amount_minor_catalogo`); idempotencia (`reused`,
  `idempotency_conflict` por hash distinto); `replaces_…` → predecesor
  `cancelled`; TTL configurable; formato de error con `trace_id`.
- `GET` autenticado (§7.2 completo, 404) y `GET` público (no filtra ids;
  `opened` + evento una sola vez; mapeos ISO/tipo_documento/direccion).
- Checkout con token → `procedencia`/`origenMeta`; regresión sin token.
- `fulfillPayment`: update-no-create, fallback, allowlist sin `Mobile`, nota
  de correcciones, intent `paid`, evento con `amount_minor` y `correcciones`
  en formato contrato.
- Outbox: firma canónica (timestamp.body, hex minúsculas), política
  400/401→manual, 409→reconciliar, 429/5xx→backoff, agotamiento, replay.
- Frontend: `/c/:token` prellenado, banner solo `lidia`, caducado → checkout
  normal, pagado → gracias.

## Historial

- v1 (2026-07-24): propuesta inicial (handoff a LidIA).
- v2 (2026-07-24): contestación de LidIA — idempotencia, catalog_code,
  validación de precio, endpoint de estado, eventos firmados, cola
  persistente, allowlist sin teléfono, reparto Zoho.
- v2.1 (2026-07-24): tool nueva dedicada `generar_enlace_gestadia_portal`
  (tools LidIA compartidas entre agentes; Gestadia tiene agente exclusivo).
- v3 (2026-07-28): contrato 1.0 cerrado — `lidia_payment_attempt_id`,
  `replaces_checkout_intent_id` → `cancelled`, `idempotency_conflict` por
  hash, estados en inglés, firma canónica timestamp.body con key id, errores
  `{error,message,trace_id}`, ruta GET plural, política de respuestas del
  callback, mapeos ISO alfa-2 / tipo_documento / direccion string, rate limit
  60/min, redacción de PII en logs.
