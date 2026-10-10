# Estado APP Portal Docker y tiendas

Actualizado: 10/10/2026. [Documento maestro](00-MAESTRO-APP-PORTAL-DOCKER.md) · [Artifact editable](https://chatgpt.com/space/page_2a257ea775a08191acdfa746f4c9098e).

## Inventario anterior al corte (histórico)

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
| Inventario | Verificado | Copias restauradas, inventario y corte del 10/10 acreditados |
| Integración Git | Verificado localmente | Merge 08d2bbc, builds APP y Portal |
| Identidad y push común | Verificado localmente | 204 backend + 165 frontend; proveedores reales pendientes |
| Docker APP/web/Portal/backend | Desplegado | gestadia-common ID 73; tres servicios saludables; frontends sin demo be6806d publicados |
| Datos y LidIA | En curso | Bind documental persistente verificado; 14 referencias anteriores conservadas; LidIA real pendiente |
| Privacidad/baja | Verificado localmente | Textos conectados y procesador de baja probados; operaciones de producción y proveedores reales pendientes |
| Despliegue | Desplegado; aceptación en curso | Migraciones y proxies activos; login, chat y push reales pendientes |
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

## Dependencias y ensayo de migración

Auditoría actualizada: 0 avisos reportados tanto en backend como en frontend (audit-backend-final.json y audit-frontend-final.json); no se atribuye ausencia universal de vulnerabilidades a ese resultado. Nodemailer 10.1.0, AJV 8.20.0, deepmerge-ts 8.0.0 para Prisma 6; React Router 7.18.4, Vite 7.3.7, plugin React 5.2.0, Vitest 4.1.11 y transitivas corregidas. Override UUID 11.1.1 solo para xcode de Capacitor; sync/archive nativos pendientes de verificación en Task 8.

Tras actualización, 208 backend y 168 frontend pasan, cero omitidas; builds APP y web correctos. Evidencia dependencias-final-green.log y dependencias-portal-build.log. Se conservan avisos jsdom de navegación como limitación del entorno; no son aceptación nativa.

Copia privada previa restaurada en MariaDB 11.4.12 efímera local y todas las diez migraciones aplicadas. Ocho tablas originales conservan exactamente sus valores previos (digest por todas las columnas originales), incluidos 94 expedientes y 14 documentos. Script scripts/verify-portal-migration.mjs; evidencia restauracion-migraciones-integradas.log. No se arrancó backend ni proveedores y producción permanece intacta. Se sigue necesitando backup fresco de DB/documentos/config/proxy inmediatamente antes del corte.

### Importación final y propietario del servidor

Tres imágenes b42ce6a importadas en Portainer local, linux/amd64 y revisión completa b42ce6ac7a5303a7afd1a31326d47af41086ebc9. Config digest comprobado contra el archivo exportado: APP 9ec960f76feffcf5a9e907ebc921abd2aa5e62aa896ab6601e351c4e5955a69b; web/Portal 97eb40cdaf26f2b17c3fc5179e46ebe3da71f72b440331a74db7b6ee981370c3; backend 2827808a390a4ca1b543d16e45e7da196fd122d4a5d42590ee3275c594077821. Archivo exportado SHA-256 0ca0949b08b5d075a2fedb6154cd43505067304629f7f9925b9616a137cfc58c. Prueba final common-release-stack.log: 7/7 y persistencia tras reinicio.

Metadatos públicos del host verifican propietario gestadia.com_vx391aaj8xf UID 10019, GID 1003; grupo psacln 1003. El stack gestadia-host-metadata terminó con código 0 y se retiró, confirmación visible «Stack successfully removed». No montó documentos, secretos ni socket Docker.

Configuración común preparada solo en carpeta local privada: DB/JWT originales preservados, 21 ajustes de Stripe/Zoho/SMTP/LidIA intactos y tres archivos privados de proveedores. Conversaciones siguen pendientes del contrato servidor real. No se han transmitido claves ni iniciado el backend de producción. Carpeta gestadia-mobile-private creada en el host fuera de los document roots; permisos 0700 observados.

Incidencia durante la preparación del proxy: una pulsación Intro posterior al clic de apertura envió el formulario recién cargado con el contenedor predeterminado v360-api-clinica-fixius, puerto 7004. Se retiró inmediatamente la regla 81; Plesk confirmó «The proxy rules were removed» y «No items». Comprobación externa posterior: / y /portal/acceso 200 con assets originales index-BtjCKzHS.js/index-B6ugJuZR.css; /api/health 200 con Stripe/Zoho/correo activos. No se declara ausencia de solicitudes durante ese intervalo sin revisión de logs. No volver a activar por Intro un control de navegación con carga asíncrona; esperar el estado visible y pulsar el botón concreto.

### Copias de preparación y documentos anteriores

Copia DB fresca 2026-10-10 09:20 UTC: 170019 bytes, ocho tablas, SHA-256 5926c749441b9de9ad42b73c9641ba5d9a333625538de0aa0d42378530904415; single-transaction y dump terminado. Restauración local y diez migraciones: PASS, sin cambios en ningún valor original. Evidencia restauracion-migraciones-copia-fresca.log. Archivo web/Portal 97614168 bytes, SHA-256 962f84edc3551aee371659c64164605b774d9cfadf67b70f79a1cfd53d209272, 7131 entradas y CRC completo PASS. Contiene backend/frontend/shared y backend/.env; servidor y copia local protegidos con 0600, directorio padre 0700.

Copia de la entrada APP anterior: app-before-common-b42ce6a-20261010.zip, 1148 bytes, dos entradas (carpeta e index.html), CRC PASS, SHA-256 8065037251f09f8e2ab85a1bf42e52a72d23289560a68a6ad085dbd6870dbd0b; guardada fuera de webroot y descargada a custodia local 0600. El archivo backend/.env del backup recién obtenido coincide exactamente, tras parseo dotenv, con la fuente privada usada para preparar la nueva configuración. Nginx/Apache de APP también tienen directivas adicionales vacías, proxy/smart-static activos, archivos directos/caché inactivos y límite 128 MB.

Hallazgo anterior al cambio: backend/uploads original está vacío en Plesk y también en la copia. La base conserva 14 documentos con nombres relativos de archivo JPG; no hay sus bytes en el backup web/Portal. No se movieron ni borraron documentos originales. Se solicitó aclarar si son pruebas o hay otra copia; la recuperación/aceptación de documentos anteriores no está cerrada. La prueba del stack acredita persistencia de documentos ficticios nuevos, no la disponibilidad de estos 14.

Preflight local de las dos plataformas válido contra configuración común pública: iOS equipo configurado; Android keystore no debug, huella del certificado comprobada y Firebase del paquete coincidente. No equivale a firma de un IPA/AAB ni pruebas con proveedores/dispositivos. Formulario gestadia-common listo, sin despliegue; transferencia de claves y acceso/público pendientes de la confirmación concreta emitida.

Portainer confirma que no hay conjunto APP/Portal existente bajo Gestadia: el filtro de stacks muestra solo LidIA DEV y PRO. Se preparará un stack nuevo sin modificar los conjuntos LidIA ni LIA. El contrato APP conversacional existe en el worktree dedicado de LidIA, pero no está en el HEAD local dev/IA/main inspeccionado; su disponibilidad en el runtime real continúa pendiente.

### Confirmaciones y persistencia — 10/10/2026, continuación

El usuario confirma explícitamente transferencia al servidor h.egdlcvmt.com de configuración Portal y claves Apple/APNs/Firebase, acceso del nuevo backend a DB/documentos y activación Docker/Plesk tras verificar copias. LidIA es requisito de la primera versión. Exige backup antes de cualquier cambio o borrado en Gestadia. No se repite la confirmación ya recibida para ese mismo alcance.

El usuario cree que los 14 JPG eran pruebas; esto no autoriza borrar sus referencias. Se conservan. Portainer muestra LIA con volumen lia_app_lia-speech-audio en /data/lia-speech-audio y LidIA Gestadia PRO con binds /var/lib/lidia-stacks/gestadia-pro/App_Data y /Logs. Gestadia mantiene su almacén actual del host mediante bind, con create_host_path:false: no sustituirlo por un volumen vacío ni guardar documentos en la capa del contenedor. Sigue pendiente comprobar montaje real y recreación con documento autorizado.

Restauración de archivos en custodia local aislada: 6.268 archivos y siete enlaces internos del Portal, más index anterior APP, bytes/hash comprobados después de escribir; sin ejecutar código ni iniciar proveedores. Evidencia backup-files-restoration.json. Nueva DB 09:54 UTC: 170019 bytes, ocho tablas, SHA-256 d35563c8f26a25d850da649ea9ce072b80eebafab2d830f93fccdb89b2d00f6e; restauración en curso. Se mantiene la exigencia de copia final consistente al detener escritores antes del corte.

### Corte Docker aplicado — 10/10/2026

Tras autorización concreta y copias restauradas, se transfirieron backend.env, configuración pública y tres archivos Apple/APNs/FCM a gestadia-mobile-private fuera de webroot. Comprobación real gestadia-deploy-check: cinco hashes coinciden, archivos privados 0600, directorio secrets 0700, público 0644, propietario 10019:1003, SELECT 1 correcto. El archivo técnico ficticio del almacén permanece igual después de RECREAR el contenedor (IDs distintos); no se borraron datos originales. El comprobador temporal se retiró.

Plesk confirmó Node.js deshabilitado en gestadia.com. Antes de migrar, cero otras conexiones visibles de la cuenta de DB a gestadia_portal_db. Copia final 10:09:59 UTC con Node detenido: 170019 bytes, SHA-256 f5e4ed3c311982faacb8e1fedb803562e8d01007379defeb33fb551738fb37d0. Restauración aislada y diez migraciones PASS, todos los valores originales conservados; log restauracion-migraciones-copia-corte.log. Luego gestadia-migration terminó código 0 y Prisma confirmó todas aplicadas en producción. Recuento real posterior: 44 usuarios, 94 expedientes, 14 documentos y diez migraciones completadas. No se purgaron registros.

Primer arranque común encontró agotamiento de subredes Docker. Se retiró únicamente el stack temporal de migración, ya finalizado, y su red; no se retiraron redes/stacks ajenos. Segundo arranque correcto: gestadia-common ID 73, tres contenedores healthy. Proxies Plesk creados: gestadia.com → gestadia-common-gestadia-portal-web-1, 8080→8092; app.gestadia.com → gestadia-common-gestadia-app-1, 8080→8091. Backend sin puerto público. Node anterior se conserva detenido, con código/configuración y copias para retorno.

Verificación externa real: / y /portal/acceso HTTPS 200; Portal build-info revisión completa b42ce6ac7a5303a7afd1a31326d47af41086ebc9; assets index-DAeMbK8x.js/index-C558a5wG.css 200 y MIME correcto; /api/health mantiene Stripe/Zoho/email activos. APP raíz/build-info/config/capacidades/baja 200 con la misma revisión, demoOnly/demoEnabled false y push configurado. APP /api/health y checkout 404 por límites del frontend; /api/app/v1/conversations 503 porque su activación sigue pendiente. Ver public-cut-verification.json. Esto no acredita login social ni entrega push nativa.

LidIA real devuelve 401 de contrato APP sin firma. Lectura firmada con las claves de la prueba anterior devuelve 403 capability_denied, sin imprimir ni extraer historia: no acredita acceso vigente. La autoridad de aquella cuenta expiró el 08/10. Gestadia APP es el producto; LidIA es únicamente su servicio conversacional. Chat real es obligatorio antes de la primera publicación en tiendas.

Navegador observa el acceso y registro de APP conectado; el registro aún presenta «Crear cuenta de ejemplo». Se investiga antes de aceptación/publicación: no se ha creado una cuenta real de sistemas@enmarkados.com ni se han introducido contraseñas. No se confunde la UI de ejemplo con registro real.

### Retirada de demostración — 10/10/2026

El usuario solicita retirar todo modo demo y cuentas de ejemplo de Gestadia APP. Se conserva copia privada de la fuente antes del cambio. La APP mantiene sólo visitante o sesión real, acceso por API, perfil, documentos, notificaciones y textos legales conectados; se retiran simulaciones locales, gestores y avisos ficticios. No se borran datos de producción. Configuración antigua no puede reactivar simulaciones. Suite frontend 154/154 comprobada; nuevas imágenes y comprobación pública pendientes. LidIA es el servicio de chat de Gestadia APP y su activación real sigue pendiente antes de tiendas.

La revisión independiente detectó la plantilla APP anterior con proxy global tras retirar el bloqueo demo; se corrigió a allowlist APP, verificación TLS y /lidia bloqueado. Comprobación real en contenedor local de la plantilla predeterminada: checkout, leads, Zoho, webhooks y archivos directos 404; /lidia 503. Configuración Docker 7/7. Comprobaciones UI de baja real (confirmar/cancelar/error) y FormData documental superadas sin usar datos reales.

Validación final de la retirada: suite frontend completa 157/157 en 40 archivos, Node 24.19.0, un worker y margen de prueba de 15 s por carga del equipo; no se debilitan las aserciones. Preflight móvil 8/8, configuración Docker 7/7 y aislamiento real del proxy predeterminado superados. Revisión independiente APTO. Actualización de imágenes AMD64 en curso; aceptación pública posterior pendiente.

### Frontends sin demostración publicados — 10/10/2026 11:03 UTC

Gestadia APP y web/Portal sirven be6806d64ea3eea1999d01a3db81f9694ff977f1, importadas como linux/amd64 y comprobadas contra los dos digests del archivo exportado. Archivo gestadia-frontends-be6806d.tar.gz: 27315704 bytes, SHA-256 cbdf1daa9f0aef56847e6099cb9ca6a046844eb1a27e1fb6f0248708f3466e3a. APP index-CYgHPwfj.js, Portal index-Co99xfGI.js. Configuración pública sin campos demo; registro y acceso reales observados en navegador. Stack 73: los tres servicios healthy; backend b42ce6a conserva el mismo contenedor y almacén. Proxies existentes siguen sirviendo ambas superficies después de recrear frontends.

Verificación pública de raíz, acceso, registro, privacidad y baja: 200. APP mantiene checkout/leads/Zoho/webhooks/archivos directos 404; capacidades móviles y push configurados. 157/157 frontend y 7/7 configuración de la imagen AMD64 definitiva. Evidencia: artifacts/portainer-common-be6806d/public-no-demo-verification.json e image-manifest.json; captura gestadia-registro-sin-demo-20261010.png. Copia de fuente y stack previo conservada. No se crearon ni borraron cuentas de producción. LidIA real, cuenta autorizada, firma/distribución y pruebas de proveedores/dispositivos continúan pendientes.
