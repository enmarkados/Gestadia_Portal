# Preparación Portal para validar APP contra LidIA PRO — 07/10/2026

## Ámbito acordado y estado

LidIA y Portal han acordado `gestadia-app-pro-local-validation` como integrationId y audiencia, origen `https://lidia.gestadia.com` y entorno fuente `pro`. El consumidor continúa siendo local, con cuenta y base ficticias separadas del fixture aceptado. La primera autoridad tendrá únicamente `sondeo` y `history`, sin expediente ni asignaciones. LidIA propone validez inicial acotada de 24 h con retirada posterior; el instante efectivo se entregará con la configuración fuente, sin renovar autorizaciones del fixture.

Esta preparación sucede a la [adenda del clon y recuperación](2026-10-07-adenda-agente-app-y-transicion.md). **No se ha arrancado el backend/frontend nuevo, entregado un grant, iniciado una sesión fuente ni enviado un turno al proveedor.**

## Preparación realizada

Directorio privado propio `/private/tmp/gestadia-portal-real-app-20261007`, 0700 y ficheros 0600. Se ha creado MySQL8 temporal `gestadia-portal-real-app-20261007`, publicado exclusivamente en 127.0.0.1:59895 con base `gestadia_app_real_test`, y aplicado el esquema Prisma vigente. Cuenta ficticia nueva `1cf42992-e1cd-4d3b-b723-f4ad5e301f39`; la identidad se provisiona como fixture, no acredita entrega de correo/invitación a un cliente. No se han copiado datos ni referencias del circuito anterior.

Tras el seed: grants, sesiones de dispositivo, conversaciones y operaciones=0. Puertos 3002/5175 comprobados libres para los procesos nuevos. [Evidencia de preparación sin secretos](evidencia/2026-10-07/preparacion-portal-pro.json).

Los lanzadores privados reutilizan el código del worktree de integración. Bloquean rutas fuera de `/api/app/v1/` y `/api/health` en el backend nuevo; desactivan Stripe, Zoho, SMTP, integración LidIA de checkout, PluginWeb y atención general/comercial. Conservan validación TLS. El arranque exige seis claves por rol, origen/audiencia/integración exactos, validez entre 15 minutos y 24 h y confirmación previa del runtime efectivo. Se ha comprobado su sintaxis; no su funcionamiento conectado.

## Contraste de la fuente atribuido a LidIA

LidIA ha comunicado lectura directa de la BBDD: agente 119, nombre LidIA Canje v4, proyecto 102, instrucción 10115, modelo `claude-haiku-4-5`, activo, timeout habilitado, agente Base, AutomationProgram 2, AutoIncludeGlobalTools 0 e IntegrationConnection 4. Coincide con la configuración UI leída por Portal salvo la conexión que la tarjeta no exponía. Por tanto la etiqueta «Sin conexiones» de la tarjeta no acredita aislamiento.

LidIA informa copias del SQL PRO (1286578318 bytes, 188 tablas), código servido 14c1f17858df60e79807dd05d862d1794cbd9fbc, configuración y etiqueta de rollback de imagen. La creación/huellas de esas copias corresponden a LidIA; Portal no afirma haber restaurado la BBDD PRO. La recuperación comprobada por Portal cubre su fixture local.

## Dependencias antes de conectar

1. LidIA acredita clon/proyecto/instrucción propios, modelo real, política APP y configuración desplegada efectiva; confirma IDs, versión/hash de instrucción y commit/imagen servidos.
2. Entrega privada de claves en `s2s-portal-private.json` bajo el directorio Portal, con baseUrl, integrationId, audience, validUntil y keys de SESSION/READ/TURN/HANDOFF/CONTEXT/REVOCATION; sin secretos en repositorio ni mensajes.
3. Portal valida el destino y horizonte, registra autoridad mínima en la base nueva y arranca procesos separados. No interpreta un fichero o salud 200 como prueba del aislamiento fuente.
4. Playground del clon, después turno APP con recibo/respuesta real y recuperación de historial. Atención humana necesita mapeos nuevos y su comprobación posterior; no hereda los ficticios anteriores.

[Glosario](../../GLOSARIO.md). El fixture 5174/3001 y el Portal 5173 continúan disponibles; producción Portal permanece fuera de este arranque.
