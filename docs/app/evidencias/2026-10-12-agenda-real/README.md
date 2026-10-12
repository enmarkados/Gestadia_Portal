# Agenda real — 12/10/2026

Continuación del [backend desplegado](../2026-10-11-agenda-despliegue/README.md). El usuario confirma literalmente «Sí, solo esta cuenta y conversación durante una hora» para la cuenta de sistemas, la conversación acordada, Portal/LidIA y Zoho Production EU conexión 4. Aporta contacto real y solicita el 13/10/2026 a las 10:00 de Madrid (08:00 UTC). Los datos privados se conservan fuera de Git; no se inventan requisitos de canje ni se reutiliza el escenario ficticio de Playground.

Antes de activar se crea la copia nueva `agenda-activation-20261012`: SQL de 279625 bytes, SHA256 `c83d1cb8e89a4e43d32b4210a52c1b1dc02b792c77f453d01f2e9b4eceda651d`; 45 usuarios, 94 expedientes, 14 documentos y 15 migraciones. Configuración SHA256 `348029ec6790f5f86d9ed04634a6e297e6ba7dbc35e91012248aaf317ac4e3fe`, uploads SHA256 `7d612eb838808d8ddbff599062faeeb5de0c331a6311a9e61fe545a57d8d5d53`. Stack 104: tres procesos terminados con código 0.

Restauración real aislada y sin red en stack 105: mismos recuentos, 24 tablas correctas, salida 0. Configuración, claves y documentos restaurados coinciden byte a byte, salida 0. Se conserva el stack común vigente y su configuración de rollback. La APP recargada mantiene la autenticación y el mismo historial informativo.

![Restauración aislada completada](restore-exited-zero.png)

Estado al registrar esta evidencia: intervalo de una hora todavía sin empezar, permisos Portal/LidIA apagados, copia/preparación LidIA pendiente, ninguna Call real acreditada. Después deben coordinarse la caducidad, activación por cuenta/chat, turno al agente, creación/readback Zoho, recuperación del recibo y reapertura de la misma sesión. La demostración segura Playground del otro chat conserva su alcance separado.

Requisito del usuario para uso real: el agente solicita los datos necesarios de forma sencilla y confirma la hora local; no pregunta la zona horaria como campo técnico. Su implementación en LidIA permanece separada de la autorización operativa recibida.

## Preparación del cierre de permisos

La copia nueva de LidIA está creada; su restauración aislada de 198 tablas, vínculo de cuenta/sesión y 11 mensajes externos sigue pendiente del acceso al servidor. Portainer y Plesk se han comprobado de nuevo y ambos muestran Login. La ventana temporal continúa sin activar y ninguna llamada real está acreditada.

El auxiliar operativo `revoke-and-sync.mjs`, conservado en los artefactos privados, usa la transacción de cuenta existente: valida el origen humano bajo bloqueo, retira exclusivamente ese permiso mediante actualización condicionada y encola el contexto en la misma transacción. Antes de enviarlo comprueba que no haya aparecido otra autorización. El ACK debe devolver exactamente `history` y `sondeo`, la conversación y la revisión vigentes.

Verificación local RED/GREEN de diez escenarios: ACK correcto; permisos CRM adicionales, incompletos o duplicados; cambio de autorización antes del bloqueo, durante la actualización condicionada o después del bloqueo; configuración desactivada; cambio de vínculo después del ACK; retirada repetida. Diez resultados correctos con dobles locales; no es una ejecución contra MySQL ni prueba de retirada en producción. Fuente del auxiliar SHA256 `c0e8cb806743863d987278eea9eba0d1805b76c35ea3cd7f1f4ce65ee29d2dc7`; comando regenerado a partir de esta fuente. La revisión se ha trasladado al equipo LidIA.


## Copias actualizadas y restauración verificadas tras recuperar el acceso

A las 13:12 de Madrid se completa una nueva copia de Portal en un directorio independiente, conservando la anterior: SQL de 291449 bytes, SHA256 `7c108c8691485074257f10b5ad05bcaa916289f462cff4c560cd0f046565bcb2`; mismos 45 usuarios, 94 expedientes, 14 documentos y 15 migraciones. Configuración y documentos mantienen sus hashes anteriores. Stack 107: tres procesos con salida 0; stack 108: restauración SQL y de archivos aisladas, sin red, ambas con salida 0 y comparación correcta.

![Copia reciente de Portal restaurada](fresh-restore-exited-zero.png)

LidIA genera una copia SQL nueva a las 13:11, 1290711503 bytes, SHA256 `a9d35f21d2008b12906b82a367f9f02e4a88f624ec9f9c38063638905467742f`. Runtime SHA256 `baa91c233a7a8ebb2782acc6f1171fc3ce05d8c0a52852585fd03f261bc4fa6d`, configuración SHA256 `abd00800b8bc6bdbed8371f2dbcb3b8610ef9b658847465451c4d6fb26588d2c`; entorno, comando y manifiesto también conservados en el servidor con acceso restringido. La fixture 106 restaura esta copia en tmpfs y sin red: 198 tablas verificadas, vínculo de cuenta/sesión correcto, 11 mensajes APP (2 usuario y 9 asistente), runtime contrastado por manifiesto y configuración/entorno/comando idénticos. Proceso `3b6996c4d470892428683fe66e486e718db5955d0b7ea9125889862ca36709c9` terminado con salida 0.

![Restauración completa de la copia reciente de LidIA](lidia-fresh-restore-pass.png)

El primer comparador exigía además 11 `ChatLogs` y se detuvo con REVIEW REQUIRED; se conserva ese resultado. La traza de `Detail.razor` → `LoadAppSessionForOperatorAsync` → `AppSupportService.ReadAsync` → `AppTimelineService.VisibleMessages` confirma que el detalle común APP proyecta el timeline autorizado, sin cargar ChatLogs. La corrección del auxiliar conserva la expectativa observada del snapshot: 11 mensajes de timeline y cero ChatLogs para esta sesión. No se modifican la copia SQL, el producto ni sus permisos. Revisión independiente de LidIA conforme.

La comprobación de sólo lectura dentro del backend vigente confirma cuenta activa, permiso temporal ausente, contexto `history`/`sondeo`, revisión 1 sincronizada, flag de llamada apagado y contexto de perfil apagado. Se inicia el despliegue de LidIA V1.726 después de estas restauraciones; al registrar este bloque la ventana UTC sigue sin empezar y no se acredita ninguna llamada real.

## Despliegue y previsualización confirmados

LidIA PRO sirve `V1.726-app-crm-temporal`, commit `0d701051bb776c0fb1c13923b0110b509660a4fa`. Contenedor `6f090e1cd2fc1ade4b71f8fb271188edecc7484552650c1bc20fb660fa833751` saludable, creado a las 13:28 de Madrid. La configuración conserva exactamente el hash original y la misma sesión conserva los once mensajes. El error 504 del proxy durante el despliegue se reconcilió con el estado real; no se repitió la operación.

Diagnóstico de solo lectura: proyecto 103, agente 122, entorno PRO; permisos de integración `sondeo`, `history`, `support_handoff`, sin configuración CRM. El flag `PlatformAgentRuntimeEnabled` está ausente y se conserva: gobierna requisitos de aislamiento, no selecciona otro motor de conversación. Las comprobaciones iniciales del auxiliar asumían incorrectamente el flag activo y únicamente dos permisos; se corrigió el auxiliar a partir de este diagnóstico, sin modificar la configuración real.

La previsualización posterior devuelve `preview_only_no_write` y `ROOT_PREVIEW_READONLY_PASS`, con el hash original y sin cambios de claves ni otras integraciones. Propone conservar los tres permisos existentes y añadir exclusivamente `crm_prepare`/`callback_schedule`, con conexión 4 y alcance de cuenta, sesión e intervalo obligatorio. Regresión local `test-real-baseline.py`: preview, apply y restore preservan el permiso de atención humana, las claves, el flag ausente y los bytes originales tras restaurar. El generador de configuración Portal también conserva DB/JWT/SMTP en un entorno temporal y cambia únicamente los dos ajustes de llamada previstos. Son verificaciones de auxiliares, no una activación real.

![Previsualización de solo lectura confirmada](lidia-preview-readonly-pass.png)

La ventana sigue sin iniciar. Pendiente acreditar la asignación legítima de conexión 4 mediante las herramientas del agente antes del turno real. El usuario autoriza coordinar el chat de pruebas móviles: estado técnico y rutas privadas de firma compartidos, sin claves; su caso DEV con gestor se mantiene separado de esta reserva. TestFlight continúa en (11), Play interno en (3); esta continuación no sube ni publica paquetes móviles.


## Ventana real y cierre verificado

La ventana autorizada se ejecuta el 12/10/2026 de 14:50 a 15:50 de Madrid. Se clonan cuatro herramientas del agente original en el proyecto APP, inicialmente inactivas y sin asignación. La activación atómica y su lectura independiente confirman las cuatro asignadas al agente APP y activas; CRM y agenda usan la conexión Zoho EU 4. No se modifica el agente original ni se activan canales Web. Configuración temporal LidIA SHA256 `8ad1a186a864cc6d99dfec27b8e32a049524b4aa96b765dd1e6fc0f6791bd2a2`; conserva permisos originales y exige cuenta, sesión e intervalo exactos.

Portal genera un archivo de entorno temporal y cambia únicamente ese bind en el stack común. La concesión real y su ACK confirman revisión 2 sincronizada con exactamente `history`, `sondeo`, `crm_prepare` y `callback_schedule`. Se envían tres turnos por la misma conversación con los datos autorizados y petición de llamada informativa. La captura rechaza inicialmente «autorizo»; una expresión natural admitida finalmente deja el consentimiento verdadero. El agente devuelve el aviso de registro no verificado. La lectura del estado propio mantiene vínculo CRM y cita confirmada ausentes, sin intentos durables en el ledger hasta la última comprobación de las 15:38. Los tool calls observados incluyen disponibilidad y agenda; no equivalen a una Call creada. **La llamada no está acreditada ni se declara agendada.**

Antes del final de la ventana se ejecuta la retirada canónica en Portal: concesión ausente y ACK de revisión 3 sincronizada, con exactamente `history` y `sondeo`. Se restaura el bind original del stack común. Backend, APP y Portal saludables; lectura independiente posterior confirma cuenta activa, concesión ausente, revisión 3 sincronizada y flags de llamada y contexto de perfil apagados.

![Comprobación independiente posterior al cierre](portal-post-close-readonly-pass.png)

LidIA restaura la configuración original byte a byte, SHA256 `abd00800b8bc6bdbed8371f2dbcb3b8610ef9b658847465451c4d6fb26588d2c`; conserva los tres permisos originales. Se retiran las cuatro asignaciones temporales y las copias quedan inactivas. No se borran mensajes ni expedientes, no se modifica el agente original y no se realizan peticiones CRM durante la retirada. El contenedor vuelve a estar saludable después del reinicio.

Las trazas completas y datos personales permanecen privados. Continúan la corrección local del consentimiento explícito y la investigación del fallo previo a persistir la cita; no se relaja el guard de confirmación ni se inventa un país del carné para seguir el canje antiguo. No se reabre la ventana sin una nueva autorización humana. TestFlight (11) y Play interno (3) permanecen sin nuevas subidas en esta continuación.


## Regresión local de consentimiento tras el cierre

Se prepara en el worktree LidIA una corrección limitada a `CaptureAppContactVariableAsync`: reconoce «autorizo que me llaméis» y variantes explícitas de llamada propia; las negativas prevalecen, también con pronombres y saltos de línea. No acepta un «sí» genérico ni autorización de publicidad o llamada a terceros. La retirada se comprueba partiendo del consentimiento verdadero. Se conserva el control de autoridad y el estado tipado.

RED observado con el pipeline real del Harness: seis fallos en los doce casos iniciales, cuatro en los dieciséis tras añadir pronombres y dos en los dieciocho tras añadir saltos de línea. GREEN final de `AppCrmPreparationTests`: **186/186**, cero fallos y omitidos, salida 0; `git diff --check` correcto. Son pruebas locales, sin CRM remoto; la compilación mantiene avisos existentes de dependencias y código. Fuente productiva comprobada SHA256 `17acd76329fc02c097b39fc96f42481f8441266f2d782030f84bfc648f4c46e0`; prueba SHA256 `6c2c48b52a9d7d44046774fd92079f02f5b1d5146b5e3712c140311750184152`. Entrega al equipo LidIA para revisión e integración, todavía sin commit funcional ni despliegue en esta evidencia. La causa precisa del fallo posterior de agenda sigue en investigación; no se acredita la llamada.


## Revisión ampliada y límite real de los registros

La revisión posterior detecta dos huecos que no cubría el grupo anterior: un consentimiento previo verdadero sobrevivía a una negativa si el modelo proponía verdadero, y la agenda directa podía usar ese estado sin capturar otra variable. Se reproducen cuatro fallos y un control correcto. LidIA retira el consentimiento al admitir la negativa antes del modelo y lo comprueba de nuevo al preparar CRM para llamada, normalizar agenda y capturar una propuesta contradictoria. Revisión del diff conforme; el equipo confirma **196/196** pruebas CRM/Core/marcador, cero fallos y omitidos, Release sin errores con los 172 avisos existentes. PR 1646 integrada en `dev/IA/main`, commit `067ec1cdc`; esto todavía no acredita desplegar ni reservar. Los hashes y 186 pruebas anteriores conservan su alcance de revisión previa.

El lector privado se revisa, corrige para redactar valores ajenos a booleanos y preservar utilidades e informes anteriores, y se ejecuta una sola vez. Script SHA256 `30e7e734c81c9b337b7119ed12d1d2b9f95b48660d7ce813f75f75b8daeabde3`, archivo comprimido/base64 SHA256 `a1f8beb82d6c476b5f5f64e8d3122e7c1169488f419642bc237de40e8bd9ad27`, DLL SHA256 `7085f14ce5e37a7e47f73de17cd4fb5e8091a59f41a2d712015819d1d2254031`. Su fixture puro pasa localmente antes de subirlo; el script comprueba los tres binarios y repite la fixture antes de las consultas SELECT. No consulta tokens, no escribe DB y no hace HTTP CRM. Informe nuevo en el directorio privado, sin sobrescribir el anterior.

Lectura agregada del informe existente: vínculo de cuenta/sesión correcto; **10** registros de proveedor, solicitudes de **112–113** caracteres y JSON válido en los diez; sin outputs de herramientas ni definiciones completas retenidos; vínculo CRM y cita confirmada ausentes, ledger vacío. La traza de `AnthropicChatBackend.Record` → `BuildRawRequestSummary` confirma que se guarda únicamente modelo, parámetros y recuentos: no es truncado ni demuestra ausencia de herramientas ejecutadas. Las respuestas sí registran sus llamadas; el error exacto de agenda no puede recuperarse de estos resúmenes.

![Resumen independiente de los registros conservados](payload-retained-readback-summary.png)

Dependencia pendiente: no hay evidencia de metadata Zoho que acredite la existencia y unicidad de `LidIA_App_Owner_Key` en Leads/Contacts de conexión 4. El valor temporal `UniqueOwnerKeyConfirmed=true` del auxiliar no acredita esa propiedad. La configuración original está restaurada y no se cambia esquema ni mapeo. Antes de una nueva ventana se prepara trazabilidad segura de errores de herramientas en un volumen privado persistente y debe validarse el campo/conexión. La causa exacta y la llamada real siguen pendientes.


## Metadata administrativa y siguiente despliegue preparado

La aprobación de una hora limita los permisos de contacto/agenda de la cuenta APP; no cierra la preparación administrativa de esquema con acceso existente. En `/admin/settings/crm-mapping`, la opción de producción se verifica como conexión 4. Se usa exclusivamente «Obtener Campos», sin guardar mapeos: Contacts devuelve 153 campos y Leads 171, con campos estándar y `LidIA_App_Owner_Key` exacto en ambos. Esto acredita existencia; la UI descarta las propiedades `unique` y `length`, por lo que no acredita unicidad. No se consultan registros de clientes ni se amplía OAuth.

LidIA prepara V1.728: rechazos de captura, fecha, preparación y referencia CRM dejan códigos seguros en `App_Data/logs/app-tools-.txt`, sobre el volumen privado persistente, con siete ficheros de un MiB y sin argumentos/texto de cliente. Equipo confirma 199/199 y Release NET8 sin errores (174 avisos existentes), PRO integrada en `8bab2547d9b7ffb73e7c76ffaa8032ce9aee419a`. Nueva copia pre727 con 198 tablas, SQL de 1289559563 bytes, runtime de 42779133 bytes, configuración original y siete hashes verificados. **Runtime observado continúa V1.726; el despliegue aún no se ha ejecutado.**

La lectura por SID del ledger confirma solamente el ámbito de agenda: el ledger de alta Lead usa `crm-owner:` y el hash del namespace/proyecto/entorno/cuenta. No acredita cero efectos Lead. Se prepara y revisa una lectura adicional exclusiva de ese owner/conn4, sin HTTP CRM ni consultas de tokens. Al pulsar Connect la sesión de Portainer caduca; resultado de esa ejecución **desconocido**, pendiente de reconciliar directorio/proceso/informe antes de repetir. Un único inicio de sesión con las credenciales existentes del navegador falla; se solicita una recuperación humana en este chat y se avisa al equipo para no duplicarla ni desplegar.

El helper privado `AppCrmMetadataReadback` está preparado localmente con SDK8: build sin errores, fixture de proyección/redacción/HTTP GET exclusivo correcta, sin DB ni red. La fuente bloquea `SaveChanges` y solicitudes distintas del GET fijo de metadata Leads/Contacts; no arranca Host ni Seeder. Su paquete conserva informes previos y exige hashes de las bibliotecas servidas. Todavía no se ha ejecutado en servidor ni acredita propiedades de los campos. Contacto/agenda siguen cerrados y la llamada real no está confirmada.

## Acceso recuperado y ledger de contacto reconciliado

El usuario confirma el inicio de sesión y se recupera Portainer con el usuario existente. La comprobación previa encuentra ausentes tanto el directorio del lector como su informe y cero procesos del auxiliar exacto; por tanto la operación incierta anterior no llegó a dejar una ejecución. Se ejecuta una sola vez el paquete revisado: script SHA256 `6db083e2384a86b0030311f42bddfe81f4450e0a25d09494f3ea2e4341baffac`, transporte comprimido/base64 `ab706efc010044e045c0258f44d5afc6cf173a0d82a7083cbf371941ac4cbda9`, DLL `f99cad9c2b698c8f1a52db72222e43b518635fada720fb49bf06560265397629`. El informe nuevo acredita `owned_session_read_only`, `owner_ledger=[]`, vínculo CRM y cita confirmada ausentes, sin escritura DB, HTTP CRM ni consulta de tokens. La lectura queda completada; el ledger vacío de ese owner/conexión tampoco acredita por sí solo la ausencia de cualquier registro en Zoho.

![Lectura del ledger de contacto completada](owner-ledger-readonly-done.png)

La revisión independiente del paquete final de metadata verifica los tres binarios y los hashes de fuente/transporte. Fixture y preflight nativo pasan con el DLL final: construyen configuración, modelo EF y servicio Zoho, bloquean las cuatro variantes de SaveChanges y no ejecutan SQL ni HTTP. El script exige repetir ambas comprobaciones contra las bibliotecas reales y sus seis hashes antes de consultar metadata. Todavía no se ha ejecutado en servidor.

Se cede Portainer al equipo LidIA para comprobar la restauración de la copia SQL reciente antes del único despliegue autorizado de V1.728. La recuperación del acceso no renueva la ventana CRM de la cuenta APP. Permisos cerrados, sin nueva subida móvil ni llamada acreditada.

## Restauración reciente antes de V1.728

La sesión de Portainer del equipo está aislada; la operación se realiza en este chat, sin pedir otro inicio de sesión. La primera fixture, stack 110, termina con salida 1 antes de importar SQL: el verificador llevaba mal transcrito el hash del runtime, con 63 caracteres. Se conserva esa evidencia y el verificador original; no se despliega producción. La lectura independiente de los archivos reales confirma SQL SHA256 `63e10fff7cec4103bfd18ee99f319b494cf745b756083e298c04c67f40a48e87`, runtime `ae47ab8dce4f83da7baaf34662595277c830172e39a186227b5cb942ed30a3c1` y configuración original `abd00800b8bc6bdbed8371f2dbcb3b8610ef9b658847465451c4d6fb26588d2c`.

La revisión nueva corrige únicamente ese pin y añade un marcador explícito tras comprobar los hashes. Los tres pins tienen 64 caracteres hexadecimales, Compose valida la configuración y la revisión independiente confirma el diff. YAML SHA256 `f991c1be5421452de1711541e4ecbd4231344f545d040c5603dc98e46146a2ad`.

Stack 111, contenedor `55a4bc5a2ccdf23f4f9decf8ad78db5f22062e8776fff044c19969a828f21d2f`: restauración aislada de la copia pre727 reciente completada el 12/10 de 18:38:21 a 18:39:38 de Madrid, **salida 0**. SQL RESTORE PASS: 198 tablas, vínculo 1, 19 mensajes externos (14 asistente y 5 usuario), ChatLogs 0. FILES RESTORE PASS: runtime contrastado por manifiesto y configuración, entorno y comando idénticos. Sin red, puertos ni aplicación en esa fixture.

![Restauración de la copia reciente completada](lidia-pre728-fresh-restore-pass.png)

Después de ese resultado se inicia una única actualización Git de stack 26, con la rama `produccion/gestadia` verificada en `8bab2547d9b7ffb73e7c76ffaa8032ce9aee419a`. Este registro de inicio no acredita por sí solo el nuevo runtime servido. No se modifican los permisos temporales ni las herramientas del agente.

## V1.728 servida y unicidad CRM comprobada

La única actualización devuelve un 504 al navegador y, durante la reconciliación, el archivo Compose aparece temporalmente inaccesible. No se repite Pull. Después de esperar y recargar, stack 26 muestra `8bab2547d9b7ffb73e7c76ffaa8032ce9aee419a`, contenedor nuevo `26d8088243ffe855abaa26284a22a3a15a6604f47252efd4d2c7c3aca0e8b071` saludable y el sitio sirve `V1.728-app-diagnostico`. La configuración original conserva SHA256 `abd00800b8bc6bdbed8371f2dbcb3b8610ef9b658847465451c4d6fb26588d2c`.

El helper administrativo final se ejecuta una vez tras comprobar directorio e informe ausentes. Los seis hashes de dependencias servidas, fixture y preflight nativo pasan en el contenedor nuevo. Dos GET de metadata confirman el campo exacto en Leads (171 campos) y Contacts (153): texto, longitud 64, sin flags de sólo lectura. La proyección inicial no interpreta `casesensitive` como texto y conserva null; ese primer informe permanece intacto.

La [documentación oficial V2 de Zoho](https://www.zoho.com/crm/developer/docs/api/v2/field-meta.html) ejemplifica `unique.casesensitive` con la cadena `"0"`. Revisión R2 limitada a la proyección y sus fixtures: normaliza exclusivamente booleanos y cadenas `0`, `1`, `true`, `false`; informa número, nombres y tipo de propiedades sin copiar valores arbitrarios. Diez formas de metadata se comprueban antes y después del cambio. Fixture y preflight con el DLL publicado pasan localmente desde el directorio previsto; los primeros comandos desde otro CWD o con un argumento local no admitido fallaron y no ejecutaron SQL ni HTTP. Script SHA256 `07382ab859fe76685a2608025c336b7894bd2887f64174a5fddb615b652349b5`, transporte `062788f834af598602a5712a668c13168633d34b636b32057bb7cc81aefacf6f`, DLL `9808ff2468432774ab479b9107df00878f8914ae52699de2ed694e534e697e2b`.

Lectura real R2 del 12/10 a las 16:54:04 UTC, tras hashes, fixture y preflight contra `/app`: ambos módulos devuelven `unique` con una propiedad `casesensitive`, de tipo cadena, normalizada a false. Se acredita la unicidad configurada en ambos campos, sin distinción de mayúsculas, con la misma longitud 64. Informe nuevo SHA256 `1c530dbeba196045fc04b9ec5b5c12d8d0fdc67de03ebe2dde6019bad1d0024c`. Dos GET, cero registros CRM consultados, cero escrituras DB, cero POST OAuth y permisos APP intactos. No se guardan mapeos ni se modifica el esquema de Zoho.

![Metadata real del campo único en ambos módulos](metadata-r2-real-unique-conn4.png)

La hora anterior sigue cerrada. Se preparan nuevas copias de Portal/LidIA y una ventana revisable con V1.728 antes de solicitar una nueva autorización de una hora. **La llamada real sigue sin reservarse.**

## Copias y previsualización de la segunda prueba

Portal, copia nueva del 12/10 a las 16:56:05 UTC: SQL 298263 bytes, SHA256 `1c8a9fbfa103dbf30fdce70df2afe7e30d94ac955e3ae31060999ea53a639228`, 45 usuarios, 94 expedientes, 14 documentos y 15 migraciones. Stack 112 termina sus tres procesos con salida 0. Stack 113 restaura SQL sin red/eventos: 24 tablas correctas y los mismos recuentos; configuración, claves y documentos coinciden byte a byte. Ambos procesos de restauración terminan con salida 0.

LidIA, copia SQL nueva `manual_20261012_165647.sql`, terminada a las 16:57:11 UTC, conservada junto al runtime V1.728, configuración, entorno y comando. Siete hashes, tar y comparaciones correctos; permisos 700/600, UID 1654. La primera fixture de esta copia, stack 114, se detiene antes de importar por otro error de transcripción visual del hash SQL. Se conservan el intento y sus valores. Para eliminar esa fuente de error, stack 115 audita la copia en modo lectura y sin red: siete OK, salida 0 y hashes obtenidos de los logs de texto mediante extracción automática.

Valores exactos del texto real: SQL 1290700177 bytes, SHA256 `f2d888d433c5c24f2dae49bba3e68b740728929d0682a0e16a00fe69a4fd0d42`; runtime 42788484 bytes, SHA256 `074d7f6f986bd388137fa42489d5dbcd0f8bae91585617dbdf5bebd94bd94c83`; configuración original SHA256 `abd00800b8bc6bdbed8371f2dbcb3b8610ef9b658847465451c4d6fb26588d2c`. El nuevo YAML cambia exclusivamente el pin SQL desde ese texto, conserva el anterior y pasa revisión/Compose; SHA256 `e62c674491e589bc77ae997393887373444fa004dad258b71800c0006101f3aa`.

Stack 116, contenedor `bc4fb730ce7dff34ba454b9a5038ba64b227e908e9b45ad3a1ca0168ac265504`: **restauración real terminada con salida 0**, 198 tablas, vínculo 1, 19 mensajes (14 asistente y 5 usuario), ChatLogs 0; runtime verificado y configuración, entorno y comando idénticos. Sin red, puertos ni aplicación en la fixture.

![Restauración de la copia V1.728 completada](lidia-phase2-restore-r2-pass.png)

Editor privado V1.728 subido una vez a un directorio nuevo, sin ejecutar apply: DLL SHA256 `133725a406d0ebdf7f42cc96dd259c5f9b703a2af000a71eaafcb58e0a93a9b5`. La previsualización devuelve `preview_only_no_write`, fuente original, sin cambios de claves ni otras integraciones. La lectura administrativa de conexión 4 verifica literalmente Provider `Zoho CRM`, Environment `Production`, IsActive true. Se descarta esa posible discrepancia de entorno, sin atribuirle el fallo anterior. La propuesta incluye CRM y agenda ligados a un alcance válido; todavía no está aplicada.

El generador Portal nuevo conserva la evidencia anterior y usa otro archivo de entorno. Revisión local y del equipo: YAML con saltos reales, sólo dos flags sustituidos, resto del entorno preservado y archivo 600; el argumento de ejecución mantiene literalmente `db.$disconnect()` mediante comillas POSIX, probado con un stub sin Prisma/DB/red. Caducidad y referencia humana definitivas quedan pendientes de aprobación; no se genera ni ejecuta una concesión real en estas comprobaciones.

La APP conserva la sesión autenticada y el mismo historial al recargar. Queda comprobar las cuatro copias de herramientas y formular una única renovación humana de una hora. **Permisos cerrados; llamada aún no agendada.**

## Preparación cerrada y renovación humana pendiente

La UI de Tools lista sólo herramientas activas y no permite acreditar por sí sola las cuatro copias inactivas. Se revisa y ejecuta una vez un lector administrativo mínimo, sin modificar el editor: SELECT fijo de IDs 10368–10371 dentro del proyecto 103, estado, conexión y recuento de asociaciones; no lee contactos ni tokens y no hace HTTP. Snapshot original verificado por SHA256 `d2a3ff56c079c0c86acf1ca843a178fa11d6b720512986492c235950ed50919a`; DLL del lector `5131d1134309dfe0367ce99081f870a0cbe3bd42b0f84ef68e25b524bee94ce7`, paquete `69b17c2bf3710b586650e28aa3c7aee5bc7fb6f87c86d017daeaa72709466cae`. Directorio/informe nuevos, sin sobrescritura.

Resultado real: las cuatro copias existen, están inactivas, no son globales y tienen cero asociaciones al agente APP o a cualquier otro. Tres usan conexión 4; el comprobador de país conserva conexión null. Informe `tool_metadata_read_only`, `ready_for_future_activation=true`, sin escritura DB, HTTP CRM, consulta de tokens ni de contactos.

![Herramientas preparadas e inactivas](tool-status728-ready-inactive.png)

Con runtime V1.728 servido, copias/restauraciones completas, metadata y entorno Zoho acreditados, previsualización y herramientas verificadas, se presenta **una única pregunta humana** para renovar una hora, exclusivamente en la misma cuenta/conversación y conexión 4. La petición conserva los datos y horario reales ya aportados, sin pedir país del carné. La ventana nueva todavía no empieza: pendiente de respuesta; no se aplica configuración ni se activan herramientas o concesiones por iniciativa propia. **La llamada continúa sin agendar.**
