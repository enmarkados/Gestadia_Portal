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

## Precisión del usuario sobre responsabilidades

Zoho y agenda de las conversaciones APP pertenecen a LidIA y su agente. Portal aporta identidad, perfil, contexto y presentación. La integración directa de llamada/resolución de gestor existente en Portal deberá delegarse en LidIA cuando se cierre su contrato idempotente; no ampliar el adaptador CRM Portal. Esta adaptación es un bloque siguiente, no parte completada de la extensión de perfil preparada.

## Aceptación conectada posterior

11/10: dos turnos informativos seriales desde APP web completados, recuperados tras recargar y visibles en el detalle común LidIA sin Contacto obligatorio. Marca V1.722/PRO observada; [evidencia e IDs](../../app/evidencias/2026-10-11-lidia-v1722/README.md). No se activó perfil ni permisos CRM. Contraste del modelo/AgentState y ausencia de efectos pedido a LidIA. La delegación del formulario conserva el contrato receptor como dependencia pendiente.

## Criterio humano de aceptación: reserva real obligatoria

El usuario rechaza considerar la agenda comprobada sin llegar a reservar una llamada. La prueba de dos turnos conserva su evidencia como comprobación parcial de conversación, no como cierre del objetivo de agenda.

- [ ] Recibir teléfono, zona y franja reales autorizados para una llamada marcada como prueba técnica, sin inventar datos de elegibilidad ni presentar un sondeo ficticio como real.
- [ ] LidIA acredita conexión/entorno, vínculo CRM y ruta operativa de agenda. Concretar los requisitos efectivos de contexto y permisos para esta cuenta antes de cambiar Portal.
- [ ] Preparar, verificar y desplegar lo necesario en Portal tras copia y restauración comprobadas; cualquier autorización queda acotada a la prueba acordada, sin defaults generales ni acceso guest.
- [ ] Ejecutar por UI APP → agente real → disponibilidad → elección → creación de llamada; conservar conversación, turno, operación y recibos.
- [ ] Leer la llamada persistida en el sistema remoto y contrastar ID, fecha/hora/zona, teléfono y estado con la confirmación visible en APP. Una respuesta del modelo o HTTP202 no cierra esta comprobación.
- [ ] Ante resultado incierto, reconciliar la misma operación sin repetir la creación. Registrar límites y cualquier seguimiento operativo requerido para la prueba.

Solicitados datos al usuario y requisitos al equipo LidIA. El código Portal actual excluye crm_prepare/callback_schedule en currentAccess y rechaza concederlos mediante setConversationAccess; disponer del schema ampliado no activa la agenda.
