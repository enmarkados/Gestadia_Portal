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
