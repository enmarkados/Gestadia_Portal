# Integración conversacional Gestadia APP ↔ LidIA

**Referencia de desarrollo (11/10/2026):** la prioridad actual es la pasarela de cuenta APP → Portal → LidIA → agente 119 real, con texto literal y sin evaluación paralela. LidIA está validando el motor nativo y su despliegue; versión/configuración efectiva y prueba conectada pendientes según el [registro vigente](../integraciones/2026-10-10-coordinacion-portal-contrato-v2.md). La preparación v2/visitantes permanece separada. Los resultados y configuraciones fechados a continuación describen el circuito probado entonces; no habilitan ni acreditan este nuevo destino. [Manual para retomar el desarrollo](MANUAL-DESARROLLO.md).

**Estado vigente (07/10/2026):** canal APP conectado a LidIA PRO y comprobado con un único «Hola» desde una conversación nueva del sujeto principal. El agente dedicado 122 utiliza contenido y versión de instrucción copiados literalmente del 119 y el mismo modelo; la respuesta visible corresponde a una llamada real de Anthropic. [Cierre del canal con copia literal](../integraciones/2026-10-07-prueba-canal-app-clon-literal.md), [cierre local anterior](../integraciones/2026-10-07-cierre-visual-conversaciones.md), [entrega técnica](../integraciones/2026-10-05-entrega-portal-conversaciones-app.md) y [glosario](../../GLOSARIO.md).

La implementación Portal permanece en `codex/app-conversaciones-backend` / PR 9, sin merge ni despliegue Portal. Los flags de producto siguen apagados por defecto. El consumidor temporal 5176 habilita `/api/app/v1` y S2S mediante configuración privada; no inicia PluginWeb ni identidad anónima como fallback. La cuenta ficticia ya validada conserva `sondeo`/`history` hasta 08/10/2026 14:53:47 UTC (16:53:47 Europe/Madrid), sin expediente, asignaciones ni autoridad CRM. No acredita invitación real entregada, instalación de esta versión en el teléfono, sondeo completo o atención comercial/gestor.

Zoho postea directamente a Portal para correlacionar cuenta/trámite y comunicar «Cerrado ganado». LidIA gestiona conversaciones. [Responsabilidades](RESPONSABILIDADES-INTEGRACION.md), [decisión ganado](../integraciones/2026-10-05-decision-negocio-zoho-ganado-y-acceso.md) y [propuesta acceso anticipado](2026-10-05-propuesta-acceso-conversion-crm.md) siguen vigentes; sus receptores/disparadores no se implementan en este bloque.

Se aplican anexos [S2S](../integraciones/2026-10-05-app-s2s-anexo-firma.md), [DTO](../integraciones/2026-10-05-app-anexo-dtos.md) y [contexto1.1](../integraciones/2026-10-05-adenda-contexto-conversacional-v1-1.md). Los documentos fechados conservan sus estados históricos; este documento recoge el vigente.

## Transición al agente APP dedicado

El usuario autorizó clonar 119, Playground y redeploy LidIA con respaldos previos de código y BBDD. [Adenda y recuperación](../integraciones/2026-10-07-adenda-agente-app-y-transicion.md). Portal comprobó recuperación de su código/configuración/base local en contenedor sin red. LidIA acreditó restauración de su backup en MariaDB 11.4.12 sin red (188 tablas / 257 migraciones), migración EF `20261005204814_AddAppConversations` limitada a ocho tablas APP nuevas y 119 intacto. Su suite final registró 16.002 correctas, 283 omitidas y 0 fallos; es evidencia del equipo fuente, distinta de esta prueba conectada.

Destino servidor: agente 122 «LidIA Canje APP», proyecto 103 «Gestadia APP» (`gestadia-app`), instrucción 10116, alias `claude-haiku-4-5`. La versión inicial `1.0-app-119-20261007` incluía una adenda APP y produjo la prueba Playground y tres turnos APP posteriores. El humano corrigió el alcance: primero instrucciones originales y sólo comprobar el canal. El refinamiento propuesto de país/opciones no fue guardado. LidIA igualó contenido/version 10116 a 10115: `1.8-mario-adaptado`, SHA256 `ec616c2687189eaded1a77d904d2c720aa12c8ab9f629850f74bc4202bcd0286`, y saludo/parámetros TTS a 119. La [proyección sanitizada](../integraciones/evidencia/2026-10-07/clon-literal-instruccion.json) recoge esa igualdad y las diferencias operativas de aislamiento.

La instrucción literal conserva el runner APP y su política de canal/salida `emit_app_turn`. Los IDs/propiedad de proyecto son propios y siguen deshabilitadas conexión WhatsApp, automatización y timeout. No se afirma equivalencia completa con el runtime/herramientas/automatismos del 119. El original y el historial anterior permanecen intactos según la comprobación de LidIA.

Origen `https://lidia.gestadia.com`, integración/audiencia `gestadia-app-pro-local-validation`. Tras PR 1600 y promoción PR 1601, LidIA acredita build `V1.708-app-config-persistente`, merge `b63b89dd64becbc9a221d3a1491c2385381add4b` e imagen `sha256:2cc558e2cce8c39f2d089c6f0367d2432f5a6242750a6c0741da3730171a17fa`. La primera [evidencia](../integraciones/evidencia/2026-10-07/served-runtime-evidence.json) corresponde a instalación apagada, HTTP 503 y se conserva sin reescribir. Después el humano autorizó explícitamente S2S a ambos equipos en el turno `01a116d1-a55b-70b2-a4fb-21d54dfc1c0a`. La [evidencia posterior de habilitación](../integraciones/evidencia/2026-10-07/s2s-effective-evidence.json) acredita contenedor `9809f966222735ad27233e19dfbaf0ebc56210bb7812525cf3722685eb869409` healthy y APP true; petición sin firma, HTTP 401. Las peticiones firmadas 201/200 desde Portal se acreditan después por separado.

Las claves por capacidad se entregaron en archivos privados 600 y no se incluyen en Git ni frontend. `validUntil` limita la autoridad de cuenta de esta prueba, no la duración de las claves HMAC; v1 requiere retirada/desactivación explícita de claves. TLS normal, Stripe/Zoho/SMTP/legacyLidIA apagados. El lanzador sólo admite rutas APP/salud y lecturas autenticadas GET `/api/me`, `/api/expedientes`, `/api/notificaciones` necesarias para AppContext; bloquea otras rutas/efectos. El checkout y PluginWeb permanecen fuera del circuito.

Playground produjo dos turnos reales en sesión `ca4ba868-7d21-4b89-b0cc-ae16c7624455`, con instrucción inicial adaptada. Se conservan [extracto SQL sanitizado](../integraciones/evidencia/2026-10-07/playground-modelo-real.json) y [captura](../integraciones/evidencia/2026-10-07/playground-agente122.png). `HttpStatus` null no se interpreta como 200. Esa prueba acredita Playground, no sustituye la prueba APP.

## Pruebas APP realizadas y límite vigente

El consumidor 5175/backend 3002 recibió tres turnos del modelo real en conversación `de8817b1-fef5-4eff-b5d1-f1350394848c`, todavía con la adenda inicial. Portal comprobó recuperación del mismo historial y opciones antiguas invalidadas. Se observaron un país sin confirmar en estado tipado y una etiqueta de opción reflejada como input interno; se conservaron como incidencias, sin corregir instrucciones ni reescribir historia. No se enviaron más turnos tras la corrección humana.

Para la prueba literal se preparó backend 3003/APP 5176 con base local nueva, misma identidad exacta, permisos y timestamps de autoridad que el principal; LidIA reutiliza el mismo sujeto. Conversación Portal `5cc1b4dc-0dff-4439-b575-e343cc710a5d`, remota/ChatSession `a0490f84-6eba-4c0c-a02a-579d1aa72b11`. Desde la UI se envió exactamente «Hola» una vez, sin pulsar opciones. SESSION 201, CONTEXT 200 y TURN 200 quedaron admitidos; contexto 1/1 y estado 4. [Estado Portal](../integraciones/evidencia/2026-10-07/app-clon-literal-estado-portal.json), [registro SQL/modelo fuente](../integraciones/evidencia/2026-10-07/literal-channel-model-evidence.json) y [captura APP](../integraciones/evidencia/2026-10-07/app-clon-literal-primer-turno.jpg) corresponden a esa misma conversación.

LidIA registra `LlmCallLogs` 38464, UTC 07/10/2026 15:33:52.287280, Agent 122/Project 103, propósito `app_conversation`, Anthropic `claude-haiku-4-5-20251001`, `Success=1`. Timeline fuente: un mensaje cliente «Hola» y una respuesta asistente que termina «¿Empezamos?», coincidentes con la UI. La igualdad de instrucción se acredita en BBDD; el audit del proveedor conserva sólo metadata y no el prompt completo. Los campos de comparación del prompt son null, no false; no se afirma una comparación textual del prompt ejecutado desde ese audit.

La conversación quedó visible y recuperada en el navegador del humano por LidIA sin enviar otro turno. Se preservan 5175 y el fixture local anterior. No hay nuevos refinamientos, pruebas de opciones ni cuentas. Atención comercial/gestor, sondeo completo, Zoho/pagos, retirada final de acceso y despliegue Portal requieren sus pasos separados.

La prueba adicional propuesta con segundo sujeto para revocación no se ejecutó: revisión automática rechazó esa creación por falta de autorización explícita para la segunda identidad/efectos remotos. No se reintentó ni se buscó una vía alternativa. No acredita revocación real contra PRO; la cuenta principal conserva únicamente su plazo autorizado.

## Adaptador PluginWeb anterior (referencia)

El adaptador existente usa la API de PluginWeb con su propia interfaz React. IA y soporte comparten una sesión de plataforma. El diseño visual vigente muestra los mensajes del cliente en negro suave en LidIA y en rojo en el chat del gestor. Cambiar la pestaña de Mensajes no solicita por sí solo un handover. El contrato APP propuesto mantiene contextos de sondeo y atención, conservando una misma sesión cuando se transfiere a humano dentro de una conversación.

La key pública `lw_…` se configura con `APP_PLUGIN_KEY`. La URL base y host TLS se configuran con `LIDIA_UPSTREAM` y `LIDIA_HOST`. El navegador consume `/lidia/api/pluginweb/...`, que Nginx envía a la plataforma. La key deberá permitir `https://app.gestadia.com` y los orígenes nativos `capacitor://localhost` (iOS) y `https://localhost` (Android), sujetos a la configuración definitiva.

| Operación | Contrato |
|---|---|
| Configuración | `GET /api/pluginweb/config`, `X-Plugin-Key` |
| Inicio | `POST /api/pluginweb/sessions`, `{visitorId, formulario?}` |
| Respuesta inicial | `{sessionId, sessionToken, historial}` |
| Historial | `GET /api/pluginweb/sessions/{sessionId}/messages` |
| Envío | `POST /api/pluginweb/sessions/{sessionId}/messages`, `{text}` |
| Cabeceras de sesión | `X-Plugin-Key`, `X-Session-Token` |
| Mensaje | `{content,isUser,isSupport,timestamp}` |

La interfaz admite los campos de formulario configurados por el agente: nombre, teléfono y email. Los solicita antes de iniciar cuando están habilitados; no envía automáticamente el perfil del portal. El token se conserva en memoria y `sessionStorage` de esta pestaña para sobrevivir a una recarga. Se descarta al cerrar la sesión del portal, iniciar una cuenta o cambiar de perfil demo. No se guardan mensajes reales en `localStorage`.

El polling de historial completo cada cuatro segundos evita mezclar relojes de broadcast y timestamps persistidos. Los errores de red o 5xx no provocan reenvíos automáticos: se consulta el historial para comprobar si el mensaje quedó recibido. Los 400/401/403/429 se muestran y se conserva el texto rechazado. Ante un envío sin confirmación, el usuario puede recuperar el texto manualmente, con aviso de posible duplicidad; nunca se reenvía por sí solo.

## Gestor e identidad

El paso al humano es una operación interna de la plataforma (`SupportQueueService`), normalmente invocada como tool por el agente. PluginWeb no ofrece un endpoint anónimo específico para forzarlo. La app puede enviar una consulta normal solicitando atención humana; no declara asignación o recepción por Juan Carlos hasta que la plataforma responda como soporte.

PluginWeb reconoce un visitante, no autentica su identidad del portal. El formulario de teléfono/nombre es declarativo. No permite usar el JWT del portal como token de LidIA ni acceder por él a conversaciones previas del cliente. Vincular un cliente autenticado a una sesión verificada es un trabajo separado de la plataforma.

## Public Chat y adjuntos

El equipo recomienda Public Chat v1 cuando el usuario viene de un handoff WhatsApp: canje de ticket en fragmento, token `X-Public-Chat-Token`, timeline y turnos con `Idempotency-Key`. Ese flujo no reemplaza el inicio anónimo desde la app sin ticket. Se mantiene fuera de esta primera conexión hasta disponer del contrato de entrada para ese recorrido.

Los adjuntos de LidIA exigen Identity o un token HMAC limitado a un contacto; el token de PluginWeb/Public Chat no basta. La primera app permite aportar documentos al expediente mediante la API existente del portal, sin enviarlos al chat.

## Pendientes del adaptador anterior (referencia)

- Confirmar la key pública del agente Gestadia y `AllowedOrigins`.
- Confirmar las bases efectivas PRO/DEV. El equipo encontró referencias a `lidia.vozenter360.com` (PRO) y `lidia.devvozenter.com` (DEV), sin acreditar la configuración servida.
- Probar conversación real con IA y por separado intervención humana.
- Validar la identidad del cliente si se requiere recuperar sus conversaciones entre dispositivos.
- Adjuntos de chat y Public Chat enriquecido quedan pendientes de contrato/adaptador, no se anuncian como conectados.
