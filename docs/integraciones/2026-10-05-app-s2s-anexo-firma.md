# APP S2S: representación firmada y vectores JS/.NET

05/10/2026. **Propuesta para O1/O3, pendiente de conformidad Portal.** No es un verificador desplegado. [Respuesta O1–O8](2026-10-05-respuesta-lidia-observaciones-o1-o8.md) · [Glosario](../../GLOSARIO.md).

## 1. Bytes de firma

TLS obligatorio. HMAC-SHA256 con secreto aleatorio de al menos 32 bytes, decodificado desde su formato de almacenamiento. No usar como clave los caracteres del hex/base64 del secreto. Firma hex lowercase de 64 caracteres y comparación constante.

Se firma UTF-8 de **once líneas**, separadas por LF (`0a`), sin BOM ni LF final:

```text
gestadia-app-s2s-v1
{audience}
{key_id}
{timestamp}
{nonce}
{METHOD}
{encoded_path}
{canonical_query}
{portal_user_id}
{idempotency_key}
{body_sha256}
```

`body_sha256` es SHA-256 hex lowercase de **los bytes HTTP recibidos**, antes de parsear JSON. GET exige cero bytes y su última línea es siempre `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. Su décima línea es vacía. Query ausente significa octava línea vacía. POST usa UTF-8 estricto, JSON sin BOM, sin compresión y máximo 32 KiB. Rechazar claves JSON repetidas, Unicode inválido y números fuera del esquema; no firmar el resultado de reserializar el body.

## 2. Cabeceras y destino

Cada cabecera debe tener **exactamente un valor**, sin concatenar duplicados. El adaptador obtiene los valores originales y rechaza duplicados aunque el framework los combine con comas. Nombres de cabecera HTTP insensibles a mayúsculas; valores sensibles a mayúsculas. No recortar espacios para hacer válido un valor que no cumple el formato.

| Cabecera | Formato del valor |
|---|---|
| `X-Gestadia-Key-Id` | `[A-Za-z0-9_-]{1,64}` |
| `X-Gestadia-Timestamp` | `[1-9][0-9]{9,11}`, Unix segundos; diferencia absoluta ≤300 segundos respecto al reloj UTC del receptor |
| `X-Gestadia-Nonce` | `[0-9a-f]{32}`, 16 bytes aleatorios nuevos en cada petición |
| `X-Gestadia-Subject` | UUID lowercase con guiones; exactamente `User.id` canónico Portal, igual al sujeto de ruta/body cuando exista |
| `X-Gestadia-Signature` | `app-v1=[0-9a-f]{64}` |
| `Idempotency-Key` | POST: `[A-Za-z0-9._:-]{16,128}`; GET: cabecera ausente, línea firmada vacía |

No CR/LF, controles, espacios ni valores vacíos en cabeceras requeridas. Un UUID identifica la cuenta dentro del scope; no concede permisos por sí solo.

La audiencia se obtiene de configuración, nunca de una cabecera elegida por el emisor: por ejemplo `lidia:gestadia:dev:app`. Cada receptor tiene una audiencia exacta y cada clave pertenece a **una integración durable** y a un sentido/protocolo. No compartir secretos DEV/PRO ni direcciones de firma.

| Flujo propuesto | Dominio primera línea | Audiencia de ejemplo DEV | Prefijo de firma |
|---|---|---|---|
| Portal → API conversacional LidIA | `gestadia-app-s2s-v1` | `lidia:gestadia:dev:app` | `app-v1=` |
| Portal → callback checkout APP LidIA | `gestadia-app-checkout-event-v1` | `lidia:gestadia:dev:checkout-events` | `app-checkout-v1=` |
| Adaptador CRM → inbox Portal | `gestadia-crm-event-v1` | `portal:gestadia:dev:crm-events` | `crm-v1=` |

Los dos últimos conservan el orden de once líneas pero emplean claves exclusivas y las rutas de sus contratos. Para CRM sin cuenta verificada la línea subject es vacía y la cabecera se omite; su credencial sólo admite eventos CRM, sin acceso conversacional. Callback APP conserva el subject y lleva `event_id` como clave idempotente. El contrato checkout **1.0 sigue usando su representación vigente**; estas reglas no lo alteran.

## 3. Ruta, query y proxy

Ruta APP ASCII exacta bajo `/api/integrations/lidia/app/v1`, ids públicos con caracteres `[A-Za-z0-9_-]` o UUID canónico. No barra final, doble barra, segmentos `.`/`..`, escapes en ids, barra escapada, backslash ni path Unicode. POST sin query. No redirecciones de API.

GET admite solamente `cursor`, `limit`, `turn_id`, una vez cada uno. Decodificar componentes una sola vez como UTF-8 estricto, sin la conversión de `+` a espacio del formulario; **literal `+` se rechaza**. Recodificar cada nombre/valor como RFC 3986: conservar `[A-Za-z0-9._~-]`, resto bytes UTF-8 `%HH` uppercase. Ordenar por nombre ASCII, unir `name=value` con `&`. Rechazar query que no coincida byte a byte con esta representación: escapes lowercase, escapes de caracteres no reservados y orden distinto no son representaciones válidas. Espacio se representa `%20`, signo `+` como `%2B`, `/` como `%2F`, `=` como `%3D`. Cursor opaco ASCII, hasta 2.048 caracteres decodificados; no interpretarlo como identidad. `limit` entero decimal canónico 1–100, sin ceros iniciales. `turn_id` UUID canónico.

`turn_id` no se combina con `cursor`/`limit` (modo de recibo exacto, O3). Firmar antes de pedir; reintento con nonce nuevo. El vector de cursor ilustra caracteres reservados; su validez criptográfica no acredita que sea un cursor emitido por el servidor.

El proxy debe conservar método, ruta escapada, query y body. El receptor usa el target real de la petición y una ruta base configurada; no usa `X-Forwarded-*` arbitrario para reconstruirlo. Si el proxy retira un prefijo, se fija y verifica esa transformación en ambos extremos antes del acuerdo. No se permite inferir el path público desde cabeceras no confiables. La prueba de despliegue debe demostrar equivalencia al pasar por el proxy real.

## 4. Replay, rotación e idempotencia

Orden propuesto: límites y formato → resolución clave/audiencia → firma/ventana → claim persistente nonce → autorización → DTO/idempotencia. Nonce único por `(key_id, nonce)`, TTL diez minutos desde primera admisión; una colisión devuelve 401. Invalidación de claves y permisos sigue O2. Tiempo/firma/nonce nuevos en cada reintento, también al rotar.

**La rotación conserva `integration_id` y su scope.** La tabla de claves sólo referencia esa identidad; nunca sustituye la identidad por `key_id`. Idempotencia: `(integration_id, subject, operation, conversation_id o vacío en inicio, Idempotency-Key)`. Además, unicidad de `turn_id` en integración/sujeto/conversación. Un turno idéntico con otra key devuelve el recibo original; un payload distinto con el mismo turno devuelve 409. La huella del ledger conserva integración y no incluye la clave de firma.

Huella semántica: SHA-256 UTF-8 de JCS de `{"operation":…, "subject":…, "conversation_id":…, "dto":…}`. `dto` contiene los campos validados con significado de negocio, incluyendo versión, identidad atestiguada y referencias; excluye **sólo** `correlation_id`. No incorpora nonce, tiempo, firma, key id ni clave idempotente. Campos opcionales ausentes y `null` sólo son equivalentes si el esquema admite null y el normalizador los fija explícitamente a null; en inicio se fijan `resume_conversation_id`, `case_ref`, `client_key` a null. No trim, normalización NFC ni ordenación de arrays; fechas normalizadas a UTC con milisegundos antes de JCS; texto distinto produce hash distinto. JCS sigue [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785.html), preservando Unicode. Contadores largos e importes económicos se transmiten como strings decimales para evitar diferencias numéricas.

Misma huella + key recupera operación, incluso con key id nuevo. Huella distinta + misma key devuelve 409. Al retirar recibos, tombstones impiden repetir y devuelven 410; una key nueva no revive un `turn_id` o acción consumidos.

## 5. Vectores y alcance de comprobación

[Fixtures JSON](fixtures/app-s2s-v1-vectors.json) incluyen claves **públicas de prueba**, cuerpo en base64, target, representación canónica UTF-8, digest y firma esperados. Nunca usar esas claves en un entorno conectado. Fecha fija; evaluar la ventana con el reloj declarado del fixture, no con el reloj actual.

Vectores positivos: GET vacío sin query; GET cursor escapado; POST con tildes; mismo turno con nueva key id/nonce y misma huella semántica. Negativos: body modificado, digest vacío GET, cabeceras duplicadas, nonce reutilizado, fecha fuera de ventana, firma de otra audiencia, literal `+` y escape no canónico. Cada negativo indica rechazo esperado y precondiciones; nonce/rotación requieren un almacén y no se acreditan sólo ejecutando HMAC.

Núcleo JS (secreto en bytes, entradas desde fixture):

```js
import { createHash, createHmac } from 'node:crypto';
const digest = createHash('sha256').update(bodyBytes).digest('hex');
const canonical = [domain, audience, keyId, timestamp, nonce, method,
  encodedPath, canonicalQuery, subject, idempotencyKey, digest].join('\n');
const signature = createHmac('sha256', secretBytes)
  .update(Buffer.from(canonical, 'utf8')).digest('hex');
```

Núcleo .NET:

```csharp
var digest = Convert.ToHexString(SHA256.HashData(bodyBytes)).ToLowerInvariant();
var canonical = string.Join("\n", domain, audience, keyId, timestamp, nonce,
    method, encodedPath, canonicalQuery, subject, idempotencyKey, digest);
var signature = Convert.ToHexString(HMACSHA256.HashData(secretBytes,
    Encoding.UTF8.GetBytes(canonical))).ToLowerInvariant();
```

Estos núcleos reciben campos **ya validados**: no implementan el verificador, canonicalizador URI, JCS general ni gates distribuidos. La validación offline compara bytes/digest/HMAC en Node y .NET. Las negativas de protocolo quedan como criterios de aceptación para el futuro adaptador. La rotación de la huella se comprueba en fixtures; su recuperación entre nodos queda pendiente de implementación y prueba autorizada.
