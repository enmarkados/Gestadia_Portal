# Ciclo nativo conectado del 12/10/2026

Petición humana: comprobar LidIA y el gestor `integraciones@vozenter.com` en iOS y Android; **después** instalar la última versión en iGonchu. No se acredita un ciclo conectado con fixtures ni con la prueba de otra cuenta.

[Plan de aceptación y reparto para preparar DEV](PLAN-ACEPTACION.md), confirmado como objetivo humano al retomar el12/10. Mantener separado el avance documental de los resultados realmente ejecutados.

## Fuente y entorno

- Fuente vigente para ambos paquetes (iOS0.1.0/build11; Android0.1.0/versionCode4): `344b0335ffb1e4a48677983fcba60b58e0b0c216`, Gestadia 0.1.0 (11), con el editor de nombre aceptado. La APP web servida `5febdf2` y el backend `0af593f` son referencias distintas.
- Rama propia de QA: `codex/app-prueba-real-ios-android-20261012`, worktree `app-motion-280`. Reutiliza la fuente del build 11 y conserva los documentos posteriores de app/main. Esta preparación local no publica ni activa canales.
- Backend Portal real en loopback3005 y MySQL durable exclusivo de QA. Copia previa y configuración privada bajo `~/.codex/private/gestadia-app/qa-native-20261012/`; no contiene un proveedor conversacional simulado.
- La autoridad antigua de sondeo/history caducó el12/10 a00:06UTC. V1/v2 se mantienen apagados hasta recibir configuración y autoridad verificables para nuestra prueba.
- La auditoría de los stacks24/25 confirma V1.705 en ambos y selecciona25 (`lidia-gestadia-dev`) por la presencia efectiva de119/proyecto102;24 corresponde aVozenter. El equipo fuente prepara sobre30be1692e el nuevo proyecto/clon APP y sus namespaces. No reutilizar la ventana de agenda PRO de otro chat. [Auditoría saneada](dev-audit-review.json).
- El usuario autoriza Zoho Production para esta QA propia mediante «Contra produccion»; se sustituye el requisito previo de Sandbox. El ámbito APP permanece DEV y el vínculo CRM todavía debe verificarse. [Decisión y secuencia](PLAN-ACEPTACION.md#decisión-vigente-sobre-zoho).

## Matriz de ejecución

| Comprobación | iOS | Android |
|---|---|---|
| Compilación de fuente build11 | PASS, Debug Simulator | PASS, assembleDebug |
| Arranque y pantalla | APP y entrada Login/Continuar sin registro observadas | APP y acceso observados en primer arranque |
| Login desde controles nativos | PASS: teclado de Device Hub, retorno a nueva consulta y sesión `ios` en BD | PASS: email y contraseña en controles, retorno solicitado |
| Conservar sesión al reiniciar y revocar al cerrar | PASS: terminate/relaunch conserva cuenta; logout pasa de1 a0 sesiones activas | PASS: force-stop/reinicio conserva cuenta; logout pasa de1 a0 sesiones activas |
| Nueva sesión real119 + respuesta del modelo | Pendiente de autoridad/namespace propios | Pendiente de autoridad/namespace propios |
| Recuperación, respuesta legible, historial y permisos | Pendiente | Pendiente |
| Chat con gestor Integraciones, envío en ambos sentidos | Pendiente de Contact–Deal–Owner QA verificables | Pendiente de Contact–Deal–Owner QA verificables |
| Recibos enviado/recibido/leído, cierre y reapertura permitida | Pendiente | Pendiente |
| Búsqueda, renombrado, fechas y navegación/Atrás | Pendiente de sesión conectada | Pendiente de sesión conectada |
| Login Apple/Google y push | No acreditados por build ni perfil | No acreditados por build |

El backend local sí pasó login nativo por API, perfil, expedientes, notificaciones y revocación de la sesión de preflight. Eso no acredita login mediante el teclado del emulador.

## Comprobación Android observada

El APK Android es0.1.0/versionCode4 compilado desde la fuente344b033 del build iOS11; ambos números de distribución son independientes. Los nombres de captura `android-build11-*` identifican esa fuente iOS, no un versionCodeAndroid11.

Con4096MB/cuatro núcleos, GPUhost y sin ventana, el AVD arrancó en21,5s. El diálogo de informes del fallo anterior impedía boot: `-crash-report-mode never -no-metrics` evita enviar informes a Google y desbloquea el arranque. Captura y diagnóstico locales permanecen disponibles.

Email QA comprobado contra el fixture y contraseña enmascarada de32caracteres; acceso por controles, retorno a nueva consulta y persistencia tras `am force-stop`/reinicio. El menú muestra la cuenta recuperada. Logout devuelve a visitante y revoca la única sesión Android en BD:1→0. [Resultado](android-sesion.json), [sesión recuperada](android-build11-sesion-recuperada.png).

La consulta nueva muestra un error recuperable porque el backend no tiene autoridad remota vigente: [captura](android-build11-consulta-pendiente.png). La [hoja del gestor](android-build11-gestor-llamada.png) pide nombre/teléfono para llamada, como corresponde a esta cuenta sin Contact–Deal–Owner; no se ha enviado solicitud ni inventado asignación. Mensajes mantiene su texto de gestores y muestra que el historial remoto no está disponible.

El primer intento de login falló al reiniciar el wrapper local sin cargar DATABASE_URL. Se corrigió el comando privado de arranque (`node --env-file=…`), sin modificar autenticación del producto ni permisos.

## Secuencia que debe ejecutarse

1. Acreditar DEV, claves S2S, namespace APP, principal QA, vigencias y operador Integraciones. Guardar referencias de sesión/operación propias, nunca claves.
2. Ejecutar iOS y Android por separado; AVD propio con4096MB/cuatro núcleos. No modificar AVDs de LIA. Sólo apagar temporalmente un simulador ajeno con autorización humana específica y restaurarlo al terminar.
3. LidIA: acceso → nueva consulta → mensaje/elección de botón con texto visible → respuesta del119 → abandonar/recuperar mismo chat → renombrar/buscar → permisos/cierre según contrato.
4. Gestor: relación QA Contact–Deal–Owner confirmada por servidor → abrir chat nombrado → entrada del operador Integraciones → mensajes en ambos sentidos → recibido/leído verificados en los dos extremos → historial tras cierre.
5. Verificar navegación, teclado, permisos y estados de error. La cita CRM real, OAuth y APNs se registran como pruebas diferentes.
6. Sólo tras superar ambos ciclos, instalar y abrir el paquete Release firmado en el iPhone, comprobar versión y endpointHTTPS. Confirmación de instalación y lanzamiento no sustituye los ciclos anteriores.

## Paquete físico preparado, todavía no instalado

Reexportación del archivo build11 como `release-testing`, TeamX27NG7M487: **EXPORT SUCCEEDED**. Perfil `iOS Team Ad Hoc Provisioning Profile: com.gestadia.app`, un dispositivo, incluye iGonchu; `get-task-allow=false`, APNsproduction. `codesign --verify --deep --strict` PASS. Configuración ReleaseHTTPS se conserva; no hereda loopback.

IPA SHA256: `7cab357b01d6e882d4ac30c8de76bc563bc5e134854387683870e51db2d3205f`.

La autorización humana de firma/registro/instalación ya existe; el pendiente es técnico y el orden solicitado, no otra aprobación de firma.

## Hallazgos de herramientas

- Xcode27/iOS26.5: el espejo serve-sim confirma taps en su log, pero la pantalla no cambia. XcodeBuildMCP2.7 reconoce Gestadia y su scroll; los botones WebView no aparecen como targets. No considerar un ACK de herramienta como pulsación recibida por la APP.
- Android API36/Playstore: primer arranque mostró bloqueo del sistema; SwiftShader informó QEMU2CPU0 sin respuesta. Se reintenta con renderizadorauto y recursos acordados, iOSQA apagado. No atribuir todavía el bloqueo a la APP.
- Android Debug permite HTTP sólo a127.0.0.1 mediante `gestadia_qa_network_security`; Release no incluye esa excepción. Reestablecer `adb reverse tcp:3005 tcp:3005` al reiniciar el AVD.

## Evidencia y recuperación

Los registros completos, manifiesto, binarios, perfil y credenciales quedan privados. Versionar sólo capturas y resultados saneados. Al retomar: comprobar procesos/puertos, manifiesto, vigencias, rama y fuente efectiva; no reconstruir permisos desde PIDs o claves antiguas. Revocar únicamente las sesiones/autoridades creadas por esta prueba y detener sólo sus helpers/dispositivos.

## Verificación de código del snapshot

`node scripts/test-app-conversations.mjs`: **313backend /207frontend /build APP PASS**, base efímera aislada. Repetición de frontend con la opción ya documentada `NODE_OPTIONS=--no-experimental-webstorage`:49archivos/207pruebas PASS. El primer npm test bajo Node25 falló por su global localStorage sin API de getItem/setItem; la comparación mínima con Node24 y el registro original del editor identifican la incompatibilidad del entorno. No se modifica el producto para ocultarla. [Resultado saneado](tests.json).

El segundo boot iOS se quedó en Waiting on System App y no permitió recuperar la interacción; se apagó sólo el simulador propio y se retiró su espejo. El simulador ajeno se conserva. La inspección WebKit experimental sólo se habilitó en la copia privada del simulador, nunca en el IPA físico.

## Preflight físico por cable

`devicectl device info apps --bundle-id com.gestadia.app`, con destino exclusivo a iGonchu, confirma **Gestadia0.1.0/bundleVersion11 ya instalada**. No se reinstaló ni lanzó la APP en esta prueba; la reexportación Ad Hoc preparada permanece sin instalar. La versión instalada no acredita el ciclo conectado ni el origen exacto del paquete. [Resultado saneado](iphone-version.json).

## Reanudación tras el cierre de la ventana PRO ajena

Se incorpora a la rama QA el backend `0af593f` ya entregado por el otro equipo, mediante `b2250c3`; igualdad exacta de `backend/` comprobada contra fuente. `frontend/app/` conserva igualdad con344b033 y los binarios móviles no cambian. Los conflictos documentales conservan las entradas anteriores y las fuentes recibidas.

Verificación nueva del conjunto: **351backend /207frontend /build APP PASS**, harness aislado. [Resultado](tests-backend0af.json). Se reinicia sólo el backend privado3005 con la configuración existente, S2S desactivado; sin migración nueva, despliegue o grants.

LidIA confirma que su ventana PRO quedó cerrada/restaurada, sin Call acreditada. Esto permite retomar la auditoría DEV, pero no entrega aún recursos nativos: stack24 continúaV1.705/30a5365. Se solicitan namespace/autoridad propios y Contact–Deal–Owner/routing de Integraciones verificables. El operador, la matriz de conexiones y el aislamiento deben acreditarse; no se construye un caso CRM ficticio para saltar el guard.

La ejecución iOS espera también resolver la convivencia con el simulador iPhone17 de la tarea LIA: se solicita permiso al usuario para cerrarlo temporalmente, conservando su dispositivo y datos. No se toca mientras la respuesta esté pendiente.

## Revisión posterior: acceso nativo iOS y restauración del simulador ajeno

El usuario autorizó expresamente cerrar temporalmente el simulador iPhone17 de la otra tarea. Se apagó sin borrar datos; el simulador propio completó el arranque en16s. Sólo el dispositivo propio estuvo activo durante esta prueba.

El teclado del helper serve-sim no introducía caracteres aunque devolvía éxito. Su diagnóstico identificó dos ventanas con el mismo nombre y la caída al modo HID anterior. En cambio, al enfocar Device Hub y capturar su teclado, la escritura sí llegó al campo: correo QA verificado y contraseña enmascarada. No se cambió la autenticación, no se reparó SpringBoard ni se modificó la configuración del teclado del usuario. XcodeBuildMCP sigue sin exponer botones del WebView; los ACK de esa herramienta no son la evidencia de acceso.

El acceso con la cuenta propia crea exactamente una sesión de plataforma `ios` en la BD local, vuelve a la nueva consulta solicitada y conserva la identidad tras `simctl terminate`/`launch`. El menú muestra la misma cuenta recuperada. Cerrar sesión devuelve a visitante y revoca esa sesión:0→1→0. [Resultado saneado](ios-sesion.json), [acceso](ios-build11-sesion-iniciada.png), [cuenta recuperada](ios-build11-sesion-recuperada.png) y [salida](ios-build11-sesion-cerrada.png).

El intento de iniciar la consulta muestra el [error recuperable](ios-build11-consulta-pendiente.png) esperado sin autoridad S2S vigente. La [hoja de llamada al gestor](ios-build11-gestor-llamada.png) pide nombre/teléfono a la cuenta sin expediente; no se envió el formulario ni se creó una relación CRM. Ninguna de estas capturas acredita un turno real del119, un chat de Integraciones o recibos leído/recibido.

Al terminar, se cerró el espejo y se apagó sólo el simulador propio. El iPhone17 original volvió a `Booted`, con boot terminado y datos conservados; no se lanzó ni modificó su app de LIA. Android QA permanece apagado. El iPhone físico sigue pendiente del orden humano: terminar los ciclos conectados y después instalar el Release preparado.

## Bloqueo confirmado por el equipo LidIA tras la prueba nativa

El equipo fuente confirma: DEV stack24 sirve todavíaV1.705; falta copiar/auditar BD, conexiones y operador, y desplegar el canal APP actual. No existe todavía namespace QA/S2S autorizado en el receptor ni vínculo Contacto–Trato–Owner acreditado. El login, el teléfono y el correo no sirven para deducir ese vínculo.

El equipo prepara su corrección728 de consentimiento/diagnóstico y después la copia/aislamiento DEV con entrega de metadatos y rutas privadas. El adapter CRM APP admite actualmente Production: si DEV sólo dispone de Sandbox, debe ajustarse y verificarse ese transporte antes de las pruebas CRM. La etiqueta DEV no demuestra aislamiento. Su ventana PRO permanece cerrada; nuestra configuración S2S sigue desactivada y la instalación física espera los dos ciclos reales.

Se repite la consulta física por cable al cerrar esta revisión: iGonchu conserva Gestadia0.1.0(11). [Nueva comprobación](iphone-version-recheck.json). No se instala ni abre la APP física durante este intento.

## Avance comunicado por LidIA: candidato V1.728

El equipo LidIA comunica que su paquete V1.728 superó199 pruebas y compiló con SDK8 en Debug/Release; integración PRO `8bab`. También comunica una restauración aislada del backup fresco:198 tablas, mapping1, timeline19, ChatLogs0 y salida0. Estos resultados pertenecen a su ejecución, no a la prueba nativa de este directorio.

Portal principal inició una única solicitud de redeploy del stack26 y está reconciliando el resultado. A la recepción de este mensaje todavía no estaban certificados el runtime728 ni una llamada real. Los permisos CRM continúan cerrados.

DEV24 sigue V1.705; namespace, aislamiento y relación CRM aún no están acreditados. Se conserva S2S QA desactivado y no se reutiliza la cuenta ni la conversación PRO. Este avance no modifica la matriz de aceptación ni habilita la instalación física pendiente de los dos ciclos conectados.

## Actualización de coordinación: elección DEV25 y Zoho Production

Los informes originales24/25 han sido recuperados y verificados por SHA.25 contiene119, proyecto102 y conexión4 Production;24 corresponde aVozenter y no contiene119. Ningún informe acredita activación APP ni ruta del operador. Se conserva el proyecto102 original con sus otros canales y se prepara un proyecto APP nuevo, una copia funcional de119 con id libre y namespaces/credenciales propios. La fuente propuesta es30be1692e; la referencia anterior de25 esdesarrollo/gestadia64ced36a y requiere backup/rollback antes de actualizar.

El usuario respondió «Contra produccion» al requisito de Sandbox. Esta decisión se ha transmitido y confirmado por ambos equipos; no implica reusar la identidad/conversación de la otra prueba humana. Portal no dispone aún de la entrega S2S nueva ni de Contact–Deal–Owner/mapping propios. El ciclo conectado permanece pendiente y los simuladores propios siguen detenidos mientras se prepara el receptor.

LidIA verifica en AppProtocol.Route que message-receipts GET exige app.timeline.read y POST/ack exige app.turns.write. Las claves por operación de sondeo cubren sessions.write/timeline.read/turns.write/context.attest y subjects.revoke, cada una con su capability mínima; los cinco KeyId de sondeo son distintos entre sí y de atención, como exige el registro Portal. Los permisos son history+sondeo, sin handoff/agenda. La retirada usa la clave REVOCATION separada. Este contraste de fuente prepara la prueba; todavía no acredita ningún tick nativo real.

### Entrega privada y conformidad técnica del paquete propuesto

Las dos configuraciones pending recibidas se han contrastado por SHA, modo privado y correspondencia de sus once secretos/KeyId/capability entre receptor y Portal. El registro real de0af593f valida ambos perfiles en memoria; la instancia no se ha modificado. Se preparó una configuración privada local con S2S y guest apagados, sinURL ni IDs/ruta inventados. [Revisión saneada](s2s-pending-review.json).

Se revisó y comunicó conformidad con el [plan recibido de LidIA](../../../integraciones/2026-10-12-dev25-qa-nativa-preparacion-lidia-recibida.md): backup/restauración aislada de25; EFhistory y migraciones oficiales; nueva referenciaQA y rollback; actualización con APP apagada; comparación funcional119DEV/real; nuevo proyecto/clon y sólo después habilitar sondeo con recursos verificados. Esta conformidad y las claves pendientes no acreditan despliegue ni conversación.

Los archivos de código anterior y aprobado se contrastaron por tamaño/SHA; el aprobado incluye las tres migraciones APP citadas. No se han restaurado ni aplicado al runtime. [Contraste de archivos](dev25-source-review.json).

### Revisión de copia y restauración R2

Se devolvieron dos observaciones sobre R1 antes de ejecutarlo: sintaxis YAML y consistencia/recuentos de la exportación. R1 se conserva y no se ejecutó. R2 mantiene una transacción READ ONLY/REPEATABLE READ en la misma conexión/comando, comprueba las variables e identidad de conexión antes y después, exige InnoDB y revalida los recuentos de todas las tablas. La restauración compara esos recuentos y los manifiestos de archivos.

Los hashes de fuente/script/transporte/plantilla se han comprobado directamente; shell, parser YAML y shell extraído deCompose pasaron. La plantilla mantiene cuatro hashes pendientes y falla antes de importar hasta completarlos con la copia real. Se comunicó conformidad para ejecutar la copia limitada a25; todavía no acredita exportación, restauración ni actualización. [Revisión saneada](dev25-backup-r2-review.json).

### Exportación DEV25: archivos originales contrastados

La exportación reporta188tablas,345.140filas y239.559.868bytes SQL, con snapshot/recuentos comprobados. PortalQA ha contrastado porhash los bytes originales del informe, manifiesto y TSV, y ha recomputado188nombres únicos/suma345.140. Se conserva el [informe original](dev25-backup-original-report.json) y el [manifiesto original](dev25-backup-original-SHA256SUMS.txt) sin modificar; el SQL y entorno permanecen privados en servidor.

El archivo pinned para restauración cambia exactamente cuatro hashes de la plantilla, todos desde el manifiesto original. ParserYAML/shell y límites de aislamiento pasaron; se comunicó conformidad de ejecución. No se ha observado todavía la restauración ni la actualización. [Procedencia, límites y revisión](dev25-backup-original-review.json).

### Restauración real comprobada

Ops ejecutó una vez el fixturepinned en el stack temporal123, sin repetir la copia. PortalQA leyó el AX original y vio la [captura](dev25-restore-r2-pass.png): recuentos188tablas PASS, SQL119/proyecto102 PASS, runtime/persistencia/entorno/comando PASS y RESTORECOMPLETE sin red/eventos/aplicación. Ops inspeccionó el contenedor detenido con salida0; esa salida se atribuye a su inspección. El historialEF restaurado termina en20261001214018_AddWhatsAppTemplatePrice.

El diff64ced36a→30be1692e contiene exactamente las tres migracionesAPP citadas y el ModelSnapshot. Se comunicó conformidad para preparar la actualización de25 con APP apagada y rollback preservado. No se ha acreditado aún la actualización, el clon funcional119 ni S2S; la matriz nativa permanece pendiente. [Procedencia y límites](dev25-restore-r2-review.json).

### Migraciones y runtime DEV25 observados

Ops ejecutó las tres migraciones oficiales y un único Pull. PortalQA ha visto y conservado los bytes originales de las capturas: [aplicación EF](dev25-ef-apply-actual.png) y [comprobación posterior](dev25-post-runtime-actual.png). El resultado visible confirma198tablas/historial260 y V1.728-app-diagnostico, con configuración APP ausente y entorno false. El 504 del Pull se reconcilió con el nuevo contenedor saludable; no se repitió el despliegue. SHA30be y CID462d se atribuyen al reporte de Ops.

El inspector119 está congelado, revisado por LidIA y pendiente de lectura real; el proxy, clon funcional, autoridad S2S y caso CRM propios siguen pendientes. Los JSON originales de ejecución aún no se han recibido: la captura no se transcribe como un original. [Revisión y límites](dev25-migration-runtime-review.json). Esto no modifica los pendientes de aceptación nativa ni autoriza usar la identidad PRO ajena.

### Acceso real del operador DEV

Login ordinario de Integraciones comprobado desde la UI en`https://dev-lidia.gestadia.com/admin/chats`: el menú confirma su usuario/correo y la pantalla muestra V1.728 y BD DEV. [Captura sin filas de chats ajenos](dev-integraciones-acceso.png) y [resultado](dev-integraciones-acceso.json). La ruta genérica`/admin` daba404 y el navegador la bloqueaba; la ruta oficial funciona sin cambiar seguridad, IP o host. La sesión queda preparada para el chat propio; no se abrieron conversaciones ajenas ni se modificaron permisos. Acceso al panel no acredita routing, chat, ticks ni correlación del proxy al contenedor25.

### Originales de ejecución recibidos y diferencia real del119

Se han recuperado los cinco informes originales de ejecución, sin transcribir capturas ni cambiar bytes: [migración](dev25-migration-original.json), [preview](dev25-preview-original.json), [postEF](dev25-postef-original.json), [postruntime](dev25-postruntime-original.json) e [inspección119](dev25-agent119-original.json). Los hashes de migración/runtime/agente comunicados por Ops coinciden con el cálculo independiente; el informe runtime vincula el mismo hash de migración.

La inspección real encuentra119DEV «GestadIA v2 - Agente por defecto», instrucción10111/version1.0/hash91b461…, distinta del119PRO Canje v4/v1.8/hashec616… informado por LidIA. No se ejecuta la copia literal desde ese agente antiguo. Se prepara un snapshot privado de configuración funcionalPRO para importar en un proyecto/agente DEV nuevos; no se trasladan chats/contactos/secretos ni se alteran119/122 originales. Defaults, herramientas y conexiones requieren revisión explícita antes de activar el namespace. [Decisión, procedencia y límites](dev25-agent119-review.json). La comparación PRO se atribuye al equipo fuente y no reemplaza una nueva captura/lectura actual.

### Segunda preparación de entrada iOS

Se reabre sólo el simulador propio y se vuelve a comprobar la escritura nativa: `Device → Keyboard → Keyboard Capture` muestra el indicador Capturing Keyboard; correo visible y contraseña enmascarada llegan a los campos. No se envía el formulario mientras S2S siga apagado. Los clicks del espejo web no cambiaban la APP; el tap del helper oficial, dirigido al UUID propio y verificado por captura, sí abre Nueva/Acceso. Se libera la captura del teclado al terminar.

El simulador propio y su espejo quedan detenidos mientras se prepara la configuración del agente. El iPhone17 original vuelve aBooted, con bootstatus terminado y datos conservados. No hay otra sesión conectada ni chat real acreditados por esta preparación.

### Exportación119PRO R2 preparada y revisada

LidIA congela un exportador de lectura con modelos nativos y cuatro SaveChanges bloqueadas, queries de tablas permitidas y transacción READ ONLY/RR. QA contrasta script/transporte/payload exacto de tres archivos, hashes, shell y los logs51offline/preflight sin DB/HTTP; se comunica conformidad para una ejecución de lectura por Ops en el CID PRO ya acreditado/UID1654. Pins de DLL/versión/BD/instrucción y configuración APP inicial/final; fingerprint observado se declara nuevo, sin un pin previo inventado.

[Revisión y hashes](pro119-export-r2-review.json). No se ha recibido todavía el snapshot real ni se ha importado/activado un agente DEV. El contenido privado se trasladará con su hash fuera deGit; conexiones/credenciales, contactos y chats no forman parte de ese contenido. Parámetros configurados no acreditan caches/modelo/proveedor ni un turno nativo.

### Exportación119PRO R2 real: resultado inconcluso

Ops ejecuta R2 una vez en PRO/UID1654. PortalQA ve y conserva la [captura original](pro119-export-actual.png): `System.Text.Json.JsonReaderException`, sin escrituras y sin contenido del snapshot impreso. [Resultado y límites](pro119-export-r2-inconclusive.json). No se repite el paquete ni se borra su marcador; esta salida no permite importar ni acreditar paridad.

Se solicita diagnóstico de fase/codificación/BOM/posición limitado a los archivos permitidos, sin valores de configuración. Comentarios y trailing commas ya estaban contemplados en R2; un BOM sigue siendo una hipótesis hasta la comprobación real. S2S QA e import DEV continúan pendientes.

### Causa de lectura confirmada: marca UTF8

La [comprobación RO servida](pro119-config-format-actual.png) confirma el mismo archivo/hash/tamaño que el candidato local: appsettings.json4563bytes/SHA8b090f… y BOM EFBBBF. LidIA reproduce RED: el proveedor nativo admite esa marca; JsonDocument sobre bytes de R2 falla en línea0/byte0. [Procedencia](pro119-config-format-review.json).

Se prepara una nueva revisión del lector con StreamReader, hashes sobre bytes originales y carpeta/marcador distintos. No se cambia el archivo válido de producción ni el agente. R2 y su resultado inconcluso se conservan; la lectura nueva todavía necesita revisión y ejecución.

### R3 corregida, congelada y revisada

QA contrasta el cambio del lector, sus fases sanitizadas, 74checks/preflight y el transporte exacto/payload de tres archivos; todos los archivos R2 registrados siguen idénticos. Se comunica conformidad para una nueva lectura R3 con carpeta/marcador distintos, pins de bytes originales y configuración leída antes de abrir la BD. [Hashes y límites](pro119-export-r3-review.json). No se ha recibido aún el archivo real ni hay importación/activación DEV o conversación nativa acreditada.

### R3 real: formato resuelto, referencia de instrucción distinta

Ops ejecuta R3 una vez. La [captura original](pro119-export-r3-actual.png) acredita que se alcanza verify_prompt_pin y se detiene con pro119_prompt_pin_mismatch; no hay escrituras ni contenido impreso. [Resultado](pro119-export-r3-stopped.json). No se importa ni se toma esta lectura por un snapshot completo.

Se solicita una observación mínima actual de119PRO (identidad/proyecto/instrucción/version/hash/modelo seguro/destino) sin contenido. La referencia ec616/v1.8 deberá contrastarse con el estado real antes de preparar otro pin; no se relaja automáticamente ni se usa122 como equivalente. R2/R3 y sus marcadores permanecen conservados. Los ciclos nativos y la instalación física siguen pendientes.

### Referencia de versión: inspección mínima preparada

El código Playground añade una «v» al valor almacenado al renderizarlo. La parada R3 no acredita por sí sola un cambio de contenido. Se prepara y revisa un inspector de tres SQL exactas para119/122 y sus referencias, con versión cruda/hash/longitud y sin contenido. QA contrasta31checks/preflight, transporte y tres archivos exactos; conformidad limitada a una lectura mínima. [Revisión](pro119-current-inspector-review.json). El informe real todavía no se ha recibido; no se normaliza ni modifica el pin ni se atribuye igualdad funcional119/122.

### Referencia actual confirmada por bytes originales

El [informe original](pro119-current-inspector-original.json) recuperado por Ops coincide con SHA3135a1be… recalculado por QA.119esLidIA Canje v4/102/instrucción10115; valor DB1.8-mario-adaptado,65532caracteres yhashec616c2687189eaded1a77d904d2c720aa12c8ab9f629850f74bc4202bcd0286, igual al pin de contenido anterior. La parada R3 correspondía a la «v» de presentación incluida erróneamente en el pin de versión; no acredita cambio del contenido real.

Dos transcripciones intermedias de hashes en mensajes eran incorrectas y quedan sustituidas por los bytes originales, sin alterar evidencia histórica. El fingerprint PRO c92ed76… ya está observado y puede fijarse en la nueva preparación.119/122coinciden en hash/version/longitud de sus distintas instrucciones; no se acredita equivalencia funcional completa. [Contraste y límites](pro119-current-inspector-result.json). Aún falta obtener el snapshot funcional, importarlo inactivo en DEV y entregar recursos S2S/CRM propios para los ciclos nativos.

### R4 revisada y lectura real comunicada como completa

QA contrasta el diff mínimo, rawversion exacta, pin de fingerprint antes de SELECT, referencia del informe original,78checks/preflight y transporte/payload de tres archivos. [Revisión](pro119-export-r4-review.json). Ops comunica una ejecución R4 completa en22:32:43UTC, snapshot103806bytes, sin escrituras/HTTP/Host/filas nuevas/import. Los originales y hashes están aún en recuperación: la comunicación no se trata como entrega de bytes ni permite importar. Se conservan R2/R3/inspector; no se repite la exportación.
