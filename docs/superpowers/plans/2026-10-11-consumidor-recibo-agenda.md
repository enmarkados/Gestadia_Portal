# Consumidor de recibos de agenda — plan

> Ejecución inline con superpowers:executing-plans y test-driven-development. Una revisión independiente al final; sin activación ni despliegue en este bloque.

**Objetivo:** admitir el recibo opcional acordado de LidIA con invariantes verificables y retirarlo de la proyección cuando falten permisos CRM vigentes.
**Arquitectura:** schemas recibidos exactos v1/v2, comprobación semántica común, proyección autorizada de los recibos existentes. No añade herramientas Zoho ni modifica requests/firma.
**Tecnología:** Node, AJV2020, Prisma/MySQL efímero.
**Spec:** contrato LidIA V1.723, fixtures recibidas en docs/integraciones/fixtures/app-appointment-receipts-723; invariantes confirmadas por los dos equipos.

## Restricciones

- Campo opcional cerrado de siete propiedades, schema_version1.0 incluso dentro de envelope2.0.
- Histórico a verified_at, sin atribuir estado vivo, disponibilidad o cancelación actual.
- Sólo operation=turn/status=completed/error=null; UTC con milisegundos real, requested_start=zoho_start, verified_at>=accepted_at y zona IANA válida o UTC.
- No habilitar CRM para guest ni el consumidor v2 limitado actual, incluso tras binding sin context account durable.
- Sin datos/contacto inventados, duplicar preguntas pendientes, grants, BD productiva, deploy, reserva remota o release nativa.

## Revisión y pruebas

Cruce de cuentas/sesiones conserva guards existentes; permisos retirados durante una lectura no deben dejar salir el nuevo campo. Esquemas cerrados y legacy sin campo deben seguir compatibles. Reintentar conserva referencia/hora/bytes originales, sin un POST CRM.

- [x] RED: vectores recibidos, compatibilidad, invariantes temporales/zona, proyección limitada y guest sin CRM.
- [x] Copiar schemas runtime exactos; validador semántico común y proyección con permisos actuales.
- [x] RED→GREEN integración de operaciones e historial con retirada.
- [x] Suite completa backend/frontend/build, revisión independiente y una pasada de correcciones si procede.
- [x] Documentar hashes/evidencia, commit/push autorizado y coordinar dependencias de deploy/reserva real.

**Ruling:** account v2 es un bloque separado con ledger/contexto/CAS/retirada; no bloquear la prueba v1 actual con una migración de protocolo. Contratos de respuesta v2 quedan preparados sin conceder autoridad.


## Resultado de preparación

Dos RED de validación/proyección y RED→GREEN de integración con MySQL local; 37unitarias y suite completa351backend/207frontend/buildPASS. Revisor independiente sin P1/P2. Schemas exactos y precedentes intactos. [Evidencia](../../app/evidencias/2026-10-11-recibo-agenda/README.md). Commit/push de esta rama autorizados al cerrar. Deploy con copia/restauración, permisos en el momento de activar y reserva/readback remotos continúan pendientes; account v2 durable separado.
