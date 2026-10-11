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


### Continuación autorizada y copias antes de la cuenta — 10/10/2026

El usuario reitera la autorización para continuar. La rama aislada incorpora app/main 7bfa689 (manual, mapas y corrección de teléfono del checkout), conservando ambos apéndices del glosario y las actas/capturas originales. La propuesta anónima mantiene su estado documental. NAV y manual reflejan la retirada publicada de demostración, con captura nueva separada; no se reescriben las referencias antiguas.

Validación actual: 160/160 pruebas frontend en 40 archivos, Node 24 y un worker. Se corrigió la sincronización de una prueba de nueva conversación: espera al compositor antes de afirmar que no quedan mensajes anteriores. Dos ejecuciones previas sufrieron tiempos de espera por carga; los casos afectados y la suite final pasan. Se comprobó de nuevo la versión pública be6806d de APP y Portal a las 21:05 UTC; capacidades móviles/push configuradas, sin atribuir entrega real.

Backup fresco del Portal a las 21:02:22 UTC, stack 75: SQL 188803 bytes SHA-256 936cde92077d6236a7bf94806e12a13ba671619ba9a5485be8fde4c6fbe1f16c; configuración/claves y uploads archivados, archivos 0600 y directorio 0700. Stack 77 restaura sin red: 44 usuarios, 94 expedientes, 14 documentos, diez migraciones y 19 tablas OK. Archivos recuperados coinciden byte a byte. Los comprobadores terminaron código 0; no se modificaron registros existentes ni proveedores. Evidencia artifacts/chat-activation-20261010/backup-proof.json y capturas privadas de comprobación.

LidIA PRO cfaf6a3 conserva contenedor healthy y resolución agente 122/proyecto 103. Copia persistente app-conversations-20261010T205106Z.json, 2306 bytes, SHA-256 22fe57c943d874643e63fddc3ada2a0b42b29997cfa4870c24f8df834a47254e, 0600. Su soporte estaba autorizado hasta 08/10; chat autenticado sigue desactivado. La copia Portal no se presenta como copia de la base SQL Server de LidIA. Cuenta de prueba y aceptación nativa siguen pendientes en este punto.


### Distribución iOS compilada — 10/10/2026

Archivo Xcode Release real completado para com.gestadia.app, versión 0.1.0/build 1, equipo X27NG7M487. Firma verificada con codesign --deep --strict; APNs production, Sign in with Apple Default y get-task-allow false. Perfil Gestadia App Store eff405f5-ac9f-4bda-8c39-2107a7970e8f, válido hasta 05/07/2027. Configuración empaquetada idéntica a la preparada, SHA-256 af67b8087d98e8ef340f5161333dc938341df0f5d3f3c366c1e0beaa7b7e9be3. Fuente APP 3a4a07c; el ajuste de firma nativa se aplica al target App Release exclusivamente. El intento con perfil global falló porque las dependencias Swift Package no admiten perfiles; se conserva su log y el segundo archive es correcto. Preflight 8/8. Evidencia privada .superpowers/releases/ios-3a4a07c/signature-proof.json. Exportación IPA y compilación Android en curso. No se ha subido a TestFlight/Play ni se han acreditado OAuth, push o chat en dispositivos.

Portainer en Codex muestra sesión caducada; el usuario debe restablecerla. La cuenta sistemas@enmarkados.com aún no se ha creado. No se ha enviado correo ni cambiado contraseñas.


### IPA, AAB y cuenta de prueba verificados — 10/10/2026

IPA exportado y firma nuevamente verificada, 2494039 bytes, SHA-256 b6abc3280c23ae0b86adac8ba45ec9b81580cb1e5acd1664ce35ab381c1087fa. AAB Release compilado correctamente en 3m49s, 5913787 bytes, SHA-256 0d49f1066eda44aa5d4b0c60327ffe2a57d5c9278cea94d778b06b50c0a7f0be. Firma JAR verificada y certificado SHA-256 10B1E61FC2C711A3527CB5DB75DDB6E9249D8107A26536CACC8D8BC40C09AA6B idéntico al certificado upload privado; configuración embebida idéntica a la preparada. Manifiesto de bundle com.gestadia.app, targetSdk 36, debuggable false y POST_NOTIFICATIONS presente. Se conservan los logs y pruebas en .superpowers/releases; ningún emulador se arrancó ni se subió ningún binario a tiendas. Chat sigue desactivado en estos candidatos de comprobación.

Tras restablecer el usuario la sesión de Portainer, stack temporal 78 crea sistemas@enmarkados.com a las 21:40:57 UTC. Contenedor 899571f06eb1a2a14f84ce921c493537cd9511c15c7ed94b589aedc9c6366569 termina código 0: 45 usuarios, 94 expedientes y 14 documentos. Cuenta sin contraseña, emailVerified false y accountVerifiedAt null; no se modifican usuarios existentes ni se contactan proveedores. Captura gestadia-cuenta-pruebas-creada-20261010.png y account-proof.json. El usuario debe completar el enlace de recuperación y la contraseña; la política de control del navegador exige su intervención para crear credenciales.

Corrección de proveedor de LidIA: la configuración efectiva muestra lidia.gestadia.com/lidia_gestadia_pro_db y el runtime contiene Pomelo.EntityFrameworkCore.MySql, MySqlConnector y MySqlBackupnet.MySqlConnector. La mención previa a SQL Server era incorrecta. La nueva copia de la base MySQL/MariaDB de LidIA sigue pendiente; no se ha activado el chat ni se han escrito conversaciones nuevas.


### Copia LidIA restaurada y cuenta activa — continuación 11/10/2026

Copia manual completa de LidIA PRO creada mediante el administrador: manual_20261010_214753.sql, 1289418987 bytes, SHA-256 dc73606edb927917a6d1c9da1758727420977b5dfb8296a2f771700f24fde4c9, permisos 0600. Restauración real en stack 79, contenedor b50bd06dcbabd3ab2d11df8679ce18040a7202a547eebd317b1cef98be3b3881: 196 tablas, 258 migraciones, mariadb-check OK y salida 0 a las 21:53:18 UTC del 10/10. Sin red ni puertos y origen montado sólo lectura; no se modificó la base de producción ni se eliminaron copias previas. No se acredita descarga local del SQL. Evidencia artifacts/chat-activation-20261010/lidia-backup-proof.json. Proveedor MySQL/MariaDB, corrigiendo explícitamente la referencia histórica a SQL Server.

El usuario completa personalmente la recuperación de sistemas@enmarkados.com. Lectura real de Prisma confirma emailVerified true, accountVerifiedAt presente, contraseña establecida, reset e invitación consumidos y acceso no revocado. No se imprime contraseña, hash, token ni ID. Cuenta lista para pruebas; no acredita login social ni conversación remota. Configuración S2S preparada en custodia privada: seis claves coinciden con las de LidIA mediante hash agregado; conversaciones aún sin activar. Soporte y comercial generales permanecen false; no se reutiliza la autorización de soporte caducada.

El usuario solicita y aprueba correos maquetados para recuperación, bienvenida tras contratación y avisos: logo oficial incrustado CID, cabecera grafito, acción roja, HTML y texto, contacto/Reply-To info@gestadia.com, remitente SMTP vigente y pie RGPD/LOPDGDD conforme a la política publicada. Antes de modificar se conserva copia privada de los archivos. Implementación y pruebas de plantilla/SMTP en curso; todavía no desplegada ni recepción en buzón acreditada.


Correos aprobados implementados: pruebas específicas 7/7, backend 215/215 con DB efímera y frontend 160/160 con un worker. MIME real generado sólo en memoria, sin correo a clientes; vista HTML revisada en navegador. Configuración chat preparada subida y extraída en gestadia-mobile-private con nombres nuevos, sin sobrescribir la configuración vigente; verificación de hashes y nueva copia Portal previa al corte preparadas. Chat y correos aún no desplegados.


### Copia fresca y backend de correo preparados — 11/10/2026

Antes de actualizar se crea y restaura la copia Portal email-chat-20261011: SQL 189074 bytes, SHA-256 06f4ac0aa20f4127800220a78fa7d3f0ecf8e7f606983154be268ebe01942ad1. Stack 80 completa preparación, SQL y archivos con código 0; stack 81 restaura sin red y comprueba 45 usuarios, 94 expedientes, 14 referencias y diez migraciones, mariadb-check OK. Configuración, claves y uploads coinciden byte a byte. No se modifica ni elimina información de producción. Prueba en artifacts/emails-20261011/backup-proof.json.

Imagen AMD64 gestadia-backend:ba384f1 construida, revisión ba384f18278d60222ef87ebc26844759505cea83. La plantilla y el logo existen en la imagen real, probados sin red ni SMTP. Archivo Docker 293960646 bytes, SHA-256 9740823a56c062bd93f3d03793b7c466f3c10b6f0f58aa7c7c904a5616955465; importación en Portainer en curso. El stack preparado cambia únicamente imagen backend y rutas de las dos configuraciones de chat; mantiene el almacén permanente y las imágenes frontend. Aún no acredita el corte ni un correo recibido.


### Correos publicados y chat activado — 11/10/2026

Importación Portainer comprobada: imagen AMD64 gestadia-backend:ba384f1, digest dec108b9ba16695b4c0c3a53a26a1babd6de71e69902ec7dcd31ed0d0273bc8f y revisión completa ba384f18278d60222ef87ebc26844759505cea83. Stack 73 actualizado a las 22:27 UTC del 10/10, backend db12a78800ef7334373670c81a444149008ddfcab1a007f230b37b76b1bcce58 y APP 76e32bbae5af047c533f5f3e446a7ab8822c5bbedb4a0960283709d62f95f9aa, los tres servicios healthy. Portal conserva imagen y contenedor anteriores.

El archivo JSON público nuevo tenía 0600, por lo que Nginx rechazó su lectura y APP devolvió temporalmente 502; corregido exclusivamente a 0644 en Plesk, manteniendo la carpeta 0700 y claves privadas 0600. APP recuperada. Comprobación real como 10019:1003: hash del entorno coincide, seis claves presentes, chat enabled, soporte/comercial generales false, plantilla y PNG presentes; 45 usuarios, 94 expedientes y 14 documentos. Web, Portal y APP HTTPS 200, capacidades 200 y chat 401 session_expired sin sesión: autenticación activa, todavía sin E2E conversacional. Evidencias runtime-proof.json y public-deploy-verification.json en artifacts/emails-20261011.

Tres correos revisados visualmente y maquetación publicada. Cero mensajes SMTP de prueba enviados; autorización de un único correo a sistemas@enmarkados.com y acceso humano a APP solicitados para completar recepción y conversación. Sigue pendiente login social y entrega push nativa, regeneración final de builds con chat y distribución/publicación en tiendas. No se borraron datos de producción.


El usuario autoriza expresamente un único correo de prueba a sistemas@enmarkados.com. Ejecutado sendEmail real con la plantilla de aviso y asunto «Gestadia · Comprobación del correo corporativo». El await de SMTP finaliza; la comprobación posterior falla al leer accepted de un retorno void. No se repite el envío y no se inventa un recibo SMTP. Recepción y aspecto en el buzón pendientes de confirmación; no se cambian credenciales ni se crea un trámite. La sesión APP aún no se observa en la pestaña controlada, incluso tras refrescar; se solicita localizar/completar el acceso que indica el usuario.


### Recuperación tras cierre del Mac y candidatos con chat — 11/10/2026

Verificados de nuevo Web/Portal/APP y salud backend HTTP 200; configuración pública conversationsEnabled true y API de conversación 401 session_expired sin sesión. El cierre local no requiere otro despliegue. Se conserva el único intento de correo autorizado, sin repetirlo; recepción pendiente de respuesta del usuario. La pestaña APP controlada sigue mostrando Iniciar sesión.

IPA App Store regenerado con chat, codesign strict válido, APNs production y Sign in with Apple Default, equipo X27NG7M487 y perfil Gestadia App Store. 2493958 bytes, SHA-256 f7f096162a65acfb94b6bd4481146b611541bc898bc31482592f32aecc7fe651. AAB Release firmado: 5913791 bytes, SHA-256 0db1623cb7619955b9a87de4e81a097594e159a1fcb3b583eddc4d795b76a585. Certificado upload coincide; paquete com.gestadia.app, targetSdk 36, debuggable false y POST_NOTIFICATIONS. Configuración empaquetada idéntica en ambos, SHA-256 c682f3ec1549b0f6097475ea9ef5b1c9192ea44889df4126c2379f422f70ffc9.

La compilación APK interrumpida se reanuda y completa con código 0. APK firmado comprobado mediante apksigner, 6381567 bytes, SHA-256 1960c61a0bef4c855552d9161be2e9d85fa027294e74a7bc31c2c9aef58a75f6; certificado y configuración con chat coinciden. Se conservan binarios y pruebas en .superpowers/releases/ios-chat-ba384f1 y android-chat-ba384f1. No se acredita instalación, login social, entrega push, TestFlight o subida Play. Tras el cierre, ADB no encuentra dispositivos e iOS no tiene simuladores arrancados; no se arrancan ambos a la vez. Device Hub devuelve una ventana no disponible.

Chrome recuperado mediante control nativo. App Store Connect exige iniciar sesión de nuevo. Google Play, cuenta Defensa Legal Consumidores, sólo lista LIA (com.dlc.lia) y muestra Crear aplicación deshabilitado con «Completa las verificaciones de la cuenta para crear aplicaciones nuevas». La identidad Android muestra datos de la organización, pero no identifica allí la verificación causante del bloqueo. Se conserva captura gestadia-play-creacion-bloqueada-20261011.png; no se modifica LIA ni datos de cuenta. Próximo paso: sesión de APP/Apple, resolución de verificación Play y pruebas nativas, seguidas de distribución interna.


### Correo corregido, conversación real y emulador Android — 11/10/2026

El usuario confirma recepción del único correo en Thunderbird: logo desplazado en ambos modos y botón visible solo en claro. Corrección e8f1a86: asset oficial existente sin margen vacío, logo alineado al contenido, botón centrado con fondo/color explícitos y estilos para oscuro. Siete pruebas específicas pasan. Tres EML finales y vistas locales claro/oscuro revisadas; no se repite SMTP. La comprobación final en Thunderbird queda solicitada mediante el EML local, sin atribuirla al navegador.

Antes del corte se crea email-dark-20261011 en custodia privada: SQL 195987 bytes, SHA-256 5c54db79f4304d30dde89f69a832e5f14dd78761943692e33a6d3eb4870dd521. Stack 82 termina código 0. Stack 83 restaura realmente sin red: 45 usuarios, 94 expedientes, 14 documentos, diez migraciones, 19 tablas OK. Configuración, claves y documentos coinciden byte a byte. Producción intacta durante esta restauración.

Imagen e8f1a86 construida en AMD64 a partir de la imagen anterior ya verificada porque Docker Hub agotó la espera; solo cambian plantilla y logo, sin dependencias ni migraciones. Archivo 293976551 bytes, SHA-256 2ac9d45ac23c9076b93113c4618cc600e07100d5bb05153e363efe8fb2a64175. Importación Portainer confirma digest 1dd049c3e0cccf44ff657eecf51cbcf3d8e9e30919c344cd46b922c55403b541 y revisión e8f1a8673e5ceea6a650560da1e6227d4bb0c557. Stack 73 sirve nuevo backend 07c21126867bd6865bfe95f376cfdef303b83776e9a332218dc66bff5bd81a2c, tres servicios healthy; mismos frontends, configuración de chat y bind documental. Hashes de plantilla y logo coinciden como usuario 10019:1003. El historial autenticado continúa accesible después del corte.

Localizada la sesión web real en otra pestaña del navegador Codex. Conversación 2fcd3174-983f-4ed5-aa8d-196826dc1317: dos turnos y dos respuestas remotas, opción No consumida, conversación listada y reabierta con historial y Atrás a Mensajes. Sin solicitud de expediente, contratación ni ampliación de soporte. Captura versionada docs/app/evidencias/2026-10-11-chat-real/chat-recuperado.png; manual/mapa actualizados. Esta aceptación es web; OAuth y push nativos siguen pendientes.

A petición del usuario, AVD dedicado Gestadia_QA_API_36 con 4096 MiB y cuatro núcleos; dispositivo confirma MemTotal 4014920 kB y cuatro CPU. iOS permanece apagado. APK Release firmado instalado realmente; bloqueado en pantalla inicial. El renderizado por software causó bloqueo de SystemUI; GPU host recuperó la interfaz de Android, pero el arranque de Gestadia sigue en investigación. Se prueba una compilación debug local solo para diagnóstico, separada de los candidatos de distribución. No se valida login, entrega push o publicación a partir del splash. Evidencia artifacts/android-qa-20261011 y artifacts/emails-alineacion-20261011.


### Arranque nativo comprobado — 11/10/2026

La entrada esperada por SecureStorageNative contenía una espera de nivel superior que bloqueaba su importación circular. El arranque se ejecuta ahora desde startApp después de terminar la evaluación del módulo; mantiene el orden configuración, sesión segura, teclado y retorno social. Si la preparación falla se muestra la recuperación existente (Recargar) y se retira el splash. Dos regresiones reproducen primero el bloqueo y el rechazo sin recuperación, y pasan tras el cambio. Suite frontend 162/162. Android debug abre Home real con 4 GB/cuatro núcleos; captura [home-debug.png](evidencias/2026-10-11-arranque-android/home-debug.png). Aún sin atribuir firma de distribución, login o push a esa captura.


### Candidatos corregidos y arranque Release — 11/10/2026

Android 3fa8bbb: AAB 5913834 bytes SHA-256 910851e84fa97c1932b8e40f0a877b87b4bb91d17b6405422fc04dbdd85e7159; APK 6381607 bytes SHA-256 ec343992183239bd07292c419a6ab68d155253a4df5a3f8577c50e7020959d43. Ambas firmas comprobadas, certificado upload idéntico, com.gestadia.app, targetSdk 36 y debuggable false. Configuración conectada con chat idéntica a la preparada. APK instalado en el emulador: hash del base.apk coincide y arranque frío termina correctamente; Home y acceso real observados. [Captura Release](evidencias/2026-10-11-arranque-android/home-release.png). Cuenta de sistemas escrita; entrada de contraseña pendiente de intervención humana. No se acredita OAuth ni recepción push.

iOS 3fa8bbb: archive y exportación correctos; IPA 2494016 bytes SHA-256 b7ca8bbcff773e7ff01cb1e201754ac543fee531a7476234b6a88ad2b0f8e61a. codesign --deep --strict válido, equipo X27NG7M487, APNs production, Apple Sign In, get-task-allow false, 0.1.0/build 1 y configuración con chat idéntica. No se arranca iOS mientras Android está activo. Nuevos candidatos en .superpowers/releases/android-boot-3fa8bbb y ios-boot-3fa8bbb; anteriores intactos. Distribución TestFlight/Play, login social y entrega real pendientes.

### Correo solicitado y acceso Android — 11/10/2026

El usuario solicita un nuevo correo corregido. Un único envío a sistemas@enmarkados.com con asunto «Gestadia · Correo corregido (logo y modo oscuro)» completa la llamada SMTP en backend e8f1a86. No cambia cuenta, contraseña ni expediente. Recepción y representación Thunderbird de este nuevo envío pendientes de observación del destinatario; el correo anterior sí fue recibido. Comprobante: `artifacts/emails-alineacion-20261011/correo-corregido-enviado.png`.

APK Release 3fa8bbb: después del acceso completado por el usuario, Mi cuenta y Mi Perfil muestran Sistemas Enmarkados / sistemas@enmarkados.com. Sesión nativa por email/contraseña comprobada; OAuth independiente pendiente. Permiso push no concedido en ese instante. Se corrigen botones Apple/Google con recursos oficiales y altura táctil 48 px; su revisión nativa sobre el nuevo candidato sigue pendiente.


### Aceptación correo, botones y FCM Android — 11/10/2026

El usuario confirma recepción del correo corregido y logo/botón correctos tanto en claro como oscuro de Thunderbird. Android Release 0bbda4e conserva la sesión real tras actualizar sin borrar datos, muestra ambos proveedores con marca oficial y activa la inscripción FCM. Aviso de prueba sin email, cuenta sistemas únicamente: notificación 73ecce5a-786a-4773-8315-a76ff17487b9, visible en el panel Android; al pulsarla vuelve a Mi Perfil con la sesión correcta. Se observa el canal genérico de Firebase: se prepara la creación de gestadia_updates antes del registro/resume, sin invocar canales Android en iOS. Regresión roja por ausencia del canal, cuatro pruebas verdes después de la corrección. La segunda aceptación del canal y la revisión visual iOS siguen pendientes. OAuth y tiendas mantienen sus pruebas independientes.
