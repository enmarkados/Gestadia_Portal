# Fernando Cortes: diagnóstico y corrección

**Precisión humana posterior vigente:** mantener usuario sin cuenta; LidIA crea el Lead con procedencia App y registra la llamada en ese Lead asignada al agente vinculado, conservando los criterios existentes de LidIA. La elección pendiente y la pausa descritas abajo son antecedentes superados por esta instrucción. Se continúa la corrección local; no se realiza un alta manual del caso de prueba.

## Comprobación real del 15/10/2026

El usuario identifica una prueba en iPhone con el nombre Fernando Cortes. Lectura administrativa en PRO, marcador visible V1.731-recibos-app-window, sesión [062be940-d5fc-4ea7-b975-2d2c1c5fed5e](https://lidia.gestadia.com/admin/chats/062be940-d5fc-4ea7-b975-2d2c1c5fed5e), proyecto Gestadia APP Invitado y agente LidIA Canje APP Invitado.

- 10:16:23: el usuario comunica Fernando Cortes; después facilita teléfono, confirma el prefijo de España y Madrid, y responde Sí a la autorización de llamada.
- 10:17:22: LidIA anuncia una llamada para ese mismo día a las 10:30.
- 12:33:55: después de que el usuario indique que no se ha volcado nada, LidIA asegura que todo está registrado y vuelve a confirmar las10:30, ya pasadas.
- 12:34:14: deja la verificación pendiente con otro mensaje de espera.
- La ficha de la misma sesión muestra nombre/teléfono/email pendientes. El listado del proyecto contiene la sesión con 59 mensajes y canal APP.

Se ha leído la transcripción, sin enviar mensajes, ejecutar herramientas de negocio ni editar la sesión. La administración se abrió con el acceso guardado existente. No se realizó una lectura directa de Zoho ni un alta/llamada real.

## Causa localizada y hallazgo adicional

El contrato mínimo guest documentado excluye CRM/agenda y el código731 filtra al invitado en permisos, catálogo, consentimiento, preparación/transporte CRM y recibos. Portal también rechaza los permisos y el recibo de cita. El texto del modelo podía avanzar hacia un registro que el circuito técnico no tenía habilitado.

Además hay una confirmación sin respaldo observado. El guard actual de cita sólo intercepta PendingCommit; sin herramienta no se alcanza ese estado. La protección de persistencia depende de disponer de la herramienta de canje. Habilitar herramientas por sí solo no acredita que todas las afirmaciones futuras estén verificadas.

El caso real usa teléfono local con confirmación de prefijo en otro turno y una pregunta de consentimiento que incluye el número. La corrección cubre ambas variantes con regresiones, y comprueba evidencia durable al publicar confirmaciones guest. Las palabras del modelo sólo detectan la afirmación que requiere respaldo; no son prueba de éxito.

## Alcance vigente y candidato local

La petición y las precisiones humanas autorizan corregir el circuito anónimo: conservar el sondeo y los criterios de llamada existentes, crear el Lead con procedencia literal App y registrar la llamada en ese Lead asignada al responsable vinculado de Zoho. No se solicita otro consentimiento de alcance ni se crea una cuenta o un registro manual del caso de prueba.

Ambos repositorios tienen una rama local codex/fix-guest-crm-callback; Portal parte de d5fcd362 y LidIA de c8d77dcef en /Users/gonchumon/.codex/worktrees/fix-guest-crm-callback/Gestadia_LidIA. Cambios sin commit, push, merge, despliegue ni activación. Los opt-ins permanecen false por defecto.

El candidato incorpora permisos guest de servidor, guards de autoridad existentes, owner por conversación, consumo de recibos y reconciliación de la admisión original. La agenda hereda Owner.id del Lead vinculado, acreditando ID y ownerkey en ese GET; si existe AssignedOwnerId fijo debe coincidir. El readback comprueba ese responsable además de la relación y la hora. [Plan y archivos](../../../superpowers/plans/2026-10-15-guest-crm-callback.md).

## Pruebas y límites

- Portal:46/46 dirigidas; frontend214/214; build APP correcto. Backend completo bloqueado al crear la base efímera por Docker no disponible.
- LidIA:519/519 del canal APP, incluidas6regresiones nuevas RED→GREEN. Transporte HTTP simulado y SQLite; no acreditan Zoho real.
- Suite completa LidIA:16517 correctas,283 omitidas,4fallos. Version_UsesCurrentReleaseMarker se ajustó al marcador local732 y pasa después. CorrectAndRejectProposalAsync_ConcurrentReviewHasSingleWinnerAndImmutablePayload y Compacto_confirmar_apaga_y_el_tooltip_dice_quien_y_cuando pasan en repetición aislada. Al_refrescar_el_mensaje_trae_su_autor_de_Zoho sigue fallando por Monitor nulo en ChatService.cs811, fuera de los archivos funcionales tocados. No se acredita una suite global verde ni una baseline anterior ejecutada.

La corrección local continúa con la captura del caso concreto y las confirmaciones con evidencia. La comprobación servida requiere publicar y configurar el candidato; la petición actual no incluye despliegue. Se conserva la sesión existente; no se crea una cita retrospectiva ni se envía otro mensaje para completar esta inspección.

### Configuración administrativa corroborada

En /admin/agents, el agente LidIA Canje APP Invitado aparece activo con la instrucción Canje APP - base 119 y sin conexiones ni herramientas operativas externas. Consulta de sólo lectura en PRO731; no se ha guardado configuración ni ejecutado herramientas. El responsable Zoho debe proceder del mapping servidor; no se deduce del ID/nombre del agente IA.

### Cierre local y prueba real pendiente

LidIA:582/582 del canal APP/marcador/OwnerLead; Portal:46/46 dirigidas,214/214 frontend y build APP correcto. Revisión de código independiente completada. Se acredita procedencia App, mismo Lead, responsable real heredado del Lead (mapping opcional contrastado), reglas de interés existentes, recuperación sin duplicados y publicación sin confirmación falsa. Son pruebas locales con HTTP simulado.

El usuario exige teléfono555555555 y creación real de Call para validar. Esa prueba aún no se ha realizado. Portainer está accesible y Zoho requiere completar MFA; no se crea el caso manualmente. El cierre sigue exigiendo recorrido guest servido y lectura de Lead/Call/Owner, con sus IDs y prueba de recuperación. Sin esa evidencia no se declara validado en producción.
