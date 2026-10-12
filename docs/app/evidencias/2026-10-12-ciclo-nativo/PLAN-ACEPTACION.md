# Plan de aceptación nativa conectada

Petición humana del 12/10/2026: preparar DEV con el equipo LidIA, terminar los ciclos reales de LidIA y del gestor `integraciones@vozenter.com` en iOS/Android y después instalar la versión validada en iGonchu. [Estado y evidencia](README.md) · [Manual](../../MANUAL-DESARROLLO.md) · [Navegación](../../NAVEGACION.md) · [Glosario](../../../../GLOSARIO.md).

## Reparto y entrega DEV

LidIA prepara y acredita su runtime DEV, copia/aislamiento de BD, conexiones externas y jobs, integración APP y selección efectiva del agente, credenciales S2S propias, operador y ruta. Portal prepara la instancia APP/API de prueba, identidad local, correspondencia de expediente/asignación comprobada, paquetes nativos y evidencia de interfaz. El equipo que mantiene la sesión administrativa de Portainer ejecuta el inventario/actualización requerido por LidIA; esta tarea no opera su consola en paralelo.

La configuración y las credenciales se entregan por archivos privados 0700/0600; la documentación sólo conserva referencias y resultados saneados. No reutilizar la cuenta, conversación ni permisos de la reserva humana en PRO.

Antes de conectar, deben existir estas comprobaciones:

| Recurso | Evidencia necesaria |
|---|---|
| Runtime DEV | Versión/SHA efectivos del servicio, destino y namespace; salud y rollback propio. Un paquete compilado no acredita el runtime. |
| Aislamiento | BD distinta, conexiones y entorno CRM comprobados, jobs/colas y automatismos de canales revisados. Una etiqueta DEV no basta. |
| APP S2S | IntegrationId/audience/capabilities y autoridad vigentes para esta prueba; actor de cuenta/instalación propios. |
| Agente | Selección119 o su copia DEV expresamente acreditada, con misma configuración funcional del sondeo. No dar por119 un saludo de otro agente. |
| Gestor | Operador Integraciones, permisos de bandeja y mapping de asignación comprobados por LidIA. |
| Expediente Portal | User.zohoContactId y Expediente.zohoDealId propios, relación Contact_Name verificada en Zoho y Owner.id/name reales. Grant history/manager_handoff/case_context y APP_MANAGER_ROUTES_JSON coherentes con ese Owner. No inferir relación por email/teléfono. |
| CRM | Zoho Production, autorizado por el usuario el 12/10 con «Contra produccion». Conexión Portal y conexión LidIA en la misma organización verificada, con registros QA propios o pertenencia comprobada. La prueba del chat no reserva una llamada ni paga un trámite. |

La atención técnica sin expediente mediante support_handoff puede comprobarse por separado bajo el contrato aceptado del07/10. No sustituye la aceptación del recorrido vigente que muestra el gestor asignado.

### Decisión vigente sobre Zoho

El usuario respondió «Contra produccion» al requisito de Sandbox el 12/10/2026. Esa decisión sustituye el requisito anterior: esta aceptación usa Zoho Production y conserva el canal, proyecto, agente, namespace, credenciales S2S e identidad de prueba en Gestadia DEV. Se ha comunicado a los equipos LidIA y Portal. El contacto, trato y propietario deben verificarse con datos QA propios; no se reutiliza la ficha ambigua ni los permisos temporales de la otra prueba humana. La autorización de esta QA no acredita por sí misma ninguna relación CRM ni exige reservar llamadas reales.

La revisión fuente identifica que el resolver728 admite Production, Sandbox y Development, mientras AppGuard exige Production y CreateCallAsync construye un destino Production fijo. El ajuste Sandbox planteado antes de esta respuesta queda fuera de las dependencias del ciclo actual. La lectura y el chat con gestor siguen requiriendo la configuración efectiva y la relación Contact–Deal–Owner comprobada.

Portal permite configurar ZOHO_API_URL/ZOHO_ACCOUNTS_URL; su wrapper privado conserva Zoho desactivado hasta recibir credenciales de la organización Production autorizada. Verificar `api_domain` al renovar el token y el destino efectivo de las conexiones. Los tokens corresponden a una organización/entorno concreto. [Documentación oficial de renovación de Zoho](https://www.zoho.com/crm/developer/docs/api/v8/refresh.html).

Portal ha preparado un candidato privado nuevo, `runtime-dev-pending.env`, conservando sólo credenciales locales de BD/autenticación/cifrado y con S2S/guest apagados. No copia claves S2S, OAuth ni destinos externos PRO. No se ha aplicado al proceso; recibirá exclusivamente la entrega DEV verificada.

El inventario administrativo identifica 24 como `lidia-vozenter-dev`, sin agente119, y 25 como `lidia-gestadia-dev`, con agente119 en el proyecto102 y conexión4 Production. Se elige 25 como candidato por sus registros efectivos; la auditoría no lo activa. LidIA prepara un proyecto APP propio y una copia de119 con un id libre, porque122 está ocupado. El proyecto original102 mantiene otros canales y debe preservarse. Los dos informes originales, sus hashes y la revisión saneada se conservan por separado en [dev-audit-review.json](dev-audit-review.json).

### Hallazgo después del despliegue DEV25

V1.728 y las tres migraciones APP se han observado en ejecución real, con APP todavía apagada. El [informe119 original](dev25-agent119-original.json) demuestra que119DEV usa una instrucción1.0 antigua y no coincide con el119PRO Canje v4/v1.8. Se detiene la copia desde ese119DEV y se prepara importación de la configuración funcionalPRO a un proyecto/agente DEV nuevos, sin contactos/chats/secretos ni cambios en119/122 originales. El snapshot, defaults y mapping de herramientas/conexiones se revisarán antes de activar. Este hallazgo sustituye la suposición de equivalencia, no el aislamiento DEV.

El [acceso del operador Integraciones](dev-integraciones-acceso.json) sí funciona en la UI DEV oficial`/admin/chats`. Falta validar routing y el chat propio, y correlacionar el proxy al contenedor. Los ciclos nativos siguen pendientes; no se traslada nuestra QA al runtime PRO por este hallazgo.

## Secuencia por plataforma

iOS y Android se ejecutan por separado, sobre la misma fuente móvil y backend acordados. iOS usa el simulador propio; si se cierra temporalmente el iPhone17 ajeno bajo autorización humana, se restaurará al terminar. Android usa el AVD propio con4096MB/cuatro núcleos. No borrar sus datos para ocultar errores de recuperación.

1. Registrar fuente/versión del paquete, runtime API/LidIA, autoridad y hora de inicio. Comprobar que las cuentas/conversaciones pertenecen a esta prueba.
2. Acceder desde controles nativos y comprobar sesión de plataforma, retorno solicitado, persistencia al reiniciar y revocación al salir. Estas tres comprobaciones ya tienen evidencia local del12/10; repetirlas conectadas sólo cuando se cambie configuración/identidad.
3. Desde LidIA iniciar nueva consulta, enviar texto y recibir la respuesta literal del agente. Si ofrece botones, seleccionar una respuesta y comprobar su etiqueta visible, también después de recuperar el chat. No introducir un cuestionario paralelo ni inventar una elegibilidad a partir del texto.
4. Salir y recuperar el mismo chat; renombrar, buscar y comprobar creación/último mensaje/estado desde metadatos autoritativos. Verificar Atrás y ausencia de botón Nueva dentro de una consulta activa.
5. Desde Hablar con un gestor, confirmar nombre/asignación y abrir el chat de atención propio. Tomarlo con Integraciones en la bandeja real, enviar mensajes en ambos sentidos y comprobar que cada mensaje aparece una sola vez en el extremo destinatario.
6. Verificar ticks por evidencia durable: persistido=sent; acuse del destinatario=received; burbuja humana visible=read. LidIA puede acreditar received pero nunca una lectura de IA. Mensajes no debe marcar leído sólo por listar el chat.
7. Reabrir tras terminar/reiniciar la app y comprobar historial, nombre y recibos. Cerrar desde operador; comprobar estado cerrado, historial legible y envío bloqueado. Una nueva atención posterior debe conservar el chat cerrado y usar un id nuevo.
8. Recorrer navegación/Atrás, área segura, teclado/compositor y aviso temporal del micrófono. Comprobar recuperación ante desconexión sin reenviar operaciones con una nueva key. No borrar cuentas, enviar correos ni ejecutar cobros durante este ciclo.
9. Revocar sólo sesiones/autoridades de prueba, detener sus helpers/dispositivos y restaurar el simulador ajeno si fue cerrado.

Para distinguir los tres ticks de atención, persistir un mensaje antes de que el destinatario abra el chat; comprobar `sent`. Para `received` sin `read`, el destinatario recibe el mensaje mientras esa burbuja permanece fuera del área visible del historial; registrar su acuse real. Después desplazarla a la vista con la conversación activa y comprobar el nuevo acuse `read`. Ocultar la aplicación se hace mediante su navegación/estado nativo, no alterando flags del observador ni simulando recibos en la BD. Cada transición debe corresponder al mismo message_id y conservar las primeras fechas/revisiones.

Guest APP se comprueba con su autoridad v2 por instalación cuando el receptor la entregue: Login o Continuar sin registro → respuesta real → recuperación de la misma conversación. No habilitar guest global para evitar un fallo de permisos. Contacto cualificado automático y vínculo/alta opcional conservan sus dependencias documentadas; no se simulan como aceptación real.

## Evidencia y criterio de cierre

Cada plataforma requiere capturas sin secretos, ids propios de conversación/operación/mensaje, estado del operador, recibos y resultado de recuperación. Los checks de código, API, interfaz nativa y distribución física tienen resultados separados. Un fallo o una dependencia pendiente impide declarar el ciclo completo PASS.

Tras superar ambos ciclos, comprobar cuál es la última fuente móvil aceptada, firmar/instalar el Release correspondiente en iGonchu, abrirlo y verificar versión y endpointHTTPS. Nunca instalar en el iPhone la copia del simulador con loopback. Si ya tiene el mismo número, verificar procedencia del paquete antes de atribuirle la fuente validada. La instalación no activa por sí sola canales ni permisos en PRO.

## Lectura CRM en la instancia PortalQA

El lector administrativo de LidIA verifica referencias, pero no sustituye el recorrido vigente de `createAppContactService.context → crm.assignedManager`. Para probarlo se conserva el adapter real de Portal. La conexión privada de lectura y el caso propio siguen pendientes de entrega verificada; no se usa una respuesta cacheada como assignedManager.

Se ha preparado un wrapper privado pendiente que exige User64a... y relación local Contact–Deal–Owner/case propia coherente con la comprobación real, limita GET a los dos IDs CRM, caduca en una hora y verifica los dominios EU. Sólo permite renovar OAuth mediante refresh_token y contrasta api_domain; no sigue redirecciones. Se aplica antes de cargar los adapters. No se han entregado credenciales ni IDs reales ni se ha aplicado ese wrapper al proceso3005.

Ocho pruebas privadas pasaron tras observar sus fallos antes de implementar: política, rechazo de escrituras/otras fichas/caducidad, redirección HTTP local y renovación/dominio. La respuesta OAuth de prueba es explícitamente sintética y no acredita Zoho. [Estado y hashes saneados](crm-read-guard-preparation.json).
