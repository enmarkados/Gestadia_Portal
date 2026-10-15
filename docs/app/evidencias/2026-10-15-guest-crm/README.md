# CRM y llamada sin registro — corrección del 15/10

Estado: ambos backends publicados y saludables; CRM invitado activo. Prueba real ha creado automáticamente Lead App/Canje y Call con Juan Carlos Acero bajo V1.733; recuperación y ausencia de duplicados comprobadas. [Estado operativo y preimágenes](PUBLICACION-Y-PRUEBA-REAL.md). Caso Fernando Cortes identificado en PRO. La precisión humana vigente confirma Lead con procedencia App y llamada en ese Lead asignada al agente vinculado, conservando los criterios existentes. [Diagnóstico real y comprobaciones](DIAGNOSTICO-Y-DECISION.md). Primera prueba: Lead588164000147948490 y Call588164000147862440, creados por el sondeo invitado real con555555555. Prueba definitiva bajo733: Lead588164000147861411 y Call588164000147838446, con asignación automática Juan/Canje.

## Causa confirmada en código

`AppGuestService` admitía sólo sondeo/history en el ACK y rechazaba siempre appointment_receipt. En Source c8d77dcef, EffectivePermissions filtraba al guest y AppLocalToolPolicy, FunctionExecutionService.App, ZohoService.AppGuard y AppAppointmentReceipt exigían cuenta. El perfil mínimo documentado además tenía Crm=null y sólo el catálogo Country/reloj. Tener nombre/teléfono en el texto no ejecutaba un alta.

[Plan/diseño y entrega operativa](../../../superpowers/plans/2026-10-15-guest-crm-callback.md). El cambio requiere ambos consumidores: Portal y la rama Source codex/fix-guest-crm-callback, preparada desde c8d77dcef en un worktree propio. No se modifica su checkout dev/IA/main, que está atrasado, ni la rama de otro chat.

## Recorrido

`/lidia/conversacion`, visitante desde Inicio/Mensajes; Atrás conserva el origen. El agente conserva sondeo, captura y confirmaciones. No cambia pantallas, navegación ni componentes visuales; no se genera una captura ilustrativa como prueba funcional. Opt-in explícito de servidor, conexión/catálogo propios, nombre/teléfono acreditados; llamada sólo con consentimiento, zona/franja válidas y readback remoto. El ledger conserva las operaciones inciertas sin repetir POST.

## Verificación Portal

- RED: tres regresiones fallan por el rechazo del recibo y la falta del opt-in.
- GREEN dirigido: 46/46 pruebas de contratos/recibos/configuración/admisión, sin Zoho real. Incluye retirada durante lectura, permisos insuficientes, cuenta vinculada sin autoridad CRM, rechazo de otros permisos y ACK de vinculación por fase (CRM sólo durante prepare guest habilitado).
- Frontend: 214/214, 49 archivos; build APP correcto. Aviso habitual de navegación jsdom durante checkout.
- Suite completa backend: runner intentado, bloqueado antes de crear la base efímera porque el socket Docker no responde. No se reutiliza una base existente.

## Publicación y prueba real

Portal PR24 fusionado en app/main; LidIA PR1722/1723 y ajuste Juan/Canje PR1724/1725 fusionados en sus ramas respectivas. No hubo redeploy manual DEV. Portal stack162 sirve backend4ff4c69 healthy; APP965a12d y webbe6806d conservados. Source stack26 acredita Gitf72987e y V1.733-app-guest-canje servido, healthy.

LidIA:585/585 APP/marcador/OwnerLead y2/2 adicionales de cambio de Servicio después del binding; revisión independiente sin hallazgos importantes pendientes. La configuración publicada fija Owner Juan Carlos Acero588164000000756001 y Servicio Canje, conservando criterios de sondeo y herramientas originales.

El flujo real creó Lead588164000147948490 y Call588164000147862440,16/10/2026 10:30 Europe/Madrid. Se crearon antes de la precisión humana; después se corrigieron únicamente Owner y Servicio de estos registros de prueba mediante PUT acotado. No se confunde esta reparación con un alta automática nueva bajo733.

Recuperación desde historial observada. La verificación expresa del mismo horario actualizó LastVerifiedAtUtc a14:58:26UTC, mantuvo AttemptCount1 y la misma Call. Zoho devolvió exactamente una llamada relacionada. Ver PUBLICACION-Y-PRUEBA-REAL.md para secuencia y recibos.

### Prueba definitiva con el perfil Juan/Canje

Una nueva conversación sin registro bajo733 creó automáticamente Lead588164000147861411 y Call588164000147838446, con teléfono555555555 (+34), fuenteApp, ServicioCanje y OwnerJuanCarlosAcero588164000000756001 en ambos. Hora16/10/2026 11:00 Europe/Madrid. Lectura independiente API y UI confirmada; una sola Call relacionada y AttemptCount1. No hubo creación manual ni PUT correctivo en estos dos registros. [Recibo público](resultado-definitivo.public.json) y [secuencia completa](PUBLICACION-Y-PRUEBA-REAL.md#prueba-definitiva-creación-automática-con-juancanje).

Para aislar el teléfono de prueba se retiró sólo Mobile del primer Lead ficticio con preimagen privada. El rechazo previo por coincidencia telefónica y el retardo del índice se conservan como evidencia de la protección; no se autoenlazaron invitados distintos.

## Límites observados

La prueba real usa el recorrido web invitado servido; no acredita ejecución nativa iPhone. La suite global de LidIA no se declara verde; la evidencia corresponde a los conjuntos dirigidos.

En sesiones largas se observó429 al agotar500 solicitudes/900s por polling, y el reintento sin conversación cargada puede abrir un chat vacío. Se respeta Retry-After; la recuperación normal desde historial sí funciona. Una consulta genérica de confirmación puede mostrar texto de verificación pendiente si el agente no ejecuta una lectura fresca; pedir verificación expresa de la misma cita produjo confirmación con readback duradero. Estos hallazgos se conservan como límites, sin afirmar corregida la interfaz.
