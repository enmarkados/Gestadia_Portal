# Conformidad final offline — muestras APP LidIA (05/10/2026)

Portal recibe la versión final de nueve respuestas en [app-v1-service-samples-v2.json](fixtures/app-v1-service-samples-v2.json), copiada íntegra del fichero LidIA. SHA256: `bb194f44dec0a3fcd091bf60328881a41fc47facaa1d4297d25ac7402a01ab01`. Conserva el [fixture anterior de seis respuestas](fixtures/app-v1-service-samples.json), SHA256 `a9c528b036ca2058b4f9679d0d1225882b73cf678953fefa29e31797991c25e7`; no sustituye su evidencia histórica.

Las nueve respuestas validan con los esquemas runtime originales. Además del [contraste previo](2026-10-05-contraste-muestras-servicios-app.md), las tres respuestas de atención se prueban así:

| Respuesta | Contraste |
|---|---|
| HandoffReceipt | Receipt completed/requested; turn_id null; el proxy conserva solicitud registrada y conversation_id local, sin acreditar operador |
| SupportTimeline | Timeline in_support, rol público operator y operador actual Segundo; recuperación en dos dispositivos sobre asociación local; proyección sin effective_agent; UI separa autor histórico del operador actual |
| RoutingError | Error409 routing_unavailable; el cliente S2S conserva código/status, el proxy registra failed, UI libera pendiente e informa sin reenviar ni elegir alternativa |

Las muestras de atención son capturas de casos independientes: HandoffReceipt y SupportTimeline tienen distintos conversation_id. En los tests se usa un inicio sintético que vincula cada muestra a su propia asociación. No se mezclan como una única secuencia real ni se presenta su comparación como prueba del efecto de una transferencia en la plataforma.

Conformidad con §5: context modifica destinos futuros y permisos sin reasignar por sí solo InSupport; un handoff explícito con key nueva valida mapping vigente y puede preparar la misma sesión para otro operador. Recuperar el handoff antiguo conserva key y recibo, sin transferir otra vez. Portal no solicita handoff al actualizar contexto, arrancar o hacer polling.

La UI muestra «Te atiende…» solo para assigned/in_support confirmado; burbujas operator se etiquetan Equipo Gestadia porque Message no contiene autor por elemento. Completed/requested confirma solicitud pendiente, no atención iniciada. Destino desconocido permanece sin asignación/fallback.

LidIA comunica 71/71 tests, revisión independiente y migración MySQL8 efímera; esos resultados pertenecen a su equipo y Portal no los ha ejecutado. La validación Portal es local, con muestras/HTTP de respuesta simulado y MySQL8 efímero para persistencia. Resultado final Portal: **115/115 backend, 97/97 frontend y build APP correctos**, seis migraciones desde cero y limpieza del propio contenedor temporal. Registro de resultados en el [plan](../superpowers/plans/2026-10-05-app-conversaciones-portal.md).

**Conformidad contractual y de consumo offline**, sin objeciones a las nueve respuestas recibidas. No acredita transporte entre sistemas desplegados, efecto real de mapping/transferencia, runtime119, DEV aislamiento efectivo ni usuario físico. Ambos flags siguen false y el [PR9](https://github.com/enmarkados/Gestadia_Portal/pull/9) permanece borrador sin merge/deploy/activar. [Glosario](../../GLOSARIO.md).

LidIA publica su [PR borrador1600](https://github.com/enmarkados/Gestadia_LidIA/pull/1600) hacia dev/IA/main, commitcore01f9d6c5e, y comunica164/164 tests combinados. Este documento cierra la conformidad Portal con sus muestras, sin certificar esos tests ajenos ni autorizar merge/activación. Ambos cambios quedan reviewables en sus ramas aisladas.
