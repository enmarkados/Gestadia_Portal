# APP: nuevas consultas119 e historial122 — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Resolver nuevas consultas al119 desde backend y conservar todos los chats/reintentos122 del mismo principal.

**Architecture:** Mantener AppConversationService por integración. Un registro servidor selecciona el servicio desde la asociación persistida y sólo aplica el destino nativo a nuevas consultas; el worker drena cada ámbito configurado con su propia audiencia. No cambiar fingerprints ni autorizar un selector móvil.

**Tech Stack:** Node.js, Express, Prisma/MySQL, APP v1 S2S, node:test; harness Docker local temporal.

**Spec:** [Conformidad y asociación](../../integraciones/2026-10-10-coordinacion-portal-contrato-v2.md), sección Asociación del119. Conformidad LidIA posterior recibida el11/10 en el chat autorizado: integración adicional gestadia-app-pro-agent119-validation,119/102/PRO, permisos sondeo/history. El mandato humano previo permite empezar una vez ambos equipos aceptan/reparten; ejecución inline sin pedir otra aprobación.

## Global Constraints

- Una sola cuenta/portal_user_id; no alta ni nuevos grants.
- APP v1; agente119/Project102 resuelto por LidIA, sondeo/history; GuestV2Enabled=false.
- Historial122/103, claves y asociaciones existentes intactos. Atención existente conserva ruta antigua.
- Nueva selección sólo opt-in privado; configuración incompleta falla cerrada, sin fallback122.
- Permisos de cuenta se revalidan por AppConversationService; no ampliar ni renovar autoridad por código.
- Mantener textos literales, sin cuestionario/calificador local. No v2, CRM, correo o agenda en este cambio.
- Manual/glosario/evidencia actualizados. Pruebas locales no equivalen a activación o UI real119.

## Review Focus

- Reintento anterior sin conversation_id con la misma key: conservar integración original, incluidos ACK inciertos; dos coincidencias se rechazan sin HTTP.
- Chat ajeno o ámbito no configurado:404 sin tráfico remoto, aunque su ID tenga formato válido.
- Desactivar nuevas consultas nativas: leer/retirar chats nativos existentes mientras permanezcan configurados.
- Grant existente con permisos comerciales/expediente: ámbito nativo limita sondeo/history, sin cambiar el grant persistido.
- Revocación/expiración en ambos ámbitos: worker usa la audiencia correcta; principal revocado no se lee desde ninguno.

### Task1: resolución de cuenta en dos integraciones

**Files:** crear `backend/src/app/registry.js`; modificar `backend/src/config.js`, `backend/src/app/routes.js`, `backend/src/app/store.js`, `backend/src/server.js`; probar en `backend/src/app/conversations.test.js` y `backend/src/app/registry.config.test.js`; actualizar manual/coordinación/glosario y `backend/.env.example`.

**Interfaces:**
- Consume: `AppConversationService(db, client, config)` y sus métodos start/list/rename/timeline/messageReceipts/ackMessages/turn/handoff/operation/retry; `authorized(token,fn)` y `drainLifecycle(db,client,config)` existentes.
- Produce: `appConversationIntegrations(config)` devuelve configuraciones por ámbito; `AppConversationRegistry(db,config,{clientFactory})` expone los mismos métodos de las rutas y `drainLifecycle()` para el worker. `nativeSondeo.createNew` decide creación, no autoridad ni lectura histórica.

- [x] Registrar configuración, plan y baseline. Instalar con npm ci en backend/frontend; ejecutar `node scripts/test-app-conversations.mjs` en este worktree, esperar178backend/152frontend/build sin migrar bases existentes.
- [x] RED configuración: `appConversationConfig({APP_CONVERSATIONS_ENABLED:'true',APP_LIDIA_INTEGRATION_ID:'old',APP_LIDIA_SONDEO_ENABLED:'true',APP_LIDIA_SONDEO_INTEGRATION_ID:'native',APP_LIDIA_SONDEO_AUDIENCE:'native'})` debe resolver old+native, IDs nuevos por capacidad, secretos conservados por capacidad y límite sondeo/history; habilitada sin identidad falla; apagada sin identidad no añade ámbito. Ejecutar `node --test backend/src/app/registry.config.test.js` y observar fallos por comportamiento ausente.
- [x] Implementar config mínima: `nativeSondeo` hereda destino del consumidor y secretos sólo por misma capacidad, exige IDs de clave propios (la fuente exige unicidad global), identifica otra audiencia y mantiene `generalSupport:false`, `generalCommercial:false`, `allowedPermissions:['sondeo','history']`. Crear `appConversationIntegrations(config)` sin aceptar IDs duplicados o config nativa incompleta. Repetir tests config hasta GREEN.
- [x] RED integrado: añadir casos que crean primero122 mediante servicio existente y después119 mediante registro; listado unido propio, apertura explícita/replay legacy, nueva nativa, reintento perdido sin duplicar, rechazo ajeno/ámbito desconocido. Los fixtures simulan sólo HTTP externo y conservan Prisma/identidad/servicios reales. Ejecutar harness; observar fallos por registro ausente o asociación incorrecta.
- [x] Implementar registro mínimo: resolver IDs bajo `authorized` con filtro userId y ámbitos configurados; start busca replay previo antes de aplicar destino nuevo y conserva candidato actual cuando no create_new. Dos replays posibles se rechazan409. Delegar al servicio por ámbito; unir listado ordenado por último mensaje/creación. No recibir integration_id del dispositivo.
- [x] RED autoridad/ciclo: probar que grant sondeo/history/support_handoff no abre soporte nativo ni cambia persistencia; timeline/recibos/rename/turn y operación pertenecen al ámbito del chat; cuenta revocada bloquea ambos y worker drena revocaciones/contextos con cliente de cada ámbito. Repetir harness y observar fallos antes de implementar cada comportamiento.
- [x] GREEN ciclo: limitar permisos en `currentAccess` cuando config tiene allowedPermissions; construir registro en rutas y worker; drenar lifecycle de cada servicio mediante Promise.allSettled para que un ámbito indisponible no bloquee retirar el otro. Propagar el fallo al caller tras atender todos.
- [x] Ejecutar harness completo, checks de docs/diff y revisión independiente de rama. Registrar RED→GREEN y límites reales; actualizar manual/coordinación con commit/evidencia, sin activar destino privado.
- [ ] Commit/push de rama aislada, handoff a LidIA; integración app/main y prueba conectada requieren revisión limpia y configuración/autoridad vigentes verificadas. No afirmar deploy/119/iPhone por tests.

## Resultado de revisión y puerta de recuperación

TresImportant corregidos mediante RED5→GREEN18, sinCritical/Minor. Harness final201backend/152frontend/buildAPP, exit0. Ver [procedimiento durable](../../app/2026-10-11-reanudacion-app-119.md). `setConversationAccess` usa configuración servidor por integración; no prepara contexto sin sus límites. Cuenta/base anterior desaparecida; claves recuperadas no reconstruyen autoridad. Commit/push de correcciones y handoff continúan; integración final/prueba conectada pendientes de recuperar cuenta o autorización humana explícita para fixture nuevo. El mapa mantiene las mismas pantallas y documenta asociación backend, sin activar v2.
