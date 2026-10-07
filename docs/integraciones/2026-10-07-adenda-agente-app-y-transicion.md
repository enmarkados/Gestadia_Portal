# Adenda: agente APP basado en 119 y transición recuperable — 07/10/2026

## Cambio de alcance autorizado

El usuario ha autorizado en el chat «Actualizar rama dev/IA/main» clonar 119 o crear un agente dedicado basado en él, incorporar la vía APP y redesplegar LidIA después de respaldar código y base de datos. Exige comprobar el clon en Playground. Estas instrucciones humanas se han leído directamente; sustituyen el requisito literal 119 de la [preparación anterior](2026-10-07-preparacion-agente-119-real.md), que permanece como documento histórico.

Objetivo: una conversación desde la APP con el agente dedicado y el proveedor real. La prueba previa con agente 902/modelo determinista continúa como evidencia distinta. Esta adenda prepara la transición; no acredita un clon creado, un despliegue ni una conversación real completada. El Portal de producción no se redespliega por separado.

## Configuración contrastada en el panel

Lectura autenticada de `https://lidia.gestadia.com/admin/agents`: entorno PRO, base `lidia_gestadia_pro_db`, versión visible `V1.705-usuarios-departamentos-ui`. La tarjeta exacta «LidIA Canje v4» muestra agente Base activo, proyecto GestadIA v2 (valor del selector 102), instrucción «Cualificación NIE y residencia - AGENTES_MARIO» versión1.8-mario-adaptado (valor 10115), modelo explícito `claude-haiku-4-5` y seguimiento «CANJE 1:1 - SEGUIMIENTO ZOHO 30 MIN» de 1800 s. Son valores de configuración, todavía no evidencia de ejecución del proveedor. El ID 119 no está expuesto en el formulario ni en la lista leídos; LidIA deberá acreditarlo contra la fuente.

La exportación ofreció seleccionar identidad Woztell; se canceló sin escoger endpoint, descargar bundle ni guardar cambios. Playground muestra 12 herramientas al seleccionar este agente sin iniciar sesión; esta lectura refuerza que el original no es un destino APP aislado.

La política del código APP revisado rechaza proyecto con `WoztellChannelId`, `ChannelId` o `IntegrationConnectionId`; también agente con conexión, timeout, flujo, automatización o inclusión de herramientas globales. Exige instrucción activa del mismo proyecto y propietario coherente. Un proyecto APP separado necesita su propia copia de la instrucción; mover sólo el agente no satisface esa política. El runner resuelve el backend por `ModelOverride`, fuerza únicamente `emit_app_turn` y exige autoridad vigente antes del proveedor. Configuración efectiva y compatibilidad de Anthropic se probarán en el runtime desplegado.

## Responsabilidades y puertas de ejecución

| Paso | Responsable | Evidencia necesaria |
|---|---|---|
| Respaldo del LidIA servido | LidIA | Código exacto, imagen recuperable y configuración efectiva; dump BBDD verificable, ubicación privada, hashes y procedimiento de recuperación antes de mutar/clonar/desplegar. |
| Clon dedicado | LidIA | IDs reales de proyecto/agente/instrucción, contenido y versión derivados de119, modelo explícito, retiro de conexiones/timeout/automatizaciones/global tools, aislamiento efectivo. |
| Publicación APP fuente | LidIA | Cambio revisado, imagen/commit servido y migraciones compatibles; origen HTTPS, audience, integrationId, permisos, validez y claves por rol mediante canal privado. |
| Consumidor de prueba | Portal | Código respaldado, base/cuenta/sesiones/asociaciones distintas del fixture, autoridad mínima y configuración hacia ese origen. |
| Playground y APP | Ambos | Playground del clon primero; después turno real desde la APP, recibo y respuesta correlacionados, historial/acciones/retirada de autoridad comprobados. |
| Recuperación | Cada propietario | Detener admisión y workers del circuito nuevo, conservar operaciones y evidencias; restaurar únicamente los componentes afectados bajo coordinación. |

Una copia anunciada por panel es evidencia de creación, no por sí sola una prueba de restauración. El respaldo de una base PRO activa tampoco autoriza sobrescribirla automáticamente con datos anteriores: LidIA debe considerar las escrituras posteriores y acordar la recuperación mínima antes de ejecutar una restauración destructiva.

## Contribución Portal: respaldo realizado

Código Portal limpio `6dce8847da152476ef6314218fdb1d64984f5ba5` guardado en Git bundle; configuración local y base del fixture guardadas en `/private/tmp/gestadia-portal-pre-real-app-20261007T123640Z`, directorio 0700 y ficheros 0600. Contiene secretos de prueba: permanece fuera del repositorio y no se envía al chat.

| Artefacto | Bytes | SHA256 |
|---|---:|---|
| portal-code.bundle | 34351726 | 2b52276fdfb09a9a23f3977e6bd430af315e2e6686ec8bab1d4eace396097474 |
| portal-fixture.sql | 67058 | 21171c8f993503e61170ece68d73a0b834b734c5a5780643668b23fee06f7ead |
| portal-local-private.tar.gz | 21696 | b7b43b391b911e71b1ce1f8e9b9f2660f17978912c1d42fc4be57ff36373744f |

Comprobación de recuperación a las 12:39:21UTC: clon del bundle al mismo HEAD, restauración MySQL8 en contenedor temporal propio con `network none`, correspondencia de las 12 tablas y `CHECK TABLE` correcto. El contenedor se detuvo al terminar. No se restauró sobre el fixture vivo. Este respaldo cubre únicamente Portal local, no producción Portal ni la BBDD LidIA. [Manifiesto sin secretos y resultado de recuperación](evidencia/2026-10-07/backup-portal-pre-app-real.json).

## Checklist del consumidor antes del primer turno

- [x] Confirmar compatibilidad de origen HTTPS raíz y prefijo `/api/integrations/lidia/app/v1` en el consumidor existente.
- [x] Respaldar código, configuración privada y BBDD del fixture Portal; probar su recuperación sin modificar el circuito aceptado.
- [ ] Recibir IDs y aislamiento efectivos del clon, commit/imagen y migraciones de LidIA, origen, audience, integrationId y horizonte válido.
- [ ] Preparar base local nueva y cuenta de prueba ficticia separada. `AppConversation` y `AppOperation` incluyen integrationId, pero `AppConversationAccess` se identifica sólo por usuario/scope: cambiar sólo integrationId no separa autoridad. No copiar grants, sesiones, remoteIds, cursores, operaciones ni referencias ficticias del fixture.
- [ ] Entregar un grant de sondeo general con `sondeo` y `history`, sin expediente ni asignaciones comercial/gestor, validación y vencimiento explícitos. Atención general/comercial y efectos externos permanecen fuera de este primer turno.
- [ ] Configurar `APP_LIDIA_BASE_URL`, `APP_LIDIA_INTEGRATION_ID`, `APP_LIDIA_AUDIENCE`, seis roles SESSION/READ/TURN/HANDOFF/CONTEXT/REVOCATION y material secreto privado. Mantener validación TLS; no usar variables que anulen certificados ni entregar claves al móvil.
- [ ] Arrancar procesos de prueba separados; acreditar origen de código, flags efectivos, base y cero operaciones previas. Conservar puertos/procesos del fixture. El helper `app-local-preflight` sólo conoce el fixture y no acredita PRO.
- [ ] Comprobar rechazo con firma/rol/audiencia inválidos antes del proveedor; vencimiento/revocación no deben conceder acceso. Las claves disponibles no equivalen a permisos de atención habilitados.

## Aceptación y recuperación

Playground debe demostrar conversación del clon con el modelo real, paso a paso y con efectos externos bloqueados, sin vincular contactos CRM ni ejecutar herramientas externas. No demuestra por sí solo el canal APP: después hay que iniciar desde la APP una sesión nueva en el namespace acordado y observar en fuente proyecto/agente/instrucción/modelo, canal APP y respuesta real asociada al recibo.

La prueba APP envía texto ficticio y recorre una opción estructurada. La respuesta debe conservarse al recargar y las opciones anteriores retirarse sin reenvío. Correlacionar IDs técnicos y revisiones con el recibo; registrar el proveedor efectivo y comprobar ausencia de Woztell, Zoho, pagos y correo en este circuito. Una respuesta de salud 200, el nombre del agente o un mensaje de apertura no bastan.

Ante fallo: detener nuevas admisiones del circuito nuevo y su worker; conservar requests, hashes, idempotency keys y estados de resultado incierto en la base privada. No reenviar operaciones antiguas al fixture ni borrar la cola para darla por limpia. Deshabilitar la integración nueva en fuente cuando proceda y volver al circuito local aceptado con su configuración intacta. LidIA controla la recuperación de su código/configuración y, si hace falta, BBDD, preservando tráfico ajeno. Registrar una nueva acta con los resultados reales, sin alterar esta adenda ni las pruebas históricas.

[Glosario](../../GLOSARIO.md), [cierre local aceptado](2026-10-07-cierre-visual-conversaciones.md).
