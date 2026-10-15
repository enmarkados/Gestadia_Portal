# Publicación y prueba real de la corrección guest

Estado vivo del15/10/2026: correcciones fusionadas y LidIA PRO sirve V1.732-app-guest-crm. La imagen nueva de Portal está construida; su corte y la activación guest CRM siguen pendientes del acceso a Plesk. La creación real de Lead y Call con teléfono555555555 está autorizada y todavía no se ha realizado.

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
