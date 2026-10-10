# Contraste de atención humana APP — 05/10/2026

Complementa la [entrega Portal](2026-10-05-entrega-portal-conversaciones-app.md). LidIA comunica 54 pruebas locales en su bloque ampliado y pide contraste de handoff. Esa cifra procede del equipo LidIA; Portal no la usa como evidencia de E2E ni de runtime119.

Portal confirma compatibilidad con estas respuestas:

- HTTP202, recibo durable `operation=handoff`, `turn_id=null`, cuyo procesamiento puede estar `status=completed` y `result.handoff_status=requested`. Eso acredita solicitud registrada, no operador atendiendo. La APP muestra «Solicitud de atención recibida. Pendiente de asignación» cuando el timeline confirma requested; nombre de operador solo con assigned/in_support.
- Atención sigue dentro de la misma ChatSession/timeline. Proyecto, departamento, rol, vigencia y referencia de asignación se resuelven exclusivamente en LidIA/autoridad Portal; el móvil únicamente solicita el kind autorizado.
- Commercial sin vínculo requerido: HTTP409 `identity_link_required`. El cliente S2S conserva código/status y oculta detalle remoto; el proxy guarda rechazo definitivo failed. La UI libera el pendiente y avisa de la vinculación necesaria. No redirige a support ni a otra cola comercial, ni reintenta automáticamente.
- Support solo con permiso vigente y cola general configurada expresamente. La existencia del botón o de una operación idempotente no otorga permiso ni acredita recepción por operador.

Se añaden pruebas locales de esquema de recibo completed/requested, conservación/sanitización409 con una sola llamada, rechazo comercial en el proxy y UI requested/identity_link_required sin fallback. No se cambia el esquema recibido ni se llama al servicio real. Suite aislada completa posterior: **97/97 backend, 93/93 frontend y build APP correctos**, con seis migraciones MySQL8 desde cero. Registro de resultados en el [plan](../superpowers/plans/2026-10-05-app-conversaciones-portal.md).

Flags backend y frontend false. PR borradorPortal#9 en rama `codex/app-conversaciones-backend`. Pendiente entrega final de LidIA, fixtures de compatibilidad y posterior prueba cruzada autorizada en DEV aislado. [Glosario](../../GLOSARIO.md).
