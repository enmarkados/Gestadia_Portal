# Contrato de integración LidIA - Gestadia Portal

> Documento recibido del equipo LidIA el 2026-07-28 (propuesta final de cierre).
> Se archiva verbatim como referencia de implementación. La confirmación de
> Portal está en `docs/integraciones/2026-07-28-confirmacion-contrato-1-0.md`.

## Checkout del servicio de canje

- **Versión del contrato:** 1.0
- **Fecha:** 2026-07-28
- **Estado:** propuesta final de cierre de LidIA, lista para confirmación de Portal
- **Equipos:** LidIA y Gestadia Portal

## 1. Objetivo y alcance

Este documento define el contrato entre LidIA y Gestadia Portal para crear,
consultar y reconciliar checkouts del servicio de canje.

El flujo cubre:

1. LidIA cualifica al cliente y confirma su intención de pago.
2. LidIA garantiza que existen un Contacto y una Oportunidad de Zoho
   verificados.
3. LidIA solicita a Portal un checkout.
4. Portal devuelve un enlace corto al checkout prellenado.
5. Portal procesa el pago, crea el expediente y escribe el resultado económico
   en Zoho.
6. Portal notifica a LidIA mediante callbacks firmados.
7. LidIA actualiza su estado local y comunica el resultado al cliente sin
   duplicar efectos.

Quedan fuera de la fase 1:

- El pago automático para más de una categoría.
- La modificación automática del teléfono de WhatsApp.
- La escritura por LidIA de los campos económicos que pertenecen a Portal.
- La regeneración o el reenvío automático de enlaces caducados.
- El volcado automático del objeto `extra` como nota en Zoho.

## 2. Reparto de responsabilidades

### 2.1. LidIA

LidIA es responsable de:

- La conversación, cualificación y consentimiento explícito del cliente.
- Presentar el precio antes de crear el checkout.
- Permitir el checkout únicamente desde una conversación real de WhatsApp.
- Garantizar y persistir `zoho_contact_id` y `zoho_deal_id` antes del pago.
- Crear una operación local idempotente y correlacionarla con Portal.
- Exponer al agente GestadIA la tool dedicada
  `generar_enlace_gestadia_portal`.
- Recibir, autenticar y procesar los callbacks de Portal.
- Actualizar su estado tipado y los datos locales permitidos.
- Comunicar el resultado al cliente sin duplicar mensajes.
- Respetar la ventana de servicio de WhatsApp. Fuera de la ventana se utilizará
  una plantilla aprobada o se esperará un nuevo mensaje del cliente.

LidIA no escribirá en Zoho los campos económicos gestionados por Portal.

### 2.2. Gestadia Portal

Portal es responsable de:

- Crear y mantener el checkout y su enlace corto.
- Validar el catálogo, el importe y la moneda.
- Procesar Stripe, Bizum u otros medios habilitados.
- Crear el expediente con procedencia LidIA.
- Escribir el resultado económico en la Oportunidad de Zoho.
- Aplicar al Contacto de Zoho únicamente las correcciones permitidas.
- Emitir callbacks firmados mediante una cola persistente.
- Permitir la consulta autenticada del estado del checkout.
- Conservar la trazabilidad entre checkout, expediente, pedido, Zoho y LidIA.

Portal no modificará `Lead_Source` ni el teléfono `Mobile` del Contacto.

## 3. Tool dedicada de LidIA

El agente GestadIA tendrá una tool externa dedicada:

```text
generar_enlace_gestadia_portal
```

La tool estará vinculada únicamente al agente dedicado de GestadIA.

La separación es externa. Internamente, la tool reutilizará el núcleo común de
pagos de LidIA para no duplicar:

- Autorización por proyecto y agente.
- Validación de conversación real de WhatsApp.
- Catálogo y precio oficial.
- Presentación previa del precio.
- Confirmación explícita posterior a la presentación.
- Estado tipado del pago.
- Idempotencia y prevención de operaciones duplicadas.
- Ledger y reconciliación.

El modelo solo podrá solicitar el `catalog_code`. Los identificadores, el
importe, la moneda, los datos del contacto, Zoho y la idempotencia se obtendrán
en el servidor desde estado verificado. El modelo no podrá elegir ni alterar
estos valores.

## 4. Catálogo de fase 1

La fase 1 solo permite:

| Campo | Valor |
| --- | --- |
| `service` | `canje-carnet` |
| `catalog_code` | `canje_1_categoria` |
| `amount_minor` | `21000` |
| `currency` | `EUR` |
| Caducidad por defecto | 7 días |

`canje_2_categorias` no está habilitado. Si Portal lo recibe, responderá:

```json
{
  "error": "catalog_code_no_disponible",
  "trace_id": "01K0EXAMPLETRACE"
}
```

con HTTP `409`.

Portal es la fuente de verdad final para el precio cobrado. Si el importe o la
moneda no coinciden con su catálogo, responderá HTTP `409`:

```json
{
  "error": "importe_no_coincide",
  "amount_minor_catalogo": 21000,
  "currency_catalogo": "EUR",
  "trace_id": "01K0EXAMPLETRACE"
}
```

## 5. Identificadores e idempotencia

### 5.1. Identificadores

Se distinguen dos niveles:

- `lidia_payment_id`: identifica el ciclo lógico de pago. Permanece estable
  durante una regeneración.
- `lidia_payment_attempt_id`: identifica un intento concreto y su enlace.
  Cambia al generar un checkout sucesor.

Cada intento también tiene:

- Una `idempotency_key` única y estable para todos sus reintentos técnicos.
- Un `checkout_intent_id` asignado por Portal.
- Opcionalmente, `replaces_checkout_intent_id` cuando sustituye a un checkout
  caducado.

Esta separación evita que un callback atrasado de un enlace anterior cambie el
estado del enlace activo.

### 5.2. Reglas de idempotencia

- Misma `idempotency_key` y mismo payload: Portal devuelve el mismo intent.
- Misma `idempotency_key` y payload diferente: Portal devuelve HTTP `409` con
  `idempotency_conflict`.
- Un reintento de red no crea un segundo checkout.
- Una regeneración crea una nueva `idempotency_key`, un nuevo
  `lidia_payment_attempt_id` y un nuevo `checkout_intent_id`.
- La regeneración conserva el mismo `lidia_payment_id`.
- Un enlace caducado solo se regenera tras petición o reconfirmación explícita
  del usuario.

## 6. Creación del checkout

### 6.1. Endpoint

```http
POST /api/integrations/lidia/checkout-intent
Content-Type: application/json
X-Api-Key: REDACTED
```

La clave será distinta por entorno y se intercambiará por un canal seguro.

### 6.2. Petición

```json
{
  "schema_version": "1.0",
  "idempotency_key": "6be7f522-1149-45a5-bbd0-58cf420e3d53",
  "lidia_payment_id": "b093ce58-8dc9-4c3e-b4c3-85851b24cf66",
  "lidia_payment_attempt_id": "ee151822-573c-42d6-8a0a-5fe80f0f0f36",
  "lidia_session_id": "184237",
  "lidia_contact_id": "9317",
  "lidia_agent_id": "178",
  "service": "canje-carnet",
  "catalog_code": "canje_1_categoria",
  "amount_minor": 21000,
  "currency": "EUR",
  "telefono": "+34600111222",
  "zoho_contact_id": "572576000012345678",
  "zoho_deal_id": "572576000087654321",
  "replaces_checkout_intent_id": null,
  "prefill": {
    "nombre": "Ana",
    "apellidos": "García López",
    "email": "ana@example.com",
    "tipo_documento": "NIE",
    "num_documento": "X1234567L",
    "pais_canje": "CO",
    "direccion": "Calle Ejemplo 10, Madrid"
  },
  "extra": {
    "qualification": {
      "result": "cualifica_completo",
      "priority": "muy_alta",
      "reason_code": null,
      "flags": [],
      "captured_at": "2026-07-28T10:30:00Z"
    },
    "requirements": {
      "issuing_country_code": "CO",
      "branch": "convenio",
      "modality": "canje_categoria_b"
    },
    "appointment": {
      "status": "committed",
      "requested_start": "2026-07-29T10:00:00+02:00",
      "timezone": "Europe/Madrid"
    },
    "zoho_persistence_revision": 2
  }
}
```

### 6.3. Campos obligatorios

Son obligatorios:

- `schema_version`
- `idempotency_key`
- `lidia_payment_id`
- `lidia_payment_attempt_id`
- `lidia_session_id`
- `lidia_contact_id`
- `lidia_agent_id`
- `service`
- `catalog_code`
- `amount_minor`
- `currency`
- `telefono`
- `zoho_contact_id`
- `zoho_deal_id`

`replaces_checkout_intent_id`, `prefill` y `extra` son opcionales.

Los identificadores se serializan como cadenas para no acoplar ambos sistemas
al tipo interno de su base de datos.

### 6.4. Formatos comunes

- `schema_version` vale exactamente `1.0` en esta versión.
- `idempotency_key`, `lidia_payment_id` y `lidia_payment_attempt_id` son UUID
  canónicos en minúsculas.
- Los demás identificadores son cadenas no vacías de hasta 128 caracteres.
- `telefono` utiliza formato E.164.
- `amount_minor` es un entero positivo expresado en la unidad mínima de la
  moneda.
- `currency` utiliza tres letras mayúsculas según ISO 4217.
- Los timestamps utilizan RFC 3339. Los eventos técnicos se expresan en UTC.
- Los códigos de país utilizan ISO 3166-1 alfa-2 en mayúsculas.
- `tipo_documento`, cuando exista, admite `DNI`, `NIE`, `PASAPORTE` u `OTRO`.
- `num_documento` admite hasta 64 caracteres y nunca se incluye completo en
  logs técnicos.

### 6.5. Valores permitidos de `extra`

`extra` es un objeto estructurado, versionado por `schema_version` y limitado a
información operativa. No admite objetos arbitrarios ni documentación adjunta.

#### `qualification.result`

- `cualifica_completo`
- `cualifica_parcial`
- `no_cumple_requisitos`
- `no_interesado`
- `silencio_total`

Solo se crea un checkout para `cualifica_completo`.

#### `qualification.priority`

- `muy_alta`
- `alta`
- `normal`

#### `requirements.branch`

- `convenio`
- `ue_eee`
- `omitida`

#### `requirements.modality`

En fase 1:

- `canje_categoria_b`

#### `appointment.status`

- `none`
- `proposed`
- `pending_commit`
- `committed`
- `conflict`

`reason_code` y `flags` se enviarán como códigos técnicos, no como texto libre.
Los catálogos de estos códigos evolucionarán de forma aditiva dentro de la
versión 1.x.

Los códigos usan minúsculas y `snake_case`, con una longitud máxima de 64
caracteres. `flags` admite como máximo 20 valores diferentes.

El precio no se duplica dentro de `extra`. Los datos personales y documentales
se envían únicamente en `prefill`.

### 6.6. Respuesta de creación

Portal responde HTTP `201` al crear y HTTP `200` al reutilizar:

```json
{
  "schema_version": "1.0",
  "checkout_intent_id": "gci_01K0ABCDEF123456",
  "lidia_payment_id": "b093ce58-8dc9-4c3e-b4c3-85851b24cf66",
  "lidia_payment_attempt_id": "ee151822-573c-42d6-8a0a-5fe80f0f0f36",
  "url": "https://portal.gestadia.example/c/C8xk2pQ",
  "expires_at": "2026-08-04T10:30:00Z",
  "status": "active",
  "reused": false
}
```

Estados del intent:

- `active`
- `opened`
- `paid`
- `expired`
- `cancelled`

## 7. Consulta y reconciliación

### 7.1. Endpoint

```http
GET /api/integrations/lidia/checkout-intents/{checkout_intent_id}
X-Api-Key: REDACTED
```

### 7.2. Respuesta

```json
{
  "schema_version": "1.0",
  "checkout_intent_id": "gci_01K0ABCDEF123456",
  "lidia_payment_id": "b093ce58-8dc9-4c3e-b4c3-85851b24cf66",
  "lidia_payment_attempt_id": "ee151822-573c-42d6-8a0a-5fe80f0f0f36",
  "status": "paid",
  "url": "https://portal.gestadia.example/c/C8xk2pQ",
  "expires_at": "2026-08-04T10:30:00Z",
  "n_pedido": "GES-2026-001234",
  "amount_minor": 21000,
  "currency": "EUR",
  "payment_method": "bizum",
  "paid_at": "2026-07-28T10:42:31Z",
  "updated_at": "2026-07-28T10:42:31Z"
}
```

Este endpoint es la fuente de reconciliación cuando un callback se retrasa, se
agota o llega fuera de orden.

## 8. Callback de Portal hacia LidIA

### 8.1. Ruta de LidIA

```http
POST /api/integrations/gestadia-portal/payment-events
Content-Type: application/json
X-Gestadia-Key-Id: v1
X-Gestadia-Timestamp: 1785235351
X-Gestadia-Signature: v1=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

La ruta relativa es fija. La URL base se configura por entorno y se comunica
por el canal operativo seguro antes de las pruebas.

### 8.2. Firma

La firma se calcula con HMAC-SHA256:

```text
signed_payload = X-Gestadia-Timestamp + "." + raw_body
signature = hex(HMAC-SHA256(secret, signed_payload))
```

Reglas:

- Se firma el cuerpo JSON exacto, antes de cualquier parseo o reformateo.
- `X-Gestadia-Timestamp` contiene segundos Unix en ASCII.
- La firma se codifica como 64 caracteres hexadecimales en minúsculas.
- LidIA compara la firma en tiempo constante.
- LidIA admite claves activas identificadas por `X-Gestadia-Key-Id`.
- El timestamp debe estar dentro de una tolerancia de 5 minutos.
- `event_id` impide el reprocesado aunque el evento se reenvíe.
- Los secretos son diferentes por entorno y no se guardan en el repositorio.

### 8.3. Eventos

Valores permitidos:

- `checkout.opened`
- `checkout.expired`
- `payment.succeeded`

### 8.4. Ejemplo `payment.succeeded`

```json
{
  "schema_version": "1.0",
  "event_id": "evt_01K0ABCDEFG12345",
  "event_type": "payment.succeeded",
  "occurred_at": "2026-07-28T10:42:31Z",
  "checkout_intent_id": "gci_01K0ABCDEF123456",
  "lidia_payment_id": "b093ce58-8dc9-4c3e-b4c3-85851b24cf66",
  "lidia_payment_attempt_id": "ee151822-573c-42d6-8a0a-5fe80f0f0f36",
  "lidia_session_id": "184237",
  "n_pedido": "GES-2026-001234",
  "status": "paid",
  "amount_minor": 21000,
  "currency": "EUR",
  "payment_method": "bizum",
  "datos_confirmados": {
    "nombre": "Ana",
    "apellidos": "García López",
    "email": "ana@example.com",
    "tipo_documento": "NIE",
    "num_documento": "X1234567L",
    "telefono": "+34600999888"
  },
  "correcciones": [
    {
      "campo": "email",
      "valor_confirmado": "ana@example.com"
    }
  ]
}
```

### 8.5. Procesamiento

LidIA:

1. Verifica headers, timestamp y firma sobre el cuerpo exacto.
2. Persiste el evento en un inbox duradero.
3. Si `event_id` ya existe, devuelve `2xx` sin repetir efectos.
4. Devuelve `2xx` después de aceptar durablemente el evento.
5. Procesa el evento de forma asíncrona e idempotente.
6. Correlaciona pago, intento, checkout y sesión.
7. Para `payment.succeeded`, verifica importe, moneda y estado antes de cerrar
   el pago.
8. Aplica únicamente correcciones permitidas.
9. Emite como máximo una comunicación posterior al pago.

`checkout.opened` actualiza métricas y estado, pero no genera por sí solo un
mensaje del agente.

`checkout.expired` marca ese intento como caducado. No invalida un intento
sucesor ni genera automáticamente otro enlace.

Un `payment.succeeded` de un intento anterior nunca se descarta sin
reconciliación: se consulta el intent en Portal y se bloquea cualquier segundo
cobro o cierre contradictorio.

### 8.6. Correcciones permitidas

Se aceptan:

- `nombre`
- `apellidos`
- `email`
- `tipo_documento`
- `num_documento`

El teléfono puede aparecer en `datos_confirmados` o `correcciones` con carácter
informativo, pero:

- LidIA no reasigna automáticamente el contacto de WhatsApp.
- Portal no modifica automáticamente `Mobile` en Zoho.
- Una discrepancia de teléfono queda registrada para revisión.

Los valores documentales y personales se redactan en logs técnicos.

## 9. Reintentos de callbacks

Portal utiliza una cola persistente con estos reintentos:

1. 1 minuto.
2. 10 minutos.
3. 1 hora.
4. 6 horas.
5. 24 horas.

Después conserva capacidad de replay manual.

Respuestas:

- `2xx`: evento aceptado o duplicado ya aceptado.
- `400`: payload inválido no reintentable.
- `401`: firma, clave o timestamp no válidos.
- `409`: conflicto semántico que requiere reconciliación.
- `429`: límite temporal; Portal debe reintentar.
- `5xx`: error temporal; Portal debe reintentar.

## 10. Zoho

### 10.1. Antes del pago

LidIA:

- Crea o actualiza la cualificación.
- Garantiza un Contacto y una Oportunidad sin duplicados.
- Verifica y persiste `zoho_contact_id` y `zoho_deal_id`.
- No permite checkout si cualquiera de los dos identificadores falta o no ha
  sido verificado.

### 10.2. Después del pago

Portal escribe en la Oportunidad:

- `Stage`
- `Pago_Confirmado`
- `Fecha_de_pago`
- Método de pago
- `Ref_pago`
- `N_Pedido`
- `Amount`
- Fecha de desistimiento

Portal preserva `Lead_Source`.

Portal puede actualizar en el Contacto los campos permitidos del apartado 8.6,
excepto el teléfono.

LidIA actualiza su ledger y estado local, pero no repite esas escrituras
económicas en Zoho.

### 10.3. Objeto `extra`

Portal persiste `extra` asociado al expediente. No lo vuelca automáticamente
como nota en la Oportunidad porque la cualificación ya está mantenida por
LidIA. Cualquier nota futura tendrá un formato funcional acordado y no será un
volcado del JSON completo.

## 11. Errores de la API de Portal

Formato:

```json
{
  "error": "codigo_estable",
  "message": "Descripción segura para diagnóstico",
  "trace_id": "01K0EXAMPLETRACE"
}
```

Códigos mínimos:

| HTTP | `error` | Significado |
| --- | --- | --- |
| 400 | `invalid_payload` | Payload inválido |
| 400 | `unsupported_schema_version` | Versión no soportada |
| 401 | `unauthorized` | API key no válida |
| 404 | `checkout_intent_not_found` | Intent inexistente |
| 409 | `idempotency_conflict` | Misma clave con payload distinto |
| 409 | `catalog_code_no_disponible` | Producto no habilitado |
| 409 | `importe_no_coincide` | Precio o moneda no coinciden |
| 409 | `zoho_reference_invalid` | Referencias Zoho no utilizables |
| 429 | `rate_limited` | Límite temporal |
| 500 | `internal_error` | Fallo temporal no detallado |

Las respuestas no exponen secretos, tokens de checkout, cuerpos de Stripe ni
datos personales completos.

## 12. Seguridad y operación

- API key de LidIA a Portal y secreto HMAC de Portal a LidIA son credenciales
  diferentes.
- Cada entorno utiliza credenciales independientes.
- La versión de clave permite rotación sin interrupción.
- Los secretos se almacenan en configuración segura, no en Git.
- Los logs redaccionan documentos, email, teléfono y dirección.
- El rate limit inicial recomendado es de 60 solicitudes por minuto y entorno,
  revisable con métricas reales.
- Las URLs base y los secretos se intercambian por canal seguro.
- La ruta de callback de LidIA es
  `/api/integrations/gestadia-portal/payment-events`.

## 13. Compatibilidad y versionado

- `schema_version` inicial: `1.0`.
- Los nuevos campos opcionales y los nuevos valores de catálogos se consideran
  cambios compatibles dentro de la versión 1.x.
- Eliminar, renombrar o cambiar el significado de un campo obligatorio
  requiere una nueva versión mayor.
- Ambos sistemas deben ignorar campos opcionales desconocidos.
- Ningún sistema debe aceptar una versión mayor que no soporte explícitamente.

## 14. Matriz mínima de pruebas conjuntas

Antes de producción se validarán en staging:

1. Creación correcta de checkout.
2. Reintento con la misma idempotency key y `reused: true`.
3. Conflicto por misma clave y payload distinto.
4. Rechazo de `canje_2_categorias`.
5. Rechazo de importe o moneda incorrectos.
6. Bloqueo cuando faltan IDs Zoho verificados.
7. Apertura del enlace.
8. Pago correcto con Stripe.
9. Pago correcto con Bizum, si está habilitado en staging.
10. Callback duplicado sin repetir efectos.
11. Callback con firma no válida.
12. Callback con timestamp fuera de ventana.
13. Callback atrasado de un intento sustituido.
14. Caducidad sin regeneración automática.
15. Regeneración tras reconfirmación del usuario.
16. Corrección permitida de email o documento.
17. Teléfono distinto sin reasignación de WhatsApp ni `Mobile`.
18. Actualización económica en Zoho exactamente una vez.
19. Reconciliación mediante `GET` tras simular pérdida del callback.
20. Comunicación posterior al pago dentro y fuera de la ventana de WhatsApp.

Las pruebas conversacionales de LidIA se ejecutarán turno a turno mediante
Playground o WhatsApp real, esperando cada respuesta antes de enviar el
siguiente turno.

## 15. Configuración previa a la prueba punta a punta

Antes de las pruebas conjuntas, ambos equipos intercambiarán:

- URL base de Portal para staging.
- URL base de Portal para producción.
- URL completa del callback de LidIA para cada entorno.
- API key de LidIA hacia Portal para cada entorno.
- Secreto HMAC y `key_id` de Portal hacia LidIA para cada entorno.
- Contacto y Oportunidad Zoho de prueba.
- Fecha de la ventana de prueba conjunta.

Estos valores son configuración operativa y no forman parte del contrato
versionado ni se publican en el repositorio.

## 16. Confirmación solicitada a Portal

LidIA da por aceptados los puntos funcionales enviados por Portal y confirma:

- La tool dedicada `generar_enlace_gestadia_portal`.
- El catálogo de fase 1 limitado a una categoría y 210 EUR.
- La validación de precio por Portal.
- La caducidad configurable y la regeneración solo bajo reconfirmación.
- El reparto de responsabilidades de Zoho.
- La lista permitida de correcciones.
- La cola de callbacks y sus reintentos.

Para declarar el contrato 1.0 como cerrado, Portal debe confirmar únicamente
que acepta:

1. `lidia_payment_id` estable para el ciclo lógico.
2. `lidia_payment_attempt_id` nuevo por cada enlace.
3. `replaces_checkout_intent_id` opcional en una regeneración.
4. La firma HMAC canónica definida en el apartado 8.2.

Con esa confirmación, ambos equipos pueden implementar contra este contrato sin
más decisiones funcionales pendientes.
