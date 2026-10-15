# Publicación y prueba real de la corrección guest

Paquete concreto preparado localmente el15/10/2026. Sin push, merge, redeploy ni activación todavía. La creación real de Lead y Call de prueba con teléfono555555555 ha sido solicitada expresamente por el usuario; no se ha realizado.

| Entrega | Commit local / destino | Comprobación |
| --- | --- | --- |
| Portal | 8a3211f, rama codex/fix-guest-crm-callback → app/main | 46/46 dirigidas; frontend214/214 y build APP |
| LidIA desarrollo | 15c90b71f, codex/fix-guest-crm-callback → dev/IA/main | 582/582 APP, marcador y OwnerLead |
| LidIA PRO | e652fe89c, codex/fix-guest-crm-pro → app/main | Cherry-pick propio sobre607cf368; código y tests idénticos a15c90b71f, diff funcional vacío |

La única resolución del cherry-pick fue GLOSARIO: conserva los bytes de PRO y añade el delta propio de la corrección, sin promover las23revisiones documentales ajenas. Rollback local Source: rollback/app-guest-crm-pro-20261015 en607cf368. Portal: rollback/app-guest-crm-20261015 en d5fcd362.

## Corte previsto

1. Integrar exclusivamente estas entregas por sus PR y comprobar checks. No redeploy manual DEV; no usar docker/main.
2. LidIA PRO stack26: app/main, compose/path y configuración privada/volumen conservados. En Portainer se ha leído607cf368 y servicio healthy; GitOps updates está activo. Guardar/cambiar una referencia no se contará como despliegue: exigir V1.732-app-guest-crm servido.
3. Portal: backend del stack común73 desde app/main, únicamente imagen/código backend de esta corrección. Conservar APP, Portal web, puertos, redes, montajes, credenciales y rutas. No publicar binarios móviles.
4. Configurar la integración invitada con su conexión y herramientas CRM/agenda verificadas y los opt-ins GuestCrmEnabled / APP_V2_GUEST_CRM_ENABLED. No copiar identidad WhatsApp ni usar IDs del móvil/modelo. Revalidar conexión Production/EU y campo owner único vigente antes de activar.
5. Leer configuración guardada y estado servido antes del test. No repetir creación ante incertidumbre ni activar otra integración.

## Aceptación real solicitada

Nueva conversación guest mediante la APP o su mismo recorrido web servido, con nombre claro de prueba y teléfono555555555. Confirmar contexto/prefijo y consentimiento por la conversación, conservando el sondeo y los criterios que ya tiene LidIA. La propia herramienta debe crear el Lead con Lead_Source=App y registrar la Call en ese mismo Lead.

Leer desde Zoho los IDs de Lead y Call, procedencia, relación al Lead, franja y Owner de ambos. La Call hereda el responsable real del Lead acreditado en servidor; un AssignedOwnerId fijo, si existe, debe coincidir. Reabrir/recuperar el turno y comprobar que no hay una segunda Call. La confirmación textual, HTTP202 o las pruebas simuladas no cierran esta aceptación.

Zoho pide MFA en la pestaña abierta del acceso guardado. No se han leído ni copiado credenciales. Portainer es accesible con la sesión guardada. La prueba real permanece pendiente hasta publicación/configuración y ejecución del recorrido; no se hace un alta manual para suplirlo.
