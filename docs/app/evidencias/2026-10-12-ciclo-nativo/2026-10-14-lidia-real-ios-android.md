# LidIA real en iOS y Android · 14/10/2026

La consulta conectada y su recuperación están comprobadas en ambos emuladores. La continuación [gestor real V1.731](2026-10-14-gestor-real-731.md) acredita intercambio, recibos y cierre en ambos sistemas; la instalación física sigue pendiente. Los apartados de este registro conservan su fecha y límites de cada ronda. [Matriz viva](README.md) · [Revisión saneada](native-lidia-actual-20261014-review.json).

## Versión y receptor observados

Paquetes source27/producto `c6530f6a20a134feb96de7bb15b9f89ee4af6975`: iOS0.1.0(11) y Android0.1.0(4), API privada3005 y cuenta QA propia. DEV25 sirve V1.728/commit30be1692e5ba2c7bbb41a9603fcd07adab55bbe0, CIDfbb5ac1e. Se conserva Native09417948, conexión DEV d03c44a1 y configuración SONDEO5 7fa7ce7e. El reinicio cambia exclusivamente AppConversations__Enabled atrue; se atribuye el receptor antes de conectar Portal.

Un GET firmado real a timeline de un UUID nuevo inexistente devuelve404conversation_not_found después de autenticar la integración propia. Se conserva respuesta original privada y revisión12cae693. Consume un nonce antireplay y no crea sesión, turno, LLM ni CRM. Portal R3 exige prueba de receptor para cualquier perfil activo y el guard8e96 limita a UID QA/DEV/claves propias durante la ventana23:00:56–00:00:56UTC.

El primer inicio Android falla por caducidad real del grant básico del12/10, sin crear SID. Se renueva con el servicio estándar, mismos history/sondeo y límite de ventana; Volver a cargar permite continuar. No se cambia autenticación ni se desactiva el guard.

## Dos conversaciones reales

| Origen | Conversación | Ejecución observada |
|---|---|---|
| Android | Canje Colombia Android | Siete turnos enviados desde controles nativos. Colombia, vigencia y residencia del perfil ficticio; el agente concluye por texto que cumple y pide nombre. Se detiene antes de aportar contacto. |
| iOS | Consulta Colombia iOS | Nueva conversación independiente y un turno de texto. El agente responde sobre Colombia y pregunta por la vigencia del carné. |

Las dos sesiones efectivas usan proyecto104/agente124, clon DEV de la instrucción funcional1.8-mario-adaptado. No se atribuye esta ejecución al119 original. Cada contexto tiene ACKrevision1/current1 antes de su primer turno; hay exactamente dos sesiones y ocho turnos. Los informes privados de operaciones son proyecciones durables, **no respuestas HTTP originales**.

Se observan Enviado a Gestadia y Recibido por LidIA. No se atribuye lectura humana a los ticks de IA. El texto favorable no equivale a una señal estructurada v2, conversión de lead, cita ni efecto CRM. No se suministran nombre/teléfono y no se ejecuta contacto.

[Android: resultado y límite de contacto](android-sondeo-real-20261014.png) · [iOS: respuesta e historial reiniciado](ios-historial-real-reiniciado-20261014.jpg).

## Continuidad y controles

Desde iOS se recupera primero el historial completo de Android. Cancelar renombrado conserva el título; Guardar aplica los títulos de ambos chats, cotejados en BD. Buscar Android o iOS devuelve la fila correspondiente, con creación/último mensaje y estado Abierta. Atrás retorna a LidIA; dentro del chat no se ofrece Nueva.

Terminar y volver a lanzar la app iOS conserva cuenta, títulos y el historial de la segunda consulta. Después se apaga sólo ese simulador. Android se reinicia sin borrar datos y conserva cuenta/dos chats; el botón Continuar abre el mismo historial iniciado en iOS, con respuesta y recibo. No se envían turnos adicionales al recuperar.

UIAutomator inicialmente devuelve raíz nula o sólo WebView tras cold boot. El volcado posterior --compressed expone los controles y se pulsa Continuar por sus bounds actuales; el historial se comprueba en árbol y captura. No se confunde un ACK de herramienta con una acción recibida. En Device Hub, Capture Keyboard permite escribir de verdad; al terminar se devuelve aOFF.

[Búsqueda de la conversación Android en iOS](ios-busqueda-android-20261014.jpg) · [Android tras reiniciar y abrir el historial correcto](android-historial-reiniciado-20261014.png).

Source comprueba ambas sesiones desde Sesiones DEV: iconoAPP, proyecto/agente correctos, historiales diferentes conservados al alternar y recargar, sin enviar mensajes administrativos.

## Retirada temporal y siguiente fase

Tras la evidencia nativa se para la API propia y se retira el grant básico mediante setConversationAccess estándar, permissions[], sin revocación global ni borrar chats. Los dos POSTcontext reales devuelven200 persistido, revisión2/current2, efectivos vacíos; Portal conserva synced2 y cero operaciones propias pendientes. Los bytes request/ACK y la proyección de drenaje se guardan privados. Ambos ACKdeclaran propagating, con deadline23:34:01UTC: la comprobación efectiva posterior en la primaria DEV y la restauración del receptor se registran por separado al completarse.

Portal guarda scopeOFF y configuración propiaallOFF. No es un apagado de cuentas, ni una revocación de otra conversación de producción. El historial permanece conservado.

El gestor sigue pendiente: el operador existe, pero la lectura acotada no encuentra el catálogoSoporte ni departamento/asignación propios. Hace falta provisión estándar en DEV, relación real propia Contact–Deal–Owner de Zoho Production y rutas/assignment verificables. No se fabrica un expediente ni se presenta un chat IA como gestor. El iPhone no se reinstala antes de validar ese ciclo en ambas plataformas.

### Comprobación efectiva posterior y receptor apagado

La primaria DEV se lee una vez por TLS, transacción READONLY/RR, a23:38:36UTC, después de ambos deadlines. Sólo los dos SID propios: contexto2, permissions[], proyecto104/agente124/canalAPP y cero operaciones activas o trabajadores procesando; se conservan26+5mensajes y7+1turnos. Efectivos vacíos se derivan explícitamente del método del producto: solicitado vacío intersectado con permisos del perfil sigue vacío. Son originales de lectura SQL y una proyección explicada, no respuestas HTTP ni un GETcontext inventado. Rollback/cursor/conexión cierran sin errores.

Portal vuelve a comprobar bloqueo/drenaje a23:40:02UTC: API26117 escuchando con global/native/guardOFF, grant vacío y cero operaciones propias pendientes. El tiempo inicial de bloqueo23:33:00.875 precede a los ACK. No hay revocación global ni eliminación de historial. Ops restituye los58ENVoriginales y reinicia DEV: receptorOFF/healthy/HTTPS200 a23:42:37UTC, nuevoCIDd0ee8843 y mismoNative094/config7fa7. La retirada selectiva del fichero sigue pendiente de su CAS observado. Las cuatro flags del proyecto/agente importados se conservan activas para continuar la fase del gestor; **no se declara restauración total de DEV**. [Revisión de retirada](native-sondeo-withdrawal-review.json).

Antes de configurar el caso del gestor se crea una copia nueva de Portal local:69918B/SHA54e91524. Se restaura en una base aislada, se cotejan24tablas/todoslosconteos y la cuenta activa sin vínculo CRM, y se elimina sólo esa copia temporal. Se usa el cliente mysql ya instalado; una lectura metadata fallida por otro driver queda conservada y la verificación se completa con el cliente estándar, sin cambiar contraseñas o permisos. [Revisión de copia/restauración](portal-backup-before-manager-review.json). Esto no equivale a crear Contact/Deal ni al ciclo de atención.

### Fallo administrativo detectado después de apagar S2S

LidIA comunica que, al recargar el detalle de la sesión Android con el receptor apagado, el administrador ve «Esta conversación no existe o no puedes verla». La lectura primaria anterior acredita que los mensajes siguen conservados. El equipo fuente prepara una corrección de AppSessionDetail para que la auditoría interna autorizada no dependa de la conexión S2S, conservando los controles de los operadores de soporte y las acciones de conversación. El fallo y su futura corrección se verifican por separado; no se reactiva APP para sortearlo ni se atribuye todavía su reparación. La provisión estándar de Soporte/departamento y el ciclo del gestor esperan esa corrección.

### Retirada cerrada y corrección integrada, pendiente de servir

Ops completa la retirada selectiva con el helper existente: configuración ausente y copia privada con el hash original7fa7. El resultado7ff40894 conserva noReplay y history_deleted=false. Tras reiniciar a00:11:37UTC, el receptor continúa apagado, con Native094, configuración ausente y health200. Portal ha visto la captura de consola que confirma ausencia y resultado; los recibos completos y su copia se conservan en la coordinación Ops. Las cuatro flags propias permanecen activas para continuar la fase del gestor.

LidIA publica la corrección de lectura administrativa en [PR1711](https://github.com/enmarkados/Gestadia_LidIA/pull/1711). Portal revisa los tres lectores sin hallazgo bloqueante. Source informa961pruebas correctas, incluidas25regresiones; Portal no las presenta como una suite propia ejecutada. git ls-remote comprueba que dev/IA/main y codex/app-dev25-qa-20261012 apuntan a130cd186dbeb1fd89d680b40828575246092cc5d. Integración Git y despliegue efectivo siguen siendo evidencias separadas.

Antes del despliegue se obtiene una copia nueva de DEV por TLS y transacción consistente de sólo lectura:239808404bytes, hash03a380c5,198tablas y260migraciones; no hay tablas no transaccionales. Los conteos propios posteriores conservan dos sesiones, ocho turnos,26+5mensajes y contextos2 con permisos vacíos, sin operaciones activas.

La importación de compatibilidad en un esquema local MySQL8.4.9 falla con1101/42000 al rechazar un valor por defecto de BLOB/TEXT/JSON de MariaDB. El dump binario permanece intacto y el esquema temporal se retira tras preservar el error. **No hay restauración canónica MariaDB acreditada.** Source acepta continuar el cambio de lectores, sin migración, con el dump actual y el respaldo de código/imagen/archivos persistentes; la limitación se mantiene explícita. [Revisión de copia y límites](dev25-pre-audit-backup-review.json).

### Corrección comprobada en el panel real

La única actualización DEV termina detrás de un 504 del proxy, sin repetirla. Ops observa el contenedor nuevo 032d6cea, imagen 787863eb y Native b5579ee9 de 61.137.408 bytes, S2S apagado, perfil ausente y health 200 a las 00:32:52 UTC. El panel muestra V1.729-sesiones-app-historicas.

Source abre las dos sesiones desde Sesiones, alterna y vuelve a recargar la primera: 26 mensajes en Android y 5 en iOS, sin cruzar sus textos. Portal revisa visualmente ambas capturas, con ids, insignia APP, proyecto propio, menús y formato correctos. No se repiten los ocho turnos. [Revisión servida](lidia-admin-audit-served-review.json) · [Historial Android en administración](lidia-admin-historial-android-s2s-off-20261014.png) · [Historial iOS en administración](lidia-admin-historial-ios-s2s-off-20261014.png). Son vistas administrativas de LidIA, no nuevas pantallas de la APP.

El fallo de lectura queda comprobado como resuelto. Soporte/departamento, relación propia CRM, ciclo de gestor y posterior instalación física siguen pendientes; no se confunden con esta corrección.

### Preparación del caso propio para la prueba del gestor

Ops termina una única instalación del paquete revisado y su comprobación previa en el contenedor PRO indicado por el contrato. El proceso devuelve `eight_guards`, `no_DB_no_HTTP_no_apply` y salida 0. Portal revisa visualmente el resultado y los tres archivos del paquete con sus seis enlaces a dependencias nativas. Esta fase prepara la herramienta; **no abre la base de datos, no llama a Zoho y no crea contactos, tratos ni permisos**. No se repite la instalación.

La cuenta Portal se vuelve a consultar a las 00:53:33 UTC: activa y verificada, dos sesiones nativas vigentes, sin vínculo CRM, expedientes ni operaciones pendientes. La copia propia conserva SHA `54e91524`. Android arranca conservando su instalación 0.1.0/versionCode 4 y se restablece únicamente su conexión local al puerto 3005. El rol y departamento del gestor, la configuración efectiva y los registros CRM reales continúan pendientes. [Revisión de la preparación](manager-case-stage-review.json).

La suite de interfaz de la revisión de producto `c6530f6` pasa de nuevo: **49 archivos / 208 pruebas**, salida 0. Los cambios posteriores en esta rama son documentación; no se reconstruyen ni sustituyen los paquetes nativos por esta comprobación. [Resultado actual](frontend-current-208-review.json). La aceptación del gestor sigue pendiente y no se deduce de estas pruebas.

Se prepara [PR17](https://github.com/enmarkados/Gestadia_Portal/pull/17) como **borrador hacia app/main**, sin fusión. La creación usa la cuenta `enmarkados` ya guardada y sólo en el proceso correspondiente; no cambia la cuenta global de GitHub CLI.

### Consulta de disponibilidad de «Continuar sin registro»

A las 01:05:02 UTC se consulta mediante GET, sin autenticación, `/api/app/guest/conversations` en el backend local y en `https://app.gestadia.com`. Ambos devuelven `503` con `runtime_unavailable`. No se solicita crear una instalación ni una conversación, y no se cambia configuración o autoridad.

El código comprueba disponibilidad antes de acceder a datos guest. El botón de la APP conserva el intento y el origen y muestra el aviso de indisponibilidad; no fuerza una cuenta como requisito del diseño. La causa observada corresponde al servicio aún indisponible, no a una conversación guest conectada validada. La siguiente fase guest requiere configuración efectiva v2 y prueba propia; permanece separada del ciclo de cuenta/gestor actual. [Estados observados](guest-readonly-availability-review.json).

### Perfil de atención servido y petición firmada comprobada

La interfaz estándar guarda Admin + Soporte para Integraciones y crea el departamento 1, exclusivo del proyecto104, con el usuario propio como operador. Se activa ese departamento y una lectura primaria comprueba la pertenencia, actividad y ausencia de bloqueo. No se añaden reglas, scopes ni destinos predeterminados persistidos. Las lecturas observan TLS cifrado; la identidad del certificado no está acreditada.

Se prepara la referencia opaca `qa104-integraciones-64a53aba-manager`, que relaciona el Owner CRM Sistemas con el operador de chat Integraciones mediante la configuración servidor. La referencia no es un ID de trato o expediente y puede configurarse antes de crear esos registros. El perfil contiene sólo `history`, `manager_handoff` y `case_context`, sin herramientas CRM. La primera revisión privada conserva el valor incorrecto `Environment=DEV`; una segunda revisión cambia únicamente ese campo a `dev`, antes de la instalación.

Ops instala una vez el archivo exacto1653bytes/25fc24a9 y recrea DEV con el único cambio de activación entre58variables. La actualización recompila por `pull_policy: build`: el Native servido cambia a497e34c0. Portal comprueba que130cd186→8c062b4 sólo modifica cuatro documentos, sin diferencias en producto, tests o configuración de build. **No se afirma identidad binaria con b5579ee9.** La observación de las01:24:22UTC acredita contenedor f8023049, UID1654, S2S activo, archivo25fc y health200.

A las01:26:04UTC Portal realiza una única petición GET con el cliente real del producto y su guard propio: consulta un UUID nuevo inexistente, únicamente con la clave de lectura y el sujeto QA. Devuelve el resultado esperado `404 conversation_not_found`,229bytes/SHA61e4ebe3. No se crea una conversación, contexto o turno, ni se llama al modelo o CRM. El backend Portal, sus grants y su scope persistido siguen apagados. [Revisión servida de atención](manager-receiver-served-review.json).

Antes de crear Contact/Deal se detecta una dependencia: la configuración local no dispone de `clientId`, `clientSecret` ni `refreshToken` de Zoho. El guard existe, pero eso no acredita un proveedor operativo. **No se generan recibos que afirmen lo contrario ni se crean los registros CRM.** Ops busca la configuración autorizada del Portal desplegado; las evidencias temporales de mapping se conservan con sus fechas y se volverán a observar cuando el proveedor esté preparado. El ciclo humano, la fusión de PR17 y la instalación física permanecen pendientes.

### Proveedor recuperado y creación parcial conservada

Después de esa observación se recuperan las seis variables del proveedor real del Portal desplegado, mediante transporte cifrado y archivos privados. Se verifican los dominios europeos y la configuración del producto. No se guardan valores en el repositorio. Una comparación local fallida llegó a mostrar material sensible en una salida de herramienta; se comunica el incidente y se corrige la validación para devolver sólo estados y referencias. Esta incidencia impide afirmar que los valores nunca se imprimieron durante la recuperación.

El producto envía los parámetros de renovación OAuth en la URL. Una adaptación privada de QA mueve únicamente esa petición exacta a formulario antes del guard existente, sin alterar respuestas ni ampliar consultas CRM; las pruebas específicas pasan14/14. La API propia continúa apagada y aún no tiene vínculo CRM ni expediente.

A las01:48:36UTC Zoho confirma con201 la creación del único contacto propio de la operación. La verificación temporal caduca durante esa respuesta y la herramienta se detiene antes de su primera lectura, de crear el trato o de escribir en Portal. El resultado durable conserva `partial_confirmed_creation_no_replay`, una petición de negocio y trato ausente. Ops comprueba que no hay intenciones posteriores en el directorio original, que permanece intacto.

Se acuerda comprobar una sola vez ese contacto por el ID devuelto por Zoho. La comprobación usa el transporte real del producto y valida marcador, propietario, layout y fecha contra el inicio original de creación. Sólo después se revisará la creación del trato pendiente. **No se repite el alta de contacto, no se inventa un ID de trato o expediente y no se activan permisos de conversación a partir de la respuesta parcial.** El ciclo humano y la instalación física siguen pendientes.

A las02:06:54UTC se ejecuta esa lectura: OAuth real y un único GET por el ID confirmado, HTTP200. Coinciden ID, marcador, propietario y fecha del alta original. Zoho devuelve sólo `Owner`, `Last_Name`, `Created_Time` e `id`; omite `Layout` y `$layout_id` pese a los campos solicitados. La comprobación conserva el resultado `contact_readback_mismatch`; **no se interpreta la omisión como plantilla verificada ni se crea el trato**. Se propone una lectura adicional del mismo registro para obtener su metadata, pendiente del acuerdo técnico correspondiente. [Resultado parcial y límite](manager-contact-partial-review.json).

### Contacto comprobado y preparación de una nueva ronda

Los equipos acuerdan una lectura adicional del mismo contacto, sin filtro de campos, y actualizan el presupuesto de recuperación a cinco peticiones de negocio totales: dos POST y tres GET. El intento previo al cierre de la ventana se detiene con17,5segundos de margen antes de emitir scope, OAuth o HTTP; no consume otra consulta. No se amplía la activación APP vencida.

Se acuerda después una ventana de lectura independiente, propia y de cinco minutos, sin depender del canal APP. A las02:15:07UTC se completa OAuth y el único GET adicional: Zoho devuelve la plantilla real en `$layout_id.id`. Los siete controles pasan: HTTP, una ficha, ID del201 original, marcador, propietario, plantilla y fecha. La respuesta completa permanece privada, y el primer resultado con metadata ausente sigue intacto. Son tres peticiones de negocio acumuladas y un solo alta de contacto. No existen aún trato, vínculo Portal, expediente ni grants nuevos. [Comprobación real completa](manager-contact-readback-review.json).

Se termina una copia nueva de DEV a las02:19UTC:198tablas,260migraciones y dump239797610bytes/SHA9e2b03dd, consistente y de sólo lectura. Se mantiene explícita la limitación de identidad de certificado y restauración canónica MariaDB no acreditadas. Un primer precheck había parado antes de conectar al confundir el digest de conexión con el del archivo cnf; se conserva, y la segunda ejecución valida el archivo correcto antes de consultar o copiar.

La copia nueva de Portal local se restaura en una base temporal propia:24tablas y conteos iguales, cuenta activa sin vínculo CRM y origen sin cambios; se retira únicamente esa restauración temporal. Dump68675bytes/SHA8adb49e3. [Copias actuales y límites](manager-window2-backups-review.json).

La siguiente hora de atención se prepara con el mismo proyecto, agente, operador, departamento, permisos, claves y cursor. El candidato sólo contiene placeholders en las dos fechas y no es instalable; **todavía no emite una nueva ventana efectiva**. Antes de crear el único trato pendiente, la ejecución deberá validar código y recibos Source/Ops concretos por hash, cuenta y mapping actuales, y más de un minuto de margen para el POST. La API propia y sus grants continúan apagados.

### Nueva ventana, caso real y primer intercambio Android

La corrección final de Sesiones se integra mediante PR1713 en `1aaf2cdbe390cc12bdc24930e6c11acf1eae7dd6`. La revisión final separa auditoría administrativa y lectura operativa; Source informa567pruebas correctas. Ops observa DEV V1.730, Native4b7ef5e5 y health200; Source comprueba además la versión en la interfaz. No se atribuyen a Portal pruebas de Source que no ejecutó.

La ventana de atención efectiva02:46–03:46UTC conserva proyecto104/agente124, operador, departamento, seis claves y tres permisos, sin CRM, guest o v2. Un GET firmado real a las02:54:47 devuelve404conversation_not_found, con el cliente del producto y el sujeto propio, sin crear sesión o turno.

Los dos primeros intentos de trato se rechazan definitivamente con400por el mapeo Pipeline/Layout y después Stage/Pipeline. Cada corrección se revisa por separado, sin reintento automático ni repetir el alta de contacto. El tercer intento de trato, a las03:17:39, devuelve201; su GET200 pasa13controles. Se usan los nombres de presentación `CV con Pago` y `En Negociación`, asociados por metadata a los mismos IDs. Esos IDs no se presentan como campos devueltos por la ficha. El balance final es siete peticiones de registros: cuatro POST intentados, tres GET, dos registros confirmados y dos rechazos400. OAuth y la consulta de metadata rechazada por scope se cuentan aparte. No hay pago, ganado ni mensajes comerciales.

Portal vincula la cuenta propia y el expediente real `ad8d5b53-6654-481f-9147-f3f4d447be54` en una transacción. Conserva pago pendiente y escribe el grant estándar history/manager_handoff/case_context hasta03:46. El primer arranque privado se detiene antes de red porque el perfil histórico de sondeo hereda enabled. El siguiente reduce la configuración a atención y usa la selección estándar de integraciones; no modifica producto ni amplía el guard.

Android abre Hablar con un gestor desde LidIA: muestra el Owner CRM Sistemas y entra en atención. La sesión real `cb0fc8d5-2e3b-49f4-b174-7651b4e54cf1` admite201, sincroniza contexto1con200 y solicita handoff202. Integraciones toma el chat por la interfaz y responde. La APP muestra ambos textos y «Te atiende Integraciones». Source corrobora recibido y leído de la respuesta por la cuenta, sin escribir timestamps. Atrás vuelve a LidIA; al abrir desde Mensajes retorna a Mensajes y conserva creación, último mensaje e historial.

**El ciclo todavía no pasa:** a las03:34UTC el primer mensaje del cliente sigue recibido y sin leído, y el segundo sigue enviado. La lectura primaria de Source confirma esos estados; se investiga el panel operativo, sin simular ACK. Cierre Android, ciclo del gestor iOS e instalación física siguen pendientes. iOS se apaga antes de continuar para respetar las pruebas secuenciales. [Revisión del avance](manager-native-progress-20261014-review.json) · [Pantalla real y límite de lectura](android-gestor-bidireccional-pendiente-lectura-20261014.png).

### Cierre Android y retirada antes del vencimiento

A las03:40–03:41UTC Source cierra por la interfaz operativa. Android conserva los tres mensajes y muestra «Esta conversación está cerrada. Puedes consultar su historial», sin compositor ni botón de envío. No se pulsa Nueva conversación. El estado Portal esclosed/revisión7. Cancelar un nombre escrito en la edición de Mensajes conserva el título original, también cotejado en la base local. [Pantalla nativa cerrada](android-gestor-cerrado-20261014.png).

La consola real del panel del gestor identifica `TypeError: Illegal invocation` en `visible`, al invocar getComputedStyle con un receptor distinto de Window. La recepción por el operador sí se observa para ambos mensajes; la lectura permanece sin confirmar. La corrección de Source y su nueva prueba nativa están pendientes; no se cambia el icono para aparentar un ACK.

Portal para su API activa y retira el grant por el servicio estándar. El primer helper privado exige erróneamente que case_ref siga presente y se detiene antes de HTTP; el producto lo borra correctamente con los permisos. Se conserva ese intento y se recupera la misma operación, clave y cuerpo con el guard de retiro corregido, sin otra revisión ni escritura de grant. A las03:42:04.718UTC el POST real confirma200, persistido, contexto2/current2, estado8 y permisos efectivos vacíos. El ACK declara propagación hasta03:43:04.718; la verificación efectiva primaria se registra aparte.

Los scopes propios S2S y CRM quedan apagados; la API se reinicia con todos los proveedores externos desactivados y cero operaciones propias pendientes. Se apaga sólo el AVD Android propio, conservando sus datos. iOS no abre una sesión del gestor en esta ventana. **No se declara todavía receptor restaurado, lectura corregida, aceptación completa ni instalación física.** [Cierre y retirada comprobados](manager-closed-withdrawal-review.json).

La comprobación efectiva de Source termina a las03:44:03.339UTC, después del deadline: contexto2/estado8, permisos vacíos, tres mensajes, conversación cerrada y ninguna operación activa. Lectura primaria READONLY, TLS cifrado y rollback/cierre completos; sigue sin acreditarse identidad de certificado. Portal coteja el SHA del original Source. Sesiones abre de nuevo la conversación cerrada con sus estilos e historial, sin ACK de operador inventado.

Ops conserva la copia del perfil124c y completa su retirada CAS. Una relectura detecta que el primer guardado del ENVfalse no había persistido; se corrige antes del único reinicio final. A las03:48:29UTC informa contenedor250c2cd3, APPfalse, perfil ausente,58variables originales idénticas y HTTPS200. No se retiran los registros CRM, el expediente, los mensajes ni las cuatro flags propias del recurso importado; no se presenta como restauración total de DEV.

Portal revisa la corrección mínima de JS de Source, que liga getComputedStyle al Window real. Ejecuta de forma independiente la suite específica:10/10correctas. La regresión reproduce la exigencia de binding nativo y comprueba tanto leído como recepción de mensajes nuevos. El despliegue del fix y su nueva aceptación nativa se registrarán cuando ocurran.

Se obtienen copias nuevas después de la retirada y antes del siguiente despliegue: DEV03:50:13UTC,239863210bytes/SHAd52ff3bc,198tablas/260migraciones, transacción consistente con inicio de sólo lectura y TLS; conserva los límites de certificado y restauración canónica. Portal03:50:42UTC,79727bytes/SHA5fa4deba, restaurado en una base temporal:24tablas y todos los conteos iguales, cuenta vinculada, expediente real y conversación cerrada2/2comprobados. La fuente mantiene sus conteos y se elimina sólo esa restauración temporal. [Revisiones actuales de copia](manager-after-withdrawal-backups-review.json).
