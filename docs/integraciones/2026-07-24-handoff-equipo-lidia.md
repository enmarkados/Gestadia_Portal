# Handoff — Integración LidIA ↔ Portal Gestadia (checkout de canje)

**Fecha:** 2026-07-24
**Estado:** PROPUESTA — pendiente de valoración por el equipo LidIA
**De:** Equipo Portal Gestadia
**Para:** Equipo LidIA

> Este documento es la propuesta de integración para que el agente conversacional
> de LidIA pueda enviar al cliente un enlace de pago del Portal Gestadia en el
> momento adecuado de la conversación de WhatsApp. **Nada de esto está
> implementado todavía**: leedlo, decidnos qué datos podéis/queréis mandar de
> más, qué no cubre, y con vuestra respuesta cerramos el contrato y repartimos
> el trabajo.

---

## 1. Contexto y objetivo

- El Portal Gestadia ya tiene un checkout online: el cliente rellena sus datos,
  acepta las condiciones de contratación y paga con tarjeta/Bizum (Stripe). Al
  confirmarse el pago se crea su expediente, su cuenta del portal y se
  sincroniza con Zoho CRM.
- Vuestro agente prospecciona al lead por WhatsApp, recoge los datos del canje
  y **ya convierte el lead a Contacto + Trato en Zoho** antes de llegar al pago.
- Objetivo: cuando el agente decida que toca pagar, que pueda **pedirnos un
  enlace de pago personalizado** con todo lo recogido, mandarlo por WhatsApp, y
  **enterarse cuando el cliente pague** para seguir la conversación.

## 2. Flujo propuesto (extremo a extremo)

```
LidIA (agente)                    Portal Gestadia                      Cliente
     │                                  │                                │
     │ 1. POST /api/integrations/lidia/checkout-intent                   │
     │    (datos recogidos + ids Zoho + ids LidIA)                       │
     │─────────────────────────────────>│                                │
     │ 2. { url: "https://…/c/aB3xK9…" }│                                │
     │<─────────────────────────────────│                                │
     │ 3. Agente envía el enlace por WhatsApp                            │
     │──────────────────────────────────────────────────────────────────>│
     │                                  │ 4. Cliente abre el enlace:     │
     │                                  │    checkout PRELLENADO con     │
     │                                  │    aviso "revisa tus datos"    │
     │                                  │<───────────────────────────────│
     │                                  │ 5. Cliente corrige lo que haga │
     │                                  │    falta, acepta condiciones   │
     │                                  │    y paga (Stripe)             │
     │                                  │ 6. Portal actualiza el Trato   │
     │                                  │    existente en Zoho (pago     │
     │                                  │    confirmado; no tocamos      │
     │                                  │    vuestro Lead_Source)        │
     │ 7. POST <vuestro endpoint de callback>                            │
     │    { session_id, evento: "pagado", datos confirmados… }           │
     │<─────────────────────────────────│                                │
     │ 8. El agente retoma la conversación por WhatsApp                  │
```

Puntos clave del diseño:

- **Enlace corto y tokenizado**, no una URL con los datos en parámetros: los
  datos personales no viajan en la URL de WhatsApp, el enlace no es manipulable
  y nos deja trazabilidad completa (emitido → abierto → pagado).
- **Los datos que nos mandéis se autorrellenan tal cual** en el formulario.
  Sabemos que según el origen (Facebook Ads suele venir bien; Gestadia Woztell
  a veces no) el nombre u otros datos pueden estar mal: por eso, cuando la
  procedencia es LidIA el checkout muestra un **aviso destacado pidiendo al
  cliente que revise sus datos con detenimiento** antes de pagar.
- **Lo que el cliente confirme en el checkout pasa a ser la fuente de verdad.**
  En el callback de pago os devolvemos los datos confirmados/corregidos para
  que el agente actualice su lado (y no siga llamando al cliente por un nombre
  equivocado).

## 3. Lo que os ofrecemos: emisión del enlace de pago

### `POST /api/integrations/lidia/checkout-intent`

- **Auth:** header `X-Api-Key: <clave compartida>` (una por entorno). TLS
  obligatorio. Podemos añadir firma HMAC del body si lo preferís.
- **Content-Type:** `application/json`

**Campos imprescindibles:**

| Campo | Tipo | Para qué |
|---|---|---|
| `servicio` | string | Slug del catálogo. Para el canje: `"canje-carnet"`. |
| `telefono` | string E.164 (`+34…`) | Identificador primario del cliente (su WhatsApp). |
| `lidia_session_id` | string | Vuestro id único de conversación. Es la clave de correlación: os lo devolvemos en el callback. |
| `zoho_contact_id` | string | Id del Contacto que ya habéis creado/convertido en Zoho. Evita duplicados en CRM. |
| `zoho_deal_id` | string | Id del Trato ya convertido. Al pagar **actualizamos ese trato** en lugar de crear otro. |

**Campos opcionales (prellenado — el cliente los verá y podrá corregirlos):**

| Campo | Tipo | Notas |
|---|---|---|
| `nombre`, `apellidos` | string | Los tratamos como provisionales (ver §2). |
| `email` | string | |
| `tipo_documento` | `"DNI" \| "NIE" \| "Pasaporte"` | |
| `num_documento` | string | |
| `pais_canje` | string | Clave normalizada de nuestro catálogo (Anexo A). Si mandáis texto libre intentamos mapearlo; si no matchea, el cliente lo elige en el checkout. |
| `datos_pais` | object | Campos extra según país (Anexo A), p. ej. `{ "wilaya": "…", "daira": "…" }` para Argelia. |
| `direccion` | object | Dirección de envío del permiso si ya la tenéis: `{ tipoVia, nombreVia, numero, codigoPostal, municipio, provincia, bloque }`. |

**Metadatos (opcionales pero recomendados):**

| Campo | Tipo | Para qué |
|---|---|---|
| `lidia_contact_id` | string | Vuestro id interno de contacto. |
| `lidia_agent_id` | string | Qué agente generó la venta (métricas de conversión por agente). |
| `extra` | object | Cajón libre: cualquier otro dato que queráis que persista asociado al expediente. **Decidnos qué os gustaría meter aquí.** |

**Respuesta `200`:**

```json
{
  "url": "https://<portal-gestadia>/c/aB3xK9f2…",
  "token": "aB3xK9f2…",
  "expires_at": "2026-07-31T12:00:00Z"
}
```

**Errores:** `401` api key inválida · `400` servicio desconocido o teléfono no
válido · `422` payload malformado. Cuerpo siempre `{ "error": "…" }`.

**Comportamiento del enlace:**

- Caducidad propuesta: **7 días** (¿os encaja?).
- Reutilizable hasta que se paga: si el cliente lo abre tres veces, las tres
  veces ve su checkout prellenado. Una vez pagado, redirige a la página de
  "gracias".
- Si caduca: el agente puede pedir otro con el mismo `POST` (mismo
  `lidia_session_id`; emitimos token nuevo y el anterior queda invalidado).

## 4. Lo que os pedimos que construyáis: callback de pago

Necesitamos que expongáis **un endpoint HTTP** al que avisaremos cuando pase
algo relevante con el enlace. Es lo que permite que el agente retome la
conversación en cuanto el cliente paga.

### `POST <vuestra URL de callback>`

- **Firma:** header `X-Gestadia-Signature: sha256=<HMAC-SHA256(body, secreto)>`
  con un secreto compartido que acordemos (distinto del api key del §3).
- **Reintentos:** si no respondéis `2xx`, reintentamos 3 veces con backoff
  (1 min / 10 min / 1 h). Si aun así falla, queda registrado en nuestro lado y
  como nota en el Trato de Zoho.

**Payload (evento `pagado`):**

```json
{
  "evento": "pagado",
  "lidia_session_id": "<el que nos mandasteis>",
  "n_pedido": "GST-202607-12345",
  "servicio": "canje-carnet",
  "importe": 129.0,
  "moneda": "EUR",
  "fecha_pago": "2026-07-24T18:32:10Z",
  "datos_confirmados": {
    "nombre": "…", "apellidos": "…", "email": "…",
    "telefono": "+34…", "tipo_documento": "DNI", "num_documento": "…",
    "pais_canje": "colombia"
  },
  "correcciones": ["nombre", "apellidos"]
}
```

`datos_confirmados` son los datos tal y como el cliente los dejó al pagar;
`correcciones` lista qué campos cambió respecto a lo que nos mandasteis (para
que sepáis qué actualizar en vuestro lado sin comparar todo).

**Otros eventos posibles (decidnos si los queréis):** `link_abierto` (el
cliente abrió el enlace pero aún no ha pagado) y `caducado` (venció sin pago).

## 5. Zoho: quién toca qué

- **Vosotros (ya lo hacéis):** conversión lead → Contacto + Trato. Los
  `Lead_Source` actuales (Gestadia Woztell, Facebook Ads) **no los tocamos**:
  la atribución de campaña se conserva intacta.
- **Nosotros, al confirmarse el pago,** sobre el `zoho_deal_id` que nos deis:
  `Stage → "Cerrado ganado"`, `Pago_Confirmado`, `Fecha_de_pago`,
  `M_todos_de_pago` (Stripe/Bizum), `Ref_pago`, `N_Pedido`, `Amount` y
  `Fecha_M_xima_para_Desistimiento`. En el Contacto actualizamos los datos
  identificativos con lo que el cliente confirmó (nombre, email, documento) y
  dejamos nota en el Trato con el antes/después si hubo correcciones.
- **Alternativa que también nos vale:** si preferís que Zoho lo actualicéis
  vosotros al recibir nuestro callback, nosotros no tocamos el Trato (solo
  registramos el pago en nuestro lado). Decidnos qué opción encaja mejor con
  vuestros workflows/blueprints de Zoho.

## 6. Preguntas abiertas (vuestra respuesta cierra el contrato)

1. En el momento del pago, ¿tenéis **siempre** `zoho_contact_id` y
   `zoho_deal_id` disponibles? ¿Hay casos donde aún no exista el trato?
2. ¿Qué campos del cliente tendréis siempre / a veces / nunca? ¿Alguna
   particularidad más de calidad de datos por origen (Facebook Ads vs Gestadia
   Woztell) que debamos saber?
3. País del permiso: ¿podéis mandar la clave normalizada (Anexo A) o preferís
   texto libre y lo mapeamos nosotros?
4. ¿URL de vuestro endpoint de callback (por entorno) y canal para intercambiar
   los dos secretos (api key + secreto HMAC)?
5. ¿Os valen los reintentos propuestos (3 con backoff)? ¿Queréis además los
   eventos `link_abierto` y `caducado`?
6. Caducidad del enlace: ¿7 días os encaja? ¿Qué hará el agente si caduca?
7. Zoho al pagar: ¿actualizamos nosotros el Trato (propuesta, §5) o preferís
   hacerlo vosotros al recibir el callback?
8. ¿Qué más datos os gustaría mandarnos en `extra` (se persisten asociados al
   expediente)? ¿Veis algo que esta propuesta no cubra?
9. Entornos: ¿tenéis staging/sandbox para probar punta a punta antes de
   producción? ¿Volumen estimado de enlaces/día (para dimensionar rate limits)?

## 7. Reparto de trabajo propuesto

| Tarea | Quién |
|---|---|
| Endpoint `checkout-intent` + tabla de intents + enlace corto `/c/:token` | Gestadia |
| Checkout prellenado + aviso destacado de verificación (procedencia LidIA) | Gestadia |
| Atribución de procedencia en expediente + metadata Stripe | Gestadia |
| Update del Trato/Contacto en Zoho al pagar (si se acuerda §5) | Gestadia |
| Emisor de callbacks firmados con reintentos | Gestadia |
| Llamar a `checkout-intent` en el momento adecuado de la conversación | LidIA |
| Enviar el enlace por WhatsApp y gestionar caducidad/reemisión | LidIA |
| Endpoint de callback (recibir `pagado`, retomar conversación) | LidIA |
| Actualizar sus datos internos con `datos_confirmados`/`correcciones` | LidIA |
| Intercambio de secretos y URLs por entorno | Ambos |

## Anexo A — Claves de país (`pais_canje`)

Con convenio: `andorra`, `argelia`*, `argentina`, `bolivia`*, `brasil`,
`chile`, `colombia`, `corea-del-sur`, `costa-rica`, `ecuador`, `el-salvador`,
`filipinas`, `georgia`, `guatemala`, `honduras`, `japon`,
`macedonia-del-norte`, `marruecos`, `moldavia`, `monaco`, `nicaragua`*,
`nueva-zelanda`, `panama`, `paraguay`, `peru`, `reino-unido`,
`republica-dominicana`*, `serbia`, `suiza`, `tunez`, `turquia`, `ucrania`,
`uruguay`.

UE/EEE: `alemania`, `austria`, `belgica`, `bulgaria`, `chipre`, `croacia`,
`dinamarca`, `eslovaquia`, `eslovenia`, `estonia`, `finlandia`, `francia`,
`grecia`, `hungria`, `irlanda`, `islandia`, `italia`, `letonia`,
`liechtenstein`, `lituania`, `luxemburgo`, `malta`, `noruega`, `paises-bajos`,
`polonia`, `portugal`, `republica-checa`, `rumania`, `suecia`.

\* Países con campos extra en `datos_pais`: `argelia` → `wilaya`, `daira` ·
`bolivia` → `lugar_expedicion` · `nicaragua` → `lugar_expedicion` ·
`republica-dominicana` → `lugar_expedicion`.

## Anexo B — Ejemplo completo de petición

```json
POST /api/integrations/lidia/checkout-intent
X-Api-Key: ********

{
  "servicio": "canje-carnet",
  "telefono": "+34600123456",
  "lidia_session_id": "sess_9f8a7b6c",
  "lidia_contact_id": "ct_44521",
  "lidia_agent_id": "agent_canje_01",
  "zoho_contact_id": "5725767000012345678",
  "zoho_deal_id": "5725767000087654321",
  "nombre": "Jhefersonn",
  "apellidos": "García",
  "email": "yefer.garcia@example.com",
  "tipo_documento": "NIE",
  "num_documento": "Y1234567Z",
  "pais_canje": "colombia",
  "extra": { "campania": "facebook-ads-julio" }
}
```

*(El nombre del ejemplo viene mal a propósito: ilustra el caso real de datos
provisionales — el cliente lo corregirá en el checkout y os llegará corregido
en `datos_confirmados`.)*
