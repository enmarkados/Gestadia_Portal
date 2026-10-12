# Plan de aceptación nativa conectada

Petición humana del12/10/2026: preparar DEV con el equipo LidIA, terminar los ciclos reales de LidIA y del gestor `integraciones@vozenter.com` en iOS/Android y después instalar la versión validada en iGonchu. [Estado y evidencia](README.md) · [Manual](../../MANUAL-DESARROLLO.md) · [Navegación](../../NAVEGACION.md) · [Glosario](../../../../GLOSARIO.md).

## Reparto y entrega DEV

LidIA prepara y acredita su runtime DEV, copia/aislamiento de BD, conexiones externas y jobs, integración APP y selección efectiva del agente, credenciales S2S propias, operador y ruta. Portal prepara la instancia APP/API de prueba, identidad local, correspondencia de expediente/asignación comprobada, paquetes nativos y evidencia de interfaz. El equipo que mantiene la sesión administrativa de Portainer ejecuta el inventario/actualización requerido por LidIA; esta tarea no opera su consola en paralelo.

La configuración y las credenciales se entregan por archivos privados0700/0600; la documentación sólo conserva referencias y resultados saneados. No reutilizar la cuenta, conversación ni permisos de la reserva humana en PRO.

Antes de conectar, deben existir estas comprobaciones:

| Recurso | Evidencia necesaria |
|---|---|
| Runtime DEV | Versión/SHA efectivos del servicio, destino y namespace; salud y rollback propio. Un paquete compilado no acredita el runtime. |
| Aislamiento | BD distinta, conexiones y entorno CRM comprobados, jobs/colas y automatismos de canales revisados. Una etiqueta DEV no basta. |
| APP S2S | IntegrationId/audience/capabilities y autoridad vigentes para esta prueba; actor de cuenta/instalación propios. |
| Agente | Selección119 o su copia DEV expresamente acreditada, con misma configuración funcional del sondeo. No dar por119 un saludo de otro agente. |
| Gestor | Operador Integraciones, permisos de bandeja y mapping de asignación comprobados por LidIA. |
| Expediente Portal | User.zohoContactId y Expediente.zohoDealId propios, relación Contact_Name verificada en Zoho y Owner.id/name reales. Grant history/manager_handoff/case_context y APP_MANAGER_ROUTES_JSON coherentes con ese Owner. No inferir relación por email/teléfono. |
| CRM | Conexión de lectura Portal y conexión LidIA en el mismo tenant autorizado; Production/Sandbox resueltos antes de cualquier escritura. La prueba del chat no reserva una llamada ni paga un trámite. |

La atención técnica sin expediente mediante support_handoff puede comprobarse por separado bajo el contrato aceptado del07/10. No sustituye la aceptación del recorrido vigente que muestra el gestor asignado.

La revisión de código comunicada por LidIA confirma que el resolver728 admite Production, Sandbox y Development con coincidencia de Environment/host; el editor humano permanece fijado aProduction/conn4 y se excluye de QA. Sigue pendiente verificar los demás gateways y conexiones efectivas DEV. Portal permite configurar ZOHO_API_URL/ZOHO_ACCOUNTS_URL, pero necesita credenciales del mismo entorno CRM; su wrapper privado conserva Zoho desactivado mientras no se entregue esa autoridad. Ninguno de estos hechos acredita aún un acceso Sandbox real.

Zoho documenta que el refresh token pertenece a una organización/entorno concreto y no puede trasladarse desde Production a Sandbox cambiando únicamente la URL. Verificar también `api_domain` del token recibido. [Documentación oficial de renovación](https://www.zoho.com/crm/developer/docs/api/v8/refresh.html).

LidIA ha detectado además que CreateCallAsync construye un destino Production fijo en728. Su guard debería rechazar ese destino con autoridad Sandbox, pero la llamada no funcionará hasta resolverlo según la conexión. El equipo fuente prepara ese ajuste y audita las otras lecturas/escrituras; el soporte Sandbox del resolverOwner no basta para declarar el gateway completo disponible.

Portal ha preparado un candidato privado nuevo, `runtime-dev-pending.env`, conservando sólo credenciales locales de BD/autenticación/cifrado y con S2S/guest apagados. No copia claves S2S, OAuth ni destinos externos PRO. No se ha aplicado al proceso; recibirá exclusivamente la entrega DEV verificada.

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

Guest APP se comprueba con su autoridad v2 por instalación cuando el receptor la entregue: Login o Continuar sin registro → respuesta real → recuperación de la misma conversación. No habilitar guest global para evitar un fallo de permisos. Contacto cualificado automático y vínculo/alta opcional conservan sus dependencias documentadas; no se simulan como aceptación real.

## Evidencia y criterio de cierre

Cada plataforma requiere capturas sin secretos, ids propios de conversación/operación/mensaje, estado del operador, recibos y resultado de recuperación. Los checks de código, API, interfaz nativa y distribución física tienen resultados separados. Un fallo o una dependencia pendiente impide declarar el ciclo completo PASS.

Tras superar ambos ciclos, comprobar cuál es la última fuente móvil aceptada, firmar/instalar el Release correspondiente en iGonchu, abrirlo y verificar versión y endpointHTTPS. Nunca instalar en el iPhone la copia del simulador con loopback. Si ya tiene el mismo número, verificar procedencia del paquete antes de atribuirle la fuente validada. La instalación no activa por sí sola canales ni permisos en PRO.
