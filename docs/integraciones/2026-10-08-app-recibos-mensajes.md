> Contrato compartido aceptado por Portal/LidIA, copia del commit 516a31c6d y PR [1619](https://github.com/enmarkados/Gestadia_LidIA/pull/1619). Los enlaces al código LidIA pertenecen al repositorio proveedor. Implementación aislada autorizada; la activación de producción se comprueba y decide por separado.

# Adenda APP: recibos de mensajes y ticks reales

Fecha: 08/10/2026. **Estado: contrato aceptado por escrito por Portal y LidIA el08/10; implementación/migración/activación pendientes.** Nomenclatura: [GLOSARIO](../../GLOSARIO.md#appmessagereceipt). Base de código comprobada: DEV27b2b810b, runtime GestadiaV1.713. La petición comunicada por Portal es proyectar ticks reales en chat y Mensajes, sin inferir lectura por polling o HTTP200.

## Hechos comprobados

- AppTimelineMessage almacena Id, ConversationId, Sequence, OccurredAtUtc, Role, Text, visibilidad/caso, presentación y OperationId. No tiene entrega/lectura por mensaje.
- Timeline1.0 devuelve message_id/sequence/occurred_at/role/text/presentation. Sus recibos accepted/processing/completed/failed/outcome_unknown describen el trabajo del turno: completed no significa entregado ni leído. En el sondeo result.message_ids contiene respuestas assistant, no el ID del mensaje user.
- AppSupportService.ReadAsync sólo consulta; el DTO interno de operador no incluye ID/sequence. AppAttention hace polling y renderiza el historial, sin acuse de visibilidad del navegador.
- Los esquemas Timeline/Receipt1.0 tienen additionalProperties=false. Añadir campos silenciosamente rompería clientes estrictos. Se conserva íntegro el contrato previo.

Fuentes: [entidades](../../LidIA.ChatAgent/Models/AppConversations/AppConversationEntities.cs), [timeline](../../LidIA.ChatAgent/Services/AppConversations/AppTimelineService.cs), [turnos](../../LidIA.ChatAgent/Services/AppConversations/AppTurnService.cs), [worker](../../LidIA.ChatAgent/Services/AppConversations/AppTurnWorker.cs), [atención](../../LidIA.ChatAgent/Services/AppConversations/AppSupportService.cs), [panel](../../LidIA.ChatAgent/Components/Pages/Admin/Support/AppAttention.razor), [esquemas1.0](fixtures/app-v1-dtos.schema.json).

## Decisión propuesta y semántica

Endpoints separados bajo /api/integrations/lidia/app/v1. Mantener timeline/turnos/recibos1.0 y firma existente. La adenda tiene schema_version1.0 propio. No se modifican grants ni instrucciones/agentes/WhatsApp.

| Estado de mensaje | Evidencia y tick propuesto |
|---|---|
| sent | Mensaje persistido en LidIA y confirmado por un resultado durable. Un tick gris: Enviado a Gestadia. El estado optimista pendiente/error pertenece a Portal y no acredita persistencia LidIA. |
| received | Acuse explícito del destinatario, persistido en LidIA. Dos ticks grises, con texto según received_by. No basta el GET de Portal ni la entrega de HTTP200. |
| read | Acuse humano de burbuja visible, persistido en LidIA. Dos ticks azules, con texto según read_by. Implica received si no existía. |

| role del mensaje | Quién confirma recepción | Quién confirma lectura |
|---|---|---|
| user, sondeo IA | agent cuando el runner haya retornado con éxito y la publicación siga autorizada: Recibido por LidIA. Claim/processing no basta. | La IA nunca confirma read. Si posteriormente un operador autorizado visualiza ese mensaje, puede acreditar read_by=operator. completed continúa siendo sólo procesamiento. |
| user, atención humana | operator mediante acuse del navegador que recibió ese mensaje y mantiene acceso. | operator, después de visibilidad efectiva de la burbuja. No exige ni implica tomar la atención. |
| assistant u operator | account: APP autenticada recibe y acepta el mensaje en su estado cliente; Portal transmite ese acuse. | account: conversación activa, documento/app visible, foco de conversación vigente y burbuja intersectando el área visible del historial. |
| event | No tiene ticks ni recibos de destinatario. | No tiene ACK. |

received_by conserva el primer destinatario efectivo (agent/operator/account); read_by sólo operator/account. No se publica identidad individual del operador, tokens ni asignaciones internas. Leído por equipo autorizado no significa tomado, resuelto ni contestado por el comercial concreto. null significa ausencia de evidencia, no que sepamos que el mensaje no se ha recibido/leído. Primeras fechas UTC de cada transición conservadas; las fechas las fija LidIA al persistir el acuse. Reflejan el acuse recibido por servidor, no una hora de dispositivo.

No fabricar recibos históricos a partir de completed, SupportTakenAt, polling ni la apertura de Mensajes. Un mensaje histórico existente acredita sent; received_at/read_at permanecen null hasta evidencia nueva. Las lecturas en otro dispositivo actualizan el mismo recibo de la cuenta, conservando el historial y la ChatSession.

## GET de estado y recuperación

GET /sessions/{conversationId}/message-receipts?message_ids={id1,id2,...}, ?turn_id={turnId} o ?summary=true. Se admite exactamente una de estas consultas, sin duplicados de query ni parámetros desconocidos. message_ids: 1–50 IDs distintos en lista separada por comas; el alfabeto opaco vigente no admite coma. turn_id: UUID canónico del turno, resuelve sus mensajes visibles (incluido user), sin usar result.message_ids como ID user.

Respuesta200 para message_ids/turn_id: snapshot completo de los IDs pedidos, ordenado por sequence, sin paginación ni cambios de estado por el GET. Campos exteriores schema_version, conversation_id, message_receipts_revision, items. Cada item: message_id, sequence, turn_id nullable, role user/assistant/operator, stored_at, delivery_status, received_at nullable, received_by nullable, read_at nullable, read_by nullable, receipt_revision. Revisiones/sequence son strings decimales canónicos comparables como enteros de64bits, nunca Number JS. stored_at reutiliza la fecha de creación registrada con el mensaje persistido, sin afirmar el instante físico exacto de commit.

Modo summary=true: consulta acotada al último mensaje durable **visible y autorizado** de esa conversación (orden Sequence desc, un único registro). Respuesta estricta propia: schema_version, conversation_id, message_receipts_revision y last_message nullable. Si existe: message_id, sequence, role, text y occurred_at originales, más receipt con el mismo item de estado definido arriba; event usa receipt=null. Si no hay mensaje visible, last_message=null. No se usa el último mensaje privado/global para el resumen, no se descarga el historial ni se modifica ningún acuse/revisión. Mensajes pinta tick sólo si el último mensaje es saliente de la cuenta (role=user); no reescribe texto/fecha. Un cambio que no afecte al último mensaje no exige descargar contenido histórico. Identificar message_id impide asociar el tick a otro mensaje cuando llegue uno nuevo.

El consumidor solicita estados también para mensajes ya descargados; el último mensaje de cada tarjeta de Mensajes se obtiene mediante summary=true. Un cursor de timeline avanzado o items=[] no silencia un cambio de recibo. Para recuperar historia: paginar timeline1.0 y consultar IDs de cada página; para un turno pendiente/perdido: consultar turn_id, conservar siempre su ID/key. No existe watermark de lectura; message_receipts_revision es una revisión, no una credencial ni un checkpoint de mensajes vistos. No sirve para omitir arbitrariamente IDs.

Ejemplo ilustrativo, mensaje operador con entrega y lectura confirmadas por cuenta:

```json
{"schema_version":"1.0","conversation_id":"22222222-2222-4222-8222-222222222222","message_receipts_revision":"7","items":[{"message_id":"33333333-3333-4333-8333-333333333333","sequence":"12","turn_id":null,"role":"operator","stored_at":"2026-10-08T10:00:00.000Z","delivery_status":"read","received_at":"2026-10-08T10:00:01.000Z","received_by":"account","read_at":"2026-10-08T10:00:02.000Z","read_by":"account","receipt_revision":"3"}]}
```

## POST de acuses

POST /sessions/{conversationId}/message-receipts. Cabecera **Idempotency-Key obligatoria**, 16–128 caracteres de `[A-Za-z0-9._:-]`, como el IDEM existente. Portal conserva key+ack_id+cuerpo para todos los reintentos y la recuperación tras pérdida HTTP; rotar la clave de firma no cambia esa identidad. La firma canónica sigue incluyendo la cabecera IDEM exactamente como antes. GET no admite esta cabecera. Cuerpo estricto:

```json
{"schema_version":"1.0","ack_id":"44444444-4444-4444-8444-444444444444","state":"read","message_ids":["33333333-3333-4333-8333-333333333333"],"correlation_id":"app-read-01"}
```

state=received|read; message_ids 1–50 únicos, ack_id UUID canónico. No actor, portal_user_id adicional, operador, departamento, teléfono, visitorId, cursor de lectura ni hora cliente. El sujeto ya está atestado en la firma S2S. Este POST sólo permite a account acreditar mensajes assistant/operator. Intentar acreditar los propios mensajes user o eventos falla403. El panel usa el mismo servicio con su operador autenticado y sólo acredita user; el motor acredita recepción agent mediante una llamada interna acotada, nunca mediante este POST.

Respuesta200 después del commit: schema_version, conversation_id, ack_id, acked_at (primera persistencia de esa operación), duplicate, message_receipts_revision, items (mismo snapshot de estado actual que GET para esos IDs). No se responde202 ni se invoca modelo/worker de conversación para un ACK. read crea received si faltaba; received posterior a read no degrada estado ni fechas. Un ACK válido sin transición mantiene revisiones y fechas del mensaje. Sólo cambios efectivos de recibo incrementan receipt_revision y MessageReceiptsRevision; no invalidan presentaciones ni modifican ContextRevision/StateRevision, last_message_at, sondeo o soporte.

Namespace idempotente: integración estable+sujeto+operación message_receipt_ack+conversación+key, y unicidad ack_id en ese scope. Misma key o ack_id con semántica diferente:409 idempotency_conflict. Mismo ack bajo otra key o clave de firma rotada recupera operación, duplicate=true, sin transición duplicada. La huella usa state+IDs ordenados+ack_id+correlation_id+schema, excluye firma/key/nonce/tiempo de transporte. Repetición y concurrencia reautorizan contra primaria y devuelven estado actual, no el snapshot antiguo del ACK. La APP fusiona por receipt_revision de cada message_id y nunca degrada estado/fechas; una revisión exterior más alta no autoriza sobrescribir otro mensaje con datos viejos.

## Autorización, retención y errores

Firma/raw-target/TLS/nonces y canonicalización vigentes, incluido digest vacío del GET. GET exige capability S2S app.timeline.read y permiso vigente history. POST exige capability existente app.turns.write y el mismo permiso history: un acuse es una escritura de destinatario más estrecha que enviar un turno, sin permisos nuevos ni ampliar grants. No exige sondeo ni send para confirmar una recepción del historial; una conversación cerrada puede recibir ACK si conserva autorización, sin reabrirse.

Se comprueba pertenencia cuenta/integración/proyecto/entorno, revocación actual y visibilidad/caso. Conversación ligada a caso exige también case_context vigente y vínculo no revocado, igual que el lookup de recibo de turno; el panel revalida su autoridad/asignación vigentes antes del ACK. No autoriza a visualizar contenido nuevo. Una petición mixta con ID desconocido/ajeno/no visible se rechaza íntegra, sin marcar sus otros mensajes:404 message_not_found. Cuenta/conversación ajena:404 conversation_not_found; permisos retirados, dirección incorrecta:403 capability_denied; cuerpo/query inválidos:400 invalid_request; servicio no disponible:503 runtime_unavailable. No revelar mensajes ajenos ni qué ID falló. Error con ProblemDetails1.0 sanitizado existente.

La marca de mensaje se retiene mientras se retenga el propio mensaje; sin job de purga nuevo. El ledger público del ACK conserva30d y su marca antirrepetición sigue la retención de la conversación: un retry retirado devuelve410 receipt_retired, sin reejecución. El lookup por turn_id conserva la política existente30d/410 y404 turn_not_found; después puede recuperarse el estado por message_id mientras el historial esté autorizado y retenido. No inventar leído en migración ni perder marcas al reinstalar APP o cambiar dispositivo.

## Reparto y aceptación

- LidIA: persistencia e índices/migración EF, transiciones/idempotencia/autoridad, GET/POST S2S, recepción efectiva del motor, DTO interno de operador con ID/sequence y ACK/ticks en Atención APP. Pruebas offline y rollback/versionado; publicación sólo después de validar y respaldar.
- Portal: proxy móvil autenticado, traducción de estados/IDs/errores sin inferencias, recuperación y mezcla monotónica, envío de ACK por burbujas efectivamente recibidas/visibles, mismas proyecciones en chat y Mensajes; listado sin ACK leído. APP oculta, cambio de conversación o respuesta obsoleta no pueden marcar read.
- Ambos: revisar este documento y registrar conformidad antes de producto. Fixtures estrictas positivas/negativas; tests de reversión/duplicados/rotación/cuenta/caso/scope/cerrada/concurrencia/IDs concretos/recuperación sin nuevos mensajes. UI real: persistido sin acuse, recibido sin burbuja visible, lectura efectiva operador/cliente, ACK duplicado/reintentado, historial parcialmente cargado sin watermark, cambio de chat/cuenta sin contaminar IDs, dos dispositivos y resumen/ticks del último mensaje saliente. No un arnés de conversaciones/modelo ni lecturas automáticas por polling.

**Conformidad LidIA:** aceptado este diseño y reparto. **Conformidad Portal:** confirmada por escrito tras releer5d81ad931; su única precisión adicional, Idempotency-Key obligatorio, queda incorporada aquí. Portal conserva summary con texto/fecha originales y event→receipt=null. Esta conformidad autoriza el trabajo coordinado según la instrucción previa del usuario; no acredita implementación, E2E o activación. No se atribuye al sondeo IA una lectura humana.


Esquema y fixtures estrictos compartidos: [JSON Schema](fixtures/app-message-receipts-v1.schema.json), [muestras positivas/negativas](fixtures/app-message-receipts-v1-samples.json). PostIdempotencyHeaders representa sólo el fragmento IDEM, no sustituye las cabeceras S2S existentes. Se validan offline; las relaciones entre IDs/revisiones de objetos y la autorización se verifican en tests del servicio, no se atribuyen al JSON Schema.
