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

## Coordinación Main separada

QA revisa el lector administrativo Main (26 hashes/76 assertions), helper de asociación R3 (29 hashes/76 pruebas) y generador de ventana (8 hashes/32 pruebas) en copias privadas. Conformes preparación/preflight/lecturas previstas; no grants, correlación o llamada por estos checks. Main mantiene sus propios IDs y no se incorpora al fixture nativo User64.

Portal prepare-activation vigente SHA65db149f0c1c7582a81af98c4f88ae19c1a1b7b21f0ad7e30c179cf99e37f985 comprueba el binding exacto antes del servicio. Revoke-and-sync SHA62210484f974ee1b65006d1e3799332f507e8f0ca196c52495056a520f6e9d9e exige la referencia humana actual, CAS y ACK de retirada de permisos. La confirmación humana de una nueva ventana está pendiente en la tarea de operaciones. No se activa desde esta revisión.
