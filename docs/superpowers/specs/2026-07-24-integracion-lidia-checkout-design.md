# Diseño — Integración LidIA → checkout con procedencia (referrer)

**Fecha:** 2026-07-24 (v2 — incorpora la contestación del equipo LidIA)
**Estado:** ACORDADO — contrato cerrado con LidIA
(`docs/integraciones/2026-07-24-respuesta-a-lidia.md`). Los flecos operativos
(secretos, URLs, estructura de `extra`, ventana de pruebas) no bloquean el
desarrollo, solo despliegue y pruebas conjuntas.

## Contexto

El equipo LidIA opera agentes conversacionales por WhatsApp. Cuando entra un
lead en Zoho, su agente lo prospecciona, recoge los datos del canje y convierte
el lead a Contacto + Oportunidad en Zoho **antes** del pago (adaptarán su lado
para garantizar y persistir `zoho_contact_id` y `zoho_deal_id`). Crearán una
**herramienta nueva `generar_enlace_gestadia_portal`**, vinculada solo al
agente dedicado de Gestadia, que llamará a nuestro `checkout-intent`
replicando los controles de su tool compartida `generar_enlace_pago`
(WhatsApp real, precio presentado, confirmación explícita, no-duplicados).
Regla de colaboración con LidIA: sus tools sirven a varios agentes — nunca se
pide modificar una existente, siempre una tool nueva scoped a nuestro agente.

Hoy el portal no tiene concepto de procedencia en el checkout: `POST
/api/checkout` crea User + Expediente y lanza Stripe con `metadata.canal:
'web'` fijo; `fulfillPayment` siempre crea un Deal nuevo en Zoho con
`Lead_Source: 'Formulario web Gestadia'`.

## Decisiones cerradas

1. **Aterrizaje:** enlace corto tokenizado → checkout **prellenado**; el
   cliente revisa, acepta condiciones y paga. Con procedencia `lidia` se
   muestra un **banner destacado de verificación de datos** (la calidad varía
   según origen: Facebook Ads suele venir bien, Gestadia Woztell no siempre).
   Lo confirmado por el cliente es la fuente de verdad.
2. **Catálogo:** el contrato acepta `catalog_code`
   `canje_1_categoria | canje_2_categorias`, pero **fase 1 solo opera
   `canje_1_categoria`** (210 €, lookup Stripe `gestadia_canje_1_categoria_2026`
   ya existente). `canje_2_categorias` → `409 catalog_code_no_disponible`
   hasta que negocio publique precio. El importe lo valida el Portal contra su
   catálogo (`409 importe_no_coincide` con `importe_catalogo` en céntimos); el
   precio cobrado es siempre el del catálogo.
3. **Idempotencia:** `idempotency_key` única por intento de cobro. Misma clave
   → mismo intent con su `status` actual y `reused: true`. Regeneración tras
   caducidad = nueva `idempotency_key` con el mismo `lidia_payment_id`. Sin
   regeneración automática (la pide LidIA cuando el usuario reconfirme).
4. **Zoho, responsabilidad única:** LidIA crea/mantiene cualificación,
   Contacto y Oportunidad pre-pago (sus `Lead_Source`: Gestadia Woztell /
   Facebook Ads — no se tocan). El Portal escribe el resultado económico en la
   Oportunidad existente y actualiza el Contacto **solo por allowlist**
   (First_Name, Last_Name, Email, documento). **El teléfono nunca se
   sobrescribe** (ni `Mobile` en Zoho ni en LidIA): es la identidad del canal
   WhatsApp. LidIA no repite la escritura económica.
5. **Callback:** eventos versionados y firmados; LidIA los procesa
   idempotentemente por `event_id` y responde `2xx` a duplicados. Cola
   persistente en Portal con 5 reintentos (1 min/10 min/1 h/6 h/24 h) y replay
   manual.
6. **Caducidad configurable** (`LIDIA_INTENT_TTL_DIAS`, defecto 7).

## Arquitectura

```
LidIA generar_enlace_gestadia_portal ──POST /api/integrations/lidia/checkout-intent──> backend
backend ── CheckoutIntent(token, idempotency_key) ──> { checkout_intent_id, url, status, reused, expires_at }
cliente ── /c/<token> ──> checkout prellenado + banner verificación → paga
Stripe webhook ──> fulfillPayment → update económico Deal Zoho → outbox → callback firmado a LidIA
LidIA ──GET /api/integrations/lidia/checkout-intent/:id──> reconciliación
```

### Componentes

**1. Ruta de integración** — `backend/src/routes/integrations.js` (nueva):

- `POST /api/integrations/lidia/checkout-intent` — auth `X-Api-Key` contra
  `config.lidia.apiKey`, rate limit propio.
  - Body: `schema_version` (`"1"`), `idempotency_key`, `lidia_payment_id`,
    `lidia_session_id`, `lidia_contact_id`, `lidia_agent_id`,
    `service` (slug), `catalog_code`, `telefono` (E.164), `importe` (céntimos),
    `moneda`, `prefill` estructurado (nombre, apellidos, email,
    tipo_documento, num_documento, pais_canje, datos_pais, direccion),
    `zoho_contact_id`, `zoho_deal_id`, `extra` (cualificación, requisitos,
    prioridad, cita — estructura pendiente de LidIA).
  - Validaciones: api key (`401`); slug/teléfono/payload (`400`/`422`);
    `catalog_code` no operativo (`409 catalog_code_no_disponible`);
    `importe`/`moneda` vs catálogo (`409 importe_no_coincide` +
    `importe_catalogo` en céntimos).
  - Idempotencia: `idempotency_key` con unique en BD; si ya existe → devuelve
    el intent existente con su `status` y `reused: true` (aunque esté
    caducado, para que LidIA lo sepa). Nunca emite dos enlaces por la misma
    clave.
  - Respuesta `200/201`:
    `{ checkout_intent_id, url, token, expires_at, status, reused }`.
- `GET /api/integrations/lidia/checkout-intent/:id` — auth `X-Api-Key`.
  Devuelve `{ checkout_intent_id, status, n_pedido?, expires_at,
  lidia_payment_id }` para reconciliación. `404` si no existe.
- `GET /api/checkout-intent/:token` (público, para el frontend): **solo**
  prellenado + `servicio` + `procedencia`. Nunca ids de Zoho/LidIA ni estado
  interno. Caducado/desconocido → `404`. Marca `abierto` la primera vez (y
  encola evento `checkout.opened`).

**2. Modelo `CheckoutIntent`** (Prisma, tabla nueva):

```prisma
model CheckoutIntent {
  id             String   @id @default(uuid())
  token          String   @unique            // opaco, crypto.randomBytes
  idempotencyKey String   @unique
  procedencia    String                       // 'lidia' (extensible)
  servicioSlug   String
  catalogCode    String
  importeMinor   Int                          // céntimos, validado vs catálogo
  moneda         String   @default("EUR")
  prefill        Json
  origenMeta     Json                         // lidia_payment_id, lidia_session_id, lidia_contact_id, lidia_agent_id, zoho_contact_id, zoho_deal_id, extra
  estado         String   @default("emitido") // emitido | abierto | pagado | caducado
  expiresAt      DateTime
  expedienteId   String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

**3. Outbox de callbacks** — tabla `LidiaEvento`: `id` (= `event_id`),
`eventType` (`payment.succeeded` | `checkout.opened` | `checkout.expired`),
`checkoutIntentId`, `payload` (Json, cuerpo exacto), `estado`
(`pendiente | enviado | agotado`), `intentos`, `proximoIntento`. Un worker
simple (setInterval en el proceso, arrancado en server.js) despacha pendientes:
firma `X-Gestadia-Signature: sha256=<HMAC(body, secreto)>` + cabeceras
`X-Gestadia-Timestamp` y `X-Gestadia-Key-Version`; backoff
1 min/10 min/1 h/6 h/24 h; al agotar → log + `addDealNote`. Replay manual:
script `backend/scripts/lidia-replay.mjs` que reencola por `event_id`.

**4. Campos nuevos en `Expediente`:** `procedencia String @default("web")` y
`origenMeta Json?`. El metadata de Stripe pasa a `canal: procedencia`.

**5. Frontend:**

- Ruta `/c/:token`: resuelve el intent; válido → checkout del servicio con
  `CheckoutForm` prellenado; caducado/inválido → checkout normal con aviso
  suave; ya pagado → página de gracias del pedido.
- `CheckoutForm` acepta `prefill` y `procedencia`. Con `procedencia ===
  'lidia'`: banner destacado ("Estos datos los hemos recogido en tu
  conversación de WhatsApp — revísalos con calma antes de pagar, sobre todo
  nombre y apellidos"). El submit incluye el `token` en `postCheckout`.

**6. `POST /api/checkout`:** si llega `token` válido no pagado → expediente
con `procedencia` y `origenMeta` del intent y enlace `expedienteId`. Sin
token, comportamiento intacto.

**7. `fulfillPayment`:**

- Con `procedencia 'lidia'` + `zoho_deal_id`:
  - No crea Deal. `PUT` al existente: `Stage: 'Cerrado ganado'`,
    `Pago_Confirmado`, `Fecha_de_pago`, `M_todos_de_pago`, `Ref_pago`,
    `N_Pedido`, `Amount`, `Fecha_M_xima_para_Desistimiento`. `Lead_Source`
    intacto.
  - Contacto: enlaza `user.zohoContactId`; actualiza por allowlist
    (First_Name, Last_Name, Email, documento) con lo confirmado. `Mobile` no
    se toca. Correcciones → nota en el Deal (antes/después).
  - Fallback: sin `zoho_deal_id` o update fallido → crear Deal (flujo actual)
    + nota. Un pago nunca queda sin reflejo en CRM.
- Marca el intent `pagado` y encola `payment.succeeded` con
  `datos_confirmados` + `correcciones` (diff prefill vs confirmado; el
  teléfono puede aparecer en correcciones a título informativo).

**8. Config nueva (`config.lidia`):** `apiKey`, `callbackUrl`,
`callbackSecret`, `callbackKeyVersion`, `intentTtlDias` (defecto 7),
`enabled`.

**9. Caducidad:** job ligero (mismo worker del outbox) marca `caducado` los
intents vencidos y encola `checkout.expired`.

## Manejo de errores

- Errores del endpoint según §Componentes.1; siempre `{ error }`.
- Token caducado/inexistente en `/c/:token` → checkout normal + aviso suave.
- Fallos de Zoho o del callback no bloquean el pago (patrón actual).
- El worker de outbox es tolerante a reinicios (estado persistido en BD).

## Testing

Siguiendo los patrones existentes (`frontend/src/pages/Checkout.test.jsx`,
tests de backend):

- Intent: auth, validaciones (catalog_code 409, importe 409), idempotencia
  (misma clave → mismo intent + reused, caducado incluido), TTL configurable.
- `GET` estado (auth) y `GET` público (no filtra ids internos; 404 caducado;
  marca `abierto` y encola `checkout.opened` una sola vez).
- Checkout con token → `procedencia`/`origenMeta`; sin token → regresión
  intacta.
- `fulfillPayment`: update vs create, fallback, allowlist sin `Mobile`, nota
  de correcciones, intent → `pagado`, encolado de `payment.succeeded` con
  `amount_minor` correcto.
- Outbox: firma sobre cuerpo exacto + cabeceras, backoff, agotamiento con
  nota, replay por `event_id`.
- Frontend: `/c/:token` prellenado, banner solo con procedencia `lidia`,
  caducado → checkout normal, pagado → gracias.

## Historial

- v1 (2026-07-24): propuesta inicial, enviada como handoff a LidIA.
- v2 (2026-07-24): contestación de LidIA incorporada — idempotencia,
  `lidia_payment_id`, `catalog_code` (fase 1 solo 1 categoría, decisión de
  negocio), validación de precio, endpoint de estado, eventos versionados con
  `event_id`/`amount_minor`, cola persistente 5 reintentos + replay, allowlist
  sin teléfono, caducidad configurable, reparto de responsabilidades Zoho.
- v2.1 (2026-07-24): la integración entra por una tool nueva dedicada
  `generar_enlace_gestadia_portal` (las tools de LidIA son compartidas entre
  agentes y no se modifican; Gestadia tiene un agente exclusivo).
