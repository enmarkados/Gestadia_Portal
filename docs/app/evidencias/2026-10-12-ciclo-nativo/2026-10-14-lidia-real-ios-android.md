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
