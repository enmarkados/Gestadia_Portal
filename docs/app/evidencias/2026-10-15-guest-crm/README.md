# CRM y llamada sin registro — corrección del 15/10

Estado: publicación y prueba autorizadas; código fusionado, LidIA PRO sirve V1.732-app-guest-crm y la imagen Portal está construida. Corte Portal y activación CRM pendientes del acceso a Plesk. [Estado operativo y preimágenes](PUBLICACION-Y-PRUEBA-REAL.md). Caso Fernando Cortes identificado en PRO. La precisión humana vigente confirma Lead con procedencia App y llamada en ese Lead asignada al agente vinculado, conservando los criterios existentes. [Diagnóstico real y comprobaciones](DIAGNOSTICO-Y-DECISION.md). No hay alta/llamada real de esta revisión.

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

## Pendiente antes de afirmar corrección servida

Configurar y revisar en el perfil guest su mapping/owner único, conexión y herramientas de CRM/agenda asignadas; completar el corte Portal y activar sólo los opt-ins propios con la autorización explícita ya recibida. Portal debe admitir los permisos nuevos antes de activar Source. Mantener los flags apagados por defecto. Si la conversación ya existía con permisos sondeo/history, requiere reconciliación de su admisión antes de ampliar autoridad: al reanudar o enviar, Portal repite sólo la admisión original con su DTO/key/atestación y aplica el ACK actual mediante CAS de owner/revisión. No inventa permisos ni crea otro chat o atestación para ocultarlo. Debe acreditarse APP → captura → Lead leído → consentimiento/franja → Call leída con relación/hora/responsable exactos → recuperación sin duplicado. No atribuir las pruebas con HTTP simulado a un registro real en Zoho.

### Cierre local y prueba real pendiente

LidIA:582/582 del canal APP/marcador/OwnerLead; Portal:46/46 dirigidas,214/214 frontend y build APP correcto. Revisión de código independiente completada. Se acredita procedencia App, mismo Lead, responsable real heredado del Lead (mapping opcional contrastado), reglas de interés existentes, recuperación sin duplicados y publicación sin confirmación falsa. Son pruebas locales con HTTP simulado.

El usuario exige teléfono555555555 y creación real de Call para validar. Esa prueba aún no se ha realizado. Portainer y Zoho están accesibles; Plesk mantiene un error de acceso y se ha dejado su formulario al usuario; no se crea el caso manualmente. El cierre sigue exigiendo recorrido guest servido y lectura de Lead/Call/Owner, con sus IDs y prueba de recuperación. Sin esa evidencia no se declara validado en producción.
