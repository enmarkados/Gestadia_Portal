# Corrección de CRM y llamada desde invitado

Petición del usuario del 15/10: verificar y corregir que dar nombre y teléfono sin registro no produce alta Zoho ni llamada. Autoriza la corrección local; despliegue y activación se verifican aparte.

**Precisión humana vigente:** LidIA debe completar el sondeo sin cuenta, crear el Lead con procedencia `App` al disponer de nombre/teléfono y registrar la llamada en ese mismo Lead, asignada al agente vinculado y conservando los criterios de agenda existentes. Se continúa la corrección sin otra elección de alcance; la pausa anterior queda superada. Sin alta de cuenta ni inserción manual del caso de prueba.

**Revisión posterior al caso real (antecedente):** [diagnóstico del caso](../../app/evidencias/2026-10-15-guest-crm/DIAGNOSTICO-Y-DECISION.md). El código permanece sin publicar. La decisión de comportamiento la fija la precisión humana anterior.

## Diagnóstico y diseño

Portal `AppGuestService` limita SessionAck/BindingAck a sondeo/history y rechaza siempre appointment_receipt. LidIA filtra los permisos guest a sondeo/history y sus herramientas de contacto/CRM exigen IsAccount. El perfil mínimo documentado tiene Crm=null y carece de herramientas CRM. No es un fallo de formulario ni se resuelve extrayendo teléfonos en el frontend.

Se conserva `/lidia/conversacion`, origen Inicio/Mensajes, Atrás al origen, identidad por instalación y ChatSession APP común. El agente guarda sólo datos acreditados en el turno. Nombre/teléfono permiten preparar Lead mediante el ledger existente; reservar exige además consentimiento explícito, zona confirmada, franja válida y readback. No se detecta éxito a partir del texto del agente.

La integración Source puede declarar `GuestCrmEnabled` explícito (false por defecto), además de GuestV2Enabled, Permissions y Crm propios. Sólo este opt-in permite crm_prepare/callback_schedule al owner guest vigente; no autoriza casos, gestor ni identidad de cuenta. Los guards vuelven a comprobar autoridad/expiración/retirada antes de herramientas y efectos. El owner CRM guest utiliza el sujeto de conversación para aislar chats de una misma instalación. Binding posterior no traslada automáticamente el CRM al account: exige reconciliar ownership.

Portal declara `APP_V2_GUEST_CRM_ENABLED` (false por defecto) para admitir esos dos permisos de la integración configurada y recibos verificados. El opt-in no concede permisos por sí mismo, ni acepta CRM después de binding sin consumidor account/context. Revalida propiedad y permisos antes de publicar una respuesta y filtra recibos al retirar la capacidad, conservando los bytes históricos.

## Implementación y comprobación

- [x] Source: regresiones RED de permisos guest, catálogo, captura grounded, Lead único, llamada/readback e incertidumbre; implementar sobre c8d77dcef en rama propia.
- [x] Portal: regresiones RED de SessionAck, recibos guest autorizados, retirada y rechazo de account/guest no habilitado; implementar sin cambiar wire/schemas cerrados.
- [x] Ejecutar pruebas locales y registrar límites. Sin LLM replay, migraciones ni escrituras CRM reales.
- [x] Revisar diff y actualizar manual/navegación/evidencia/glosario en ambos repositorios.

## Entrega operativa pendiente

El código no asigna ni inventa conexión, owner/campo único, agente ni herramientas. La configuración servida necesita mapping CRM propio y catálogo aprobado, además del opt-in en ambos servicios. No copiar credenciales Main ni activar producción automáticamente. El cierre requiere APP real → contacto → Lead leído → consentimiento/franja → Call leída con relación/hora exactas y recuperación sin duplicados. El caso Fernando Cortes ya se identificó por SID y horas en la revisión enlazada; no se ha consultado directamente Zoho. El diagnóstico anterior se conserva como fase de código/configuración documentada.

## Cierre del caso real autorizado

- Reutilizar las herramientas de canje y agenda existentes y PrepareAppCrmAsync con su ledger; no añadir otra herramienta ni criterios de llamada paralelos. Captura sigue siendo pura.
- Enviar Lead_Source=App en el alta y probar el mismo Lead/Owner en la Call. Resolver el responsable real del Lead (contrastando AssignedOwnerId si existe) y verificarlo mediante lectura de la Call antes de publicar éxito; una discrepancia conserva la operación pendiente sin repetir POST.
- Cubrir teléfono nacional + confirmación separada de prefijo y consentimiento con el teléfono confirmado, sin inferir país del carné.
- Bloquear confirmaciones de Lead/llamada en la salida APP si no las respalda el ledger y el recibo verificado; no convertir el texto del modelo en prueba.

## Revisión de código

Revisión independiente de sólo lectura solicitada por la habilidad requesting-code-review. Se añadieron regresiones y correcciones de ACK prepare/commit, responsable Zoho obligatorio para guest antes de efectos y variantes de confirmación sin ledger. La rama guest de la herramienta existente mantiene el gate de cualificación y la condición de interés de la agenda; no convierte Leads ni añade una herramienta o regla de sondeo. Los resultados locales y los límites de runtime se registran en la evidencia enlazada.

## Validación real requerida por el usuario

Teléfono555555555. Crear Lead con procedencia App y Call desde una conversación guest normal; leer los dos registros, relación, franja y Owner, y contrastar recuperación sin segundo POST. El acceso Zoho guardado solicita MFA y Portainer conserva stack26 en607cf368. No hay Call real creada por esta revisión todavía; los resultados locales no sustituyen esta aceptación.
