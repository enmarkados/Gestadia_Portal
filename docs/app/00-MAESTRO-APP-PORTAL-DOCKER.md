# Documento maestro de Gestadia APP Portal Docker y tiendas

Fecha: 10/10/2026. Responsable de ejecución: Codex en este chat. Responsable de decisiones de alcance, cuentas y aceptación: Gonzalo. Criterio de baja confirmado por Gonzalo; redacción de textos encargada a Codex.

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

Decisiones recibidas el 10/10: web completa y Portal en Docker; cuenta de prueba autorizada sistemas@enmarkados.com; iPhone del usuario y simulador iOS, Android en emulador. Nunca ejecutar simultáneamente los dos emuladores. Criterio de baja recibido: cerrar acceso, retirar Apple/Google y push, eliminar datos de cuenta innecesarios y conservar expedientes/documentos/justificantes solo cuando corresponda, explicando el resultado. Textos autorizados a Codex; no se presume un plazo legal. La aceptación Android se registrará como emulador con servicios Google, sin atribuir una prueba física no realizada.

El login Apple/Google en navegador es una extensión opcional: el objetivo pedido es ofrecer ambos proveedores en iOS y Android. No se confunde servir la web con tener login social web implementado.

## Operación y vuelta atrás

Las imágenes finales se identifican por commit y config digest; se verifican con versión servida. El puerto API permanece privado. Logs tienen rotación, no imprimen tokens ni documentos; se observa DB, entregas pendientes, fallos de proveedor y revocaciones.

Se prepara el conjunto Docker en paralelo al servicio actual. El corte solo sigue a validación del conjunto y backup fresco. Se conserva el servicio y proxy anterior para vuelta atrás. Evitar escrituras concurrentes de workers o activar callbacks duplicados. Las migraciones deben ser compatibles con el servicio anterior mientras exista la ventana de retorno; restaurar una copia antigua tras escrituras nuevas requiere evaluar pérdida de datos y no se automatiza como rollback.

La revisión final b42ce6a actualizó las dependencias compatibles: las auditorías del backend y frontend no informan vulnerabilidades conocidas. Suites 208 backend/168 frontend y builds APP/web pasan; el conjunto AMD64 supera 7/7 comprobaciones y reinicio persistente. Esto no sustituye la aceptación con proveedores y dispositivos reales.

## Avance preparado del 10/10/2026

Las tres imágenes finales b42ce6a están importadas y verificadas en Portainer. El formulario gestadia-common conserva los puertos loopback y el backend privado, con UID/GID real 10019:1003. La carpeta privada del servidor tiene permiso 0700; la configuración local conserva DB/JWT y 21 ajustes de negocio. Se requiere la confirmación concreta al transferir claves y dar acceso al nuevo backend.

Copia fresca DB restaurada y diez migraciones aplicadas sin alterar valores originales; archivo web/Portal de 93.1 MB descargado a custodia privada y verificado por CRC completo. La carpeta uploads del servicio anterior ya está vacía, aunque la DB contiene 14 referencias JPG: aclaración/recuperación pendiente. Firma de entrada y configuración iOS/Android superan preflight; quedan binarios, distribución, login/push reales, LidIA y publicación.

## Seguimiento

El plan técnico es el registro versionado y el artifact editable es la vista de seguimiento. Cada bloque registra estado, commit/versiones, verificación y pendiente concreto; los estados son Pendiente, En curso, Verificado o Necesita respuesta. «Verificado» requiere la evidencia correspondiente, no una intención de ejecución.

## Privacidad y baja

Criterio confirmado y redacción autorizada a Codex. [Textos y alcance operativo](../legal/PRIVACIDAD-Y-BAJA-APP-PORTAL.md). Se publicarán conforme a las operaciones comprobadas; retirada de acceso y eliminación efectiva son hitos distintos.

### Confirmaciones vigentes de ejecución

El usuario exige copia recuperable antes de cualquier cambio o borrado en Gestadia, confirma la transferencia de configuración y claves al servidor h.egdlcvmt.com, acceso del nuevo backend y activación mediante Plesk tras validar las copias. LidIA debe funcionar desde la primera versión en tiendas. Se conservan las 14 referencias documentales; el usuario cree que eran pruebas y pide almacenamiento permanente siguiendo los otros stacks. La restauración de archivos ya verificó 6.268 archivos y siete enlaces internos del Portal y la entrada APP anterior. El almacén documental del host se conserva como bind persistente; montaje real y recreación todavía requieren aceptación.

### Despliegue real vigente

Gestadia APP, web/Portal y backend común están desplegados en gestadia-common ID 73 y healthy; Plesk publica ambos dominios con revisión b42ce6a acreditada. Copia final con Node detenido restaurada antes de aplicar las diez migraciones; 44 usuarios, 94 expedientes y 14 referencias documentales conservados. Configuración privada/hash/permisos y persistencia después de recrear comprobados en servidor. Quedan chat LidIA, acceso/registro real, login social, push nativo, firma/distribución y tiendas. Ver el estado para la incidencia de subredes, pruebas y límites; el registro de APP aún muestra recorrido de ejemplo y requiere resolución antes de publicar.

### Retirada de demostración — 10/10/2026

El usuario solicita retirar todo modo demo y cuentas de ejemplo de Gestadia APP. Se conserva copia privada de la fuente antes del cambio. La APP mantiene sólo visitante o sesión real, acceso por API, perfil, documentos, notificaciones y textos legales conectados; se retiran simulaciones locales, gestores y avisos ficticios. No se borran datos de producción. Configuración antigua no puede reactivar simulaciones. Suite frontend 154/154 comprobada; nuevas imágenes y comprobación pública pendientes. LidIA es el servicio de chat de Gestadia APP y su activación real sigue pendiente antes de tiendas.

La revisión independiente detectó la plantilla APP anterior con proxy global tras retirar el bloqueo demo; se corrigió a allowlist APP, verificación TLS y /lidia bloqueado. Comprobación real en contenedor local de la plantilla predeterminada: checkout, leads, Zoho, webhooks y archivos directos 404; /lidia 503. Configuración Docker 7/7. Comprobaciones UI de baja real (confirmar/cancelar/error) y FormData documental superadas sin usar datos reales.

Validación final de la retirada: suite frontend completa 157/157 en 40 archivos, Node 24.19.0, un worker y margen de prueba de 15 s por carga del equipo; no se debilitan las aserciones. Preflight móvil 8/8, configuración Docker 7/7 y aislamiento real del proxy predeterminado superados. Revisión independiente APTO. Actualización de imágenes AMD64 en curso; aceptación pública posterior pendiente.

### Frontends sin demostración publicados — 10/10/2026 11:03 UTC

Gestadia APP y web/Portal sirven be6806d64ea3eea1999d01a3db81f9694ff977f1, importadas como linux/amd64 y comprobadas contra los dos digests del archivo exportado. Archivo gestadia-frontends-be6806d.tar.gz: 27315704 bytes, SHA-256 cbdf1daa9f0aef56847e6099cb9ca6a046844eb1a27e1fb6f0248708f3466e3a. APP index-CYgHPwfj.js, Portal index-Co99xfGI.js. Configuración pública sin campos demo; registro y acceso reales observados en navegador. Stack 73: los tres servicios healthy; backend b42ce6a conserva el mismo contenedor y almacén. Proxies existentes siguen sirviendo ambas superficies después de recrear frontends.

Verificación pública de raíz, acceso, registro, privacidad y baja: 200. APP mantiene checkout/leads/Zoho/webhooks/archivos directos 404; capacidades móviles y push configurados. 157/157 frontend y 7/7 configuración de la imagen AMD64 definitiva. Evidencia: artifacts/portainer-common-be6806d/public-no-demo-verification.json e image-manifest.json; captura gestadia-registro-sin-demo-20261010.png. Copia de fuente y stack previo conservada. No se crearon ni borraron cuentas de producción. LidIA real, cuenta autorizada, firma/distribución y pruebas de proveedores/dispositivos continúan pendientes.


### Continuación autorizada y copias antes de la cuenta — 10/10/2026

El usuario reitera la autorización para continuar. La rama aislada incorpora app/main 7bfa689 (manual, mapas y corrección de teléfono del checkout), conservando ambos apéndices del glosario y las actas/capturas originales. La propuesta anónima mantiene su estado documental. NAV y manual reflejan la retirada publicada de demostración, con captura nueva separada; no se reescriben las referencias antiguas.

Validación actual: 160/160 pruebas frontend en 40 archivos, Node 24 y un worker. Se corrigió la sincronización de una prueba de nueva conversación: espera al compositor antes de afirmar que no quedan mensajes anteriores. Dos ejecuciones previas sufrieron tiempos de espera por carga; los casos afectados y la suite final pasan. Se comprobó de nuevo la versión pública be6806d de APP y Portal a las 21:05 UTC; capacidades móviles/push configuradas, sin atribuir entrega real.

Backup fresco del Portal a las 21:02:22 UTC, stack 75: SQL 188803 bytes SHA-256 936cde92077d6236a7bf94806e12a13ba671619ba9a5485be8fde4c6fbe1f16c; configuración/claves y uploads archivados, archivos 0600 y directorio 0700. Stack 77 restaura sin red: 44 usuarios, 94 expedientes, 14 documentos, diez migraciones y 19 tablas OK. Archivos recuperados coinciden byte a byte. Los comprobadores terminaron código 0; no se modificaron registros existentes ni proveedores. Evidencia artifacts/chat-activation-20261010/backup-proof.json y capturas privadas de comprobación.

LidIA PRO cfaf6a3 conserva contenedor healthy y resolución agente 122/proyecto 103. Copia persistente app-conversations-20261010T205106Z.json, 2306 bytes, SHA-256 22fe57c943d874643e63fddc3ada2a0b42b29997cfa4870c24f8df834a47254e, 0600. Su soporte estaba autorizado hasta 08/10; chat autenticado sigue desactivado. La copia Portal no se presenta como copia de la base SQL Server de LidIA. Cuenta de prueba y aceptación nativa siguen pendientes en este punto.


### Distribución y cuenta autorizada — 10/10/2026

IPA App Store y AAB Release compilados y firmados; firma efectiva, perfiles, paquete com.gestadia.app y configuración embebida comprobados. Firma iOS se limita al target App Release mediante GESTADIA_IOS_PROFILE_SPECIFIER para no aplicar el perfil a Swift Package. Preflight 8/8. Sistemas@enmarkados.com creada después de copia Portal restaurada: 45 usuarios/94 expedientes/14 documentos, sin contraseña ni verificación inventada. Activación de cuenta por el usuario pendiente. Runtime LidIA confirmado MySQL/MariaDB; corregida la referencia anterior a SQL Server. Nueva copia de esa base y chat real aún pendientes. No se ha distribuido a TestFlight/Play ni acreditado login/push en dispositivos. Detalle y hashes en ESTADO-APP-PORTAL-DOCKER.md.


### Copia LidIA restaurada y cuenta activa — continuación 11/10/2026

Copia manual completa de LidIA PRO creada mediante el administrador: manual_20261010_214753.sql, 1289418987 bytes, SHA-256 dc73606edb927917a6d1c9da1758727420977b5dfb8296a2f771700f24fde4c9, permisos 0600. Restauración real en stack 79, contenedor b50bd06dcbabd3ab2d11df8679ce18040a7202a547eebd317b1cef98be3b3881: 196 tablas, 258 migraciones, mariadb-check OK y salida 0 a las 21:53:18 UTC del 10/10. Sin red ni puertos y origen montado sólo lectura; no se modificó la base de producción ni se eliminaron copias previas. No se acredita descarga local del SQL. Evidencia artifacts/chat-activation-20261010/lidia-backup-proof.json. Proveedor MySQL/MariaDB, corrigiendo explícitamente la referencia histórica a SQL Server.

El usuario completa personalmente la recuperación de sistemas@enmarkados.com. Lectura real de Prisma confirma emailVerified true, accountVerifiedAt presente, contraseña establecida, reset e invitación consumidos y acceso no revocado. No se imprime contraseña, hash, token ni ID. Cuenta lista para pruebas; no acredita login social ni conversación remota. Configuración S2S preparada en custodia privada: seis claves coinciden con las de LidIA mediante hash agregado; conversaciones aún sin activar. Soporte y comercial generales permanecen false; no se reutiliza la autorización de soporte caducada.

El usuario solicita y aprueba correos maquetados para recuperación, bienvenida tras contratación y avisos: logo oficial incrustado CID, cabecera grafito, acción roja, HTML y texto, contacto/Reply-To info@gestadia.com, remitente SMTP vigente y pie RGPD/LOPDGDD conforme a la política publicada. Antes de modificar se conserva copia privada de los archivos. Implementación y pruebas de plantilla/SMTP en curso; todavía no desplegada ni recepción en buzón acreditada.


Correos: [diseño aprobado, texto legal y comprobaciones](../legal/CORREOS-TRANSACCIONALES.md). Backend 215/215; presentación y despliegue se acreditarán por separado.


Correos aprobados implementados: pruebas específicas 7/7, backend 215/215 con DB efímera y frontend 160/160 con un worker. MIME real generado sólo en memoria, sin correo a clientes; vista HTML revisada en navegador. Configuración chat preparada subida y extraída en gestadia-mobile-private con nombres nuevos, sin sobrescribir la configuración vigente; verificación de hashes y nueva copia Portal previa al corte preparadas. Chat y correos aún no desplegados.
