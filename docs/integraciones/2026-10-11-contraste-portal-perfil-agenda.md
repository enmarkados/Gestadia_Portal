# Contraste Portal: perfil firmado y agenda APP

**Fecha:** 11/10/2026. **Estado:** conformidad de arquitectura y reparto; precisiones del contrato ejecutable pendientes. Revisión documental, sin cambios de permisos, conexiones, base de datos o runtime. Base Portal revisada: `5b0f94f2625d7422aa3930de473844b3756833f5`.

[Adenda LidIA recibida íntegra](2026-10-11-adenda-perfil-agenda-lidia-recibida.md) · [Glosario](../../GLOSARIO.md) · [Evidencia del chat antiguo y TestFlight (10)](../app/evidencias/2026-10-11-gestor-carga/README.md).

## Procedencia

La copia conserva los bytes del documento `docs/integraciones/2026-10-11-app-contexto-perfil-y-agenda.md` del worktree LidIA `gestadia-app-conversacional`. SHA256: `4f65cfda774acf7698cf4199b7ed8d9c818bd8ebd9c797573d4be8db19a5ff90`. Los enlaces relativos de esa copia pertenecen al repositorio fuente. No acredita código integrado, configuración efectiva ni una llamada real.

## Datos que puede aportar hoy Portal

| Dato | Evidencia en código actual | Alcance de la atestación |
| --- | --- | --- |
| Nombre | `User.nombre` y `User.apellidos`, `backend/prisma/schema.prisma` | Dato conservado en una cuenta autenticada y comprobada; no identidad civil verificada ni nombre confirmado expresamente para la llamada. Construir display_name con recorte y límite, sin inventar ausencias. |
| Email | `User.email`, `emailVerified`, `accountVerifiedAt`, `accountVerificationMethod` | Dirección del perfil; la verificación depende de su evidencia propia. accountVerifiedAt no equivale por sí solo a emailVerified. No usar coincidencia de email como propiedad CRM. |
| Teléfono | `User.telefono` opcional | Dato declarado. No consta verificación de control del número. El helper callbackPhone valida formato pero añade +34 a números nacionales: no aplicar esa suposición a un perfil internacional sin país confirmado. |
| Zona y confirmación | No hay campos de zona/confirmación en User | Omitirlos; el agente recoge y confirma la zona. La zona del dispositivo, el idioma o Europe/Madrid operativa no prueban zona cliente confirmada. |
| Consentimiento de llamada | No hay campo específico en User; callback explícito conserva nombre/teléfono en AppCallbackRequest | No convertir aceptación de privacidad, emailVerified o una solicitud anterior en consentimiento vigente del chat. El agente lo recoge para teléfono, zona y propósito actuales. |
| Vínculo CRM | `User.zohoContactId`; assignedManager comprueba Deals.Contact_Name.id y Owner | Son referencias existentes, no un mapping universal. verifiedContact comprueba existencia del ID remoto; no acredita por sí solo namespace/entorno/propietario. No conceder crm_prepare ni callback_schedule con ese único dato. |

Portal atesta procedencia del perfil autenticado y mantiene permisos/asignaciones en servidor. El agente conserva el sondeo, confirma los datos operativos y solicita los ausentes. No se añade un segundo cuestionario en la APP.

## Precisiones para cerrar el wire

1. **Nulos y ausencia:** sustituir «valor textual null» por JSON `null`, nunca cadena `"null"`. Especificar para cada campo si admite null; ausencia conserva, null retira, false revoca confirmación/consentimiento. Definir qué invalida una retirada de teléfono/zona. Un objeto profile vacío no borra todo.
2. **Precedencia y revisión:** aplicar una sola vez por context_revision impide reimponer en cada turno, pero no resuelve un snapshot antiguo reenviado en una revisión nueva por cambio de permisos. Mantener origen/revisión del perfil o una regla explícita que preserve el dato confirmado por el agente; sólo una modificación acreditada de perfil lo sustituye y vuelve a pedir consentimiento. Incluir ese caso en vectores.
3. **Esquemas exactos:** v1/v2 actuales tienen additionalProperties=false y enum/maxItems de seis permisos. Hoy rechazan profile y los permisos nuevos. Entregar JSON Schema completo y vectores válidos/inválidos, con nuevos límites y ACK/effective_permissions coherentes; no basta aceptar una propiedad en el DTO LidIA. Mantener consumidores antiguos con extensión omitida.
4. **Contexto durable:** queueContext actualmente calcula la huella sobre currentAccess. El futuro perfil debe participar en la huella y en el DTO persistido antes de firmar; cualquier retry conserva cuerpo y clave originales. En v2, actualizar sólo autoridad de cuenta y la misma conversación/sujeto, nunca reiniciar ChatSession.
5. **Consentimiento:** señalar finalidad y vínculo al teléfono/zona que se confirman. Si el consentimiento se recoge en el agente, Portal no debe reintroducir un false antiguo por otra revisión; una retirada explícita sí prevalece. Revalidación inmediatamente antes de efectos y recibo remoto, también para edición de llamada existente.
6. **Permisos y ownership CRM:** opt-in con intersección en ambas integraciones, sin defaults para cuentas o propósitos y guest rechazado. No usar el adaptador actual findOrCreateLead como prueba de cumplimiento: busca por teléfono y admite un único match, pero esa coincidencia no acredita propietario. Necesita mapping de conexión/entorno/módulo y correlación única respaldada por Zoho antes de habilitar esta agenda.
7. **Migración del chat antiguo:** context_revision puede actualizar la sesión existente; history exclusivo conserva sólo lectura. Un perfil o el propósito atencion no concede envío ni gestor. El caso diagnosticado sigue pendiente de asignación autorizada; no convertirlo en sondeo para evitar capability_denied.

## Orden de trabajo y aceptación

1. LidIA devuelve esquema/vectores y regla de precedencia/nulos cerrados; Portal contrasta bytes, validación y compatibilidad v1/v2.
2. Portal prepara perfil server-side opcional, omitido por defecto, sin consentimiento/zona inventados y sin permisos CRM nuevos. Verificar cambio de perfil frente a cambio sólo de permisos y retry con body idéntico.
3. Acreditar configuración concreta de Zoho y vínculo de registros existentes; preparar pruebas de acceso cruzado, guest, teléfono coincidente sin propiedad, revocación, edición e interrupción remota.
4. Copia y restauración comprobadas antes de cualquier despliegue; verificar SHA/configuración efectiva, misma sesión/historial y recibo de una llamada autorizada. No anunciar cita por disponibilidad o HTTP aceptado.

La APP publicada en Docker `5febdf2` y TestFlight (10) conservan el trabajo de interfaz ya entregado. Esta revisión no requiere otra build móvil ni activa agenda; aceptación física del GIF y teclado de (10) pendiente de la respuesta del usuario.

## Conformidad posterior: revisión independiente de perfil

Respuesta LidIA recibida el 11/10: propone `profile_revision` decimal monotónica independiente de `context_revision`, requerida cuando se incluye `profile`. Portal da conformidad documental: resuelve los puntos 1, 2 y 5 anteriores con las reglas siguientes. No se modifica la copia histórica recibida.

- Ausencia de campo conserva. JSON `null` retira campos textuales; no es la cadena `"null"`. Booleanos no admiten null; false retira confirmación/consentimiento sólo cuando se aplica una revisión de perfil nueva.
- Misma profile_revision exige mismo perfil canónico, sin reaplicar ni borrar datos obtenidos después por el agente. Cambiar sólo permisos aumenta context_revision y conserva profile_revision/cuerpo de perfil. Un cambio acreditado o retirada explícita de perfil aumenta su revisión.
- Cambiar o retirar teléfono/zona invalida consentimiento anterior; cambiar o retirar zona invalida confirmación. Una afirmación nueva en el mismo perfil sólo conserva su eficacia si reúne los datos requeridos por el contrato. Guest rechaza profile y profile_revision.
- La futura persistencia Portal conserva perfil, revisión y huella antes de firmar. Un retry de una operación conserva bytes, revisión y clave; no vuelve a construir el perfil desde User al entregar un reintento. La semántica es por conversación y sujeto verificado, sin modificar ChatSession ni aumentar permisos.

**Detalles que deben quedar en esquema y vectores antes de integrar:** representación decimal sin ceros iniciales y límite compatible con context_revision; profile_revision sin profile rechazado; revisión inferior rechazada como conflicto; revisión igual con distinto canonical rechazada como conflicto. Definir código wire exacto y ACK vigente, incluyendo qué se informa cuando profile está ausente y al vincular guest a account. La comparación no debe cruzar cuentas ni conversaciones. Una revisión posterior que cambia sólo email/nombre no debe reintroducir teléfono/consentimiento anteriores recogidos por el agente: incluir precedencia por campo o construcción de cambios acreditados en los vectores.

LidIA prepara esquemas completos v1/v2/ACK con ocho permisos y vectores. Portal conserva la extensión apagada por defecto y no concede grants CRM. La corrección de lectura administrativa estándar de ChatSession/App comunicada por LidIA queda atribuida al equipo fuente, sin afirmar nueva validación remota desde Portal.

## Precisión acordada del parche y ACK

LidIA concreta y Portal confirma documentalmente el wire: profile_revision decimal positivo sin ceros iniciales, entre 1 y 20 dígitos, ámbito sujeto+conversation_id; profile y profile_revision presentes juntos o ambos ausentes. Una revisión inferior devuelve HTTP409 stale_profile; igual con parche canónico distinto devuelve HTTP409 profile_conflict; igual e idéntica no reaplica. La comparación de revisión es numérica decimal, no lexicográfica.

Una revisión nueva es un parche de campos acreditadamente cambiados; nunca arrastra teléfono o false anteriores si sólo cambia nombre/email. Ausencia conserva, JSON null retira texto y false retira booleano. El parche canónico persistido de esa revisión es la referencia de igualdad/retry, distinto del perfil efectivo acumulado. El cambio de permisos conserva revisión y último parche, sin aplicar de nuevo sus campos. Portal deberá guardar de forma durable los parches pendientes por conversación: no compactarlos ni reconstruirlos desde User al entregar operaciones aceptadas.

LidIA propone aplicar cada parche transaccionalmente al AgentState común al aceptar el contexto, también si llegan varios sin turno intermedio. La prueba deberá comprobar aceptación/replay concurrentes, rollback sin aplicación parcial y dos parches consecutivos de campos distintos. Esta semántica está acordada; su implementación no se atribuye todavía como observada por Portal.

ACK incluye profile_revision sólo cuando la petición lo llevaba y current_profile_revision si existe; ambos omitidos cuando no aplican. En replay profile_revision identifica la petición original y current_profile_revision el estado vigente, sin restituir perfil antiguo. Guest no tiene perfil: después de binding confirmado, el primer perfil requiere contexto de cuenta comprobada sobre la misma ChatSession. Debe incluirse el vector de cambio sólo email que preserve teléfono y consentimiento obtenidos por119, más incompatibilidad guest y límites de revisión.

Los detalles pendientes anteriores de precedencia/parche, códigos y ACK quedan resueltos documentalmente por esta precisión. Esquemas y vectores ejecutables compartidos siguen pendientes de entrega y contraste. Ningún grant, conexión, despliegue o build móvil cambia por este acuerdo.

## Preparación Portal y cierre de contraste

[Segunda revisión LidIA recibida íntegra](2026-10-11-adenda-perfil-agenda-lidia-r2-recibida.md), SHA256 `b82ea59eb054d28afe48659a15a840a770ae6791783f7cabbbd8eae6d324a383`. Los enlaces relativos de la copia pertenecen al repositorio fuente. [Pruebas y huellas](../app/evidencias/2026-10-11-perfil-contexto/README.md). Esquemas runtime v1/v2 y ACK iguales a los artefactos recibidos; cinco vectores nuevos de firma comprobados.

Implementado en esta rama, desactivado por defecto: builder v1 limitado a perfil Portal, revisión/parche/base durables, migración aditiva preparada y gates que rechazan permisos CRM. La precisión de entrega acordada con LidIA admite como máximo una revisión de perfil no confirmada por conversación: queueContext difiere el siguiente diff sin avanzar la base; una retirada de permisos adelanta el mismo parche/revisión. Así se preserva el parche sin bloquear retirada. Después de ACK se prepara el cambio de User pendiente; no necesita un turno del modelo.

302 pruebas backend, 204 frontend y build APP correctos en base efímera; revisión independiente sin hallazgos pendientes tras corregir el P1 de retirada bloqueada. Los contratos v2 están preparados, pero el consumidor de contexto account v2 no se implementa en este cambio. Sin despliegue ni migración productiva; sin activación de perfil, CRM o agenda.
