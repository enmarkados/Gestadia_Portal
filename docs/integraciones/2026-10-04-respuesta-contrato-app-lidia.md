# Respuesta técnica: Gestadia APP ↔ Portal ↔ LidIA

Fecha: 04/10/2026. Estado: **respuesta y propuesta para revisión; no es un contrato aprobado ni implementado**.
Base LidIA: `dev/IA/main`, `15828edb011bfb2ef17d34f564cf23dfa6e0f107`.
Base Portal: `app/main`, commit `399ca21`, `docs/integraciones/2026-10-03-app-lidia-backend-preparacion.md`, leído desde ese commit. Su contenido coincide con la copia local consultada.
Nomenclatura: [GLOSARIO.md](../../GLOSARIO.md).

El objetivo es habilitar sondeo gratuito de canje y atención comercial/gestor desde la cuenta Portal, conservando conversaciones y operaciones entre dispositivos. La app consume Portal; Portal integra LidIA S2S. Esta entrega comprende diseño y lecturas. No crea agentes, canales, conexiones, migraciones, checkouts ni eventos externos.

**Equipo Gestadia Portal**: cuentas, API servidor, pertenencia de expedientes/conversaciones, cobros e inbox/outbox de integración. **Equipo Gestadia App**: experiencia iOS/Android/web y consumo de esa API. La responsabilidad del **runtime LidIA**, revisada desde este repositorio, se explicita en cada dependencia; no se presupone que los dos equipos anteriores administren ese runtime.

## 1. Rama y nivel de evidencia

Se ejecutaron `git fetch origin` y `git pull --ff-only origin dev/IA/main` en el checkout principal limpio. Se incorporaron 147 commits y se verificó igualdad de SHA local/remoto, con divergencia `0/0`. Este worktree se actualizó al mismo SHA y la respuesta se prepara en una rama documental local.

Últimos merges de la rama: `15828edb0` (#1595, documentación backlog), `dddcad8d8` (#1589, plan de gestión manual) y `c10abe139` (#1588, test de migraciones Astro). Estar en Git no demuestra publicación de esas revisiones.

| Afirmación | Nivel comprobado el 04/10 | Límite |
|---|---|---|
| Agente 119 = «LidIA Canje v4», original WhatsApp en PRO | Documento A/B vigente en la rama, §1 | No confirma la fila actual de PRO |
| Agentes Gestadia DEV: 120 original, 122 variante, 121 operativo web | Mismo documento A/B | No son una reserva de agente APP ni una lectura actual |
| APP no existe en el enum de sesión | Código: `Web=0`, `WhatsApp=1` | Falta implementación transversal del canal |
| Checkout exige WhatsApp real o Playground Real controlado | Handler actual | La excepción Playground no autoriza APP |
| Soporte modifica la misma `ChatSession` | Código de solicitud, transferencia y toma | Falta autorización y presentación APP |
| Hay carpetas de stacks `gestadia-dev` y `gestadia-pro` | Lectura SSH de directorios | No acredita contenedor, configuración efectiva ni aislamiento |

La lectura SQL disponible accedió únicamente a `dev_lidia_db` y `information_schema` (observación `2026-10-04 13:36:04 UTC`), correspondiente a otro DEV. No se atribuye esa base a Gestadia. El usuario SSH no tiene acceso al socket Docker ni al vhost Gestadia; no se inspeccionaron variables efectivas de esos contenedores. Chrome mostró el login de `https://lidia.gestadia.com/iniciar-sesion`, sin sesión autenticada disponible.

**Pendiente real del punto 1:** leer en Gestadia PRO `Agents[119]`, proyecto asociado, `IsActive`, `InstructionId` y versión/contenido efectivo, `IsFlowAgent`, hashes de instrucciones/flow, herramientas efectivas, conexiones, timeout/automation, claves web, ajustes Public Chat, routing WhatsApp y estado A/B. No se puede afirmar hoy proyecto, instrucción/version, activación o canales permitidos efectivos del 119. Un nombre o id histórico no demuestra esas propiedades.

Los documentos AFC que referencia la skill de contexto no existen en esta revisión; la fuente actual de arquitectura es [ARQUITECTURA_MOTOR_Y_INTERCONEXIONES.md](../../DOCUMENTACION/ARQUITECTURA_MOTOR_Y_INTERCONEXIONES.md). No se traslada el estado AFC histórico a esta integración.

## 2. Agente y canal APP: decisión propuesta

| Alternativa | Evaluación |
|---|---|
| Añadir capa APP al 119 | Menos configuración, pero acopla instrucciones, tools, timeouts y gestión manual al agente WhatsApp. Requiere igualmente enforcement transversal. No recomendada para el primer contrato |
| **Agente operativo APP dedicado con núcleo de canje compartido** | Recomendada: configuración y allowlist propias, motor común y reglas de negocio con una fuente de verdad |
| Backend/agente duplicado íntegramente para APP | Duplica reglas, estado y mantenimiento sin necesidad acreditada |

El agente APP deberá informar origen/cuenta verificada, sondear sin exigir pago, expresar el resultado mediante estado estructurado y ofrecer opciones interactivas con texto libre. No prometerá aprobación administrativa ni atribuirá una respuesta a un humano por haber solicitado atención.

Configuración propuesta: `AutoIncludeGlobalTools=false`, `TimeoutEnabled=false`, `AutomationProgramId=null`, sin canal Woztell ni handoff WhatsApp→Web. Las tools de canje se habilitan individualmente; no se copian en bloque las autorizaciones del 119. Primera prueba: tools con dobles de prueba y datos ficticios; después, herramientas de lectura sandbox. Escrituras CRM y checkout sólo tras cerrar sus contratos y acreditar destinos de prueba.

Restricciones del servidor, independientes del prompt:

- Nuevo canal APP conservando los valores existentes; `IsWhatsAppActive=false`; sin contacto WhatsApp sintético ni sesión emparejada WhatsApp.
- Allowlist de capacidades por integración y agente; negar envío Woztell, plantillas, llamadas, emails y automatizaciones externas no acordadas, aunque una tool global o un callback intente ejecutarlos.
- Auditar entrada/salida IA, operador, adjuntos, timeout, programador de eventos, postpago y seguimiento comercial. El vigilante actual de timeout no filtra por canal: añadir un enum o apagar un prompt no garantiza aislamiento.
- La gestión manual APP actúa sobre la conversación APP. Vincular una ficha CRM no debe suspender ni modificar conversaciones WhatsApp de esa ficha de manera implícita.
- Fuente compartida de reglas de canje; diferencias APP limitadas a transporte, identidad, presentación, consentimiento y capacidades.

**DEV propuesto:** stack/host Gestadia DEV como destino candidato, con proyecto APP de pruebas y agente operativo nuevos, sin canal WhatsApp. Sus ids se asignarán al provisionar; hoy **no hay ids APP confirmados**. Los 120/121/122 son referencias A/B y no deben reutilizarse automáticamente. Si el stack Gestadia DEV mantiene conexiones de producción, el ensayo debe ir a un entorno APP aislado antes de habilitarlo. No se crea nada en esta entrega.

## 3. Contrato S2S propuesto, versión 1.0

Base: `/api/integrations/lidia/app/v1`. Las cuatro rutas son **nuevas y propuestas**; no están montadas. El móvil sólo usa la API APP del Portal.

### Autenticación, autorización y recuperación

Propuesta concreta: TLS + HMAC-SHA256 por petición, con credenciales exclusivas APP. Una clave identifica una integración y resuelve emisor Portal, entorno, proyecto, agentes por propósito y capacidades. Claves de ida, callbacks y checkout son distintas; no reutilizar el secreto 1.0 ni credenciales administrativas.

Cabeceras: `X-Gestadia-Key-Id`, `X-Gestadia-Timestamp` (Unix segundos), `X-Gestadia-Nonce` (128 bits aleatorios en hex), `X-Gestadia-Subject` (`portal_user_id`) y `X-Gestadia-Signature: app-v1=<hex HMAC>`. POST requiere además `Idempotency-Key` de 16–128 caracteres ASCII. GET permite únicamente `cursor`, `limit` y `turn_id` como query; sin parámetros repetidos.

Canonicalización APP propuesta: UTF-8, campos separados por LF, sin LF final, en este orden: literal `gestadia-app-s2s-v1`, audiencia de integración configurada, key id, timestamp, nonce, método uppercase, ruta codificada, query canónica, subject, Idempotency-Key (vacío en GET), SHA-256 hex lowercase del cuerpo crudo (vacío en GET). Ruta sin segmentos ambiguos; componentes query codificados con percent-encoding uppercase, ordenados por nombre ASCII. El receptor reconstruye esos valores desde la petición real y su configuración. Publicar vectores de firma para ambos lenguajes antes de implementar. **No modifica** el callback actual 1.0 que firma `timestamp + "." + raw_body`.

Ventana de firma propuesta ±300 s; comparación constante; nonce único por key id retenido 10 min mediante claim persistente. Reintentar genera tiempo/nonce/firma nuevos, conservando cuerpo, turno y clave idempotente. Rechazar cabeceras múltiples, claves inactivas, discordancia body/header de sujeto y configuración incompleta. Límites de tasa por integración/sujeto y cuerpos acotados; sin CORS para móvil directo.

Portal atestigua verificación de su cuenta; una verificación de email no equivale a identidad civil comprobada ni a propiedad de una ficha CRM. En cada acceso LidIA comprueba pertenencia por `(integración, entorno, proyecto, portal_user_id, conversación, canal APP)`. Los ids de proyecto/agente/entorno enviados en el cuerpo se rechazan.

**No se propone un token bearer de conversación.** Esto sustituye explícitamente la credencial scoped opcional del borrador Portal. Cada petición se reautoriza con S2S, por lo que expirar una firma o reiniciar Portal no crea otra conversación ni precisa renovar un grant Public Chat. La recuperación usa la asociación durable de cuenta/conversación en Portal y LidIA; otro dispositivo accede tras autenticar la misma cuenta Portal. No se recupera por teléfono, `visitorId` o email coincidente.

Rotación: key ids nuevos, convivencia acotada y acordada para retirar los viejos; revocación efectiva propuesta ≤60 s. Desactivar la integración corta todas sus operaciones. Portal es autoridad de la sesión móvil y debe revocar login/refresh por dispositivo; LidIA es autoridad de su vínculo APP. Para cubrir borrado/bloqueo y revocación CRM se propone la ruta adicional de ciclo de vida descrita abajo: las cuatro rutas iniciales no cubren esa operación. No se promete revocación durable sólo borrando un JWT del móvil.

### DTO comunes

JSON snake_case, `schema_version: "1.0"`; fechas UTC ISO-8601; ids de cuenta/CRM como strings; ids públicos opacos. Rechazar versiones no soportadas, propiedades privilegiadas o desconocidas y combinaciones de unión inválidas. `correlation_id` sirve para trazas, nunca para permisos o idempotencia. Límites propuestos: cuerpo 32 KiB, texto 4.000 caracteres, motivo de handoff 500, strings de ids/correlación 128.

| DTO | Campos y regla |
|---|---|
| Inicio | `portal_user_id`, `purpose: sondeo|atencion`, `identity`, `correlation_id`, opcional `resume_conversation_id`, `case_ref` y `client_key` |
| `identity` | `verification_level: account_verified`, `verified_at`, `method: email|invitation`, `account_status: active`; emisor obtenido de integración. No aceptar valores del formulario móvil sin validación Portal |
| Turno | `turn_id` estable generado por Portal, `kind: text|action`, `correlation_id`; exclusivamente `text` **o** `presentation_id` + `action_id` |
| Handoff | `target_kind: commercial|manager|support`, `reason`, `correlation_id`; expediente ya autorizado en el contexto de conversación |
| Error | `type`, `title`, `status`, `code`, `detail` sanitizado, `correlation_id`, `retryable` |

`case_ref` representa una referencia Portal cuya pertenencia debe estar comprobada por servidor; no permite introducir un CRM id arbitrario. `client_key` es opcional y sólo se acepta si ya existe un vínculo verificado del mismo sujeto y scope. Su ausencia permite el sondeo gratuito.

### `POST /sessions`

Inicio con clave idempotente. Sin `resume_conversation_id` crea una conversación lógica nueva; el Portal consulta primero su índice de conversaciones para no abrir una por dispositivo. Distintos expedientes/propósitos pueden tener conversaciones diferentes. Reintentar la misma clave devuelve la misma asociación; no se deduplica sólo por usuario o propósito.

Con `resume_conversation_id` se verifica pertenencia y se retorna esa conversación sin regenerar saludo, sesión, memoria o efectos. Una sesión cerrada se consulta en lectura; reabrir o crear otra requiere una acción explícita conforme a la política a acordar, nunca una renovación automática.

Respuesta 201 al crear y 200 al recuperar/repetir: `conversation_id`, `lidia_session_id` (sólo servidor), `purpose`, `status`, `effective_agent: {id, display_name, instruction_version}`, `capabilities`, `cursor`. Ambos ids se guardan en Portal; al móvil sólo llega su id público propio y los metadatos visibles. No se entrega ninguna credencial LidIA.

### `GET /sessions/{conversationId}/timeline`

Subject firmado obligatorio también en GET. `limit` por defecto 50, máximo 100; sin cursor comienza la lectura cronológica. Cursor opaco autenticado, ligado a conversación y sujeto/scope. Orden estable por secuencia persistida, no sólo por timestamp. Retención distinta de mensajes y cursores; cursor inválido devuelve 400, cursor cuyo punto fue retirado devuelve 410 con indicación de resincronización de esa conversación autorizada.

Respuesta 200: `items`, `next_cursor`, `has_more`, `conversation_status`, `effective_agent`, `support`, `turn_statuses`, `state_revision`. Items públicos: `message_id`, `sequence`, `occurred_at`, `role: user|assistant|operator|event`, contenido y presentación tipada opcional. Excluir system prompts, tools crudas, notas internas, trazas y datos privados no autorizados. Los cambios de soporte y recibos deben poder leerse aunque no haya nuevos mensajes; no se silencian por el cursor de mensajes.

`support` devuelve estado (`none|requested|assigned|in_support|closed`) y nombre visible del operador sólo cuando proceda. `assigned` no significa atendido. `turn_statuses` permite reconciliar `turn_id` y errores sin endpoint adicional. Sondeo devuelve estado estructurado y su versión/revisión; no se deduce el resultado por palabras del texto del modelo.

### `POST /sessions/{conversationId}/turns`

Texto no vacío o acción exclusiva. Una acción debe pertenecer a la conversación/sujeto, presentación vigente, opción permitida y revisión válida; vence al consumirse o invalidarse. El servidor resuelve su significado y permisos; no ejecutar un nombre de tool, rol o instrucción enviados por el móvil. Mantener texto libre junto a opciones tipadas.

202 sólo después de persistir turno/recibo y entrada durable a procesamiento: `turn_id`, `status: accepted`, `persisted_message_id` si ya existe, `cursor`. Procesamiento observable: `accepted|processing|completed|failed|outcome_unknown`. `completed` significa que terminó el trabajo del turno, no que un humano respondió. En soporte puede completarse la recepción del mensaje sin respuesta humana. 200 en repetición devuelve el recibo/resultado conocido. El primer contrato usa polling, con sugerencia inicial de 3 s y backoff hasta 15 s en espera.

### `POST /sessions/{conversationId}/handoff`

Clave idempotente. El cliente solicita una intención; el servidor resuelve destinatario, elegibilidad y departamento a partir de contexto CRM verificado y reglas permitidas. No aceptar `targetUserId`, departamento o usuario CRM enviados desde el móvil. Sin gestor acreditado, devolver 409 `routing_unavailable` u ofrecer soporte general permitido; no escoger un gestor por aproximación.

Persistir solicitud y evento visible en la **misma ChatSession**; respuesta 202 `requested` con recibo y estado. Entrada inicial mediante el patrón `RequestSupportAsync`; transferencia de una conversación ya en cola mediante `TransferAsync`; toma humana mediante `TakeOverAsync`. No crear otra sesión para la transferencia ni afirmar recepción por el humano a partir del 202. Los mensajes del operador quedan en ese timeline y usan transporte APP.

### Ciclo de vida adicional: `POST /subjects/{portalUserId}/revocations`

Ruta propuesta necesaria para hacer efectiva la revocabilidad; no existe actualmente. Sujeto de ruta y header deben coincidir, con credencial autorizada para ciclo de vida e `Idempotency-Key`. DTO: `schema_version`, `scope: account|crm_link`, `reason_code: account_disabled|account_deleted|identity_conflict`, `correlation_id`. `account` bloquea lecturas/envíos/handoffs APP de ese sujeto y cancela trabajos APP pendientes; `crm_link` revoca el alias/vínculo CRM y capacidades privadas, conservando el sondeo gratuito. Los motivos de cuenta sólo se aceptan con scope de cuenta, y el conflicto de identidad con scope CRM.

Respuesta 200 tras persistir: `revoked_at`, `revocation_version`; es repetible aun con el sujeto ya revocado, sin permitir otras operaciones. El borrado físico/retención se rige por una política separada; esta ruta no borra expediente ni prueba de pago. Inicio/recuperación no reactiva un sujeto o vínculo revocado por recibir `account_status: active`. Reactivación queda fuera de 1.0 y exige reconciliación administrativa explícita. Para cancelación de trabajos, confirmar revocación antes de cada efecto externo, además del gate de entrada. Una llamada ya enviada exige reconciliación, no puede deshacerse por declarar revocación.

### Errores e idempotencia

| HTTP | Códigos propuestos / comportamiento |
|---|---|
| 400 | `invalid_request`, `unsupported_version`, `invalid_cursor`, `idempotency_key_required` |
| 401 | `invalid_integration_auth`, firma fuera de ventana, nonce repetido; sin detalle de secretos |
| 403 | `capability_denied`, `account_not_verified` para un sujeto conocido |
| 404 | `conversation_not_found`, mismo resultado para inexistente o ajena |
| 409 | `idempotency_conflict`, `turn_conflict`, `stale_action`, `conversation_closed`, `routing_unavailable` |
| 410 | `cursor_expired` después de autorizar la conversación |
| 413 / 429 | `payload_too_large` / `rate_limited`; 429 con `Retry-After` |
| 503 | `runtime_unavailable`, configuración o dependencia no operativa; no inventar un 202 sin recibo durable |

Scope de idempotencia: integración + sujeto + operación + conversación (inicio excluye la conversación aún inexistente) + key. Hash del DTO normalizado y campos semánticos; no incluir nonce/tiempo/firma de transporte. Misma key + mismo hash recupera recibo; misma key + hash diferente = 409. Un `turn_id` reutilizado con otra clave no permite duplicar el turno.

Claims/índices persistentes, orden por sesión y recibos recuperables entre procesos; el lock en memoria no basta. Retención propuesta del recibo/resultados 30 días y de la marca antirrepetición durante la vida retenida de la conversación; al retirarlos no se reejecutan ids antiguos. Una nueva key no debe forzar la repetición de una acción ya consumida.

Cada efecto externo necesita su propio identificador estable, ledger y reconciliación. Tras timeout, consultar `turn_id` y reintentar con **la misma key**. Si no se conoce el resultado de una mutación no idempotente, `outcome_unknown` y reconciliación; no relanzarla automáticamente. No se garantiza exactly-once del CRM por el solo recibo HTTP.

## 4. Identidad y ClientKey

El sujeto APP y su vínculo durable existen sin Contacto, Lead, expediente o pago. La cuenta gratuita verificada puede iniciar sondeo. `ChatSession.WhatsAppContactId` ya es nullable, pero las tools actuales que dependen de teléfono/contacto deben adaptarse o excluirse: la nullable no demuestra compatibilidad del motor completo.

El `ClientKey` actual agrupa teléfonos/fichas; `ClientKeyLinker.BuildKey` produce `{module}:{recordId}`. `ClientPhoneLink` no contiene proyecto/entorno ni revocación. Por tanto **no es hoy un identificador opaco scoped y revocable**, ni una credencial.

Propuesta: conservar el `ClientKey` interno existente y exponer a Portal, cuando haga falta, el alias aleatorio `client_key` APP. Su mapping incorpora scope, ficha comprobada, auditoría y fecha de revocación. No se devuelve el CRM id dentro de ese alias. Revocarlo corta el vínculo/capacidad CRM conforme a la política aprobada, sin convertir automáticamente otra cuenta en propietaria ni destruir la conversación gratuita.

Lead→Contact mantiene el sujeto y permisos APP; el mapping se actualiza tras verificación. Conflicto de fichas/cuentas: pendiente de revisión, sin unión por email/teléfono parecido. Reclamación de expedientes exige evidencia de pertenencia específica. El historial WhatsApp no se expone automáticamente a la cuenta APP vinculada al mismo CRM.

## 5. Comercial, gestor y soporte

**Comprobado en código:** Zoho utiliza `Owner`; al crear un trato de canje copia el propietario del Contacto. No hay evidencia aquí de que ese propietario equivalga al gestor contratado. LidIA dispone de `Project.DefaultSupportDepartmentId/DefaultSupportUserId`, reglas de transferencia/reparto y validación de pertenencia de operadores a departamentos/proyectos.

**Pendiente de configuración CRM real:** API names y módulos de comercial y gestor, relación Contacto↔Trato↔Expediente, quién manda ante discrepancia, identificadores de usuario Zoho, mapping a operador LidIA, departamento y disponibilidad. No se inventa un campo `Gestor` ni se da por confirmado que `Owner` sea comercial.

Contrato de resolución propuesto: comercial según campo de negocio que Gestadia confirme; gestor por asignación del expediente/trato autorizado; soporte general por reglas del proyecto APP. Resolver IDs sólo en servidores y verificar proyecto, roles, departamento activo y elegibilidad actual. Sin mapping no prometer atención nominal.

Solicitud→espera→asignación→toma humana conserva sesión/timeline y deja eventos auditados. La pestaña Mensajes consulta atención; LidIA consulta sondeo. Cambiar de pestaña no transfiere ni fusiona contextos. El operador conserva su autorización de `SupportScope` y sólo ve datos permitidos; la tarjeta de cliente APP debe funcionar antes de existir contacto WhatsApp.

## 6. Checkout: adenda APP separada

Mantener el guard WhatsApp del contrato 1.0 y su excepción Playground controlada tal como están. No habilitar APP poniendo `IsWhatsAppActive=true` ni abriendo `AuthorizeAsync`. Crear contrato/adaptador APP separado sobre los componentes de pago que puedan compartirse.

Adenda propuesta: `schema_version`, `origin_channel: APP`, `portal_user_id`, conversación Portal y LidIA, `correlation_id`, intent/ciclo idempotente, `catalog_code`, versión de oferta e importe/moneda obtenidos del catálogo, `zoho_contact_id`, `zoho_deal_id`, fecha de verificación CRM, consentimiento explícito posterior a precio y URL de callback obtenida de la configuración de integración. El consentimiento liga cuenta, conversación, revisión de oferta y momento; no aceptar un simple boolean del móvil como única prueba. No crear ficha/trato en producción para satisfacer una dependencia de prueba.

Portal abre el checkout web desde su API de cuenta; la URL sirve para continuar el intent, no para elegir cuenta/expediente. Tras pago comprobado, callback firmado y durable al destino APP autorizado, correlación al mismo intent y actualización del timeline. No callback arbitrario enviado por móvil ni dato económico decidido por el modelo.

El notifier existente evita plantillas cuando el canal no es WhatsApp, pero todavía pasa por `ChatService.SendAdminMessageAsync`, y las conexiones pueden tener `NotifierWoztellChannelId`. La adenda exige comprobar que **ninguna** rama APP, seguimiento o reintento llega a Woztell. No basta con confiar en la ausencia de una plantilla.

## 7. Zoho: evento versionado e idempotente

Propuesta de evento `crm.deal.stage_changed.v1`, independiente de los eventos de checkout y las fases documentales. Productor: workflow Zoho + adaptador servidor/outbox con recepción durable; Portal consume mediante inbox durable. El despliegue/workflow efectivo de Zoho queda pendiente de lectura y acuerdo.

Envelope obligatorio: `schema_version: "1.0"`, `event_id` estable, `event_type`, `source`, `source_environment`, `occurred_at`, `deal_id` string, `source_revision` ordenable y estable, `previous_stage` si es comprobable, `stage`, `contact_id` opcional comprobado, referencia de servicio/catálogo, `correlation_id`, `checkout_intent_id`/`n_pedido` cuando exista vínculo verificado. Asignaciones CRM como referencias verificables según mapping acordado; sin referencias de pago ficticias.

La credencial fija organización/entorno y allowlist; `source_environment` se coteja con ella, no permite saltar tenant. Firma HMAC con key id, timestamp, nonce y payload; secreto exclusivo de eventos y comparación constante, misma prevención de replay propuesta para APP pero **otro dominio de protocolo/audiencia**. El receptor acepta sólo firma válida y configuración completa. Si Zoho no puede producir este envelope/firma, el adaptador debe hacerlo; no sustituirlo por secreto en query o webhook anónimo.

El adaptador conserva payload/id/version en los reintentos. `Modified_Time` y hash de snapshot son evidencia auxiliar: **no se presumen una secuencia estricta ni suficientes para distinguir cambios dentro del mismo instante**. Antes de implementar hay que cerrar cómo se obtiene la revisión ordenable y cómo se reconcilia con una relectura autenticada de Zoho. Si llegan varios cambios sin orden demostrable, quedan pendientes de reconciliación; no se inventa una etapa previa.

| Caso | Resultado contractual propuesto |
|---|---|
| Entra en `Cerrado ganado` sin prueba económica | Habilitación comercial/expediente según reglas acordadas; campos de pago ausentes y sin `payment.succeeded` |
| Ganado tras pago del mismo intent | Añadir evidencia CRM; una sola alta, invitación y efectos |
| Pago tras ganado | Añadir evidencia económica comprobada al expediente ya correlacionado |
| Mismo event id y payload | Acuse del resultado/recibo previo |
| Mismo event id, payload distinto | 409, revisión; no pisar el evento original |
| Duplicado semántico con otro event id | Deduplicar por organización/entorno/deal/revisión/tipo y negocio correlacionado |
| Evento antiguo | Registrar, reconciliar; no retroceder estado comercial/documental por llegada tardía |
| Reapertura o segunda entrada a ganado | Nueva revisión; conserva expediente y prueba económica. No segunda alta ni revocación automática |
| Identidad incompleta/conflictiva | Recibido y pendiente de resolución, sin conceder acceso por coincidencia |

Retornar 202 después de guardar inbox; no equivale a alta completada. ACK 200/202 de duplicados válidos. Reintentos propuestos tras timeout/429/5xx: 1 min, 5 min, 15 min, 1 h, 4 h y 24 h, con jitter y `Retry-After`; después cola de revisión recuperable. 400/401/409 exigen corregir/revisar, sin bucle ciego. Releer Zoho por servidor cuando sea necesario y usar transacción/claim/restricciones para reconciliar ganado y pago concurrentes.

Cuenta, trato y expediente se correlacionan por identidad de negocio comprobada, no sólo email/teléfono. Pago conserva sus importes, referencias y fechas; ganado conserva evidencia comercial; fase documental tiene su propio historial. Política ante reapertura/cancelación y quién autoriza retirar capacidades siguen siendo decisiones de negocio pendientes.

## 8. DEV y garantía de aislamiento

**No se puede garantizar hoy el aislamiento solicitado.** Hay evidencia de directorios de stacks, pero no lectura de conexiones actuales de Gestadia DEV/PRO. El registro Docker del 26/06 todavía llama «pendiente» a Gestadia; es histórico, no inventario operativo de octubre. El diseño Portal advierte que DEV de LidIA pudo apuntar al Portal real.

Antes de cualquier ensayo conectado se debe entregar esta matriz de configuración efectiva:

| Recurso | Evidencia necesaria |
|---|---|
| Runtime | Host/stack, build servido, SHA, base efectiva y esquema; separados de PRO |
| Proyecto/agente APP | IDs reales, activo/capacidades, versión/hash instrucciones y tools; sin automatismos heredados |
| Identidad/Portal | Emisor, credenciales APP de pruebas, API/BD y cuentas ficticias; sin enlaces a cuentas PRO |
| Zoho | Organización sandbox, conexiones por proyecto y por tool, scopes; no refresh token PRO |
| Pago | Portal de prueba, catálogo, clave/pasarela test, callbacks test; ninguna creación en live |
| Correo | Sink de pruebas y destinatarios controlados; invitaciones/notificadores sin SMTP PRO |
| WhatsApp/voz | Ninguna conexión emisora APP; egress bloqueado y transportes denegados también en trabajos diferidos |
| Soporte | Operadores/departamentos y notificaciones de prueba; sin Cliq/correo/WhatsApp PRO |
| Jobs/reintentos | Inbox/outbox, seguimiento postpago, automatizaciones y tareas programadas con destinos de prueba |

Garantía propuesta: comprobación de arranque que falle cerrada ante conexión/destino prohibido, credenciales y DB separadas, egress con allowlist de prueba y dobles para servicios externos al comienzo. El nombre «DEV», `IsSimulation` o un toggle de agente no bastan. Aceptación posterior: contadores/logs de efectos externos por prueba y cero llamadas/escrituras a destinos PRO.

## 9. Dependencias y orden de cierre

| Entrega | Equipo Gestadia Portal | Equipo Gestadia App | Responsabilidad runtime LidIA |
|---|---|---|---|
| Identidad | Registro/verificación, sesiones revocables, permisos por cuenta y expediente, índice durable de conversaciones | Almacenamiento de sesión, cambio de cuenta y recuperación entre dispositivos | Sujeto/vínculo neutral, pertenencia, alias CRM y revocación |
| S2S | Firmar desde servidor, conservar turn/key, gestionar timeout/polling | DTO visibles y acciones tipadas; sin secretos ni routing | Canonicalización/vectores, recibos, timeline/cursor y canal APP |
| Sondeo | Cuenta gratuita y capacidades | LidIA con opciones y texto libre | Agente dedicado, resultado estructurado, reglas de canje compartidas |
| Atención | Contexto de expediente y relación CRM verificada | Mensajes con estados de atención reales | Mapping, solicitud/cola/toma, scope de operador, transporte APP |
| Checkout | Intent, precio, cobro, correlación/outbox | Consentimiento y apertura web | Adenda, contexto APP y recepción/timeline sin Woztell |
| Ganado Zoho | Inbox/reconciliación, alta única, invitación y evidencia comercial/económica separada | Capacidades devueltas por servidor | Contribuir al mapping/eventos y evitar postpago WhatsApp en APP |
| Aislamiento | Portal/DB/pagos/correo/Zoho de prueba | Build y backend target por plataforma | Configuración efectiva APP, denegación de efectos y auditoría |

El responsable operativo de CRM debe confirmar los API names/asignaciones, workflow/evento y sandbox junto con Portal y runtime LidIA. No se da por asignada esa responsabilidad al equipo móvil.

Orden de acuerdo: (1) lectura efectiva y aislamiento, (2) identidad y pertenencia, (3) S2S/DTO/recuperación, (4) agente/canal y atención, (5) adenda checkout y evento Zoho. Después se podrá escribir un plan de implementación aprobado. Esta respuesta no autoriza ese paso ni despliegue.

Pruebas exigibles en esa fase: cuenta gratuita sin CRM; cuentas A/B sin acceso cruzado; mismo historial en dos dispositivos; firmas/nonce/rotación/revocación; cursor y cambios de soporte sin mensajes; textos/acciones duplicados y concurrentes; fallo después de persistir/ejecutar efecto; cola y toma humana en la misma sesión; pago/ganado en ambos órdenes y concurrentes; ganado sin pago; reaperturas; cero egress PRO. iOS, Android y web se acreditan por separado.

## 10. Fuentes de código y documentos

Rutas relativas a este repositorio, contrastadas en `15828edb0` (el grafo sirvió para descubrir símbolos; los tramos de código se verificaron en la revisión actual):

- [ChatSession.cs](../../LidIA.ChatAgent/Models/ChatSession.cs): contacto nullable, canal, estado y cancelación de automatismo; enum al final.
- [Agent.cs](../../LidIA.ChatAgent/Models/Agent.cs), [AgentInstruction.cs](../../LidIA.ChatAgent/Models/AgentInstruction.cs), [Project.cs](../../LidIA.ChatAgent/Models/Project.cs): configuración, versión de instrucción y destinos de soporte.
- [GestadiaPortalToolHandler.cs](../../LidIA.ChatAgent/Services/Integrations/GestadiaPortal/Agent/GestadiaPortalToolHandler.cs), `AuthorizeAsync`, líneas 346–430: guard de checkout.
- [GestadiaPortalCheckoutService.cs](../../LidIA.ChatAgent/Services/Integrations/GestadiaPortal/Checkout/GestadiaPortalCheckoutService.cs): persistencia dependiente de contacto WhatsApp.
- [GestadiaPortalConnection.cs](../../LidIA.ChatAgent/Models/Integrations/GestadiaPortal/GestadiaPortalConnection.cs) y [GestadiaPortalPostPaymentNotifier.cs](../../LidIA.ChatAgent/Services/Integrations/GestadiaPortal/PostPayment/GestadiaPortalPostPaymentNotifier.cs): conexión/destino y entrega postpago.
- [PublicChatTurnService.cs](../../LidIA.ChatAgent/Services/PublicChat/PublicChatTurnService.cs) y [PublicChatTimelineService.cs](../../LidIA.ChatAgent/Services/PublicChat/PublicChatTimelineService.cs): patrón de autorización, idempotencia, acciones y recibos, sin reutilizar grants.
- [ChatService.cs](../../LidIA.ChatAgent/Services/ChatService.cs), `RequestSupportAsync`, línea 5025; [SupportQueueService.cs](../../LidIA.ChatAgent/Services/Support/SupportQueueService.cs), `TransferAsync` línea 528 y toma línea 1070; [OperatorConversationReader.cs](../../LidIA.ChatAgent/Services/Support/OperatorConversationReader.cs): sesión/cola/lectura scoped.
- [ClientKeyLinker.cs](../../LidIA.ChatAgent/Services/ManualHandling/ClientKeyLinker.cs), [ClientPhoneLink.cs](../../LidIA.ChatAgent/Models/ClientPhoneLink.cs) y [WhatsAppContact.cs](../../LidIA.ChatAgent/Models/WhatsAppContact.cs): semántica actual de ClientKey.
- [AutomationTimeoutBackgroundService.cs](../../LidIA.ChatAgent/Services/AutomationTimeoutBackgroundService.cs), selección de sesiones desde línea 61: no filtro por canal.
- [ZohoService.cs](../../LidIA.ChatAgent/Services/ZohoService.cs), creación de trato desde línea 1965: propietario copiado del Contacto, sin contrato de gestor APP.
- [GestadiaPortalWebhookController.cs](../../LidIA.ChatAgent/Controllers/GestadiaPortalWebhookController.cs), [GestadiaPortalSignatureVerifier.cs](../../LidIA.ChatAgent/Services/Integrations/GestadiaPortal/Webhooks/GestadiaPortalSignatureVerifier.cs): firma de callback existente, distinta de la propuesta APP.
- [Diseño A/B](../superpowers/specs/2026-09-28-pruebas-ab-agentes-design.md), §1; [manual departamentos](../../DOCUMENTACION/MANUALES/soporte/departamentos.md); [estado Docker histórico](../../DOCUMENTACION/DOCKER/estado-entornos.md).
- Portal: preparación `399ca21` y contrato checkout 1.0 de `docs/integraciones/2026-07-28-contrato-lidia-portal-v1-0.md`. El código Portal consultado se usa como contraste local, no como prueba de su runtime publicado.

Verificación de esta entrega: Git local/remoto y lectura estática/configuración accesible. No se ejecutaron smokes, suite de producto ni integraciones externas: no hay cambios de producto y el entorno APP aislado no está acreditado.
