# APP v1: DTO y reglas de recuperación

05/10/2026. **Esquemas propuestos, sin endpoints ni validadores implementados.** [Respuesta O1–O8](2026-10-05-respuesta-lidia-observaciones-o1-o8.md) · [Firma y huella](2026-10-05-app-s2s-anexo-firma.md) · [Glosario](../../GLOSARIO.md).

La definición completa de campos, obligatoriedad, tipos y límites está en [app-v1-dtos.schema.json](fixtures/app-v1-dtos.schema.json), JSON Schema 2020-12, bajo `$defs`. El `$ref` raíz sirve para `Timeline`; el resto se selecciona por su nombre indicado abajo. Es un artefacto de contrato, no un cambio en modelos de producto. `additionalProperties: false` en todos los objetos; las reglas de autorización y las dependencias entre campos de esta nota son también obligatorias aunque JSON Schema no las pueda expresar por sí solo.

## Operaciones y respuestas

| Operación | Request | Respuesta | HTTP |
|---|---|---|---|
| POST `/sessions` | `SessionRequest` | `SessionResponse` | 201 nueva; 200 resume/repetición |
| POST `/sessions/{id}/turns` | `TurnRequest` (unión exclusiva) | `Receipt` | 202 admisión durable; 200 repetición |
| POST `/sessions/{id}/handoff` | `HandoffRequest` | `Receipt`, `operation=handoff` | 202 solicitud durable; 200 repetición |
| GET `/sessions/{id}/timeline` | Sin body; `cursor`, `limit` opcionales | `Timeline` | 200 |
| GET `/sessions/{id}/timeline?turn_id=…` | Sin body, sin cursor/limit | `ReceiptLookup` | 200; 404 inexistente; 410 detalle retirado |
| POST `/subjects/{id}/revocations` | `RevocationRequest` | `RevocationResponse` | 200 persistida o repetida |
| POST `/checkout-events` (LidIA) | `CheckoutCallback` | `EventAck` | 202 inbox; 200 duplicado idéntico |
| POST `/api/integrations/zoho/v1/events` (Portal) | `CrmSnapshotEvent` **alternativa O6** | `EventAck` | 202 inbox; 200 duplicado idéntico |

Las seis primeras rutas/callback LidIA tienen prefijo `/api/integrations/lidia/app/v1`. Todos los errores usan `Error` (`application/problem+json`), con `type` URI de catálogo configurado, HTTP real igual a `status`, código estable y detalle sanitizado. Sin tool args, tokens ni estado privado. `correlation_id` identifica trazas, nunca autorización. 401 no distingue nonce, secreto o firma al cliente; el fixture negativo conserva causa para pruebas offline.

JSON snake_case, `schema_version="1.0"`. Fechas UTC RFC 3339 con milisegundos y `Z`; ids Portal UUID lowercase con guiones, CRM strings sin conversión numérica. Revisiones/secuencias strings decimales canónicas no negativas, acotadas a 20 dígitos. Importe positivo en unidades menores como string y moneda ISO de tres letras; validar exponente/moneda/importe contra intent y proveedor, sin float. Texto máximo 4.000 valores escalares Unicode; rechazar texto sólo whitespace, Unicode inválido y propiedades privilegiadas, sin recortar el texto válido al calcular huella. Máximo body 32 KiB.

Inicio opcional `resume_conversation_id`, `case_ref`, `client_key`: ausencia se normaliza a null para huella. Los demás campos son requeridos como indica cada definición; null sólo donde se permite. `case_ref` requiere pertenencia y vínculo acreditados, no crea esa pertenencia. Si se intenta contexto privado sin atestación, devolver `capability_denied`/`identity_link_required`, sin construirlo desde ids declarados. La futura ruta de vínculo O4 tiene DTO pendiente y **no está implícita** en estos esquemas.

`SessionResponse` y `effective_agent` contienen información S2S. Portal proyecta únicamente los metadatos necesarios al móvil: sin `lidia_session_id`, id de agente, versión de instrucciones, claves ni referencias CRM. Capacidades son respuesta server-side, no una lista que el móvil pueda ampliar. Una sesión cerrada se recupera para lectura autorizada, sin nuevo saludo ni efectos. `operation=session` en recibos corresponde al ledger interno; el inicio responde con `SessionResponse` para mantener su contrato.

## Recibo y estado

`Receipt` contiene operación/id, conversación, turno nullable, estado, revisiones, fechas de admisión/actualización/cierre/retención, resultado nullable, error nullable y demora de poll nullable. Para `operation=turn`, `turn_id` requerido no null; para session/handoff, null. No devuelve la clave idempotente ni la huella privada. Resultado sólo referencias autorizadas a mensajes, presentaciones, sondeo/revisión y estado de handoff; no reproduce tool payloads.

| Estado | Semántica / combinación |
|---|---|
| `accepted` | Recibo + entrada durable persistidos; `completed_at/result/error=null` |
| `processing` | Trabajo reclamado; `completed_at=null`; no prueba efecto externo finalizado |
| `completed` | Procesamiento terminado; `completed_at` y `result` no null, `error=null`, sin obligación de respuesta humana |
| `failed` | Fallo conocido sin resultado incierto; `completed_at` y `error` no null; resultado opcional sólo si público y comprobado |
| `outcome_unknown` | Efecto cuya conclusión requiere reconciliación; `completed_at=null`, error sanitizado y sin repetición de efecto |

El recibo puede pasar de `outcome_unknown` a estado final después de reconciliar; las transiciones se registran y aumentan revisiones. `retained_until=accepted_at+30 días`; si queda pendiente, conservar el ledger suficiente para reconciliar, aunque el detalle público sea retirado. `accepted_at` no cambia por retry, `updated_at` sólo cambia con el estado. Errores de reconciliación no invitan a crear otra key. Para resultados de sondeo las referencias id/revisión deben ser ambas null o ambas no null.

Ejemplo ilustrativo, ids ficticios:

```json
{
  "schema_version": "1.0",
  "operation_id": "44444444-4444-4444-8444-444444444444",
  "operation": "turn",
  "conversation_id": "22222222-2222-4222-8222-222222222222",
  "turn_id": "33333333-3333-4333-8333-333333333333",
  "status": "accepted", "receipt_revision": "1", "state_revision": "12",
  "accepted_at": "2026-10-05T10:00:00.000Z",
  "updated_at": "2026-10-05T10:00:00.000Z",
  "completed_at": null, "retained_until": "2026-11-04T10:00:00.000Z",
  "result": null, "error": null, "retry_after_seconds": 3
}
```

Lookup exacto envuelve ese recibo en `{schema_version, conversation_id, state_revision, receipt}`; `state_revision` exterior representa estado actual, el interior la última actualización del recibo. No son necesariamente iguales. Normal timeline retorna revisión actual, soporte/sondeo actuales y sólo recibos de turnos de página más turno activo, sin inventario completo. `has_more` únicamente describe páginas de mensajes. `next_cursor` no contiene una credencial de acceso; se reautoriza cada GET.

Al faltar el recibo tras autorización: 404 `turn_not_found`; tombstone: 410 `receipt_retired`; conversación ajena: 404 `conversation_not_found`. Cursor retirado: 410 `cursor_expired`. Intentar repetir operación retirada conserva estas respuestas y no ejecuta. Retención total de mensajes y marcas de conversación pendiente de acuerdo.

## Presentación y acción

Presentaciones `single_choice`, `confirmation` o `information`; esta última no admite acciones. `actions` hasta 20, ids únicos en la presentación, labels informativos, enabled/disabled_reason y vencimiento. `enabled=true` exige `disabled_reason=null`; disabled exige razón no null. `expires_at` de acción no puede superar el de su presentación. Labels no identifican operaciones.

Turno de acción sólo admite `schema_version`, `turn_id`, `kind=action`, `presentation_id`, `presentation_revision`, `action_id`, `correlation_id`; el turno de texto sólo `text`. El significado de cada acción se guarda en servidor junto a conversación/sujeto/scope y versión. No hay `targetUserId`, departamento, importe, tool, endpoint, expediente arbitrario ni parámetros libres en una acción.

Antes de consumirla comprobar pertenencia, revisión actual, enabled, vencimiento UTC y capacidades actuales. Consumo/claim y nuevo turno son atómicos. Acción consumida/expirada/sustituida devuelve 409 `stale_action` salvo retry del mismo turno que recupera recibo. Una nueva key no repite efectos de una acción consumida. Retirar la presentación conserva su marca mínima. Cambio de soporte/revocación puede invalidar acciones, incrementando estado visible.

Ejemplo de presentación completa:

```json
{
  "presentation_id": "presentation_public_01", "presentation_revision": "2",
  "kind": "confirmation", "title": "Solicitar atención",
  "description": "Podemos solicitar soporte general desde esta conversación.",
  "expires_at": "2026-10-05T10:10:00.000Z",
  "actions": [{
    "action_id": "request_general_support_01", "label": "Solicitar soporte",
    "enabled": true, "disabled_reason": null,
    "expires_at": "2026-10-05T10:10:00.000Z"
  }]
}
```

`Support` distingue `none/requested/assigned/in_support/closed`: `assigned_at` no implica `attended_at`. Nombre visible del operador sólo con asignación autorizada; no devuelve ids internos ni contactos del operador. Solicitud no toma automáticamente la conversación. Estado cerrado del soporte no reabre la ChatSession.

## Sondeo estructurado

`SondeoResult` fija id, revisión, catálogo/reglas y versión, estado, evaluado nullable, resumen, requisitos y siguiente paso. Ninguna regla de elegibilidad se añade en este anexo: usa las reglas de canje versionadas aprobadas. Requisitos únicos por `requirement_id`, estados `unknown|declared|supported|contradicted|not_applicable`, evidencia por ids de mensajes autorizados de **esa conversación**. No adjuntos, datos CRM privados ni evidencias económicas inventadas. `supported` no equivale a autenticidad documental o identidad civil verificada.

Mientras `collecting/needs_clarification`, `evaluated_at` puede ser null. Resultado final preliminar `qualified/not_qualified/human_review` exige `evaluated_at` no null. Cada cambio de evaluación aumenta `result_revision` y revisión de conversación. `next_step=offer_checkout` ofrece solicitar una oferta; sólo permisos reales Portal permiten checkout. Modelo y texto libre no conceden esos permisos.

Ejemplo ficticio de resultado, sin evaluación final:

```json
{
  "schema_version": "1.0", "result_id": "55555555-5555-4555-8555-555555555555",
  "result_revision": "3", "ruleset_ref": "canje-approved-catalog",
  "ruleset_version": "fixture-only", "status": "collecting",
  "evaluated_at": null, "summary": "Sondeo en curso.",
  "requirements": [{
    "requirement_id": "fixture_requirement", "label": "Dato pendiente del catálogo aprobado",
    "status": "unknown", "evidence_message_ids": []
  }], "next_step": "continue"
}
```

## Revocación, callback y ACK

`scope=account` admite `account_disabled|account_deleted`; `scope=crm_link`, `identity_conflict`. Subject header/ruta igual; otras combinaciones 400. `persisted=true` y `enforcement_status=propagating` confirman commit, no efectividad universal. `enforcement_deadline=revoked_at+60 s`. Repetir no incrementa versión. Gate de ciclo de vida está separado del permiso de conversación revocado.

`CheckoutCallback` exige contacto y trato no null porque el **checkout APP propuesto** los exige previamente. No exige CRM para sondeo. Cada referencia se valida contra el intent/mapping server-side. `source_environment` debe coincidir con la integración, igual que cuenta, conversación y oferta. El receptor no obtiene una pertenencia nueva del callback. Datos de pago verificados en Portal; LidIA no declara «ganado» a partir de pago sin el flujo comercial ni «pagado» a partir de un evento CRM.

`EventAck` siempre identifica evento y recibo durable. `received_at` es fecha de primera persistencia; retry idéntico conserva recibo/fecha y cambia `duplicate=true`. Body semántico distinto para un mismo event id = 409 `event_conflict`; pago auténtico repetido bajo otro evento se reclama por identidad económica. 202 es recibido, sin afirmar entrega al usuario, habilitación o reconciliación completada. En cuenta revocada, ingreso económico permitido como servicio; exposición bloqueada según O2/O7. Callback a sesión cerrada no inicia IA ni WhatsApp.

`CrmSnapshotEvent` es alternativa sometida a aprobación, no evento de transición ordenado. `source_revision` huella no ordenable, etapa actual observada, fecha origen nullable; sin `previous_stage` ni campos de pago. `portal_user_id`, `case_ref`, intent/contacto/asignaciones pueden ser null hasta verificación; nunca se habilita con pertenencia desconocida. El receptor reconsulta antes de decidir y lleva revisión local distinta de la fuente.

La adenda de generación de enlace y atestación de vínculo requieren consolidación conjunta de su DTO (O4/O7). Esta colección no promete que ya exista un adaptador para suministrar esas asociaciones.
