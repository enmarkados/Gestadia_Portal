# Integraciones del Portal Gestadia

Índice de la documentación de integraciones con sistemas externos.

## Gestadia APP — preparación del contrato ejecutable v2 (10/10/2026)

[Coordinación Portal](2026-10-10-coordinacion-portal-contrato-v2.md) y [plan por bloques](../superpowers/plans/2026-10-10-app-v2-portal.md): nueva instrucción humana de implementación del contrato comprobada en el chat LidIA; reparto y preferencia pull/ACK comunicados. Portal conserva v1 y prepara v2 separado. Esquemas/vectores, rutas y decisión durable de ACK deben recibirse y contrastarse antes del consumidor. Esta entrega inicial es documental: sin código v2 Portal, migración, despliegue o activación. Las revisiones anteriores conservan su estado histórico.

[Borrador wire LidIA r1 recibido](2026-10-10-app-v2-wire-lidia-r1.md), conservado byte-exacto, y [revisión Portal P1–P4](2026-10-10-revision-portal-wire-v2-r1.md): pull/ACK incorporado; cuatro precisiones de huella, revisión exacta, revocación y consentimiento remitidas. Falta cierre y schema/vectores; no es conformidad ejecutable.

## Gestadia APP — conversación sin cuenta, propuesta 10/10/2026

[Manual de desarrollo APP](../app/MANUAL-DESARROLLO.md): entrada común a pantallas, mapas y contratos.

[Propuesta Portal](2026-10-10-propuesta-app-anonima-lidia.md): consulta sin cuenta ni datos personales al inicio; requisitos completos y voluntad expresa antes de nombre y teléfono O email. Solicitud como visitante, cuenta opcional después para guardar el mismo chat. APP exclusivamente; alta gratuita no habilita trámites pagados.

[Respuesta LidIA exacta](2026-10-10-revision-lidia-app-anonima.md), [contraste Portal](2026-10-10-contraste-portal-app-anonima.md) y [cierre documental LidIA](2026-10-10-cierre-lidia-mapas-portal.md): conformidad documental sobre los mapas eb1ce3c5, con cuenta verificada Y control original para vincular, sujeto por conversación y Atrás al origen. Pendientes aprobación humana, reglas/evidencia completas, capacidad/señal visitante, esquemas/firma/ACK/reconciliación, protocolo v2 y agenda. No implementado ni activado.

## Gestadia App — conformidad final de nueve muestras (05/10/2026)

[Conformidad offline de atención/routing](2026-10-05-conformidad-final-muestras-app.md): versión final conservada aparte del fixture anterior, DTO/proxy/UI compatibles, rechazo sin fallback y transferencia explícita. No acredita conexión desplegada ni activación.

## Gestadia App — muestras de servicios contrastadas offline (05/10/2026)

[Contraste de seis respuestas LidIA](2026-10-05-contraste-muestras-servicios-app.md): esquemas exactos, recorrido de proyección/recuperación y consumidor UI. Atribución histórica separada del operador actual. No acredita conexión real ni routing efectivo.

## Gestadia App — atención humana contrastada (05/10/2026)

[Compatibilidad de handoff y vínculo](2026-10-05-compatibilidad-atencion-app.md): recibo completed/requested, error409 identity_link_required y ausencia de fallback. Contraste local de contrato/proxy/UI; sin E2E conectado ni activación.

## Gestadia App — implementación conversacional desactivada (05/10/2026)

[Entrega Portal](2026-10-05-entrega-portal-conversaciones-app.md): API `/api/app/v1`, identidad, asociaciones/claims, contexto/revocación y consumidor APP, con pruebas MySQL local. [Acta de autorización y conformidad mutua](2026-10-05-acta-inicio-conversacional.md) y [plan/evidencia](../superpowers/plans/2026-10-05-app-conversaciones-portal.md). Esta fase posterior resuelve los cierres conversacionales pendientes abajo; las revisiones históricas conservan su fecha/alcance. No cambia Zoho/checkout ni acredita despliegue, activación o runtime119.

## Gestadia App — adenda conversacional 1.1 contrastada (05/10/2026)

- [Adenda recibida](2026-10-05-adenda-contexto-conversacional-v1-1.md),
  [esquema](fixtures/app-context-v1-1.schema.json) y
  [vectores](fixtures/app-context-v1-1-vectors.json): copias exactas nuevas.
- [Conformidad técnica Portal](2026-10-05-conformidad-portal-adenda-contexto-v1-1.md):
  seis vectores recalculados Node/Python; comprobación limitada del perfil de
  esquema. Precisión editorial de replay y política de historial/purga pendientes.
  No acredita validadores generales, API, proxy ni revocación distribuida.

Se mantiene el cierre conversacional separado de Zoho/checkout y la revisión
documental, sin autorización de implementación o activación.

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

## Conversaciones APP — prueba conectada local

- [Prueba local APP / Portal / LidIA del 06/10/2026](2026-10-06-prueba-local-app-portal-lidia.md): 61 comprobaciones HTTP/API, flujo de navegador y corrección de recarga; modelo determinista y bases temporales.

## Perfil Portal y comprobación integrada local — 07/10/2026

- [Diseño del perfil, recuperación de contexto y diagnóstico efectivo](2026-10-07-perfil-y-comprobacion-local.md): navegador móvil/escritorio, regresiones y worker conectado; diagnóstico de la cuenta primaria con horizonte conjunto. No renueva acceso ni activa canales.

- [Cierre visual coordinado](2026-10-07-cierre-visual-conversaciones.md): LidIA confirma recibo/respuesta y retirada automática de opciones anteriores en la APP, sin recarga ni reenvío.

## APP con agente119 real — preparación 07/10/2026

- [Compatibilidad Portal y transición pendiente](2026-10-07-preparacion-agente-119-real.md): requisito humano nuevo, origen/firma/autoridad necesarios y separación del fixture. Todavía no acredita un turno con119.

## APP con agente dedicado basado en 119 — adenda 07/10/2026

- [Alcance autorizado, respaldo Portal verificado y checklist de transición](2026-10-07-adenda-agente-app-y-transicion.md): el usuario permite clonar119 y exige Playground; redeploy LidIA condicionado a copias de código y BBDD. Configuración original contrastada en panel; destino/ejecución real pendientes. Conserva el fixture y no despliega Portal producción por separado.

## Consumidor local APP frente a LidIA PRO — preparación 07/10/2026

- [Namespace acordado y base/cuenta nuevas](2026-10-07-preparacion-portal-validacion-pro.md): consumidor preparado aparte del fixture, sin conexión ni turno hasta confirmar configuración fuente y Playground.

- [Mapas de pantallas y flujo APP sin cuenta, con capturas para aprobación](../app/2026-10-10-mapas-pantallas-app-anonima.md). Propuesta visual del 10/10/2026; no implementada.

- [Contraste LidIA de mapas APP (10/10/2026)](2026-10-10-contraste-lidia-mapas-portal.md): copia íntegra, fuente 539a6ccc2; precisiones incorporadas en propuesta/mapas.

- [Cierre documental LidIA de mapas APP (10/10/2026)](2026-10-10-cierre-lidia-mapas-portal.md): fuente 0243b2379, copia íntegra separada de la revisión histórica; recorrido listo para decisión humana.
