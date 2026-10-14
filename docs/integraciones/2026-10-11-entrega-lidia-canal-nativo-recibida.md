# Entrega APP como canal de LidIA — 11/10/2026

[Plan](../superpowers/plans/2026-10-11-app-canal-nativo-implementacion.md) · [Contrato de perfil y llamada](2026-10-11-app-contexto-perfil-y-agenda.md) · [Glosario](../../GLOSARIO.md).

## Comportamiento preparado

Desde Sesiones, una conversación APP abre `/admin/chats/{SessionId}` y el componente común de detalle. Mantiene menú, estilos e icono de móvil; no requiere Contacto, Lead, trato ni expediente para leerla. Atención APP conserva la bandeja y la intervención humana, sin ser el destino obligatorio de una lectura administrativa. Leer el detalle no concede permiso para responder.

La entrada APP consume la misma `ChatSession`, `RunCoalescedTurnAsync` y `AgentStateService`. El worker publica sólo después de volver a comprobar autoridad y permisos. El historial canónico conserva visibilidad por caso; sus lectores comunes entregan el contenido autorizado sin copiarlo a `ChatLogs`, cachés legacy o Woztell. La navegación y las actualizaciones tardías no pueden sobrescribir otra sesión seleccionada.

El agente sigue sus instrucciones y reglas de canje. El transporte facilita el perfil acreditado disponible y permite recoger nombre, teléfono internacional, zona confirmada y consentimiento cuando falten. El acceso CRM depende de cuenta, permisos y conexión exacta del servidor. Una llamada sólo se confirma con identificación y lectura remota verificadas; un efecto incierto queda pendiente de reconciliación y no se repite automáticamente.

El permiso de llamada puede acreditarse con una afirmación breve únicamente después de una pregunta previa inequívoca de llamada, leída del historial autorizado. La zona del cliente determina sus fechas relativas y su hora visible; la agenda mantiene la zona operativa de Madrid y rechaza horas inexistentes o ambiguas.

## Coordinación Portal

Portal entregó `feffd25` en `codex/gestadia-marketplaces`, con 302 pruebas backend, 204 frontend y build APP correctos según su evidencia compartida. Su extensión de perfil v1 queda apagada por defecto. Conserva una revisión de perfil pendiente, bytes y claves de idempotencia; permite adelantar la retirada de permisos con el mismo parche. No acredita zona ni consentimiento desde campos que no posee, ni activa nuevos permisos CRM. El consumidor de contexto account v2 queda pendiente en Portal.

Se contrastaron directamente los tres esquemas con su entrega; sus SHA-256 coinciden:

- v1 contexto: `a582689ef1cd18f3d0f590ec3f4e9ad975f572115e8c9d6b89cbd1a340fd90f5`.
- v2 solicitudes: `70d18449517ce159293dd6222f00aec9ff20232e2a8fb04fff8e8a97434adf21`.
- v2 respuestas: `3052262b001f5a3d5ac2c7986bf8f3eb246d5192e8afb83c520b4eb11e67011b`.

## Evidencia y límites

La ejecución final R11 compiló el código y pasó 633/633 pruebas, sin omisiones. Incluye sesión/estado común, navegación entre canales, retirada de perfil/permisos, pipeline, catálogo local, consentimiento contextual y CRM desaparecido sin ID ficticio. La regresión adicional de Web/WhatsApp/agenda pasó 213/213. Los vectores JS verificaron 4 casos de perfil y 7 de v2; los esquemas cerrados verificaron 28 casos. La revisión independiente final de núcleo, identidad y UI no dejó hallazgos P1/P2; la protección del timer de Inspector se revisó estáticamente y mediante contrato fuente, sin atribuirle una prueba funcional con barrera. Los proveedores y CRM de estas pruebas son dobles offline, sin conversaciones contra un modelo real.

El 11/10 se inspeccionó en PRO V1.721 el formulario de LidIA Canje v4: estaban seleccionadas las herramientas de canje y la integración Defensa Legal Consumidores - PRO; contacto/hora/set_variable no estaban seleccionadas. Se cerró el formulario sin guardar. El adaptador necesita las funciones locales compiladas y autorizadas del motor, sin cambiar las asignaciones o la instrucción del 119. La selección visible no demuestra los endpoints exactos, el mapping operativo ni una llamada real.

La UI confirmó previamente `manual_20261011_154318.sql`, 1.20 GB. Se recuperó la sesión de Portainer en Chrome y se ha solicitado una nueva copia de BD y copia del runtime/configuración previa a V1.722. Se conservó también el código V1.721 mediante archivo Git de `fee72c46d`. La aplicación servida sigue en V1.721; copias y despliegue se comprobarán en una anotación operativa posterior. No se acredita una versión nueva desplegada, una llamada/Lead real ni activación de permisos/conexiones CRM.

La rama PRO necesita además la base de continuidad guest/account y la migración EF `20261011021704_AddAppGuestContinuity`, presentes en DEV y ausentes en su base V1.721. Se prepara por separado; el rollback con datos v2 debe usar el backup de BD, no un downgrade ciego. No se ejecuta SQL manual ni se altera `__EFMigrationsHistory` de producción.

La migración requerida se generó sólo con `dotnet ef`, usando factory offline explícita. `has-pending-model-changes` no detectó diferencias. Sus SQL de subida y bajada se ejecutaron en fixtures sin red y con tmpfs, en MySQL 8 y MariaDB 11.4.12: upgrade, conservación v1, unicidad v1/v2, FK, ascii_bin y downgrade sin datos v2 pasaron. Los dos fixtures se eliminaron tras comprobar su propiedad. Esto valida el esquema; no demuestra restauración del backup productivo.
