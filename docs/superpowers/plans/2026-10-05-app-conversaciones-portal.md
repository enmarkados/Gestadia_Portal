# API conversacional APP en Portal — Implementation Plan

> For agentic workers: ejecutar con superpowers:executing-plans en este chat; pruebas con superpowers:test-driven-development. La autorización humana verificada y la conformidad mutua sustituyen una nueva ronda de aprobación.

**Goal:** conectar la APP con conversaciones autenticadas mediante Portal, con identidad acreditada, recuperación durable y revocación.
**Architecture:** Express/Prisma MySQL conserva autoridad y operaciones antes de llamar a LidIA; cliente HMAC dedicado; React sólo consume `/api/app/v1`.
**Tech Stack:** Node 24, Express 4, Prisma 6, MySQL 8, React 18, Vitest.
**Spec:** [acta](../../integraciones/2026-10-05-acta-inicio-conversacional.md), [DTO](../../integraciones/2026-10-05-app-anexo-dtos.md), [S2S](../../integraciones/2026-10-05-app-s2s-anexo-firma.md), [contexto 1.1](../../integraciones/2026-10-05-adenda-contexto-conversacional-v1-1.md), [glosario](../../../GLOSARIO.md).

## Global Constraints

Rama `codex/app-conversaciones-backend`, worktree propio desde `app/main` a9cd579. Feature backend/móvil deshabilitada por defecto. Sin despliegue, activación o llamadas reales LidIA/CRM/pagos/correo/WhatsApp. No modificar contratos históricos. No migrar BBDD existente. Mantener checkout WhatsApp y la demo visual. No inferir gestor desde Zoho Owner ni identidad desde emailVerified histórico. Conservar marcas e historial, sin job de purga; recibos públicos 30 días, operación pendiente preservada. Reintentos conservan payload/key; nonce nuevo, sin efectos nuevos por pérdida de respuesta.

## Review Focus

1. Identidad y revocación en vuelo: tareas 2/4 bloquean cuenta/dispositivo en cada exposición, incluyendo cache y replay.
2. Concurrencia y caída tras enviar: tarea 3 mantiene asociación y claim durable, prueba con MySQL real aislado y cliente falso externo.
3. Cambio de caso/contexto: tarea 4 conserva ámbito y revisión exacta, [] retira sin defaults, permiso vigente antes de toda llamada.
4. Bytes firmados/rotación: tarea 1 usa vectores publicados, límites Unicode/query, claves por facultad y sin redirects.
5. Recuperación UI: tarea 5 diferencia pendiente, error conocido y resultado incierto, nunca reenvía con key nueva ni fabrica operador/sondeo.

## Task 1 — Protocolo y cliente

- [x] Escribir tests `backend/src/app/s2s.test.js`: vectores y negativas destino/query/Unicode, error sanitizado, sin retry implícito.
- [x] Observar RED; implementar `backend/src/app/s2s.js`, `contracts.js` y copias exactas de esquemas. Configuración `backend/src/config.js` independiente por capacidad.
- [x] GREEN: `node --test src/app/s2s.test.js`; no red externa. Commit protocolo.

## Task 2 — Cuenta y sesiones de dispositivo

- [x] RED en `backend/src/app/identity.test.js`: legado sin fecha/método rechazado; prueba real consumida; token hasheado, logout/reset/revocación.
- [x] Migración/schema con `User.accountStatus/accountVerifiedAt/accountVerificationMethod`, `AppDeviceSession`; `identity.js`, rutas autenticación APP y compatibilidad de `/api/me` con token APP.
- [x] Prueba registrada al consumir invitación/reset reales en `/api/auth/set-password`, sin emitir credenciales o verificación ficticia para usuarios existentes.
- [x] GREEN con MySQL efímero. Commit identidad.

## Task 3 — Asociaciones y operaciones durables

- [x] RED en `backend/src/app/conversations.test.js`: dos dispositivos/nodos, payload conflicto, red ambigua, recibo retirado, reinicio.
- [x] Modelos `AppConversation`, `AppOperation`, `AppConversationAccess`. `store.js` transacciones con lock de cuenta y retry de deadlock; `conversations.js` claim antes de HTTP y recuperación por misma operación.
- [x] API `/api/app/v1/conversations`, `/:id/timeline`, `/:id/turns`, `/:id/handoff`, `/operations/:id`, `/operations/:id/retry`; autorización y errores problem+json.
- [x] GET/lista recuperan asociación server-side sin cookies. Sesión cerrada sólo lectura. Proyección móvil sin agente/CRM/secretos.
- [x] GREEN con concurrencia real y fixture remoto controlado; commit persistencia/API.

## Task 4 — Contexto y ciclo de vida

- [x] RED para grants vencidos/retirados, caso ajeno, caso A→B, revisiones >2^53, revocación en vuelo y recuperación pendiente.
- [x] Contexto revisado y operación outbox atómicos; grant de autoridad interno y ninguna ruta móvil permite escribir permisos/asignaciones. Sondeo gratuito sin CRM. Contexto privado sólo con grant vigente y pertenencia vigente.
- [x] `lifecycle.js` bloquea cuenta y sesiones con outbox de revocación durable; worker dedicado sólo si feature habilitada. No restituye cuenta bloqueada con contexto activo.
- [x] GREEN; commit autoridad.

## Task 5 — Consumidor APP

- [x] RED en `frontend/app/src/AppConversation.test.jsx` y `conversationApi.test.js`: login/proyección, lectura paginada/deduplicada, acciones versionadas, estado humano, recuperación sin resend tras timeout, cierre, logout y cambio de cuenta.
- [x] `conversationApi.js`, `AppConversation.jsx`, rutas/UI detrás de `conversationsEnabled`; `AppContext.jsx` usa sesión APP únicamente cuando esa feature está habilitada y conserva demo. Burbujas cliente negras LidIA/rojas atención humana; timestamps reales de timeline.
- [x] Prohibir fallback automático a PluginWeb en la feature nueva. No mostrar Juan Carlos/asignación o evaluación inventados. Acciones vienen de presentación server-side; formulario móvil no amplía permisos.
- [x] GREEN y build APP; commit UI.

## Task 6 — Cierre y coordinación

- [x] Suite backend completa con MySQL aislado, suite frontend y build. Revisar diff, migración, configuración inactive, bytes fixtures y sanitización.
- [x] Actualizar ledger, README-APP, docs/app/INTEGRACION-LIDIA y GLOSARIO con evidencia/limitaciones verificadas.
- [x] Compartir rutas, fixtures y resultados con LidIA; resolver incompatibilidades locales. Commit final en rama propia; sin merge/deploy/activación.

## Registro de ejecución

- Baseline: dependencias lock instaladas. Node 24 expone WebStorage experimental que interfiere con jsdom; usar `NODE_OPTIONS=--no-experimental-webstorage`. Primera suite frontend 48/80 pasa y 32 falla por almacenamiento; repetir con flag. Backend inicial falla únicamente dos tests DB por ausencia DATABASE_URL; el intento de `--exclude` no excluyó esos tests. No había credenciales ni .env en este worktree.
- Ruling: usar MySQL 8 efímero local (provider real Prisma es mysql), no PostgreSQL ni una BBDD configurada por usuario. Container propio tmpfs, puerto loopback aleatorio, sin datos reales.

- Bloque protocolo/identidad committed `aa7f100`: pruebas RED→GREEN; diez vectores de firma originales, Unicode/query y boundaries. Esquemas runtime SHA256 coinciden byte a byte con los originales.
- Suite reproducible `node scripts/test-app-conversations.mjs`: Docker Unix local, imagen MySQL8 ya disponible, tmpfs/puerto loopback aleatorio; .env deshabilitado, prueba TCP del usuario definitivo evita carrera de servidor temporal; seis migraciones aplicadas desde cero y limpieza del propio contenedor por etiqueta.
- Última validación completa: **94 backend /91 frontend /build APP**, Node25.8.2 y Prisma6.19.3. Flag de WebStorage deshabilitado para jsdom. Los warnings existentes de Router/jsdom/Vite no son fallos; no se han usado como evidencia de conexión real.
- Revisión independiente: retirada parcial de case_context, regresión por reply/timeout tardío, rechazo UI persistente, replay de inicio omitiendo ledger, collation remoteId y prioridad de revocación. Correcciones con tests negativos reproducidos y posterior suite completa. Variantes adicionales: reply inicial tardío no pisa closed, revocación entrante durante contexto se atiende entre grupos, recibo de revisión mayor no retrocede.
- Ruling de privacidad confirmado por LidIA: history pública clasificada; caso requiere case_context + caso ligado. Portal carece de clasificación por item y deniega íntegramente conversaciones de caso sin ese permiso. Descarta RPC cuya revisión de contexto cambia en vuelo. Cursor de cola next_cursor válido aunque has_more=false; no purga de historia/cursor.
- Entrega actual en `docs/integraciones/2026-10-05-entrega-portal-conversaciones-app.md`; README/glosario/índices actualizados. Compartida ruta con equipo LidIA. Fuente informa endpoints iniciales locales y sigue implementando turnos/sondeo/handoff; no hay E2E cruzado acreditado.
- Fuera de bloque: alta libre/correo real, receptores/disparadores Zoho, writer operativo grants/asignación/bloqueo y borrado real de cuenta. Preparar antes de activación; no simular esos efectos con la UI demo.
- Flags backend/APP false por defecto. No merge, deploy, activación, instalación nueva móvil, BBDD existente ni llamadas reales. Rama/worktree propios conservados para revisar.

- Contraste posterior de atención comunicado por LidIA: HTTP202 con handoff completed/requested y409 identity_link_required sin destino alternativo. Se añade aviso UI explícito y cinco tests de contrato/S2S/proxy/UI; suite aislada completa **97backend/93frontend/build**. Detalle en `docs/integraciones/2026-10-05-compatibilidad-atencion-app.md`. Continúa desactivada; no sustituye prueba conjunta real.

- Muestras de servicios locales LidIA copiadas byte-exacto (`app-v1-service-samples.json`,SHA256a9c528b036ca2058b4f9679d0d1225882b73cf678953fefa29e31797991c25e7): seis validadores, recorrido de proyección/recuperación en MySQL y consumidor de acciones reales del fixture. Suite aislada backend104; posterior frontend95/build tras corregir atribución histórica de operador (RED→GREEN). Doc `2026-10-05-contraste-muestras-servicios-app.md`. Aceptada precisión §5 de transferencia explícita, sin handoff automático al cambiar contexto. Muestras de atención y E2E real siguen pendientes; flagsfalse.

- Conformidad final de las nueve muestras recibidas en fichero v2 independiente SHA256bb194f44dec0a3fcd091bf60328881a41fc47facaa1d4297d25ac7402a01ab01: nueve schemas, proyección de atención in_support/operator actual, recibo completed/requested y409routing_unavailable por S2S/proxy/UI sinfallback. Suite aislada completa **115backend/97frontend/build**. Fuente anuncia PRLidIA1600 (core01f9d6c5e) y164tests propios; no ejecutados por Portal. Cierre offline en `2026-10-05-conformidad-final-muestras-app.md`, sin certificación de despliegue/efectos reales. Ambas ramas conservan flagsfalse.

## Verificación conectada local — 06/10/2026

Autorizada por el usuario. APP 5174 / Portal 5173 / API 3001 y LidIA 7443 con TLS estricto, bases temporales y modelo determinista: 61 comprobaciones HTTP/API aprobadas y flujo de navegador. Retirada 16,29 s, revocación 6,96 s. Se encontró aviso obsoleto en Volver a cargar, se reprodujo RED, corrigió y repitió en navegador. Resultado actual 115/115 backend (fresco, antes del ajuste UI), 98/98 frontend y build. [Acta y límites](../../integraciones/2026-10-06-prueba-local-app-portal-lidia.md). Servicios locales disponibles para el usuario; flags versionados false, sin merge/deploy remoto.
