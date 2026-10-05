# Revisión Portal de la respuesta LidIA O1–O8

Fecha: 05/10/2026. Estado: **revisión documental favorable con cierres
propuestos y dependencias pendientes**. No aprueba el contrato conjunto ni
autoriza implementación, migraciones, pruebas conectadas, despliegue o canales.

La respuesta resuelve la ambigüedad de firma y precisa revocación,
recuperación/DTO y separación entre cobro, habilitación comercial y documentación.
Quedan decisiones de vínculo CRM, cardinalidad, semántica Zoho, checkout y
retención; el 119 y DEV siguen sin evidencia efectiva.

## 1. Importación y procedencia

Se importan sin modificar los cinco archivos recibidos de
`/Users/gonchumon/.codex/worktrees/1e4f/Gestadia_LidIA/docs/integraciones/`.
Su copia no convierte propuestas en capacidades implementadas.

| Archivo | SHA-256 de origen y copia |
|---|---|
| [Respuesta O1–O8](2026-10-05-respuesta-lidia-observaciones-o1-o8.md) | `5f2ca46b83c7c30f5bfea3f8de83193a3cbdede8a93bb382e09840aaf9be35a7` |
| [Anexo de firma](2026-10-05-app-s2s-anexo-firma.md) | `03d1af302652905bd3c497f2fb8c02ff02d64c4aa2deaaface1fd1d5e8c38d4c` |
| [Anexo DTO](2026-10-05-app-anexo-dtos.md) | `cf8b95e10f755ed13625a536f16009c810ca3bfdbe899c9fe1409e144b3241ac` |
| [Vectores de firma](fixtures/app-s2s-v1-vectors.json) | `d04984a2858679a0007b3c10644d80e11749736b18ec8e57c40740cf5bc4d280` |
| [JSON Schema](fixtures/app-v1-dtos.schema.json) | `71a20b747edf27eae3a5f28f43a69effeb67bcb7d177934d821aef16ac10f5d1` |

La respuesta declara lectura estática LidIA de `15828edb0` y Portal de
`c4bb747`. Esta revisión parte de Portal `app/main`,
`c4bb7472780cfda6575dbb7956886335358a0dc4`. No acredita el runtime servido.
[Glosario Portal](../../GLOSARIO.md).

Se conservan los enlaces originales: las referencias a glosario/código LidIA
deben interpretarse en el repositorio de origen. Los anexos y fixtures están
copiados con sus rutas relativas. La [revisión del 04/10](2026-10-04-observaciones-portal-contrato-app-lidia.md)
y los documentos recibidos permanecen intactos.

## 2. Dictamen por observación

| Punto | Valoración Portal | Límite del cierre |
|---|---|---|
| O1 Firma/rotación | Conforme documentalmente: digest GET, once líneas, query estricta, claves por dominio e integración durable. Cuatro vectores reproducidos | Verificador, proxy, replay distribuido y retiro de claves no probados; JCS general tampoco |
| O2 Revocación | Conforme con t0 autoritativo, bloqueo Portal inmediato, outbox y protección de workers; retirada CRM no expone historiales privados | 60 s desde commit LidIA; transporte Portal→LidIA aparte. ACK no acredita universalidad; medición posterior pendiente |
| O3 Recuperación/DTO | Conforme con lookup exacto de turno, revisiones y estado visible sin mensajes nuevos | Retención total y marcas de operaciones retiradas pendientes; R5 |
| O4 Identidad | Conforme con `User.id`, `Expediente.id` y autoridad Portal de pertenencia | DTO de `crm-links`, actualización y cardinalidad sin cerrar; R1/R2 |
| O5 Pago/ganado | Conforme con reconciliación única, evidencia separada, efectos semánticos y exclusión del fallback que crea otro trato | Diseño transaccional depende de R2; cobro posterior conserva su confirmación económica legítima |
| O6 Zoho | Favorable a una instantánea autenticada como propuesta v1 para evaluar estado vigente | Sustituye semántica de transición; necesita decisión negocio/CRM, R3 |
| O7 Checkout/atención | Conforme con callback de servicio, soporte en la misma sesión y denegación de Woztell | Solicitud/vínculo, preparación CRM y cuenta del proveedor sin consolidar, R1/R4; asignaciones reales pendientes |
| O8 Runtime/DEV | Conforme con matriz y separación de evidencias | 119, APP DEV y conexiones efectivas pendientes; no autoriza ensayos conectados |

## 3. Dependencias para consolidar el contrato

### R1. Vínculo CRM: cerrar la operación, no sólo reservar una ruta

`POST /subjects/{portalUserId}/crm-links` cubre una carencia real del primer
borrador: incluir el alias en `/sessions` no crea una asociación acreditada.
Su incorporación es favorable, pero falta request, respuesta, errores y
evidencia de pertenencia: emisor/scope, cuenta, expediente, organización,
contacto/trato/servicio, verificación, revisión e idempotencia.

Cerrar quién asigna/devuelve `client_key`, cómo se persiste el contexto y cómo
se rechazan revisiones antiguas, conflictos y enlaces revocados. Un retry no
concede otro ámbito ni reactiva permisos. Precisar cómo una conversación
gratuita recibe después contexto privado: conversación, permiso y revisión
acreditados en LidIA antes del checkout. Un callback económico no crea pertenencia.

Portal acredita/comunica el vínculo; LidIA valida/persiste scope y alias; CRM
confirma relaciones reales. Reactivación administrativa fuera de v1.

### R2. Cardinalidad y reapertura: decisión de negocio/CRM

El esquema actual no confirma «un trato → un expediente». Decidir canje v1 de
un servicio por trato o trato con líneas de servicio. La segunda opción exige
identidad estable de línea; no habilita todos los expedientes por ganar el
trato global. Después se fija la clave de negocio compartida por pago/CRM,
auditoría de duplicados y restricciones.

Reapertura/cancelación no borra cobros ni revoca automáticamente acceso;
cualquier suspensión comercial necesita regla y responsable explícitos.

### R3. Instantáneas Zoho: alternativa favorable, sin historial completo

`crm.deal.snapshot_observed.v1` es coherente para evaluar una etapa vigente
comprobada. Su hash identifica la instantánea y no ordena etapas. La
[documentación Get Records v8](https://www.zoho.com/crm/developer/docs/api/v8/get-records.html)
describe lectura de registros y ordenación por `Modified_Time`; esa operación
no documenta una secuencia exhaustiva de cambios. Es el límite de esa fuente,
no una afirmación de que Zoho carezca de otros mecanismos.

**Decisión necesaria:** si un trato pasa por ganado y vuelve a abierto antes
de leerlo, la instantánea puede no acreditar ese ganado transitorio. No
prometer captura de cada entrada a ganado/reapertura. Si negocio exige todas
las transiciones, CRM debe aportar una fuente ordenada y durable demostrada;
las instantáneas solas no cierran O6.

Para v1 de instantáneas: lectura autenticada, reconciliación serial por negocio,
etapa vigente y pertenencia comprobadas antes de habilitar; snapshots antiguos
como evidencia histórica. `processing_revision` es local. Fijar frecuencia de
reconciliación, fallo de lectura y antigüedad admisible en el contrato operativo.
No se crean jobs en esta revisión.

### R4. Checkout: preparación, solicitud y ámbito del pago

Contacto/Trato verificados y `case_ref` obligatorios **antes** del enlace APP
son una propuesta pendiente de acuerdo; no una dependencia del sondeo gratuito.
Cerrar cómo Portal/CRM localiza/reutiliza/crea y acredita esos registros con
permiso, y consolidar el DTO de solicitud junto con R1.

Si hace falta expediente previo al cobro para obtener `case_ref`, debe
crearse/reutilizarse como pendiente y conservar identidad al pagar o habilitar
por ganado. Existir no concede condición de cliente ni acceso de gestor. No
usar el estado documental como registro de cobro.

Persistir oferta/revisión, consentimiento auditable, intent y correlaciones en
ambos extremos antes del callback. Acordar naming único de origen: el borrador
tenía `origin_channel: APP`; la respuesta propone `origin=app`. La solicitud
no está definida en los JSON Schema recibidos.

**Precisión técnica pendiente:** O5 deduplica por proveedor, cuenta del
proveedor, entorno e id de pago. `CheckoutCallback` incluye proveedor/id/entorno,
pero no campo de cuenta del proveedor. Puede resolverse desde configuración
o contexto durable si se documenta y verifica esa asociación; de otro modo
debe añadirse al DTO. No deduplicar cuentas distintas como el mismo pago ni
inferir la cuenta sólo de un key id sujeto a rotación.

Conforme con conservar cobros auténticos bajo revocación y restringir su
exposición; callback a conversación cerrada no reactiva IA. La ingestión
económica usa identidad de servicio. Confirmar un cobro posterior a ganado es
un efecto legítimo distinto de la bienvenida, con identidad y entrega propias.

### R5. Retención y recuperación de operaciones retiradas

Aceptamos 30 días de detalle desde `accepted_at`, ledger no resuelto y marcas
que impiden repetir turnos/acciones. Falta política completa de historial,
cursores y marcas tras retirar una conversación; no fijamos un plazo legal.

Precisar la marca mínima de **creación de sesión**: su idempotencia se reclama
sin `conversation_id`. Después de retirar el historial, repetir aquel inicio
debe recuperar el resultado retirado, sin crear otra sesión por perder la
asociación key→conversación. Conservar sólo un id de conversación retirado no
describe cómo recuperar esa relación.

Para handoff, conservar key y recibo originales: se recuperan mediante retry
idempotente del POST, como propone la respuesta. No inventar un `turn_id` para
una operación con `turn_id: null` ni afirmar que el lookup de turno cubre todos
los tipos de operación.

## 4. Comprobación offline realizada y límites

- Cinco copias exactas, verificadas byte a byte y por SHA-256 del §1.
- Cuatro vectores positivos recalculados con Python estándar y Node
  `v24.19.0`: body/digest, once líneas, bytes UTF-8/base64 y HMAC coinciden.
  Los POST mantienen huella semántica al cambiar key id.
- En Node se reconstruyó la huella del DTO de texto del fixture, excluyendo
  `correlation_id`. No acredita JCS para DTO arbitrarios. El
  [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785.html#section-3.2.3) requiere
  ordenación recursiva de propiedades y conservar orden de arrays; queda para
  el canonicalizador futuro.
- JSON parseable: 24 objetos cerrados, 15 referencias locales resueltas,
  70 patrones compilados y tres ejemplos DTO parseables. No había validador
  JSON Schema 2020-12 disponible: **no se afirma validación completa del esquema
  ni de sus combinaciones semánticas**.
- Nueve negativos declarados; no ejecutados contra verificador APP, que no
  existe. Replay, cachés, revocación, cursores y gates no están acreditados.
- La comparación Node/.NET es evidencia declarada por LidIA. Portal no ejecutó
  .NET; su contraste independiente fue Python/Node.

Sin contactos a servicios de negocio, escrituras de BD/configuración ni código
de producto. Las fuentes públicas consultadas son documentación técnica y no
pruebas del runtime Gestadia.

## 5. Respuesta propuesta para continuar la coordinación

Conformes con las precisiones de firma, revocación y recuperación, y con el
reparto de responsabilidades. Los cuatro vectores coinciden en el contraste
independiente del Portal. Proponemos incorporar esos cierres al contrato,
separados de los criterios todavía no probados.

Antes de consolidarlo, cerrar R1–R5: DTO/contexto de vínculo, cardinalidad y
reapertura, instantáneas frente a todas las transiciones, solicitud de checkout
y cuenta del proveedor, y política de retirada. Después corresponde revisar
el documento conjunto y autorizar expresamente la fase de implementación o
pruebas correspondiente.

El 119 y aislamiento DEV siguen pendientes. No habilitar canales ni realizar
pruebas conectadas para resolver estos cierres documentales.
