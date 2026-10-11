# Preparación del permiso de agenda v1 — 11/10/2026

**Estado:** backend preparado en esta rama, sin despliegue ni activación. No acredita una llamada reservada. El objetivo humano sólo se cierra con reserva real, lectura remota y confirmación en APP.

## Alcance

El opt-in privado `APP_LIDIA_CALLBACK_ENABLED` está apagado por defecto. `APP_LIDIA_CALLBACK_SCOPE_JSON` acepta un único objeto cerrado: `portal_user_id`, `conversation_id` local Portal, `integration_id`, `expires_at` UTC con milisegundos. No recibe IDs Zoho, agente o conexión desde el móvil. Una configuración incompleta se rechaza; el ámbito por sí mismo no añade permisos.

`setConversationAccess` exige un grant explícito de cuatro permisos history/sondeo/crm_prepare/callback_schedule con `conversation_id`, fuente de autorización y fechas. La cuenta/chat/propósito e integración se contrastan en servidor, y la vigencia no puede superar la del ámbito. Requiere history/sondeo básicos ya vigentes; no restaura autoridad retirada.

Sólo los dos permisos adicionales se guardan en `AppConversation.callbackGrant`, con fuente/validación/caducidad. No se altera `AppConversationAccess` compartido ni la autoridad básica anterior. Configurar otro chat no traslada ese grant. Una solicitud scoped history/sondeo retira sólo el grant del chat; apagado/caducidad también lo excluyen al recalcular contexto. El lifecycle refresca autoridad antes de emitir un contexto CRM previamente preparado, conservando bytes y claves de sus operaciones.

Migración aditiva nullable `20261011192000_app_callback_scope` preparada; sólo aplicada a la fixture local. No activa guest ni contexto account v2. Perfil v1 conserva sus flags independientes; teléfono/zona/consentimiento ausentes siguen siendo preguntas del agente, no invenciones de Portal. Zoho/agenda y su propiedad/readback pertenecen a LidIA.

## Verificación

RED observado: gate ausente y rechazo del grant; segundo RED de aislamiento mostró que usar el grant global sustituía permisos básicos. Se descartó esa propuesta antes de desplegar y se conservó autorización por fila de chat. El test de tipo de integration_id reprodujo configuración numérica aceptada; corregido mediante validación de tipo.

`node scripts/test-app-conversations.mjs`: verificación final tras revisión exit0, 313 pruebas backend, 204 frontend y build APP correctos (1,32 s). La fixture MySQL8 local con tmpfs aplicó 15 migraciones y fue retirada por su runner tras comprobar su etiqueta de propiedad. Avisos existentes de Node sobre módulos/mock experimental y jsdom sobre navegación de checkout; ningún test fallido.

Única revisión independiente: P1 en lifecycle, revocación entre la primera lectura y el lock omitía refrescar, pero dejaba salir un contexto CRM antiguo. Regresión con MySQL real: RED observó un envío adicional (2 frente a 1); tras abortar al comprobar identidad/propiedad no elegibles bajo el lock, GREEN dirigido 11/11 y suite completa anterior. Sin otros P1/P2 concretos; se hizo una sola pasada de corrección y no segunda revisión.

Cubierto: otras cuentas/chats, grant sin configuración, configuración sin grant, retarget, permiso básico retirado, caducidad del scope/grant, apagado, retirada explícita scoped, contexto pendiente antiguo y revocación confirmada antes del lock. Sin POST CRM, Lead/Call, datos de contacto reales, cambio de permisos productivos, migración productiva, emuladores ni distribución nativa en estas pruebas.

## Dependencias restantes

Teléfono/zona/franja reales preguntados al usuario una sola vez. LidIA prepara corrección de agendar_cita y contrato de recibo verificado. Antes de activar: configuración y propiedad CRM acreditadas en LidIA, esquema/consumidor compatibles, copia/restauración nuevas, despliegue comprobado y confirmación humana del permiso exacto para la cuenta/chat de prueba. Después: UI → disponibilidad → creación → readback de ID/hora/teléfono/estado, sin repetir efectos ante incertidumbre.
