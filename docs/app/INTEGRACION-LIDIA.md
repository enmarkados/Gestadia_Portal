# Integración conversacional Gestadia APP ↔ LidIA

**Estado vigente (07/10/2026):** implementación conversacional en `codex/app-conversaciones-backend`, con circuito APP–Portal–LidIA probado localmente usando un modelo determinista identificado. [Cierre local](../integraciones/2026-10-07-cierre-visual-conversaciones.md), [entrega técnica](../integraciones/2026-10-05-entrega-portal-conversaciones-app.md), [acta de autorización](../integraciones/2026-10-05-acta-inicio-conversacional.md) y [glosario](../../GLOSARIO.md).

Los flags permanecen desactivados por defecto; el circuito local los habilita mediante configuración privada. La API autenticada usa `/api/app/v1` y cliente S2S dedicado; no inicia PluginWeb ni usa identidad anónima como fallback. El sondeo requiere cuenta validada, sin CRM; atención humana comparte la conversación en LidIA con permisos/asignación acreditados por Portal. La evidencia local no acredita modelo real, producción ni cambios en la app de demostración instalada.

Los flujos Zoho postean directamente a Portal y habilitan cuenta/trámite. Ganado conserva su evento obligatorio, separado del contrato conversacional. [Responsabilidades](RESPONSABILIDADES-INTEGRACION.md), [decisión ganado](../integraciones/2026-10-05-decision-negocio-zoho-ganado-y-acceso.md) y [propuesta acceso anticipado](2026-10-05-propuesta-acceso-conversion-crm.md) siguen vigentes. Sus receptores y disparadores no se implementan en este bloque.

Se aplican anexos [S2S](../integraciones/2026-10-05-app-s2s-anexo-firma.md), [DTO](../integraciones/2026-10-05-app-anexo-dtos.md) y [contexto1.1](../integraciones/2026-10-05-adenda-contexto-conversacional-v1-1.md). La entrega concreta documenta el cierre de replay/retención y cursor de cola acordados; los documentos fechados anteriores conservan su revisión histórica. El panel PRO y la configuración original de LidIA Canje v4 se han contrastado de forma autenticada; la comprobación de aislamiento y ejecución del nuevo canal APP se registra separadamente a continuación.

## Transición al agente APP dedicado

El usuario permite clonar 119 y crear la vía APP, condiciona el redeploy LidIA a respaldos de código y BBDD y exige probar el clon en Playground. [Adenda y recuperación](../integraciones/2026-10-07-adenda-agente-app-y-transicion.md). Portal ha comprobado la recuperación de su código/configuración/base local en un contenedor sin red; las copias de producción LidIA corresponden a ese equipo.

LidIA comunica provisionamiento efectivo de agente 122 «LidIA Canje APP», proyecto 103 «Gestadia APP» (slug `gestadia-app`), instrucción 10116 versión `1.0-app-119-20261007`, SHA256 `f6a6d1a365b277a0c55baaccdc94f182cbace7e9b2ba0a48cfb289e09a8185c9`, modelo `claude-haiku-4-5`. Informa proyecto sin canales/conexión, agente sin conexión/automatización/timeout/global tools/flujo y comparación completa del 119 sin cambios. Esta información se atribuye a la lectura de la fuente por LidIA; todavía no acredita respuesta del proveedor ni configuración APP servida.

Origen, integrationId y audiencia acordados: `https://lidia.gestadia.com`, `gestadia-app-pro-local-validation`, entorno fuente `pro`. [Preparación Portal separada](../integraciones/2026-10-07-preparacion-portal-validacion-pro.md): base y cuenta ficticias nuevas, sin copiar autoridad ni asociaciones del fixture, procesos previstos 3002/5175 aún sin arrancar. Claves y validez efectivas pendientes. La prueba de identidad de la cuenta es un fixture provisionado; no acredita una invitación real entregada.

La primera autoridad sólo permite `sondeo` y `history`, sin expediente/asignaciones. El lanzador temporal permite `/api/app/v1/`, salud y las lecturas autenticadas GET `/api/me`, `/api/expedientes`, `/api/notificaciones` necesarias para AppContext; bloquea otras rutas y efectos. Es un ajuste de la preparación privada, no un cambio del producto ni una conexión ya iniciada. Mantiene TLS normal y bloquea Stripe/Zoho/SMTP/PluginWeb/checkout.

**Pendiente:** resultado Playground del clon, commit/imagen/migraciones/configuración efectiva del runtime APP, entrega privada de claves y vencimiento. Después: grant mínimo en la nueva base, arranque separado y turno real desde APP con recibo/respuesta y recuperación de historial. Playground y APP son comprobaciones distintas; sólo el segundo acredita el runner/canal APP. Atención comercial/gestor necesita mapeos nuevos y prueba posterior. Producción Portal no se redespliega por separado.

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
