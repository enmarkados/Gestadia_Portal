# Revisión Portal del transporte LidIA APP v2 r1

**10/10/2026 · Revisión abierta.** [Coordinación](2026-10-10-coordinacion-portal-contrato-v2.md) · [Plan Portal](../superpowers/plans/2026-10-10-app-v2-portal.md) · [Copia exacta r1](2026-10-10-app-v2-wire-lidia-r1.md) · [Glosario](../../GLOSARIO.md).

Fuente: `/Users/gonchumon/.codex/worktrees/gestadia-app-conversacional/Gestadia_LidIA/docs/integraciones/2026-10-10-app-v2-wire-contract.md`, revisión declarada `2.0-r1`. Snapshot de trabajo recibido por el chat LidIA; **sin commit de entrega ni esquemas/vectores cerrados acreditados en esta recepción**. SHA256 leído y comprobado al copiar: `ace6e2ebd6986e345561290d19c40f725c86c0f2fcf61db709786a67adbf9bfb` (8222 bytes). La copia no se reescribe; sus enlaces relativos pertenecen al repositorio LidIA original.

## Conforme para continuar el cierre

Prefijo v2 y firma de trece líneas separados de v1; guest opt-in; revisiones/actor firmados también en lectura; límite guest propuesto de 24h sin renovación por resume; prepare propuesto de 10min que bloquea sin autoabort; sujeto por chat, control original y recuperación de vínculo; publicación por GET y ACK tras persistencia Portal; catálogo incompleto con gate favorable cerrado. Esta conformidad de revisión no sustituye validación del schema, vectores o runtime.

## Cuatro precisiones enviadas

| ID | Punto | Condición para el consumidor |
|---|---|---|
| P1 | Huella del inicio excluye «atestaciones» sin enumerar sus campos | Especificar exactamente qué queda fuera. kind/actor_id y el negocio original no cambian para recuperar un inicio guest como account. Después del vínculo se consulta ese inicio, sin reenviar identity alterada. Separar autoridad del transporte y negocio histórico. |
| P2 | GET por intent_id puede devolver otra revisión al reconciliar una anterior | Recuperar revisión/evento exactos; preferencia Portal: query intent_revision obligatoria y firmada para esa consulta. Cerrar DTO ACK/GET con identidad, operation_id, referencia y fecha durables. Un received de otro evento no resuelve el pendiente original. |
| P3 | Revocación cuando cuenta ya está disabled/deleted o guest vencido | Definir autorización lifecycle con capacidad/key y destino comprobados. No fabricar accountProof activo para revocar ni conceder timeline/replay de chat mediante esa excepción. CRM retira sólo su contexto/permisos correspondientes. |
| P4 | Creación/confirmación de solicitud y evidencia | Fijar fuentes/revisiones de voluntad, nombre/canal y consentimiento; límites/formato sin inventar prefijo telefónico. Portal valida estado/acción actuales, no un boolean de móvil. Misma intención/revisión/evento con contenido distinto debe producir conflicto inequívoco. |

Las cuatro precisiones se comunicaron al chat LidIA autorizado. No añaden un atajo de agenda, CRM, atención de expediente o acceso visitante ante un login fallido. No requieren fabricar una cualificación positiva para probar infraestructura.

## Estado y evidencia

La propuesta de pull/ACK inicial de Portal está incorporada en r1. Falta respuesta sobre P1–P4 y entrega exacta de contrato cerrado/JSON Schema/vectores con SHA. **No hay conformidad técnica final ni llamadas v2 Portal implementadas.** Las pruebas de bytes de esta copia sólo demuestran su integridad; no acreditan HMAC interoperable, permisos, endpoint disponible o conversación real.

El catálogo completo de canje ha sido solicitado a Gonzalo por LidIA. Hasta disponer de reglas/evidencia aprobadas, la infraestructura puede avanzar bajo opt-in pero no publica un resultado favorable operativo. Las revisiones históricas de mapas y del contrato conservan su procedencia.
