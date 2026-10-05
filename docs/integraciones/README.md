# Integraciones del Portal Gestadia

Índice de la documentación de integraciones con sistemas externos.

## Gestadia App — cierre conversacional separado de Zoho (05/10/2026)

- [Ajuste recibido de LidIA](2026-10-05-ajuste-alcance-conversacional-app.md):
  copia exacta, con identidad mínima de cuenta y actualización de contexto por
  conversación. Zoho, ganado/pago y checkout quedan fuera de este cierre.
- [Contraste Portal](2026-10-05-revision-portal-alcance-conversacional-app.md):
  conformidad con alcance y `User.id`; evidencia de verificación/estado todavía
  por preparar, referencias ficticias de asignación y precisiones de contexto,
  recuperación y retención. Sin implementación ni pruebas conectadas.

## Gestadia App — responsabilidades vigentes

[Reparto aclarado por el usuario](../app/RESPONSABILIDADES-INTEGRACION.md):
los flujos Zoho postean al backend Gestadia, que gestiona cuenta y trámites;
LidIA interviene en las conversaciones. El contrato del POST se trabaja con
el responsable de los flujos Zoho. Esta aclaración corrige los destinatarios
de los mensajes históricos que atribuían esa coordinación al equipo LidIA.

## Gestadia App — decisión de negocio Zoho y acceso (05/10/2026)

[Decisión de negocio de ganado](2026-10-05-decision-negocio-zoho-ganado-y-acceso.md):
Zoho debe postear al entrar en Cerrado ganado para crear o vincular el acceso
compartido Portal/APP. Hablar desde la app puede preceder al alta comercial;
el evento se cruza con la cuenta existente conservando credenciales e historial.
Descarta la instantánea como sustituto del disparador de alta (O6/R3), sin
alterar los documentos históricos. El transporte y la correlación requieren
contrato; no se ha implementado ni activado la integración.

## Gestadia App — respuesta y contraste O1–O8 (05/10/2026)

- [Respuesta LidIA](2026-10-05-respuesta-lidia-observaciones-o1-o8.md),
  [anexo de firma](2026-10-05-app-s2s-anexo-firma.md),
  [anexo DTO](2026-10-05-app-anexo-dtos.md),
  [vectores](fixtures/app-s2s-v1-vectors.json) y
  [JSON Schema](fixtures/app-v1-dtos.schema.json): copias exactas recibidas.
- [Revisión Portal del 05/10](2026-10-05-revision-portal-respuesta-lidia-o1-o8.md):
  cuatro vectores contrastados offline y valoración por punto. Quedan R1–R5
  de vínculo/cardinalidad, semántica Zoho, checkout y retención.

Esta revisión es histórica; el ajuste conversacional anterior retira Zoho y
checkout de sus dependencias de cierre. No hay autorización de implementación o
pruebas conectadas. La decisión vigente descarta la instantánea como disparador
de alta; agente 119 y aislamiento DEV siguen sin evidencia efectiva.

## Gestadia App — revisión de contratos con LidIA (04/10/2026)

- [Respuesta original de LidIA](2026-10-04-respuesta-contrato-app-lidia.md),
  copiada íntegra del repositorio LidIA. Sus enlaces relativos se interpretan
  en ese repositorio; la procedencia y hash están en la revisión Portal.
- [Observaciones y conformidad técnica Portal](2026-10-04-observaciones-portal-contrato-app-lidia.md):
  valoración favorable de arquitectura, con O1–O8 pendientes sobre firma,
  revocación, recuperación, correlación, pago/ganado, productor Zoho y adenda.
- [Glosario Portal](../../GLOSARIO.md), ampliado con la nomenclatura propuesta.

Son documentos para acuerdo. No autorizan implementación, despliegue ni
activación de canales. Agente 119 y aislamiento DEV siguen sin comprobación
efectiva; la aplicación instalada conserva su modo demo.

## Gestadia App — preparación del backend (03/10/2026)

[Diseño propuesto y evidencias](2026-10-03-app-lidia-backend-preparacion.md):
API de cuenta, canal APP autenticado en LidIA, sondeo/atención humana y alta
única por pago o Zoho Cerrado ganado. El usuario ha autorizado preparar esta
nueva fase; la app instalada conserva su modo demo. No acredita código de
backend nuevo, canales activados ni conexiones probadas en producción.

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
