# Continuación real del 13/10

Esta revisión sustituye el estado pendiente anterior sólo en los puntos expresamente observados. Las copias originales privadas permanecen fuera de Git.

La conciliación R5 real (2938 B, SHA345997ff9bedbb7a3e2aa89e0227f37a004dae31dc8be8b96948d9d893f8dadf) observa cero proyectos/agentes/instrucciones con los predicados propios. Los marcadores ready/ok/unknown/readback están ausentes; las preimágenes y configuración coinciden con el preview. Snapshot RO/RR, 198 tablas, 260 migraciones y cleanup correctos. Esto acredita ausencia actual, no un rollback histórico ni permiso para repetir R5.

R6 tiene un preview nuevo de 5937 B/SHA479f78f18c973e4640126c118fadf2263d7ca655f7b13b7cb4be76d286d66eb2. Cambian schema y hash de mapping: QA reproduce ambos hashes con el mapper real y demuestra que la única diferencia semántica del mapping es CreatedBy R6. Configuración, preimágenes y defaults coinciden. 47 pruebas Source más una comprobación propia pasan en copia privada.

Después de un apply y readback real, QA coteja originales:

| Original | Bytes | SHA256 |
|---|---:|---|
| commit.ready | 80592 | 4ed2e165c73faebbc7a5da42740dc9e8894bdead92b4a1cef753f8532b881e14 |
| commit.ok | 138 | 4f42ea3934efa7ba0658d36cf493b1c0bd9434d5fb468c7f9cde34c5f6c2b755 |
| readback | 4257 | 56c27f85020e4ea39c34302b7038c9d13a4db427285adca566a541f2219a69cf |

Los IDs observados son Project104/Agent124/Instruction10117, todos inactivos y con FK correctas. El hash de resultado a714293a19d36451c1777cea8614d899a1c11d56edfa7bc19c0ab97b2c264776 coincide en los tres documentos. Originales protegidos intactos y APP apagada. No se publica el ready completo: contiene la instrucción literal.

CountryR3 corrige la misma reutilización de nodos en la cadena completa. QA reproduce 33 pruebas y coteja 38 originales, cuatro entradas de transporte y siete scripts. La definición y nueve archivos del núcleo permanecen idénticos a R2. El adapter real de 1182 B/SHA2cbf5dcaee6f9ad165b2b58991a6deeffea2d899136cb96f321e4ea722cdaafb está ligado a siete originales comprobados: importación, resultado, backup, restore, fuente y definición. Conforme stage/preflight y nuevo preview RO; apply y activación aún requieren sus resultados reales.

## iOS y disponibilidad local

El Mac vuelve a permitir control. La API3005 se reinicia con integraciones externas apagadas; User64 sigue activo y verificado. La carpeta del simulador2AC anterior ya no existe. Se crea exclusivamente Gestadia QA 2026-10-13, UUID74549F1F-F57C-41F6-BC25-38A3EB948D93, y se instala el bundle QA build11/fuente344.

El primer arranque informa timeout4002 de Device Hub y tarda en mostrar la pantalla. La pantalla termina conectando; QA verifica Home y entra con la credencial propia desde la UI. Perfil muestra Cliente Prueba119. Capture Keyboard queda activado durante la entrada, se verifica su indicador y se desactiva después. No se resetea la entrada ni se elude un bloqueo. Historial aún devuelve error con S2S apagado: login no acredita conversación real.

[Captura real del perfil en iOS](ios-20261013-perfil-build11.jpg), tomada en el simulador745 a las15:29 locales del13/10. Corresponde al bundle344/build11 anterior al parche guest; no acredita la interfaz nueva ni conexión al agente.

Docker muestra Engine running y MySQL59094 responde; Prisma revalida la cuenta. La API Docker agota seis segundos incluso con el socket Unix explícito. La suite guest que exige gestadia_app_test se detiene por su guard antes de BD; no se ejecuta sobre la base durable ni se degrada el guard. La prueba aislada completa queda pendiente de Docker; las regresiones HTTP del router no necesitan BD.

## Acceso sin registro: corrección preparada

Ops observa públicamente404 en el endpoint guest y confirma por lectura administrativa que v2/guest/integración/destino v2 están apagados. La plantilla APP omite las rutas guest. QA reproduce además el error local: AppProblem503/401 termina convertido en500 por el handler global, y la pantalla atribuye indisponibilidad a la conexión del usuario.

La corrección mantiene el formatter de problemas existente en el router guest, explica indisponibilidad conservando origen/intento/elección y añade al proxy únicamente las rutas consumidas, con estructura UUID8-4-4-4-12. La autenticación y propiedad siguen en backend, la API genérica sigue cerrada y no se habilita ningún flag. Regresiones RED→GREEN: cuatro checks de router/proxy y el recorrido de la pantalla; la suite AppConversation completa pasa39 y la APP compila. Node25 requiere desactivar su WebStorage experimental sólo en el proceso de tests, como hace el harness existente.

No se da por resuelto el acceso anónimo real: faltan despliegue/configuración revisados, conexión al agente y ciclo de visitante completo. Tampoco se acredita conversación de gestor, Android conectado o instalación física nueva.

El parche se publica como c6530f6a20a134feb96de7bb15b9f89ee4af6975. QA coteja los dos contextos Docker preparados por Ops: todos los archivos del contexto original son idénticos; sólo se añade el Dockerfile raíz con ese VCS_REF. El producto coincide con la integración58cf037, y frente al backend0af593f sólo cambia el parche guest. Las imágenes y su Nginx-t todavía no están observados.

La [copia y restauración Portal para guest](portal-guest-restore-20261013.json) queda revisada en sus logs originales: SQL303886 B, ocho recuentos iguales, 24 tablas correctas y configuración/claves/documentos recuperados byte a byte en aislamiento. Ops informa exit0 en stack151. No se restaura producción ni se activa el canal por esta comprobación.

Android conserva el AVD propio y sus datos. Con adb sin dispositivos conectados, se ajusta su RAM persistente de2G a4096MB y se conserva la preimagen privada; mantiene cuatro núcleos. No se arranca todavía el ciclo Android. Las21 comprobaciones de los guards privados de identidad/CRM pasan; no son llamadas externas ni permisos activos.

### Despliegue posterior observado

Ops construye ambas imágenesc653 y valida Nginx con el entrypoint y la configuración pública reales, en un contenedor sin red. QA lee el log original con syntaxOK/testsuccessful y coteja la preimagen del stack: sólo cambian las dos imágenes APP/API, conservando Portal, ENV y mounts. Ops comunica tres contenedores sanos tras el corte; QA confirma directamente build-info200 con revisiónc653 completa, healthz200 y guest503 con formato problem/code runtime_unavailable. Este estado sustituye el despliegue pendiente descrito arriba; guest sigue apagado.

La lectura original de LidIA de3702B/SHA7ceaa079ff3725466d1569bccddff89c53939d7b1079843b73ef082db7dbfd05 confirma122/103 activos y cero funciones asignadas. Country10364 sólo pertenece al119/102. Una función ausente no se acredita con el saludo o con las pruebas del protocolo. Tras detectar además conflicto con los guards reservados a Main, Source/Ops/QA eligen preparar proyecto/agente guest propios; no se ejecuta la alternativa de reutilizar Country deMain. El overlay y las copias siguen pendientes de revisión y recibos reales.

AppConfigurationMetadataRead tiene revisión independiente:21 hashes originales,15 pruebas en copia privada, tres scripts y15 archivos de payload cotejados. La variante de transporte de Ops cambia sólo el salto de línea de base64 y conserva el payload. Conforme stage/preflight; aún sin observación efectiva del DTO del servidor. No consulta BD, HTTP o Host ni publica secretos.

La API local3005 ya arranca con el guard fuerte R2 antes de construir los clientes, usando una copia idéntica del scope pendiente/OFF. Sigue sin claves o autoridad DEV activas. Health200 y el rechazo guest503 están observados; no se sustituye la prueba del agente por ese rechazo correcto.

### Configuración PRO efectiva y restauración nueva

El transporte definitivo del lector usa una imagen con el script Source exacto, propietario1654 y CMD vacío; el stage153 termina exit0. QA conserva el log original1424B/SHA2bea101eaba5292a1a64b31f061214ab2a576507411a3b9acd3641506bf9aecf:14 pins nativos, payload y15 archivos correctos, preflight nativo PASS. La imagen anterior con COPY sin propietario no se ejecutó. La lectura posterior se hace dentro del contenedor PRO con su ENV real.

El DTO original3150B/SHA4ba1ecf781cc27331468625f18a49ba3dd57688cd0342779a44a2e20678883db, observado a14:18:26Z, confirma DLL3ba/configABD estables y APP efectiva/file/ENV activas. Hay dos perfiles v1: Main103/122 con sondeo/history/support_handoff, una ruta support, PlatformRuntimefalse; y agent119-validation102/119 con sondeo/history, cero rutas y PlatformRuntimetrue. Ambos tienen GuestV2false/Crmnull; suman11 claves PRO existentes. No son las11 claves DEV pendientes y se deben preservar los dos perfiles al añadir guest. Sólo existe overrideENV deEnabled. La lectura no consulta DB/HTTP ni escribe configuración; RuntimeIsolationVerified leído no constituye prueba de aislamiento.

La copia PRO nueva contiene SQL1307110118B/SHA6350a044171c727494932a6489f1cd84e173db25d225b14423973aaa924f1aca y runtime42788484B/SHA074d7f6f986bd388137fa42489d5dbcd0f8bae91585617dbdf5bebd94bd94c83. QA coteja manifest original575B/SHA1332782179464e67c440c431e2889ca79e6847971abfcf79f097b75d0fbfc318 y restore original713B/SHAb1450806a92ab0aa777e903dc5bf26421fc1259ce5e99406e60e99f9163965a9. Restore155 exit0:198 tablas, mappingMain1, timeline21(15assistant/6user), ChatLogs0 observados y archivos/config/ENV/comando iguales. Es restauración aislada de esa copia, no comparación del historial live ni activación DEV.

Source/Ops/QA aceptan preparar cuatro copias guest PRO inactivas y un join propios, mediante la propuestaR2 cc947433162e73dcec4804030f7899616b03a73b4e3de93a88551d85d4253886. Su paquete, preview, apply, cuatro flags y overlay aún están pendientes. La revisión Main b15d5ffeddd34481c8faaf8c33a2662a75a0b16cf7d198e8262a066b170fd257 limita la adaptación posterior a una baselineCFG real nueva, conservando guards y restauración condicional con guest; no genera hora, aprobación o grant. Ninguno de estos resultados PRO sustituye CountryR3/flags/dominio/autoridad propios de DEV124, ni el ciclo real de gestor en ambos emuladores.

El ensayo nuevo156 añade únicamente la consulta y comprobación de260 filas en __EFMigrationsHistory dentro de la base restaurada aislada. QA revisa el delta y el original748B/SHA2f9a348cd2a5cbd2ff401a2a34ac46603f186a0c302d2eb785588e9103c6957d: EF_HISTORY_RESTORE_COUNT_PASS260,198 tablas, historial y archivos correctos. Este original acredita el conteo EF restaurado;155 y el conteo live de un preview no lo sustituyen. Source aún corrige el cierre de comandos del ejecutor antes de congelar el paquete; no se ejecuta una copia guest o una activación por estos resultados.

### Country DEV y paquete guest congelado

CountryR3 tiene preflight nativo real en DEV: la captura original muestra DLL/payload/helper/definición correctos y las cuatro sobrecargas de Save bloqueadas, sin DB/HTTP. Ops confirma transporte CreateNew600 de los tres originales ready4ed2/readback56c2/adapter2cbf. Conforme preview RO siguiente; aún sin resultado original revisado, función/join aplicados, flags activos o S2S listo para la APP.

ProGuestLiteralClone R2 queda congelado y revisado: manifest594550aceb903588c9e2c2d65193577ba8a34219c3327795963bea7e74454770, guía84b2aad470c19f0d94ab08ce62223f3ab582258064c77e416a98528620502c66, helper7fcc70cee5059ce036ce5c4d6b16ea34ed6af75fb5af2d00097c969df2998085. QA lee los seis archivos de código, tests y contrato; verifica44 originales, diez scripts, cuatro archivos de payload600 y transporte exacto. En copia privada se reproducen56PASS/FAILURES0; warnings conocidos de referencias EF8/10, sin errores. Adapter real1172B/a15fe862d34078d44d47f2d9883e967990f6374927096983e2f490a516eec8cf ligado a backup/restore/EF reales. Conforme sólo stage/preflight; preview privada y revisión posterior siguen exigidas antes de escribir las cuatro copias. La prueba local no acredita servidoPRO ni ciclo nativo.

## Coordinación Main separada

QA revisa el lector administrativo Main (26 hashes/76 assertions), helper de asociación R3 (29 hashes/76 pruebas) y generador de ventana (8 hashes/32 pruebas) en copias privadas. Conformes preparación/preflight/lecturas previstas; no grants, correlación o llamada por estos checks. Main mantiene sus propios IDs y no se incorpora al fixture nativo User64.

Portal prepare-activation vigente SHA65db149f0c1c7582a81af98c4f88ae19c1a1b7b21f0ad7e30c179cf99e37f985 comprueba el binding exacto antes del servicio. Revoke-and-sync SHA62210484f974ee1b65006d1e3799332f507e8f0ca196c52495056a520f6e9d9e exige la referencia humana actual, CAS y ACK de retirada de permisos. La confirmación humana de una nueva ventana está pendiente en la tarea de operaciones. No se activa desde esta revisión.

### Llamada Main ejecutada y cierre comprobado

La confirmación humana posterior autoriza una ventana del13/10 de15:29 a16:29UTC para Main. Ops ejecuta una única asociación temporal; la APP web envía un turno real y recibe confirmación de llamada para el14/10 a08:30Europe/Madrid, equivalente a06:30UTC. Source contrasta el original nativo privado de17755B/SHA27bdd316d5785da414485d7b70be67930620a832ef857e8422fa29298b882904: ledger confirmado, un intento y lectura Zoho verificada; abre desde Sesiones el mismo historial y su confirmación. Se atribuyen esa lectura y la observación de Sesiones al equipo fuente, sin convertirlas en pruebas de esta cuenta nativa.

QA lee personalmente el ACK original de352B/600/SHA2b4bf17696a2b757c7d1046caf543bb2e55c0178ec8226c5decfd4e3ee4ffa34. Coinciden cuenta, conversación, sesión remota e integración Main: admitted, revision7=syncedRevision7 y permisos exactamente history/sondeo. Es el export original del visor Portainer en formato clave=valor, no un JSON HTTP reconstruido.

Los siete originales de cierre nuevos, conservados600, confirman configuración ABD restaurada; cuatro herramientas inactivas y sin asignaciones; agente122 con cero funciones asignadas; rollback CRM verified_rolled_back observado a16:10:50UTC y autorización administrativa revocada. La lectura final nueva de3702B/SHA7ceaa coincide byte a byte con la preimagen; no se reutiliza el archivo antiguo como prueba. [Resultado saneado y hashes](main-closure-20261013-review.json). La llamada y el historial se conservan. La ventana está cerrada antes de su caducidad.

Main pertenece a otra cuenta y conversación. Este resultado no acredita la consulta DEV de User64, el chat bidireccional con Integraciones, iOS, Android ni una instalación física nueva. El equipo de operación retoma Country DEV tras este cierre; preview original, aplicación inactiva, activación propia, autoridad y relación CRM aún son necesarios.

### Paquetes nativos actuales preparados

Se compila la fuente27c8b4ae34b97cfdf67aa5ea0e290f07a944cbdf, cuyo producto incluye el parchec653. Vite APP, sync Capacitor, Build & Run iOS y assembleDebug Android pasan. Se verifica el manifiesto empaquetado y se conserva una copia privada de ambos binarios. iOS sigue0.1.0/build11; Android0.1.0/versionCode4. Estos números no cambian por la compilación local y no identifican una nueva publicación.

iOS arranca en el simulador propio745 con API loopback3005 y la cuenta QA conservada. La [captura nueva de Home](ios-20261013-fuente27-home.jpg) muestra el error recuperable de historial mientras S2S está apagado. [Manifiestos de compilación](native-source27-builds.json). Android está compilado, aún sin un nuevo arranque observado. El paquete físico anterior no se instala ni se usa como prueba de esta fuente.

Al seleccionar Device Hub después de compilar, Cua informa que el Mac está bloqueado y no puede desbloquearlo automáticamente. Se pide al humano desbloquearlo; no se elude la protección. La revisión por archivos continúa, pero la interacción nativa queda pendiente.

### Transporte privado CMS R2

QA revisa decrypt R2 completo, sus nueve archivos y hashes, y reproduce el fixture de74B/SHA611df5cf bajo PYTHONOPTIMIZE=1. Guardas explícitas, salida600 exclusiva y rechazos por overwrite, hash raw/cipher/cert alterados o metadata duplicada pasan. La clave privada permanece sólo en Source. Manifiesto3e5b69f29b0a0611d36993384e7fbba357bb937cfb309c6e230f285c7f519a84; decrypt36d0eb5d8e0383865b7b130c9fbe84cc7d6d60ea0c8752ffeaf9faef277601aa. Esta reproducción local no acredita interoperabilidad del servidor, preview remoto, copia guest o activación.

La revisión posterior del overlay guest reproduce52 pruebas sin fallos, coteja30 originales del manifest74d313, dieciséis miembros600 y transporte/shell exactos. Se leen los siete archivos de código, recibos, fases y adenda. Conforme stage/preflight y preview RO; sin los seis recibos reales revisados no se procede a prepare/install, y una activación pública exige su revisión y autorización concretas. No ejecuta llamadas ni sustituye la preparación DEV.

### Country DEV aplicado y lectura posterior

Ops aplica una única función y relación propias; QA recupera los tres originales600 y reproduce ocho cotejos canónicos independientes con .NET. Función10366 inactiva y relación con124; sólo se añaden Id/CreatedAt al candidato, literales y endpoint exactos, coreR6/protegidos/globals/configuración iguales a la preimagen, resultado23cc común en ready/ok/readback. [Revisión y hashes](country-r3-applied-review.json). Este resultado sustituye el apply pendiente anterior; no activa las cuatro filas ni APP/S2S. El paquete de activación mínima y la comprobación del receptor DEV siguen en preparación.

### Android actual: acceso y recuperación observados

Se detiene únicamente el simulador iOS propio para probar Android por separado. AVD Gestadia_Native_QA_20261012 con4GB/cuatro núcleos, instalación fuente27/versionCode4 correcta y arranque real. La primera lectura UI devuelve rootnull; tras enfocar el WebView y repetir se obtiene el árbol completo. Los taps posteriores usan sus bounds, sin inferir éxito desde el comando.

Nueva consulta como visitante ofrece Login/Continuar sin registro. Continuar recibe la indisponibilidad esperada con guestOFF, mantiene opciones y permite ir al acceso conservando el origen. Correo coincide con el fixture y contraseña queda enmascarada32 caracteres; al enviar se vuelve a la entrada de la misma consulta. AuthSession propia android creada16:47:38UTC. Force-stop/reinicio conserva cuenta y el menú muestra Cliente Prueba119. [Resultado saneado](android-source27-preflight.json) y [captura nueva de cuenta recuperada](android-20261013-cuenta-recuperada.png). Sin turno remoto, chat de gestor o instalación física nueva.

La captura de teclado de Device Hub queda nuevamente comprobada en iOS fuente27: activada en ventana propia, texto visible en el campo y desactivada al terminar. Los taps del espejo y el estilo simulator del helper devolvían éxito sin navegar; el estilo physical del helper oficial sí abre Nueva y retorna con Atrás, verificado por capturas. No se modifica autenticación ni protección del Mac. El usuario confirma el desbloqueo posterior.

### Fixture CMS del servidor comprobado

Paquete real1254B/600/SHA3df5af259184b9ee884c5eb6a18236e0ed62cf7ba673f7f46975a01760840f75, producido por OpenSSL3.0.20 del receptor y recuperado por Ops. Source y QA descifran con la revisión R2 optimizada, a archivos nuevos600:74 bytes y hash611df5cf exactos al fixture revisado. Clave privada permanece en Source; no se imprime contenido o ciphertext. Esto acredita interoperabilidad del fixture, no la recuperación de una preview real ni activación guest. La preview posterior PRO se detiene con ForeignReference; se atribuye a Ops/Source, sin filas o flags nuevos, y requiere su conciliación separada. No bloquea el sondeo DEV.

### Dominio DEV correlacionado

Se obtiene HTTPS200/Healthy del dominio dev-lidia con una petición identificada,16:54:02UTC, y los logs filtrados del contenedor muestran exactamente el mismo Host/query/identificador y resultado200. QA lee los originales privados y observa la captura Portainer del contenedor lidia-app-gestadia-dev; CID462d/stack25 se atribuyen a la observación de Ops. [Revisión saneada](dev-domain-probe-review.json). La metadata anterior conserva su pending=true y sus bytes; no se transforma en prueba posterior. Esta vía evita esperar al login caducado de Plesk, pero aún se combina con pins/ENV/ausenciaAPP actuales antes de activar.

### Utilidad DEV revisada y preflight servido

Source entrega el freeze final de Dev25AppActivation: manifiesto633d5e97, guía bab24bfc y DLL215edd07. Portal lee la secuencia completa y reproduce116 pruebas sin fallos en una copia privada; los trece archivos C# comprobados coinciden con el freeze final. Coteja52 hashes/permisos600, cuatro miembros de payload600/UID1654, transporte gzip exacto y sintaxis de los dos scripts. Las correcciones admiten el subset original JSON entrecomillado, separan las revisiones de preparación/instalación y ligan la retirada al archivo y al intento durable propios, incluida una instalación parcial.

Ops carga el paquete una vez en DEV y ejecuta sólo su preflight. Portal observa la captura original: contenedor DEV, UID1654, hash nativo09417948, payload y cuatro archivos correctos, cuatro Save bloqueados, cinco propiedades booleanas comprobadas y conexión cerrada. [Revisión saneada](dev-activation-freeze-review.json). No abre BD, HTTP o Host, ni genera claves, activa estados, configura APP o reinicia el stack. La siguiente fase requiere los originales y revisión reales antes de una preview de sólo lectura.

Portal vuelve a comprobar13 pruebas del guard de identidad R2. La API y su guard siguen apagados para S2S; el candidato privado DEV conserva la BD durable y sus credenciales. La captura de teclado está desactivada y el simulador iOS propio apagado mientras se prueba Android. Ninguno de estos resultados acredita aún un turno remoto o el ciclo de gestor.

### Diagnóstico separado de la copia guest PRO

ProGuestSourceReferenceRead supera40 pruebas independientes y el cotejo de sus cuarenta hashes, transporte y scripts. Ops ejecuta una sola lectura después del preflight servido; Portal conserva los dos originales600 y coteja el resultado1703B/SHA99641deea83a1f794e40876d1a0c9b7b66bec55f8906196968c50867ed2d4689. Cero rutas, source_read=true, cinco pins y fingerprint sin deriva; diez de once referencias nulas, ocho flagsfalse y ExternalUrl nula. La única referencia no nula observada es Project.PersonalityId.

La lectura acredita la causa concreta de ForeignReference en ese momento, sin revelar el valor o el alcance de PersonalityId. No se repite la copia ni se modifica o activa PRO. La alternativa debe preservar el origen y revisarse por separado; este diagnóstico no bloquea la prueba DEV.

### Diagnóstico real del entorno y corrección R2 preparada

Ops provisiona los23 archivos revisados con review788B/SHAf1bd1bf0. Portal coteja la captura posterior: hashes exactos, modo600/UID1654 y directorios700. La única preview del primer paquete se detiene con resultado genérico inconcluso. Una observación de filesystem encuentra ausentes los cuatro markers de preview; eso no demuestra si abrió BD ni identifica la causa. No se repite esa operación ni se activa APP.

Dev25ActivationPrecheckRead es un paquete separado: manifiestoda563d7e, driver8fa7faa9 y guía c7ef7c8f. Portal reproduce22 pruebas sin fallos en copia privada, con rutas de fixtures adaptadas; coteja25 hashes600, transporte y tres scripts. Ops carga el paquete una sola vez y ejecuta las tres lecturas después de revisar la carga. Los originales privados103B y556B se conservan; resultado556B/SHAeded31eb11c8e5ac5d0075c583b33500cecfcfbb9f0b7bf9cbe9dae72f931949. Recibos y revisión pasan; la fase pins falla con declared_environment_changed y catorce nombres, sin devolver sus valores. Este diagnóstico no abre BD; su binding separado no acredita la ejecución de la preview anterior.

Source y Ops contrastan el YAML original e2ba. Portal reproduce independientemente la proyección con Docker Compose oficial5.3.0, sin daemon o red, en carpeta privada aislada y con las58 entradas originales e4a8 como strings literales. El servicio APP tiene66 claves emitidas y ningún env_file; ninguno de los catorce nombres señalados es una clave emitida. Son entradas del stack; entre los aliases está LogLevel hacia Serilog__MinimumLevel__Default. La comparación del primer guard mezcla esos dos ámbitos.

La propuesta47ff304d y concreción18115673 de Dev25AppActivationR2 quedan revisadas para preparación: mantener originales58, derivar mapa66 con semántica de Compose y verificar todos sus valores contra el proceso real antes de flags. Sin quitar entradas, añadir variables al servicio o cambiar secretos. El nuevo ejecutor/directorio/recibos conserva los gates de CAS y retirada; candidato y ejecución aún pendientes. [Revisión saneada](dev-precheck-environment-review.json). Portal/guard siguen OFF y no hay ciclos nativos conectados observados.

### Paquete físico actual firmado y preparado

Se recompila la APP desde0620b903/productoc653 con la configuración pública HTTPS actual; su validación y capabilities móviles coinciden. La firma manual del proyecto no acepta el perfil gestionado por Xcode; se corrige únicamente mediante parámetros de compilación automática, usando la autorización humana previa de firma/provisión. Se obtiene perfil específico con las capacidades existentes; no se eliminan Push ni Apple. La fase de validación móvil recibe sus dos archivos privados de configuración.

Archive y export Ad Hoc terminan exit0. Firma profunda/estricta PASS, arm64, Gestadia0.1.0(11), TeamX27NG7M487, perfil Ad Hoc con el iPhone registrado, get-task-allow=false y APSproduction. API incluida https://app.gestadia.com y sourceRevision0620b903; no hereda loopback. IPA2562448B/SHA7efd537377bb4c05bdebd25b5c8f503c03e17d7b7df2e390106971b91d9b1403. Se extrae además con permisos ejecutables preservados y se verifica la firma de nuevo. [Resultado saneado](physical-source0620-prepared.json).

El paquete anterior7cab/fuente344 conserva sus bytes y procedencia. El nuevo permanece privado y **sin instalar**; tampoco se publica en tiendas. Ambos ciclos conectados siguen pendientes de DEV/gestor. La consulta física de18:59UTC vuelve a mostrar iGonchu emparejado con tunnelState unavailable; no hay instalación o lanzamiento nuevos.

### Revisión independiente del paquete R2 final

Source congela Dev25AppActivationR2 con manifiesto3d04ae5e, helpera1e51321, guía5d0f1497 y metadata0649b991. Portal coteja55 hashes originales y reproduce146 pruebas sin fallos en copia privada. La primera ejecución144/2 dependía de la ruta relativa del fixture Country; se adapta únicamente esa ruta y las referencias nativas de la copia. Los archivos C# de producto conservan sus bytes. La suite incluye el preflight del ejecutable publicado, que comprueba también su resolución de dependencias.

El payload252bede9 contiene cuatro archivos0600/UID-GID1654. Los dos scripts pasan sintaxis; el carrier comprimido reproduce exactamente stage1fa59cde. Se mantienen las28 pruebas del productor y la proyecciónfc/f8 ya cotejada contra66 valores en el cálculo independiente. QA da conformidad a una carga y preflight en DEV con la revisión de Ops. No acredita todavía carga efectiva R2, preview, cambios de estados, configuración, receptor conectado ni ciclos nativos. [Resultado saneado de R2](dev-activation-r2-review.json).

La API local3005 vuelve a estar escuchando con el guard y las integraciones apagados tras la interrupción. Android conserva su cuenta y permanece en la entrada «Iniciar conversación»; iOS sigue apagado con su bundle QA local preservado. La copia de la base propia gestadia_app_local119 termina correctamente:48625B/SHAbc0ca390. La comprobación de restauración aislada queda pendiente: el destino no existía y CREATE DATABASE devuelve1044 por permisos. No se amplían permisos ni se cambia la base de origen. El archivo SQL por sí solo no acredita una restauración.

La comprobación posterior localiza las credenciales administrativas del contenedor exclusivo de QA en su fixture privado existente. Una lectura confirma la cuenta propia y la ausencia del destino antes de crearlo. La restauración aislada termina correctamente:24 tablas, todos sus recuentos iguales, User64 activo y sin vínculo CRM. No cambia permisos ni la base de origen. El recibo privado nuevo isolated-restore-review.json acredita esta comprobación posterior; conserva el intento1044 y el backup originales. No hay altas CRM, expedientes ni permisos conversacionales nuevos por esta restauración. [Resultado saneado de restauración](portal-own-isolated-restore-review.json).

### R2 servido: carga, provisión y fallo de cierre

Portal inspecciona las capturas reales de Ops en lidia-app-gestadia-dev, UID/GID1654. Stage/preflight R2 termina exit0 con cuatro Save bloqueados, cinco booleanos comprobados y conexión cerrada. La provisión posterior termina exit0:24 archivos, incluidos22 originales intactos, proyecciónfc y revisión nueva4d645c6c. Source/QA/Ops cotejan el transporte48094598/taraeb9330d antes de su única ejecución. La copia QA suma un check de las entradas reales a las146 pruebas del paquete:147 sin fallos. No cambia producto ni configura APP.

La única preview R2 posterior devuelve exit3 genérico. La observación de filesystem encuentra started148B, preview165293B y cleanup97B; failure general ausente. Ops recupera los tres originales y corrige dos hashes transcritos de la captura antes de validar la extracción. Portal conserva y coteja sus bytes exactos. El resultado contiene preimagen completa inactiva y propuesta de cuatro IsActive; AiEnabled ya era true. No declara escritura ni activación. El cierre inconcluso mantiene el resultado **no elegible** y prohíbe repetir ese intento. [Revisión saneada de los originales](dev-r2-preview-cleanup-review.json).

En el código R2, la rama de preview llama a RollbackAsync y finally vuelve a llamarlo cuando committed=false. Portal reproduce con el MySqlConnector nativo84d en una transacción local READ ONLY nueva: primer rollback correcto; segundo, InvalidOperationException. No consulta filas ni cambia datos. La primera prueba auxiliar falla por una dependencia ausente; se conserva y se corrige el binding del auxiliar. La reproducción exit0 confirma el comportamiento del proveedor; aún no identifica el recurso que falló en DEV. [Resultado local y límite](rollback-local-provider-review.json).

La propuesta R3 queda revisada para preparación: cierre explícito por recurso, transacción pendiente/rollback/commit diferenciados y conciliación RO de los tres originales R2 y de su preimagen/baseline antes de una preview nueva. R2 conserva bytes, marcadores y falta de elegibilidad. ConfigurationOperations no presenta el mismo patrón y no se cambia por analogía. No hay código R3 final, activación, permisos S2S nuevos ni ciclos nativos conectados acreditados por esta propuesta.

### Backend completo en aislamiento local

Con las credenciales administrativas del contenedor propio ya comprobadas, Portal crea una base desechable gestadia_app_test antes ausente, sin relajar el guard de las pruebas. Las migraciones terminan exit0 y el backend completo pasa355 pruebas, cero fallos/canceladas/omitidas. La retirada exclusiva de esa base termina exit0. No se cambia la cuenta nativa, su base, API3005 o S2S; no se usa un proveedor real como sustituto de estas pruebas. [Resultado saneado](backend-isolated-355-review.json). Este resultado resuelve el bloqueo local previo de la suite, pero no acredita aceptación funcional en iOS/Android.

### R3 final revisado; carga pendiente de acceso

Source congela R3 con manifiesto43ef17c7,65 archivos600, helperad3489e2, guíae63bb38f y metadata17ee1e7f. Portal reproduce195 pruebas sin fallos en una copia privada; una primera ejecución194/1 omitía el fixture de proyecciónfc y se conserva. Las16 fuentes C# y el ejecutable publicado coinciden byte a byte con el paquete final. Se verifican cuatro miembros600/UID-GID1654 en payload16e05246, los dos scripts y el carrierfa49 que reproduce stage8e3c7e2a. Source/QA/Ops cierran la revisión para una carga/preflight única. [Resultado saneado](dev-activation-r3-review.json).

Se corrigen durante la revisión dos casos adicionales: el registro de cierre no admite rollback ausente contradictorio con su fase, y el estado de disposición pertenece al comando actual, sin heredarse del anterior. El cierre tardío mantiene su tarea original y rechaza reemplazos pendientes. Los consumidores de configuración requieren los registros positivos de apply y readback; la falta de un archivo de fallo no acredita éxito.

Ops prepara28 entradas600:23 copias R2 intactas, cuatro originales históricos y una revisión R3 nueva be6c0236. Portal coteja los hashes, tar150ad4bf de28 archivos600/dos directorios700/UID-GID1654 y script88aedbdb. La envoltura3d9d4d9f contiene ese script exacto; carrier7fa61e34 de125773B conserva sus bytes y el código de salida. El wrapper55b899c7 de preview se limita a una lectura R3 con los hashes propios. Provisión y preview requieren antes sus resultados servidos, por separado.

La sesión administrativa de Portainer caduca **antes** de cargar R3. Stage, provisión y preview R3 no se han ejecutado. Se solicita recuperar la misma pestaña del operador de despliegue, sin compartir contraseña. Portal y su guard continúan apagados para S2S. No hay nuevos permisos, turno conectado, ciclo de gestor o instalación física acreditados por el paquete preparado.

### Lector del gestor: revisión local del cierre

El candidato Dev25AppOperatorMappingRead64bf se conserva sin operar. Source y Portal detectan que su cierre puede continuar con comando, rollback, transacción y contexto mientras el lector siga pendiente. Portal reproduce el algoritmo exacto en un canario local sin BD: resultado no elegible, pero disposición del comando concurrente y cinco acciones posteriores. No es un fallo servido.

La propuesta Dev25AppOperatorMappingReadR2 queda conforme para preparar únicamente el cierre secuencial: mismas cuatro consultas, IDs, correo exacto, roles, modelo, configuración inicial ausente y límites de observación. Debe retener todas las tareas y lectores/comandos por identidad antes de cerrar recursos incompatibles. Revisión final del candidato y lectura real siguen pendientes. No se inventan departamentos, pertenencias, rutas, assignmentRef o fichas CRM. R3 y los ciclos nativos conservan prioridad.

## R3: acceso recuperado, carga y provisión servidas

Portainer vuelve a autenticar la cuenta autorizada. Ops ejecuta una sola carga/preflight R3 y una sola provisión de los28 archivos en `lidia-app-gestadia-dev`, UID/GID1654. QA observa ambas capturas: shims correctos, cuatro Save bloqueados, cinco bools y conexión cerrada; `STAGE_EXIT=0` y `PROVISION_EXIT=0`. Los hashes de capturas, revisión y entrega están en [el cotejo servido](dev-r3-stage-provision-review.json). No se deduce activación de estas dos operaciones: la preview nueva, sus recibos positivos de cierre, flags, configuración y receptor efectivo siguen pendientes. R2 y Main permanecen intactos.

El lector `Dev25AppOperatorMappingReadR2` conserva las cuatro consultas exactas y políticas previas. QA verifica46 entradas del manifestec15, lee su lifecycle/Runner/Store/guía y reproduce30 pruebas de cierre más94 conservadas en copia propia. Dos fallos iniciales de esa copia se resuelven únicamente proporcionando el publish y las rutas nativas de fixture que faltaban; se conserva la evidencia inicial. [Revisión de fuentes](dev-mapping-r2-source-review.json). Esta conformidad permite preparar el paquete; no acredita entrega remota, lectura, membresía de gestor ni permisos.

Android responde como dispositivo y el simulador iOS propio arranca la APP existente contra la API local3005. El error de historial observado con APPoff no se presenta como ciclo conectado. No se instala aún el paquete físico: la condición sigue siendo completar los dos ciclos reales.

### Preview R3 y cierre positivo comprobados

Ops ejecuta una sola preview R3 sobre la revisiónBE6C. `PREVIEW_EXIT=0` y el marcador de datos inactivos constan en la captura SHA45cc059b386a1621c1396d45b50cf989e28374465c55cd1eb087b716d34f4d03. QA conserva los cuatro originales en copia privada exacta y verifica hashes/tamaños, preimagen/baseline/result completos iguales a los de R2, núcleoa714 y todos los enlaces entre conciliación, preview, revisión y recibo. `r2_eligible=false` permanece: no se recertifica la fase histórica. [Cotejo íntegro sin datos ni prompts](dev-r3-preview-cleanup-review.json).

El recibo nuevo acredita `complete=true`, rollback ya retornado, commitfalse, ninguna tarea pendiente y disposición de transacción/conexión/contexto retornada sin excepción. La diferencia propuesta contiene únicamente `IsActive=false→true` de Project104, Agent124, Instruction10117 y Country10366; `Project.AiEnabled` ya era true. El script de aplicación978B/SHA bc3e64841144454719aa572dc8c462493ce0ca0133f5d098e25f73703a399714 se coteja con preview5f87/revisiónBE6C/backupe37e y una sola invocación. La aplicación y su readback no se consideran ejecutados por revisar este comando.

### Aplicación R3 y cierre del commit comprobados

Ops ejecuta una sola aplicación del scriptbc3e; marcador `DEV25_APPLY_FLAGS_COMMIT_RETURNED_APP_PENDING_READBACK` y `APPLY_EXIT=0` en captura SHAadd058aff2cc5e78a7375961ca651ebfdd708f64cca668a8e6a02d81f15e665b. QA conserva cuatro originales privados y los coteja con la observación FS UID/GID1654 y modo600. ReadyABFA conserva íntegros before/baseline/result de preview; commit.ok7530 liga ready y resultado5e4e. El recibo positivo6cc1 liga readyABFA y revisiónBE6C; acredita committrue, rollbackno requerido, ninguna tarea pendiente y cierre de transacción/conexión/contexto retornado. [Cotejo saneado](dev-r3-apply-cleanup-review.json). La intención durable liga el input previo5f87, aunque conserve el nombre histórico `review_sha256`; la revisión efectiva está en ready y cleanup.

Quedan activadas solamente las cuatro filas propias; APP y Portal continúan OFF. Una lectura posterior ya devuelve salida0, pero se esperan sus originales y recibo para acreditar su estado completo. Ninguno de estos pasos equivale al ciclo nativo conectado ni a instalación física.

### Readback R3 completo y elegible para preparar configuración

La lectura posterior única termina con `READBACK_EXIT=0` (captura SHAc3bbdd3af1494aa36dba48746a0bdebdbe6cc861893e9d49c03fa9301c9f94fc). QA verifica los tres originales frente a su observación FS: starteda160/148B, readback38b8/1827B y cleanup8fc7/740B, privados600/1654. El readback conserva el baseline íntegro de readyABFA, liga ready/ok7530 y verifica el digest completo de resultado5e4e. Su estado es `readback_exact_verified`, `eligible_for_config=true` y `app_served_verified=false`. [Revisión independiente](dev-r3-readback-cleanup-review.json).

El positivo de readback liga revisiónBE6C/artefacto38b8 y acredita rollbackRO ya retornado, commitfalse, sin pendiente y disposiciones de transacción/conexión/contexto correctas. Source/QA/Ops pueden preparar ahora la revisión de fuentes S2S de diez campos con los hashes reales applyABFA/readback38b8. Cuenta QA y guard se verifican de nuevo; cursor permanece sólo en LidIA. Configuración instalada, ENV/reinicio, autoridad/grants, mapeo real del gestor y recorridos iOS/Android siguen pendientes.

### Arranque QA: prueba del receptor exigida por cualquier perfil activo

Ops detecta que el wrapper privado R2 sólo exigía `readyRuntimeProof` bajo el interruptor global. Su estado actual era seguro con todos los accesos OFF, pero un perfil nativo habilitado por separado omitía esa comprobación de arranque. Portal conserva R2 y prepara un wrapper R3 nuevo: deriva primero los perfiles activos, exige la prueba si hay alguno y valida cada clave con el mismo guard8e96. [Evidencia RED/GREEN](qa-bootstrap-r3-review.json).

Se ejecuta el bloque exacto de cada wrapper con fixtures cerrados y sin red: R2 conserva4PASS/2FAIL y R3 supera6PASS/0FAIL. Source coteja y reproduce la corrección. El proceso3005 continúa con R2/allOFF; el candidato R3 no está arrancado ni acredita receptor real, permisos o conversaciones. La revisión de fuentes S2S9544 de diez campos conserva su alcance y requiere revisar el transporte antes de preparar configuración.

### Configuración SONDEO5 preparada en DEV, todavía privada

La provisión única de tres originales concluye con salida0; la observación FS confirma subset934B/ad93, cursor45B/680b y revisión1133B/9544, más intento/OK propios600/1654. QA coteja el transporte y los marcadores sin imprimir valores. La preparación única termina con `PREPARE_CONFIG_EXIT=0` y `PREPARE_WRAPPER_EXIT=0` (captura SHA15b0a2674c499f131b11d0dd2f96b965495ed0535d3ad3b2acefed8fa3998bdc), con ENV intacto.

Tres originales recuperados: startedfbfe/148B, candidato7fa7/1241B y manifest2fac/510B. QA valida las cinco parejas originales, capacidades exactas, cursor32B separado y seis secretos distintos. Sólo contiene104/124/dev, history/sondeo, CRMnull, rutas vacías y guest/platformfalse. Manifest enlaza9544→ABFA/38b8→7fa7 y declara receptor/Portal/keysGeneratedfalse. [Cotejo sin valores privados](dev-r3-config-candidate-review.json). Cursor no se instala en Portal. Candidato no equivale al fichero efectivo ni permite conectar todavía.

El paquete del lector del gestor queda revisado por QA: manifest883605f0,62 hashes/modos, fuentesec15 y helper99a intactos, tar con cinco regulares600/1654, cinco sintaxis correctas y transporte byteexacto. [Cotejo de entrega](dev-mapping-r2-package-review.json). Las envolturas de salida se cotejan antes de una carga/preflight sin BD; la lectura RO posterior permanece separada. No hay aún mapping real, nuevas asignaciones ni permisos de gestor. Debe leerse antes de instalar el fichero APP, porque esta versión exige su ausencia.

### Mapping R2: fallo real, sin asignación válida y sin replay

Carga/preflight del lector pasan realmente con salida0; el original363B/d018 confirma Native094 y cuatro Save bloqueados, sin abrir BD. Su única lectura RO devuelve3 durante snapshot: Guard/Cleanup, cierre incompleto y rollbackfailed con InvalidOperationException. Se conservan started51B/2735 y failure734B/9f9f privados600/1654. No se obtiene metadata de asignación ni se repite la fase. Instalación de candidato7fa7, ENV/reinicio, Portal y grants quedan detenidos.

Portal reproduce primero el reciclaje físico del MySqlConnector84d: dos SELECT1 en TXRO/RR, lector cerrado tras la primera disposición y misma instancia reabierta en la segunda adquisición. Después combina DLL99a exacto, Native/Pomelo/EF reales y ese proveedor en la BD propia restaurada24: Store.AcquireReader lanza Guard/Cleanup al crear la segunda adquisición; el lector sigue abierto y la transacción existe. La firma de lifecycle resultante coincide íntegramente con el failure servido: readeralreadyreturned, commandreturned, rollbackfailed, disposicionesTX/conexión/contexto retornadas. [Evidencia y límites](dev-mapping-r2-provider-failure-review.json).

Es una reproducción local con Nativeb143 declarado, no una nueva lectura DEV ni una simulación de mapping. Cero writes y cero datos personales/SQL de negocio. Source prepara una nueva propuesta de cierre mediante generaciones por adquisición; se mantienen freeze8836 y todos sus originales. Los ciclos nativos y la instalación física continúan pendientes.

### Mapping R3: reproducción real corregida, todavía local

Source entrega DLL74dca7c8/84480B con generaciones de adquisición; no cambia consultas, scope ni permisos. Portal revisa Lifecycle/Store y repite la reproducción real en una carpeta nueva conservando el RED. En Native/Pomelo/EF localb143 y MySqlConnector84d, TXRO/RR y dosSELECT1 sobre la BD propia restaurada24, el nuevo helper pasa con exit0. La misma instancia física se adquiere otra vez; invocar el delegado viejo arroja Guard antes de disponerla, preserva ActiveReader y mantiene abierto el lector nuevo. Su lectura/disposición normal cierra ambas adquisiciones y el rollback único retorna, con cierre completo y ninguna tarea pendiente. [GREEN real y hashes](dev-mapping-r3-native-green-review.json).

La prueba no lee DEV, no escribe BD ni crea permisos. El hash del DLL se verifica también al terminar. Faltan revisión final de fuentes/guía/paquete, carga/preflight y nueva lectura DEV antes de una revisión nueva de instalación. El review histórico1d7 y el fallo R2 permanecen sin editar ni repetir.

### Cotejo independiente de las fuentes R3 y sus tres suites

QA lee Lifecycle/Store completos y las guías OPERACION/REUSO; verifica seis fuentes iguales salvo namespace, Ops sólo namespace/opsdir y las cuatro consultas byteexactas. Una copia propia referencia directamente el DLL publicado74d y pasa94+30+16 sin fallos. También ejecuta cada DLL de pruebas directamente, con el mismo resultado, para evitar ambigüedad por el obj compartido de dotnet run. [Resultados y hashes](dev-mapping-r3-source-review.json).

El GREEN del proveedor1aa7 es evidencia separada. Esta revisión permite preparar el paquete; no acredita lectura DEV, mapping, instalación ni permisos. No se reejecutan las mismas suites por falta de una prueba de servidor.

### Paquete Mapping R3 fijado y preflight servido

Los tres equipos cotejan y fijan el manifest6c9fbcf6 de74 archivos600. QA verifica todos sus hashes, snapshot de fuentes, payload de cinco regulares600/1654, binding14 explícito, cinco sintaxis y dos descompresiones exactas. Carrier81afb/stagecf5fa y read-wrapperc5014 conservan scope y gates. Las envolturas Ops58189c9d/56237B y7e01f8a3/1047B contienen los originales byteexactos y preservan la salida real. [Cotejo de paquete](dev-mapping-r3-package-review.json).

Ops ejecuta una sola carga/preflight Mapping R3 en DEV; captura `mapping-r3-stage-served-actual.png` con `MAPPING_R3_STAGE_EXIT=0`. QA observa también la metadata FS: únicamente preflight363B/600/1654 y hashd018, sin marcadores de lectura. El raw original se está recuperando para su cotejo antes de la consulta RO nueva. No se reintenta R2, no se instala el candidato ni se emiten permisos por pasar preflight.

### Mapping R3: cierre físico correcto y fallo de salida JSON

La lectura única real termina con salida3 en revalidate: External/InvalidOperationException. QA coteja los originales started51B/2735 y failure732B/c609. El fallo mantiene phase_successfalse aunque acredita cierre completo, rollback retornado, ninguna operación pendiente y recursos sin excepción. No se obtiene mapping válido y no se repite R3. [Cotejo del fallo real](dev-mapping-r3-output-failure-review.json).

La reproducción aislada con System.Text.Json378 identifica que schema conserva su Parent JsonArray y no admite adjuntarse directamente a output. Source prepara R4 con una única copia profunda en esa asignación. QA coteja las fuentes y ejecuta directamente el test específico contra el DLL publicado4d35: RED original con salida1, GREEN4/0, informe serializado2723B/13campos, nodo original preservado y elegibilidad rechazada si hay error lógico o cierre incompleto. Consultas, lifecycle, bindings y scope se conservan. [Revisión R4](dev-mapping-r4-source-review.json). Los140 casos y NativeGREEN históricos no se repiten ni se presentan como pruebas R4. Paquete, nueva lectura DEV y configuración instalada siguen pendientes.

### Paquete Mapping R4 y envolturas revisados

Los tres equipos fijan manifest12565/59 archivos600. QA coteja todo el índice, los cinco regulares del payload600/1654, DLL publicado4d35, anidación carrier→stage→payload y ejecuta el validador específico:290PASS/0FAIL, log710d. Envolturas Ops stage1c209/56225B y read4ad5/1047B conservan originales byteexactos y salida real. [Revisión del transporte](dev-mapping-r4-package-review.json). Esto permite una sola carga/preflight sin BD; la lectura RO queda condicionada al raw servido y ausencia de marcadores. No acredita mapping ni configuración efectiva.

### Mapping R4: lectura real positiva y carencia de departamento

Carga/preflight servido concluyen con salida0; raw363B/d018 confirma Native094 y cuatro Save bloqueados, sin BD/HTTP/Host/cache/DTO. La lectura única termina con salida0 y genera started51B/2735 y metadata2861B/e24b, privados600/1654; failure ausente. QA coteja los dos originales: informe válido, phase_successtrue, cierre completo y rollback retornado, sin tareas pendientes ni excepciones de recursos. Esquema198/260/260 y target104/124 activos. [Revisión real](dev-mapping-r4-actual-read-review.json).

El operador existe con email exacto, Admintrue, Soportefalse y sin bloqueo temporal; no tiene departamentos propios del proyecto104. APP continúa con fichero ausente, ENVfalse y rutas vacías. No existe asignación de gestor acreditada ni autoridad de handoff. Se puede preparar una revisión nueva de instalación SONDEO5 conservando histórico1d7; la atención requiere todavía departamento/membership y relación CRM propios. No se repite R4 ni se atribuyen permisos a la frescura de su observación.

### SONDEO5 instalado en DEV, todavía desactivado

Source crea revisión nueva a2b/1122B después del mapping realR4; conserva siete campos con cadena9544/2fac/7fa7 y los tres ACKe24b. Histórico1d7 no se modifica ni consume. QA coteja transporte09b55 de seis archivos600, tar de un review600/1654 y dos scripts/carriers exactos. La primera envoltura local falla en sh3.2 por case dentro de heredoc+$(); queda sin operar. La revisión de envoltura con función conserva bytes originales y supera sh-n: provisión62dd e instalación9e5d.

Ops ejecuta una provisión única exit0 y FS confirma a2b/1122, OKb9b25 y ausencia de marcadores de instalación. La instalación única concluye exit0. QA coteja intent441B/554c y result493B/f70a: cadena exacta9544/a2b/2fac/7fa7, noReplay y served_verifiedfalse. FS acredita APPfile1241B/7fa7/600/1654 y ausencia de fallos. [Revisión real sin secretos](dev-sondeo5-install-actual-review.json).

ENV sigue false y loader no recarga por cambios de fichero. Falta delta mínimo y reinicio DEV, nueva atribución CID/Native/BD/proxy y prueba firmada del receptor. Un GET timeline con clave única propia y UUID inexistente deberá superar autenticación/runtime y devolver404conversation_not_found; consume un nonce antireplay, sin crear ChatSession, conversación, turno, LLM o CRM. Portal/scope continúan OFF. Android iniciará la sesión desde la UI y se comprobará el ACK de contexto antes del primer turno. No se atribuye todavía aceptación nativa ni instalación en iGonchu.

### Activación DEV preparada y confirmación del navegador pendiente

QA verifica por git ls-remote que la rama operativa sigue en30be1692e5ba2c7bbb41a9603fcd07adab55bbe0. El delta preparado cambia exclusivamente AppConversations__Enabledfalse→true y conserva los57 valores restantes, YAML, imagen y referencia. La política del control de navegador exige confirmación humana en el momento de habilitar ese acceso S2S; se ha solicitado en este chat para la cuenta QA propia. No sustituirla por otra cuenta de una prueba distinta. No se ha aplicado el delta ni reiniciado, no se ha ejecutado el GET de receptor ni conectado Portal. La aprobación no se deduce del tiempo transcurrido.
