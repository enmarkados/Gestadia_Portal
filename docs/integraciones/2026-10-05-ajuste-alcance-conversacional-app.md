# APP ↔ Portal ↔ LidIA: ajuste al alcance conversacional

**05/10/2026. Propuesta ajustada a la instrucción expresa del usuario.** El reparto es confirmado; los DTO/rutas siguen propuestos y pendientes de conformidad conjunta. Sin implementación, despliegue ni activación.

Fuente del reparto: [RESPONSABILIDADES-INTEGRACION.md de Portal](/Users/gonchumon/code/enmarkados/Gestadia_Portal/docs/app/RESPONSABILIDADES-INTEGRACION.md). [Glosario](../../GLOSARIO.md) · [Firma S2S](2026-10-05-app-s2s-anexo-firma.md) · [DTO de timeline/turnos](2026-10-05-app-anexo-dtos.md).

## 1. Reparto vigente y corrección del alcance anterior

Conformes con el reparto solicitado:

| Responsable | Alcance |
|---|---|
| Backend Gestadia Portal/APP | Recibir datos Zoho, validar/correlacionar, crear o vincular cuentas, gestionar credenciales, avisos y trámites; autenticar el acceso APP y acreditar el contexto conversacional |
| Responsable de Zoho, coordinado por Gestadia | Configurar flujos/disparadores y POST directos al backend; acordar con Portal el contrato CRM, firma y recuperación |
| LidIA | Sondeo de canje, motor conversacional, sesiones/timeline, recibos y conversaciones con comercial/gestor; aplicar identidad/contexto remitidos por Portal |
| Equipo Gestadia App | Consumir la API Portal con la cuenta compartida, recuperar conversaciones y mostrar sondeo/atención y sus estados |

Los recorridos son **Zoho → backend Gestadia → cuenta/trámite** y **APP → backend Gestadia → LidIA → conversación IA/humana**. Los flujos de cuenta y trámite se coordinan entre Gestadia y el responsable Zoho.

Este ajuste prevalece sobre las dependencias de alcance de la [respuesta O1–O8](2026-10-05-respuesta-lidia-observaciones-o1-o8.md): la producción del evento Zoho, el orden de `source_revision`, ganado/pago, la cardinalidad trato–expediente, el checkout y la atestación completa de vínculos CRM **no bloquean cerrar la API conversacional**. Su diseño sigue con Portal/Zoho; no se exige un evento ni un adaptador Zoho en LidIA. La alternativa de instantáneas de O6 no es condición de este acuerdo ni sustituye el POST de ganado acordado por negocio.

La ruta `crm-links` y el callback económico propuestos anteriormente quedan fuera de este cierre conversacional. Los documentos fechados se conservan como histórico; este documento fija el alcance vigente. Si más adelante se pide contratar o ejecutar operaciones desde LidIA, se revisará ese alcance expresamente. El guard vigente del checkout WhatsApp permanece.

## 2. Datos que necesitamos para asociar una conversación

La asociación durable se realiza por **integración configurada + `portal_user_id` + `conversation_id`**. La integración resuelve proyecto/entorno y agente APP; esas elecciones no llegan desde el móvil. `portal_user_id` equivale a `User.id`, estable para la misma cuenta en Portal y APP.

### Inicio y recuperación: mínimo necesario

| Dato | Obligatorio | Uso |
|---|---|---|
| `portal_user_id` | Sí | Cuenta validada por backend; sujeto firmado y propietario de la conversación |
| `identity.verification_level=account_verified` | Sí | Backend acredita el nivel de cuenta requerido, sin afirmar identidad civil ni propiedad de una ficha CRM |
| `identity.account_status=active` | Sí | Estado de cuenta acreditado por backend; no permite reactivar una revocación previa |
| `identity.verified_at` y `identity.method` | Sí | Fecha UTC y método de validación de cuenta (`email` o `invitation` en el DTO ya propuesto); si el backend usa otro método, acordar su valor antes de consolidar |
| `purpose=sondeo|atencion` | Sí | Propósito solicitado y autorizado por backend |
| `correlation_id` | Sí | Trazabilidad; sin función de permiso |
| `resume_conversation_id` | Sólo para recuperar | Id durable guardado por Portal y comprobado para esa misma cuenta |
| `Idempotency-Key` y cabeceras S2S | Sí en POST | Evitar duplicar inicio/turno y autenticar al backend, conforme al anexo |

No necesitamos email, teléfono, contraseñas, JWT móvil, contacto/trato Zoho o `ClientKey` para **vincular la cuenta a su conversación**. El backend valida esos elementos cuando correspondan a su negocio; a LidIA entrega la identidad estable y el contexto autorizado. El nombre visible puede acordarse posteriormente para presentación, sin usarlo para identificar o recuperar una cuenta.

Ejemplo de inicio conforme al `SessionRequest` ya propuesto, ids ficticios:

```json
{
  "schema_version": "1.0",
  "portal_user_id": "11111111-1111-4111-8111-111111111111",
  "purpose": "sondeo",
  "identity": {
    "verification_level": "account_verified",
    "verified_at": "2026-10-05T10:00:00.000Z",
    "method": "email",
    "account_status": "active"
  },
  "correlation_id": "app-conversation-start-01",
  "resume_conversation_id": null,
  "case_ref": null,
  "client_key": null
}
```

El sondeo gratuito admite esos null. `client_key` no se necesita en este alcance. Si se incluye `case_ref` al iniciar atención, Portal debe acreditar su pertenencia; el contexto descrito debajo delimita permisos y asignación. Una referencia aislada no otorga acceso.

### Contexto para comercial/gestor: remitido por backend

Proponemos una actualización S2S específica **`POST /api/integrations/lidia/app/v1/sessions/{conversationId}/context`**, con Idempotency-Key. Complementa las cuatro rutas conversacionales y evita rehacer la sesión cuando el backend recibe datos Zoho o cambia una asignación.

| Dato `ConversationContextRequest` | Regla |
|---|---|
| `schema_version` | `"1.0"` |
| `portal_user_id` | UUID de la cuenta; igual a header firmado y dueño de conversación |
| `context_revision` | String decimal positivo, monotónico **por conversación**, emitido por Portal; no es una revisión Zoho |
| `validated_at` | Fecha UTC de la validación backend; informativa, el orden lo fija la revisión |
| `permissions` | Lista única de capacidades declaradas para esta conversación: `sondeo`, `history`, `case_context`, `commercial_handoff`, `manager_handoff`, `support_handoff`; sólo se aplican las admitidas por la integración LidIA |
| `case_ref` | UUID Portal del trámite autorizado, o null; puede ser null para atención comercial previa al trámite |
| `commercial_assignment_ref` | Referencia estable del backend a la asignación comercial validada, o null |
| `manager_assignment_ref` | Referencia estable del backend a la asignación gestor validada, o null |
| `correlation_id` | Traza, excluida de la huella semántica |

Todos los campos están presentes; null representa referencia ausente. Strings de asignación opacos ASCII `[A-Za-z0-9._:-]{1,128}`, revisiones hasta 20 dígitos, máximo 32 KiB por body; propiedades desconocidas rechazadas. Las referencias de asignación se acuerdan como ids estables backend y se mapean a operadores LidIA dentro del proyecto/entorno configurado. Pueden provenir de vuestro CRM, pero **no necesitamos el contrato del POST Zoho** para consumirlas. Gestadia acredita quién corresponde; LidIA comprueba que el mapping, proyecto, permisos y operador sean elegibles.

Ejemplo de contexto ficticio para atención con asignaciones ya acreditadas:

```json
{
  "schema_version": "1.0",
  "portal_user_id": "11111111-1111-4111-8111-111111111111",
  "context_revision": "3",
  "validated_at": "2026-10-05T10:05:00.000Z",
  "permissions": ["history", "case_context", "commercial_handoff", "manager_handoff"],
  "case_ref": "66666666-6666-4666-8666-666666666666",
  "commercial_assignment_ref": "assignment-commercial-01",
  "manager_assignment_ref": "assignment-manager-01",
  "correlation_id": "backend-conversation-context-03"
}
```

`case_context` exige `case_ref` autorizado no null. Una cuenta puede tener varios trámites; el contexto se aplica **sólo a esta conversación**, sin habilitar todas las del contacto ni compartir historiales entre propósitos. Las conversaciones asociadas a trámites diferentes conservan contextos independientes.

Actualizar contexto requiere que Portal revalide pertenencia y permisos. LidIA verifica firma, integración/sujeto/conversación y el techo de permisos de la integración. Recibir contexto no crea, vincula o habilita una cuenta/trámite, no dispara checkout ni envía avisos, y no inicia atención humana. El inicio atestigua identidad; los permisos privados requieren contexto acreditado. Para sondeo sin contexto se aplica el conjunto mínimo permitido (`sondeo`, `history`), con comprobación de cuenta y pertenencia.

Respuesta 200 tras commit: `schema_version`, `conversation_id`, `context_revision`, `state_revision`, `persisted: true`, `effective_permissions` y `correlation_id`. No devuelve ids CRM, operador interno o credenciales al móvil. Misma revisión/contenido semántico es repetición sin efectos; misma revisión/contenido distinto = 409 `context_conflict`; revisión inferior = 409 `stale_context`. Revisión superior reemplaza la instantánea completa, incluyendo retirada de permisos/asignaciones, aumenta `state_revision` e invalida acciones afectadas. Firma e idempotencia siguen el anexo, con operación semántica `context`; ordenar `permissions` como conjunto ASCII antes de JCS. La revocación global de cuenta siempre prevalece.

Un cambio de asignación no transfiere automáticamente una atención ya tomada: actualiza el destino de futuras solicitudes y, si procede cambiar al operador actual, usa el flujo de transferencia trazado sobre la misma sesión. Si se retira acceso privado, LidIA bloquea lecturas/turnos de ese contexto y aplica el filtrado conservador de O2; no borra mensajes ni los expone como sondeo público.

Un contexto acreditado no exige consultas CRM desde LidIA. No se solicita un paquete completo de datos personales o expediente. Los datos de trámite que el humano necesite se consultarán en el backend con permisos acordados o se presentarán en su puesto autorizado; ninguna herramienta de acceso a expedientes se considera implementada por esta propuesta.

## 3. API conversacional y recuperación

Se mantienen las operaciones de la propuesta:

| Operación | Función |
|---|---|
| POST `/sessions` | Crear o recuperar conversación de cuenta validada |
| GET `/sessions/{id}/timeline` | Mensajes, sondeo estructurado y estado de atención; cursores y lookup por `turn_id` |
| POST `/sessions/{id}/turns` | Texto o acción validada, con recibo durable/idempotencia |
| POST `/sessions/{id}/handoff` | Solicitar comercial, gestor o soporte autorizado en la misma ChatSession |
| POST `/sessions/{id}/context` | Actualizar contexto y asignaciones acreditados por backend |
| POST `/subjects/{id}/revocations` | Retirar acceso de cuenta o contexto privado conforme al ciclo de vida |

Prefijo LidIA `/api/integrations/lidia/app/v1`; backend resuelve cómo las proyecta en su API móvil. Firma, recibos, revisión, presentación/acciones, sondeo y polling mantienen el anexo O1/O3. El nuevo DTO contexto no se añade silenciosamente al `SessionRequest` anterior: tiene su propia operación y se consolida como adenda del contrato conversacional aún no implementado.

Portal guarda la asociación durable **cuenta → conversación pública → ChatSession LidIA**. LidIA guarda el mismo dueño y scope. Otro dispositivo autentica la misma cuenta Portal y recupera esa conversación; no se abre una por dispositivo. Reiniciar backend o renovar la sesión móvil no reinicia ChatSession. Un usuario puede abrir distintas conversaciones por propósito/trámite de forma explícita; transferencia a humano mantiene **esa** sesión y timeline.

Una cuenta creada o vinculada por vuestro flujo Zoho conserva el `User.id` existente cuando corresponda: Portal resuelve el cruce con la cuenta que ya conversa. LidIA no hace matching por email, teléfono o contacto. Si backend necesita consolidar dos cuentas con ids diferentes, se revisa un procedimiento explícito de reasociación antes de mover historiales; cambiar subject en un inicio no transfiere una conversación. Recuperar una conversación de invitado anterior no forma parte de este contrato de cuenta validada.

Handoff requiere intención y contexto permitidos; el móvil no elige `targetUserId` o departamento. Una asignación sin mapping elegible devuelve `routing_unavailable`, sin usar otra persona por aproximación. Si no hay gestor/comercial asignado, se informa indisponibilidad u ofrece soporte general **cuando esté permitido**. Un destino comercial general sólo se usa mediante regla configurada y aprobada. `assigned` y atención humana efectiva siguen siendo estados distintos.

Cierre de sesión de dispositivo corresponde a Portal. Bloqueo de cuenta se notifica por revocación durable; retirada de permisos/asignaciones de una conversación, mediante contexto con revisión superior. El scope histórico `crm_link` se aplica a todos los contextos privados de la cuenta en su integración, aunque LidIA no conserve ids CRM. No implica que LidIA administre esos vínculos en Zoho. Reactivación no se obtiene enviando `account_status=active` o una nueva revisión de contexto.

## 4. Qué necesitamos de Gestadia para consolidar

1. Confirmar que `portal_user_id` será el `User.id` durable compartido Portal/APP y cómo el backend atestigua cuenta validada (método y fecha).
2. Confirmar el contexto por conversación: permisos, `case_ref` cuando proceda, referencias estables de comercial/gestor y actualizaciones/revocación desde backend. Para acordar el mapping bastan ejemplos **ficticios** de esas referencias y la política de destino general si no hay asignación.
3. Acordar persistencia y recuperación de ids, política de conversación cerrada y retención con los DTO/recibos propuestos.
4. Concretar en configuración S2S proyecto/entorno y agente operativo APP dedicado, mappings de operadores y evidencias DEV. El estado efectivo del agente 119 y el aislamiento siguen pendientes; no se heredan sus conexiones por defecto.

El contrato de datos Zoho→backend, la habilitación de trámites y los pagos permanecen en vuestra coordinación y no son información necesaria para asociar la cuenta a una conversación. Para pruebas conectadas siguen siendo necesarias autorización y evidencia de aislamiento; primero se consolida este contrato documental. APP conserva transporte propio, sin WhatsApp/Woztell ni automatizaciones heredadas.
