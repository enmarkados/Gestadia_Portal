# Coordinación Portal: contrato técnico APP v2

**10/10/2026 · Preparación de ejecución.** [Manual](../app/MANUAL-DESARROLLO.md) · [Plan Portal](../superpowers/plans/2026-10-10-app-v2-portal.md) · [Glosario](../../GLOSARIO.md).

## Autorización y alcance comprobados

Se leyó directamente la instrucción humana **«pues implementa el contrato tecnico»** en el chat `01a1071b-1f23-7101-afd4-13935b20bd04`, «Gestadia_LidIA - Actualizar rama dev/IA/main», turno `01a12789-3159-77b2-a5a8-6c226110d82d`. La coordinación entre equipos y el trabajo aislado ya habían sido autorizados por Gonzalo en el chat Portal.

La instrucción permite avanzar el contrato y su desarrollo coordinado. **No es autorización para activar visitantes, desplegar el recorrido, migrar una BBDD existente ni utilizar CRM/correo/agenda de producción.** Los mapas siguen representando una propuesta hasta que su consumidor sea implementado y comprobado; la aceptación visual/nativa y la activación son comprobaciones separadas.

Base Portal: `app/main` en `7bfa689b1a537ef4b15d909ec9a2468770c7c71b`. Rama de esta preparación: `codex/app-v2-guest-portal`, en el worktree existente `app-anonimo-lidia/Gestadia_Portal`. La entrega inicial cambió documentación y glosario; el avance posterior de transporte/requests aislados consta al final y en el contraste r3. El recorrido anónimo no está integrado en el producto.

Las [revisiones históricas](2026-10-10-contraste-portal-app-anonima.md) conservan sus bytes/fecha y su estado anterior de autorización. Este documento registra el avance posterior; no modifica las copias recibidas para hacerlas parecer contratos ejecutables.

### Precisión humana posterior: pasarela al agente 119

Se comprobó por lectura directa el mensaje humano `01a127a2-2b60-7d30-a407-11f47d3af53a` del mismo chat LidIA: la integración transmite lo que escribe el cliente a la plataforma con el agente 119 y muestra su respuesta. HTML y respuestas dinámicas son opcionales si no complican el procedimiento.

El agente lleva las preguntas y decisiones de canje. No se crea un cuestionario, calificador, catálogo de reglas ni política de negocio paralelos en Portal o en el adaptador. El requisito anterior de elaborar otro catálogo queda sustituido por consumir la ejecución y los resultados/acciones reales del 119. La prioridad es comprobar esa pasarela; identidad, aislamiento, continuidad y efectos de contacto conservan sus contratos propios. Esta precisión no cambia por sí sola la configuración efectiva de un agente ni activa visitantes.

## Reparto comunicado

| Responsable | Entrega | Condición de entrada |
|---|---|---|
| LidIA | Rutas/DTO/capacidades v2, JSON Schema y vectores JS/.NET; ejecución del agente 119; sujeto/actor/revisión remotos; binding durable; timeline/recibos; resultados/acciones del agente; publicación/ACK recuperable de contacto | Compatibilidad v1; ejecución real del agente acreditada; opt-in explícito |
| Portal | Credencial/control de instalación, asociación local por conversación, cliente S2S v2, registro/verificación, vínculo recuperable, solicitud durable y reconciliación | Artefacto exacto compartido aceptado antes de realizar llamadas; no suponer campos ni permisos |
| APP | Entrada anónima, Mensajes propios, registro opcional posterior, retorno al mismo chat y estados de envío/vínculo | API Portal comprobada; seguir mapas, origen completo y estilo vigente |
| Responsable Zoho/agenda | Conversión lead–contacto/trato, evento Cerrado ganado, futura entrega CRM y agenda | Contrato propio con Portal; no se atribuye a LidIA ni se habilita por registrar |

El cliente móvil no decide integración, proyecto, agente, entorno, operador, departamento ni referencia CRM. Portal resuelve todas esas autoridades. No se altera `accountProof`, `/api/app/v1`, sus firmas ni sus asociaciones actuales.

## Preferencia de transporte enviada a LidIA

**Pull S2S**, sujeto a que LidIA publique el contrato ejecutable. Rutas propuestas históricamente; **wire r3 las reserva y aplaza**. No son rutas permitidas por el cliente actual:

```text
GET  /api/integrations/lidia/app/v2/sessions/{conversation_id}/contact-requests/{intent_id}
POST /api/integrations/lidia/app/v2/sessions/{conversation_id}/contact-requests/{intent_id}/ack
```

- GET recupera un evento/revisión exactos y su estado, sin crear una solicitud ni avanzar el proceso. La identidad original `event_id` e intención/revisión no cambian al registrarse.
- ACK usa una key estable por entrega; acredita persistencia Portal y referencia local, con huella del payload. No añade datos de contacto ni manda el historial completo.
- Nombres, campos, tipos, capacidades, query y huella exacta son responsabilidad del artefacto LidIA. Esta preferencia no autoriza construir un DTO supuesto.
- Las lecturas y ACK firman sujeto, actor y revisión; se revalida pertenencia antes de devolver datos o un replay. Una key S2S no sustituye autorización de conversación.
- Sin webhook ni URL arbitraria; sin llamada directa al CRM desde LidIA o el móvil. No hay job de entrega a Zoho hasta cerrar su receptor.

## Carrera entre lectura, cancelación y ACK

1. Portal valida esquema, integración, sujeto, intención/revisión y la acción de contacto emitida por el agente; conserva una fila durable pendiente de reconciliación. No reevalúa elegibilidad. País, texto libre o `human_review` aislados no sustituyen esa acción.
2. Portal envía el ACK de esa fila, con la misma identidad y huella. Antes del ACK confirmado no afirma recepción final ni entrega al responsable CRM.
3. LidIA debe decidir atómicamente si la revisión/evento siguen vigentes y persistir el resultado del ACK. Si la intención cambia, caduca o se retira antes de esa decisión, devuelve conflicto sin confirmar entrega. El tratamiento exacto se cerrará en el contrato.
4. Una respuesta HTTP perdida se recupera por la misma operación/recibo; no genera otra solicitud ni otra key. Portal no confunde timeout con rechazo o cancelación.
5. Después de ACK aceptado, modificar/cancelar esa solicitud exige una operación separada por acordar. Cancelar el registro no altera la solicitud recibida.
6. Si el vínculo cambia la autoridad durante este proceso, la cuenta vigente puede recuperar el mismo resultado autorizado. El actor original guest del evento y su ledger no se reetiquetan.

La fila local pendiente demuestra que Portal conserva los datos; no prueba por sí sola la confirmación remota del ACK, una conversión CRM o una cita. La APP debe distinguir esos hechos en sus estados.

## Cierres necesarios antes del consumidor remoto

| Artefacto solicitado a LidIA | Comprobación Portal |
|---|---|
| Contrato v2 versionado con SHA, rutas y códigos | Allowlist exacta, errores sanitizados, sin fallback a v1 |
| JSON Schema cerrado y vectores HMAC JS/.NET | Copia byte-exacta, hashes, firma de bytes UTF-8/query, Unicode, GET vacío y actor/revisión |
| Contexto/recibos/binding y sus capacidades | Permiso actual antes de replay; expiración/bloqueo; commit incierto; guest histórico; A vinculado sin retirar B |
| Señal/resultado/contacto emitidos por el agente | Acción identificable del agente, voluntad expresa, nombre + teléfono O email, confirmación y dato mínimo; sin evaluación paralela |
| GET/ACK y recibo durable | Revisión exacta, huella semántica estable, conflicto de payload, cancelación concurrente y recuperación después del vínculo |
| Vigencias, límites y retención | Configuración explícita de cada ámbito; no asumir los 7d/30min históricos como valores aprobados; tombstones mínimos sin contactos |

Portal muestra la respuesta del agente y no inventa un resultado operativo. Si falta una acción verificable para ejecutar contacto, esa operación permanece pendiente de contrato; esto no bloquea el transporte de texto al 119 ni exige un catálogo nuevo. La agenda sigue fuera del contrato conversacional.

## Preparación por bloques

El [plan Portal](../superpowers/plans/2026-10-10-app-v2-portal.md) fija pruebas y puntos de entrada. Se puede preparar aislamiento, inventario y contratos locales sin tocar v1. Las llamadas v2, sus DTO y migraciones se implementarán después del artefacto ejecutable recibido y contrastado; no se completan usando una copia histórica de propuesta.

Cada bloque se entrega con commit/push/sync de su rama y evidencia correspondiente. Un test con fixture demuestra ese contrato local; el E2E conjunto, emuladores, iPhone y runtime desplegado se registran aparte. No se fusiona código funcional o se activa guest por una mera actualización de mapas.

## Registro de coordinación

- Se verificó la instrucción humana en el chat LidIA mediante lectura directa; no se tomó el mensaje del otro agente como única fuente de autorización.
- Portal comunicó el reparto, la preferencia GET/ACK, el límite de cancelación concurrente y la necesidad de esquemas/vectores exactos en ese mismo chat, con la autorización humana previa de coordinación.
- Recibido el borrador [wire LidIA r1](2026-10-10-app-v2-wire-lidia-r1.md), conservado byte-exacto, sin commit/schema/vectores de entrega aún acreditados. [Revisión Portal P1–P4](2026-10-10-revision-portal-wire-v2-r1.md) enviada: huella del inicio, revisión exacta en recuperación, autorización de revocación y evidencia de confirmación. No se declara conformidad final ni disponibilidad de API v2 por esta recepción.

## Avance posterior: wire r3 y transporte preparado

- Recibido [wire r3 exacto](2026-10-10-app-v2-wire-lidia-r3.md) del commit LidIA `4a10ebf794fd7f947290a2d85beeebce9b1d8558`; hashes de wire, requests y seis vectores comprobados en el [contraste Portal](2026-10-10-contraste-portal-wire-v2-r3.md). R1/r2 conservan su procedencia histórica.
- La matriz posterior comunicada por LidIA se incorporó: recuperación/operaciones y GET recibos con timeline.read, POST recibos con turns.write, handoff con cuenta y capacidad dedicada. Binding exige igualdad exacta de revisión body/header; el lifecycle original no autoriza turnos con una revisión antigua.
- Transporte/validación v2 preparados en la rama aislada, flags off por defecto y sin claves de contacto. Sin montaje de API, nueva BBDD o autoridad persistida.
- A petición de LidIA se remitieron esquemas de respuestas r1, trece fixtures sintéticos y manifiesto de fuentes para revisión conjunta. No se importan en runtime ni constituyen conformidad del contrato.
- Verificación final: 209 backend, 152 frontend y build APP correctos; 63 pruebas stateless específicas. Revisión independiente sin Critical/Important; falta prueba específica de rotación v2.
- Bloques 3/4/6 pendientes; contacto/ACK del bloque 5 aplazado por r3. Se preservan las pantallas propuestas para revisar el futuro recorrido. No merge funcional, despliegue, activación, CRM ni prueba conectada del 119 por esta entrega.
