# Contraste Portal del wire APP v2 r3

10/10/2026. Preparación aislada en `codex/app-v2-guest-portal`; sin activación ni API v2 montada. [Manual](../app/MANUAL-DESARROLLO.md) · [Plan](../superpowers/plans/2026-10-10-app-v2-portal.md) · [Glosario](../../GLOSARIO.md).

## Procedencia conservada

La [copia r3](2026-10-10-app-v2-wire-lidia-r3.md) se obtuvo con `git show` del commit LidIA `4a10ebf794fd7f947290a2d85beeebce9b1d8558`. La [copia r2](2026-10-10-app-v2-wire-lidia-r2.md) conserva los bytes de la recepción de trabajo previa, sin atribuirle retrospectivamente ese commit. Las copias r1/r2 siguen siendo antecedentes; r3 prevalece en alcance.

| Artefacto recibido | SHA-256 comprobado |
|---|---|
| Wire r3 | `ad5056fc20d0f11ad14a80276fb084f01179909a099acc31f980acbf0ac4372f` |
| [Requests schema r2, sin cambios en r3](fixtures/app-v2-schema-r2.json) | `7e164b639a64add04bcc61d8f6bec935f3dd2faa9c3ad33c2c05a3cc54bfe714` |
| [Seis vectores r2, sin cambios en r3](fixtures/app-v2-vectors-r2.json) | `1c642c2a56e7c7ce48f367b4af6f7f0451f8f7aedf4860f0185ac33bbe77a971` |

La copia runtime del schema de requests mantiene el mismo hash. La firma de los seis vectores se reprodujo en Node; LidIA comunica su comprobación .NET 6/6. Portal no ejecutó la suite .NET ni convierte ese resultado de protocolo en una prueba del agente real.

## Alcance y reparto vigentes

APP transmite texto a Portal, Portal firma y lo pasa a la plataforma LidIA; el agente 119 genera la respuesta. No se añade un cuestionario, un calificador ni un catálogo de canje en el adaptador. La salida inicial `sondeo` es null y no se interpreta el texto para fabricar elegibilidad. Las presentaciones son opcionales; no se permite HTML ejecutable sin acuerdo de renderizado seguro.

`contact-requests` está reservado: no hay rutas de contacto en la allowlist HTTP de Portal, ni claves/capacidades publicadas por su configuración v2. El schema y un vector recibidos de ese ámbito se conservan como artefactos reservados; poder validar o firmar un vector no autoriza a invocar un endpoint.

La siguiente matriz se contrastó con `AppProtocol.Route/V2Route` y con la precisión enviada por LidIA después de r3. Las rutas son S2S internas, no rutas expuestas al móvil.

| Operación | Capacidad |
|---|---|
| POST sessions | `app.sessions.write` |
| GET timeline, operations y recuperación del inicio | `app.timeline.read` |
| POST turns | `app.turns.write` |
| GET message-receipts | `app.timeline.read` |
| POST message-receipts | `app.turns.write` |
| POST handoff, sólo cuenta | `app.handoff.request` |
| POST context | `app.context.attest` |
| POST bindings / GET binding | `app.bindings.write` / `app.bindings.read` |
| POST revocations | `app.subjects.revoke` |

`bindings.expected_access_revision` coincide exactamente con el header firmado. Commit/abort y replay de commit conservan su revisión preparada original bajo la excepción remota de lifecycle a la cuenta destino; no se aplica esa revisión a timeline o turnos. Las llamadas posteriores usan autoridad vigente. La comprobación durable de principal/propietario pertenece a los bloques posteriores, antes de montar la API; el transporte no la sustituye.

## Lo preparado en Portal

- Cliente S2S separado: 13 líneas UTF-8, bytes exactos, GET vacío/query canónica, claves privadas por capacidad y ningún fallback v1.
- Configuración v2 explícita, deshabilitada por defecto; flags guest separados. No hay cambios en cliente, firmas o identidad v1.
- Validación cerrada de requests, Unicode, fechas UTC reales, TTL guest máximo 24h y IDs de recibo; sin elección móvil de agente/proyecto/CRM.
- Rutas/capacidades exactas, handoff guest rechazado, control de revocación separado, redirects bloqueados, timeout sin reintento automático y errores sanitizados.
- Respuesta acotada a 1 MiB y validador obligatorio antes de HTTP. No se monta un consumidor remoto hasta cerrar las respuestas y la autoridad local.
- Comando backend corregido para que Node reciba el glob entre comillas y descubra los tests anidados.

## Propuesta de esquemas de respuesta

LidIA pidió preparar estos artefactos desde sus salidas en curso para revisión conjunta. **Son propuestas documentales, no se importan por runtime.**

| Propuesta | SHA-256 |
|---|---|
| [Esquemas de respuesta r1](fixtures/app-v2-responses-proposal-r1.json) | `856102379197d8ab607443ac92448227ac395d00ab0764767a85188c9a90b23e` |
| [13 ejemplos sintéticos](fixtures/app-v2-response-fixtures-proposal-r1.json) | `2258c2279a7fc599c803e944fef3b9da1057943bb510dfbe4ca9a4cf29514600` |
| [Manifiesto de fuentes](fixtures/app-v2-response-source-proposal-r1.json) | Registra SHA de diez archivos del working tree LidIA y de los dos artefactos anteriores |

El manifiesto declara que el árbol fuente está en desarrollo; su HEAD no acredita que todos esos bytes estén commitados. Los fixtures no son capturas de HTTP ni de un modelo remoto.

Diferencias que requieren contraste LidIA:

- Sesión v2 devuelve `conversation_status`, `effective_permissions`, `operation_id`, actor y revisiones; no se reutiliza sin cambios SessionResponse v1.
- Revocación v2 devuelve `effective_at` y `propagation:primary_database`; no se confunde con el ACK propagating de v1.
- `Receipt.result` admite resultados cerrados de sesión/vínculo/contexto/revocación además del turno. El resultado histórico no prueba la autoridad actual.
- Recibos añaden actor `guest`; GET binding puede devolver `correlation_id:null`.
- El worker conserva `sondeo_result_id:null` y puede devolver `sondeo_result_revision:"0"`; esto no acredita cualificación.
- El texto no hereda el límite antiguo de 4000 caracteres del esquema del motor anterior. Se mantiene el límite global de respuesta del transporte. Presentaciones actuales y `context_changed` se contrastan por separado de HTML libre.

Comprobación de la propuesta con AJV: 13 fixtures válidos; campos extra, schema v1, revisiones numéricas, fecha imposible y sondeo estructurado rechazados. Una respuesta literal de más de 4000 caracteres no se rechaza sólo por aquel límite histórico. La conformidad y serialización .NET de estas formas siguen pendientes de LidIA.

## Evidencia y siguientes pasos

Los cambios de r3 y la matriz confirmada tuvieron RED observado antes de implementar: contacto se invocaba/publicaba; faltaban operaciones/recibos/handoff; binding admitía otra revisión. Las pruebas específicas actuales pasan (63, incluidas 32 de firma v1).

Un primer harness no arrancó su fixture MySQL; otro pasó 203 backend y agotó 5000ms en una prueba frontend de búsqueda/limpieza de recibos (151/152). Esa prueba pasó después aislada (14/14) y en el harness siguiente: 205 backend, 152 frontend y build APP. La repetición final tras ampliar la matriz terminó correctamente: **209/209 backend, 152/152 frontend y build APP**. No se ocultan los fallos previos ni se usan para afirmar aceptación nativa.

Quedan pendientes respuestas aceptadas por ambos equipos, principal/instalación/asociaciones durables y su API, vínculo/registro recuperable, ejecución real del 119, ciclo de gestor y aceptación nativa. Contacto reservado queda aplazado. No hay migración de BBDD existente, merge funcional a app/main, despliegue, activación guest, CRM/correo real ni prueba conectada acreditados por esta entrega.

Revisión independiente del candidato aislado: sin Critical/Important; 63/63 stateless reproducidos por el revisor. Dos hallazgos menores: el estado vivo del plan se actualiza en esta entrega documental; la prueba específica de rotación v2 queda anotada para la integración. Las pruebas de rotación v1 no la sustituyen. Se conserva el worktree y el ledger porque los bloques siguientes siguen pendientes.
