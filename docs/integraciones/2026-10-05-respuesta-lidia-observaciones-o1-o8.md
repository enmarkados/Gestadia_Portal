# Respuesta LidIA a las observaciones Portal O1–O8

Fecha: **05/10/2026**. Estado: **conformidad técnica de arquitectura y propuesta de cierre por punto; pendiente de acuerdo conjunto y evidencia runtime**. No autoriza implementación, migraciones, despliegue, pruebas conectadas ni activación de canales.

Conformes con App → Portal → LidIA, agente operativo APP dedicado con reglas de canje compartidas, autenticación S2S y conversaciones durables. Conformes con el reparto propuesto: **Equipo Gestadia Portal** gestiona cuentas, permisos, cobros y reconciliación de expedientes; **responsabilidad runtime LidIA**, motor, timeline, recibos y soporte APP; **responsable CRM**, reglas de negocio, workflow, campos y asignaciones. **Equipo Gestadia App** consume permisos y estados a través de Portal. El equipo móvil no resuelve identidades CRM, agentes o destinatarios.

La respuesta es documental y revisable. Los verbos de obligación en las decisiones describen el **contrato propuesto**, no capacidades ya implementadas.

## Documentos, anexos y evidencia

- [Propuesta LidIA del 04/10](2026-10-04-respuesta-contrato-app-lidia.md), conservada sin modificar: SHA-256 `a255ecb17074c9f33271ad687db00057a7a280745721c62ff1768af28ef93605`.
- [Observaciones Portal O1–O8](/Users/gonchumon/code/enmarkados/Gestadia_Portal/docs/integraciones/2026-10-04-observaciones-portal-contrato-app-lidia.md), documento recibido del 04/10; no forma parte de este repositorio.
- [Anexo de firma y normalización](2026-10-05-app-s2s-anexo-firma.md), [vectores públicos de prueba](fixtures/app-s2s-v1-vectors.json), [esquemas DTO JSON Schema](fixtures/app-v1-dtos.schema.json) y [reglas de uso de los DTO](2026-10-05-app-anexo-dtos.md).
- [GLOSARIO.md](../../GLOSARIO.md).

Lectura estática LidIA sobre `15828edb011bfb2ef17d34f564cf23dfa6e0f107`. Checkout Portal consultado en `app/main`, HEAD `c4bb747`, con el esquema/flujo que motivaron la revisión de `399ca21`. Estos commits prueban contenido de repositorio; **no prueban qué configuración está publicada**. La actualización al remoto del 04/10 dejó `dev/IA/main` local y remoto en `15828edb0`; este documento no afirma una nueva sincronización remota del 05/10.

| Observación | Respuesta | Qué falta para consolidar |
|---|---|---|
| O1 Firma/rotación | Conforme; representación, restricciones y vectores concretados | Contraste del firmador Portal; verificador/proxy y replay se prueban en implementación autorizada |
| O2 Revocación | Conforme; instante, propagación y permisos precisados | Conformidad Portal; medir plazo entre nodos/workers posteriormente |
| O3 Recuperación | Conforme; DTO, lookup, revisiones y retención precisados | Conformidad Portal/App y política de retención del historial |
| O4 Identidad | Conforme con referencias/pertenencia; cardinalidad pendiente | Negocio/CRM confirma si un trato equivale a un expediente |
| O5 Pago/ganado | Conforme; reconciliación única con estados separados | Portal incorpora diseño transaccional y reglas de efectos en contrato |
| O6 Zoho | Conforme con propietario Portal; observación sobre orden de origen | Aceptar alternativa de instantáneas o demostrar una fuente ordenada real |
| O7 Checkout/atención | Conforme; adenda y callback especificados | CRM confirma prerrequisitos y API names; mapping de operadores elegibles |
| O8 Runtime/DEV | Conforme con requisito; sin acreditación efectiva | Lectura autenticada y matriz de aislamiento antes de pruebas conectadas |

## O1. Firma: conformidad y precisión

Aceptamos el digest SHA-256 de cero bytes en GET y **corregimos expresamente** la ambigüedad del 04/10: la última línea no es vacía. La línea de idempotencia sí lo es. El anexo fija once líneas, caracteres/límites, UTF-8, ruta escapada, `%20`/`%2B`, cabeceras duplicadas, ventana ±300 s y nonce durable diez minutos. POST se firma por bytes, no por un JSON reserializado. Cada audiencia y sentido tiene claves exclusivas; checkout 1.0 permanece en su protocolo vigente.

La identidad `integration_id` es durable y sobrevive a la rotación. Nonce se reclama por key id; idempotencia por integración/sujeto/operación/conversación/key, con unicidad adicional de `turn_id`. La huella normalizada no depende de la clave, fecha, nonce, firma o `correlation_id`. Una firma nueva con otra key puede recuperar el mismo recibo.

Publicamos cuatro vectores positivos contrastados por bytes/digest/HMAC en Node 24.14.1 y .NET 10 (SDK 10.0.203), y nueve especificaciones negativas. El cálculo criptográfico usa las mismas primitivas disponibles en el runtime del proyecto; no se ha probado un verificador APP real ni la totalidad de JCS. Replay distribuido, retiro de claves y canonicalización tras proxy son pruebas de aceptación futuras, no hechos del runtime actual. Los vectores contienen sólo claves públicas de prueba.

**Dependencias:** LidIA aporta representación/verificador futuro; Portal contrasta firmador, preservación del body y scope durable. Ambos acuerdan la audiencia y configuración real antes de conectar. Ninguna clave nueva se aprovisiona en esta revisión.

## O2. Revocación: conformidad y alcance exacto

Definimos `t0 = commit de la revocación en la base autoritativa LidIA`. El objetivo contractual **≤60 s** cuenta desde t0 para entradas en cualquier nodo y trabajos aún no enviados. No cuenta desde el clic en Portal ni desde la llegada a una cola. Portal bloquea inmediatamente sus accesos desde su propio commit y persiste, en la misma transacción, la salida durable hacia LidIA; si no puede entregarla, muestra estado pendiente de propagación y reintenta con el mismo evento/key. El retraso de transporte no se oculta como parte cumplida del plazo LidIA.

Respuesta 200 tras persistencia:

```json
{
  "schema_version": "1.0", "scope": "account", "persisted": true,
  "revoked_at": "2026-10-05T10:00:00.000Z", "revocation_version": "7",
  "enforcement_deadline": "2026-10-05T10:01:00.000Z",
  "enforcement_status": "propagating"
}
```

El 200 **no certifica todos los nodos efectivos**. `revocation_version` es un contador monotónico por sujeto, común a los scopes, leído también por workers. Repetir una revocación ya persistida recupera su t0/versión; no la incrementa. Una operación posterior que retire otro scope sí incrementa. Revocar `crm_link` retira todos los vínculos CRM activos de ese sujeto en ese scope, sin afectar otras integraciones/proyectos/entornos.

Propuesta de propagación: persistencia primaria y aviso de invalidación mediante outbox; caché de autorización positiva con edad máxima de 60 s, contada desde su lectura autoritativa, nunca renovada por recibir mensajes atrasados. No resolver revocación desde réplicas con retraso no acotado. Si no puede renovarse la comprobación al vencer la caché, denegar temporalmente. Workers leen versión autoritativa al reclamar trabajo y **antes de cada efecto externo**; si cambió, cancelan/reconcilian. Jobs admitidos bajo otra versión no obtienen una excepción. La evidencia posterior debe incluir caída del canal de invalidación y un nodo aislado.

El gate de admisión del efecto y la revocación deben serializarse sobre la misma autoridad. Una operación admitida antes de t0 y ya en vuelo puede finalizar; conservar su identidad y reconciliarla. No prometer anular una llamada que el proveedor ya recibió. El plazo no justifica que una cola comience un envío con un permiso revocado conocido.

| Operación | `account` revocada | Sólo `crm_link` revocado |
|---|---|---|
| Sondeo gratuito nuevo sin CRM | Denegado | Permitido para cuenta verificada activa |
| Timeline exclusivamente público de sondeo | Denegado | Permitido tras autorización de pertenencia |
| Historial/contexto CRM, expediente, checkout, gestor/comercial | Denegado | Denegado hasta reconciliación explícita del vínculo |
| Soporte general sin datos CRM | Denegado | Permitido si está habilitado, sin acceder a conversación privada previa |
| Revocación repetida | Credencial de ciclo de vida permitida | Igual |
| Ingestión de pago/evento auténtico | Se conserva evidencia, se restringe exposición | Igual; no restitución automática del vínculo |

Una conversación con contexto privado queda bloqueada para lectura/turnos privados al revocar el vínculo; no se presenta su historial completo con la excusa de conservar sondeo. Para continuar gratis se abre explícitamente una conversación sin contexto CRM. Una proyección histórica pública requiere clasificación confiable en servidor; mensajes mixtos o sin clasificación se ocultan íntegramente, sin intentar redactarlos por palabras del modelo. También se filtran presentaciones, resultados y recibos que contienen referencias privadas.

Logout de dispositivo sólo retira esa sesión Portal. Bloqueo/borrado de cuenta retira todas las sesiones Portal y el sujeto LidIA. Reactivación y borrado físico quedan fuera de v1; `account_status: active` no reabre permisos. Ingestión de eventos económicos y ciclo de vida emplean credenciales de servicio distintas del acceso del sujeto: su revocación no descarta la contabilidad.

**Dependencias:** Portal define sesiones revocables y outbox; LidIA, persistencia/gates/caché/workers. El JWT Portal actual de 30 días no demuestra este comportamiento. Los 60 s son una propuesta pendiente de medición, no una garantía hoy acreditada.

## O3. Recuperación: conformidad, recibos y revisiones

[El anexo DTO](2026-10-05-app-anexo-dtos.md) incorpora esquemas de inicio, turno, handoff, recibo, timeline, presentación/acción, sondeo, revocación, callback y ACK. Rechazo de propiedades desconocidas y uniones de turno `text|action` exclusivas. Una acción envía sólo ids opacos y revisión; el significado, permiso y destino se resuelven en servidor. No admite tool names ni argumentos arbitrarios.

**Dos modos de GET en la misma ruta:**

1. `GET .../timeline?cursor=...&limit=50`: página cronológica de mensajes autorizados; devuelve además **estado actual** de soporte, sondeo y `state_revision`, aunque la página esté vacía. `turn_statuses` sólo incluye recibos de los turnos presentes en esa página y el turno activo, no todo el historial. Máximo 100 mensajes y 101 recibos; una sola ejecución conversacional activa por conversación. Un nuevo turno mientras otra ejecución está activa devuelve 409 `turn_conflict`, conservando el turno que el Portal debe sondear.
2. `GET .../timeline?turn_id={uuid}`: lookup exacto del recibo autorizado, independiente de mensajes; excluye `cursor`/`limit`. Devuelve 200 `ReceiptLookup`, incluso `accepted`, `processing` u `outcome_unknown`. No requiere descargar el timeline completo. Recibo inexistente: 404 `turn_not_found`. Detalle retirado con tombstone: 410 `receipt_retired`. Antes de estos resultados se comprueba pertenencia; conversación ajena/inexistente: 404 indistinguible `conversation_not_found`.

Cursor opaco autenticado, ligado a integración/sujeto/conversación y última secuencia leída, sin vencimiento de firma HTTP embebido. La página es un snapshot consistente: mensajes y estados visibles proceden de una revisión confirmada. `next_cursor` avanza al último mensaje devuelto; una página vacía conserva el punto. El cursor no silencia cambios de estado. Orden por secuencia durable, no timestamp; punto retirado: 410 `cursor_expired`, con resincronización únicamente dentro de esa conversación autorizada.

`state_revision` inicia en `"1"` y aumenta una vez por transacción que cambie estado público: mensajes/presentaciones, recibos, soporte, resultado de sondeo, permisos visibles o cierre. Un poll vacío no incrementa. `receipt_revision` aumenta al cambiar el recibo; `result_revision` al modificar el sondeo; `presentation_revision` al modificar/inutilizar la presentación. Todos son contadores strings, persistidos en la misma transacción que el cambio. Su revisión propia no sustituye `state_revision`.

202 sólo después de recibo y trabajo durables. `completed` acredita procesamiento del turno, también entrega al timeline de soporte, sin afirmar respuesta humana. `outcome_unknown` bloquea repetir efectos externos y requiere reconciliación por la misma operación. Poll inicial 3 s, backoff hasta 15 s; no lanzar otro turno para reparar un timeout. Un reintento devuelve el recibo actual de la operación original.

**Retención propuesta:** detalle de recibo durante 30 días desde `accepted_at`, con `retained_until` explícito. Operaciones no resueltas no pierden su ledger de reconciliación al llegar esa fecha. Tombstone de key, turno, acción y huella se conserva durante toda la vida retenida de la conversación; retirar el detalle nunca libera su identidad. Al borrar el historial se conserva la marca mínima de conversación retirada según la política de borrado acordada: nunca se reutiliza su id ni se aceptan operaciones para él. Plazo total del historial/cursor y de esas marcas sigue pendiente de la política Portal/LidIA; no se inventa un plazo legal.

Sondeo estructurado: `collecting|needs_clarification|qualified|not_qualified|human_review|stopped`, reglas/versiones, requisitos y evidencia por ids de mensajes. `qualified` es una evaluación preliminar del sondeo, **no habilitación de expediente ni aprobación administrativa**. Sólo Portal calcula capacidades a partir de identidad, evidencia comercial/económica y permisos; no a partir de frases del asistente. Se persistirá en state tipado, no en argumentos crudos de `Memory`.

**Dependencias:** LidIA mantiene secuencia, recibos y DTO; Portal, índice cuenta/conversación y turnos/keys estables; App consume únicamente la API Portal y muestra pendiente/asignado/atendido de forma distinta. Adjuntos de chat fuera de v1.

## O4. Identidad: conformidad y cardinalidad pendiente

Aceptamos `portal_user_id = User.id` y `case_ref = Expediente.id`. Las referencias aisladas, `nPedido`, el alias `client_key`, email o teléfono no otorgan acceso. Portal es autoridad de pertenencia de cuenta/expediente; CRM de registros/asignaciones; LidIA persiste contexto validado limitado a integración/proyecto/entorno/sujeto/conversación.

Proponemos que Portal sea dueño del proceso de verificación y comunicación del vínculo **cuenta → contacto → trato → expediente**. Verifica cuenta activa, pertenencia del expediente, contacto CRM acreditado y relación real del trato/servicio. LidIA sólo permite herramientas/contextos de esa asociación comprobada. Inicio gratuito no exige contacto, trato, alias ni expediente. Si ya existe una cuenta gratuita, se usa esa cuenta sin nueva invitación. Invitación sólo cuando falte la cuenta y el proceso acordado permita acreditarla.

La asociación no puede ampliarse por body del móvil. Para introducir o actualizar un vínculo CRM, Portal debe producir una atestación server-side versionada, con ids de cuenta/expediente/contacto/trato/organización, scope, evidencia y fecha. **Dependencia adicional detectada:** las cuatro rutas más revocación no contienen esa operación. Proponemos reservar `POST /api/integrations/lidia/app/v1/subjects/{portalUserId}/crm-links` con credencial de identidad, idempotencia y verificación de pertenencia del emisor; su DTO y política de actualización deben consolidarse conjuntamente antes de habilitar checkout/contexto CRM. No presumir que un `client_key` enviado en `/sessions` crea ese vínculo. Esta ruta no se considera cerrada en esta entrega.

Ganado antes de cuenta/expediente: inbox durable `pending_identity`/`pending_correlation`, sin acceso ni alta atribuida por aproximación. Reconciliar posteriormente con identidad/pedido/intent verificados; no perder el evento. Conversión Lead→Contact actualiza mapping acreditado sin cambiar el sujeto ni importar WhatsApp. Conflictos de cuentas/contactos o reasignaciones de trato se escalan, sin unión automática.

**No confirmamos hoy «un trato → un expediente».** El esquema actual no lo garantiza: `nPedido` es único y `zohoDealId` no. Recomendamos v1 para un único servicio de canje por trato y unicidad `(organización CRM, entorno, deal_id)` **si negocio/CRM confirma esa cardinalidad**. Antes de migrar, auditar duplicados y tratos multiservicio. Si se admiten varios servicios, fijar primero una referencia estable de línea de servicio y su clave compuesta; no deduplicar ni habilitar todos los expedientes por el trato global.

**Dependencias:** Portal propone atestación y resolución de pendientes; CRM/negocio confirma cardinalidad, evidencia de vínculo y conflictos; LidIA valida scope/revisión. La cardinalidad y el DTO de vínculo bloquean cerrar O4.

## O5. Pago y ganado: conformidad con reconciliación común

Confirmamos las limitaciones de código descritas por Portal: `fulfillPayment` filtra `pago_pendiente` y no reclama de forma atómica antes de procesar; creación del trato escribe ganado con triggers; fallback puede crear otro trato; cierre del intent y encolado de `payment.succeeded` son pasos separados. Son hechos de código, no una auditoría de pagos actuales.

Propuesta: un reconciliador Portal común con tres verdades separadas: **evidencia económica**, **evidencia comercial vigente/observada**, **estado documental**. Una habilitación de acceso puede justificarse por cobro o ganado comprobado, según negocio. Ninguna habilitación cambia un no-pago en pago.

Dentro de una transacción local, reclamar la entrada/inbox, resolver la clave de negocio acordada O4, bloquear ese negocio, persistir evidencia, comprobar/crear la habilitación única y registrar las salidas outbox pertinentes. Restricciones durables, no un `if` seguido de escrituras separadas. El ledger económico deduplica por `(proveedor, cuenta del proveedor, entorno, provider_payment_id)` y verifica intent, cuenta, importe/moneda y servicio; `event_id` deduplica transporte, no sustituye esa identidad económica.

| Orden/caso | Resultado propuesto |
|---|---|
| Pago → ganado | Registrar pago y habilitar una vez; el ganado posterior añade evidencia comercial al mismo negocio |
| Ganado → pago | Habilitar por evidencia comercial; registrar después el pago real aunque ya esté habilitado; no repetir alta/bienvenida |
| Ambos concurrentes | Unicidad/lock de negocio y transacción convergen en la misma habilitación; ambas evidencias quedan registradas |
| Ganado sin cobro | Estado comercial y permiso acordado; campos de pago ausentes, sin `payment.succeeded`, recibo económico o fecha ficticia |
| Pago antes de guardar `zohoDealId` | Correlación con intent/pedido atestiguados; si no basta, inbox pendiente y relectura; no crear segundo trato |
| Cuenta gratuita existente | Mantener cuenta y añadir permisos; sin invitación redundante |
| Reapertura | Guardar evidencia y revisión; no borrar cobro, expediente ni revocar automáticamente acceso hasta regla de negocio |

Cada efecto usa una identidad semántica: bienvenida/alta por primera habilitación; confirmación económica por pago comprobado; callback por evento económico. Distintos avisos legítimos pueden existir, **cada uno una sola vez**, sin confundir «no duplicar avisos» con omitir la confirmación de un cobro posterior. Event ids y claves de efecto se conservan al reintentar.

Ninguna transacción engloba llamadas remotas. Outbox, ledger de efecto y reconciliación resuelven caída antes/después del envío; un proveedor sin idempotencia puede dejar `outcome_unknown`, sin reenvío ciego. Actualizar un trato conocido que falle conserva ese trato: el fallback actual de creación **queda excluido del diseño APP**. Pago auténtico se registra aun con cuenta revocada; exposición y avisos se restringen después.

**Dependencias:** Portal diseña la transacción, restricciones y efectos con CRM; negocio confirma reglas de acceso/reapertura y cardinalidad. Pruebas futuras: ambos órdenes, concurrencia, duplicados, caídas en cada frontera, revocación, ganado sin pago y cuenta previa. No se modifica ahora `fulfillPayment`.

## O6. Zoho: propietario conforme, observación sobre revisión de origen

Aceptamos **Equipo Gestadia Portal como único propietario del adaptador productor**, de su outbox, identidad de evento, firma, reintentos, alertas y reconciliación. También recibe el inbox Portal. El responsable CRM mantiene workflow/API names, organización/sandbox, permisos OAuth y asignaciones. Si se decide alojar el adaptador en otro servicio, se documenta ubicación; no cambia automáticamente el propietario ni se traslada al móvil/LidIA.

No hay mecanismo demostrado que haga `source_revision` estrictamente ordenable por trato en la instalación real. La API Zoho documenta lectura y `Modified_Time` ([Get Records v8](https://www.zoho.com/crm/developer/docs/api/v8/get-records.html)); eso **no prueba una secuencia exhaustiva de transiciones**. Un contador de llegada local no reemplaza la revisión de origen. Cambios rápidos ganado→abierto→ganado pueden no ser reconstruibles desde la siguiente instantánea.

**Observación al diseño del 04/10:** recomendamos v1 con `crm.deal.snapshot_observed.v1` en vez de afirmar `crm.deal.stage_changed.v1` sin fuente ordenada. Esta sustitución semántica requiere conformidad Portal/CRM. Esquema en anexo: organización/entorno/trato, contacto/servicio, etapa observada, `observed_at`, `source_modified_at` cuando exista y `source_revision = sha256:<huella JCS de la instantánea validada>`. Huella calculada sobre objeto con exactamente `zoho_org_ref`, `source_environment`, `deal_id`, `contact_id`, `service_ref`, `source_modified_at`, `stage`, `commercial_user_ref`, `manager_user_ref`; null explícito en los opcionales y fechas UTC normalizadas. Referencias de correlación pueden quedar null hasta verificación, pero no alteran la huella de la instantánea. No incluye pagos ni etapa previa inventada. `source_revision` identifica, **no se compara con `<`/`>`**.

El adaptador obtiene la evidencia con lectura autenticada CRM. Workflow puede despertar una lectura, pero sus datos declarados no bastan para habilitar acceso. El reconciliador serializa por trato/negocio y reconsulta estado vigente antes de decidir; snapshots atrasados quedan como observaciones históricas y no fuerzan habilitar contra una etapa actual distinta. Una `processing_revision` monotónica local registra decisiones; se identifica expresamente como revisión local, nunca como orden Zoho. Reconciliación periódica autenticada recupera señales perdidas, con frecuencia/permisos a acordar; no se crea automatización ahora.

Si negocio requiere **todas** las transiciones/reaperturas, v1 de instantáneas es insuficiente: responsable CRM debe aportar una fuente con orden durable por trato, revisiones estables y pruebas de cambios rápidos. Hasta entonces `stage_changed.v1` queda pendiente y no se presenta como contrato cerrado.

Receptor propuesto Portal: `POST /api/integrations/zoho/v1/events`, diferente del webhook documental vigente. Firma dominio/audiencia `gestadia-crm-event-v1` / `portal:gestadia:{dev|pro}:crm-events`, con secreto exclusivo y sin sujeto APP. `Idempotency-Key = event_id` UUID. Validar auth/esquema antes del claim. Tras commit inbox, 202 `EventAck`; duplicado idéntico, 200 con mismo `receipt_id` y `duplicate: true`; mismo evento/body semántico distinto, 409. Firma inválida 401, esquema inválido 400, fallo de persistencia 503; nunca ACK durable si no se guardó.

ACK: `schema_version`, `event_id`, `receipt_id`, `persisted: true`, `duplicate`, `status: received`, `received_at`. Acredita recepción, **no expediente habilitado**. `source_revision` repetida con diferente event id no crea otra habilitación: se reconcilia por negocio. No se descarta un evento nuevo sólo por una fecha igual si puede tener datos distintos.

Reintentos de transporte: mismo event id/body y nueva firma/nonce; 5 s, 30 s, 2 min, 10 min, 1 h y después cada hora hasta 24 h, con jitter ±20% y `Retry-After` cuando exista. Al agotar: cola durable de revisión propiedad Portal, alerta al responsable CRM/Portal y reenvío manual con la misma identidad, sin pérdida del evento. 400/409 requieren revisión; 401 admite refrescar credencial/configuración sin mutar evento, alertando. Un 202 entrega a inbox; errores de negocio pasan a pendientes internos y reconciliación, no a repetir transporte indefinidamente.

Reapertura/cancelación no retira automáticamente acceso ni datos económicos. Recomendamos revisión de negocio del permiso comercial, con suspensión futura sólo por política explícita. **Pendiente de decisión**, sin inventar la etapa anterior a partir del snapshot.

## O7. Checkout y atención: conformidad con adenda separada

El sondeo gratuito no exige CRM. Proponemos checkout APP **con Contacto y Trato verificados obligatorios**. Portal orquesta la preparación a través del adaptador CRM cuyo responsable acuerda el workflow: localizar/reutilizar o crear fichas con permiso server-side, acreditar relaciones con cuenta/servicio/expediente e intent, y persistir el resultado antes de pedir enlace. LidIA no crea fichas por texto del usuario ni admite ids del móvil. Si CRM está pendiente/conflictivo/no disponible, no generar checkout; error recuperable y conservación del sondeo.

La adenda de solicitud incluye obligatoriamente `origin=app`, cuenta, conversación APP, `case_ref`, contacto/trato/organización CRM, intent, oferta y revisión, consentimiento y callback configurado. Precio/moneda salen del catálogo Portal. Consentimiento expresa versión de texto, oferta aceptada, fecha, cuenta/conversación y `consent_ref` auditado; no se acredita por una casilla que el móvil simplemente declara. Ruta callback tomada de configuración allowlist, nunca URL elegida por móvil/modelo. El DTO de generación de enlace se consolida con el DTO de vínculo O4; no se introduce una rama APP en el guard WhatsApp 1.0.

**Callback APP propuesto:** `POST /api/integrations/lidia/app/v1/checkout-events`. `CheckoutCallback` del anexo: versión, `event_id`, `payment.succeeded`, emisor/entorno, ocurrido, sujeto/conversación/expediente/intent, oferta/revisión/consentimiento, organización/contacto/trato y pago real (proveedor/id, `paid_at`, importe en unidades menores y moneda). Los ids CRM son datos server-side, no datos expuestos al móvil. Ganado sin pago usa el flujo comercial O6 y no este callback.

Firma propia `gestadia-app-checkout-event-v1`, audiencia `lidia:gestadia:{dev|pro}:checkout-events`, prefijo `app-checkout-v1=`, subject de la cuenta, key/event id estable. Portal emite sólo desde outbox tras reconciliar pago auténtico. LidIA valida integración/entorno y correlación persistida de intent/cuenta/conversación/caso, además de firma; no acepta que el callback cree una nueva pertenencia CRM. Si falta correlación durable, recibe en inbox autorizado pendiente, sin actualizar conversación hasta verificarla. Pago lo conserva Portal aunque LidIA esté indisponible.

ACK y reintentos iguales a O6, con ledger económico del receptor para impedir duplicar el mismo pago bajo otro event id. Cuenta revocada: guardar recepción de servicio y marcar `withheld_account_revoked`, sin generar mensaje visible ni tareas de atención. Conversación cerrada con permisos vigentes: anotar evento en su timeline de lectura y actualizar estado de pago, sin reabrir sesión, IA o seguimiento. Vínculo CRM revocado: conservar evento y bloquear exposición privada hasta reconciliación. No usar otra conversación, email o WhatsApp como fallback implícito.

**Atención:** conformes con la misma ChatSession/timeline. Entrada desde sesión activa por el patrón `RequestSupportAsync`; `TransferAsync` opera en cola/soporte, no reemplaza el escalado inicial. Solicitud, asignación y toma humana son estados distintos. APP no admite `targetUserId` o departamento desde móvil.

El responsable CRM debe confirmar API names y semántica de comercial, gestor y área. Hoy `Owner` está en el código, pero no acredita gestor. Mapping propuesto: `(organización CRM, entorno, usuario CRM, rol comercial/gestor)` → operador LidIA elegible y departamento configurado del proyecto. Verificar pertenencia, rol, estado operativo y permiso del expediente; no mapear por nombre visible/email aproximado. Mapping ausente: 409 `routing_unavailable` u oferta explícita de soporte general permitido, sin sustitución arbitraria.

Se necesita transporte APP de operador y avisos, con gate server-side de canal en entrada, herramientas, jobs, callbacks y salida. **Cero llamadas Woztell en APP**, incluidas ramas de notifier/reintento. Guard WhatsApp real del checkout 1.0 se conserva con su excepción Playground vigente y controlada. Adjuntos de chat fuera de v1; documentos por API Portal autorizada.

**Dependencias:** Portal, preparación CRM, consentimiento, checkout/outbox; CRM, campos/asignaciones y reglas; LidIA, inbox, correlación y transporte/soporte; App, interfaz y permisos Portal. Campo gestor, mapping efectivo y DTO de vínculo siguen pendientes.

## O8. Runtime y DEV: conformidad, comprobación pendiente

**Hechos actuales:** el código mantiene `ChatSessionChannel.Web|WhatsApp`, no APP. Existen tools/automatismos/notifiers que necesitan gates APP específicos; un toggle o agent id no demuestra aislamiento. La referencia a agente 119 «LidIA Canje v4» es documental histórica. El 05/10 la pestaña disponible de `https://lidia.gestadia.com/iniciar-sesion` muestra el formulario de acceso, sin sesión autenticada; no se ha consultado la fila/configuración efectiva del 119. No podemos confirmar nombre, proyecto, activación, instrucción/versiones, canales ni conexiones actuales.

La configuración local encontrada sólo identifica una conexión `lidia_local_dev`; no prueba Gestadia DEV publicado. No reutilizamos como evidencia la base DEV de otro proyecto, ni reservamos los ids históricos como agentes APP actuales. Agente APP dedicado, proyecto y entorno DEV exactos quedan **sin asignación confirmada**.

| Área | Evidencia requerida antes de pruebas conectadas | Responsable |
|---|---|---|
| Runtime/build | URL, stack, SHA/version servido, hora de captura y nodo efectivo | LidIA/infra |
| Agente 119 PRO | Lectura autenticada: id, proyecto, activo, instrucción/revisión y overrides, tools/canales/conexiones efectivas | LidIA |
| Agente APP DEV | Id/proyecto confirmado, agente dedicado, núcleo de canje/versiones, allowlist APP, auto-tools globales y automatismos deshabilitados/excluidos | LidIA |
| Bases/cache/colas | Servidor/base/scope efectivamente resueltos, permisos DEV, colas/jobs propios, sin lectura/escritura PRO | Cada servicio |
| S2S/identidad | Integración y audiencias DEV, key ids segregados, revocación/claims compartidos sólo dentro de DEV | Portal/LidIA |
| Zoho | Organización y sandbox reales, OAuth/roles/API names, permisos efectivos, producer/inbox de prueba | Portal/CRM |
| Pagos | Cuenta test y claves/webhooks test del proveedor, catálogo e intents DEV | Portal |
| Correo/avisos | Captura o buzón de prueba; bloqueo de destinatarios/proveedores PRO y notificaciones internas | Portal/LidIA |
| WhatsApp/voz | APP sin conexiones emisoras; deny de tool/transporte/jobs y egress contra destinos PRO | LidIA/infra |
| Soporte | Operadores/departamentos DEV y transporte APP; sin Cliq, correo o Woztell PRO | LidIA/CRM |
| Callback/reintentos | Rutas/audiencias DEV, inbox/outbox/ledger DEV y sin fallback PRO | Portal/LidIA |
| Red/secretos | Restricciones efectivas de salida y permisos; inspección sin copiar secretos en informes | Infra/cada servicio |

**Estado de todas las filas: pendiente de evidencia efectiva conjunta**, salvo las lecturas de código señaladas. Una etiqueta DEV o una lista de nombres de conexiones no convierte la matriz en verificada. Primero conformidad documental y pruebas offline con dobles; después autorización expresa para el alcance de pruebas conectadas, captura de configuración efectiva y prueba trazable de cero efectos en CRM/pagos/correo/WhatsApp PRO. Nada se activa para obtener esta evidencia.

## Próximo cierre solicitado a Portal y CRM

Solicitamos conformidad u observaciones concretas sobre firma/DTO/revocación; confirmación de cardinalidad trato/expediente y formato de atestación de vínculo; aceptación de instantáneas Zoho o fuente ordenada demostrable; API names comercial/gestor, regla de reapertura y prerrequisitos CRM. Con esas respuestas se consolida un único contrato, marcando por separado verificaciones runtime pendientes. La revisión técnica favorable no equivale a cierre del contrato ni a autorización de implementación.

## Evidencia estática relevante y validación de esta entrega

- Portal: `backend/prisma/schema.prisma` (`User`, `Expediente`, `CheckoutIntent`); `backend/src/routes/checkout.js` (`fulfillPayment`); `backend/src/services/zoho.js` (`createDealForExpediente`). Ver observaciones Portal para sus referencias verificadas.
- LidIA: [fuentes enlazadas en el documento del 04/10](2026-10-04-respuesta-contrato-app-lidia.md#10-fuentes-de-código-y-documentos), especialmente `ChatSession`, `GestadiaPortalToolHandler.AuthorizeAsync`, `RequestSupportAsync`, `SupportQueueService.TransferAsync`, `ClientKeyLinker` y jobs/notifiers.
- Validación documental: conservación del original, JSON parseable y referencias locales; vectores offline Node/.NET para bytes, SHA-256 y HMAC. Las pruebas negativas de protocolo y el estado distribuido **no se han ejecutado contra adaptadores**, que no están implementados. No se hacen llamadas de negocio, escrituras de BD, commits/push, cambios de entorno o despliegues.
