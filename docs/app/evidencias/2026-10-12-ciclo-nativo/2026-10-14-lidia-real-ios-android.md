# LidIA real en iOS y Android · 14/10/2026

La consulta conectada y su recuperación están comprobadas en ambos emuladores. **El ciclo del gestor y la instalación física siguen pendientes.** [Matriz viva](README.md) · [Revisión saneada](native-lidia-actual-20261014-review.json).

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
