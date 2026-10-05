# Adenda conversacional APP 1.1: contexto, autorización y recuperación

**05/10/2026. Propuesta consolidada por LidIA tras la revisión Portal; pendiente de conformidad conjunta.** La revisión de diseño no autoriza implementación, migraciones, despliegue, activación o pruebas conectadas.

Fuentes conservadas: [ajuste de alcance recibido por Portal](2026-10-05-ajuste-alcance-conversacional-app.md), SHA-256 `6b1608fb4bd4dc6102f00d38729e3d0562d002f0e416f0495120f8cbf70e7336`; [revisión Portal](2026-10-05-revision-portal-alcance-conversacional-app.md), copia exacta de su documento sincronizado en `app/main`, commit declarado `561fdd8ff48fbf1d0ab8dd7dfadd903dc0661d62`. [Glosario](../../GLOSARIO.md).

Los enlaces a código/glosario de la revisión copiada conservan su significado en el repositorio Portal; para esas fuentes usar [el documento en su checkout de origen](/Users/gonchumon/code/enmarkados/Gestadia_Portal/docs/integraciones/2026-10-05-revision-portal-alcance-conversacional-app.md). La copia no convierte esas referencias en evidencia de código LidIA.

**1.1 es la revisión de esta adenda documental**. Se mantiene la ruta API `/app/v1` y `schema_version="1.0"` de estos DTO todavía no implementados. Esta entrega añade archivos nuevos y no reescribe esquemas/vectores históricos. En contexto y reintentos prevalecen estas precisiones sobre la propuesta anterior. Se conservan [firma HTTP](2026-10-05-app-s2s-anexo-firma.md) y [timeline/recibos](2026-10-05-app-anexo-dtos.md) donde no se precise otra cosa.

## 1. Conformidad y evidencia de cuenta

Conformes con las cuatro observaciones Portal. `portal_user_id=User.id` sigue durable por integración y compartido Portal/APP. El contrato sólo cubre conversaciones de sondeo y comercial/gestor. Zoho, creación de cuentas/trámites, cobros y checkout siguen en la coordinación Gestadia/Zoho.

Aceptamos la limitación declarada por Portal: `emailVerified` por sí solo no permite reconstruir fecha/método ni acredita el gate activo/revocado propuesto. Portal conservará evidencia comprobable o completará nueva verificación antes de atestiguar cuenta. LidIA no requiere inventar fechas ni usar `createdAt`, login o un POST Zoho como verificación. `identity` conserva su esquema: email/invitation sólo cuando exista evidencia real. Otro método requiere acuerdo explícito, sin asumir que esté implementado.

Inicio gratuito y recuperación no requieren referencias CRM ni asignaciones. Atención gestor exige caso perteneciente a cuenta y asignación acreditada; comercial puede preceder al trámite. Esos permisos proceden de Portal y se limitan por configuración LidIA. Runtime/agente APP, operadores y DEV aún no están verificados.

## 2. Credenciales: servicio frente a usuario

La credencial identifica integración, entorno/proyecto, audiencia, capacidades y estado. Firma válida no basta para ampliar contexto. Capacidades propuestas:

| Operación | Capacidad de credencial necesaria |
|---|---|
| POST `/sessions` | `app.sessions.write`, que autoriza también la atestación `identity` de esa entrada |
| GET `/sessions/{id}/timeline` | `app.timeline.read` |
| POST `/sessions/{id}/turns` | `app.turns.write` |
| POST `/sessions/{id}/handoff` | `app.handoff.request` |
| POST `/sessions/{id}/context` | **`app.context.attest`**, reservada al backend Gestadia autorizado para acreditar contexto |
| POST `/subjects/{id}/revocations` | `app.subjects.revoke`, ciclo de vida limitado al scope configurado |

Estas capacidades están en configuración server-side, no en cabeceras/body elegidos por móvil. Una clave de lectura/turnos carece de facultad de atestación. Puede aprovisionarse una clave exclusiva de atestación o una credencial backend con varias capacidades explícitas; todas referencian la misma integración durable y comparten el namespace idempotente al rotar. No se reutiliza una clave de otra integración, canal, entorno o audiencia.

Cada entrada y cada replay comprueba credencial vigente, capacidad de operación, sujeto activo, integración/scope y dueño de conversación **antes de devolver un resultado**. 401 auth inválida; 403 `capability_denied` o cuenta revocada conocida; 404 indistinguible para conversación ajena/inexistente. La excepción de repetir revocación con sujeto bloqueado sigue limitada a la credencial de ciclo de vida. `/context` no es una ruta de reactivación.

Permisos conversacionales efectivos = permisos atestiguados ∩ techo de integración ∩ política de cuenta/revocación ∩ elegibilidad del contexto. Con contexto presente, `permissions=[]` significa cero permisos, sin añadir sondeo/historial por defecto. El mínimo sondeo/history se usa sólo antes de introducir un contexto y cuando la cuenta/purpose/integración lo permitan. Un turno o clave idempotente no concede permisos vigentes por sí mismo.

## 3. DTO contexto y normalización

Ruta: `POST /api/integrations/lidia/app/v1/sessions/{conversationId}/context`, sin query, cabeceras S2S y Idempotency-Key. [Esquema nuevo](fixtures/app-context-v1-1.schema.json): `$defs.ConversationContextRequest`, `$defs.ConversationContextResponse` y `$defs.ContextError`. Campos desconocidos rechazados; máximos y tipos figuran en el esquema. [Ejemplos/vectores](fixtures/app-context-v1-1-vectors.json) usan sólo identidades y claves públicas ficticias.

Request: todos los campos presentes, `schema_version`, `portal_user_id`, `context_revision`, `validated_at`, `permissions`, `case_ref`, `commercial_assignment_ref`, `manager_assignment_ref`, `correlation_id`. Referencias ausentes son null. Revisión string decimal canónica positiva de hasta 20 dígitos; **comparación numérica exacta**, mediante BigInteger/BigInt o longitud seguida de ordinal, nunca número JSON, float o comparación lexicográfica simple. La fecha se valida como UTC con milisegundos; informa de validación, no decide el orden.

`permissions` es un conjunto único de valores del catálogo del esquema. **Excepción explícita al anexo anterior:** únicamente este array en `operation=context` se ordena ASCII antes de construir la huella JCS. Duplicados se rechazan, no se deduplican silenciosamente. No se ordenan otros arrays ni se modifica Unicode. Las referencias y fechas ya están validadas y canónicas. `correlation_id` queda fuera de la huella; cambios de `context_revision` o `validated_at` sí cambian huella.

Huella: SHA-256 UTF-8 de JCS de `{operation:"context", subject, conversation_id, dto}`; `dto` incluye todo el request salvo `correlation_id`, con permissions ordenado. Firma HTTP sigue usando bytes crudos: el orden distinto de permissions cambia digest/firma, aunque preserve la huella semántica. Idempotencia por integración/sujeto/operación/conversación/key, independiente de key id. Los vectores hacen observable esa diferencia.

Reglas de combinación: `case_context` necesita `case_ref` no null; `manager_handoff` necesita caso y `manager_assignment_ref` no null. Una referencia gestor presente necesita caso, aunque no se conceda todavía handoff. `permissions=[]` exige ambas asignaciones null y admite retirar `case_ref` a null. Comercial con referencia null sólo puede usar destino general con política explícita/configurada; de otro modo el handoff devuelve `routing_unavailable`. Un mapping inexistente o inelegible nunca asigna por aproximación. Soporte general exige permiso explícito y cola configurada.

Respuesta 200 tras commit durable, o al recuperar una operación todavía autorizada:

```json
{
  "schema_version": "1.0",
  "conversation_id": "22222222-2222-4222-8222-222222222222",
  "operation_id": "77777777-7777-4777-8777-777777777777",
  "context_revision": "9",
  "current_context_revision": "10",
  "state_revision": "22",
  "persisted": true,
  "replayed": true,
  "effective_permissions": [],
  "applied_at": "2026-10-05T10:00:00.000Z",
  "enforcement_deadline": "2026-10-05T10:01:05.000Z",
  "enforcement_status": "propagating",
  "correlation_id": "context-retry-09"
}
```

En este ejemplo la operación 9 se recupera después de la retirada 10. `context_revision`/`applied_at` pertenecen al commit original; `current_context_revision`, `state_revision`, permisos y deadline reflejan la versión vigente en autoridad. La respuesta se reconstruye tras autorización actual, no se devuelve un HTTP cacheado con permisos antiguos. `persisted` acredita operación durable y `replayed` ausencia de nueva mutación; no restaura contexto 9. `correlation_id` refleja esta petición. El ACK no expone historia, asignaciones ni ids de operador.

| Error | Regla |
|---|---|
| 400 `invalid_context` | Esquema/formato/combinación inválidos, permissions duplicado |
| 401 `invalid_integration_auth` | Firma/clave/nonce/ventana no válidos |
| 403 `capability_denied` | Credencial sin atestación o permiso de cuenta requerido |
| 404 `conversation_not_found` | Ajena o inexistente, después de comprobar la credencial |
| 409 `idempotency_conflict` | Misma key, contenido semántico distinto |
| 409 `context_conflict` | Misma revisión, contenido semántico distinto |
| 409 `stale_context` | Revisión inferior sin una operación previa recuperable con esa key |
| 409 `case_context_conflict` | Intento de mover conversación ligada al caso A a B |
| 410 `operation_retired` | Operación reconocida con detalle retirado; no se repite ni reabre |
| 413 / 429 / 503 | Límites/rate/autoridad no disponible; nunca ACK de commit inexistente |

## 4. Commit, reintento y retirada efectiva

Dentro de una transacción autoritativa serializada por conversación, revalidar cuenta/contexto y reclamar idempotencia. Primero una key existente: recuperar operación si su huella coincide, o conflicto. Si no existe y la revisión ya se conoce, contenido igual puede asociar la nueva key al mismo resultado sin aplicar contexto; contenido distinto, conflicto. Si no hay operación previa recuperable, revisión inferior al máximo actual es stale. Revisión superior reemplaza **toda** la instantánea.

La transacción persiste snapshot, máximos/revisiones, caso ligado, operación/huella, permisos efectivos, acciones invalidadas y salida durable de invalidación; aumenta `state_revision` una vez. Commit fallido no tiene ACK. Asignaciones de una versión antigua nunca sobrescriben la superior. Turnos/acciones/handoff/operadores se autorizan de nuevo en su ejecución y antes de un efecto, incluido un retry de una operación ya admitida. Un worker no usa su permiso antiguo para enviar después de retirarlo. No se garantiza revertir una llamada externa ya admitida/en vuelo: conservar identidad y reconciliar.

Para retirada de contexto, `t0` es commit autoritativo LidIA. Se aplica el mismo objetivo propuesto ≤60 s de O2 a todos los nodos, con invalidación durable y caché positiva máxima de 60 s desde la lectura autoritativa, sin renovación por avisos atrasados. Este plazo es una propuesta **pendiente de pruebas**. En el nodo autoritativo la respuesta usa el contexto nuevo tras commit; ante autoridad inaccesible/permiso desactualizado fuera de plazo se deniega temporalmente. Workers y gates de efectos consultan autoridad actual; lecturas privadas también comprueban `history` y, si tienen datos de caso, `case_context` vigente para ese caso. Los operadores de una conversación no conservan una excepción al permiso de contexto retirado.

`enforcement_deadline` se calcula desde el commit del contexto **vigente**; `enforcement_status=propagating` confirma persistencia sin certificar efectividad universal. Portal retira exposición/permisos desde su propia decisión y mantiene la salida durable hacia LidIA. Las lecturas de caches que aún cumplen el límite no amplían el derecho a ejecutar efectos externos con permisos retirados. Medir nodos/workers/caída de invalidación requiere implementación y pruebas autorizadas.

El contexto puede actualizarse en una conversación cerrada y retenida, incluida retirada de permisos. No reabre IA, turnos o handoff. Una repetición de inicio sólo devuelve recuperación/lectura actualmente autorizada. Mantener purpose inmutable: resume y contexto no lo cambian; atención humana modifica el modo/cola dentro de la misma ChatSession.

## 5. Aislamiento de casos y continuidad

null→caso acreditado puede enriquecer una conversación compatible, manteniendo sujeto/purpose y sin importar mensajes de otras conversaciones. El primer caso ligado queda como `bound_case_ref` interno durable. Desde entonces caso A→B requiere conversación explícita nueva; retirada de A a null no permite B después. Caso retirado no convierte mensajes privados previos en sondeo público. Conservar clasificación confiable; mensajes mixtos/no clasificados con privacidad incierta se ocultan íntegramente junto con resultados, acciones y recibos afectados.

Actualizar asignación dentro del mismo caso cambia destinos futuros. No reasigna por sí solo una atención ya tomada: la transferencia se tramita y traza sobre la misma sesión, con permisos vigentes. Handoff reautoriza intención, caso/asignación, mapping y operador. Recuperar su recibo original no genera otra solicitud ni inventa `turn_id`: el recibo handoff conserva null en ese campo.

Cuenta y conversación siguen vinculadas por integración/sujeto; otro dispositivo recupera el mismo id a través de Portal. No matching por email/teléfono, cambio de subject o contacto CRM. Cerradas admiten lectura autorizada y contexto; abrir otra conversación exige operación explícita nueva.

## 6. Retención y antirrepetición

Confirmamos detalle de recibo **30 días desde accepted_at** y conservación del ledger de trabajos pendientes/outcome_unknown hasta reconciliación. Plazos de mensajes/historial y puntos de cursor siguen **pendientes de política conjunta**, al igual que el procedimiento de purga; no se asigna un plazo arbitrario ni se ejecuta borrado.

Concretamos la semántica antirrepetición para todas las operaciones: inicio conserva key/huella→conversation id o resultado retirado; contexto conserva key/revisión/huella→operación, máximo de revisión y caso ligado; handoff conserva key/huella→solicitud/recibo y efecto reclamado; turno/acción conservan sus marcas anteriores. Las marcas no contienen textos de chat ni payload privado completo. Retirar detalle no libera key, revisión, id ni acción y no vuelve a ejecutar el efecto.

**Propuesta técnica de v1:** las marcas necesarias no caducan mientras la misma integración durable siga admitiendo operaciones de ese scope; su purga debe acompañarse de retirada definitiva de esa identidad operativa/scope, para que ninguna credencial nueva del mismo namespace reinterprete un retry como primera petición. Esto se propone para acuerdo Portal y política de retención; no afirma un mecanismo existente ni fija el plazo del historial. Rotar claves mantiene namespace y marcas, y no equivale a retirarlo.

Repetir un inicio retirado con la misma key/huella devuelve 410 `operation_retired`, sin crear sesión. Repetir contexto/handoff retirado devuelve igual, sin restaurar permisos ni pedir otro humano. Conflicto de huella sigue 409. Autorizar scope/cuenta antes de estos resultados; la marca no es una vía para leer recursos ajenos. Para iniciar una conversación realmente nueva se usa otra operación explícita, no se reinterpreta el retry antiguo. Purgar historia preserva también la marca de conversación retirada que bloquea turnos por su id.

## 7. Validación y siguiente conformidad

[Vectores contexto](fixtures/app-context-v1-1-vectors.json): positivos firmados, permissions reordenado con huella igual y firma distinta, retirada, retry antiguo, rotación y revisión superior a precisión numérica JS. Casos negativos/de estado declarados: sin capacidad de atestación, sujeto revocado, stale/conflicto, duplicados, cambio de caso, operación retirada y concurrencia. Los esperados con ledger/autoridad son **especificaciones para el futuro adaptador**, no tests ejecutados de un runtime inexistente.

Comprobación offline: seis requests y un ejemplo de response comprobados contra el perfil de reglas del esquema publicado; cuatro negativos de esquema rechazados por ese checker limitado. No se ha usado un validador JSON Schema general. Node 24.14.1 y .NET 10 comparan bytes UTF-8, SHA-256/HMAC y normalización de los seis fixtures; comparación decimal exacta incluye 9→10 y revisiones superiores a 2^53. Las once especificaciones restantes de autorización/ledger/casos/concurrencia/ciclo de vida no se han ejecutado contra un adaptador. No se acredita un canonicalizador JCS general, proxy, revocación distribuida o API desplegada. No hay escrituras de producto/BD ni pruebas conectadas.

Devolvemos conformidad a las precisiones Portal, con esta propuesta para request/response, gates, reintentos y marcas. Solicitamos únicamente contraste de los artefactos y acuerdo de la política de historial/purga. Portal prepara evidencia/gate de cuenta; LidIA verifica agente APP, mapping y DEV antes de conexiones. Mantener Zoho y checkout fuera del cierre conversacional.
