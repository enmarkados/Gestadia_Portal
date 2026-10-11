# Consumidor del recibo de agenda — 11/10/2026

**Estado:** preparación local; grants CRM desactivados, sin despliegue, llamada real o aceptación de agenda.

LidIA entrega schemas cerrados y tres fixtures definitivas de recibos para su revisión723; el commit final y runtime723 siguen pendientes. Copias nuevas [recibidas con hashes](../../../integraciones/fixtures/app-appointment-receipts-723/provenance.json); originales históricos anteriores conservados. La validación HTTP31/31 y schemas39/39 corresponde a su equipo, no a pruebas ejecutadas aquí.

Portal admite `result.appointment_receipt` opcional de siete propiedades, subversión1.0 en ambos envelopes. Requiere turno completado sin error, fechas UTCms realmente válidas, requested_start igual a zoho_start, verified_at no anterior a accepted_at y zona IANA válida o UTC. Valida cada recibo de Receipt/ReceiptLookup/Timeline, sin deducir éxito del texto del modelo. Es un snapshot histórico a verified_at; no demuestra disponibilidad o estado actual de una llamada.

Los requests, canonicalización y firma no cambian. La proyección móvil conserva la referencia opaca y excluye el campo si faltan history/crm_prepare/callback_schedule vigentes. No borra ni modifica el recibo persistido al retirar autoridad. API revalida usuario, conversación, integración y contexto bajo el bloqueo existente. Consumidor v2 de sondeo, incluso después de binding, rechaza el recibo adicional porque aún no dispone de context account durable ni autoridad CRM.

Sin nuevo diseño de pantalla: la conversación conserva su origen/Atrás/envío, y la confirmación visible sigue siendo el mensaje del agente. No añade una tarjeta que interprete el snapshot como estado actual. Cuenta v2 con contexto durable es un bloque separado; el recorrido real de agenda previsto mantiene la conversación v1 actual.

## Pruebas

RED inicial: los tres vectores eran rechazados y la proyección filtraba mal el campo (4fallos). Tras incorporar los schemas recibidos, 18fallos hacen visibles las invariantes faltantes y la exclusión guest. GREEN: 37pruebas unitarias, incluida igualdad exacta de schemas y compatibilidad de respuestas legacy sin el campo.

Integración MySQL efímera: RED al omitir permisos del caller, resultado undefined en lugar del recibo autorizado. GREEN: proyección por operación, timeline y lookup con permisos, retirada mientras se recibe una respuesta rechaza el contexto antiguo; apagado retira sólo la proyección y conserva bytes persistidos. Sin servicios externos o datos de producción. Suite completa/revisión pendientes de cierre.

## Pendientes conectados

Copias y restauración nuevas antes de despliegue Portal; confirmar commit/marca efectiva723 y contrato runtime en LidIA. Activar únicamente el ámbito acordado después de confirmación humana en el momento de la ampliación de acceso. Teléfono/zona/franja se preguntaron una sola vez y no se reiteran en este bloque. Después, UI APP → disponibilidad → creación por el agente → readback remoto y recuperación. La prueba local no cumple el criterio humano de llamada realmente agendada.


## Cierre de preparación

`node scripts/test-app-conversations.mjs` exit0: 351backend/207frontend/49archivos y build APP PASS (1,52s); 15migraciones exclusivamente en MySQL8 efímero local con tmpfs. Regresión de retirada durante la lectura incluida en la suite. Revisión independiente de sólo lectura del diff respecto a2a1140c: sin P1/P2. [Registro](proof.json). Los avisos existentes de Node y navegación jsdom de checkout no provocaron fallos. Ningún cambio de producción, datos reales, grants o emuladores. TestFlight11 conserva exclusivamente la corrección anterior del editor; esta revisión backend no genera otra build móvil.
