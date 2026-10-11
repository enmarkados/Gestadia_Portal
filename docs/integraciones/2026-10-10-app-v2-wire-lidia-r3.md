# Contrato de transporte APP v2

Revisión `2.0-r3`, 10/10/2026. Implementación autorizada; opt-in y pruebas conectadas pendientes. Adenda funcional: [APP sin cuenta](2026-10-10-revision-lidia-app-anonima.md). v1 continúa sin cambios.

## Pasarela al agente de LidIA

Precisión humana del10/10/2026: APP → backend Portal → plataforma LidIA → agente119; la APP muestra la respuesta del agente. Portal valida cuenta/instalación y firma; LidIA resuelve el agente en servidor, conserva ChatSession/timeline y usa su motor conversacional normal. El transporte no sustituye el cuestionario, no añade reglas de canje, no impone emit_app_turn ni deriva una elegibilidad propia. El agente conserva sus instrucciones. Texto es el flujo base; HTML y respuestas dinámicas son opcionales, nunca requisitos para continuar y nunca HTML ejecutable sin un render seguro acordado.

La preparación usa AppAgentGateway y la selección efectiva de la integración, que debe comprobarse como119 antes de dar por aceptada la prueba conectada. PlatformAgentRuntimeEnabled es un opt-in del servidor para usar un agente con conexiones existentes; la ChatSession sigue siendo APP, sin WhatsAppContact ficticio, sin transporte Woztell, sin automatismos de ese canal y con herramientas externas bloqueadas. No cambia la configuración global del119. Las asignaciones/comercial/gestor se resuelven por contexto validado y rutas de soporte del servidor. Esta revisión no acredita desplegar ni conversar ya con119.

En la entrega inicial v2, sondeo estructurado es null: el resultado conversacional es el texto del agente. No se fabrica estado de canje a partir de ese texto. Una futura proyección estructurada requerirá salida oficial del propio agente y no bloquea esta pasarela.

## Firma y autoridad

Prefijo `/api/integrations/lidia/app/v2`. `GuestV2Enabled=false` por defecto en cada integración. Todos los requests tienen `X-Gestadia-Subject` (UUID del sondeo), `X-Gestadia-Actor` (`guest:UUID` o `account:UUID`) y `X-Gestadia-Access-Revision` (decimal string). Ningún ID selecciona agente, proyecto, departamento o entorno. Header signature `app-v2=<hex minúsculas>`.

Canonical UTF-8, 13 líneas sin LF final: dominio `gestadia-app-s2s-v2`, audience, key_id, timestamp Unix decimal, nonce hex32, METHOD, encoded_path, canonical_query, subject, actor, access_revision, idempotency_key, sha256(raw body). GET firma digest vacío `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, sin Idempotency-Key. POST JSON UTF-8 sin BOM, 32 KiB, sin query; key 16–128 caracteres `[A-Za-z0-9._:-]`. Sin fallback v1. Timestamp ±300s; nonce de un uso. Key rotada no cambia identidad de operación. Query ASCII ordenada, RFC3986 canónico sin `+`, escapes mayúsculas.

Todos los DTO tienen `schema_version:"2.0"` y `correlation_id` string1..128. UUID minúsculas; revisiones decimal strings; fechas UTC con milisegundos. DTO cerrado: campos extra rechazados. El hash semántico excluye sólo correlation_id; identity.kind, actor_id, attested_at, expires_at y todas las atestaciones del inicio forman parte del negocio original y no se reescriben en un replay; las operaciones posteriores conservan sujeto estable. La autorización se comprueba antes del replay.

## Sesiones

POST `/sessions`, capability `app.sessions.write`: `conversation_subject_id`, `purpose:"sondeo"`, `identity`, opcional `resume_conversation_id`.

Identity guest: `kind:"guest"`, `actor_id` UUID de instalación, `attested_at`, `expires_at`, `method:"installation_session"`. Identity account: `kind:"account"`, `actor_id` User.id, `attested_at`, `verification_level:"account_verified"`, `verified_at`, `method:"email"|"invitation"`, `account_status:"active"`. Inicio nuevo revisión0; devuelve access_revision1. Caducidad guest máxima24h desde attested_at; resume no amplía el límite original. Un sujeto corresponde a una conversación; una instalación puede crear varios sujetos. Nuevo inicio con sujeto existente y otra key =>409 conversation_subject_conflict. Vínculo no reescribe el inicio original.

ACK añade `conversation_subject_id`, `actor`, `access_revision`, `state_revision`, `context_revision`, `effective_permissions`, IDs de conversación/ChatSession y agente efectivo. Nunca autenticar con nombre, teléfono, visitorId o ClientKey.

## Timeline, turnos, contexto y recibos

GET `/sessions/{id}/timeline`: `cursor` y `limit`1..100, o sólo `turn_id` UUID. Capability `app.timeline.read`. Cursor ligado a integración, protocolo, sujeto, conversación, actor y access_revision. Actor/revisión antiguos no leen después del vínculo.

POST `/sessions/{id}/turns`, capability `app.turns.write`: DTO de texto/acción v1 con schema2.0. POST y GET `/sessions/{id}/message-receipts`: DTO/queries de v1 con schema2.0; actores históricos no se reetiquetan al vincular. Recibos/operaciones30d; tombstones de idempotencia se conservan. GET `/sessions/{id}/operations/{operation_id}` devuelve recibo sin repetir ejecución. GET `/subjects/{subject}/operations?idempotency_key=<key>&operation=session` recupera el inicio original bajo autoridad actual.

POST `/sessions/{id}/context`, capability `app.context.attest`: `conversation_subject_id`, `context_revision`, `validated_at`, `permissions`, `case_ref`, `commercial_assignment_ref`, `manager_assignment_ref`. Guest sólo sondeo/history y null en los tres refs; no ampliación de expiración. Account usa permisos servidor y asignaciones resueltas por integración. POST `/sessions/{id}/handoff` conserva DTO v1/schema2.0; guest denegado.

## Vínculo

POST `/sessions/{id}/bindings`, capability `app.bindings.write`: `binding_id`, `phase:"prepare"|"commit"|"abort"`, `conversation_subject_id`, `source_guest_id`, `target_portal_user_id`, `expected_access_revision`, `verified_account_identity` (identity account anterior), `source_control_ref` opaca1..128. Portal atesta tanto control instalación original como cuenta verificada. Prepare actor guest; commit/abort actor cuenta destino. Ningún campo es una credencial ni concede lectura por sí mismo.

GET `/sessions/{id}/bindings/{binding_id}`, capability `app.bindings.read`, recupera sólo participantes autorizados: guest antes de commit y cuenta destino del vínculo. Replay exacto de commit con su revisión inicial permitido exclusivamente a esa cuenta destino vigente; no permite otras operaciones antiguas.

ACK: schema_version, binding_id, operation_id, conversation_id, lidia_session_id, status (prepared/blocked/committed/aborted), blocked_reason null|pending_turns|prepare_expired, access_revision, state_revision, context_revision, effective_permissions, committed_at nullable, correlation_id. Prepare congela nuevas escrituras; se drenan turnos admitidos. Pending accepted/processing/outcome_unknown bloquea commit y abort. Vencimiento10min bloquea, nunca aborta ni restaura autoridad. Commit CAS conserva ChatSession/timeline, cambia owner, aumenta acceso/estado y retira acciones/contexto; permisos sondeo/history hasta nueva atestación. Abort exige drenaje y fuente guest no revocada ni caducada; aumenta revisión.

## Solicitud de contacto: reserva de contrato

La señal adicional contact-requests de r2 queda aplazada para esta primera entrega de pasarela, sin catálogo/calificador alternativo como dependencia. Los DTO y vectores reservados no acreditan endpoints implementados ni autorizan publicar sus capabilities; Portal no debe invocarlos. El contacto con comercial/gestor usa la conversación y el handoff del contrato vigente bajo cuenta/contexto validados. El agente dirige el sondeo y Portal conserva cuentas, trámites, cobros y coordinación Zoho.

## Revocación

POST `/subjects/{subject}/revocations`, capability `app.subjects.revoke`: `scope:"guest"|"account"|"crm_link"`, `reason_code` account_disabled|account_deleted|identity_conflict. Guest revoca sólo conversación; account todas las conversaciones v2 de la misma cuenta/integración; CRM retira contexto/asignaciones restringidos y conserva historia/sondeo. Comprobación contra BD primaria en cada operación y worker; sin caché positiva. Excepción lifecycle exclusivamente en esta ruta: S2S con capability de control, mismo actor almacenado y access_revision actual (o replay exacto del recibo original) puede revocar aunque guest haya caducado o cuenta esté revocada; no requiere fabricar identity activo. No habilita timeline/turnos/bindings ni recuperación de cuenta guest. Account scope exige actor account; guest scope actor guest. El destino es el propietario persistido del sujeto, no un User.id libre del DTO.

## Dependencias

LidIA publica schema/vectores exactos y EF migration; Portal implementa firma, instalación, cuenta, control de vínculo, persistencia SOLICITUD y reconciliación ACK. No se requiere un catálogo paralelo de canje. Sin activar guest, cambiar119, CRM, WhatsApp o agenda. Cada evidencia de test, merge, deploy y prueba real se registra por separado.
