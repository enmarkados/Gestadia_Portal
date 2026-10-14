# Gestadia 0.1.0 (4): integración de app/main

[Manual](MANUAL-DESARROLLO.md) · [Navegación](NAVEGACION.md) · [Recorridos](2026-10-11-recorridos-gestores.md)

Integra `origin/app/main` hasta `abd0831`, conservando firma, arranque nativo, botones oficiales, sincronización del teclado y pulso del texto y puntos de la build (3). La revisión de recorridos y sus capturas siguen en el inventario del manual.

Cambios: LidIA separada de Mensajes de gestores; nueva/continuar/historial en LidIA, renombrado con cancelar visible, contacto de gestor resuelto por CRM, preferencias de notificaciones y estado leído/no leído, y acceso Apple/Google a cuentas Gestadia existentes sin autorregistro social.

Validación de integración: `node scripts/test-app-conversations.mjs`: 285 pruebas backend y 191 interfaz, compilación APP correcta; MySQL efímero aislado.

Las tres migraciones nuevas son aditivas. Antes de aplicarlas en producción se requiere nueva copia SQL/configuración/documentos y restauración aislada comprobada.

Visitantes v2 conserva `APP_V2_ENABLED=false` y `APP_V2_GUEST_ENABLED=false` por defecto hasta aceptación conjunta DEV. El chat de gestor depende de asignación y permisos efectivos del servidor LidIA; no se conceden desde la APP. Las pruebas locales no acreditan llamada CRM ni conversación humana real.

Estado de entrega: IPA 0.1.0 (4) archivado/exportado y firma estricta verificada; APNs production, Apple Default y get-task-allow=false. Preflight empaquetado correcto. Xcode confirmó la subida de (4). Apple ha procesado la (4), se han guardado las notas de prueba y Gestadia QA muestra «En pruebas». ID de build: `40012bc8-7778-42ca-a6b8-9f4f54349b59`. La última lectura de su tester acredita (3) instalada; instalación y aceptación de (4) pendientes.

Docker: backend cf68661 y APP aa10524 preparados para linux/amd64; configuración nginx validada. Se conserva web/Portal be6806d, configuración privada y bind documental. Backup nuevo y restauración aislada comprobados el 11/10/2026 antes del cambio: 45 usuarios, 94 expedientes, 14 documentos y 10 migraciones; SQL de 223227 bytes, SHA-256 `0274dcd19f707eea955c1c2d0395e9090610a69031f7d6a101b94673d89a73ad`. Las 19 tablas restauradas pasaron mariadb-check; configuración, claves y documentos coinciden byte a byte. Se aplicaron las tres migraciones nuevas (13 en total), con salida 0. Stack 73 actualizado: APP aa10524, backend cf68661 y web/Portal be6806d; los tres contenedores saludables. Se conservan los binds y la configuración previa. Evidencias en artifacts/testflight-appmain-build4.

El proxy Docker permite únicamente `context`, `chat` y `callback` de `/api/app/contact/`, con autorización y rate limit en backend. Conserva bloqueadas las rutas guest hasta su aceptación DEV; no modifica claves, grants ni aislamiento de red.

Verificación servida: app.gestadia.com/build-info.json acredita aa10524; gestadia.com conserva be6806d. GET /api/app/contact/context devuelve 200 y kind call; GET /api/notificaciones y PATCH de un ID inexistente sin sesión devuelven 401. Las rutas inglesas /api/app/notifications/preferences y /api/app/conversations no existen (404); no son endpoints de esta APP. Con sistemas@enmarkados.com se abrió Mi Perfil, la bandeja vacía de avisos y Continuar conversación, y un único mensaje técnico recibió respuesta real de LidIA. No se solicitó callback ni chat de gestor. El pulso durante espera no quedó acreditado en esta comprobación; la aceptación de animaciones y teclado en el iPhone (4) sigue pendiente. Notas de TestFlight actualizadas y guardadas con el backend activo.
