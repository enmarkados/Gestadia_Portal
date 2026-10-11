# Gestadia 0.1.0 (4): integración de app/main

[Manual](MANUAL-DESARROLLO.md) · [Navegación](NAVEGACION.md) · [Recorridos](2026-10-11-recorridos-gestores.md)

Integra `origin/app/main` hasta `abd0831`, conservando firma, arranque nativo, botones oficiales, sincronización del teclado y pulso del texto y puntos de la build (3). La revisión de recorridos y sus capturas siguen en el inventario del manual.

Cambios: LidIA separada de Mensajes de gestores; nueva/continuar/historial en LidIA, renombrado con cancelar visible, contacto de gestor resuelto por CRM, preferencias de notificaciones y estado leído/no leído, y acceso Apple/Google a cuentas Gestadia existentes sin autorregistro social.

Validación de integración: `node scripts/test-app-conversations.mjs`: 285 pruebas backend y 191 interfaz, compilación APP correcta; MySQL efímero aislado.

Las tres migraciones nuevas son aditivas. Antes de aplicarlas en producción se requiere nueva copia SQL/configuración/documentos y restauración aislada comprobada.

Visitantes v2 conserva `APP_V2_ENABLED=false` y `APP_V2_GUEST_ENABLED=false` por defecto hasta aceptación conjunta DEV. El chat de gestor depende de asignación y permisos efectivos del servidor LidIA; no se conceden desde la APP. Las pruebas locales no acreditan llamada CRM ni conversación humana real.

Estado de entrega: IPA 0.1.0 (4) archivado/exportado y firma estricta verificada; APNs production, Apple Default y get-task-allow=false. Preflight empaquetado correcto. Xcode confirmó la subida de (4). App Store Connect ha caducado al consultar su procesamiento; asignación a Gestadia QA pendiente de iniciar sesión.

Docker: backend cf68661 y APP aa10524 preparados para linux/amd64; configuración nginx validada. Se conserva web/Portal be6806d, configuración privada y bind documental. Backup/restauración/migración están preparados en artifacts/testflight-appmain-build4; no ejecutados en producción por sesión Portainer/Plesk caducada. Las nuevas acciones de avisos/contacto requieren ese backend.

El proxy Docker permite únicamente `context`, `chat` y `callback` de `/api/app/contact/`, con autorización y rate limit en backend. Conserva bloqueadas las rutas guest hasta su aceptación DEV; no modifica claves, grants ni aislamiento de red.
