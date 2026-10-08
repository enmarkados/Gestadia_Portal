# Preparación Portal para conversación APP con agente119 real — 07/10/2026

## Requisito y estado

El usuario solicita al equipo LidIA «iniciar una conversación con el agente Gestadia119 de verdad desde la app». Se ha comprobado el mensaje humano en el chat autorizado «Actualizar rama dev/IA/main». Esta preparación sucede a la aceptación del circuito local con agente902/modelo determinista; conserva esa evidencia y no la presenta como prueba de119.

LidIA investiga el agente y runtime efectivos. Portal mantiene el fixture existente, sus puertos, asociaciones, claves y permisos. No se ha cambiado el endpoint ni iniciado un turno contra119.

## Compatibilidad verificada del consumidor

El código actual `appConversationConfig` y `AppS2SClient` ya resuelve un origen HTTPS, integración, audiencia y claves por rol. Añade el prefijo fijo `/api/integrations/lidia/app/v1`. `APP_LIDIA_BASE_URL` debe ser el origen raíz, sin ruta, query, credenciales o fragmento. Las claves son SESSION/READ/TURN/HANDOFF/CONTEXT/REVOCATION; sus secretos permanecen privados fuera de documentación y mensajes.

Agente, proyecto, instrucción y modelo se resuelven en LidIA mediante la integración, nunca por campos elegidos desde el móvil. Si se conserva el contrato actual de rutas/DTO/firma, no se observa una adaptación de código Portal necesaria para elegir119. La compatibilidad del código no acredita disponibilidad de un endpoint ni configuración efectiva de ese agente.

## Entrega necesaria de LidIA

- Origen, entorno, integrationId y audiencia efectivos.
- Proyecto/agent119, instrucción/version y modelo/proveedor verificados en el runtime que ejecutará el turno; distinguir un clon de configuración de una ejecución en el runtime original.
- Aislamiento APP respecto a WhatsApp/Woztell, Zoho, pagos y correo; capacidades habilitadas para esta prueba.
- Autoridad mínima del sondeo, validez y cualquier mapeo de atención acreditado si procede. No trasladar referencias ficticias del fixture a producción.
- TLS y material de claves por rol mediante una ruta privada autorizada; sin copiar secretos al chat/repositorio.

Las conversaciones y operaciones Portal tienen integrationId y remoteId propios. No se reutilizan las asociaciones del fixture contra otra base/runtime. La propuesta comunicada es realizar la prueba119 en namespace/base separados y conservar el circuito aceptado hasta acordar la transición. No se fijan aún nuevos identificadores, puertos o credenciales.

## Verificación prevista

Con el destino y las condiciones de ejecución acordados: iniciar desde la APP, acreditar en fuente el119/instrucción/modelo efectivo, enviar un turno de prueba sin datos personales reales, observar recibo y respuesta del proveedor, recuperar el historial sin duplicar el envío y registrar transporte/efectos efectivos. El diagnóstico `app-local-preflight` está limitado al fixture y no debe emplearse para declarar listo un runtime externo.

Estado: **consumidor revisado y coordinación enviada; endpoint/ejecución119 pendientes de la investigación de LidIA**. No se fusiona ni despliega desde esta preparación.

[Glosario](../../GLOSARIO.md), [cierre anterior](2026-10-07-cierre-visual-conversaciones.md).
