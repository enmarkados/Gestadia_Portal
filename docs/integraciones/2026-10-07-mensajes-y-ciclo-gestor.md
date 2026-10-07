# Mensajes y ciclo real con gestor — diseño del 07/10/2026

Estado: reparto y adenda aceptados por Portal y LidIA el 07/10/2026, conforme a la delegación del usuario para coordinar, acordar y empezar. Implementación y aceptación del ciclo pendientes. No acredita funciones implementadas ni ciclo real validado. [Documento vigente](../app/INTEGRACION-LIDIA.md) · [Glosario](../../GLOSARIO.md).

## Petición y aceptación

El usuario exige comprobar la apertura de sesiones de atención y un ciclo completo con el operador existente `integraciones@vozenter.com`, probar la funcionalidad APP en emuladores iOS/Android, añadir nombres editables, fecha de creación/último mensaje, búsqueda y estado abierto/cerrado en Mensajes. Corrige además retirar la tarjeta «Tu sondeo» y mostrar la etiqueta visible de una respuesta elegida en lugar del identificador interno. La validación web o un saludo de IA no bastan para dar la app por válida.

## Diseño del listado

Portal será propietario del nombre personalizado del chat, persistido por cuenta y conversación, sin modificar mensajes ni identidad de agentes/operadores. Se limitará longitud, se recortarán espacios y se validará propietario bajo transacción; el móvil no elige IDs de proyecto/agente/operador. Sin nombre, se mostrará LidIA o Equipo Gestadia. Renombrar no cambiará el contenido ni la fecha del último mensaje.

El buscador filtrará nombres de conversación y tipo de interlocutor, con texto sin distinción de mayúsculas ni tildes; el campo se identificará como «Buscar conversaciones». No se promete búsqueda completa del contenido histórico. Las tarjetas mostrarán creación y último mensaje con fecha/hora, ordenadas por actividad. La creación procede de `ChatSession.CreatedAt` de LidIA cuando la sesión remota está confirmada; para una asociación pendiente se muestra la creación local; la fecha del último mensaje y el estado vigente requieren evidencia autoritativa de LidIA. `updatedAt` local no sustituye esa fecha. Sin mensajes confirmados se indicará «Sin mensajes»; ante fallo de metadatos no se inventará fecha ni estado abierto.

Alternativa descartada: nombres sólo en localStorage, porque se perderían al cambiar de dispositivo. Alternativa descartada: ordenar usando cualquier actualización de contexto/permisos, porque presentaría actividad que no es conversacional.

## Reparto y dependencias

Portal: persistencia/API autorizada de nombres; listado/búsqueda/fechas/estado; quitar la tarjeta de sondeo manteniendo estado interno; paquete nativo con configuración pública de prueba; sesión/grant de cliente ficticio y evidencia UI/recibos. LidIA: metadatos vigentes por sesión, etiqueta validada persistida al seleccionar una acción, mapeo del operador y rutas propias APP, asignación/intercambio/cierre desde bandeja real y evidencia de las transiciones.

No se creará otra identidad cliente. Se reutilizará el principal autorizado, con permisos y datos ficticios mínimos para el recorrido acordado, sin escribir Zoho/CRM real ni pagos/correos. Las credenciales del operador ya facilitadas se usan únicamente para iniciar sesión y no se copian a documentación, Git ni frontend. El estado de «gestor asignado» sólo aparece tras confirmación de la fuente.

### Adenda aceptada y orden de publicación

LidIA añade a `SessionResponse` y `Timeline` los campos opcionales `created_at` (fecha UTC de `ChatSession.CreatedAt`) y `last_message_at` (fecha UTC nullable del último mensaje visible para el sujeto, considerando todo el historial). La versión sigue en 1.0 y los campos previos conservan sus reglas. El estado ya existe en `conversation_status`/`status`: active, waiting_for_support, in_support, closed. Portal debe admitir primero los campos y reiniciar sus consumidores antes de que LidIA los publique, porque el validador estricto se compila al iniciar el proceso.

Portal almacena `title` (nombre nullable de hasta 120 escalares Unicode, normalizado NFC, sin caracteres de control), `remoteCreatedAt` y `lastMessageAt`. Expone `title`, `created_at`, `last_message_at` y `metadata_ready`; este último sólo es true si se recuperaron metadatos completos de LidIA en esa consulta. El listado actualiza fechas/estado mediante lecturas acotadas de Timeline (sin ejecutar modelo). Si la fuente o el permiso falla, conserva los valores anteriores como datos sin actualizar y no afirma estado vigente. El nombre se modifica en `PATCH /api/app/v1/conversations/:id` con sólo `{title: string|null}`; no actualiza última actividad.

Después de closed se crea una conversación nueva con el mismo principal y ámbito, conservando la cerrada legible. Se sustituye la unicidad usuario/integración/ámbito por un índice y se selecciona la conversación abierta bajo bloqueo transaccional de la cuenta; la idempotencia durable impide duplicados entre dispositivos. Nunca se cambia el ámbito histórico ni se reabre una sesión cerrada. Para iniciar otra se consulta primero el estado remoto de la candidata: un fallo impide inventar una sesión nueva.

LidIA prepara etiqueta visible a partir de la presentación validada, metadatos y pruebas; mantiene el input interno en la lógica y no reescribe mensajes anteriores. Después de publicar el bloque, configura departamento/ruta APP y al operador existente para `atencion`, sin expediente/CRM ficticio. Se mantiene el principal y horizonte de autoridad aprobados. La restricción exacta del grant para `manager_assignment_ref` con case_ref NULL se confirmará antes de configurar la ruta.

Cada bloque comprobado tendrá commit y push; la publicación de LidIA sigue condicionada al backup fresco y al consumidor listo. La instrucción y modelo literales del clon de 119 se conservan; su saludo previo permanece como evidencia independiente.

## Prueba de aceptación

En el paquete nativo iOS y Android: login de la cuenta principal → abrir atención → solicitar gestor → confirmar asignación a operador de prueba → mensaje del cliente → respuesta escrita desde la bandeja del operador → respuesta visible en APP → otra interacción → recuperar historial tras salir/reabrir y reiniciar → renombrar y conservar nombre → buscar → comprobar fechas → cerrar desde operador → listado cerrado/historial legible/envío bloqueado. Crear una sesión nueva posterior se probará sólo con el recorrido acordado, conservando el chat cerrado.

LidIA: una selección de opción válida deberá persistir su etiqueta visible para el cliente y conservar el identificador interno para lógica/modelo. Se verificará después de recuperar el historial; las acciones obsoletas/caducadas seguirán rechazadas. No se remapeará texto libre suponiendo que es un identificador.

Las pruebas de la app incluirán navegación y área segura, teclado/compositor, micrófono/aviso, atrás nativo, perfil, historial, pérdida de conexión/recuperación sin duplicados y estados/permisos. Borrado de cuenta o efectos externos requieren un entorno/test descartable concreto; no se eliminará la cuenta principal ni se contratará/pagará durante este ciclo. Se distinguirán verificaciones simuladas, conectadas y pendientes.

Se guardarán versión/SHA del paquete y runtime, identidad del emulador, conversación/operaciones/transiciones, capturas sin secretos y resultado por plataforma. Las pruebas previas deterministas y la prueba real «Hola» permanecen como evidencia separada.
