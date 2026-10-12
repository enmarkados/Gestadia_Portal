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
