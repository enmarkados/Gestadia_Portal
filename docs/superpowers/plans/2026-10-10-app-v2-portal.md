# Portal APP v2 — Implementation Plan

> **For agentic workers:** ejecutar por bloques con superpowers:executing-plans y superpowers:test-driven-development; no delegar sin instrucción expresa. Este plan de preparación no sustituye el artefacto ejecutable LidIA que condiciona los bloques posteriores.

**Goal:** preparar y consumir el contrato APP v2 para consulta visitante, solicitud durable y vínculo de la misma conversación, preservando v1.

**Architecture:** módulo v2 separado en Express/Prisma, con credencial de instalación y asociación por chat. Portal conserva operaciones y solicitudes antes de HTTP; LidIA mantiene el ledger remoto, revisión vigente, binding y ACK. React sólo consume Portal. No hay conversión CRM o agenda en este módulo.

**Precisión humana posterior:** la pasarela transmite mensajes al agente 119 y muestra su respuesta. Las preguntas y decisiones pertenecen al agente; no crear un cuestionario/calificador/catálogo paralelo ni condicionar el transporte a ese catálogo. Texto como base y respuestas dinámicas opcionales. Esta decisión se comprobó directamente y se registra en la coordinación enlazada. Las operaciones de contacto conservan sus requisitos de identidad/confirmación, pero wire r3 las reserva y aplaza: quedan fuera de las rutas y capacidades de esta entrega.

**Tech Stack:** Node ≥22.5, Express 4, Prisma 6/MySQL 8, AJV 8, React/Vite, Vitest y harness MySQL temporal existente.

**Spec:** [coordinación y autorización](../../integraciones/2026-10-10-coordinacion-portal-contrato-v2.md), [contraste vigente del wire r3](../../integraciones/2026-10-10-contraste-portal-wire-v2-r3.md), [propuesta Portal](../../integraciones/2026-10-10-propuesta-app-anonima-lidia.md), [revisión LidIA histórica](../../integraciones/2026-10-10-revision-lidia-app-anonima.md), [mapas](../../app/2026-10-10-mapas-pantallas-app-anonima.md), [glosario](../../../GLOSARIO.md). Se recibieron wire r3, requests schema y seis vectores con SHA comprobados; el contrato de respuestas sigue en revisión conjunta.

## Global Constraints

- Base `app/main` 7bfa689; rama `codex/app-v2-guest-portal`, worktree aislado existente.
- Opt-in backend v2 deshabilitado por defecto. No fallback de login/cuenta v1 a guest ni modificación de `accountProof` o hashes históricos.
- Sujeto inmutable por conversación; actor y propietario separados. Vincular A no revoca B ni reetiqueta mensajes, operaciones o recibos.
- Cuenta verificada **y** control original para vínculo; GET de un enlace no consume tokens. Instalación perdida bloquea.
- Resultado suficiente completo y voluntad expresa antes de nombre y teléfono O email. Solicitud visitante; cuenta opcional después.
- Sin despliegue, activación, migración de BBDD existente, CRM, correo real, pagos o agenda de producción. Pruebas con base temporal y transportes externos controlados.
- No entregar datos a Zoho hasta cerrar receptor, payload y operación separados. No afirmar cita, conversión o ganado por un ACK.
- Actualizar manual/mapas/capturas con cualquier recorrido funcional. Guardar copias externas exactas y procedencia; glosario inmediato.

## Review Focus

1. Revisión/evento cambiados entre GET y ACK: bloqueo 5 prueba conflicto, sin recepción final ni entrega CRM.
2. Vínculo A con operación incierta y chat B activo: bloque 4 prueba CAS/cola, recuperación account sin resucitar guest ni retirar B.
3. Cuenta revocada, cursor/replay antiguos y respuesta en vuelo: bloques 3/4 prueban autoridad antes y después de HTTP, incluso desde caché.
4. Firma/query/Unicode y rotación de clave: bloque 2 reproduce vectores compartidos y cambia sólo transporte, no identidad semántica.
5. Alta cancelada/enlace copiado/instalación perdida: bloques 4/6 conservan solicitud recibida, bloquean apropiación y recuperan origen completo.

## Bloque 1 — Contrato y preparación documental

**Files:** coordinación de integración, este plan, `GLOSARIO.md`, `docs/app/MANUAL-DESARROLLO.md` e índice de integraciones.

**Interfaces:** consume la instrucción humana leída y los mapas; produce reparto y preguntas de cierre. No produce rutas/DTO disponibles.

- [x] Leer manual/mapas y código actual a través del grafo: `AppS2SClient`, `AppIdentity`, `accountProof`, `AppConversation`, `createAppRouter`.
- [x] Registrar que AppConversation y AppDeviceSession v1 exigen User; no reutilizarlos mediante una cuenta ficticia.
- [x] Compartir reparto y preferencia GET/ACK con LidIA, incluyendo carrera cancelación–ACK y recuperación después del vínculo.
- [x] Revisar enlaces/diff, guardar commit y sincronizar la rama de preparación.

## Bloque 2 — Consumidor de contrato S2S v2

**Entrada obligatoria:** contrato LidIA, JSON Schema y vectores JS/.NET con SHA, rutas/capacidades y semántica GET/ACK conformes. Sin esa entrada el bloque no es ejecutable; no escribir DTO ficticios.

**Files:** crear `backend/src/app/v2/s2s.js`, `s2s.test.js`, `contracts.js`, `contracts.test.js` y copias en `backend/src/app/v2/contracts/`; modificar `backend/src/config.js` y sus tests.

**Interfaces locales propuestas:** `AppS2SClientV2.call(capability, method, path, authority, dto, options)`; `authority` tiene sujeto/actor/revisión según esquema recibido. Devuelve status y dato validado. Los nombres del DTO remoto se toman del artefacto, no de este plan.

- [x] Copiar bytes del artefacto y comprobar SHA; registrar procedencia en coordinación.
- [ ] RED: todos los vectores canónicos, GET sin cuerpo, query alterada, sujeto/actor/revisión alterados, esquema abierto, >32KiB, redirects/destino móvil, secret/key ausentes, flags off y ninguna caída a v1.
- [ ] Ejecutar `node --test backend/src/app/v2/s2s.test.js backend/src/app/v2/contracts.test.js` y observar los fallos por ausencia del consumidor.
- [x] Implementar cliente/validadores aislados con allowlist exacta y configuración explícita; no cambiar `backend/src/app/s2s.js` ni `identity.js` v1.
- [x] GREEN observado para seis vectores recibidos y 63 pruebas stateless, incluidas 32 de firma v1; harness final 209 backend, 152 frontend y build APP correctos. Los RED observados y correcciones están en el contraste r3.
- [ ] Completar la prueba específica de rotación v2 conservando bytes de negocio e idempotencia; hallazgo menor pendiente de revisión.
- [ ] Aceptar esquemas cerrados de respuestas con LidIA y conectar sus validadores. La propuesta r1 es sólo documental; ahora cada llamada exige un validador explícito antes de HTTP.
- [ ] Integrar este cliente con autoridad persistida y rutas; sólo después de las entradas de bloques 3/4. Commit/push de la preparación no acredita esa integración.

## Bloque 3 — Instalación y asociaciones propias

**Entrada:** bloque 2 y vigencias/capacidades guest cerradas. Antes del cambio Prisma, revisar migración aditiva contra la base temporal, nunca la BBDD existente.

**Files:** crear `backend/src/app/v2/installation.js`, `installation.test.js`, `store.js`, `store.test.js`, `routes.js` y `routes.test.js`; modificar `backend/prisma/schema.prisma` y agregar migración aditiva; montaje opt-in en `backend/src/app.js`.

**Interfaces propuestas:** credencial de instalación aleatoria hasheada `AppGuestSession`; `authenticateInstallation(token)` resuelve identidad server-side. `AppV2Conversation` conserva sujeto, instalación origen, propietario actual nullable y revisiones. Rutas móviles exactas se fijarán aquí después del artefacto, en un anexo de este plan antes del RED.

- [ ] RED: secreto sólo devuelto al alta, expiración/revocación, token ajeno, cuenta v1 inválida sin guest, dos instalaciones/chats, idempotencia tras restart, paginación/lista filtrada, permisos de expediente denegados y autoridad revocada durante HTTP.
- [ ] Ejecutar esos tests con MySQL temporal mediante el harness; observar RED.
- [ ] Implementar identidad/asociaciones/operaciones separadas, locks y límites de abuso; montaje v2 deshabilitado por defecto. El móvil no elige UUID de sujeto ni amplía permisos.
- [ ] GREEN con concurrencia real y regresiones v1; comprobar migraciones desde cero y conservación del modelo v1; commit/push.

## Bloque 4 — Registro y vínculo recuperable

**Entrada:** schema/fases/capacidades binding y contrato de verificación de cuenta disponibles; no simular emailVerified ni consumo de invitación. Antes del RED, cerrar en el plan rutas y método de verificación con un adaptador de correo local de pruebas.

**Files:** crear `backend/src/app/v2/bindings.js`, `bindings.test.js`, `registration.js`, `registration.test.js`; extensión de rutas v2 y entidad `AppV2Binding` en schema/migración aditiva.

**Interfaces:** consume accountProof existente como prueba real de cuenta y credencial original vigente; persiste prepare/commit/abort y destino único por chat. Consulta el recibo de la operación exacta sin volver a ejecutar un inicio guest alterado.

- [ ] RED: cuenta sin prueba, link copiado/GET de escáner, instalación perdida, token consumido/vencido, dos cuentas, A/B, turno pendiente/unknown al prepare, timeout sin autoabort, commit/ACK perdido y cuenta revocada antes del replay.
- [ ] Ejecutar tests con MySQL temporal y transporte LidIA controlado; observar RED.
- [ ] Implementar tokens hasheados de un uso, control original y ledger de fases; congelar cambios inciertos y reconciliar antes de commit/abort. No modificar recibos/actores previos.
- [ ] GREEN y probar cancelación del alta con solicitud intacta; commit/push.

## Bloque 5 — Solicitud durable y ACK (aplazado por wire r3)

**Estado vigente:** reservado y fuera de las capacidades/rutas de la primera entrega. El siguiente diseño se conserva para revisión futura; no ejecutarlo a partir de los vectores reservados.

**Entrada futura:** acción de contacto emitida por el agente y contrato de GET/ACK publicado, incluida la decisión atómica ante revisión/cancelación concurrentes. Portal no reevalúa requisitos ni fabrica un positivo operativo. No añadir un catálogo de canje como dependencia; el transporte de texto al 119 es independiente de este bloque.

**Files:** crear `backend/src/app/v2/contactRequests.js`, `contactRequests.test.js`; `AppContactRequest` y migración aditiva; rutas v2 y proyección de solicitud propia.

**Interfaces:** consume evento exacto de LidIA; conserva identidad integración/sujeto/evento/intención/revisión y hash de payload. Produce estado local pendiente y luego recepción confirmada sólo por ACK válido recuperable. No produce una llamada al CRM.

- [ ] RED: parcial/negativo/human_review sin solicitud; favorable sin voluntad; canal único suficiente; mismo evento/payload deduplicado; mismo ID con payload distinto conflicto; caída antes/después de persistir/ACK; cancelación o revisión concurrente; vínculo durante ACK pendiente; doble proceso; actor histórico preservado.
- [ ] Ejecutar tests reales de concurrencia y restart en MySQL temporal con fixture remoto controlado; observar RED.
- [ ] Implementar fila durable antes de ACK, recuperación con identidad/key estables y ningún efecto externo implícito. Revalidar autoridad antes de devolver estado; recibir no equivale a contactar/agendar.
- [ ] GREEN y verificar que cancelar registro no cancela ni reenvía solicitud recibida; commit/push. Entrega Zoho permanece sin writer hasta su contrato separado.

## Bloque 6 — Consumidor APP y aceptación

**Entrada:** API v2 comprobada, contratos anteriores conformes y recorridos visuales con aprobación aplicable; reabrir inventario de pantallas al iniciar el bloque.

**Files:** `frontend/app/src/AppContext.jsx`, `conversationApi.js`, `AppConversation.jsx` y sus tests; nuevas unidades v2 enfocadas según interfaces cerradas; `docs/app/NAVEGACION.md`, mapas/maqueta/capturas, manual y acta de validación.

- [ ] RED: entrada fría/caliente deduplicada sin cuenta/contacto inicial; Mensajes sólo propios; nuevas conversaciones explícitas; respuesta textual del botón; pending/negativo/recibida distintos; cuenta opcional cancelable; link protegido y origen completo; cambio de principal desmonta observadores y no envía lotes guest como account.
- [ ] Ejecutar tests frontend con `NODE_OPTIONS=--no-experimental-webstorage`; observar RED.
- [ ] Implementar consumidor únicamente de Portal, sin rutas S2S/claves/selección de agente en móvil. Reutilizar el diseño vigente y mostrar datos reales de proyección.
- [ ] GREEN, `npm run app:build`, harness completo; recorrer mapas con capturas actualizadas. Probar emuladores/iPhone y conexión real por separado y registrar lo no observado.
- [ ] Cierre coordinado de resultados, commit/push/sync de rama; merge/deploy/activación sólo con alcance autorizado específico, sin convertir fixture o build en prueba de producción.

## Estado de ejecución

10/10/2026: **bloque 1 documental entregado y transporte/requests del bloque 2 implementados en la rama aislada** `codex/app-v2-guest-portal`. Requests/schema/vectores son copias exactas; r3 y la matriz posterior excluyen contacto y fijan la revisión exacta de binding. Pasan 63 pruebas stateless y el harness final: 209 backend, 152 frontend y build APP. Revisión independiente sin Critical/Important.

El bloque 2 sigue pendiente de respuestas aceptadas e integración con autoridad real; queda una prueba menor de rotación v2. Las respuestas r1 propuestas no se importan en runtime. **Bloques 3/4/6 pendientes; bloque 5 aplazado.** No hay nuevas tablas, rutas v2 montadas, flags activados, merge funcional a app/main, despliegue ni prueba real del agente 119 por esta entrega. Ver [procedencia, evidencia y límites](../../integraciones/2026-10-10-contraste-portal-wire-v2-r3.md).

Verificación histórica del bloque 1 documental: 114 enlaces locales válidos, `git diff --check` y ausencia de cambios de producto respecto a 7bfa689. No se ejecutó una suite funcional para acreditar una implementación inexistente. La precisión humana posterior elimina la exigencia de un catálogo paralelo: Portal transmite al agente y consume sus respuestas/acciones.

Recibido después el borrador [wire r1](../../integraciones/2026-10-10-app-v2-wire-lidia-r1.md), con [revisión Portal P1–P4](../../integraciones/2026-10-10-revision-portal-wire-v2-r1.md). Se conserva como snapshot de trabajo exacto; no sustituye la entrada de schema/vectores/SHA de entrega requerida por el bloque 2.
