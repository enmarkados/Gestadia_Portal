# Nueva conversación con LidIA

[Glosario](../../GLOSARIO.md) · [Navegación](NAVEGACION.md). Corrección del 08/10/2026 en codex/app-conversaciones-backend.

## Problema reproducido

Inicio y Mensajes abrían la conversación existente; dentro del chat sólo se ofrecía crear otra después de cerrarlo. Portal reutilizaba además la conversación no cerrada por cuenta/propósito/expediente. Una etiqueta nueva por sí sola no resolvía el problema.

## Plan y comportamiento

1. Mostrar «Nueva conversación con LidIA» en Inicio y Mensajes, y una acción compacta siempre visible sobre el compositor del chat. Mantener «Continuar conversación» en Inicio y los chats exactos en Mensajes.
2. Separar la ruta nueva=UUID de conversacion=id. La pantalla nueva presenta «Iniciar conversación»; navegar no llama a POST. El UUID identifica ese intento incluso al recargar/reintentar. Después de crearlo se canoniza la ruta al id conservando el origen de Atrás.
3. APP → Portal acepta create_new:true sólo para sondeo; false/ausente mantiene la reanudación. Crear no cierra, borra, reasigna ni modifica los chats previos. El hash durable vincula esa intención y rechaza cambiarla con la misma clave. No cambia el DTO S2S, las tablas, permisos ni agentes.
4. La recuperación de una sesión pendiente por id pasa conversation_id local explícito a Portal, conservando su operación inicial; no puede elegir por scope otro chat más reciente. Validar cuenta, propósito, expediente y permisos, y rechazar mezclar esa referencia con create_new:true.
5. Deshabilitar la salida a otro chat mientras hay envío sin confirmar, operación en curso o borrador sin enviar. Ante fallo de creación, reintentar conserva la clave. Se recupera una creación pendiente por el id local, sin crear otra sesión.
6. Verificar regresiones de dos chats activos del mismo scope, historial por id, reanudación, concurrencia y pérdida de respuesta; recorrer Inicio/Mensajes/chat en web y comprobar el build móvil.

## Conformidad LidIA

Recibida por escrito del equipo LidIA en el hilo 01a1071b-1f23-7101-afd4-13935b20bd04 el 08/10/2026: AppSessionService.StartOrResumeAsync, con resume_conversation_id:null y clave nueva, crea GUID, AppConversation y ChatSession APP independientes. No hay unicidad por cuenta/propósito/case_ref; sí por ChatSessionId. Repetir la clave recupera la operación original. Contexto, typed state y turnos quedan vinculados a la conversación nueva. Portal puede implementar create_new:true manteniendo default false. Se solicitan regresiones de dos conversaciones del mismo scope, recuperación por id e idempotencia. No se cambia el contrato S2S.

## Verificación

Comprobado el 08/10/2026:

- TDD: las regresiones de nueva creación fallaron antes del cambio (4 backend; acceso/creación/clave frontend). La recuperación pendiente por id y la carga sin ofrecer otra sesión también fallaron antes de su corrección. Recuperar una creación pendiente mantiene la misma operación y canoniza el id cuando está lista.
- Suite completa: **135/135 frontend en 32 archivos** (95 APP en 11 archivos) y **132/132 backend**, con BBDD efímera local `gestadia_app_test`, independiente de los datos conectados. Se aplicaron las colaciones existentes de las migraciones al esquema de tests; `prisma db push` por sí solo no las representa. [Frontend](evidencias/2026-10-08-nueva-conversacion/frontend-tests.log) · [Backend](evidencias/2026-10-08-nueva-conversacion/backend-tests.log).
- Runtime APP local `127.0.0.1:5176` → backend loopback 3003 → integración S2S autorizada con LidIA. Nueva conversación desde el chat creó el id local `298ccabd-e7a2-4499-ab43-866fa54d08e3`; se envió un primer texto genérico y LidIA respondió desde el inicio con «¿Empezamos?» y opciones Sí/No. [Chat nuevo](evidencias/2026-10-08-nueva-conversacion/web-chat-nuevo.jpg).
- Mensajes conserva los chats antiguos y los nuevos con sus fechas/estado. Abrir el anterior `5cc1b4dc-0dff-4439-b575-e343cc710a5d` recupera sus cinco turnos y la pregunta de residencia; Atrás vuelve a Mensajes. No se cerró ni borró ninguna conversación. [Listado](evidencias/2026-10-08-nueva-conversacion/web-mensajes.jpg) · [Anterior](evidencias/2026-10-08-nueva-conversacion/web-chat-anterior.jpg).
- iOS Debug: build, instalación y arranque en iPhone 17/iOS 26.5 correctos. Inicio → Nueva → acceso con cuenta ficticia → retoma Nueva → Iniciar creó `22605ede-1c6e-4941-b039-3aa696a93a7b`; escritura mediante Capture Keyboard, envío con la flecha y respuesta inicial de LidIA observados. Se conserva cabecera segura, nueva acción, compositor y dock con teclado. El build final también incorpora la corrección de carga. Tras instalarlo se repitió acceso desde Mensajes, recuperación por id del chat creado y Atrás a Mensajes, conservando los cinco chats. [Listado final iOS](evidencias/2026-10-08-nueva-conversacion/ios-mensajes-final.jpg) · [Historial nuevo recuperado](evidencias/2026-10-08-nueva-conversacion/ios-respuesta-final.jpg). [Inicio](evidencias/2026-10-08-nueva-conversacion/ios-inicio.jpg) · [Continuación tras acceso](evidencias/2026-10-08-nueva-conversacion/ios-nueva-tras-acceso.jpg).
- Asociación leída en Portal: misma cuenta, tres ids remotos distintos y activos (anterior, nuevo web, nuevo iOS). [Comprobación sin credenciales](evidencias/2026-10-08-nueva-conversacion/asociaciones.json).
- APP build + sync correctos. Android `assembleDebug` aprobado, 213 tareas; APK instalado con conservación de datos en `emulator-5560` (`Success`); el JS `index-CVTFCA_4.js` coincide por SHA-256 entre dist, App.app iOS y APK Android. [Assets](evidencias/2026-10-08-nueva-conversacion/assets.json). La interfaz Android sigue pendiente de la autorización específica ya solicitada; no se presenta este build como E2E Android.

El clon APP y las credenciales/grants mantienen la configuración existente. No se operó atención humana, la conversación 6e22, pagos, Zoho, firma de distribución, tiendas ni publicación de APP. Esta entrega corrige crear/continuar chats y conserva las demás dependencias de aceptación global de la APP documentadas en el plan.

## Confirmación en origen (LidIA)

Lectura y aceptación del equipo LidIA recibidas el 08/10/2026 y registradas en [PR1615](https://github.com/enmarkados/Gestadia_LidIA/pull/1615), merge DEV `613122b2f12d668e45c99fba2cb4284201d9e8af`. Cada sesión nueva tiene AppConversation/ChatSession propio, cuenta común, canal APP, proyecto 103, agente 122/instrucción 10116, state_revision 4 y AgentStateJson propio. Las dos parten de defaults sin heredar Colombia del anterior; sus resultados de sondeo son independientes, revisión 1. Los dos turnos terminaron y LlmCallLogs 38602/38603 confirman llamadas reales al modelo con respuesta inicial.

El equipo comparó el chat anterior con el backup SQL de hoy anterior a las creaciones: AgentStateJson, SondeoJson, contexto, revisiones 16/5, resultado, estado activo y los diez mensajes permanecen idénticos. Hash del state: `14a8acd71d2cdbfb2f2f798dce44f4dcf9546618bc2a5afa5c9aebf368b2ac9a`. Esta aceptación cubre creación/identidad/persistencia/primer turno y conservación; **no declara completado el sondeo de canje**.

[Copia del acta de LidIA](../integraciones/2026-10-08-lidia-acta-nuevas-conversaciones.md). En web a 320 px la pantalla Nueva mide 320 px sin desbordamiento y su botón Iniciar mide 258 × 46 px. Se comprobó Nueva desde Mensajes y cancelación con Atrás, sin otro POST de creación.
