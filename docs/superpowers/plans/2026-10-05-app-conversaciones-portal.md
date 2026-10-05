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

- [ ] Escribir tests `backend/src/app/s2s.test.js`: vectores y negativas destino/query/Unicode, error sanitizado, sin retry implícito.
- [ ] Observar RED; implementar `backend/src/app/s2s.js`, `contracts.js` y copias exactas de esquemas. Configuración `backend/src/config.js` independiente por capacidad.
- [ ] GREEN: `node --test src/app/s2s.test.js`; no red externa. Commit protocolo.

## Task 2 — Cuenta y sesiones de dispositivo

- [ ] RED en `backend/src/app/identity.test.js`: legado sin fecha/método rechazado; prueba real consumida; token hasheado, logout/reset/revocación.
- [ ] Migración/schema con `User.accountStatus/accountVerifiedAt/accountVerificationMethod`, `AppDeviceSession`; `identity.js`, rutas autenticación APP y compatibilidad de `/api/me` con token APP.
- [ ] Prueba registrada al consumir invitación/reset reales en `/api/auth/set-password`, sin emitir credenciales o verificación ficticia para usuarios existentes.
- [ ] GREEN con MySQL efímero. Commit identidad.

## Task 3 — Asociaciones y operaciones durables

- [ ] RED en `backend/src/app/conversations.test.js`: dos dispositivos/nodos, payload conflicto, red ambigua, recibo retirado, reinicio.
- [ ] Modelos `AppConversation`, `AppOperation`, `AppConversationAccess`. `store.js` transacciones con lock de cuenta y retry de deadlock; `conversations.js` claim antes de HTTP y recuperación por misma operación.
- [ ] API `/api/app/v1/conversations`, `/:id/timeline`, `/:id/turns`, `/:id/handoff`, `/operations/:id`, `/operations/:id/retry`; autorización y errores problem+json.
- [ ] GET/lista recuperan asociación server-side sin cookies. Sesión cerrada sólo lectura. Proyección móvil sin agente/CRM/secretos.
- [ ] GREEN con concurrencia real y fixture remoto controlado; commit persistencia/API.

## Task 4 — Contexto y ciclo de vida

- [ ] RED para grants vencidos/retirados, caso ajeno, caso A→B, revisiones >2^53, revocación en vuelo y recuperación pendiente.
- [ ] Contexto revisado y operación outbox atómicos; grant de autoridad interno y ninguna ruta móvil permite escribir permisos/asignaciones. Sondeo gratuito sin CRM. Contexto privado sólo con grant vigente y pertenencia vigente.
- [ ] `lifecycle.js` bloquea cuenta y sesiones con outbox de revocación durable; worker dedicado sólo si feature habilitada. No restituye cuenta bloqueada con contexto activo.
- [ ] GREEN; commit autoridad.

## Task 5 — Consumidor APP

- [ ] RED en `frontend/app/src/AppConversation.test.jsx` y `conversationApi.test.js`: login/proyección, lectura paginada/deduplicada, acciones versionadas, estado humano, recuperación sin resend tras timeout, cierre, logout y cambio de cuenta.
- [ ] `conversationApi.js`, `AppConversation.jsx`, rutas/UI detrás de `conversationsEnabled`; `AppContext.jsx` usa sesión APP únicamente cuando esa feature está habilitada y conserva demo. Burbujas cliente negras LidIA/rojas atención humana; timestamps reales de timeline.
- [ ] Prohibir fallback automático a PluginWeb en la feature nueva. No mostrar Juan Carlos/asignación o evaluación inventados. Acciones vienen de presentación server-side; formulario móvil no amplía permisos.
- [ ] GREEN y build APP; commit UI.

## Task 6 — Cierre y coordinación

- [ ] Suite backend completa con MySQL aislado, suite frontend y build. Revisar diff, migración, configuración inactive, bytes fixtures y sanitización.
- [ ] Actualizar ledger, README-APP, docs/app/INTEGRACION-LIDIA y GLOSARIO con evidencia/limitaciones verificadas.
- [ ] Compartir rutas, fixtures y resultados con LidIA; resolver incompatibilidades locales. Commit final en rama propia; sin merge/deploy/activación.

## Registro de ejecución

- Baseline: dependencias lock instaladas. Node 24 expone WebStorage experimental que interfiere con jsdom; usar `NODE_OPTIONS=--no-experimental-webstorage`. Primera suite frontend 48/80 pasa y 32 falla por almacenamiento; repetir con flag. Backend inicial falla únicamente dos tests DB por ausencia DATABASE_URL; el intento de `--exclude` no excluyó esos tests. No había credenciales ni .env en este worktree.
- Ruling: usar MySQL 8 efímero local (provider real Prisma es mysql), no PostgreSQL ni una BBDD configurada por usuario. Container propio tmpfs, puerto loopback aleatorio, sin datos reales.
