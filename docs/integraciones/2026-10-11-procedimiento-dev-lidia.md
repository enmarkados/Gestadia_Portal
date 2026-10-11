# Prueba conjunta APP en DEV · preparación del 11/10/2026

[Contrato r4](2026-10-10-app-v2-wire-contract.md) · [Plan y evidencias LidIA](../superpowers/plans/2026-10-10-app-v2-lidia.md) · [Glosario](../../GLOSARIO.md).

## Estado y alcance

Procedimiento preparado, **no ejecutado ni activado**. LidIA: `a1777aec66a8189ac5ab54ec704c301356b7f15e`, PR1627, V1.720, 174 pruebas APP locales. Portal comunica PR16, implementación `0096bff2e497298828c01ccd6babcb836e11c01a`, merge `9c2e62c5506fe95141de5c5b4a4b605a4236e286`, 285 backend / 191 frontend y build. Sus actas están en `docs/app/2026-10-11-recorridos-gestores.md` y `2026-10-11-configuracion-recorridos.md` de Gestadia_Portal. Su arranque iOS no acredita el recorrido nativo completo.

La prueba v1 real del 119 tiene acta separada: [cuenta local y conversación](2026-10-07-conexion-app-agente-119-real.md#cuenta-nueva-autorizada-y-prueba-ui-app-1110). Su integración PRO y cuenta sondeo/history se conservan; no se reutilizan para probar gestor o invitado. PRO guest permanece apagado. La entrega no acredita un proyecto, agente ni base DEV ya aislados: esos IDs/destinos deben comprobarse, sin deducirlos de nombres de stack ni de pruebas unitarias.

Se prueban transporte de texto al motor original, continuidad guest/cuenta y atención humana. No se añaden reglas de canje ni se convierte texto en una calificación. Zoho directo, checkout, contacto automático, OAuth/push y aceptación física tienen pruebas independientes; no son condición para probar el transporte conversacional.

## Configuración que falta y responsable

| Dato o comprobación pendiente | Responsable | Evidencia antes del primer turno |
|---|---|---|
| URL HTTPS DEV efectiva, stack/contenedor y SHA servido | LidIA | SHA que contiene PR1626/1627, marcador V1.720 y migración `20261011021704_AddAppGuestContinuity` en BBDD DEV |
| BBDD y configuración DEV propias, backup restaurable del binario/config y BBDD | LidIA | Destinos y propietario comprobados; backup con tamaño/hash y procedimiento de restauración; sin credenciales de escritura PRO |
| `ProjectId`, `AgentId`, instrucción/version/saludo efectivos y modelo real | LidIA | Agente activo con proyecto/instrucción coherentes, copia literal del comportamiento fuente 119 en DEV; comparar hashes y configuración, no inventar ID119 en otra BBDD |
| Canal APP y aislamiento de conexiones/herramientas | LidIA | Sin WhatsAppContact, transporte Woztell, timeout/automatización de WhatsApp ni herramientas externas; salida de red y credenciales para CRM/pago/correo PRO ausentes/bloqueadas |
| Integración DEV dedicada: `Id`, `Audience`, `Environment: dev`, `Permissions`, `CursorSecretBase64` | LidIA | Namespace estable y distinto de PRO; secreto de cursor de al menos 32 bytes fuera de Git/chat; `RuntimeIsolationVerified` sólo tras comprobar aislamiento |
| Claves S2S por rol y control de cierre | LidIA + Portal | Key IDs únicos, secretos de al menos 32 bytes y capabilities exactas; traslado por almacén privado, reloj UTC sincronizado y responsable/horario de desactivación |
| Base Portal DEV durable y configuración v1/v2 separada | Portal | URL/base y variables `APP_V2_*` efectivas, sin fallback v1 para invitado, sin conexiones de escritura PRO; solicitud/ACK/idempotencia persistidos |
| Cuenta activa y verificada, contacto/trato/expediente propios | Portal + responsable CRM | Relación comprobada en DEV; `case_ref` UUID y Owner del trato; sin registros/personas reales ajenos ni altas CRM como efecto del sondeo |
| `assignment_ref` ↔ Owner Zoho ↔ operador/departamento LidIA | Portal + LidIA + responsable CRM | Mapping privado consistente en ambos servidores, ruta vigente y operador elegible en ese proyecto |
| Contexto humano y grant DEV propio | Portal | `history`, `manager_handoff`, `case_context`, expediente y asignación validados; sin ampliar la cuenta v1 119 existente |
| Acceso del operador al panel DEV | LidIA | Usuario habilitado y con rol/miembro del departamento y proyecto correctos; no basta mapear un texto con su nombre |

No publicar valores de secretos ni IDs personales en el acta; guardar sus evidencias en el almacén privado y usar correlaciones opacas en el documento compartido.

### Límites reales de la configuración

La sección LidIA es `AppConversations`: `Enabled` y `Integrations`. Cada integración tiene `GuestV2Enabled`, `PlatformAgentRuntimeEnabled`, `RuntimeIsolationVerified`, `Id`, `Audience`, `ProjectId`, `AgentId`, `Environment`, `Permissions`, `CursorSecretBase64`, `Keys` y `SupportRoutes`. No se cambian IDs/audience/entorno de una integración con historia: forman parte de su namespace.

`AppSigningKey` sólo implementa `Id`, `SecretBase64`, `Active` y `Capabilities`: **no hay NotBefore/ExpiresAt ni caducidad automática de claves**. La vigencia de prueba se registra con inicio/cierre UTC y responsable; al cierre se desactiva la clave/configuración y se comprueba rechazo. Si se exige caducidad automática, falta implementar ese control antes de prometerlo. No confundir vigencia operativa de una clave, ventana de firma ±300 s, TTL guest máximo 24 h y retención de recibos 30 días.

`AppSupportRoute` sí tiene `Kind: manager`, `AssignmentRef`, `DepartmentId`, `UserId`, `Active`, `ValidFromUtc`, `ValidUntilUtc`. Sólo una ruta vigente para el kind/ref, departamento del proyecto y operador elegible permite el handoff. El mapping Portal `APP_MANAGER_ROUTES_JSON` contrasta assignmentRef con zohoOwnerId; no concede permisos por sí mismo. Estos IDs nunca se eligen en el dispositivo.

`PlatformAgentRuntimeEnabled` permite usar el motor de un agente con conexiones existentes, pero no certifica aislamiento externo. En un DEV separado se mantiene false si el agente cumple el perfil aislado; si la copia literal exige true, debe justificarse y verificar el guard de herramientas APP y la ausencia de destinos PRO. `RuntimeIsolationVerified=true` es una atestación de la comprobación, no una herramienta que aislara la red.

### Capabilities S2S implementadas

| Rol Portal | Capability LidIA |
|---|---|
| SESSION | `app.sessions.write` |
| READ | `app.timeline.read` (timeline, recibos y recuperación de operaciones) |
| TURN | `app.turns.write` (turnos y ACK de mensajes) |
| HANDOFF | `app.handoff.request` |
| CONTEXT | `app.context.attest` |
| BINDING_WRITE | `app.bindings.write` |
| BINDING_READ | `app.bindings.read` |
| REVOCATION | `app.subjects.revoke` |

No provisionar `app.contact_requests.*`: el contrato r4 reserva ese recorrido sin endpoint entregado. Las claves viven únicamente en servidores. La misma operación recuperada tras rotar clave conserva integración/sujeto/actor/key de idempotencia y DTO; sólo cambian key_id de firma, nonce, timestamp y firma.

## Procedimiento DEV controlado

1. **Inventario y respaldo.** Completar la tabla anterior y guardar configuración/backup privado. Identificar los destinos efectivos de ambos backends y la BBDD DEV. Confirmar que no se toca stack, datos, keys/grants ni pestaña/sesión PRO119 existentes. Bloquear escrituras y transporte hacia CRM/pagos/correo/WhatsApp PRO, conservando únicamente el proveedor de modelo real necesario para conversar.
2. **Publicar el binario DEV con guest apagado.** Comprobar SHA/marker y aplicar únicamente migraciones EF en la base DEV respaldada. No usar selección de tests como targets del publish. Validar panel, rutas v1 y Playground DEV de la copia literal con un turno normal, esperar su respuesta y registrar agente/instrucción/modelo. Un 200 de health no acredita conversación.
3. **Provisionar las rutas y keys sólo en DEV.** Guardar mappings, cuenta/grant DEV y límites de vigencia. Cargar configuración por mecanismo privado del entorno. Mantener producción intacta. Comprobar rechazo de S2S incorrecto y v2 apagado antes de habilitar: 401 para firma/nonce/clave inválidos, 403 por capability ausente o 503 por integración apagada según el punto de rechazo. No usar errores como diagnóstico para imprimir secretos.
4. **Habilitar únicamente la integración DEV.** LidIA `GuestV2Enabled=true`; Portal `APP_V2_ENABLED=true` y `APP_V2_GUEST_ENABLED=true`, con URLs/roles v2 acordados. Cuenta v1 de atención conserva sus keys/configuración separadas. Comprobar configuración efectiva de todos los nodos y workers y reiniciar lo necesario en DEV; editar un archivo sin comprobar el runtime no cierra este paso.
5. **Invitado desde la APP real.** Nueva consulta → Continuar sin registro. Instalación nueva y sujeto nuevo, inicio con revisión0, ACK revisión1. Un texto normal por UI, esperar la respuesta literal del agente y recuperar el chat tras recarga. Correlacionar Portal conversation/turn/operation con ChatSession APP, agente/instrucción efectiva y registro del proveedor real. Sin arnés ConversationTester ni bucles de envío contra modelo.
6. **Recuperación controlada del inicio.** Simular pérdida del ACK entre backend Portal y DEV sólo para la operación propia; recuperar usando el mismo DTO/key/sujeto/actor y revisión0 del inicio, con nonce/timestamp/firma nuevos. Debe quedar una ChatSession y una apertura, sin ampliar vencimiento ni repetir modelo. GET posterior usa revisión actual; no inferir propiedad ni éxito por una revisión mayor. Recuperar turno por turn_id/operation sin reenviarlo como una conversación nueva.
7. **Vínculo con cuenta.** Cuenta DEV autenticada + control de la instalación original: prepare, drenar operaciones, commit. Comprobar conservación de ChatSession/timeline y actores históricos, rechazo del guest anterior y acceso por cuenta con revisión nueva. Recuperar un commit de ACK perdido repitiendo exactamente su solicitud preparada; nunca fabricar revision/identity nueva. Probar el aislamiento de otra instalación/cuenta sólo con identidades DEV propias provisionadas para este caso.
8. **Gestor en conversación nueva de cuenta v1.** `sessions(purpose:atencion)` → `context(history,manager_handoff,case_context,case_ref,manager_assignment_ref)` → `handoff(manager)`. La timeline inicial debe estar vacía, IA false y soporte requested tras ACK; la APP muestra espera sólo entonces. Usuario escribe; operador DEV toma y responde en panel. Misma ChatSession, roles user/operator y ninguna llamada al modelo para atención. No transformar el sondeo ni ampliar el grant v1 119 de validación.
9. **Revocación y límites.** En sujetos/cuentas DEV preparados para ello: caducidad guest con TTL corto permitido (no esperar 24 h ni alterar registros de PRO), revocación guest/account/CRM, rechazo de firma duplicada y separación de propietarios. Verificar API, lectura/reply del operador y worker con autoridad primaria actual. CRM revocado conserva sondeo/historia pública y retira caso/asignación/acciones; account revocado corta sus conversaciones v2. Portal debe reconciliar la revocación remota además de bloquear localmente. No usar como prueba conectada el resultado de reloj ficticio de un unit test.
10. **Cerrar y registrar.** Conservar solicitudes/ACK, IDs de correlación, SHA servido, modelo/agente, evidencias de UI y efectos negativos comprobados. Desactivar guest de la integración DEV y sus keys de prueba, comprobar rechazo y guardar el inventario final. Conservar los datos/evidencias para reconciliación; no borrar historia para ocultar errores. Con datos v2, el rollback usa restauración del backup, no downgrade indiscriminado. Nada de este procedimiento activa PRO.

## Criterios de aceptación y entregas

LidIA entrega versión/migración/config DEV, agente/instrucción reales, autoridad y rutas/operador; Portal entrega consumidor configurado, instalación/cuenta, prueba de propiedad/CRM y reconciliación. El responsable CRM confirma relación cuenta–contacto–trato–expediente y Owner del gestor en el entorno propio, sin que LidIA asuma pagos/alta de trámites.

La aceptación conjunta requiere evidencias separadas de: texto y respuesta de agente real, recuperación durable, vínculo con rechazo del actor anterior, atención sin IA y misma ChatSession, revocación propagada y aislamiento de producción. Las 174 pruebas LidIA y 285/191 comunicadas por Portal son precedentes locales, no esa aceptación. La prueba nativa necesita interacción funcional observada; build/arranque iOS y captura no la sustituyen.

Contacto automático tras cualificación sigue pendiente de salida estructurada oficial del agente y contrato implementado; no se desbloquea interpretando texto. La llamada voluntaria y su adaptador Zoho son responsabilidad Portal/CRM y requieren acta propia de sandbox; este E2E conversacional no ejecuta tareas ni altas CRM.
