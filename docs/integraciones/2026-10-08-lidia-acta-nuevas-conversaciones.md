> Copia del acta de Gestadia_LidIA, commit `613122b2f12d668e45c99fba2cb4284201d9e8af`. Únicamente se han resuelto sus enlaces al repositorio de origen.

# Comprobación de nuevas conversaciones APP

Estado: comprobación de LidIA en lectura completada el 08/10/2026, tras la prueba de Portal en web local e iOS. [Glosario](https://github.com/enmarkados/Gestadia_LidIA/blob/613122b2f12d668e45c99fba2cb4284201d9e8af/GLOSARIO.md) · [Conexión real](https://github.com/enmarkados/Gestadia_LidIA/blob/613122b2f12d668e45c99fba2cb4284201d9e8af/docs/integraciones/2026-10-07-conexion-app-agente-119-real.md) · [Presentación publicada](https://github.com/enmarkados/Gestadia_LidIA/blob/613122b2f12d668e45c99fba2cb4284201d9e8af/docs/integraciones/2026-10-08-atencion-app-presentacion.md).

Portal solicita confirmar dos conversaciones nuevas para la misma cuenta validada y sondeo sin expediente. La consulta directa de PRO verifica dos AppConversation/ChatSession diferentes, misma cuenta e integración, purpose sondeo, case_ref null, canal APP (2), proyecto 103, agente 122 e instrucción 10116. Ambas están activas; WhatsAppContactId null, IsWhatsAppActive false e IsAutomationCancelled true.

| Consumidor comunicado por Portal | Conversación y ChatSession remota | LlmCallLogs | Hora del LLM, Madrid | Mensajes | StateRevision |
| --- | --- | --- | --- | --- | --- |
| Web local 298ccabd | f063ff90-de27-46a0-9f08-d794c7e939b2 | 38602 | 08/10/2026 11:37:19 | 2 | 4 |
| iOS local 22605ede | d54eec05-5d3e-49d4-97d5-9afdd24705a3 | 38603 | 08/10/2026 11:39:49 | 2 | 4 |

Los dos registros del proveedor tienen Anthropic, claude-haiku-4-5-20251001 y Success=1. Cada timeline contiene secuencias 1/2, user/assistant, una operación de turno completed y respuesta inicial con «¿Empezamos?» y opciones «✅ Sí»/«👎 No». Los IDs de mensajes y operaciones pertenecen a su propia conversación.

AgentStateJson se almacena en la fila correspondiente de cada AppConversation. Los dos estados iniciales tienen contenido igual por partir de los mismos valores iniciales (SHA256 f75675a7c3264a8780951ef3b68ed0ee618d2dfed584fc5d0b37a4278914ed2c); ninguno contiene Colombia del sondeo previo. Cada resultado de sondeo tiene revisión 1 e ID propio: web d8bac68a-1722-47e3-b20f-06e8a180b494; iOS 13e57d14-d52b-449a-88a0-526a87dd262b. Estado collecting. Esta comprobación acredita vínculo, almacenamiento por conversación y primer turno real; la evolución de cada nuevo sondeo queda fuera de esta comprobación inicial.

## Conservación de la conversación anterior

Se compara a0490f84-6eba-4c0c-a02a-579d1aa72b11 contra la copia SQL manual_20261008T091920Z.sql, tomada a las 11:19:20 de Madrid antes de crear las dos nuevas conversaciones. La comparación local del dump con la lectura actual de PRO verifica igualdad exacta de ChatSessionId, AgentStateJson, SondeoJson, ContextJson, ContextRevision, StateRevision, SondeoRevision, SondeoResultId, NextSequence y estado activo de ChatSession.

También coinciden sus 10 mensajes: IDs, secuencias, roles, textos, PresentationJson y OperationId. Conserva StateRevision 16, SondeoRevision 5, el resultado 96102aa0-25fa-4452-b605-017fff96fe1d y el estado que contiene Colombia. SHA256 de AgentStateJson conservado: 14a8acd71d2cdbfb2f2f798dce44f4dcf9546618bc2a5afa5c9aebf368b2ac9a.

Todas las consultas a PRO se ejecutan bajo START TRANSACTION READ ONLY y finalizan con rollback. Los detalles de cuenta/contexto y el backup permanecen en el directorio privado local, fuera del repositorio. No se envían turnos desde esta verificación ni se opera atención, 6e22, grants, agente o canal. Portal recibe conformidad por punto y la evidencia de proveedor, persistencia y conservación; sus pruebas frontend/backend se atribuyen a su equipo.
