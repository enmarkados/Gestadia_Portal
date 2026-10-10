# Estado APP Portal Docker y tiendas

Actualizado: 10/10/2026. [Documento maestro](00-MAESTRO-APP-PORTAL-DOCKER.md) · [Artifact editable](https://chatgpt.com/space/page_2a257ea775a08191acdfa746f4c9098e).

## Inventario de producción

- gestadia.com y /portal/acceso: HTTPS 200, mismos assets index-BtjCKzHS.js e index-B6ugJuZR.css; /api/health 200; capacidades móviles APP 404.
- Plesk confirma Node 24.21.0, modo production, npm, raíz /httpdocs/backend, arranque src/server.js. Document root /httpdocs. El panel muestra una advertencia de que document root no es descendiente de application root.
- Almacén de documentos vigente: /var/www/vhosts/gestadia.com/httpdocs/backend/uploads. Propietario gestadia.com_vx391aaj8xf, grupo psacln; el contenedor deberá conservar lectura/escritura de este almacén.
- El directorio src servido lista middleware/services/routes y archivos de julio. No aparece directorio APP ni manifiesto de revisión en el inventario. El SHA servido no se acredita; se conserva como pendiente, separado del a6d6e14 local.
- APP document root verificado: /var/www/vhosts/gestadia.com/app.gestadia.com. TLS existente Plesk; la nueva API aún no está publicada.
- MariaDB y documentación permanecen donde están. No crear un volumen vacío sustituto.
- Política publicada: https://gestadia.com/privacidad, actualizada junio de 2026. Describe solo web, no el acceso social/push móvil. La propuesta debe ampliarla con los tratamientos efectivos. Sus plazos publicados no se consideran validados por esta auditoría.

## Verificación de integración local

Base de app/main a6d6e1497e32efa3c6a45fff3d6c67017a86bc05; preparación marketplaces c7ec158; documentación c2dd8e4. Integración confirmada en merge 08d2bbc en rama aislada, sin modificar producción.

Primera suite integrada: 198 backend y 165 frontend, 0 fallos y 0 omitidas. Nuevas regresiones observaron tres fallos: JWT móvil rechazado por contrato APP, sesión anterior seguía disponible tras retirada, alta social sin evidencia de verificación fechada. Tras adaptación: 201 backend y 165 frontend pasan; build APP correcto. Los avisos de React Router/jsdom existentes quedan registrados en los logs, no son validación de navegador.

## Copias y corte

Se dispone de copia previa de DB restaurada y dos migraciones móviles comprobadas solo en aislamiento. Antes del corte se exige backup fresco completo de DB, uploads y configuración/proxy; restauración y todas las migraciones integradas comprobadas. Se conserva el servicio anterior detenido y su configuración para retorno. No restaurar una DB antigua automáticamente después de nuevas escrituras.

## Fases

| Fase | Estado | Pendiente |
|---|---|---|
| Inventario | En curso | Huella completa del runtime, proxy y backup fresco al corte |
| Integración Git | Verificado localmente | Merge 08d2bbc, builds APP y Portal |
| Identidad y push común | Verificado localmente | 204 backend + 165 frontend; proveedores reales pendientes |
| Docker APP/web/Portal/backend | Verificado localmente | 3 imágenes AMD64 y runtime de prueba; importación y mounts reales pendientes |
| Datos y LidIA | En curso | Documentos y contenido conectados localmente; LidIA real pendiente |
| Privacidad/baja | Verificado localmente | Textos conectados y procesador de baja probados; operaciones de producción y proveedores reales pendientes |
| Despliegue | Pendiente | Gates previos |
| Firma/distribución | Pendiente | Release exacta en TestFlight/Play |
| Aceptación nativa | Pendiente | Emuladores uno por vez; iPhone físico |
| Tiendas | Pendiente | Revisión y disponibilidad |

## Revocación y productor común

La retirada de acceso invalida AppDeviceSession y AuthSession, desactiva PushDevice y deja la revocación APP durable. La renovación de prueba de cuenta también invalida sesiones móviles. El productor real notifyUser conserva email/bandeja y genera PushDelivery transaccional; se comprobó rollback en la DB efímera. Suite final: 204 backend y 165 frontend, cero fallos u omisiones. Evidencia: artifacts/inventario-docker-20261010/productor-portal-final.log y revocacion-productor-final.log. SMTP/APNs/FCM externos no se enviaron en estas pruebas.

## Criterio de baja confirmado

El usuario confirma cerrar acceso, retirar asociaciones Apple/Google y push, eliminar datos de cuenta innecesarios y conservar expedientes/documentos/justificantes solo cuando corresponda, con explicación del resultado. Autoriza a Codex a redactar los textos. No queda pendiente otra aprobación general de este criterio. Se debe implementar borrado efectivo; retirar acceso no equivale a eliminar datos.

## Stack común verificado localmente

Servicios gestadia-app, gestadia-portal-web y gestadia-backend construidos en AMD64 desde la línea 9221d59 con cambios Task 4. Candidatos etiquetados common-candidate; no son aún imágenes finales de release. API sin puerto host, web en loopback, usuarios no root y backend de solo lectura con documentos bind. Configuración pública: 6/6 pruebas. Stack real efímero: 7/7 y reinicio conservando documentos. Detectados en RED y corregidos: permiso del PID de Nginx no root, cabecera CORS Idempotency-Key ausente y archivo huérfano al intentar subir a expediente ajeno. Suite posterior 204 backend/165 frontend, sin fallos u omisiones. Evidencia common-stack-red.log, common-stack-green.log, config-conversaciones-green.log y proxy-documentos-suite.log en artifacts/inventario-docker-20261010.

Portainer consultado de nuevo: sesión Codex activa como gonzalo, entorno local Debian 12 AMD64, Docker 29.9.0. No se ha aplicado el conjunto ni cambiado el proxy. UID/GID de los documentos y mounts privados reales permanecen por comprobar antes del corte.

## Contenido público conectado

Privacidad compartida entre web/Portal/APP, términos y soporte conectados y URL pública de baja sin login, con mailto explícito. Demo conserva alcance local. Pruebas frontend 168/168, APP y web builds correctos. Navegador observó baja y navegación a privacidad, y política web completa; sin enviar correo ni baja real.

La entrada directa detectó splash por recursos relativos y navegación hash web que mostraba Inicio. Corregido: recursos desde raíz, BrowserRouter en web y HashRouter conservado en nativo. Prueba de scripts/estilos/imagen de arranque para cuatro URLs: 1/1 (entradas-directas-green.log); validación visual local de /legal/delete-account completada. El cambio de recursos/enrutador nativo se comprobará también con los builds de Task 8/9. Textos y fuentes: docs/legal/PRIVACIDAD-Y-BAJA-APP-PORTAL.md. La eliminación remota efectiva sigue pendiente de Task 6.

## Baja ejecutada en aislamiento

Procesador y herramienta privada implementados según [operación de baja](../legal/OPERACION-BAJA.md). Cuenta sin dependencias: perfil y credenciales eliminados, sesiones/asociaciones/push/bandeja retirados, referencia mínima de solicitud y cuenta inutilizable. Cuenta con expediente: revisión explícita ligada al inventario vivo; decisión de conservación concreta, campos retenidos cifrados fuera del perfil y lectura operativa auditada. No se purgan documentos del servicio automáticamente.

Revocación Apple fallida conserva el token para reintentar e impide completar. Comunicación del resultado con cinco intentos, recuperación de reserva agotada, aceptación SMTP requerida y destino cifrado retirado después del envío. Titularidad externa requiere comprobación y referencia operativa privada. Un productor con usuario antiguo no recrea bandeja ni inicia correo para una cuenta ya retirada; creación push y baja se serializan por cuenta. Las suites por archivo comparten DB y ejecutan workers globales: ahora se ejecutan secuencialmente, manteniendo pruebas explícitas de concurrencia dentro de cada caso.

GREEN final `baja-completa-green.log`: 208 backend, 168 frontend, cero fallos/omisiones, build APP. Casos y terceros ficticios; no correo externo, baja de producción ni decisión legal sobre expedientes reales. Nueva migración 20261010102000_account_deletion_execution pendiente de restauración/migración en Task 7. Fichas/declaraciones de tiendas se completarán sobre el comportamiento real de release.
