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
