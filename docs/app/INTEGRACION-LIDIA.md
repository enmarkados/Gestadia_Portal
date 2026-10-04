# Conexión futura de Gestadia App con LidIA

**Desactivada en la primera versión instalada.** El 03/10/2026 el usuario ha autorizado preparar el backend conectado, con canal APP propio y alta por pago o Zoho Cerrado ganado. La arquitectura propuesta y sus evidencias están en [preparación APP](../integraciones/2026-10-03-app-lidia-backend-preparacion.md). Este documento conserva el adaptador PluginWeb anterior como referencia; no acredita integración publicada ni es el contrato de identidad APP.

El 04/10 se incorpora la [respuesta original de LidIA](../integraciones/2026-10-04-respuesta-contrato-app-lidia.md) y la [revisión Portal](../integraciones/2026-10-04-observaciones-portal-contrato-app-lidia.md). La propuesta usa HMAC S2S por petición y asociaciones durables, sin bearer de conversación. La revisión favorece la arquitectura y deja O1–O8 pendientes de acuerdo; no autoriza implementación o activación. La configuración efectiva del 119 y el aislamiento DEV siguen por comprobar.

Contrato contrastado el 3 de octubre de 2026 con `PluginWebController.cs`, `PluginWebDtos.cs`, `wwwroot/pluginweb/chat.js` y el equipo del chat «Avance del experimento MDVP». Lectura de código; no se ha cambiado la plataforma externa.

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

## Pendientes externos

- Confirmar la key pública del agente Gestadia y `AllowedOrigins`.
- Confirmar las bases efectivas PRO/DEV. El equipo encontró referencias a `lidia.vozenter360.com` (PRO) y `lidia.devvozenter.com` (DEV), sin acreditar la configuración servida.
- Probar conversación real con IA y por separado intervención humana.
- Validar la identidad del cliente si se requiere recuperar sus conversaciones entre dispositivos.
- Adjuntos de chat y Public Chat enriquecido quedan pendientes de contrato/adaptador, no se anuncian como conectados.
