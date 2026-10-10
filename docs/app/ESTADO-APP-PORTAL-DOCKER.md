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
| Docker APP/web/Portal/backend | Pendiente | Stack e imágenes finales integradas |
| Datos y LidIA | Pendiente | Validación conectada |
| Privacidad/baja | En curso | Criterio confirmado; textos autorizados a Codex, ejecución de borrado pendiente |
| Despliegue | Pendiente | Gates previos |
| Firma/distribución | Pendiente | Release exacta en TestFlight/Play |
| Aceptación nativa | Pendiente | Emuladores uno por vez; iPhone físico |
| Tiendas | Pendiente | Revisión y disponibilidad |

## Revocación y productor común

La retirada de acceso invalida AppDeviceSession y AuthSession, desactiva PushDevice y deja la revocación APP durable. La renovación de prueba de cuenta también invalida sesiones móviles. El productor real notifyUser conserva email/bandeja y genera PushDelivery transaccional; se comprobó rollback en la DB efímera. Suite final: 204 backend y 165 frontend, cero fallos u omisiones. Evidencia: artifacts/inventario-docker-20261010/productor-portal-final.log y revocacion-productor-final.log. SMTP/APNs/FCM externos no se enviaron en estas pruebas.

## Criterio de baja confirmado

El usuario confirma cerrar acceso, retirar asociaciones Apple/Google y push, eliminar datos de cuenta innecesarios y conservar expedientes/documentos/justificantes solo cuando corresponda, con explicación del resultado. Autoriza a Codex a redactar los textos. No queda pendiente otra aprobación general de este criterio. Se debe implementar borrado efectivo; retirar acceso no equivale a eliminar datos.
