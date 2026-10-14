# Acceso sin registro APP — receptor v2 existente

Estado a 14/10/2026: propuesta operativa para revisión conjunta Source/Portal/Ops. No habilita acceso público, cambia permisos ni ejecuta diagnósticos remotos. Reutiliza el contrato v2 y los términos de [GLOSARIO.md](../../GLOSARIO.md).

## Hechos y alcance

El reporte humano de «Continuar sin registro» está documentado en Gestadia_Portal, `docs/app/evidencias/2026-10-12-agenda-real/README.md`, secciones de error real y parche servido. La primera omisión de rutas del proxy fue corregida en `c6530f6`; el POST real posterior devuelve `503/runtime_unavailable`. Por tanto, el parche servido acredita transporte y manejo del error, todavía no una conversación anónima funcional.

En el consumidor actual, `AppGuestService.enabled()` exige `enabled`, `guestEnabled` e `integrationId`. Portal observó ambas flags apagadas e integración/baseURL ausentes. Las cuatro tablas guest ya existen; no se propone recrearlas ni introducir una migración para este error. La instalación genera un token opaco de 32 bytes, almacena su hash y dura 30 días. El actor de invitado se identifica por esa instalación comprobada; cada conversación atestada tiene un máximo de 24 horas. Son plazos diferentes.

En LidIA, `AppProtocol.VerifyRequest` y `AppV2Authority.RequireOwnerAsync` exigen `GuestV2Enabled`; firma v2, actor, subject y revisión se verifican server-side. `AppV2SessionService` crea una `ChatSession` normal con `Channel.App`, sin WhatsAppContact, automatización cancelada y referencias de proyecto/agente/instrucción resueltas por la integración. El teléfono, visitorId y ClientKey no sustituyen esta autoridad.

Producción está comprobada en `607cf3687b1963196ecc5546d9492e3e974e55cf`, V1.731: DLL `9e90e4c191a76d470cd4bdf3bd4b5e226dd739caf9f0aff015eba8eda1186418`, JS `4874cadf8fb84bb4608fe6239b3fe00c40e6515d7adfb31c08d7ff5bade29cdb`, configuración `abd00800b8bc6bdbed8371f2dbcb3b8610ef9b658847465451c4d6fb26588d2c`, 4279 B, modo 600 y propietario1654:1654; ENV43 sin diferencias. El archivo conserva los dos perfiles previamente observados y no se instaló un perfil guest durante este despliegue. La metadata anterior identificaba ambos con GuestV2=false; no se presenta aquella lectura como un nuevo diagnóstico efectivo de toda la configuración.

La reserva Main y sus 25 mensajes están verificados desde Sesiones. No se reutilizarán su sesión, grants, claves, agente, herramientas ni backup global para abrir acceso anónimo. DEV y autorizaciones de QA permanecen OFF.

## Decisión mínima propuesta

Se mantienen los diseños ya aceptados `ProGuestLiteralClone` y `ProGuestConfigurationOverlay`, con integración y audience `gestadia-app-pro-guest`. Se descartó compartir el agente122 porque su catálogo y las guardas administrativas de Main no admitían nuevas asignaciones. El nuevo destino será el proyecto «Gestadia APP Invitado» y el agente «LidIA Canje APP Invitado», con IDs obtenidos de recibos reales de la BD.

La copia prevista tiene Project/Agent/AgentInstruction/AgentFunction propios y un join propio. Toma proyecto103, agente122, instrucción10116 y la definición Country10364 como orígenes observados; conserva literalmente instrucción, modelo, defaults y definición pura. Las referencias de identidad se ajustan exclusivamente a las filas propias. No copia conexiones, membresías, rutas, automatización, public-chat, herramientas globales, claves ni canales WhatsApp. Las cuatro filas se crean inactivas y sólo cuatro IsActive propios se activan en una fase separada. Se comprueban Country propia y el reloj compilado del motor; no se alteran las reglas de canje del agente.

| Configuración del receptor | Preparación y destino revisable |
| --- | --- |
| `Id` / `Audience` | `gestadia-app-pro-guest`, independientes de Main y validación119 |
| `ProjectId` / `AgentId` | IDs propios procedentes de commit/readback reales; nunca del móvil |
| `Environment` | `pro` |
| `Permissions` | Sólo `sondeo`, `history` |
| `Crm` / `SupportRoutes` | `null` / `[]` |
| `PlatformAgentRuntimeEnabled` | Motor real de plataforma, con catálogo propio comprobado |
| `RuntimeIsolationVerified` | Sólo se declara comprobado tras evidencia real de recursos y catálogo; no se infiere del nombre del proyecto |
| `GuestV2Enabled` | false durante preparación; true sólo en la activación revisada |
| Claves | Tres nuevas, una por capability: `app.sessions.write`, `app.timeline.read`, `app.turns.write`; inicialmente inactivas |
| Cursor | Secreto propio independiente de las claves y de Main/119/DEV |

El perfil no habilita CRM, llamadas, checkout, soporte, gestor, contacto, binding ni revocación administrativa por S2S. La instrucción literal puede conducir hacia esas necesidades; esta fase sólo acredita sondeo e historial hasta solicitar identidad. No se registran leads o reservas desde invitado y no se inventa un resultado tipado favorable. Los secretos se prepararán en archivos privados del propietario comprobado y no se publicarán en Git, logs o mensajes.

El ciclo usa las rutas existentes `/api/integrations/lidia/app/v2`: sesión, turnos, timeline/consulta por turn_id y recibos. Las claves de READ/TURN cubren consulta y ACK de recibos existentes, respectivamente; no se crea otro endpoint de mensajería. Se conservan DTO, firma, idempotencia, revisiones y tratamiento de resultado desconocido del contrato actual.

## Bloqueo concreto antes de poder preparar recursos aplicables

La preview anterior de `ProGuestLiteralClone` se cerró antes de crear filas por `ForeignReference`. Su MiniRO posterior, original `99641deea83a1f794e40876d1a0c9b7b66bec55f8906196968c50867ed2d4689`, observó rutas cero y una única violación: Project.PersonalityId no nulo. No observó su valor, estado ni efecto y no autorizó una excepción al guard.

`ProGuestPersonalityReferenceRead` está preparado sólo localmente: 104 pruebas positivas, cero fallos, manifest `2f1b2b80b260e32bae7a7afae96cb357083a52167b69a2a5c5a93f26da823eb2`; `remote_executed=false` y `server_proof=false`. Fija DLL3ba y V1.728. Esos pins son obsoletos para PRO731: no debe ejecutarse ni retocarse silenciosamente el paquete congelado. La nueva revisión de preparación deberá cotejar el ensamblado actual, conservar los originales y revisar sus límites y lifecycle contra el código ya corregido de adquisición/cierre de lectores. Un build o un preflight local no sustituye la lectura servida.

La observación pendiente es acotada: enlaces de103/122/10116, dos settings tipados de personalidad y hasta tres filas derivadas internamente, sin cuerpos de prompt, credenciales, IDs o SQL libres. Se exige transacción READ ONLY, rollback único, limpieza concluyente y evidencia independiente de cada fase. No hay stage, lectura remota ni excepción FK autorizados por este documento.

Con el resultado real, Source/Portal/Ops podrán revisar si conservar exactamente la referencia de personalidad como catálogo de sólo lectura mantiene la conducta del origen. No se forzará null ni se copiarán snippets al prompt. La propuesta anterior de conservar esa FK sigue condicionada; una quinta fila de personalidad sería otro alcance. Tampoco se repetirán la preview fallida ni sus marcadores.

## Reparto y punto de revisión material

Source concreta el lector actualizado, la decisión sobre personalidad, el delta literal y el overlay usando recibos reales. Portal concreta su consumidor servido y el fragmento privado inicialmente OFF: flags v2/guest, integración, base HTTPS, audience y sólo SESSION/READ/TURN. Ops coteja el paquete concreto, copias previas y preimágenes actuales, y ejecuta cada fase aprobada desde Portainer. Ningún equipo da por aceptada la activación a partir de esta propuesta.

Portal debe cerrar un detalle antes del GO: el consumidor `AppConversation.jsx` intenta `api.bind(c.id)` al encontrar invitado, guestId y modo real tras acceder a cuenta. El perfil mínimo no tiene BINDING. Debe preparar el comportamiento explícito que permita iniciar sesión sin llamar automáticamente al binding ni prometer recuperar ese historial en otra cuenta/dispositivo. La asociación durable a cuenta podrá activar posteriormente el binding existente mediante su propia revisión; no se introduce una identidad ficticia ni otro contrato. Si Portal requiere continuidad inmediata en esta fase, debe declarar ese requisito y revisar las capabilities adicionales antes del GO.

La revisión material posterior deberá mostrar el delta completo de recursos propios, configuración y Portal, IDs reales, catálogo, claves sólo mediante metadata segura, pruebas, backups y retirada. La solicitud de consentimiento para habilitar acceso público corresponde a ese resultado concreto; no se hace sobre una configuración hipotética.

## Backups, retirada y prueba de aceptación

Se conservan los backups anteriores de código/imagen/AppData/SQL. Antes de una operación nueva se cotejan pins y cambios desde esas copias; si han cambiado las preimágenes o datos necesarios, se prepara la copia actual necesaria. No se presenta el backup previo como prueba de restauración canónica PRO ni offsite. Main y la configuración de producción tienen actividad propia y se deben conservar.

La retirada empieza por apagar el consumidor invitado y sus claves/GuestV2. Después de comparar su postimagen y ownership, desactiva sólo las cuatro filas propias o retira sólo el append del perfil. Se conservan las ChatSession, joins, recibos y filas; no hay DELETE ni restauración global del archivo ABD. Ante deriva ajena se concilia y se preserva Main; un futuro paquete administrativo debe fijar la nueva preimagen y conservar ambos perfiles. APP global no se apaga si otros perfiles la usan.

La aceptación requiere receptor y consumidor efectivos comprobados, un invitado nuevo desde la APP real, `Colombia` y respuestas `Sí` turno a turno esperando cada respuesta del agente, consulta y recibos durables, reanudación dentro del plazo y aislamiento entre dos instalaciones. Se abre el SID exacto desde Sesiones con canal APP, icono móvil e historial propio. Se detiene antes de CRM/agenda/checkout; no se usa arnés de replay LLM. Hasta observar esos resultados, «Continuar sin registro» sigue pendiente y no se declara arreglado.
