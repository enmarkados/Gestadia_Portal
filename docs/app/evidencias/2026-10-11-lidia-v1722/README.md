# Aceptación APP web con LidIA V1.722 — 11/10/2026

Prueba por interfaz en `app.gestadia.com`, con la sesión autorizada de sistemas@enmarkados.com. Dos turnos informativos seriados; ninguno aporta datos de canje ni solicita alta, cita o llamada. No se cambiaron flags, permisos, configuración, código desplegado o esquema de producción.

## Resultado observado

- Conversación local `bfa0ecc3-0b91-4de8-9ac2-0b4eaa4b142a`; sesión remota `6b9a40ec-a9a9-442a-9f49-70e35d642f02`.
- Turno 1: operación `fe521f56-afde-444b-948f-5fd97f62b167`, turno `f1952239-988e-40d9-a2c8-ae26ac2056aa`; aceptado 16:49:35.404 UTC, completado 16:49:41.318 UTC. Recibo revisión 3, estado revisión 5; cinco mensajes de respuesta.
- Turno 2: operación `c9858132-1890-4637-97d2-69bcb57950b1`, turno `ac5454b1-8a28-43a3-b498-dd01aa0f1943`; aceptado 16:49:54.264 UTC, completado 16:49:57.094 UTC. Recibo revisión 3, estado revisión 8; tres mensajes que conservan la continuidad del primer turno.
- Ambos estados `completed`, `error:null`; tras recargar hay 11 mensajes con los mismos IDs, permisos `history,sondeo` y ninguna operación pendiente. No apareció `[SPLIT]` literal.
- El detalle común `/admin/chats/6b9a40ec-a9a9-442a-9f49-70e35d642f02` muestra canal APP, proyecto Gestadia APP, agente LidIA Canje APP y el mismo historial. Contacto pendiente no impide leerlo. Se accedió directamente, no desde la fila de Sesiones en esta prueba.
- La consola muestra `V1.722-sesiones-app-nativas`, entorno PRO y backup `manual_20261011_163300.sql`, 1.20 GB. La copia listada no acredita restauración.

## Evidencia y límites

[Timeline y recibos finales](timeline.json) · [APP recuperada](app-recuperada.png) · [Detalle común LidIA](lidia-detalle-comun.png).

El JSON contiene sólo mensajes informativos y recibos; sin headers, credenciales, cookies ni cursores. LidIA informa de despliegue PRO en commit `935dbffcdb57bb06f72b47f94dee880fff672296`, copias con hashes comprobados, migración EF aplicada y conservación de 12 sesiones anteriores. Se atribuyen a su equipo; Portal no las volvió a ejecutar.

Se solicitó confirmar para estos IDs agente 122 real, modelo/AgentState y ausencia de invocaciones/efectos CRM o agenda. Historial y recibos no prueban esos extremos. No acredita OAuth, APNs, dispositivo físico, sondeo completo, gestor asignado ni reserva.

Zoho/agenda pertenecen a LidIA y su agente. El formulario independiente aprobado sigue disponible; delegarlo necesita el contrato que LidIA está concretando. No se activa un endpoint reservado ni se repiten solicitudes pendientes.

Hallazgo visual: marcadores `**...**` se muestran literales en APP y detalle. Comunicado para seguimiento; sin cambiar el renderer durante este ensayo.
