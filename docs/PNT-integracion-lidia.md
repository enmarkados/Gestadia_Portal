# PNT — Integración LidIA ↔ Portal Gestadia (pago del canje por WhatsApp)

| | |
|---|---|
| **Código** | PNT-PORTAL-02 |
| **Versión** | 1.0 |
| **Fecha** | 2026-07-29 |
| **Sistema** | Portal de cliente Gestadia (gestadia.com) ↔ agente conversacional LidIA |
| **Contrato** | 1.0 (`docs/integraciones/2026-07-28-contrato-lidia-portal-v1-0.md`) |
| **Estado** | En producción — matriz de pruebas §14 superada salvo caso 20 (parcial) |

---

## 1. Objeto

Describir **cómo un cliente que conversa por WhatsApp con el agente de LidIA
acaba pagando en el portal**, qué hace cada sistema en ese recorrido, y cómo
se opera y diagnostica la integración.

## 2. Alcance

Aplica al servicio **Canje de Carnet Extranjero** (`canje_1_categoria`,
210,00 €) contratado a través del agente GestadIA de LidIA. No cubre la
contratación web directa (que sigue funcionando igual e independientemente),
ni otros servicios del catálogo (el mecanismo los admite, pero no están
habilitados en fase 1).

## 3. Responsables

- **LidIA:** conversación, cualificación, consentimiento, creación del
  Contacto y la Oportunidad en Zoho, generación del enlace y comunicación
  posterior al pago.
- **Portal Gestadia:** checkout, cobro, expediente, escritura del resultado
  económico en Zoho y notificación de eventos a LidIA.
- **Sistemas / soporte técnico:** despliegue, credenciales y diagnóstico.

## 4. Definiciones

- **Intent (`CheckoutIntent`):** "reserva" de un pago concreto. Contiene el
  servicio, el importe, los datos que LidIA recogió y los identificadores de
  correlación. Genera un enlace corto y tiene un estado.
- **Estados del intent:** `active` (emitido) → `opened` (el cliente abrió el
  enlace) → `paid` (pagado) · `expired` (caducó sin pagar) · `cancelled`
  (sustituido por una regeneración).
- **Outbox (`LidiaEvento`):** cola persistente de eventos que el portal debe
  entregar a LidIA. Garantiza que un fallo de red no pierda un aviso de pago.
- **Correcciones:** campos que el cliente cambió en el checkout respecto a lo
  que LidIA había recogido en la conversación.

---

## 5. Procedimiento A — Recorrido completo del cliente

1. **Conversación.** El cliente escribe por WhatsApp; el agente de LidIA lo
   cualifica, resuelve requisitos del canje y **le presenta el precio**.
2. **Confirmación.** El cliente confirma explícitamente que quiere pagar.
   LidIA verifica que existen Contacto y Oportunidad en Zoho.
3. **Solicitud del enlace.** La herramienta `generar_enlace_gestadia_portal`
   (exclusiva del agente de Gestadia) llama al portal, que crea el intent y
   devuelve un **enlace corto** `https://gestadia.com/c/<token>`.
4. **Envío.** El agente manda el enlace por WhatsApp.
5. **Checkout prellenado.** Al abrirlo, el cliente ve sus datos ya rellenos y
   un **aviso destacado** pidiéndole que los revise ("los hemos recogido en tu
   conversación de WhatsApp y pueden contener errores"). Este aviso existe
   porque la calidad del dato varía según el origen del lead.

   **Qué llega prellenado y qué no** (confirmado por LidIA el 2026-07-30 —
   el ejemplo del contrato induce a error en este punto):

   | Campo | ¿Lo envía LidIA? |
   |---|---|
   | nombre, apellidos, email | Sí, cuando consta en el contacto de Zoho |
   | tipo y nº de documento | Sí. `OTRO` para tipos que no están en nuestra lista (Carta Roja, Tarjeta de Residencia): en ese caso el selector queda **vacío y obligatorio**, para que el cliente elija en vez de asumir un "DNI" falso |
   | `pais_canje` | Sí, en ISO 3166-1 alfa-2. Si no corresponde a un país canjeable, no se prellena |
   | **dirección de envío** | **No, nunca.** El agente no la pregunta. La rellena siempre el cliente |
   | **`datos_pais`** (lugar de expedición, wilaya/daira) | **No.** Tampoco se pregunta en la conversación. El código lo soporta por si cambian de criterio, pero hoy no se activa |

   Ningún campo es obligatorio: el formulario tolera que falte cualquiera, y
   LidIA nunca envía cadenas vacías ni valores inventados.
6. **Revisión y pago.** El cliente corrige lo que haga falta, completa lo que
   falte (documento, dirección de envío), acepta las condiciones de
   contratación y paga con **tarjeta o Bizum**.
7. **Confirmación.** Aterriza en la página de gracias con su nº de pedido y
   recibe el email para crear su contraseña del área de cliente.
8. **Continuidad conversacional.** LidIA recibe el aviso de pago y su agente
   retoma la conversación por WhatsApp.

## 6. Procedimiento B — Qué hace el portal en cada paso

### 6.1. Al recibir la petición de enlace

`POST /api/integrations/lidia/checkout-intent` (autenticado por API key):

1. **Valida** versión de esquema, formatos (UUID, teléfono E.164, ISO 4217) y
   que los identificadores de Zoho sean utilizables.
2. **Comprueba el producto y el precio contra su propio catálogo.** El portal
   es la fuente de verdad del precio: si LidIA envía un importe distinto,
   responde `409` con el precio correcto y **no se crea nada**.
3. **Aplica idempotencia.** La misma `idempotency_key` devuelve siempre el
   mismo intent (`reused: true`); si llega con datos distintos, responde
   `409 idempotency_conflict`. Un corte de red no puede generar dos cobros.
4. **Crea el intent** con caducidad (7 días por defecto) y devuelve el enlace.

### 6.2. Al abrirse el enlace

`GET /api/checkout-intent/:token` (público): devuelve **solo** el prellenado
del formulario —nunca identificadores internos de Zoho o LidIA—, marca el
intent como `opened` y encola el evento `checkout.opened`.

### 6.3. Al completarse el pago

Tras el webhook de Stripe, el portal:

1. Marca el expediente como pagado, con su **método real** (tarjeta o Bizum) y
   la referencia del cobro.
2. **Actualiza la Oportunidad que LidIA ya había creado** — no crea una nueva:
   `Stage: Cerrado ganado`, `Pago_Confirmado`, fecha, método, referencia,
   nº de pedido, importe y fecha máxima de desistimiento. **No toca
   `Lead_Source`** (la atribución de campaña es de LidIA).
3. **Actualiza el Contacto solo con los campos permitidos** (nombre,
   apellidos, email, tipo y nº de documento). **Nunca el teléfono**: es la
   identidad de la conversación de WhatsApp.
4. Si la Oportunidad no se pudiera actualizar, **crea una nueva y deja nota**:
   un pago jamás queda sin reflejo en el CRM.
5. Crea la cuenta del cliente y envía el email de bienvenida.
6. Encola `payment.succeeded` para LidIA con el pedido, el importe, el método,
   la referencia de pago, los datos confirmados y la lista de correcciones.

### 6.4. Entrega de eventos a LidIA

Los eventos se firman (HMAC-SHA256 sobre el cuerpo exacto) y se entregan desde
una cola persistente con reintentos **1 min → 10 min → 1 h → 6 h → 24 h**.
Según la respuesta de LidIA: `2xx` entregado · `400`/`401` a revisión manual ·
`409` a reconciliación · `429`/`5xx`/red → reintento. Si se agotan, queda
registrado y se puede reenviar a mano.

Eventos: `checkout.opened`, `payment.succeeded`, `checkout.expired`.

---

## 7. Reparto de responsabilidades (resumen)

| Ámbito | LidIA | Portal |
|---|---|---|
| Conversación y consentimiento | ✅ | — |
| Contacto y Oportunidad en Zoho (pre-pago) | ✅ | — |
| Precio mostrado al cliente | Presenta | **Fuente de verdad** |
| Checkout, cobro y expediente | — | ✅ |
| Escritura económica en Zoho | — | ✅ (una sola vez) |
| `Lead_Source` y teléfono del contacto | ✅ (intactos) | Nunca los toca |
| Aviso al cliente tras pagar | ✅ | Email de bienvenida |

---

## 8. Operativa y mantenimiento

### 8.1. Variables de entorno (servidor)

| Variable | Para qué |
|---|---|
| `LIDIA_API_KEY` | Clave con la que LidIA nos llama. **Sin ella la integración está apagada** (todo responde `401`). |
| `LIDIA_CALLBACK_BASE_URL` | Base del endpoint de LidIA (la ruta la añade el portal). |
| `LIDIA_CALLBACK_SECRET` / `LIDIA_CALLBACK_KEY_VERSION` | Secreto y versión con que se firman los eventos. |
| `LIDIA_INTENT_TTL_DIAS` | Caducidad del enlace (7 por defecto). |
| `STRIPE_MODE` | `pro` = cobros reales · `dev` = claves de prueba. Ver §8.2. |
| `BASE_URL` | Debe ser `https://gestadia.com`: con ella se construyen los enlaces `/c/<token>`. |

### 8.2. Ventanas de prueba sin cobrar

El `.env` contiene **los dos juegos de claves de Stripe** (`STRIPE_*_DEV` y
`STRIPE_*_PRO`). Para probar sin cobrar basta con poner `STRIPE_MODE=dev` y
reiniciar la aplicación; al terminar, `STRIPE_MODE=pro`. No hay que
intercambiar claves ni tocar código.

Desde la raíz del repo, con un solo comando (edita el `.env` del servidor por
FTP y reinicia Passenger):

```
node stripe-mode.cjs          # consulta el modo actual
node stripe-mode.cjs dev      # abre ventana de pruebas
node stripe-mode.cjs pro      # vuelve a cobros reales
```

Comprobar siempre el efecto real, no solo el `/api/health`: iniciar un
checkout y mirar el prefijo de la sesión de Stripe — `cs_test_` en dev,
`cs_live_` en pro.

> ⚠️ Mientras el modo sea `dev`, **los clientes reales no pueden pagar**.
> Ventanas cortas y avisadas.
>
> ⚠️ Los identificadores de Stripe **no son intercambiables entre modos**: un
> cliente que pasó por una ventana de pruebas guarda un `stripeCustomerId` de
> test que no existe en producción. El portal lo detecta y crea uno nuevo
> automáticamente, pero conviene saberlo al interpretar los datos.

Existe un webhook de Stripe en modo test hacia `gestadia.com/webhooks/stripe`
ya creado y permanente, para que el circuito complete también en pruebas.

### 8.3. Despliegue

El servidor **no tiene shell**: se despliega por FTP (`node ftp-deploy.cjs`
tras `npm run build` del frontend) y se reinicia subiendo cualquier fichero a
`backend/tmp/restart.txt` (Passenger recarga en la siguiente petición).

> ⚠️ **El deploy por sí solo no aplica los cambios del backend**: Passenger
> mantiene el código anterior en memoria hasta que se toca `restart.txt`.
> Después de cada `ftp-deploy.cjs`, reiniciar siempre.

Si cambian las dependencias o el modelo de datos, el cliente de Prisma debe
regenerarse: se genera en local (el `schema.prisma` incluye el `binaryTarget`
de Linux del servidor) y se sube `backend/node_modules/.prisma/client`.

### 8.4. Comprobación rápida de salud

```
GET  https://gestadia.com/api/health                        → ok: true
POST https://gestadia.com/api/integrations/lidia/checkout-intent  (sin key) → 401
GET  https://gestadia.com/api/integrations/lidia/catalog     (con key) → 200 + producto activo
```

### 8.5. Diagnóstico habitual

| Síntoma | Causa probable | Solución |
|---|---|---|
| Todo responde `401` | Falta `LIDIA_API_KEY` en el servidor | Añadirla y reiniciar |
| `409 importe_no_coincide` | Se cambió el precio del catálogo y LidIA no lo sabe | LidIA sincroniza con `GET …/catalog`; el error trae el precio bueno |
| Eventos sin entregar | Cambió el secreto HMAC o el endpoint de LidIA | Actualizar `LIDIA_CALLBACK_*`, reiniciar y reenviar con `node scripts/lidia-replay.mjs <event_id>` |
| El pago no completa el circuito | El webhook de Stripe del modo activo no apunta al portal | Revisar el endpoint en el dashboard de Stripe del modo correspondiente |
| Enlaces `/c/…` rotos | `BASE_URL` mal configurada | Debe ser `https://gestadia.com` |

### 8.6. Reconciliación

Si LidIA no recibe un evento, puede consultar el estado real en cualquier
momento con `GET /api/integrations/lidia/checkout-intents/{id}` (autenticado),
que devuelve estado, nº de pedido, importe, método y fecha de pago.

---

## 9. Garantías acordadas con LidIA

- **La `idempotency_key` no caduca nunca.** Los intents no se purgan; un
  reintento tras un corte de red siempre devuelve el mismo intent.
- **El teléfono nunca se sobrescribe** en ningún sistema.
- **`Lead_Source` nunca se modifica.**
- **La escritura económica ocurre exactamente una vez.**
- Los cambios aditivos (campos o productos nuevos) son compatibles dentro de
  la versión 1.x; eliminar o cambiar el significado de un campo obligatorio
  exigiría una versión mayor.

## 10. Historial y trazabilidad

| Documento | Contenido |
|---|---|
| `docs/integraciones/2026-07-24-handoff-equipo-lidia.md` | Propuesta inicial |
| `docs/integraciones/2026-07-28-contrato-lidia-portal-v1-0.md` | **Contrato 1.0** (referencia normativa) |
| `docs/integraciones/2026-07-28-confirmacion-contrato-1-0.md` | Cierre del contrato |
| `docs/integraciones/2026-07-28-respuesta-catalogo-y-credenciales.md` | Endpoint de catálogo y credenciales |
| `docs/integraciones/2026-07-28-respuesta-4-confirmaciones.md` | Confirmaciones técnicas y registros de prueba |
| `docs/integraciones/2026-07-29-acta-matriz-s14.md` | **Acta de pruebas** |
| `docs/superpowers/specs/2026-07-24-integracion-lidia-checkout-design.md` | Diseño interno |
| `docs/superpowers/plans/2026-07-28-integracion-lidia-portal.md` | Plan de implementación |

## 11. Pendientes conocidos

1. **Caso 20 (aviso post-pago dentro de ventana):** requiere que LidIA genere
   un enlace desde una **conversación real** en su número piloto; los intents
   sintéticos no disparan mensajes porque no hay sesión viva que correlacionar.
2. **Fuera de ventana de 24 h de WhatsApp:** pendiente de la plantilla
   aprobada por Meta (de LidIA).
3. **`canje_2_categorias`:** definido en el contrato pero **inactivo** hasta
   que negocio publique su precio. Se activa marcándolo como activo en el
   catálogo de la integración.
4. **Prueba de cobro real:** pendiente de ejecutar (intent preparado); implica
   210 € reales y su posterior reembolso.
