# Contraste offline de muestras LidIA — 05/10/2026

Se incorpora [app-v1-service-samples.json](fixtures/app-v1-service-samples.json), copiado íntegro del worktree LidIA `gestadia-app-conversacional`. SHA256 del fichero recibido: `a9c528b036ca2058b4f9679d0d1225882b73cf678953fefa29e31797991c25e7`.

La fuente lo identifica como fixture de servicios locales SQLite con límite de modelo simulado. No hay credenciales, conexión real o prueba del agente119. LidIA comunica 64 pruebas de su bloque; Portal no las ha ejecutado y no las presenta como E2E.

| Muestra | Contraste Portal |
|---|---|
| SessionResponse | Esquema exacto; asociación local; no expone effective_agent ni lidia_session_id |
| ContextAck | ConversationContextResponse1.1 y respuesta compatible con salida durable de contexto |
| Receipt accepted | Turno correlacionado con turn_id; conserva estado accepted |
| Timeline | Esquema, presentación/acciones, sondeo collecting, cursor de cola con has_more=false y proyección local |
| ReceiptLookup completed | Recuperación multidispositivo del mismo turno; revisión3 y conservación del id de conversación local |
| Error404 | Esquema Error exacto y código conversation_not_found ya admitido por el cliente S2S |

El test de servicio Portal recorre inicio→contexto→turno→timeline→recibo mediante un cliente que entrega estas muestras, con BBDD MySQL8 efímera real. La prueba UI consume el timeline y conserva presentation_id/revision/action_id al responder; fija el reloj dentro de la vigencia de la muestra, sin modificar el fixture histórico. Las acciones caducadas conservan su bloqueo normal.

**Observación corregida:** Message no contiene identidad de autor por elemento; support.operator_display_name es el operador actual. Tras reasignar operador no se puede usar ese nombre para atribuir mensajes históricos. La APP etiqueta esas burbujas «Equipo Gestadia» y muestra el operador actual aparte, solo cuando el timeline confirma assigned/in_support. La prueba de regresión reprodujo la atribución errónea y pasa con la corrección. No se inventa un campo nuevo ni se cambia el esquema recibido.

LidIA precisa la transferencia conforme §5: context cambia destinos futuros y permisos, pero no reasigna por sí solo una atención InSupport. Un handoff explícito con key nueva valida mapping vigente y prepara la misma sesión para el nuevo operador; retry del handoff anterior solo recupera recibo. Portal coincide: no solicita handoff al actualizar contexto, arrancar o hacer polling.

Resultados Portal: **104 pruebas backend, 95 frontend y build APP correctos**; seis esquemas recibidos y test de proyección MySQL, más regresión UI de autor histórico.

Quedan solicitadas muestras adicionales de handoff completed/requested, timeline tras cambio de assignment y rechazo de mapping desconocido. Las seis recibidas no prueban esa parte, el routing efectivo, el transporte HTTP cruzado ni el aislamiento DEV.

Validación y commit en el [plan de ejecución](../superpowers/plans/2026-10-05-app-conversaciones-portal.md). Continúa el [PR borrador9](https://github.com/enmarkados/Gestadia_Portal/pull/9), sin merge/deploy/activar. [Glosario](../../GLOSARIO.md).
