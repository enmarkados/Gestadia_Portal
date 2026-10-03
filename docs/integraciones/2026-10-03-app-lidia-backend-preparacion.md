# Gestadia App ↔ Portal ↔ LidIA: preparación del backend

Fecha: 03/10/2026. Base revisada: `app/main`, `e2a6435`.
Estado: investigación y diseño propuesto para revisión; sin implementación,
migraciones ni activación de servicios. La app instalada conserva su modo demo.
Nomenclatura: [glosario del proyecto](../../GLOSARIO.md).

## 1. Objetivo y decisiones del usuario

La app debe permitir comprobar los requisitos del canje mediante el agente
LidIA Canje, atender conversaciones con un comercial o gestor a través de
LidIA y gestionar los trámites del cliente. El usuario propone un canal APP
propio, con su capa de integración, y una API para la app.

El acceso comercial de cliente puede originarse por un pago confirmado o por
un trato de Zoho que pasa a **Cerrado ganado**. Son dos entradas al mismo
recorrido, no dos altas independientes. Un cierre ganado no demuestra por sí
solo un cobro Stripe: no se inventarán referencias, fechas ni métodos de pago.

Se conservan las pestañas LidIA y Mensajes, el contacto dependiente del CRM y
la contratación en la web. El cliente no elige un agente, proyecto, operador
ni identificador de CRM mediante datos enviados desde el dispositivo.

Supuesto de diseño pendiente de respuesta: el sondeo de la primera versión
conectada usa una cuenta gratuita, sin exigir contratación. Si se elige acceso
inicial sin registro, se añadirá una identidad anónima aislada y un proceso de
reclamación de conversación; nunca se usará para consultar expedientes.

## 2. Lo comprobado en el repositorio

| Área | Existe | Falta para la app conectada |
|---|---|---|
| Datos | MySQL/Prisma: `User`, `Expediente`, `Documento`, `EventoExpediente`, `Notificacion` | Identidad verificada entre sistemas, referencias de conversación y recepción durable de eventos |
| Acceso | Login, contraseña por invitación/recuperación, JWT y `requireAuth` | Registro gratuito real, verificación, revocación de sesiones y operaciones reales de cuenta |
| Perfil/documentos | Lectura y edición de perfil; expediente/documentos propios; avisos propios | Capacidades comerciales y validación explícita de datos/documentos para revisión |
| Pago | Checkout Stripe y `fulfillPayment`; actualización CRM; invitación; callback LidIA | Coordinación transaccional con la entrada Zoho y adenda de canal APP |
| Zoho | `/webhooks/zoho` busca un expediente existente y mapea `fase` | Alta cuando `Stage` pasa a ganado, resolución de cuenta y asignación de comercial/gestor |
| LidIA actual | PluginWeb y Public Chat; motor de IA, historial y soporte humano | Entrada directa APP autenticada y autorizada por cuenta |
| Frontend | Demo y adaptador futuro PluginWeb | Transporte APP, alta real y lectura del estado comercial del servidor |

Fuentes principales:

- [`schema.prisma`](../../backend/prisma/schema.prisma): `zohoContactId` y
  `zohoDealId` no tienen actualmente restricción de unicidad; `User.email` sí.
- [`auth.js`](../../backend/src/routes/auth.js) y
  [`middleware/auth.js`](../../backend/src/middleware/auth.js): login,
  invitación/reset y JWT de 30 días. No hay endpoint de registro gratuito ni
  mecanismo persistente de revocación por dispositivo.
- [`portal.js`](../../backend/src/routes/portal.js): autorización por `userId`
  en expedientes y documentos; la subida física se ejecuta antes de comprobar
  la pertenencia del expediente. La API APP deberá comprobarla antes de
  aceptar archivos y limpiar cargas incompletas.
- [`checkout.js`](../../backend/src/routes/checkout.js): crea un expediente
  `pago_pendiente` antes del cobro; `fulfillPayment` comprueba el estado y luego
  escribe, sin una reclamación transaccional de la operación concurrente.
- [`webhooks.js`](../../backend/src/routes/webhooks.js): Stripe comprueba
  firma y `payment_status=paid`; Zoho recibe `dealId/nPedido/fase`, exige
  expediente previo y devuelve 404 si no existe. El secreto Zoho solo se
  comprueba cuando está configurado: la nueva recepción debe fallar cerrada.
- [`zoho.js`](../../backend/src/services/zoho.js): el alta desde un pago
  escribe `Stage: 'Cerrado ganado'`, `Pago_Confirmado`, `N_Pedido` y el
  identificador de contacto. Esa escritura puede producir el segundo evento.
- [`AppContext.jsx`](../../frontend/app/src/AppContext.jsx): `isClient` se
  calcula con `data.expedientes.length > 0`. Un checkout pendiente ya puede
  producir una fila; esto no sirve como criterio comercial de producción.
- [`Register.jsx`](../../frontend/app/src/Register.jsx) y
  [`Account.jsx`](../../frontend/app/src/Account.jsx): registro, cambio de
  contraseña, preferencias y borrado siguen siendo demostraciones locales.

### Agente y entornos: evidencia y límite

La documentación de LidIA del 28/09 identifica el agente **119, «LidIA Canje
v4»**, como original de WhatsApp en PRO. También distingue los agentes
operativos web y las variantes de la prueba A/B; no son intercambiables.
Referencia externa al checkout Portal:
`Gestadia_LidIA/docs/superpowers/specs/2026-09-28-pruebas-ab-agentes-design.md`, §1.

Esto es evidencia documental, no una lectura de la configuración efectiva
actual de `lidia.gestadia.com`. El equipo LidIA ha sido consultado para
confirmar proyecto, agente, instrucción activa y capacidad APP en runtime.
No se fija el 119 dentro del cliente móvil ni se modifica su tráfico actual.

Comprobación de acceso de esta preparación: el navegador integrado y Chrome
mostraron el formulario de inicio de sesión de `lidia.gestadia.com`, sin una
sesión autenticada disponible. No se consultaron credenciales almacenadas ni
se intentó acceder al panel por otra vía. La lectura runtime requiere iniciar
sesión en el panel y revisar la configuración en modo lectura.

El checkout local de referencia LidIA está en `dev/IA/main`, por detrás de su
remote-tracking en el momento de revisión. Los símbolos se usan como evidencia
de la arquitectura existente, no como prueba de qué versión sirve producción.

La documentación histórica del Portal indica que `gestadia.com` era el único
entorno y que DEV de LidIA podía escribir allí. Antes del primer ensayo
conectado se acreditará un Portal de pruebas con base de datos, CRM, correo y
pagos aislados; no se deducirá aislamiento por el nombre del host de LidIA.

## 3. Arquitectura recomendada y alternativas

| Enfoque | Ventaja | Consecuencia |
|---|---|---|
| **API Portal + adaptador APP servidor a servidor** | Reutiliza cuentas, trámites y pagos; autoriza cada conversación | Requiere un contrato APP nuevo en LidIA. Recomendado |
| App directa a PluginWeb/Public Chat | Reutiliza inmediatamente el transporte web existente | PluginWeb no prueba identidad; Public Chat requiere un handoff/ticket. No cubre por sí solo la entrada independiente de una cuenta APP |
| Backend completo nuevo para la app | Independencia de despliegue | Duplica usuarios y lógica de pago/CRM; añade reconciliación entre bases. Sin necesidad acreditada en esta fase |

Flujo propuesto:

```text
App iOS / Android / web
    │ sesión de cuenta Portal
    ▼
API APP en el backend Portal
    ├─ usuarios, expedientes, documentos y avisos existentes
    ├─ vínculo de identidad y pertenencia de conversaciones
    └─ adaptador autenticado servidor a servidor
           ▼
       LidIA, canal APP
           ├─ motor de canje y estado de sondeo
           └─ timeline + cola/operador de soporte

Stripe ──pago confirmado─────┐
Zoho ────trato ganado────────┴─► recepción durable + alta coordinada Portal
```

La API cliente propuesta usa `/api/app/v1`. Las rutas actuales `/api/me`,
`/api/expedientes`, `/api/auth/*` y el contrato de pago 1.0 continúan siendo
interfaces existentes; no se renombran ni se exponen de repente sin control.
El adaptador usará servicios compartidos para evitar reglas de negocio
duplicadas en los routers.

## 4. Identidad, cuentas y permisos

La identidad principal sigue siendo `User.id`. Cada acceso privado parte de
una sesión Portal válida y consulta el usuario actual. La identidad APP que
recibe LidIA procede del servidor, con credenciales acotadas al proyecto y
entorno, nunca de un teléfono declarado ni de un JWT Portal pasado como si
fuera una credencial LidIA.

`VinculoLidia` representa una cuenta por proyecto LidIA. Tiene `userId`,
identidad estable del sujeto APP, `projectId`, fecha y método de comprobación,
y referencias CRM/LidIA opcionales. La forma exacta del sujeto se cerrará con
el equipo LidIA. Cuando exista una ficha verificada, se reutilizará su
`ClientKey`; la conversión Lead→Contact conserva la cuenta y sus permisos.

Una cuenta gratuita puede empezar un sondeo sin tener expediente ni contacto
de pago. No se fabricará un `WhatsAppContact` con un teléfono ficticio para
cumplir dependencias del runtime. El equipo LidIA determinará la identidad
neutral de canal que necesita el motor antes del primer contacto CRM.

La invitación generada desde un trato ganado se dirige a un destinatario
obtenido del CRM comprobado. Registrar un email igual o introducir un número
igual no permite reclamar un expediente o el historial privado de otra ficha.
Los conflictos de identidad quedan pendientes de revisión, sin vincular por
aproximación.

La primera API de cuenta debe cubrir registro/verificación, invitación,
login, recuperación, cambio de contraseña y cierre de sesión revocable. No
se considera resuelto el ciclo de sesión conservando únicamente el JWT actual
de 30 días y borrándolo del dispositivo. La implementación elegirá sesiones
revocables y almacenamiento nativo apropiado, con pruebas de cambio de cuenta.

Primera decisión de producto propuesta: sondeo con cuenta gratuita verificada,
sin pago obligatorio. Se ha preguntado al usuario si prefiere entrada anónima;
al no haber respuesta durante esta preparación se conserva explícitamente
ese supuesto, sujeto a corrección antes de implementar la entrada al sondeo.

El backend devuelve el estado comercial y las capacidades: consultar sondeo,
contactar comercial, contactar gestor asignado y gestionar cada expediente.
No se habilita acceso documental porque el usuario tenga cualquier expediente
pendiente, ni porque el dispositivo indique `isClient=true`.

## 5. Canal APP y conversaciones

El enum local `ChatSessionChannel` solo contiene `Web` y `WhatsApp`. APP
necesita una entrada propia y revisar los usos de canal en autorización,
tools, envíos, automatización, soporte y observabilidad. Si se añade un valor
persistido, se conservan los valores de Web/WhatsApp.

Reutilizamos `ChatService`, las presentaciones/timeline y
`SupportQueueService`; no se reutilizan tickets, tokens, memoria o sesiones
WhatsApp como sesiones APP. APP nunca activa `IsWhatsAppActive` ni envía una
respuesta o una automatización a Woztell por heredar una configuración.

`ConversacionApp` guarda un id público opaco, `userId`, propósito
(`sondeo`/`atencion`), expediente opcional y `lidiaSessionId`, proyecto y fechas.
LidIA sigue siendo la fuente del contenido. Las credenciales servidor a
servidor no se devuelven al móvil; cada lectura/envío vuelve a autorizar
pertenencia.

- **LidIA:** sondeo gratuito, conversación con el agente operativo APP de
  canje. La capa APP adapta la presentación y el canal; las reglas de canje
  mantienen una fuente de verdad en LidIA.
- **Mensajes:** atención comercial si aún no hay contratación, o gestor para
  un expediente habilitado. El destino proviene de una relación CRM
  comprobada; `Owner` no se presume equivalente a «gestor asignado».
- **Transferencia:** conserva la misma `ChatSession` y timeline de esa
  conversación. Se registra petición, espera, asignación y toma por operador;
  el cambio de pestaña por sí solo no crea ni transfiere una sesión.
- **Operador:** el nombre y estado visibles los devuelve LidIA a partir de
  la asignación autorizada. No se promete que Juan Carlos recibió un mensaje
  por haber pulsado el botón.

El cliente presenta horas persistidas del servidor, papeles de emisor y
opciones tipadas. El resultado del sondeo procede del agente y su estado
estructurado; no se infiere leyendo palabras sueltas de la respuesta ni se
reemplaza por el cuestionario determinista de la demo.

## 6. Superficie API propuesta

**Todas las rutas APP de esta tabla son propuestas, no están montadas.**
Las públicas de autenticación tienen límites específicos; las privadas
requieren cuenta, y expediente/conversación requieren pertenencia adicional.

| Método y ruta bajo `/api/app/v1` | Función y condición |
|---|---|
| `POST /auth/register` | Cuenta gratuita; no convierte en cliente ni reclama historias CRM |
| `POST /auth/verify-email` | Consume comprobación de email de uso único y con caducidad |
| `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` | Sesión de cuenta y revocación de su renovación |
| `POST /auth/forgot`, `POST /auth/set-password` | Recuperación/invitación sin revelar existencia de cuenta |
| `GET /me`, `PATCH /me` | Perfil propio, estado comercial y capacidades; edición por allowlist |
| `POST /me/password` | Cambio real con reautenticación y revocación de otras sesiones |
| `GET /expedientes`, `GET /expedientes/:id` | Reutiliza el servicio Portal con autorización por cuenta |
| `POST /expedientes/:id/documentos` | Archivo propio, validación de tipo/tamaño y autorización antes de escritura |
| `GET /expedientes/:id/documentos/:docId` | Descarga privada propia; no convierte el almacenamiento en público |
| `POST /expedientes/:id/validaciones` | Registra solicitud idempotente de revisión; no declara aprobación DGT |
| `GET /notificaciones`, `POST /notificaciones/:id/leer` | Avisos propios; no implica push nativo instalado |
| `GET /conversaciones`, `POST /conversaciones` | Recupera/abre contexto `sondeo` o `atencion`; destino decidido por servidor |
| `GET /conversaciones/:id/timeline?cursor=...` | Historial propio con cursor y estado de soporte |
| `POST /conversaciones/:id/turnos` | Texto o acción tipada, con clave idempotente; no acepta roles internos |
| `POST /conversaciones/:id/atencion` | Solicitud explícita y auditada de atención, no un texto que fuerce permisos |

Preferencias, push real, soporte de cuenta y borrado real deberán completar
su contrato antes de habilitar esas vistas en modo conectado. El borrado debe
revocar sesiones y vínculos de conversación, y tener un procedimiento acordado
para expedientes/documentos; el borrado de la demo no sirve como esa operación.

### Contrato servidor a servidor por cerrar con LidIA

El equipo LidIA ha revisado este diseño y propuesto la base
`/api/integrations/lidia/app/v1`. Las rutas y campos siguientes son el borrador
conjunto para concretar; **no son endpoints existentes ni un contrato
implementado**. El dispositivo sigue consumiendo solo la API Portal.

| Ruta S2S propuesta en LidIA | Campos y comportamiento |
|---|---|
| `POST /sessions` | `schema_version`, `portal_user_id`, `purpose`, `correlation_id`; referencia CRM verificada opcional. Proyecto, entorno y agente se resuelven por credencial/configuración de integración. Inicio idempotente con identidad derivada del servidor |
| `GET /sessions/:conversation_id/timeline?cursor=...&limit=...` | Mensajes visibles, presentaciones/acciones, cursor, estado de soporte y agente efectivo. Pertenencia comprobada por sujeto/proyecto/entorno |
| `POST /sessions/:conversation_id/turns` | `Idempotency-Key`, `turn_id`, `kind: text|action`, `text` o `presentation_id/action_id`. Devuelve id persistido, cursor y estado; 202 solo reconoce recepción/cola |
| `POST /sessions/:conversation_id/handoff` | `reason`, `target_kind: commercial|manager|support`. LidIA resuelve destino autorizado; no acepta un operador/departamento arbitrario del dispositivo |

Respuesta de inicio propuesta por LidIA: `conversation_id`,
`lidia_session_id`, metadatos del agente y credencial scoped con caducidad.
Esa credencial, si forma parte del contrato final, permanece en el backend,
ligada al sujeto; no viaja al móvil. Debe acordarse cómo reautorizar/recuperar
una sesión tras expirar la credencial o reiniciar el backend, conservando la
pertenencia y el historial entre dispositivos.

`portal_user_id` representa `User.id`. No se crea otro `portal_account_id`
sin una entidad/semántica distinta acordada. `ClientKey` es correlación a una
ficha comprobada, no contraseña ni permiso para elegir proyecto/agente.
La forma exacta de la prueba de identidad, DTO, versión, autenticación y
configuración/capacidades sigue pendiente de acuerdo técnico. Un campo de
entorno en el cuerpo no permite cambiar el entorno autorizado por la credencial.

Requisitos del contrato:

1. Credenciales por integración/proyecto/entorno, rotables y solo en servidor.
2. Sujeto derivado de la cuenta Portal, con nivel de verificación y alcance;
   configuración de proyecto/agente decidida por servidor.
3. Id público de conversación de Portal separado del id interno de sesión.
4. Cada petición ligada al sujeto y a su sesión APP; no se permite consultar
   otro canal o tenant cambiando un identificador.
5. Turnos `kind: text|action` y `Idempotency-Key`; una acción se valida contra
   la presentación vigente y su dueño.
6. Resultado con id persistido, timestamp, rol visible, cursor, estado de
   soporte y agente efectivo. Los mensajes internos/System se excluyen.
7. Una respuesta 202 significa recibido/en cola; no significa que la IA o un
   humano hayan contestado. Ante timeout se consulta/reconcilia el mismo turno;
   no se crea otra clave y se reenvía el mensaje como si no hubiera ocurrido.
8. Polling con cursor para la primera conexión. El transporte de eventos
   posterior debe autorizar por cuenta; no se abre el hub administrativo.

Referencias de reutilización contrastadas por el equipo LidIA:
`PublicChatTurnService` aporta el patrón de token, turn gate, idempotencia y
acciones; `SupportQueueService.TransferAsync/TakeOverAsync` y
`OperatorConversationReader` aportan soporte y alcance de operador. Se crea
autorización APP delante de esos servicios; no se reciclan grants ni tickets
Public Chat.

## 7. Pago y Zoho Cerrado ganado: una sola alta

`EventoIntegracion` añade una bandeja de entrada durable con proveedor, id
externo, versión/fecha origen, hash de payload, estado de procesamiento y
correlación. La repetición exacta retorna el resultado conocido; un mismo id
con otro payload es conflicto. Una caída después del recibo no pierde el alta.
`LidiaEvento` permanece como outbox del contrato de pago existente.

Entrada Zoho propuesta: evento de cambio de trato que incluya `dealId`,
versión o `Modified_Time` y una clave estable para reintentos. Se autentica
antes de aceptarse, sin secreto en query, y se relee el trato mediante el
acceso servidor a Zoho para comprobar `Stage`, contacto, servicio y correlación.
Los ids numéricos CRM viajan como strings, sin conversión a Number.

La recepción de fase existente sigue siendo una operación diferente. No se
interpreta «Cerrado ganado» como una fase documental.

| Entrada | Resultado previsto |
|---|---|
| Pago confirmado del checkout | Habilita el expediente correlacionado, guarda prueba económica y emite el aviso una vez |
| Trato ganado y expediente existente | Añade evidencia CRM/asignación sin crear otro usuario o expediente |
| Trato ganado sin expediente | Resuelve contacto/cuenta de forma comprobada, crea expediente habilitado e invitación si procede |
| Trato ganado sin datos suficientes o identidad conflictiva | Conserva el evento pendiente de resolución, sin acceso cruzado ni datos inventados |
| Pago + trato ganado repetidos o simultáneos | Una sola alta y efectos deduplicados por identidad de negocio y evento |
| Evento antiguo después de una fase más reciente | No retrocede el expediente; registra y reconcilia la versión de origen |

La identidad de negocio es el trato CRM y, cuando existe, el `nPedido`/intent
de checkout verificado. Un email, nombre o teléfono coincidente no identifica
unívocamente un trámite: una persona puede contratar más de un canje.

Antes de imponer unicidad a `zohoDealId` se auditan duplicados existentes.
La resolución se ejecuta con transacción/claim y restricciones persistentes,
no con un `findFirst` seguido de un alta desprotegida. Se consideran ambas
carreras: CRM puede avisar mientras `fulfillPayment` aún no guardó el deal,
y el retorno de la escritura CRM debe encontrar la misma asociación.

El estado de habilitación se registra con su fuente y fecha. Se conservan por
separado estado comercial, fase del trámite y evidencia de cobro. Para un trato
ganado sin prueba de pago, `fechaPago`, `pagoRef` y `pagoMetodo` siguen sin
inventarse; no se emite `payment.succeeded` ni «pago recibido» por ese evento.

## 8. El contrato de checkout 1.0 necesita una adenda APP

El [contrato 1.0](2026-07-28-contrato-lidia-portal-v1-0.md), §2.1, permite el
checkout del agente **únicamente desde WhatsApp real**. No basta con cambiar
`IsWhatsAppActive` ni ampliar un guard para conectar la nueva app.

El equipo contrastó `GestadiaPortalToolHandler.AuthorizeAsync`, en
`Services/Integrations/GestadiaPortal/Agent/GestadiaPortalToolHandler.cs`,
líneas 346–430 de su checkout: acepta WhatsApp y una excepción controlada
Web/Playground Real con contacto. Eso no habilita APP. La propuesta conserva
el handler y añade un adaptador APP separado; en la primera fase, Portal
puede emitir el intent desde su API autenticada y coordinar la correlación
con LidIA, una vez acordada la adenda.

La adenda APP debe acordar origen de canal, sujeto/conversación, Contacto y
Oportunidad verificados, consentimiento explícito para contratar y destino de
los callbacks. Reutilizar `CheckoutIntent` y el cobro web es la propuesta; su
correlación APP debe persistirse y los resultados deben ir al timeline APP.
Los campos de atribución y el comportamiento de clientes WhatsApp del
contrato 1.0 se conservan.

La primera consulta no genera un pago ni requiere haber pagado. El precio y
los requisitos provienen del catálogo y de LidIA existentes. Si se abre el
checkout desde APP, se usará un intent correlacionado con datos recuperados en
servidor; la URL no será la autoridad para asignar un expediente a una cuenta.

## 9. Verificación y entregas independientes

El cambio se divide en cuatro contratos revisables: cuenta/identidad y API
Portal; canal/sondeo y atención LidIA; alta por pago/Zoho; conexión de las
vistas existentes. Se empieza por identidad y pertenencia, que condicionan
los otros contratos. Esto describe el orden de diseño, no una aprobación
de implementación o despliegue.

Criterios de aceptación para la implementación:

- Cuenta gratuita verificada sin expediente puede consultar canje; no obtiene
  documentos ni historial privado solo por declarar un teléfono.
- La cuenta A no puede leer, enviar, transferir ni subir archivos en recursos
  de B. Salir o cambiar de cuenta invalida renovaciones y acceso a conversaciones.
- El sondeo y la atención conservan sus contextos; una transferencia a humano
  mantiene el timeline y exige operador autorizado.
- APP no emite Woztell/WhatsApp ni altera automatizaciones de esos canales.
- Pago y ganado en ambos órdenes, repetidos y concurrentes, producen una sola
  alta. Un error en CRM, email o red no pierde el evento ni repite el cobro.
- Ganado sin prueba económica habilita el trámite sin falsear el pago.
- Turno/action repetido con la misma clave no duplica herramientas ni mensajes;
  acción de otra presentación o cuenta es rechazada.
- Documento incompleto, inválido o de otro expediente no deja archivos huérfanos.
- Build, endpoint y agente efectivos se acreditan en el entorno de prueba;
  conversación IA, intervención humana y avance desde Zoho se prueban por separado.
- iOS, Android y web se verifican por separado antes de anunciar cierre móvil.

### Línea base técnica tomada el 03/10

Se ejecutó el script existente `npm test` del backend. Resultado: 12 pruebas
pasaron y 5 archivos fallaron al cargar por dependencias locales ausentes
(`express` y `@prisma/client`). No se presenta como una suite verde ni como
un fallo causado por este diseño. No se instalaron dependencias ni se abrió
la base de producción para esta preparación.

El glob actual del script no incluye los tests situados directamente en
`src/`. `src/db.test.js` escribe en la base indicada por el entorno: su
ejecución completa exige una base de pruebas acreditada. La validación de la
implementación separará unitarios/mocks de integración SQL real.

## 10. Coordinación y decisiones abiertas

Se ha solicitado al chat LidIA **«Avance del experimento MDVP»** la matriz
actual de endpoints, canal, identidad, guard del checkout y soporte, y una
comprobación de agente/configuración efectiva. La coordinación no autoriza
a cambiar el agente de producción, publicar el canal ni activar el CRM.

Revisión concreta recibida del equipo LidIA: considera coherente el diseño y
confirma desde código la restricción del handler de checkout, la falta de un
canal APP en el enum y los servicios reutilizables. Ha entregado la matriz S2S
propuesta incorporada en §6. No ha confirmado el runtime; quedan por cerrar
DTO/autenticación definitiva, identidad, renovación de acceso y adenda APP.
La arquitectura y la matriz son propuestas revisadas, no una integración activa.

| Decisión | Cómo se cierra |
|---|---|
| Agente APP de canje y proyecto efectivos | Lectura runtime autorizada de LidIA: id, nombre, instrucción, canal y entorno; aprobación del enrutamiento APP |
| Sujeto APP y vínculo a ClientKey | Contrato conjunto Portal/LidIA con verificación, transición Lead→Contact y conflictos |
| Comercial/gestor de CRM | Lectura de campos efectivos y relación con usuario/departamento de soporte; no asumir `Owner` |
| Entrada APP, DTO, auth, recuperación y atención explícita | Cerrar la matriz propuesta del equipo LidIA (§6) como nueva versión |
| Adenda de checkout APP | Consentimiento, atribución, identidad de negocio y callbacks compatibles con 1.0 |
| Evento Zoho ganado y reconciliación | Workflow/Flow efectivo, payload/versionado y resolución de cambios/reaperturas |
| Entorno de ensayo aislado | Bases y conexiones verificadas antes de emitir mensajes, invitaciones o checkouts |
| Sondeo con cuenta o anónimo | Elección del usuario; por ahora supuesto de cuenta gratuita |

Las decisiones de reapertura/cancelación de un trato y retención/borrado de
cuenta con expediente no se inventan en este diseño. Hasta acordarlas, no
se revoca automáticamente un acceso válido por un evento de estado ambiguo
ni se ofrece borrado productivo con el comportamiento de la demo.
