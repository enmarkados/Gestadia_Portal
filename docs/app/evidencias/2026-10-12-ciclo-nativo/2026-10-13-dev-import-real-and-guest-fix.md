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

## Coordinación Main separada

QA revisa el lector administrativo Main (26 hashes/76 assertions), helper de asociación R3 (29 hashes/76 pruebas) y generador de ventana (8 hashes/32 pruebas) en copias privadas. Conformes preparación/preflight/lecturas previstas; no grants, correlación o llamada por estos checks. Main mantiene sus propios IDs y no se incorpora al fixture nativo User64.

Portal prepare-activation vigente SHA65db149f0c1c7582a81af98c4f88ae19c1a1b7b21f0ad7e30c179cf99e37f985 comprueba el binding exacto antes del servicio. Revoke-and-sync SHA62210484f974ee1b65006d1e3799332f507e8f0ca196c52495056a520f6e9d9e exige la referencia humana actual, CAS y ACK de retirada de permisos. La confirmación humana de una nueva ventana está pendiente en la tarea de operaciones. No se activa desde esta revisión.
