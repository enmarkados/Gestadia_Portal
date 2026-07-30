# Integraciones del Portal Gestadia

Índice de la documentación de integraciones con sistemas externos.

## LidIA — pago del canje desde WhatsApp (contrato 1.0, en producción)

El agente conversacional de LidIA cualifica al cliente por WhatsApp y, cuando
toca pagar, pide al portal un enlace de checkout prellenado. El portal cobra,
crea el expediente, escribe el resultado económico en la Oportunidad de Zoho
que LidIA ya había creado y le notifica el pago con eventos firmados.

**Empieza por aquí:**

| Documento | Para qué sirve |
|---|---|
| [PNT-integracion-lidia.md](../PNT-integracion-lidia.md) | **Procedimiento normalizado**: recorrido del cliente, qué hace cada sistema, operativa, diagnóstico y garantías. *El documento de referencia para el día a día.* |
| [2026-07-28-contrato-lidia-portal-v1-0.md](2026-07-28-contrato-lidia-portal-v1-0.md) | **Contrato 1.0**: la especificación normativa del API (endpoints, payloads, errores, firma, idempotencia). Ante cualquier duda de formato, manda este. |
| [2026-07-29-acta-matriz-s14.md](2026-07-29-acta-matriz-s14.md) | **Acta de pruebas**: qué se probó, con qué resultado y qué queda pendiente. |
| [2026-07-28-pendientes-activacion-lidia.md](2026-07-28-pendientes-activacion-lidia.md) | Guía de activación/despliegue y guion de pruebas. |

**Histórico de la negociación** (por orden cronológico, útil para entender
*por qué* el contrato es como es):

1. [2026-07-24-handoff-equipo-lidia.md](2026-07-24-handoff-equipo-lidia.md) — propuesta inicial del portal.
2. [2026-07-24-respuesta-a-lidia.md](2026-07-24-respuesta-a-lidia.md) — respuesta a su primera revisión (tool dedicada, catálogo fase 1).
3. [2026-07-28-confirmacion-contrato-1-0.md](2026-07-28-confirmacion-contrato-1-0.md) — cierre del contrato.
4. [2026-07-28-respuesta-catalogo-y-credenciales.md](2026-07-28-respuesta-catalogo-y-credenciales.md) — endpoint de catálogo y datos de acceso.
5. [2026-07-28-respuesta-retencion-y-desviaciones.md](2026-07-28-respuesta-retencion-y-desviaciones.md) — retención de `idempotency_key` y desviaciones aceptadas.
6. [2026-07-28-respuesta-4-confirmaciones.md](2026-07-28-respuesta-4-confirmaciones.md) — confirmaciones técnicas y registros de prueba.
7. [2026-07-29-cambio-entorno-lidia.md](2026-07-29-cambio-entorno-lidia.md) — LidIA migra a `dev-lidia.gestadia.com`; credenciales nuevas y aclaración de que el Portal no tiene entorno de desarrollo separado.

**Diseño e implementación** (en `docs/superpowers/`):

- [Spec de diseño](../superpowers/specs/2026-07-24-integracion-lidia-checkout-design.md) — decisiones internas y arquitectura.
- [Plan de implementación](../superpowers/plans/2026-07-28-integracion-lidia-portal.md) — las 13 tareas con las que se construyó.

> ⚠️ **El ejemplo de petición del contrato (§6.2) muestra un valor en
> `direccion` y en `datos_pais`, pero LidIA no envía ninguno de los dos** — el
> agente no los pregunta en la conversación (confirmado por ellos el
> 2026-07-30). No construyas nada asumiendo que llegan; los rellena el cliente
> en el formulario. Detalle en el [PNT](../PNT-integracion-lidia.md), §5.

## Convenciones

- Los documentos con fecha en el nombre son **inmutables**: reflejan lo que se
  acordó o se probó ese día. Si algo cambia, se escribe un documento nuevo.
- Los PNT y este índice **sí se actualizan**: describen el estado actual.
- **Ningún documento contiene secretos.** Claves y URLs de credenciales viven
  en el `.env` (git-ignored) y se intercambian por canal seguro.
