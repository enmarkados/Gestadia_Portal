# Contraste Portal con LidIA: conversación APP sin cuenta

**Fecha:** 10/10/2026. **Estado:** respuesta LidIA recibida y contrastada; conformidad de principios y reparto, contrato ejecutable todavía pendiente. Exclusivamente documental. [Propuesta Portal](2026-10-10-propuesta-app-anonima-lidia.md) · [Respuesta LidIA copiada íntegra](2026-10-10-revision-lidia-app-anonima.md) · [Glosario](../../GLOSARIO.md).

## Coordinación y evidencia

El requisito humano se trasladó al chat «Gestadia_LidIA - Actualizar rama dev/IA/main» y se compartió el fichero de propuesta. LidIA entregó su respuesta escrita estable, incorporando las observaciones Portal sobre cola/abort y recuperación del inicio. Los puntos siguientes recogen ese contraste y el reparto acordado, sin presentarlos como contrato ejecutable aprobado.

Procedencia de la copia: `/Users/gonchumon/.codex/worktrees/gestadia-app-conversacional/Gestadia_LidIA/docs/integraciones/2026-10-10-revision-lidia-app-anonima.md`, commit `e3b663b59`, rama `codex/app-anonimo-adenda-lidia`, sincronizada según entrega LidIA. SHA256 de fuente, blob Git y copia Portal: `c127dfe73602bfc51e2e33f767fb8670de5fb7f527189bd5e8c3f2e178574c04`. Se comprobó igualdad de bytes. Los enlaces relativos del documento copiado se interpretan en el repositorio LidIA original; se conserva intacto y no representa código Portal.

Portal revisó también el código fuente en la base LidIA `a4ab0c299d6afcddacf6ec5fcb9ce60c797c8e12`, mediante el grafo del worktree `gestadia-app-conversacional`:

- `LidIA.ChatAgent/Services/AppConversations/AppSessionService.cs`, StartOrResumeAsync: exige identity con verified_at, crea AppSubject con PortalUserId y liga AppConversation a SubjectId. El alta de ChatSession utiliza canal App y automatización cancelada.
- `LidIA.ChatAgent/Services/AppConversations/AppConversationRunner.cs`, RunAsync: la única herramienta del modelo es emit_app_turn. Su salida estructurada contiene texto, país emisor con cita literal, indicador needs_human_review y opciones. La instrucción APP excluye CRM, pagos, enlaces, correo, automatizaciones y delegaciones.
- El runner no ofrece comprobar_horario/agendar_cita. El indicador de revisión humana no acredita que se cumplan todos los requisitos del canje ni que exista una reserva.

Estas comprobaciones corresponden al código citado, no a la configuración efectiva del agente en producción ni a una prueba de agenda.

## Acuerdos técnicos preliminares

| Punto | Propuesta LidIA / observación | Respuesta Portal |
|---|---|---|
| Compatibilidad | Ampliación opt-in, sin alterar sujetos/huellas de v1 | Conforme. Mantener accountProof y autorización actual; no convertir fallos de cuenta en acceso visitante. |
| Identidad | Sujeto inmutable por conversación, distinto del actor visitante/cuenta | Conforme como arquitectura. Portal necesita adaptar propiedad, dispositivos y permisos; no reescribir ledger ni cambiar la sesión remota. |
| Autoridad | Revisión de acceso firmada y transferencia por conversación | Conforme en principio; debe resolver firma, concurrencia y reintentos. Revocar el acceso temporal de un chat no afecta a otros sondeos. |
| Captura y cualificación | El runner actual no proyecta nombre/contactos o cualificación completa | Cambio necesario, pendiente. Datos declarados, prueba de cuenta y resultado de viabilidad tienen significados distintos. |
| Llamada | LidIA conserva intención y resultado; Portal recibe solicitud idempotente | Conforme con que Portal sea autoridad de la solicitud y de un futuro adaptador de agenda acordado con el responsable Zoho. Solicitud recibida no equivale a cita confirmada. |
| Zoho | El commit/reprogramación legacy no debe trasladarse a APP como atajo | Conforme con la separación de responsabilidades ya fijada por el usuario. LidIA no administra los flujos Zoho. |

La habilitación será explícita tanto en la integración LidIA como en el backend Portal. Una bandera pública de interfaz no autoriza visitantes; el servidor mantiene el contrato de cuenta v1 y sólo permite el nuevo recorrido en el ámbito APP configurado. Ni un login fallido ni un deeplink amplían permisos de gestor/trámites.

## Dependencias de cierre del contrato

1. **DTO/firma:** definir sujeto, actor y revisión de acceso en cada petición y operación. La referencia de cuenta procede del backend y nunca de campos libres del móvil. Separar metadatos de autorización actuales de la huella semántica histórica para recuperar una operación previa sin cambiar sus efectos.
2. **Vinculación:** prueba de control de cuenta y recorrido original, destino único, transferencia confirmada, revocación temporal por conversación y recuperación tras respuesta perdida. Token de continuación de un uso; GET de un escáner no tiene efectos.
3. **Carreras:** resolver turno en vuelo al vincular, versión antigua de acceso, lectura/ACK concurrente, dos cuentas y replay. No conceder ambos accesos ni cambiar el actor que consta en el ledger histórico. La revocación y lectura de resultados no pueden abrir historial de otro sujeto.
4. **Contacto y viabilidad:** proyección validada de nombre y teléfono y/o email; fuente del resultado completo y gate estructurado de contacto diferido y solicitud visitante confirmada. La cuenta se ofrece después para guardar el chat; no es requisito de envío. No usar needs_human_review como prueba de «cumple» ni generar la URL de registro desde texto libre del modelo.
5. **Agenda:** contrato de solicitud/recibo y autoridad del adaptador con Zoho; nada reserva por el mero hecho de registrarse. La confirmación de cita necesita evidencia del sistema de agenda y un único efecto recuperable.
6. **Nativo y abuso:** deeplinks verificados, continuación explícita tras instalar, secretos protegidos, caducidad/retención, límites de creación/envío/coste y pruebas de accesos cruzados.

La revisión escrita LidIA propone protocolo v2 separado, fases prepare/commit/abort y recibos con actor guest. Portal ha aceptado ese diseño en principio. **Las dos precisiones Portal están incorporadas y resueltas documentalmente en la respuesta recibida:** al vencer prepare se bloquea, sin autoabort ni devolución de autoridad mientras hay operaciones inciertas; un inicio guest anterior al registro se consulta por su operación/sujeto+key con acceso actual, sin reenviar identity alterada. Se distingue recuperación de efectos nuevos y los reintentos mantienen su huella original. Vectores y JSON Schema compartidos siguen pendientes; todavía no existe conformidad de firma/bytes ni una nueva API de agenda disponible.

## Reparto propuesto para el siguiente trabajo

- **Portal:** identidad y acceso previo a cuenta, alta/verificación gratuita, tokens/continuación, propiedad/revisión de acceso, operación de vinculación recuperable, API de solicitud de llamada y adaptación a agenda cuando se cierre con el responsable correspondiente.
- **APP:** entrada directa al chat sin cuenta, navegación de registro/acceso y retorno al mismo chat, historial limitado al actor, recibos y estados comprensibles.
- **LidIA:** identidad APP ampliada, asociación del actor con la misma sesión, proyección estructurada completa del sondeo, gate de contacto y señal de solicitud visitante sin efectos CRM, conservación de operaciones/historial y acceso por revisión vigente.
- **Responsable Zoho/agenda:** confirmar receptor/adaptador y resultados operativos; sus flujos de Cerrado ganado siguen enviando los hechos directamente al backend Gestadia.

## Estado verificable

Portal ha creado el worktree `app-anonimo-lidia`, rama `codex/app-anonimo-lidia`, con [PR11 en borrador](https://github.com/enmarkados/Gestadia_Portal/pull/11). No se ha incorporado esta propuesta a app/main. Se añadieron maquetas locales y capturas para revisión; sin cambios de producto, migraciones o permisos. Verificación documental: enlaces locales de los documentos Portal, bloques Mermaid, git diff --check e igualdad de bytes de la respuesta LidIA; no sustituye pruebas API, conversación o dispositivos.

**Cierre de esta revisión:** ambos equipos consideran viable el recorrido y aceptan el reparto y el modelo de identidad en principio. Antes de implementar faltan revisión humana del diseño, plan de ejecución y cierre de esquemas/vectores del protocolo v2; la cualificación completa y la agenda operativa conservan sus dependencias expresas. No se declara conformidad técnica final ni disponibilidad del acceso anónimo.

El despliegue Portainer/Plesk solicitado previamente conserva su alcance propio. La versión aceptada anterior puede publicarse separadamente, sin presentarla como compatible con este recorrido nuevo. La ampliación anónima requiere contrato, implementación y validación específicos antes de activar su opción.

## Corrección humana incorporada a ambas propuestas

Primero requisitos sin datos personales. Sólo `can_continue` completo + `contact_requested` permite pedir nombre y teléfono O email con propósito/confirmación. Portal recibe una SOLICITUD durable como visitante. La cuenta es opcional y posterior; cancelar el alta no cancela ni reenvía lo recibido. Registro y vínculo conservan event_id, intención/revisión y actor original.

La señal `app.contact_request.ready` y permiso visitante son propuestas v2. Faltan reglas completas del sondeo, DTO/firma/transporte/ACK/reconciliación. El runner actual no acredita un resultado positivo completo: human_review no abre el gate. Los flujos Zoho conservan conversión lead–contacto/trato; LidIA no la ejecuta. Los [mapas y capturas corregidos](../app/2026-10-10-mapas-pantallas-app-anonima.md) se entregan para revisión humana antes de implementar.
