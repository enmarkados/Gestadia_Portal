# Configuración de los recorridos APP · 11/10/2026

[Manual](MANUAL-DESARROLLO.md) · [Recorridos y evidencia](2026-10-11-recorridos-gestores.md) · [Navegación](NAVEGACION.md) · [Glosario](../../GLOSARIO.md).

## Conversaciones y gestor

La configuración efectiva es privada del backend. La APP sólo recibe su base API y disponibilidad; no selecciona agente, proyecto, entorno, operador ni IDs CRM.

- `APP_CONVERSATIONS_ENABLED` habilita el transporte de cuenta v1 existente. Conserva sus claves y rutas particulares de sondeo/atención.
- `APP_MANAGER_ROUTES_JSON` es un array cerrado de `{ "assignmentRef": "referencia-opaca-acordada", "zohoOwnerId": "123456789012345" }`. El ejemplo es ficticio. Máximo 200 entradas; referencias únicas, sin propiedades extra. El Owner se comprueba contra el contacto/trato y el expediente pertenece a la cuenta. El mapping no concede permisos.
- Un chat de gestor requiere `history`, `manager_handoff` y `case_context`, expediente propio y asignación válida. Si falta el contexto no se intenta crear una consulta IA como sustituto. La opción de llamada explica el propósito y solicita nombre/teléfono.
- El backend crea propósito `atencion` y solicita handoff. Hasta ACK sólo muestra espera; el nombre de la cabecera describe la asignación actual. Los mensajes históricos de operador no se atribuyen al gestor actual: r4 no ofrece autor humano por mensaje. Mensajes IA históricos conservan su rol LidIA.

## Visitante APP v2

`APP_V2_ENABLED` y `APP_V2_GUEST_ENABLED` son `false` por defecto. Su activación exige la configuración y prueba conjunta de DEV, separadas de PRO. No usar claves v1 como fallback.

**Precisión de LidIA al revisar la entrega:** las rutas de asignación tienen fechas de vigencia, pero las claves S2S actuales sólo tienen estado `Active`; no caducan automáticamente. Una ventana de prueba debe fijar responsable y hora de cierre, verificar el aislamiento efectivo de DEV y desactivar esas claves al terminar. No confundir el TTL del sujeto visitante ni la fecha de un grant con la caducidad de la clave que firma la petición.

| Variable privada | Uso |
|---|---|
| `APP_V2_LIDIA_BASE_URL` | Destino S2S autorizado |
| `APP_V2_LIDIA_INTEGRATION_ID` | Integración resuelta por servidor |
| `APP_V2_LIDIA_AUDIENCE` | Audience S2S |
| `APP_V2_LIDIA_<ROL>_KEY_ID` y `APP_V2_LIDIA_<ROL>_SECRET_BASE64` | Capacidades firmadas: SESSION, READ, TURN, HANDOFF, CONTEXT, BINDING_WRITE, BINDING_READ y REVOCATION |

API Portal: `/api/app/guest/installations`, `/conversations`, sus timelines/turnos/recibos/bind y `/operations/:id` con retry. Header `X-App-Guest`; Authorization de Gestadia sólo cuando existe una cuenta. Respuestas `no-store`; límite de 90 solicitudes/minuto y creación de instalación 10/hora.

La instalación caduca a los 30 días; el sujeto de chat visitante se atestigua por 24 horas. En nativo el token usa almacenamiento seguro `whenUnlockedThisDeviceOnly`; perder la instalación impide vincular por URL o coincidencia de email/teléfono. Un visitante no es un usuario ficticio.

Se guarda solicitud, sujeto, actor, clave de idempotencia, revisión y respuesta antes/después de cada operación. Un intento incierto recupera el mismo DTO y clave; jamás crea un sujeto nuevo para resolver un timeout. La creación original se repite con revisión 0 y no renueva TTL; las consultas posteriores usan la autoridad actual. La exclusión de dispatch dura 60 segundos, con claim propio: una respuesta tardía de un intento anterior no sobrescribe la confirmación actual.

Vincular exige cuenta Gestadia autenticada, control de la instalación original y prepare/commit del contrato r4. Se repite exactamente el commit preparado si su ACK se pierde. No se deduce el éxito por una revisión mayor ni se cambia el actor histórico de los mensajes. La cuenta pierde acceso inmediatamente si su estado local es revocado; reconciliar la revocación remota v2 y cerrar su aceptación conjunta sigue pendiente.

El contrato r4 reserva contacto cualificado/alta opcional. No interpretar texto libre como resultado favorable ni lanzar contacto automático sin señal estructurada del agente. La llamada explícita es una operación distinta.

## Zoho y llamada voluntaria

El adaptador utiliza las credenciales Zoho existentes del backend. Nombre y teléfono se validan y normalizan; se busca coincidencia exacta de teléfono en Phone/Mobile. Más de una coincidencia bloquea la elección automática. No se atribuye consentimiento comercial a pedir una llamada.

La solicitud durable `AppCallbackRequest` se deduplica por actor y clave. Para la cuenta se comprueba el contacto CRM; si no existe, se localiza/crea un lead y se guarda su referencia antes de crear la tarea. La tarea respeta el Owner del registro. Lead usa `What_Id` + `$se_module: Leads`; Contact usa `Who_Id` + `$se_module: Contacts`, según [documentación oficial Zoho de Tasks](https://help.zoho.com/portal/en/community/topic/kaizen-36-tasks-api). Los workflows CRM continúan siendo responsables de conversión y eventos de trato.

Sólo la respuesta remota correcta con ID de Task confirma recepción. Un resultado incierto queda `pending_review`/`pending_confirmation`; el cliente consulta el mismo intento. No se reenvía ciegamente una creación con ACK perdido. Operaciones interrumpidas en `dispatching` y casos ambiguos requieren conciliación por el identificador de solicitud en CRM; no cambiar a `prepared` sin comprobar el efecto remoto. Distintas solicitudes no garantizan unicidad global del teléfono en Zoho.

Esta revisión prueba el adaptador con respuestas controladas. No acredita Task real, llamada agendada ni conversión a contacto/trato en el tenant.

## Acceso social y notificaciones

Apple/Google autentican por identidad ya vinculada o email verificado coincidente con una cuenta Gestadia activa. La cuenta se bloquea y se comprueba de nuevo dentro de la transacción para que una revocación concurrente no emita sesión. Email inexistente devuelve `account_required`, sin crear cuenta por OAuth. Vincular desde Perfil exige sesión existente y confirmación explícita.

El permiso del sistema no equivale a dispositivo registrado: sólo ACK del backend confirma activación. Desactivar guarda la preferencia local y, si DELETE remoto falla, conserva `gestadia.push-revoke-pending` para reconciliar en la siguiente entrada. La campana deja de ofrecer el primer aviso una vez configurado; las siguientes activaciones/desactivaciones están en Perfil. APNs/FCM y retornos OAuth deben verificarse en el build firmado y entorno efectivo.

Los avisos sólo exponen conversación/expediente propios. Leer/no leer es reversible y el cambio espera ACK antes de abrir el destino; si falla, no se oculta el aviso. El swipe horizontal conserva scroll vertical y existe un botón equivalente. La revocación de entrega remota de push y el estado local son hechos separados durante una incidencia de red.
