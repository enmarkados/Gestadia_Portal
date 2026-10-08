# Entrega Portal — conversaciones APP (05/10/2026)

Estado: implementación en rama `codex/app-conversaciones-backend`, basada en `app/main` a9cd579. Autorización humana y conformidad mutua en el [acta](2026-10-05-acta-inicio-conversacional.md). **Sin merge, despliegue, activación ni llamadas reales a LidIA/Zoho/pagos/correo.** La demo instalada no cambia. [Glosario](../../GLOSARIO.md).

## Reparto y contrato

Portal mantiene cuenta, prueba de identidad, sesiones por dispositivo, permisos, pertenencia de expediente, asociación e idempotencia. LidIA ejecuta sondeo, turnos y atención humana en el canal APP dedicado. Los flujos Zoho postean directamente a Portal: siguen siendo una integración distinta pendiente de receptor/disparadores. Checkout WhatsApp conserva su contrato existente.

Se aplican anexos de [firma S2S](2026-10-05-app-s2s-anexo-firma.md), [DTO](2026-10-05-app-anexo-dtos.md) y [contexto 1.1](2026-10-05-adenda-contexto-conversacional-v1-1.md). Dos precisiones confirmadas por LidIA el 05/10:

- `next_cursor` es un checkpoint opaco válido también con `has_more=false`; una página vacía conserva checkpoint, sin saltar mensajes concurrentes. Estado/contexto/recibos pueden cambiar sin movimiento de cursor.
- `history` solo permite historia pública clasificada. Caso privado requiere además `case_context` vigente para el caso ligado; mensajes mixtos o sin clasificación se ocultan íntegramente. Portal, que no recibe clasificación de privacidad por elemento, deniega la conversación ligada a caso completa si falta `case_context`. Una revisión de contexto distinta al terminar RPC descarta esa respuesta con `context_unavailable`.

Detalle de recibos: 30 días desde `accepted_at`; inicio retiene su respuesta 30 días. Claims/revisiones permanecen y operaciones pendientes no se purgan. Historial/cursor sin job de borrado hasta política acordada. Retirar detalle no libera key/turn/action; devuelve 410. Reintentos explícitos conservan operación y payload, con nonce S2S nuevo. No hay reenvío automático de una operación incierta desde la UI.

## API móvil implementada

Todas las rutas tienen prefijo `/api/app/v1`, respuesta sin caché y límites propios. Solo el login admite acceso sin token; el resto exige `Authorization: Bearer ga_…` de dispositivo. Un JWT legacy no concede acceso a esta API.

| Método / ruta | Función |
|---|---|
| POST `/auth/sessions` | `{email,password,device_label?}`; cuenta activa con prueba fechada; devuelve sesión opaca |
| GET `/auth/sessions` | Listar dispositivos propios activos |
| DELETE `/auth/sessions/current` o `/:id` | Revocar sesión propia |
| GET `/conversations` | Asociaciones propias, sin ids internos LidIA/CRM |
| POST `/conversations` | `{purpose:sondeo|atencion,case_ref?}` + `Idempotency-Key`; asociación durable |
| GET `/conversations/:id/timeline` | `cursor`/`limit` o `turn_id`; timeline o recibo exacto; permisos revalidados después de RPC |
| POST `/conversations/:id/turns` | Texto/acción y `turn_id`; acción usa ids/revisión emitidos por LidIA |
| POST `/conversations/:id/handoff` | `target_kind`, `reason` + key; destino y permisos vigentes |
| GET `/operations/:id` | Estado/recibo local de la operación autorizada |
| POST `/operations/:id/retry` | Body vacío; recuperar la misma operación, sin cambiar texto ni identidad |

Closed conserva lectura autorizada y recibos admitidos; no crea turnos/handoffs nuevos. Recibos y estado no retroceden por respuestas concurrentes atrasadas. Errores se proyectan como `application/problem+json` sin detalle remoto sensible.

La APP consume exclusivamente este prefijo cuando está habilitada. PluginWeb no se inicia como fallback. Sondeo no requiere CRM. Atención muestra nombre real solo si la plataforma confirma operador; no inventa Juan Carlos, assignment ni evaluación de viabilidad.

## Autoridad y almacenamiento

Migraciones nuevas: `20261005190000_app_identity` y `20261005200000_app_conversations`. No se han aplicado a ninguna BBDD existente. Modelos: `AppDeviceSession`, `AppConversation`, `AppOperation`, `AppConversationAccess`; `User.accountStatus/accountVerifiedAt/accountVerificationMethod`. Identificadores remotos y keys preservan mayúsculas con collation binaria. Revisiones decimales se comparan mediante BigInt.

`emailVerified` histórico no acredita por sí solo identidad para APP. Consumir una invitación/reset válido en el flujo existente `/api/auth/set-password` registra fecha/método y revoca dispositivos anteriores. No hay backfill automático ni generación de prueba para cuentas históricas. La sesión APP se guarda hasheada en backend y expira a los 30 días. Logout móvil solicita revocación del dispositivo; sin conexión se limpia estado local, pero el bloqueo remoto requiere la API.

`setConversationAccess` es un escritor interno de autoridad: no existe endpoint móvil para otorgar grants/asignaciones. Exige fuente/fecha/validez y pertenencia. Grant expirado o [] retira permisos sin restaurar defaults. `revokeAccount` bloquea cuenta, revoca dispositivos y prepara outbox por integración. Trabajador cada 20 segundos solo con flag activo: revocaciones antes del escaneo, contextos de retirada antes del resto, lotes con concurrencia máxima 4 y revisión de revocaciones entre grupos y durante el escaneo. Portal deniega inmediatamente con su autoridad actual. El objetivo distribuido de 60 s desde commit LidIA sigue sin prueba conectada.

## Configuración pendiente, desactivada por defecto

Backend: `APP_CONVERSATIONS_ENABLED=false` o ausente. Configuración separada:

- `APP_LIDIA_BASE_URL` raíz HTTPS, `APP_LIDIA_AUDIENCE`, `APP_LIDIA_INTEGRATION_ID` estable.
- `APP_LIDIA_{SESSION,READ,TURN,HANDOFF,CONTEXT,REVOCATION}_KEY_ID` y `_SECRET_BASE64`: seis roles dedicados, secretos en servidor, no en repo/móvil.
- `APP_LIDIA_GENERAL_SUPPORT` y `APP_LIDIA_GENERAL_COMMERCIAL`: false salvo política/cola general explícita.

Frontend: `frontend/app/public/app-config.js` conserva `conversationsEnabled:false` y `demoOnly:true`. Nunca introducir claves S2S allí. Habilitar solo después de revisión conjunta, configuración aislada DEV y prueba conectada autorizada. El agente/proyecto se resuelve en configuración LidIA, no se elige desde el móvil.

## Validación reproducible

Ejecutar desde la raíz con dependencias del lock instaladas e imagen local `mysql:8` disponible:

```sh
node scripts/test-app-conversations.mjs
```

El runner exige Docker Unix local, no descarga imágenes, crea MySQL tmpfs propio con puerto aleatorio loopback y usuario ficticio, espera conexión TCP real, genera Prisma, aplica las seis migraciones desde cero, ejecuta ambas suites y build; limpia únicamente su contenedor etiquetado. No lee `.env` ni usa BBDD del usuario.

Resultado local del 05/10: **94/94 backend, 91/91 frontend y build APP correctos**, Node 25.8.2, Prisma 6.19.3, MySQL 8. Casos: dos nodos/dispositivos, respuesta inicial perdida, turn_id/payload/key conflicto, closed/replay, grant parcial/total/caducado, propietario perdido, bloqueo en vuelo, revisión >2^53, recibo exacto, retries terminados en orden inverso, IDs case-sensitive, prioridad de revocación, rechazo UI definitivo y recarga sin resend. Diez vectores HMAC recibidos pasan; esquemas runtime son copias exactas de fixtures.

Revisión independiente encontró privacidad parcial, regresión del ledger, pendientes UI, inicio que omitía key, prioridad de revocación y collation. Se corrigieron con pruebas de regresión. La revisión final queda registrada en el [plan](../superpowers/plans/2026-10-05-app-conversaciones-portal.md).

Esto acredita tests locales con simulador del límite LidIA, no runtime del agente 119, intervención humana real, DEV aislamiento efectivo, transporte distribuido, build instalado en iPhone ni publicación.

## Antes de activar

- Completar/contrastar turnos, sondeo, acciones y mapping/operador de LidIA con esta proyección; probar identidad, recuperación multidispositivo y revocación en el entorno aislado autorizado.
- Aprovisionar configuración/roles/colas y verificar agente efectivo, instrucciones y ausencia de automatismos WhatsApp/CRM.
- Conectar escritor de grants/bloqueo a la autoridad operativa del Portal. La API interna preparada no sustituye el flujo de administración ni el receptor Zoho.
- Acordar onboarding de cuentas nuevas y correo real. Registro libre, receptor Zoho de conversión/ganado y borrado real de cuenta no se implementan en este bloque conversacional; la opción UI conectada de registro informa del acceso compartido mediante invitación.
- Definir retención/purga de historia y scopes antes de crear trabajos de borrado. No activar ni mezclar con la instalación demo vigente por el mero resultado de build.
