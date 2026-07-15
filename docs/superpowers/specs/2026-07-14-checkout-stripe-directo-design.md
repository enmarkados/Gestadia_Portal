# Checkout del portal directo a Stripe (catálogo real + canal web + enlace a Zoho) — Design

**Fecha:** 2026-07-14
**Estado:** aprobado en conversación (pendiente revisión del spec)

## Problema

El checkout del portal genera hoy sesiones de Stripe con `price_data` **inline** (un precio ad-hoc por pago), en modo demo. Queremos que, con Stripe activo, use el **catálogo real** (los precios que ya existen en Stripe), marque el **canal web**, y ligue el pago al **contacto de Zoho** — de forma consistente con cómo lo hace **Lidia** (el generador de enlaces para WhatsApp), sin duplicar catálogo ni pasar por Lidia en runtime.

## Objetivo

Cuando `STRIPE_SECRET_KEY` esté configurada, el `POST /api/checkout` crea una **Stripe Checkout Session** que:
1. Referencia el **precio existente por `lookup_key`** (no `price_data` inline).
2. Va asociada a un **Customer de Stripe ligado a Zoho** (`external_provider: zoho`, `external_id: <zohoContactId>`), como Lidia.
3. Lleva en `metadata` el **canal** (`web`), el `nPedido`, el `servicio` y el `expedienteId`, y esos datos se propagan al **PaymentIntent** (para informes/reconciliación).
4. Confirma el pago vía el **webhook ya existente** (`checkout.session.completed` → `fulfillPayment`).

## Contexto verificado (cuenta Stripe Gestadia, test)

- **Lidia es la dueña del catálogo de Canje** en Stripe (productos con `lidia_catalog_code`, sincroniza live→test). El portal **reutiliza** su precio de Canje.
- Los otros 7 servicios se crearon como productos "portal" (`lookup_key = gestadia_portal_<slug>`).
- Lidia liga cada **Customer** de Stripe a Zoho: `external_id` (id de registro Zoho), `external_provider: zoho`, `lidia_contact_id`. Sus pagos usan Accounts v2/Connect (`customer_account`).
- El webhook `/webhooks/stripe` ya existe: valida firma, escucha `checkout.session.completed`, y usa `session.metadata.expedienteId` para llamar a `fulfillPayment`.
- El `User` del portal ya guarda `zohoContactId` (se rellena en `fulfillPayment` vía `upsertContact`).

## Decisiones acordadas

1. **Directo a Stripe** (no se llama a Lidia en runtime).
2. **Precio por `lookup_key`** desde el catálogo existente (canje = el de Lidia; 7 restantes = los del portal).
3. **Customer normal** de Stripe ligado a Zoho (`external_id`/`external_provider: zoho`) — **NO** Accounts v2 (más simple; suficiente).
4. **`metadata.canal = "web"`** + `nPedido` + `servicio` + `expedienteId`, propagados también al PaymentIntent.
5. Solo `canje-carnet` variante **1 categoría** (210 €); la de 2 categorías (240 €) no se ofrece en el portal.

## Diseño

### Catálogo: `lookup_key` por servicio

En `shared/servicios.js`, cada servicio gana `stripeLookupKey`:

| slug | stripeLookupKey |
|---|---|
| canje-carnet | `gestadia_canje_1_categoria_2026` |
| transferencia | `gestadia_portal_transferencia` |
| duplicado-carnet | `gestadia_portal_duplicado_carnet` |
| duplicado-datos | `gestadia_portal_duplicado_datos` |
| permiso-internacional | `gestadia_portal_permiso_internacional` |
| baja-vehiculo | `gestadia_portal_baja_vehiculo` |
| cancelacion-dominio | `gestadia_portal_cancelacion_dominio` |
| duplicado-circulacion | `gestadia_portal_duplicado_circulacion` |

Un helper resuelve `lookup_key → price id` en runtime (`stripe.prices.list({ lookup_keys, active:true, limit:1 })`), con caché en memoria para no repetir la llamada. Si el `lookup_key` no existe en Stripe → error controlado (no crear precio inline).

### Checkout Session (cuando Stripe activo)

En `backend/src/routes/checkout.js`, la rama Stripe pasa de `price_data` inline a:

```
const priceId = await resolvePrice(servicio.stripeLookupKey);   // vía lookup_key
const customer = await getOrCreateCustomer(user);               // Customer ligado a Zoho
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  payment_method_types: ['card', 'bizum'],
  customer: customer.id,
  line_items: [{ price: priceId, quantity: 1 }],
  metadata: { expedienteId, nPedido, servicio: servicio.slug, canal: 'web' },
  payment_intent_data: { metadata: { nPedido, servicio: servicio.slug, canal: 'web', expedienteId } },
  success_url: `${config.baseUrl}/gracias?pedido=${nPedido}`,
  cancel_url: `${config.baseUrl}/checkout?servicio=${servicio.slug}&cancelado=1`,
});
```

- `metadata.expedienteId` se mantiene (lo usa el webhook).
- `payment_intent_data.metadata` lleva `canal/nPedido/servicio` para que salgan en el **PaymentIntent** (informes).
- `success_url`/`cancel_url` pasan a las rutas reales de React (`/gracias`, `/checkout`), corrigiendo el `.html` legacy.
- El modo **demo** (sin `STRIPE_SECRET_KEY`) no cambia: sigue simulando el pago al instante.

### Checkout: teléfono obligatorio con prefijo internacional

- El **teléfono del checkout pasa a obligatorio** (para todos los servicios; es el móvil con el que se deduplica en Zoho). El backend (`/api/checkout`) valida su presencia.
- Lleva un **desplegable de prefijo de país** (código internacional, p.ej. `+34`, `+54`, `+51`, `+58`…) junto al número. Por defecto **+34** (los clientes de canje son extranjeros → el prefijo no siempre es español).
- Se guarda el número **completo internacional** (`+<prefijo><numero>`, p.ej. `+34600111222`) en `user.telefono`; así casa con la búsqueda por `Mobile` de Zoho/Lidia.
- Lista de prefijos en `shared/prefijos.js` (código + país).

### Contacto de Zoho: deduplicación por móvil + merge de huecos

`upsertContact(user)` (en `services/zoho.js`) cambia su lógica para alinearse con **Lidia** (que deduplica por móvil), evitando contactos duplicados entre el canal web y WhatsApp:

- **Busca por móvil** (`GET /crm/v6/Contacts/search?criteria=(Mobile:equals:<tel>)`). Como el **móvil es obligatorio en el checkout** con selector de prefijo (ver *Checkout: teléfono*), el teléfono ya viene en formato internacional (`+<prefijo><numero>`) y la búsqueda por móvil es siempre el camino.
- **Defensivo**: si por lo que sea faltara el móvil, cae a búsqueda por email; si tampoco hay coincidencia, **crea**.
- Si el contacto **existe** → **no se sobrescribe** nada ya relleno: solo se actualizan los campos que estén **vacíos** en Zoho (merge de huecos — nombre, apellidos, `N_de_documento`, `Tipo_de_documento`, etc.). Verificado que esos api_name existen y que el picklist `Tipo_de_documento` acepta `DNI/NIE/Pasaporte`.
- Si **no existe** → se crea (como hoy, con `trigger: ['workflow']`).
- El **trato (Deal) se crea siempre nuevo** por expediente (`createDealForExpediente`, sin cambios). Contacto existente + trámite nuevo = trato nuevo + relleno de huecos del contacto.

### Customer de Stripe ligado a Zoho

`getOrCreateCustomer(user)`:
- Busca un Customer por email (o guarda su id en el `User` — `stripeCustomerId String?`, migración additiva) y lo reutiliza.
- Metadata del Customer: `external_provider: 'zoho'`, `portal_user_id: <user.id>`, y `external_id: <user.zohoContactId>` **si ya se conoce**.
- Como `zohoContactId` se rellena en `fulfillPayment` (tras `upsertContact`), en ese punto se **actualiza** el Customer para fijar `external_id = zohoContactId` (así el cliente queda ligado a Zoho igual que en Lidia, aunque el contacto se cree tras el pago).

### Webhook (ya existe)

- `/webhooks/stripe` no cambia su lógica: `checkout.session.completed` → `session.metadata.expedienteId` → `fulfillPayment`.
- Requiere `STRIPE_WEBHOOK_SECRET`. En **local** se prueba con **Stripe CLI** (`stripe listen --forward-to localhost:3001/webhooks/stripe`), que da un `whsec_…`. En **producción**, un endpoint de webhook en el dashboard con el evento `checkout.session.completed`.

### Configuración / entorno

- `backend/.env`: `STRIPE_SECRET_KEY=sk_test_…` (test primero) y `STRIPE_WEBHOOK_SECRET=whsec_…`. Los añade el usuario (nunca en el repo). Con `STRIPE_SECRET_KEY` presente, `config.stripe.enabled` pasa a true.

## No-alcance

- **Accounts v2 / Connect** (como usa Lidia): no se replica; Customer normal.
- **Llamar a Lidia** en runtime: no.
- **Canal WhatsApp**: fuera; si en el futuro se quiere filtrar web vs WhatsApp con la misma clave, Lidia debería añadir `canal: whatsapp` a sus pagos (hoy se distinguen por `catalog_code`/`payment_operation_id`).
- Cambiar el flujo de las fichas del front → pago (sigue previsto aparte).

## Tests

- **shared:** cada servicio tiene `stripeLookupKey` (8/8); `canje-carnet` = `gestadia_canje_1_categoria_2026`.
- **backend (sin red real):** `resolvePrice` y `getOrCreateCustomer` con el cliente de Stripe **mockeado** (`mock.module`), verificando que la sesión se construye con `line_items[0].price`, `customer`, y `metadata.canal='web'`+`expedienteId`. El modo demo sigue verde.
- **backend (Zoho mockeado):** `upsertContact` busca por `Mobile` (no email); con contacto existente solo escribe los campos **vacíos** (no pisa los rellenos); si no hay móvil, cae a email; si no hay coincidencia, crea.
- **Verificación manual (test):** con `STRIPE_SECRET_KEY` de test + Stripe CLI, un checkout real genera la sesión, se paga con tarjeta de prueba, el webhook marca el expediente pagado, y en Stripe el pago tiene `metadata.canal=web` y el Customer queda con `external_provider=zoho`.

## Definition of Done

- [ ] `shared/servicios.js`: `stripeLookupKey` en los 8 servicios; test en verde.
- [ ] Migración additiva `User.stripeCustomerId`.
- [ ] `checkout.js`: rama Stripe usa `price` por `lookup_key`, `customer` ligado a Zoho, `metadata` (canal/nPedido/servicio/expedienteId) + `payment_intent_data.metadata`, y `success/cancel` a rutas React. Modo demo intacto.
- [ ] Checkout: teléfono **obligatorio** con **selector de prefijo**; se guarda el número internacional completo; backend valida su presencia.
- [ ] `upsertContact` deduplica por móvil (fallback email), hace merge de huecos y no pisa campos rellenos; el trato se sigue creando nuevo por expediente.
- [ ] `fulfillPayment` actualiza el Customer con `external_id = zohoContactId`.
- [ ] Webhook sin cambios de lógica; documentado el uso de Stripe CLI en local.
- [ ] Con claves de test: enlace generado, pago de prueba, webhook OK, `metadata.canal=web` en el PaymentIntent.

## Relacionado
- Mapeo servicio→precio Stripe (en memoria del proyecto: `stripe-catalogo-servicios`).
- Fuente única de servicios: [`2026-07-14-fuente-unica-servicios-design.md`](2026-07-14-fuente-unica-servicios-design.md)
