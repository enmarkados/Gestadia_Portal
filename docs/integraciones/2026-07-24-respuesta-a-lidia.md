# Respuesta de Gestadia Portal al equipo LidIA — contrato cerrado

**Fecha:** 2026-07-24
**Referencia:** vuestra contestación al handoff
(`docs/integraciones/2026-07-24-handoff-equipo-lidia.md`)
**Estado:** ACORDADO salvo los flecos operativos del §4 — con esto cada equipo
puede empezar su parte.

Hola equipo,

Gracias por la revisión — aceptamos prácticamente todo lo que proponéis.
Resumen de lo acordado, los matices que introducimos y el reparto final.

## 1. Aceptado tal cual lo proponéis

- **Petición** con `schema_version`, `idempotency_key`, `lidia_payment_id`,
  `lidia_session_id`, `lidia_contact_id`, `lidia_agent_id`, `service`,
  `catalog_code`, teléfono E.164, prefill estructurado, `zoho_contact_id` y
  `zoho_deal_id`.
- **Idempotencia:** una misma `idempotency_key` devuelve el mismo checkout
  activo (`reused: true`), nunca genera enlaces nuevos.
- **Respuesta** con `checkout_intent_id`, `url`, `expires_at`, `status` y
  `reused`.
- **Endpoint de consulta de estado del intent** (autenticado) para
  reconciliación si un callback se retrasa o se pierde.
- **Callback** con `event_id` único, `event_type`
  (`payment.succeeded` | `checkout.opened` | `checkout.expired`),
  `occurred_at`, `checkout_intent_id`, `lidia_payment_id`, referencia de pedido
  (`n_pedido`), `amount_minor` (entero, céntimos), `currency`,
  `payment_method`, `datos_confirmados` y lista explícita de `correcciones`.
  Firma HMAC sobre el cuerpo exacto + cabeceras de timestamp y versión de
  clave. Vosotros lo procesáis de forma idempotente y devolvéis `2xx` también
  ante duplicados.
- **Reintentos:** cola persistente en nuestro lado con 5 intentos
  (1 min / 10 min / 1 h / 6 h / 24 h) y replay manual.
- **Caducidad configurable** (7 días por defecto). Un enlace caducado **no** se
  regenera ni se reenvía automáticamente: lo pedís vosotros cuando el usuario
  lo solicite o vuelva a confirmar.
- **Zoho, responsabilidad única:** vosotros creáis y mantenéis cualificación,
  Contacto y Oportunidad antes del pago; nosotros, como propietarios del
  checkout y del expediente, escribimos el resultado económico en la
  Oportunidad (`Stage`, `Pago_Confirmado`, `Fecha_de_pago`, método, `Ref_pago`,
  `N_Pedido`, `Amount`, fecha de desistimiento) sin tocar vuestro
  `Lead_Source`. Vosotros no repetís esa escritura.
- **Correcciones por lista permitida** (nombre, apellidos, email, documento).
  **El teléfono no se reemplaza automáticamente** en ningún lado: nosotros
  tampoco tocaremos `Mobile` en el Contacto de Zoho (es la identidad de la
  conversación de WhatsApp). Si el cliente corrigiera su teléfono en el
  checkout, os llegará en `datos_confirmados`/`correcciones` solo a título
  informativo.

## 2. Matices de nuestro lado

1. **Tool nueva dedicada, no modificar `generar_enlace_pago`.** Entendemos la
   propuesta de conectar internamente vuestra herramienta existente, pero como
   las tools sirven a varios agentes a la vez, preferimos no tocar una
   compartida: os pedimos **crear una herramienta nueva
   `generar_enlace_gestadia_portal`**, vinculada únicamente al agente dedicado
   de Gestadia, que replique los mismos controles que ya tenéis en
   `generar_enlace_pago` (conversación de WhatsApp real, precio presentado,
   confirmación explícita del usuario, sin operaciones duplicadas) y llame a
   nuestro `checkout-intent`. Así el contrato de pago de Gestadia evoluciona
   sin afectar al resto de agentes, y viceversa.
2. **`catalog_code` — fase 1 solo `canje_1_categoria`.** Nuestro catálogo hoy
   tiene el canje a **210,00 €** (una categoría; el price de Stripe ya es
   `gestadia_canje_1_categoria_2026`). `canje_2_categorias` aún no tiene precio
   definido de negocio: el contrato acepta el campo, pero de momento el Portal
   responderá `409 { "error": "catalog_code_no_disponible" }` a
   `canje_2_categorias`. Restringid la herramienta a 1 categoría en fase 1;
   cuando se publique el precio, activamos el código sin cambio de contrato.
3. **Validación de precio:** de acuerdo — validamos `importe`+`moneda` contra
   nuestro catálogo y rechazamos discrepancias con
   `409 { "error": "importe_no_coincide", "importe_catalogo": 21000 }`
   (en céntimos, como `amount_minor`). El precio que cobra Stripe es siempre el
   del catálogo del Portal.
4. **Regeneración tras caducidad:** misma `idempotency_key` → mismo intent con
   su `status` actual (aunque esté `caducado`, para que podáis saberlo). Para
   emitir un enlace nuevo tras caducidad, mandad **nueva `idempotency_key`
   con el mismo `lidia_payment_id`** (mantiene la correlación). Decidnos si os
   encaja esta semántica.
5. **Cualificación, requisitos, prioridad y datos de cita:** los aceptamos en
   un objeto `extra` de la petición; se persisten asociados al expediente y,
   si nos confirmáis que os es útil, los volcamos como nota en la Oportunidad.
   Pasadnos la estructura exacta que vais a mandar.

## 3. Reparto de trabajo definitivo

**LidIA:**

- Crear la herramienta **`generar_enlace_gestadia_portal`** en el agente
  dedicado de Gestadia y conectarla a `checkout-intent` con el payload
  acordado, replicando los controles de `generar_enlace_pago` (WhatsApp real,
  precio presentado, confirmación explícita, sin duplicados). La tool
  compartida no se modifica.
- Garantizar y persistir `zoho_contact_id` y `zoho_deal_id` antes de permitir
  el checkout (lo que comentabais de la conversión de Lead).
- Endpoint de callback: verificación de firma, procesado idempotente por
  `event_id`, `2xx` ante duplicados ya procesados.
- Regenerar enlaces solo a petición o reconfirmación del usuario (nueva
  `idempotency_key`).
- Actualizar vuestro estado local con `datos_confirmados`/`correcciones` tras
  `payment.succeeded`; comunicación posterior al pago con el cliente.
- No escribir los campos económicos en Zoho (los escribe el Portal).

**Portal Gestadia:**

- `POST /api/integrations/lidia/checkout-intent`: auth, `schema_version`,
  idempotencia, validación de `catalog_code` e importe contra catálogo.
- `GET` de consulta de estado del intent (autenticado).
- Enlace corto `/c/<token>`, checkout prellenado con aviso destacado de
  verificación de datos, caducidad configurable.
- Expediente con procedencia LidIA y metadatos de correlación.
- Escritura económica en la Oportunidad de Zoho y actualización del Contacto
  solo por lista permitida (sin teléfono).
- Emisor de callbacks firmados con cola persistente
  (1 min/10 min/1 h/6 h/24 h) y replay manual; eventos `payment.succeeded`,
  `checkout.opened` y `checkout.expired`.

## 4. Flecos operativos para arrancar

1. Intercambio de secretos por entorno (api key de la petición + secreto HMAC
   del callback, con versión de clave) por canal seguro.
2. URLs de vuestro callback en staging y producción.
3. Estructura exacta del objeto `extra` (cualificación/cita/prioridad).
4. Confirmación de la semántica de regeneración (§2.4) y de la creación de la
   tool dedicada `generar_enlace_gestadia_portal` (§2.1).
5. Volumen estimado de enlaces/día para dimensionar rate limits.
6. Ventana para la prueba punta a punta en staging.

Nosotros empezamos ya con nuestra parte — nada de la lista anterior nos
bloquea el desarrollo, solo el despliegue y las pruebas conjuntas.

— Equipo Portal Gestadia
