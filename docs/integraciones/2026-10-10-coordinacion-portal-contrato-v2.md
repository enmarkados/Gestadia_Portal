# Coordinación Portal: contrato técnico APP v2

**10/10/2026 · Preparación de ejecución.** [Manual](../app/MANUAL-DESARROLLO.md) · [Plan Portal](../superpowers/plans/2026-10-10-app-v2-portal.md) · [Glosario](../../GLOSARIO.md).

## Autorización y alcance comprobados

Se leyó directamente la instrucción humana **«pues implementa el contrato tecnico»** en el chat `01a1071b-1f23-7101-afd4-13935b20bd04`, «Gestadia_LidIA - Actualizar rama dev/IA/main», turno `01a12789-3159-77b2-a5a8-6c226110d82d`. La coordinación entre equipos y el trabajo aislado ya habían sido autorizados por Gonzalo en el chat Portal.

La instrucción permite avanzar el contrato y su desarrollo coordinado. **No es autorización para activar visitantes, desplegar el recorrido, migrar una BBDD existente ni utilizar CRM/correo/agenda de producción.** Los mapas siguen representando una propuesta hasta que su consumidor sea implementado y comprobado; la aceptación visual/nativa y la activación son comprobaciones separadas.

Base Portal: `app/main` en `7bfa689b1a537ef4b15d909ec9a2468770c7c71b`. Rama de esta preparación: `codex/app-v2-guest-portal`, en el worktree existente `app-anonimo-lidia/Gestadia_Portal`. La entrega inicial cambió documentación y glosario; el avance posterior de transporte/requests aislados consta al final y en el contraste r3. El recorrido anónimo no está integrado en el producto.

Las [revisiones históricas](2026-10-10-contraste-portal-app-anonima.md) conservan sus bytes/fecha y su estado anterior de autorización. Este documento registra el avance posterior; no modifica las copias recibidas para hacerlas parecer contratos ejecutables.

### Precisión humana posterior: pasarela al agente 119

Se comprobó por lectura directa el mensaje humano `01a127a2-2b60-7d30-a407-11f47d3af53a` del mismo chat LidIA: la integración transmite lo que escribe el cliente a la plataforma con el agente 119 y muestra su respuesta. HTML y respuestas dinámicas son opcionales si no complican el procedimiento.

El agente lleva las preguntas y decisiones de canje. No se crea un cuestionario, calificador, catálogo de reglas ni política de negocio paralelos en Portal o en el adaptador. El requisito anterior de elaborar otro catálogo queda sustituido por consumir la ejecución y los resultados/acciones reales del 119. La prioridad es comprobar esa pasarela; identidad, aislamiento, continuidad y efectos de contacto conservan sus contratos propios. Esta precisión no cambia por sí sola la configuración efectiva de un agente ni activa visitantes.

## Reparto comunicado

| Responsable | Entrega | Condición de entrada |
|---|---|---|
| LidIA | Rutas/DTO/capacidades v2, JSON Schema y vectores JS/.NET; ejecución del agente 119; sujeto/actor/revisión remotos; binding durable; timeline/recibos; resultados/acciones del agente; publicación/ACK recuperable de contacto | Compatibilidad v1; ejecución real del agente acreditada; opt-in explícito |
| Portal | Credencial/control de instalación, asociación local por conversación, cliente S2S v2, registro/verificación, vínculo recuperable, solicitud durable y reconciliación | Artefacto exacto compartido aceptado antes de realizar llamadas; no suponer campos ni permisos |
| APP | Entrada anónima, Mensajes propios, registro opcional posterior, retorno al mismo chat y estados de envío/vínculo | API Portal comprobada; seguir mapas, origen completo y estilo vigente |
| Responsable Zoho/agenda | Conversión lead–contacto/trato, evento Cerrado ganado, futura entrega CRM y agenda | Contrato propio con Portal; no se atribuye a LidIA ni se habilita por registrar |

El cliente móvil no decide integración, proyecto, agente, entorno, operador, departamento ni referencia CRM. Portal resuelve todas esas autoridades. No se altera `accountProof`, `/api/app/v1`, sus firmas ni sus asociaciones actuales.

## Preferencia de transporte enviada a LidIA

**Pull S2S**, sujeto a que LidIA publique el contrato ejecutable. Rutas propuestas históricamente; **wire r3 las reserva y aplaza**. No son rutas permitidas por el cliente actual:

```text
GET  /api/integrations/lidia/app/v2/sessions/{conversation_id}/contact-requests/{intent_id}
POST /api/integrations/lidia/app/v2/sessions/{conversation_id}/contact-requests/{intent_id}/ack
```

- GET recupera un evento/revisión exactos y su estado, sin crear una solicitud ni avanzar el proceso. La identidad original `event_id` e intención/revisión no cambian al registrarse.
- ACK usa una key estable por entrega; acredita persistencia Portal y referencia local, con huella del payload. No añade datos de contacto ni manda el historial completo.
- Nombres, campos, tipos, capacidades, query y huella exacta son responsabilidad del artefacto LidIA. Esta preferencia no autoriza construir un DTO supuesto.
- Las lecturas y ACK firman sujeto, actor y revisión; se revalida pertenencia antes de devolver datos o un replay. Una key S2S no sustituye autorización de conversación.
- Sin webhook ni URL arbitraria; sin llamada directa al CRM desde LidIA o el móvil. No hay job de entrega a Zoho hasta cerrar su receptor.

## Carrera entre lectura, cancelación y ACK

1. Portal valida esquema, integración, sujeto, intención/revisión y la acción de contacto emitida por el agente; conserva una fila durable pendiente de reconciliación. No reevalúa elegibilidad. País, texto libre o `human_review` aislados no sustituyen esa acción.
2. Portal envía el ACK de esa fila, con la misma identidad y huella. Antes del ACK confirmado no afirma recepción final ni entrega al responsable CRM.
3. LidIA debe decidir atómicamente si la revisión/evento siguen vigentes y persistir el resultado del ACK. Si la intención cambia, caduca o se retira antes de esa decisión, devuelve conflicto sin confirmar entrega. El tratamiento exacto se cerrará en el contrato.
4. Una respuesta HTTP perdida se recupera por la misma operación/recibo; no genera otra solicitud ni otra key. Portal no confunde timeout con rechazo o cancelación.
5. Después de ACK aceptado, modificar/cancelar esa solicitud exige una operación separada por acordar. Cancelar el registro no altera la solicitud recibida.
6. Si el vínculo cambia la autoridad durante este proceso, la cuenta vigente puede recuperar el mismo resultado autorizado. El actor original guest del evento y su ledger no se reetiquetan.

La fila local pendiente demuestra que Portal conserva los datos; no prueba por sí sola la confirmación remota del ACK, una conversión CRM o una cita. La APP debe distinguir esos hechos en sus estados.

## Cierres necesarios antes del consumidor remoto

| Artefacto solicitado a LidIA | Comprobación Portal |
|---|---|
| Contrato v2 versionado con SHA, rutas y códigos | Allowlist exacta, errores sanitizados, sin fallback a v1 |
| JSON Schema cerrado y vectores HMAC JS/.NET | Copia byte-exacta, hashes, firma de bytes UTF-8/query, Unicode, GET vacío y actor/revisión |
| Contexto/recibos/binding y sus capacidades | Permiso actual antes de replay; expiración/bloqueo; commit incierto; guest histórico; A vinculado sin retirar B |
| Señal/resultado/contacto emitidos por el agente | Acción identificable del agente, voluntad expresa, nombre + teléfono O email, confirmación y dato mínimo; sin evaluación paralela |
| GET/ACK y recibo durable | Revisión exacta, huella semántica estable, conflicto de payload, cancelación concurrente y recuperación después del vínculo |
| Vigencias, límites y retención | Configuración explícita de cada ámbito; no asumir los 7d/30min históricos como valores aprobados; tombstones mínimos sin contactos |

Portal muestra la respuesta del agente y no inventa un resultado operativo. Si falta una acción verificable para ejecutar contacto, esa operación permanece pendiente de contrato; esto no bloquea el transporte de texto al 119 ni exige un catálogo nuevo. La agenda sigue fuera del contrato conversacional.

## Preparación por bloques

El [plan Portal](../superpowers/plans/2026-10-10-app-v2-portal.md) fija pruebas y puntos de entrada. Se puede preparar aislamiento, inventario y contratos locales sin tocar v1. Las llamadas v2, sus DTO y migraciones se implementarán después del artefacto ejecutable recibido y contrastado; no se completan usando una copia histórica de propuesta.

Cada bloque se entrega con commit/push/sync de su rama y evidencia correspondiente. Un test con fixture demuestra ese contrato local; el E2E conjunto, emuladores, iPhone y runtime desplegado se registran aparte. No se fusiona código funcional o se activa guest por una mera actualización de mapas.

## Registro de coordinación

- Se verificó la instrucción humana en el chat LidIA mediante lectura directa; no se tomó el mensaje del otro agente como única fuente de autorización.
- Portal comunicó el reparto, la preferencia GET/ACK, el límite de cancelación concurrente y la necesidad de esquemas/vectores exactos en ese mismo chat, con la autorización humana previa de coordinación.
- Recibido el borrador [wire LidIA r1](2026-10-10-app-v2-wire-lidia-r1.md), conservado byte-exacto, sin commit/schema/vectores de entrega aún acreditados. [Revisión Portal P1–P4](2026-10-10-revision-portal-wire-v2-r1.md) enviada: huella del inicio, revisión exacta en recuperación, autorización de revocación y evidencia de confirmación. No se declara conformidad final ni disponibilidad de API v2 por esta recepción.

## Avance posterior: wire r3 y transporte preparado

- Recibido [wire r3 exacto](2026-10-10-app-v2-wire-lidia-r3.md) del commit LidIA `4a10ebf794fd7f947290a2d85beeebce9b1d8558`; hashes de wire, requests y seis vectores comprobados en el [contraste Portal](2026-10-10-contraste-portal-wire-v2-r3.md). R1/r2 conservan su procedencia histórica.
- La matriz posterior comunicada por LidIA se incorporó: recuperación/operaciones y GET recibos con timeline.read, POST recibos con turns.write, handoff con cuenta y capacidad dedicada. Binding exige igualdad exacta de revisión body/header; el lifecycle original no autoriza turnos con una revisión antigua.
- Transporte/validación v2 preparados en la rama aislada, flags off por defecto y sin claves de contacto. Sin montaje de API, nueva BBDD o autoridad persistida.
- A petición de LidIA se remitieron esquemas de respuestas r1, trece fixtures sintéticos y manifiesto de fuentes para revisión conjunta. No se importan en runtime ni constituyen conformidad del contrato.
- Verificación final: 209 backend, 152 frontend y build APP correctos; 63 pruebas stateless específicas. Revisión independiente sin Critical/Important; falta prueba específica de rotación v2.
- Bloques 3/4/6 pendientes; contacto/ACK del bloque 5 aplazado por r3. Se preservan las pantallas propuestas para revisar el futuro recorrido. No merge funcional, despliegue, activación, CRM ni prueba conectada del 119 por esta entrega.

## Prioridad inmediata comunicada por LidIA

Mensaje posterior recibido del chat LidIA autorizado: la prioridad es APP → Portal → LidIA → agente 119 real, con mensaje y respuesta literales; sin duplicar reglas de canje/calificación y con HTML opcional. Esta precisión coincide con la instrucción humana ya comprobada y no convierte v2 ni visitantes en una condición de entrada del canal existente.

El commit fuente `d2520653db85fb0a628cae8f48cb7cf188eeb4b0` se localizó con `git show` en el worktree LidIA; el equipo comunica su publicación en `codex/app-v2-guest-contract`, sin merge/deploy. No se considera versión validada/desplegada: LidIA corrige hallazgos de caché autorizada, composición de instrucciones, cancelación y errores del proveedor, y remitirá commit validado y configuración servidor antes de la prueba conectada.

Portal conserva separados el consumidor de cuenta existente y la preparación v2 en `4f522a1`. No añade calificador ni cambia identidad, rutas o despliegue por este mensaje. La prueba deberá observar envío real, respuesta del 119 y representación en APP; los 209/152 tests o el runner local no satisfacen esa evidencia. El contrato de respuestas/autoridad v2 sigue pendiente de revisión conjunta.

## Seguimiento del motor nativo — 11/10/2026

Comunicación posterior del mismo chat LidIA autorizado: commit `1413fa2d9d1ff0d975e3d638fef6fe52a6a8e152` y [PR borrador 1622](https://github.com/enmarkados/Gestadia_LidIA/pull/1622), contra `dev/IA/main`. Portal localizó el commit mediante `git show`; la PR y su estado son información comunicada por el equipo, no una comprobación GitHub de Portal (la identidad CLI disponible no pudo acceder al repositorio). No se adjunta esa PR como trabajo propio ni se considera una autorización nueva.

El equipo comunica correcciones de caché/historial autorizado, composición clásica completa de instrucciones, transmisión de cancelación e indisponibilidad tipada del proveedor, sin fallback APP. También comunica revisión independiente sin nuevos hallazgos importantes y cuatro regresiones correctas con proveedor en memoria; el GREEN final de routing sigue pendiente de compilación SDK 8 por contención local. Portal no ejecutó estas pruebas .NET.

Según la comunicación, no hay merge, despliegue ni perfil real119 activado; la sesión Portainer caducó y requiere login. Se conserva el alcance humano previo de despliegue con backups sin atribuirlo a este mensaje. LidIA remitirá validación final y configuración efectiva; Portal mantiene pendiente la prueba conectada hasta esa entrega. El canal de cuenta existente conserva la prioridad de pasarela literal y permanece separado del v2 preparado.

## Reanudación tras cierre del Mac — 11/10/2026

Portal comprobó que `app/main` y la rama v2 estaban limpios y que APP/tablero/backend no escuchaban. Se arrancaron APP 5174 y tablero 5190; ambos respondieron 200. La pestaña de acceso quedó en el splash y se recuperó mediante recarga, observando el formulario y su aviso de demostración. Docker Desktop volvió a estar disponible; no se activó el canal ni se modificó la configuración pública.

LidIA comunica Portainer autenticado, runtime efectivo aún 713/cfaf6a3, backup runtime de 41 MB y backup de BBDD `manual_20261010_230058.sql` de 1,20 GB con éxito observado en su UI. Estos datos se atribuyen al equipo fuente. La rama nativa permanece en 1413fa2d9, con ajustes de mensaje inicial, ventana de contexto y herramienta original de país todavía sin validar/commit. La compilación local agotó memoria; prepara un build aislado en Portainer conservando producción. Validación final, SHA/versión/configuración efectiva desplegados y prueba real del 119 siguen pendientes. Portal conserva v1 literal y v2 separado.

Verificación Portal tras reanudar: harness de cuenta `node scripts/test-app-conversations.mjs` correcto, 167 backend, 152 frontend y build APP. Pruebas unitarias del preflight 13/13 y transporte aislado v2/firma v1 63/63. No se ejecutó un preflight contra cuenta/grant conectados. Una invocación adicional de tests raíz fuera del fixture fue rechazada por el guard de BBDD; la invocación protegida posterior pasó 11/11 con base temporal y limpieza del harness, sin conectar una BBDD existente. Se detectó que el glob sin comillas del comando main omitía esas pruebas raíz; se incorpora únicamente la corrección del comando ya revisada/probada en 4f522a1 para que el harness habitual también las ejecute. Configuración/runtime v1 y v2 permanecen intactos. Estas comprobaciones no validan emuladores o el 119 real.

La ejecución final del harness habitual, después de corregir el comando, pasó **178/178 backend, 152/152 frontend y build APP**; el runner terminó con código 0 y limpió su fixture. El consumidor v1 sigue mostrando `m.text` literal y su schema admite `sondeo:null`; no se añadió evaluación local ni se montó v2. APP 5174 y tablero 5190 se conservan activos para continuar.

### Asociación del 119 y conservación del historial 122 — propuesta enviada

LidIA comunica que la configuración efectiva existente conserva Project103/Agent122/PRO y aislamiento verificado, sin `PlatformAgentRuntimeEnabled`. Portal comprobó en código que `NamespaceKey` de LidIA incluye audiencia, entorno, proyecto y agente, y que `LoadConversationAsync` valida proyecto/agente de la sesión. Cambiar estos valores en la integración existente impediría recuperar sujetos/chats anteriores; no se propone retirar esas comprobaciones ni reescribir sus asociaciones.

Se propone una integración servidor adicional para las **nuevas consultas al 119/Project102**, conservando íntegra la del 122 y la misma cuenta/`portal_user_id`. Portal hoy utiliza una sola integración en su configuración, listado y validación de pertenencia: la asociación adicional requiere desarrollo aislado para resolver nuevas consultas y usar la integración persistida de cada chat en lecturas, turnos, recibos, operaciones, revocación y workers. Reintentos conservan la asociación original; atención existente continúa en su integración. No basta cambiar una variable ni se amplían permisos. La propuesta está enviada al equipo LidIA y pendiente de conformidad; no se implementó ni activó.

Para la prueba conectada se solicitó commit validado, SHA/versión realmente desplegados, destino efectivo verificado, capacidades exactas y localización/vigencia del fixture privado protegido, sin secretos en el handoff. Las claves antiguas permanecen intactas y la cuenta principal no se duplica. Los permisos caducados no se renuevan automáticamente. El recorrido previsto comprueba nueva consulta/inicio literal/respuesta y timeline del 119 en APP, seguido de reapertura del historial 122. v2/visitantes y efectos CRM/correo/agenda permanecen fuera de esta prueba. [Definición y alcance](../../GLOSARIO.md).

### Conformidad posterior y desarrollo aislado de asociación v1

El equipo LidIA dio conformidad con integración adicional y desarrollo Portal en el worktree, bajo el mandato humano previo de comenzar tras acuerdo/reparto. Destino acordado `gestadia-app-pro-agent119-validation`, v1/PRO/119/Project102, producto sondeo/history y GuestV2Enabled=false. Portal detectó en `AppProtocol.VerifyRequest` que los key IDs se buscan globalmente y deben tener un único match: duplicarlos entre integraciones invalidaría ambas. Se acordaron IDs exclusivos `gestadia-app119-session-v1`, `gestadia-app119-read-v1`, `gestadia-app119-turn-v1`, `gestadia-app119-context-v1` y `gestadia-app119-revocation-v1`, conservando el secreto privado por la misma capacidad. No se amplían permisos ni se retira el control de unicidad. Recibos reutilizan timeline GET/turn POST del contrato v1 existente; este perfil excluye handoff.

Implementación Portal en worktree `app-integraciones-119-122`, rama `codex/app-integraciones-119-122`, base app/main7eed2d6; separada del transporte v2 preparado. [Plan y matriz de pruebas](../superpowers/plans/2026-10-11-app-integraciones-119-122.md). Baseline propio178backend/152frontend/build. La asociación de consultas nuevas se prepara mediante configuración privada opt-in; apagar creación conserva lectura/retirada del perfil119 configurado. Configuración incompleta/colisión se rechaza; ninguna variable pública móvil elige agente o integración.

La conformidad del equipo no acredita activación ni autoridad para renovar permisos. Antes de una llamada real se comprobarán la instrucción humana aplicable, el principal/fixture privado vigente, los límites de sus grants y el despliegue efectivo. LidIA comunica DEV6bcb5061b y marcador718 con218 pruebas más una del marcador; producción/configuración efectiva siguen pendientes de entrega y no fueron verificadas por Portal.

Resultado aislado Portal: harness completo195/195backend,152/152frontend y buildAPP, exit0; incluye12 regresiones de asociación/ciclo más5 de configuración. Se comprobaron texto literal, listado propio, renombrado, turnos, recibos/ACK, replay perdido, selección exclusivamente backend, validación, límites de permisos y retirada por ambos ámbitos. Revisión independiente de la rama pendiente; no hay flags privados activados ni llamada al119 real.

### Revisión final, claves recuperadas y cuenta pendiente — 11/10/2026

Revisión independiente7eed2d6..3af8ec2:0Critical,3Important,0Minor. Una sola pasada de corrección con RED5fallos→GREEN18pruebas: selección nueva tras cierre remoto del candidato, recorte conjunto de permisos/referencias y preparación de contextos por configuración del ámbito en la carrera grant/worker. Suite canónica final201/201backend,152/152frontend y buildAPP, exit0. El grant guardado permanece íntegro; no se añadieron facultades. [Procedimiento y límites](../app/2026-10-11-reanudacion-app-119.md).

LidIA comunica PRO84ef05902b87439dd92008ef73a8deaa2a5d7b99/V1.718-app-agente-contexto, backup y EFrecibos aplicado; configuración119 adicional persistente y122 conservada, v2off. Portal localizó el commit y observó HTTP200 público, pero no acreditó por ello la configuración efectiva ni un diálogo119 en APP. La prueba Playground comunicada por fuente mantiene ese alcance separado.

La cápsula cifrada recibida se descifró localmente y produjo configuración persistente privada0600 (directorio0700), fuera de Git y sin valores secretos en esta documentación. Dos perfiles reales119/102 y122/103 con once keyIDs únicos y sin handoff119; no se rotaron claves. La primera cápsula tenía escapes Unicode duplicados por extracciónDOM; fuente corrigió el mismo archivo, validando384bytesRSA, y el descifrado autenticado posterior fue correcto.

La base Portal/tmpfs y los backups privados temporales anteriores ya no están disponibles. Se comprobó la autorización HUMANA original de renovación24h de grants existentes (turno01a11574-f232-73a0-80b4-a293ca2ce538); no permite reconstruir principal/permisos desde historial. Fuente ha solicitado al usuario backup o autorización explícita de un fixture nuevo mínimo. Sin respuesta, no se crea cuenta/grant ni se inicia conversación119. Capturas, recuperación histórica122, emuladores/iPhone y v2 continúan pendientes; las correcciones de backend no alteran las pantallas existentes.

Conformidad posterior LidIA sobre el diff0f30eca y su acta, remitida en el chat autorizado. Portal creó la [PR12](https://github.com/enmarkados/Gestadia_Portal/pull/12), adjunta a su tarea. El mandato humano previo de commit/push/sync permite incorporar el código revisado en app/main con flags públicos apagados; el equipo confirmó ese reparto. La aceptación conectada mantiene la puerta de identidad/autoridad y no se considera satisfecha por merge. CLI inicial sin rol colaborador rechazó crear la PR; se utilizó la identidad enmarkados ya configurada mediante entorno efímero, sin cambiar la cuenta CLI global ni mostrar su token.

Cierre Git comprobado: PR12 MERGED, merge `be6bed66327e9efe521ecd380d549fcb07a307c2`; app/main local limpio y0/0conorigin tras ff-only. Diff backend/frontend/scripts contra0f30eca vacío: conserva el código validado201/152/build; después sólo documentación. Se comunicó SHA/paridad al equipo LidIA. La aceptación conectada y la respuesta humana sobre el fixture siguen pendientes, sin nueva autoridad ni activación v2.

## Cuenta nueva autorizada e instancia conectada — 11/10/2026

Portal leyó directamente la respuesta humana del turno LidIA `01a12843-53c2-79b3-a1eb-96602b78e26f`: «Crear cuenta ficticia local y probar el119», bajo alcance explícito24h sondeo/history, sinCRM/pagos/WhatsApp. Se preparó base propia durable y un principal distinto sin historial heredado. Siete migraciones locales, cuenta/grant acotado, manifest/credencial/SQL privados persistentes.

APP5177/backend3004 sirven el código main `e61504e2c05ca4ba7851b8ee2375aacc44d00f8d`, con configuración pública conectada sólo allí;5174 permanece demo. Health200/login201/perfil200/listado0; sesión de preflight retirada. No se hizo una llamada LLM. LidIA recibió la entrega y reserva el primer ciclo UI/atribución119/recuperación; la aceptación conectada queda pendiente de ese resultado. [Preparación, vigencia y reinicio](../app/2026-10-11-reanudacion-app-119.md#instancia-conectada-preparada--11102026).

## Cierre de un turno APP119 real y recuperación — 11/10/2026

LidIA ejecutó desde UI5177 login/nueva consulta/un único mensaje y recarga. Portal inspeccionó las capturas y comprobó en sólo lectura el enlace APP `bd407295-a152-4763-bb7b-a4764585af7c` → remota `352cceb4-9c5f-4774-9291-549ae2fe90f5`, contexto1/synced1, state5, único turno admitted200. La evidencia SQL fuente (exit0) atribuye la sesión a119/102/instrucción10115/APP, sinWhatsApp/contacto; único LlmCallLog39316, Anthropic claude-haiku-4-5-20251001, Purposeconversation, Success=true. [Acta, capturas y límites](../app/2026-10-11-reanudacion-app-119.md#atribucion-real-y-limites-de-cierre).

Portal guardó `database-postturn.sql` privado persistente,28145bytes, SHA256`e30fc571219c87fc42b6c22b1efd0cc72f4b63d9fbc280aaebe868fb94e4c3a5`, junto al manifest/credencial/seed; volumen propio durable, grant24h sinampliar. Queda validado el ciclo web de cuenta/un turno/recuperación119; no sondeo completo, gestor, historial122 perdido, v2/visitantes, CRM ni móvil. La respuesta original y las reglas siguen en el agente; Portal no implementó un clasificador paralelo.
