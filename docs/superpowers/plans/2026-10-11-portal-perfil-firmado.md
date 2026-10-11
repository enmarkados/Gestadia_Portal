# Plan de implementación: perfil firmado Portal

> Ejecución en este worktree con superpowers:executing-plans y test-driven-development, dentro del alcance de implementación autorizado por el usuario.

**Objetivo:** preparar el perfil opcional v1 y los contratos compartidos v1/v2, apagados por defecto, con parches durables y entrega recuperable.
**Arquitectura:** perfil acreditado desde User, comparado con una base Portal por conversación; queueContext persiste revisión y parche junto al ledger en una transacción. El perfil no aporta permisos CRM ni inventa zona/consentimiento. El consumidor v2 de invitado conserva su contrato; el contexto de cuenta v2 no se activa.
**Tecnología:** Node22+, Prisma6/MySQL, AJV2020, firma S2S existente.
**Spec:** [contraste y acuerdo de parches](../../integraciones/2026-10-11-contraste-portal-perfil-agenda.md).

## Restricciones
- APP_LIDIA_PROFILE_CONTEXT_ENABLED=false por defecto, extensión optativa por integración.
- Sin grants crm_prepare/callback_schedule, cambios de conexiones, despliegue ni migración productiva.
- Revisión decimal positiva de 1–20 dígitos, body/key persistidos e idénticos en reintentos.
- Sólo perfil server-side de cuenta comprobada: display_name/email/teléfono E.164 explícito. No zona/consentimiento ni +34 supuesto.
- Copias históricas intactas; nuevos artefactos recibidos con hash e igualdad de bytes.

## Riesgos y pruebas
1. Cambio sólo email no repone teléfono: prueba de segundo parche y cambio sólo permisos.
2. Operaciones anteriores superseded pierden parches: prueba de entrega ordenada, bloqueo de revisión posterior y retry perdido.
3. Flag apagada o grants nuevos amplían autoridad: prueba de omisión completa/rechazo de grants, sin efectos externos.
4. Schema cerrado/ACK incompatible: vectores positivos/negativos v1/v2 y firmas exactas; guest no envía extensión.
5. Rollback/concurrencia/cruce de cuentas: base efímera real, bloqueo User existente, parches por conversación y rollback sin ledger parcial.

## Tarea1: contratos y builder durable
Archivos: schemas bajo backend/src/app/{contracts,v2/contracts}; nuevas copias fixtures con sufijo perfil; backend/src/app/profile.js, store.js, config.js, prisma/schema.prisma y migración aditiva; conversaciones.test.js y profile-contracts.test.js.
- [x] Escribir tests RED de perfil flag-on, diff de email, retirada y omisión flag-off.
- [x] Ejecutar node scripts/test-app-conversations.mjs y observar fallos por extensión ausente.
- [x] Copiar esquemas recibidos exactos; conservar fixtures históricos.
- [x] Implementar proyección limitada y diff contra profileBaseline; persistir profileRevision/profilePatch/profileBaseline en AppConversation y DTO de contexto.
- [x] Validar que permisos CRM no se conceden aunque el schema los reconozca; extensión omite campos si apagada.

## Tarea2: lifecycle recuperable
Archivos: backend/src/app/lifecycle.js y conversaciones.test.js.
- [x] RED: dos parches pendientes deben llegar por orden, no superseded; respuesta perdida no deja saltar al siguiente.
- [x] Resolver operación previa de perfil antes de posterior; conservar supersede legacy sin perfil y prioridad de revocación de cuenta.
- [x] Validar ACK profile_revision exacta y revisión vigente no superior al estado Portal; fallos permanecen inciertos.
- [x] Ejecutar suite completa con base aislada, frontend/build y revisar diff.

## Cierre
- [x] Registrar hashes, pruebas y limitación de consumidor de contexto account v2 todavía pendiente.
- [x] Revisión independiente, commit y push autorizados de esta rama; informar LidIA.
- [x] Mantener runtime y TestFlight actuales sin redeploy.

## Decisiones y evidencia

Ruling: una única revisión perfil no confirmada — preservar parche y retirada prioritaria — el cambio de User se difiere hasta ACK sin mover baseline. Contraste LidIA conforme. Ruling: consumidor account v2 no existente se mantiene fuera de esta extensión v1; contratos/firma v2 preparados y guest sin autoridad CRM.

RED y GREEN acreditados en evidencia de perfil. 302backend/204frontend/buildPASS, migración sólo base efímera; revisor corrigió P1 retirobloqueado y no ve nuevos hallazgos. Commit/push de esta rama al cerrar; producción sin cambios.
