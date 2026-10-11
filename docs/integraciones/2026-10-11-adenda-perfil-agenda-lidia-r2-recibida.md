# Adenda de contexto APP: perfil y petición de llamada

Fecha: 11/10/2026. Compatible con el contexto firmado 1.0 y 2.0 existente. Estado: implementación en revisión y pruebas offline; conformidad documental de Portal recibida; pendientes contraste de esquemas y configuración efectiva Portal/Zoho. No acredita una llamada real ni habilita conexiones por sí sola.

## Reparto

Portal autentica la cuenta y atesta perfil, permisos y asignaciones. LidIA ejecuta al agente asignado en servidor, conserva una ChatSession y su estado común, y publica su respuesta en el timeline APP. El responsable Zoho y Portal mantienen los flujos de cuenta y trámites hacia Gestadia. Atención APP agrupa las sesiones; la apertura administrativa desde Sesiones usa el detalle común, con autorización propia.

## Contexto opcional de una cuenta

Se añade `profile` al DTO cerrado de POST `/sessions/{conversationId}/context`, dentro del cuerpo firmado; no se altera canonicalización, digest, nonce ni idempotencia. El objeto es opcional y admite únicamente los campos siguientes. Cada actualización mantiene `context_revision` monotónica y los demás campos obligatorios del contrato.

```json
{
  "profile_revision": "1",
  "profile": {
    "display_name": "Nombre confirmado",
    "email": "cuenta@example.test",
    "callback_phone": "+34600111222",
    "time_zone": "Europe/Madrid",
    "time_zone_confirmed": true,
    "callback_consent": true
  }
}
```

| Campo | Validación y significado |
| --- | --- |
| display_name | Texto de hasta 160 caracteres, confirmado por Portal. |
| email | Dirección de hasta 254 caracteres; dato de perfil, sin autenticación ni búsqueda CRM automática. |
| callback_phone | Teléfono E.164, con + y 7–15 dígitos. Su declaración autoriza correlación contextual para la llamada, nunca acceso a una ficha CRM. |
| time_zone | Identificador IANA real (o UTC), hasta 64 caracteres. La zona del dispositivo necesita confirmación antes de acordar una hora. |
| time_zone_confirmed | Booleano; true requiere zona válida en el mismo perfil. |
| callback_consent | Booleano atestado para el propósito de llamada. No concede permisos CRM ni sustituye las autorizaciones de cuenta. |

Los campos textuales admiten JSON `null`, nunca se interpreta la cadena `"null"` como retirada. Los booleanos admiten únicamente true/false: ausencia conserva, false retira confirmación o consentimiento y null es inválido. Un profile vacío con revisión válida no borra todo. Cambiar/retirar teléfono o zona invalida el consentimiento anterior salvo una afirmación nueva en ese parche; cambiar/retirar zona invalida su confirmación anterior.

`profile_revision` es decimal positivo sin ceros iniciales de 1–20 dígitos, independiente de context_revision y limitado al sujeto y conversación. profile y profile_revision se envían juntos o se omiten juntos. Una revisión inferior devuelve 409 stale_profile; la misma revisión con parche canonical diferente devuelve 409 profile_conflict. Misma revisión y mismo parche no reaplican datos sobre lo recogido por el agente. La revisión se compara como decimal, no lexicográficamente. Los consumidores anteriores siguen funcionando con la extensión omitida.

Una revisión nueva contiene sólo los campos acreditadamente cambiados o retirados. Portal no envía el snapshot antiguo completo cuando sólo cambia email/nombre: omite teléfono, zona o consentimiento que no haya modificado. El parche se aplica al AgentState común en la misma transacción que el contexto; dos parches consecutivos sin turno conservan ambos cambios y un rollback no deja estado parcial. Un cambio sólo de permisos conserva el último parche/revisión y no lo reaplica. Después de retirar estado privado, un replay de la misma revisión tampoco lo reconstruye.

El ACK conserva profile_revision si se envió y current_profile_revision vigente si existe; ambas propiedades se omiten cuando nunca hubo perfil. Un replay conserva la operación original y devuelve la revisión vigente aunque haya avanzado. Guest v2 no admite perfil ni permisos CRM; tras binding guest→account el primer perfil llega sólo desde una atestación de cuenta, con la misma ChatSession. La información actual de Portal no acredita zona/consentimiento, por lo que esos campos se omiten y el119 los recoge.

El cuerpo perfil/revisión participa en la huella durable de queueContext y su firma. Los reintentos conservan cuerpo y clave idempotente originales, incluida la rotación de credenciales. Los esquemas cerrados y los ACK admiten los ocho permisos definidos, sin concederlos por defecto.

Esquemas y vectores: [contexto y ACK v1](fixtures/app-context-v1-1.schema.json), [DTO v2](fixtures/app-v2-schema.json), [ACK v2](fixtures/app-v2-responses.schema.json), [vectores v1 de firma y semántica](fixtures/app-context-v1-1-vectors.json), [vectores v2](fixtures/app-v2-vectors.json). Las validaciones dinámicas (IANA existente, propiedad CRM, revisión y autorización vigente) corresponden al servidor y no se acreditan sólo con JSON Schema.

## Permisos y configuración de servidor

Se añaden dos permisos de contexto, optativos y sujetos a la intersección con la configuración de integración:

- `crm_prepare`: permite preparar el vínculo CRM de una cuenta para las herramientas operativas asignadas.
- `callback_schedule`: permite la petición de llamada, además del anterior, del consentimiento y de la zona confirmada.

No se conceden por crear una conversación ni por elegir propósito desde el móvil. La ausencia de permisos mantiene el sondeo y el historial autorizados. Cada herramienta vuelve a comprobar cuenta, revisión, integración, conexión y operación vigente, después de los hooks y antes de efectos.

La integración configura la conexión CRM exacta, su entorno real y, para crear un Lead, un campo único y buscable de owner con unicidad acreditada por el responsable Zoho. La clave de correlación incorpora namespace, proyecto, entorno y cuenta. Una referencia CRM acreditada debe conservar módulo e ID exactos. No se permite primera conexión global, selección por móvil/modelo, ni apropiación del primer registro por teléfono. El routing físico del token debe corresponder al entorno de conexión; la agenda heredada requiere Production explícito mientras use el dominio productivo.

Si falta el mapping acreditado o hay un candidato CRM sin vínculo de propietario, el backend devuelve un motivo concreto para resolver la asociación. Un fallo de búsqueda no autoriza un alta. La creación dispone de ledger durable y reconciliación; una interrupción tras cruzar un efecto remoto conserva outcome_unknown y no vuelve a ejecutar el turno automáticamente.

## Comportamiento del agente y hora

El agente119 conserva sus reglas. El canal aporta datos reales o ausentes, fecha actual del cliente cuando su zona está confirmada, zona operativa Europe/Madrid y permisos efectivos. Nombre, teléfono, consentimiento y zona faltantes se recogen por herramientas comunes; el canal no presupone WhatsApp. Una solicitud de fecha/hora se interpreta en la zona cliente confirmada y se normaliza a la agenda operativa, rechazando horas inexistentes o ambiguas por cambios estacionales.

Preparar horario/estado no confirma una llamada. Sólo se anuncia una llamada creada o modificada cuando el adaptador dispone de ID remoto y lectura de verificación. APP no envía por Woztell; el guard de checkout WhatsApp conserva su exigencia de WhatsApp real.

## Dependencias y aceptación

LidIA entrega código, pruebas de sesiones/estado/herramientas y protección de efectos. Portal confirma esta extensión opcional y aporta perfil/permisos validados sin duplicar el sondeo. El responsable Zoho confirma entorno, dominio, campo único de owner y resolución de registros ya existentes. La matriz conectada y una llamada real se acreditarán separadamente después de copias, despliegue y configuración comprobada. Referencias: [diagnóstico](2026-10-11-app-canal-nativo-agenda-identidad-y-zona-horaria.md), [plan](../superpowers/plans/2026-10-11-app-canal-nativo-implementacion.md), [glosario](../../GLOSARIO.md).
