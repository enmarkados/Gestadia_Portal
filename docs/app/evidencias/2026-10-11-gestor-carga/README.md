# Contacto visible y carga de chats — 11/10/2026

El usuario informa de teléfono cubierto por teclado numérico y solicita carga GIF centrada con texto contextual; aprueba el diseño breve. Hoja «Hablar con un gestor»: origen Inicio/Trámites/Mensajes, permisos y destino resueltos por servidor, Atrás/X devuelve al origen. Acción final: solicitud de llamada idempotente o chat del gestor asignado. La corrección visual no crea asignaciones ni solicitudes.

La hoja usa el mismo espacio y duración del teclado que la pantalla principal. Web adapta su visualViewport; Android mantiene resize nativo. El foco y el cambio de tamaño desplazan sólo el contenido de la hoja cuando el campo queda fuera, conservando el borrador. Prueba local con Sheet real, sin servicios externos: en 390×844 la hoja termina en y450 y el teléfono en y359.6; en 320×568, espacio disponible200, termina en y200 y el teléfono en y131.1, scroll234.5. Son simulaciones del espacio visible, no un teclado físico.

`ChatLoading` aporta GIF propio de 9648 bytes, imagen fija mediante picture para movimiento reducido, dimensiones estables, texto centrado y anuncio accesible. Carga de historial y conversación y comprobación de gestor; actualización conserva el historial. Errores quedan separados y retiran la carga. La entrada usa opacidad suave con demora120ms para evitar destellos de peticiones muy rápidas. No se anima un refresco automático de fondo ni se sustituye el indicador de escritura.

Fallo independiente reproducido en servidor: `/api/app/contact/context` devolvía404 HTML de Nginx. Dockerfile seleccionaba default.conf.template; common.conf.template contenía las tres rutas exactas de contacto. Ahora el build usa common por defecto. Regresión HTTP real en Docker local: imagen anterior falla404, candidata devuelve contexto200 y chat401 sin sesión; rutas privadas/desconocidas permanecen404 y plugin antiguo503. No abre endpoints adicionales ni altera autorización.

Verificación: 203 pruebas frontend en49archivos PASS; build APP PASS; dos pruebas de proxy Docker PASS. iOS0.1.0(9) en preparación. Despliegue, restauración, disponibilidad TestFlight y aceptación física se documentarán sólo después de observarlos. Play conserva build3. Gestor real requiere asignación y permisos existentes; no equivale a un formulario de contacto ni a sondeo de LidIA.

[Carga centrada](carga-movil.png) · [Teléfono](telefono-viewport.png) · [Espacio reducido](telefono-320.json).
