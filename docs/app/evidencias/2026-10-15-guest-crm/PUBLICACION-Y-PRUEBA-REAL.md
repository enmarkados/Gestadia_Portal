# Publicación y prueba real de la corrección guest

Estado vivo del 15/10/2026: ambos backends publicados y saludables; CRM invitado activo. Lead y Call reales creados desde la conversación sin registro y verificados en Zoho. Owner Juan Carlos Acero y Servicio Canje configurados y publicados en V1.733. Las secciones siguientes conservan la secuencia de preparación; el readback final al pie prevalece sobre los pendientes históricos.

| Entrega | Commit local / destino | Comprobación |
| --- | --- | --- |
| Portal | 8a3211f, rama codex/fix-guest-crm-callback → app/main | 46/46 dirigidas; frontend214/214 y build APP |
| LidIA desarrollo | 15c90b71f, codex/fix-guest-crm-callback → dev/IA/main | 582/582 APP, marcador y OwnerLead |
| LidIA PRO | e652fe89c, codex/fix-guest-crm-pro → app/main | Cherry-pick propio sobre607cf368; código y tests idénticos a15c90b71f, diff funcional vacío |

La única resolución del cherry-pick fue GLOSARIO: conserva los bytes de PRO y añade el delta propio de la corrección, sin promover las23revisiones documentales ajenas. Rollback local Source: rollback/app-guest-crm-pro-20261015 en607cf368. Portal: rollback/app-guest-crm-20261015 en d5fcd362.

## Corte previsto

1. Integrar exclusivamente estas entregas por sus PR y comprobar checks. No redeploy manual DEV; no usar docker/main.
2. LidIA PRO stack26: app/main, compose/path y configuración privada/volumen conservados. En Portainer se ha leído607cf368 y servicio healthy; GitOps updates está activo. Guardar/cambiar una referencia no se contará como despliegue: exigir V1.732-app-guest-crm servido.
3. Portal: backend del stack vigente gestadia-common-git162 desde app/main, únicamente imagen/código backend de esta corrección. Conservar APP, Portal web, puertos, redes, montajes, credenciales y rutas. No publicar binarios móviles.
4. Configurar la integración invitada con su conexión y herramientas CRM/agenda verificadas y los opt-ins GuestCrmEnabled / APP_V2_GUEST_CRM_ENABLED. No copiar identidad WhatsApp ni usar IDs del móvil/modelo. Revalidar conexión Production/EU y campo owner único vigente antes de activar.
5. Leer configuración guardada y estado servido antes del test. No repetir creación ante incertidumbre ni activar otra integración.

## Aceptación real solicitada

Nueva conversación guest mediante la APP o su mismo recorrido web servido, con nombre claro de prueba y teléfono555555555. Confirmar contexto/prefijo y consentimiento por la conversación, conservando el sondeo y los criterios que ya tiene LidIA. La propia herramienta debe crear el Lead con Lead_Source=App y registrar la Call en ese mismo Lead.

Leer desde Zoho los IDs de Lead y Call, procedencia, relación al Lead, franja y Owner de ambos. La Call hereda el responsable real del Lead acreditado en servidor; un AssignedOwnerId fijo, si existe, debe coincidir. Reabrir/recuperar el turno y comprobar que no hay una segunda Call. La confirmación textual, HTTP202 o las pruebas simuladas no cierran esta aceptación.

Zoho web ya está autenticado; la solicitud MFA inicial quedó resuelta. Portainer es accesible con la sesión guardada. Plesk mantiene el formulario de acceso con error de credenciales; se ha mostrado al usuario para que complete ese acceso. La prueba real permanece pendiente del corte/configuración de Portal y la activación Source; no se hace un alta manual para suplir el recorrido.

## Preimagen actual corroborada después de la preparación

Lectura Portainer15/10: stack73 gestadia-common no contiene servicios. El stack vigente es162 gestadia-common-git, repo Gestadia_Portal, compose deploy/gestadia/portainer-stack.yml, Git7e3a9b4/PR22, GitOps apagado. Sus tres contenedores están healthy: APP965a12d, backend3b95062 y Portal web be6806d. El backend3b95062 tiene el mismo código funcional base que d5fcd36; PR23 es documentación. El corte y rollback deben actuar sobre162, conservando APP/Portal web. No recrear73 ni usarlo como destino del arreglo.

## Ejecución autorizada el 15/10/2026

El usuario ha autorizado expresamente «Publicar y probar ahora». No queda pendiente esa autorización.

- Portal PR24 fusionado en app/main: df030ac0615246b214a90bee34cd0f1d90db4402.
- LidIA PR1722 fusionado en dev/IA/main: 527d015b20f4e6f6a0a5c0e1a95e45fbf4009a1b; sin redeploy manual DEV.
- LidIA PRO PR1723 fusionado en app/main: 92aa4b8b0284e236bab91a542ceb4689f99efb28.
- Stack26 actualizado desde Git. Portainer devolvió inicialmente504; el readback posterior acredita92aa4b8, contenedor dda62a6325b17a6c0259ebcb987d4789f4346e53224b1a0f8cad426407c19e84 healthy y marcador V1.732-app-guest-crm servido por admin. No se repitió el redeploy.
- Imagen Portal construida en el servidor: gestadia-backend:4ff4c69, ID fae8463dcfc5, revisión4ff4c69b5a2462603f26cc5a6e4ffaa1aee94e57. Contexto propio696320bytes, SHA2564aa4c1df1480f43b02dea25958e045b26963fb440b73c589d76f27e9d1c586c6. Aún no sustituye el backend servido del stack162.
- Backup manual LidIA PRO creado antes de cambiar el perfil: manual_20261015_124500.sql, mostrado1.23GB y mensaje de creación correcta.
- Zoho web ya autenticado. Plesk ha rechazado el acceso guardado; el usuario está completando el acceso en Chrome para copia/configuración de Portal.
- Configuración Source guest aún sin modificar: integración/audience gestadia-app-pro-guest, Project104/Agent123, environment pro, GuestV2Enabled=true, Crm=null y permisos sondeo/history. Conexión4 de Zoho activa con Environment=Production. La copia de configuración y las comprobaciones de campo owner/catálogo precederán a cualquier activación.

Siguen pendientes el corte del backend Portal, configuración efectiva de ambos extremos y la conversación real con555555555. No se ha creado ni acreditado el Lead o la Call de prueba.

Inspección operativa adicional: el agente119 tiene herramientas activas10357 agendar_cita,10359 comprobar_horario y10360 convertir_lead_zoho (endpoint internal:zoho:crear_lead_canje), todas Project102. Invitado123 sólo tiene10372 comprobar_pais_carne. Las copias antiguas del Project103 asociadas a conexión4 están inactivas y no se reactivan. Para preservar aislamiento de proyecto, se preparan copias exactas de las tres definiciones originales en104; no se trasladan las originales ni se cambian sus criterios. Readback de Zoho vía conexión4: Leads y Contacts HTTP200, LidIA_App_Owner_Key text, unique casesensitive=0. Esto verifica el requisito de campo único; todavía no acredita un Lead/Call de prueba.

Preparación operativa revisada en ops/GuestCrmActivate.cs: no transferida ni aplicada. Dependencia de corte fijada: Portal actualizado y opt-in comprobado antes de activar Source, para evitar que el Portal antiguo rechace los permisos guest nuevos. El acceso Plesk está abierto y elevado al primer plano de Chrome para que el usuario lo complete. Source sigue con su configuración guest anterior; no se ha reiniciado para activar CRM.

Al retomar tras «ya abri crm zoho y login en chrome», se corroboró Zoho autenticado y Plesk aún en login_up.php. Un envío del formulario Plesk preparado volvió a mostrar Incorrect username or password. No se insistió ni se probaron otras credenciales; se dejó la pestaña elevada y se explicó que ese acceso es distinto de Zoho. La preparación permanece pendiente de corte sin activar Source antes de Portal.


## Readback tras acceso Plesk y corte efectivo

El acceso Plesk quedó operativo tras la confirmación «ya». La preimagen real montada difiere de la nota previa: `/var/www/vhosts/gestadia.com/gestadia-mobile-private/backend-guest-20261014.env`, modo600, propietario de la suscripción. Se conservó el archivo íntegro y sólo se añadió APP_V2_GUEST_CRM_ENABLED=true. Hash previo734e907b6413090b46e0797d1405f3377894709d4ba2a62ead79186ea5b0b1b7; posterior79a09037f033c2a2060046b6a42422e158aafe706ac8d852d233f12739bf817b.

Copia fresca Portal en `/var/www/vhosts/gestadia.com/gestadia-mobile-private/backups/guest-crm-20261015T140612Z`, directorio700 y archivos privados: portal.sql341088bytes SHA25617e853d62e93cc5321089d91c065de18f28bdd0e46fc498221f1c5b60bf26f02, backend.env4466bytes y uploads.tar.gz244bytes. Incluye inspect privado. Dump single-transaction con rutinas/triggers/eventos; sin restauración de prueba en este corte.

Stack162 guardado y Pull and redeploy desde Git con re-pull de imágenes desactivado (imágenes locales). Portainer acredita commit desplegado df030ac/PR24. Backend servido gestadia-backend:4ff4c69, running/healthy, etiqueta revision4ff4c69b5a2462603f26cc5a6e4ffaa1aee94e57 y dotenv confirma GUEST_CRM_ENABLED=true. APP965a12d y webbe6806d conservados.

Activación Source: validó campos únicos en Leads/Contacts. Primer intento abortó dentro de transacción por un carácter omitido en el hash10360 del helper operativo. Readback desde primaria acreditó agente123 conexiónnull, única asignación10372, ausencia de clones y configuración con SHA previo intacto. Se conservó copia del intento abortado en ops-guest-crm-20261015-aborted-precommit; sin restaurar base ni repetir efectos inciertos. Hash10360 correcto d3b901d675c0cc0a4a8d087bb4a31a78eb17d25e5ef46cded57c8a49c0d63986.

Helper corregido SHA256178c0303b82de55a9e0188afe0bdb0305e1514b27a8243ecd9f65157ef14a508. Aplicación y readback primaria correctos: Agent123, Project104, Connection4; clones10375/10376/10377. Configuración posterior valor binario de AfterHash en applied.public.json (la transcripción manual previa se corrige); recibo applied.public.json y fases inmutables en /app/App_Data/ops-guest-crm-20261015. Reinicio únicamente lidia-app-gestadia-pro; running/healthy confirmado.

Conversación real guest iniciada desde app.gestadia.com:6b4ce1fc-9dd2-4cc9-b8c0-41135ef7efd8. Sondeo en curso. Ningún alta manual Zoho sustituye esta prueba.


## Alta y llamada reales observadas

Desde la conversación guest6b4ce1fc-9dd2-4cc9-b8c0-41135ef7efd8 (Source1277758b-5ae9-4125-89ae-2f4bbff0fa92), recorrido normal sin registro y sin alta manual: sondeo Colombia/vigencias/residencia confirmados, nombre Prueba CRM App Invitado, teléfono555555555 y prefijo+34 aclarado expresamente, Europe/Madrid y consentimiento separado. Se solicitó16/10/2026 10:30 y se confirmó teléfono/franja de nuevo cuando lo pidió el agente.

Zoho UI leído directamente: [Lead588164000147948490](https://crm.zoho.eu/crm/gestadia/tab/Leads/588164000147948490), nombre Prueba CRM App Invitado, móvil+34555555555, Fuente de Posible cliente App. [Call588164000147862440](https://crm.zoho.eu/crm/gestadia/tab/Calls/588164000147862440), vinculada a eseLead, hora16/10/2026 10:30. Asunto Llamada de canje (LidIA), marcador LIDIA-OP:1aa8ccfecb6d4da69b88cbed5038464b. Ambos propietarios Sistemas - Zoho. Se ha consultado al usuario si es el responsable previsto o debe existir un comercial concreto; no se inventa un responsable diferente.

AgentFlowState5898 contiene contacto, cualificación y committedAppointment verificado2026-10-15T14:21:46.525067+00:00, mismoLead/Call y requestedStart2026-10-16T10:30:00+02:00. Portal conserva permisos callback_schedule,crm_prepare,history,sondeo y ownerUserIdnull.

La búsqueda global de Zoho no devolvía el alta inmediatamente; el detalle directo por ID sí acredita ambos registros. Al recargar APP se recibió HTTP429 del endpoint GET /api/app/guest/conversations: límite500 por900s, restante0, Retry-After123s (14:28:22UTC). Se respeta esa ventana; pendiente readback de recuperación/sin duplicados. No se repite alta ni agenda.


## Precisión humana y responsable definitivo

El usuario confirmó «a Juan Carlos Acero y tienes que hacerlo con Servicio Canje». MetadataZoho vigente: Leads.Campa_a (Servicio), picklistCanje; usuario activo Juan Carlos Acero Fernandez-Maqueda ID588164000000756001. El primer Owner técnico no es el resultado aceptado.

Mappingguest104/123 guardado conservando todos los demás nodos/claves: AssignedOwnerId588164000000756001 y LeadServiceCanje. Preimagen comparada automáticamente con applied.public.json.AfterHash, copia privada routing.before.private.json. Un primer intento previo abortó antes de escribir por transcripción manual inexacta del SHA; la versión aplicada lee el recibo original sin copiar caracteres. Requiere recarga de Source733.

Corrección limitada a los dos registros de prueba tras GETprevio exacto: Lead588164000147948490 OwnerJuan y Campa_aCanje; Call588164000147862440 OwnerJuan. Se preservan nombre, móvil,fuenteApp,marcador,relación y16/10/2026 10:30+02:00. GETposterior acredita propietario numérico coincidente, ServicioCanje,App y mismoLead. No se han creado Lead/Call manualmente: el alta y la Call originales proceden del recorrido guest; esta reparación de sus campos sucede tras la precisión humana. Scriptacotado ops/RepairGuestCrmTestRouting.py, copia privada previa en servidor.

Source añade LeadService opcional por integración: alta y verificación remota deCampa_a, incluido bindingprevio, hashdurable (nullconservahashanterior) y revalidación de mapping antes de Call. PR1724(app/main) fusionadof72987e2d4cb703d9960b5c0a5e2cb3e8c293450; PR1725(dev/IA/main) con cherry-pick propio sin arrastrar otroscambiosPRO. Marcador733. RED3/3; GREEN585/585 y2/2 adicionales; revisión independiente sin hallazgos importantes. Despliegue733 solicitado en stack26; pendiente readbackservido.

Recuperación: tras expirar429, el botón «Volver a cargar» sin conversación cargada abrió una consulta nueva vacía6108c3a9-66d9-4b7b-b053-f5ebb5ae7e89. No creó Lead/Call. No se toma como prueba de recuperación del historial original. Se comprobará el acceso normal desde historial al chatoriginal sin repetir alta. Este hallazgo no se oculta como reintento idempotente completado.

## Readback final de publicación y recuperación

Portainer stack26 acredita Git f72987e2d4cb703d9960b5c0a5e2cb3e8c293450, contenedor f780af35109e3aa1ba40119a2af871316f2ca65f8c89209c9435e1914c7d5290 healthy, creado 15/10 16:50:30 Madrid. Admin sirve V1.733-app-guest-canje. PR1725 de DEV quedó fusionado en 9f9794b14d752ab2e276dab795035f9e6a852fb9, sin redeploy manual DEV.

Desde el historial se abrió la conversación original y se recuperaron los mensajes y la cita. Una primera pregunta de confirmación no ejecutó verificación fresca y la protección de publicación añadió el texto de verificación pendiente; no se elimina esa protección. Al solicitar expresamente verificar la misma cita sin crear otra, LidIA respondió a las16:58 con la confirmación del16/10 a las10:30 Europe/Madrid. El ledger conserva OperationId1aa8ccfecb6d4da69b88cbed5038464b, StatusSucceeded, CallId588164000147862440 y AttemptCount1; LastVerifiedAtUtc avanzó a2026-10-15 14:58:26. Se acredita reconciliación de la Call existente, sin nuevo intento de creación.

Lectura API Zoho de Lead y Call: Owner588164000000756001 Juan Carlos Acero Fernandez-Maqueda en ambos, Lead_SourceApp, Campa_aCanje, What_Id588164000147948490 y Call_Start_Time2026-10-16T10:30:00+02:00. El endpoint relacionado Leads/{id}/Calls devuelve exactamente una Call,588164000147862440. La captura y transcripción conversacion-recuperada documentan el turno posterior al despliegue733.

Límites observados: validación web del recorrido guest servido, sin ejecución nativa iPhone. El sondeo creó originalmente los registros antes de precisar Juan/Canje y esos dos campos se corrigieron mediante PUT acotado; no se presenta esa reparación como alta automática nueva bajo733. El sondeo sigue conservando sus criterios. En sesiones largas el polling puede agotar500 solicitudes/900s y producir429; se respeta Retry-After, sin desactivar el límite. El botón de reintento sin conversación cargada puede abrir un chat vacío; la recuperación desde historial sí se ha observado. No se afirma resuelta esa incidencia de frontend.


## Prueba definitiva: creación automática con Juan/Canje

Se completó un nuevo recorrido normal sin registro bajo V1.733, conversación Portalb4cdf32e-a707-4277-9e26-396c54903cee y Source d9105396-561d-4c3a-a3c3-aa96ef4e5185. Nombre Prueba Canje Juan App, teléfono555555555 con +34 confirmado, Europe/Madrid y consentimiento explícito. Se preservaron las preguntas y confirmación del sondeo; se pidió16/10/2026 a las11:00 Madrid.

El primer intento de esta prueba adicional fue rechazado antes de crear ledger/efectos con crm_owner_resolution_required: el teléfono correspondía al primer Lead ficticio. No se debilitó la protección ni se autoenlazó otro invitado por teléfono. Se retiró únicamente Mobile del primer Lead de prueba588164000147948490, después de verificar ID/nombre/fuente/servicio/Owner y guardar preimagen privada exclusiva en /tmp/guest-crm-fixture-mobile.before.private.json. Su Call de10:30 y los demás campos se conservan como evidencia de la primera prueba. Script acotado ops/IsolateGuestCrmTestPhone.py. No se modificaron registros ajenos. El índice de búsqueda de Zoho tardó en reflejar esa retirada: el reintento previo aún recibió el mismo rechazo; tras GET de búsquedas Leads/Contacts sin coincidencias, se reanudó desde la conversación.

El turno normal de17:10 creó automáticamente [Lead588164000147861411](https://crm.zoho.eu/crm/gestadia/tab/Leads/588164000147861411) y [Call588164000147838446](https://crm.zoho.eu/crm/gestadia/tab/Calls/588164000147838446), sin PUT correctivo de Owner/Servicio ni creación manual. Lead_Source=App, Campa_a=Canje, Mobile=+34555555555, OwnerJuanCarlosAcero588164000000756001. La Call tiene ese mismo Owner, What_Id=Lead588164000147861411, móduloLeads y Call_Start_Time=2026-10-16T11:00:00+02:00. Ledger OperationId75733e15e1fb4b6499bc523bbb907888, StatusSucceeded, AttemptCount1 y verificación15:10:48UTC. La consulta relacionada de Zoho devuelve exactamente una Call en este Lead. Las dos llamadas del conjunto completo corresponden a dos pruebas deliberadas y Leads distintos; no se afirma que exista una única Call global.

Lectura independiente por API con assertions de todos esos campos y UI Zoho acreditadas. [Recibo público de lectura](resultado-definitivo.public.json), [conversación](conversacion-juan-canje.dom.txt), capturas conversacion-juan-canje.jpg, zoho-definitivo-lead.jpg y zoho-definitivo-call.jpg. Los intentos rechazados se conservan en el historial; no se presentan como éxitos. La prueba definitiva sí acredita asignación automática nueva de Juan/Canje bajo733.
