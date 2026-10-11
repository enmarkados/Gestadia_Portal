# Contacto visible y carga de chats — 11/10/2026

El usuario informa de teléfono cubierto por teclado numérico y solicita carga GIF centrada con texto contextual; aprueba el diseño breve. Hoja «Hablar con un gestor»: origen Inicio/Trámites/Mensajes, permisos y destino resueltos por servidor, Atrás/X devuelve al origen. Acción final: solicitud de llamada idempotente o chat del gestor asignado. La corrección visual no crea asignaciones ni solicitudes.

La hoja usa el mismo espacio y duración del teclado que la pantalla principal. Web adapta su visualViewport; Android mantiene resize nativo. El foco y el cambio de tamaño desplazan sólo el contenido de la hoja cuando el campo queda fuera, conservando el borrador. Prueba local con Sheet real, sin servicios externos: en 390×844 la hoja termina en y450 y el teléfono en y359.6; en 320×568, espacio disponible200, termina en y200 y el teléfono en y131.1, scroll234.5. Son simulaciones del espacio visible, no un teclado físico.

`ChatLoading` aporta GIF propio de 9648 bytes, imagen fija mediante picture para movimiento reducido, dimensiones estables, texto centrado y anuncio accesible. Carga de historial y conversación y comprobación de gestor; actualización conserva el historial. Errores quedan separados y retiran la carga. La entrada usa opacidad suave con demora120ms para evitar destellos de peticiones muy rápidas. No se anima un refresco automático de fondo ni se sustituye el indicador de escritura.

Fallo independiente reproducido en servidor: `/api/app/contact/context` devolvía404 HTML de Nginx. Dockerfile seleccionaba default.conf.template; common.conf.template contenía las tres rutas exactas de contacto. Ahora el build usa common por defecto. Regresión HTTP real en Docker local: imagen anterior falla404, candidata devuelve contexto200 y chat401 sin sesión; rutas privadas/desconocidas permanecen404 y plugin antiguo503. No abre endpoints adicionales ni altera autorización.

Verificación: 203 pruebas frontend en49archivos PASS; build APP PASS; dos pruebas de proxy Docker PASS. iOS0.1.0(9) en preparación. Despliegue, restauración, disponibilidad TestFlight y aceptación física se documentarán sólo después de observarlos. Play conserva build3. Gestor real requiere asignación y permisos existentes; no equivale a un formulario de contacto ni a sondeo de LidIA.

[Carga centrada](carga-movil.png) · [Teléfono](telefono-viewport.png) · [Espacio reducido](telefono-320.json).

## Cierre observado de la revisión 9

Copia y restauración verificadas antes del despliegue: SQL271105bytes, hash54be58275ef78d94f51a38455a8127937e7c11094a3e0156d84e286a50ca60b3,45usuarios/94expedientes/14documentos/13migraciones;24tablasOK. Archivos/configuración/claves coinciden byte a byte. Stack73APP `eaaf71f`, backend `cf68661`, Portal `be6806d`: los tres saludables. Imagen AMD64 verificada. Contacto real de Sistemas devuelve200 `kind:call`, sin alerta404. JS/GIF/PNG públicos idénticos al archivo iOS.

iOS0.1.0(9) archivada, exportada y firma estricta válida; Xcode confirma Uploaded y Apple/GestadiaQA muestran En pruebas. [TestFlight](testflight-9.png), [firma](ios-proof.json), [copia](backup-proof.json), [servidor](public-proof.json). iPhone todavía acredita instalada la(6); teclado físico y carga(9) pendientes de aceptación. Play conserva(3).

## Diagnóstico independiente de la conversación antigua

Cuenta indicada por el usuario: existe una conversación `atencion` creada a03:38local, sin case_ref ni manager_name. Timeline200, support:none, permissions:[history], único saludo de LidIA, sin recibos de turno ni operaciones pendientes. Un único turno técnico, que excluye llamada/reserva/trámite, obtiene HTTP202 pero operación failed/capability_denied; el mensaje no se añade al timeline. Por tanto, no es el404 del formulario y no acredita gestor asignado. Se traslada la evidencia al chat Gestadia_LidIA por autorización humana previa de revisar esta incidencia.

La revisión posterior elimina la incoherencia de dejar enviar cuando sólo hay historial. Mantiene lectura y Atrás, retira compositor, desactiva acciones y explica cómo contactar desde Solicitar llamada; no amplía permisos ni borra conversaciones. Regresión RED/GREEN y prueba del pie externo. Su distribución se registrará con evidencia independiente. [Diagnóstico técnico](gestor-antiguo-proof.json) · [Denegación](gestor-antiguo-error.png).

## Cierre del servidor y archivo 10

Fuente `5febdf2`: 204 pruebas frontend/49archivos PASS; tras precisar la regresión al propósito atención, suite conversacional38/38PASS. APPbuild y archivo/exportacióniOS10 correctos, codesign estricto válido, APNsproduction conservado. IPA3314130bytes, SHA2567549fcf5e29f7779340214a291cb62e11c0bef1fa5b6622309e50ca91daec8f9.

Nueva copia manager-readonly-20261011: SQL271854bytes, SHA25620b455121e4b3fe50d78bfabb59edc24deddc5c3f6e2599d5b45ac0d52ddffdb;24tablasrestauradasaisladas,45usuarios/94expedientes/14documentos/13migraciones; archivos idénticos. APP5febdf2 desplegada17:24:32local con tres servicios saludables, configdigest AMD64 d8af2159a6e64407ce5c0dc66c42919370fffe1c7dbd3f157b17680a365ea072 comprobado antes de activar; stack leído de nuevo coincide salvo la referencia APP. Sin migración, ampliación de permisos ni borrado. [Copia](backup-readonly-proof.json), [servidor](portainer-build10.png), [recursos/firma](build10-proof.json).

La sesión publicada de Sistemas muestra el historial del chat antiguo, aviso y orientación a Solicitar llamada, sin compositor. [Pantalla](gestor-antiguo-lectura.png). No acredita gestor asignado ni reparación de la sesión remota: esa revisión sigue en LidIA. Xcode confirma Uploaded10; su disponibilidad TestFlight se cerrará al observar En pruebas.

## TestFlight 10 disponible

Apple ha procesado la build `834ad0d6-1cc7-4414-8ec8-3a7745a23a1c`. Se asignó a Gestadia QA y la lista de compilaciones muestra **0.1.0 (10), En pruebas**. Las instrucciones constan como Guardado. [Estado](testflight-10.png) · [Notas](testflight-10-notas.txt). Conserva GIF, teclado, burbujas, hora y scroll de las revisiones anteriores. Se solicita actualizar desde TestFlight para aceptar el teclado y la carga en el iPhone; Apple todavía muestra la (6) instalada. Plan Page actualizado y releído, secuencia 41.
