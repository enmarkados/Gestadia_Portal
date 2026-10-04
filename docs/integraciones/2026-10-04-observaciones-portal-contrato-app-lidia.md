# Revisión Portal de la propuesta APP ↔ LidIA

Fecha: 04/10/2026. Estado: **dictamen técnico favorable sobre la arquitectura,
con observaciones pendientes de acuerdo; no es aprobación del contrato ni de
implementación, despliegue o activación**.

La propuesta respeta el recorrido solicitado: cuenta Portal, sondeo gratuito
en LidIA, atención humana en la plataforma y gestión de expedientes habilitados
por pago o por trato comprobado como Cerrado ganado. Recomendamos avanzar hacia
un contrato conjunto después de cerrar O1–O8. La cuenta gratuita verificada y
el agente operativo dedicado siguen siendo propuestas de diseño.

## 1. Documento recibido y procedencia

- [Respuesta original de LidIA](2026-10-04-respuesta-contrato-app-lidia.md),
  importada sin modificar sus 35.086 bytes desde
  `/Users/gonchumon/.codex/worktrees/1e4f/Gestadia_LidIA/docs/integraciones/2026-10-04-respuesta-contrato-app-lidia.md`.
- SHA-256 del original y de la copia:
  `a255ecb17074c9f33271ad687db00057a7a280745721c62ff1768af28ef93605`.
- Base LidIA declarada en la respuesta y HEAD del worktree al importar:
  `15828edb011bfb2ef17d34f564cf23dfa6e0f107`.
- Base Portal contrastada: `app/main`,
  `399ca21aae9effea6f5991a4ea7340217bd54f83`;
  [preparación del 03/10](2026-10-03-app-lidia-backend-preparacion.md).
- Nomenclatura de esta revisión: [GLOSARIO.md](../../GLOSARIO.md).

Los enlaces relativos de la respuesta importada conservan su significado en
**Gestadia_LidIA**. Su enlace a `../../GLOSARIO.md` designa el glosario LidIA,
aunque desde la copia podría abrir el de Portal; los enlaces a `LidIA.ChatAgent/`
y `DOCUMENTACION/` tampoco son fuentes Portal. Para consultar esas referencias
en el checkout de origen, usar respectivamente
`/Users/gonchumon/.codex/worktrees/1e4f/Gestadia_LidIA/GLOSARIO.md` y los archivos
bajo esa misma raíz. Se preserva el documento recibido en lugar de reinterpretar
sus enlaces o sustituir su evidencia.

## 2. Conformidad técnica de base

| Propuesta LidIA | Valoración Portal |
|---|---|
| App → API Portal → S2S LidIA | Conforme: Portal autentica la cuenta y autoriza sus recursos; el móvil no recibe claves LidIA ni elige proyecto/agente |
| HMAC por petición, sin bearer de conversación | Conforme como propuesta: sustituye la credencial scoped opcional del borrador del 03/10; recuperación mediante asociaciones durables |
| Cuenta verificada sin CRM para sondeo | Conforme técnicamente; verificación de email no acredita identidad civil ni pertenencia a expedientes |
| Agente APP dedicado y núcleo de canje compartido | Recomendación favorable; no copiar las conexiones del 119 ni dar por confirmados sus parámetros efectivos |
| Canal y soporte APP independientes de WhatsApp | Conforme: denegación en servidor, también en jobs y callbacks, sin contactos WhatsApp sintéticos |
| Handoff dentro de la misma sesión | Conforme: cola, asignación y toma humana son estados diferentes; cambiar de pestaña no solicita atención ni mezcla historiales |
| Revocación de cuenta separada de vínculo CRM | Conforme: ruta de ciclo de vida adicional necesaria; reintentar o enviar `account_status: active` no reactiva un sujeto revocado |
| Alias `client_key` APP separado del `ClientKey` interno | Conforme: precisa el borrador Portal; según §4 de la respuesta, el interno actual no tiene las propiedades de scope/revocación que requiere APP |
| Adenda APP separada del checkout 1.0 | Conforme: mantener el contrato vigente y su guard, con su excepción Playground controlada |
| Pago y ganado como evidencias diferentes | Conforme: una sola alta de negocio; ganado sin cobro no fabrica referencias, fechas o eventos económicos |

## 3. Observaciones que deben cerrar el contrato

### O1. Representación firmada y rotación

La expresión «SHA-256 hex del cuerpo crudo (vacío en GET)» admite dos
interpretaciones. Proponemos que GET exija cuerpo de longitud cero y firme su
digest SHA-256, es decir
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`;
no una línea de digest vacía. La línea de idempotencia sí permanece vacía en GET.

Cerrar en un anexo los caracteres permitidos en cabeceras y clave idempotente:
sin CR/LF ni controles; ASCII visible acotado en `Idempotency-Key`; nonce hex
de 32 caracteres; timestamp decimal; formatos y límites de key id y sujeto.
Especificar tratamiento de `%20`, `+`, Unicode, escapes y ruta recibida tras
proxy. El cuerpo POST se firma por bytes recibidos, antes de parsear JSON.

Solicitamos vectores positivos y negativos compartidos JS/.NET para GET sin
query, cursor codificado, POST con tildes, digest, cabeceras duplicadas, nonce
repetido, expiración y cambio de key id. Las claves de los vectores serán sólo
de prueba. La identidad de integración debe permanecer estable al rotar:
nonce por key id, **idempotencia por integración**, no por clave de firma.

**Responsables:** LidIA concreta el verificador y anexo; Portal contrasta el
firmador. La firma de callbacks/eventos APP también requiere un dominio y
audiencia explícitos, separados del checkout 1.0.

### O2. Revocación durable y alcance de la sesión

Aceptamos el límite propuesto de ≤60 segundos como objetivo contractual,
pendiente de pruebas. Concretar desde qué instante cuenta, cómo se invalidan
cachés y cómo se observa `revocation_version` entre nodos y workers. El 200 de
la ruta confirma persistencia; debe indicar claramente si la retirada ya es
efectiva en todos los accesos o sigue dentro de ese plazo.

Portal retira la sesión móvil y capacidades de cuenta desde que acepta el
bloqueo, y conserva una salida durable para notificar LidIA. LidIA aplica el
scope acordado en entradas y antes de cada efecto externo. Una petición ya
enviada se reconcilia; no se promete deshacerla. Repetir la revocación debe
seguir autorizado con credencial de ciclo de vida aunque el sujeto esté bloqueado.

Logout de un dispositivo no revoca la cuenta global en LidIA. Borrado/bloqueo
global sí exige revocar sesiones Portal y operaciones APP. Para `crm_link`,
precisar qué lecturas de atención/historial siguen permitidas y cuáles pierden
acceso; conservar sondeo gratuito no debe exponer datos CRM privados.

La ruta no sustituye el procedimiento de borrado/retención. Tampoco se debe
descartar un pago auténtico por haber revocado después la cuenta: Portal
conserva la evidencia económica y restringe su exposición en APP según permisos.

**Responsables:** Portal, sesiones y ciclo de cuenta; LidIA, vínculo y trabajos
APP. El JWT Portal actual de 30 días no cumple por sí solo esta revocación.

### O3. Recibos, recuperación y estado visible

La propuesta admite `turn_id` en GET, pero falta definir su filtro y respuesta:
debe recuperar el recibo de ese turno autorizado aunque no haya mensajes
nuevos, sin descargar todos los recibos históricos. Acordar paginación,
retención y resultado para recibo inexistente o retirado. No confundir una
conversación ajena con un recurso recuperable.

Cerrar el incremento y alcance de `state_revision` cuando cambian soporte,
recibos o resultado del sondeo. Mantener esos cambios visibles con el mismo
cursor de mensajes. Añadir los esquemas completos de presentación/acción y
resultado estructurado del sondeo, con revisión y estados; el texto IA no
determina capacidades ni habilita un expediente.

Precisar la normalización del DTO para su hash idempotente y cómo se conserva
la marca que impide ejecutar un id antiguo después de retirar su recibo. La
retención propuesta de 30 días no puede transformar una repetición en una
operación nueva. Aceptamos `outcome_unknown` con reconciliación y sin repetición
automática de efectos externos.

**Responsables:** LidIA, esquemas, recibos y secuencia; Portal, índice durable,
turno/clave estables y recuperación; App, mostrar estados y reintentar el mismo
turno sin generar otra conversación por dispositivo.

### O4. Correlación de cuenta, expediente y CRM

Proponemos `portal_user_id = User.id` y `case_ref = Expediente.id`. Portal
comprueba siempre la pertenencia; LidIA guarda la referencia autorizada en el
scope de integración/proyecto/entorno y conversa sólo dentro de ese contexto.
`nPedido` es correlación comercial; ninguna referencia aislada es un permiso.

El alias `client_key` necesita relación explícita con sujeto, scope y ficha
comprobada. Su presencia no autoriza todos los tratos de la ficha. Conversión
Lead→Contact mantiene sujeto y conversaciones; conflictos van a resolución
sin unir cuentas por email/teléfono ni trasladar historial WhatsApp.

Acordar quién verifica y comunica el vínculo cuenta↔contacto↔trato y qué hacer
cuando ganado llega antes de que exista esa cuenta o un expediente. Conforme
con inbox pendiente de resolución, sin conceder acceso ni perder el evento.

La regla «un trato → un expediente» necesita confirmación para los servicios
incluidos. Si se acepta, la unicidad tendrá scope de organización/entorno/trato,
con auditoría de datos antes de migrar; si un trato contiene varios servicios,
se debe definir la cardinalidad y clave de negocio antes. Actualmente
`nPedido` es único, pero `zohoDealId` no lo es.

### O5. Pago y ganado: reconciliación compartida

Hay dos límites concretos del código actual que la futura capa debe resolver:

1. `fulfillPayment` sólo procesa expedientes en `pago_pendiente`, y su lectura
   previa y actualización no forman un claim atómico. Un pago que llegue
   después de habilitar el expediente por ganado debe registrarse igualmente,
   sin exigir volver a ese estado ni repetir la bienvenida.
2. `createDealForExpediente` escribe `Stage: Cerrado ganado` y dispara workflows.
   El evento CRM resultante debe añadir evidencia al mismo negocio. Puede
   llegar antes de guardar `zohoDealId`; por eso la correlación verificada del
   pedido/intent y la resolución pendiente son necesarias.

Recomendamos una reconciliación Portal común a ambas entradas: vincular al
negocio verificado, reclamar la operación mediante transacción/restricción,
persistir por separado evidencia económica y comercial y dejar las salidas
durables en la misma transacción local que justifica cada efecto. Los efectos
remotos conservan sus identificadores y reconciliación; no se promete atomicidad
distribuida ni ejecución única del CRM por un ACK HTTP.

El fallback actual puede crear otro trato si falla actualizar el trato LidIA.
No debe heredarse automáticamente en APP: conservar la identidad del trato y
reconciliar un fallo no autoriza a crear otro. Además, cerrar el intent y encolar
`payment.succeeded` son hoy pasos separados; debe cerrarse esa ventana antes
de usar el nuevo contrato APP como garantía de entrega durable.

**Aceptación posterior:** pago→ganado, ganado→pago, concurrencia, duplicados,
caída después de cada persistencia/efecto, ganado sin pago y reapertura. Cada
caso conserva un alta y los efectos que correspondan; ganado sin pago no emite
`payment.succeeded`. Cuenta gratuita ya existente recibe capacidades, sin
crear otra cuenta ni una invitación de acceso innecesaria.

### O6. Productor Zoho, revisión y responsabilidades

El nuevo evento no puede usar el webhook documental actual como si ya fuese
su contrato: ese endpoint exige expediente y fase, y su autenticación depende
de configuración; no implementa inbox ni alta por ganado.

Proponemos que Portal sea responsable del adaptador de entrada CRM y de su
inbox/reconciliación; el responsable operativo CRM confirma workflow, API names,
organización, asignaciones y sandbox; LidIA aporta mapping y contexto verificado.
Si el adaptador emisor se aloja en otro sistema, acordar un único responsable
de su outbox, firma, event id, reintentos y alertas. No dejarlo indistintamente
atribuido a Portal, móvil o LidIA.

`source_revision` sigue sin mecanismo demostrado. Debe acordarse y probarse
su orden por trato, incluidos cambios rápidos y reaperturas. Una secuencia
local de llegada no prueba el orden de cambios en Zoho. Ante cambios sin orden
demostrable, se conserva el evento y se reconcilia mediante lectura autenticada;
no se deducen transiciones históricas de un snapshot posterior ni se inventa
etapa previa. La habilitación exige comprobar etapa vigente, pertenencia y
correlación conforme a la regla de negocio acordada.

Confirmar también ruta receptora, esquema exacto del ACK, dominio/audiencia de
firma y destino de revisión tras agotar reintentos. Una firma inválida nunca
recibe el ACK durable de un evento autorizado. El 202 significa recibido,
no expediente habilitado. Reapertura/cancelación no retira automáticamente un
acceso válido; su efecto requiere regla de negocio explícita.

### O7. Adenda checkout y atención

Cerrar obligatoriedad/nulabilidad de `zoho_contact_id` y `zoho_deal_id`: el
sondeo gratuito no exige CRM; si contratar sí lo exige, determinar quién crea
y verifica esas fichas, en qué momento y con qué permiso. El móvil no satisface
esa dependencia enviando ids declarados. Mantener los importes en catálogo y
el consentimiento ligado a cuenta, conversación y revisión de oferta.

Faltan ruta y DTO completos del callback APP, su firma, ACK durable y dedupe.
Portal acredita el pago y emite desde outbox; LidIA recibe y actualiza sólo la
conversación APP autorizada. Precisar qué queda pendiente de entrega si la
cuenta está revocada o la conversación cerrada, conservando evidencia económica
y sin activar seguimiento WhatsApp por una rama alternativa.

Para atención, CRM confirma el campo comercial, asignación de gestor y mapping
a operador elegible. `Owner` no se asume gestor. Sin asignación comprobada,
mostrar indisponibilidad o soporte general autorizado; `assigned` no afirma
respuesta humana. Mantener un transporte APP para operador y notificaciones.
Adjuntos de chat quedan fuera de este primer contrato hasta cerrar permisos;
los documentos de expediente siguen por la API Portal autorizada.

### O8. Configuración efectiva y aislamiento

Compartimos el límite de evidencia de la respuesta. El agente 119 y los ids
DEV históricos no son lecturas del runtime actual ni agentes APP reservados.
No está acreditado el aislamiento de Gestadia DEV.

Antes de pruebas conectadas: matriz efectiva de runtime/build, bases,
credenciales, agentes/tools, Zoho sandbox, pagos test, correo de prueba,
soporte, jobs y egress. No basta un nombre DEV o un toggle. La comprobación de
119 en PRO debe ser autenticada y de lectura; no implica alterar sus canales.
Empezar las pruebas de contrato con dobles sin destinos externos y, tras el
acuerdo correspondiente, acreditar cero efectos en PRO.

## 4. Reparto propuesto y siguiente cierre documental

| Área | Responsable propuesto | Pendiente conjunto |
|---|---|---|
| Cuenta/sesiones y pertenencia | Portal | Scope, plazos y propagación de revocación con LidIA |
| Motor, timeline, recibos y vínculo APP | LidIA | Anexo S2S, esquemas y recuperación con Portal |
| Interfaz y sesión por dispositivo | App | Consumir permisos/estados Portal; aceptación iOS/Android/web separada |
| Correlación y habilitación de expediente | Portal | Cardinalidad y evidencia de identidad con CRM/LidIA |
| Cobro e inbox/outbox económico | Portal | Adenda y callback APP con LidIA |
| Evento/organización/asignaciones Zoho | CRM + adaptador de propietario acordado | Revisión de origen, firma y mapping; Portal consume y reconcilia |
| Cola/toma humana y canal APP | LidIA | Elegibilidad real con CRM y contexto autorizado Portal |
| Aislamiento de prueba | Cada dueño de su servicio | Matriz efectiva y pruebas de destinos; no delegarlo al equipo móvil |

Solicitamos respuesta a O1–O8 y un documento conjunto que incorpore los cierres.
Después corresponde revisar ese contrato y acordar expresamente el alcance
de implementación. La preparación del 03/10 y la respuesta original se
conservan como documentos fechados; esta revisión no los reescribe.

## 5. Evidencia del Portal consultada

Lectura estática de `399ca21`, descubierta mediante el grafo y contrastada con
los archivos del checkout; no acredita configuración publicada:

- [Auth](../../backend/src/middleware/auth.js), líneas 5–22: JWT de 30 días,
  validación y existencia de usuario; sin sesión revocable por dispositivo.
- [Esquema](../../backend/prisma/schema.prisma), `User` y `Expediente`, líneas
  14–58: identidad UUID, verificación de email, pertenencia, pedido único y
  `zohoDealId` sin unicidad.
- [Checkout](../../backend/src/routes/checkout.js), `fulfillPayment`, líneas
  149–253: guard por estado, fallback de CRM y salida postpago.
- [Zoho](../../backend/src/services/zoho.js), `createDealForExpediente`, líneas
  127–157: ganado tras pago, `N_Pedido`, triggers workflow/blueprint.
- [Webhook actual](../../backend/src/routes/webhooks.js), líneas 66–88:
  actualización de fase de un expediente previo; no alta por ganado.
- [Contrato checkout 1.0](2026-07-28-contrato-lidia-portal-v1-0.md), que conserva
  su alcance vigente; esta entrega no lo modifica.

La entrega sólo añade documentación y referencias. No se ejecutan tests de
producto ni llamadas externas, ni se modifica código, base de datos, entorno
o aplicación instalada. La comprobación documental incluye copia idéntica,
referencias locales de esta revisión y diferencias sin errores de formato.
