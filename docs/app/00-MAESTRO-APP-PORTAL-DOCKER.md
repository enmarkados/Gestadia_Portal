# Documento maestro de Gestadia APP Portal Docker y tiendas

Fecha: 10/10/2026. Responsable de ejecución: Codex en este chat. Responsable de decisiones de alcance, cuentas y aceptación: Gonzalo. Responsable de textos y conservación: pendiente de concretar tras revisar la política vigente.

[Artifact editable](https://chatgpt.com/space/page_2a257ea775a08191acdfa746f4c9098e) · [Plan de acción](../superpowers/plans/2026-10-10-app-portal-docker-tiendas.md) · [Estado y evidencia](ESTADO-APP-PORTAL-DOCKER.md) · [Evaluación previa](EVALUACION-SUBDOMINIO.md) · [Glosario](../../GLOSARIO.md)

## Resultado solicitado

Publicar Gestadia en App Store y Google Play con acceso Apple y Google en iOS y Android, permisos contextuales, firma válida y notificaciones reales. Servir app.gestadia.com mediante Docker en Portainer. La web completa gestadia.com y /portal se desplegarán también en Docker, según el alcance confirmado. Conservar cuentas, expedientes, documentos, pagos e integración CRM/conversacional existentes.

El plan se ejecuta en este chat con seguimiento por bloque. La instrucción «siguelo» autoriza continuar con el trabajo local y la preparación; no requiere repetir aprobaciones generales. Los pasos que necesiten una confirmación concreta de seguridad, aceptación contractual o intervención del titular se presentan cuando el resultado esté preparado para ejecutarlos.

## Arquitectura aprobada

Tres servicios del mismo conjunto de versiones: `gestadia-app` sirve la interfaz APP; `gestadia-portal-web` sirve la web/Portal; `gestadia-backend` sirve la API común, identidad, documentos y colas durables. Plesk conserva TLS y la entrada pública, reenvía a puertos loopback y no guarda secretos en páginas públicas. Los servicios se gestionan en Portainer.

La APP y el Portal tienen frontends separados, pero necesitan backend/datos compatibles. La base MariaDB actual y el almacén de documentos se conservan inicialmente. El backend común monta los documentos vigentes y custodia claves privadas fuera del webroot. La interfaz nativa permanece empaquetada en iOS/Android; el subdominio proporciona API, callback Apple, recursos públicos, privacidad, soporte y eliminación.

| Opción | Consecuencia | Decisión |
|---|---|---|
| Web completa gestadia.com más Portal y API en Docker | Un build web, mismas rutas /portal, /api y /webhooks; menos riesgo de mezclar assets de builds distintos | Elegida por Gonzalo el 10/10/2026 |
| Solo /portal y API en Docker | Mantiene web pública actual; requiere aislar assets y comprobar rutas/proxy entre dos builds | Alternativa si el usuario limita el alcance |
| Dos backends independientes sobre la misma DB | Duplica reglas de acceso, documentos y producción de avisos | No se adopta como arquitectura final |

El backend común debe preservar Stripe, Zoho y SMTP vigentes; jamás activar pago simulado en producción. La cuenta social nueva no obtiene expedientes, identidad CRM ni canal conversacional por compartir un correo. Los vínculos requieren prueba de control; el servidor resuelve el acceso.

## Estado comprobado al comenzar

- Recursos Apple/Google/Firebase, claves privadas y configuración de firma preparados en custodia local; faltan aceptación nativa y distribución de release.
- Imágenes web/API de la preparación anterior importadas en Portainer, stack cumplimentado sin desplegar. Son candidatas de prueba, no versión final integrada.
- Backend móvil previo: 86/86 pruebas; stack aislado: 5/5. No acreditan actualización del Portal ni recepción push física.
- Copia consistente de la DB real restaurada y migrada en aislamiento. La DB real no recibió esas migraciones. Se requieren nuevos backups completos antes del cambio definitivo.
- `app/main` local está en a6d6e14. La rama marketplaces carece de 33 commits de esa línea; la integración debe conservar conversaciones, recibos, navegación y contratos incorporados allí.
- Consulta pública del 10/10: gestadia.com y /portal/acceso sirven el mismo frontend con assets index-BtjCKzHS.js e index-B6ugJuZR.css; /api/health responde 200. La API móvil pública responde 404. No se ha identificado aún el SHA del backend servido.

## Requisitos para cerrar los bloques

| Bloque | Condición de cierre |
|---|---|
| Integración Git | Marketplace incorporado sobre app/main actual sin perder contratos/conversaciones/recibos; suites integradas pasan |
| Identidad y baja | Contraseña/social funcionan; revocación válida en APP y Portal, dispositivos y canal; borrado ejecutado o conservación explícitamente definida |
| Push | Aviso real del productor Portal crea entrega durable; envío sin duplicaciones indebidas; aceptación y recepción comprobadas por plataforma |
| Docker | Web/Portal/API corren en Portainer, sin secretos en imágenes; versión servida y montajes efectivos acreditados |
| Migración | Backups de DB, documentos, configuración y proxy; restauración comprobada; migraciones explícitas y corte reversible |
| Documentos y pagos | Archivos previos y nuevos accesibles en ambas superficies; checkout real/webhooks idempotentes; nada simulado en producción |
| LidIA y gestor | Contrato server-side conservado, APP aislada de WhatsApp y usuario autorizado; conversación real y recibos verificados |
| Público y legal | Privacidad, condiciones, soporte y solicitud de eliminación describen el servicio conectado y son accesibles por HTTPS |
| Firma y permisos | AAB/IPA de distribución, IDs y entitlements correctos; mínimo permiso y rechazo sin bloquear acceso |
| Tiendas | TestFlight y Play interno probados; ficha, privacidad y revisión completas; publicación comprobada por tienda |

## Decisiones pendientes

Decisiones recibidas el 10/10: web completa y Portal en Docker; cuenta de prueba autorizada sistemas@enmarkados.com; iPhone del usuario y simulador iOS, Android en emulador. Nunca ejecutar simultáneamente los dos emuladores. Para la política de baja, revisar primero los textos públicos y presentar una propuesta concreta de qué se borra y conserva; no se presume un plazo legal. Este punto solo bloquea el borrado definitivo/textos finales, no el resto del trabajo. La aceptación Android se registrará como emulador con servicios Google, sin atribuir una prueba física no realizada.

El login Apple/Google en navegador es una extensión opcional: el objetivo pedido es ofrecer ambos proveedores en iOS y Android. No se confunde servir la web con tener login social web implementado.

## Operación y vuelta atrás

Las imágenes finales se identifican por commit y config digest; se verifican con versión servida. El puerto API permanece privado. Logs tienen rotación, no imprimen tokens ni documentos; se observa DB, entregas pendientes, fallos de proveedor y revocaciones.

Se prepara el conjunto Docker en paralelo al servicio actual. El corte solo sigue a validación del conjunto y backup fresco. Se conserva el servicio y proxy anterior para vuelta atrás. Evitar escrituras concurrentes de workers o activar callbacks duplicados. Las migraciones deben ser compatibles con el servicio anterior mientras exista la ventana de retorno; restaurar una copia antigua tras escrituras nuevas requiere evaluar pérdida de datos y no se automatiza como rollback.

La auditoría anterior conserva cuatro alertas altas en dependencias; se revisan exposición y parches compatibles antes de release. No se considera seguro el conjunto por una compilación o un healthcheck aislado.

## Seguimiento

El plan técnico es el registro versionado y el artifact editable es la vista de seguimiento. Cada bloque registra estado, commit/versiones, verificación y pendiente concreto; los estados son Pendiente, En curso, Verificado o Necesita respuesta. «Verificado» requiere la evidencia correspondiente, no una intención de ejecución.
