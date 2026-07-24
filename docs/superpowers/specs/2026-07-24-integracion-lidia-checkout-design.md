# Diseño — Integración LidIA → checkout con procedencia (referrer)

**Fecha:** 2026-07-24
**Estado:** ANÁLISIS — bloqueado hasta recibir la respuesta del equipo LidIA al
handoff (`docs/integraciones/2026-07-24-handoff-equipo-lidia.md`). **No
implementar** hasta que confirmen el contrato; sus respuestas pueden alterar
campos y responsabilidades.

## Contexto

El equipo LidIA opera agentes conversacionales por WhatsApp. Cuando entra un
lead en Zoho, su agente lo prospecciona, recoge los datos del canje y **ya
convierte el lead a Contacto + Trato en Zoho**. Al llegar el momento de pagar,
el agente debe poder pedirnos un enlace de pago y enterarse del resultado para
seguir la conversación.

Hoy el portal no tiene concepto de procedencia en el checkout: `POST
/api/checkout` crea User + Expediente y lanza Stripe con `metadata.canal:
'web'` fijo; `fulfillPayment` siempre crea un Deal nuevo en Zoho
(`createDealForExpediente`) con `Lead_Source: 'Formulario web Gestadia'`.

## Decisiones tomadas (con el usuario)

1. **Aterrizaje:** el enlace abre nuestro checkout **prellenado**; el cliente
   revisa, acepta condiciones (requisito legal existente) y paga. No se salta
   el formulario.
2. **Datos de LidIA = provisionales.** Se autorrellenan todos los campos que
   manden, pero cuando la procedencia es `lidia` el checkout muestra un
   **aviso destacado pidiendo revisar los datos con detenimiento** (los leads
   de Facebook Ads suelen venir bien; los de Gestadia Woztell no siempre). Lo
   que el cliente confirma al pagar es la fuente de verdad.
3. **Callback a LidIA:** sí. Ellos exponen un endpoint; al confirmarse el pago
   les mandamos evento firmado con los datos confirmados y las correcciones.
4. **Alcance genérico:** el mecanismo acepta cualquier slug del catálogo;
   LidIA empezará con `canje-carnet`.
5. **Zoho:** LidIA ya convirtió Contacto + Trato → al pagar **actualizamos el
   Deal existente** (`zoho_deal_id`) en vez de crear otro, **sin tocar su
   `Lead_Source`** (Gestadia Woztell / Facebook Ads). Pendiente de confirmar
   con LidIA si prefieren actualizar ellos al recibir el callback (pregunta 7
   del handoff).

## Arquitectura

```
LidIA ──POST /api/integrations/lidia/checkout-intent──> backend
backend ── crea CheckoutIntent(token) ──> responde { url: /c/<token> }
cliente ── abre /c/<token> ──> frontend resuelve intent → CheckoutForm prellenado + aviso
cliente ── paga ──> POST /api/checkout (con token) → Expediente con procedencia
Stripe webhook ──> fulfillPayment → update Deal Zoho + callback firmado a LidIA
```

### Componentes

**1. Ruta de integración** — `backend/src/routes/integrations.js` (nueva):

- `POST /api/integrations/lidia/checkout-intent`: auth por header `X-Api-Key`
  contra `config.lidia.apiKey` (nueva sección de config por entorno), rate
  limit propio. Valida slug de servicio y teléfono E.164. Crea `CheckoutIntent`
  y devuelve `{ url, token, expires_at }`. Si llega un `lidia_session_id` que
  ya tiene intent activo sin pagar → invalida el anterior y emite token nuevo
  (reemisión por caducidad).
- `GET /api/checkout-intent/:token` (público): devuelve **solo** el prellenado
  (servicio + datos de formulario) y el flag `procedencia`. Nunca expone ids de
  Zoho/LidIA ni el estado interno. Token caducado/desconocido → `404`.

**2. Modelo `CheckoutIntent`** (Prisma, tabla nueva):

```prisma
model CheckoutIntent {
  id           String     @id @default(uuid())
  token        String     @unique          // opaco, crypto.randomBytes
  procedencia  String                       // 'lidia' (extensible)
  servicioSlug String
  prefill      Json                         // datos de formulario tal cual llegaron
  origenMeta   Json                         // lidia_session_id, lidia_contact_id, lidia_agent_id, zoho_contact_id, zoho_deal_id, extra
  estado       String     @default("emitido") // emitido | abierto | pagado | caducado | invalidado
  expiresAt    DateTime
  expedienteId String?                      // se enlaza al crear el expediente
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}
```

**3. Campos nuevos en `Expediente`:** `procedencia String @default("web")` y
`origenMeta Json?` (copia de la atribución del intent en el momento del pago).
El metadata de Stripe pasa de `canal: 'web'` fijo a `canal: procedencia`.

**4. Frontend:**

- Ruta nueva `/c/:token`: hace fetch del intent; si es válido monta la página
  de checkout del servicio con `CheckoutForm` prellenado; si no, redirige al
  checkout normal con un aviso suave ("el enlace ha caducado, puedes contratar
  igualmente").
- `CheckoutForm` acepta `prefill` y `procedencia` como props. Con
  `procedencia === 'lidia'` muestra un **banner destacado de verificación**
  ("Estos datos los hemos recogido en tu conversación de WhatsApp — revísalos
  con calma antes de pagar, sobre todo nombre y apellidos") encima del
  formulario. El submit incluye el `token` en el body de `postCheckout`.

**5. `POST /api/checkout` (cambio mínimo):** si llega `token` válido y no
pagado → el expediente se crea con `procedencia` y `origenMeta` del intent, el
intent pasa a `pagado` al confirmarse (vía `fulfillPayment`) y se enlaza
`expedienteId`. Sin token, todo sigue igual (`procedencia: 'web'`).

**6. `fulfillPayment` (cambios):**

- Con `procedencia === 'lidia'` y `zoho_deal_id` en `origenMeta`:
  - **No** llama a `createDealForExpediente`. Hace `PUT` al Deal existente:
    `Stage: 'Cerrado ganado'`, `Pago_Confirmado`, `Fecha_de_pago`,
    `M_todos_de_pago`, `Ref_pago`, `N_Pedido`, `Amount`,
    `Fecha_M_xima_para_Desistimiento`. No toca `Lead_Source`.
  - Contacto: enlaza `user.zohoContactId = zoho_contact_id` y actualiza los
    identificativos (First_Name, Last_Name, Email, documento) con los datos
    confirmados por el cliente (sobrescribe, no solo huecos — los datos de
    LidIA pueden venir mal). Si hubo correcciones, nota en el Deal con el
    antes/después.
  - **Fallback:** si el update del Deal falla o no hay `zoho_deal_id` →
    comportamiento actual (crear Deal) + nota indicando el problema. Un pago
    nunca se queda sin reflejo en CRM.
- Al final, encola el callback a LidIA.

**7. Callback saliente** — `backend/src/services/lidia.js` (nuevo):

- `POST` a `config.lidia.callbackUrl` con body del contrato del handoff
  (`evento: 'pagado'`, `lidia_session_id`, `n_pedido`, `datos_confirmados`,
  `correcciones`…), firmado `X-Gestadia-Signature: sha256=<HMAC(body, secreto)>`.
- Reintentos: 3 (1 min / 10 min / 1 h) — persistidos de forma simple (campo de
  estado + reintento en proceso; sin cola externa). Fallo definitivo → error en
  log + `addDealNote` en el Deal.
- Eventos `link_abierto` / `caducado`: solo si LidIA los pide (pregunta 5).

## Manejo de errores

- API key inválida → `401`; slug/teléfono inválidos → `400`; payload
  malformado → `422`. Siempre `{ error }`.
- Token caducado/inexistente en `/c/:token` → checkout normal + aviso suave.
- El intent es reutilizable hasta el pago; tras pagar, `/c/:token` redirige a
  la página de gracias del pedido.
- Todo fallo de Zoho o del callback es no-bloqueante para el pago (patrón
  actual de `fulfillPayment`).

## Testing

Siguiendo los patrones existentes (`frontend/src/pages/Checkout.test.jsx`,
tests de backend):

- Endpoint intent: auth, validación, emisión, reemisión (invalida el anterior),
  caducidad.
- `GET /api/checkout-intent/:token`: no filtra ids internos; 404 en caducado.
- Checkout con token: expediente con `procedencia`/`origenMeta`; sin token,
  comportamiento intacto (regresión).
- `fulfillPayment` con `zoho_deal_id`: update (no create), fallback a create si
  falla, sobrescritura del contacto, nota de correcciones.
- Firma HMAC del callback y reintentos.
- Frontend: `/c/:token` prellenado, banner de verificación visible solo con
  procedencia `lidia`, caducado → checkout normal.

## Dependencias abiertas (bloquean implementación)

Las 9 preguntas del handoff, en especial: disponibilidad garantizada de
`zoho_contact_id`/`zoho_deal_id` (Q1), quién actualiza Zoho al pagar (Q7),
contrato del callback y secretos (Q4/Q5), y campos `extra` que quieran
persistir (Q8). Cuando respondan: actualizar este spec, cerrar el contrato y
pasar a `superpowers:writing-plans` para el plan de implementación con el
reparto acordado.
