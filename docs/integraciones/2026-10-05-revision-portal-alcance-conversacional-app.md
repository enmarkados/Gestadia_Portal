# Portal: revisión del ajuste al alcance conversacional APP/LidIA

**05/10/2026. Conformidad con el alcance; precisiones contractuales pendientes.**
Revisión documental y lectura de código local. No implementa, despliega ni
activa canales o flujos. El contrato Zoho→Portal permanece independiente.

[Propuesta recibida](2026-10-05-ajuste-alcance-conversacional-app.md) ·
[Responsabilidades vigentes](../app/RESPONSABILIDADES-INTEGRACION.md) ·
[Glosario](../../GLOSARIO.md).

## 1. Procedencia y resultado

Se incorpora copia exacta de
`/Users/gonchumon/.codex/worktrees/1e4f/Gestadia_LidIA/docs/integraciones/2026-10-05-ajuste-alcance-conversacional-app.md`:
14.398 bytes, SHA-256
`6b1608fb4bd4dc6102f00d38729e3d0562d002f0e416f0495120f8cbf70e7336`.
El archivo de origen estaba sin seguimiento Git al leerlo; el hash identifica
la versión recibida. Sus enlaces relativos se conservan íntegros.

**Conformes:** Zoho produce sus POST al backend Gestadia; Portal resuelve
cuentas, credenciales y trámites; LidIA cubre sondeo y conversaciones
IA/comercial/gestor. El cierre de esta API conversacional no depende de cerrar
el contrato Zoho, ganado/pago, cardinalidad trato–expediente ni checkout.
`crm-links` y callbacks económicos quedan fuera de esta revisión.

Aceptamos como diseño la identidad `User.id`, la asociación durable por
integración/cuenta/conversación y la actualización de contexto de una sesión
existente. El documento recibido prevalece sobre las dependencias de alcance
históricas; esta revisión precisa cómo acreditarlas desde Portal.

## 2. Identidad: conformidad y evidencia disponible

**Confirmamos `portal_user_id = User.id`.** Es UUID durable, común al acceso
Portal/APP; no cambiará por recibir ganado, renovar JWT, añadir un trato o usar
otro dispositivo. No se envían JWT móvil, contraseña ni identidad CRM como
credencial LidIA. El sujeto procede del usuario autenticado y del registro
backend, nunca de un id arbitrario del móvil.

Base estática contrastada: `app/main`, commit
`3d02c409e5a8a8fd79f5e44b302ae4ba55e9889c`. Hechos del código actual:

- [User](../../backend/prisma/schema.prisma#L14) tiene `emailVerified`, tokens
  de invitación/reset y `createdAt`; no persiste fecha ni método de verificación
  de cuenta, estado activo/bloqueado ni el ledger de revocación APP.
- [set-password](../../backend/src/routes/auth.js#L21) marca `emailVerified=true`
  tanto al consumir invitación como al consumir reset. No guarda cuándo ni cuál
  de esos caminos verificó inicialmente la cuenta.
- [login](../../backend/src/routes/auth.js#L11) comprueba contraseña, y
  [requireAuth](../../backend/src/middleware/auth.js#L9) comprueba JWT y existencia
  del usuario. Ninguno constituye hoy el gate `account_verified` más estado
  activo/revocación que propone el contrato.
- [signToken](../../backend/src/middleware/auth.js#L5) firma el `User.id` con
  expiración de 30 días. Esa expiración no acredita revocación de dispositivo
  ni bloqueo de la cuenta.

**Propuesta Portal para la atestación:** conservar una evidencia real de
verificación de cuenta, con fecha y método de un proceso propio. `invitation`
se usará cuando conste consumo acreditado de la invitación; `email` cuando
conste verificación del correo mediante el proceso correspondiente. La creación
de usuario, el login y la recepción de un POST Zoho no inventan esa evidencia.

Las cuentas históricas con sólo el booleano no permiten reconstruir
`identity.verified_at` o `identity.method`. Antes de emitir la atestación,
se recuperará evidencia comprobable o se completará una nueva verificación;
no se sustituye la fecha por `createdAt` o por la hora de firmar. Si se desea
otro método, se acuerda su semántica y DTO con LidIA. Esto es dependencia del
backend de identidad, no del contrato de datos Zoho.

`identity.account_status=active` exige que Portal aplique un gate real de cuenta
y su ciclo de bloqueo/revocación. Se acepta el campo contractual, sin afirmar
que ese mecanismo esté implementado hoy ni permitir reactivar por ese valor.

## 3. Asignaciones y destino de atención

Conformes con referencias estables del backend y mapping LidIA por integración,
proyecto/entorno y rol. Son opcionales para asociar cuenta y conversación.
Los modelos actuales [User](../../backend/prisma/schema.prisma#L14) y
[Expediente](../../backend/prisma/schema.prisma#L35) no tienen un registro de
asignaciones comercial/gestor. No confirmamos un mapping operativo ni inferimos
gestor a partir de Zoho Owner.

Para consolidar el DTO bastan los ejemplos ficticios ya recibidos:
`assignment-commercial-01` y `assignment-manager-01`. Proponemos que identifiquen
la asignación acreditada, no sólo a la persona: cuenta/contexto, rol y vigencia
quedan resueltos en backend. LidIA necesita su destino autorizado en su mapping,
sin necesitar el contrato del POST Zoho.

Reglas propuestas:

- Comercial puede atender antes del trámite con `case_ref=null`, si dispone
  de permiso y asignación/mapping acreditados.
- Gestor de trámite exige `case_ref` perteneciente a la cuenta y asignación
  gestor válida para ese contexto. Una referencia de otro caso no amplía acceso.
- Sin asignación o sin mapping elegible, conservar `routing_unavailable`.
  Como alternativa explícita, ofrecer soporte general sólo si existe
  `support_handoff` y una cola general configurada y autorizada en la integración.
  No elegimos hoy un operador ni presumimos que esa cola exista.
- Un destino comercial general requerirá una regla expresa y configurada;
  no se acepta como fallback implícito. El móvil no elige operador/departamento.

Las asignaciones reales y la cola se comprobarán antes de atención conectada;
no condicionan el contrato base de inicio, recuperación y sondeo.

## 4. Contexto por conversación: conformidad con estas precisiones

Favorable a `POST /sessions/{conversationId}/context`, S2S idempotente, con
`ConversationContextRequest`. Cuenta/scope proceden de Portal; las capacidades
efectivas se intersectan con la integración y con la revocación vigente.
La operación requiere credencial autorizada para atestiguar identidad/contexto;
una credencial limitada a turnos no podrá ampliar permisos privados.

Proponemos consolidar las siguientes reglas en su adenda:

1. **Orden y concurrencia:** revisión positiva canónica por conversación,
   comparada numéricamente como string decimal, no lexicográficamente ni como
   número JSON. Persistir snapshot y aumento de `state_revision` en la misma
   transacción. Revalidar permisos al ejecutar turnos, acciones y handoff;
   una acción admitida antes de retirar permisos no autoriza el efecto después.
2. **Retirada completa:** revisión superior reemplaza todo el contexto;
   `permissions=[]` y asignaciones null retiran capacidades. Las lecturas de
   historial privado, turnos y operadores quedan sujetas al permiso actual.
   Una repetición antigua recupera su resultado sin restaurar permisos retirados.
3. **Ámbito del trámite:** null→caso acreditado puede enriquecer una conversación
   compatible. Tras introducir contexto privado de un caso, cambiar a otro
   caso no reutiliza su historial: requiere conversación explícita independiente.
   Retirar el caso no convierte mensajes privados en sondeo público. El purpose
   no se cambia mediante resume/context; el handoff cambia modo de atención
   conservando la misma sesión/timeline, sin crear otro propósito por su cuenta.
4. **Autorización de reintentos:** cuenta revocada y pertenencia se comprueban
   también antes de devolver un resultado idempotente. Un ACK previo no es
   autorización para leer contenido ni conceder permisos actualmente retirados.
5. **Artefactos nuevos:** añadir request, response, errores y reglas a una adenda
   versionada con JSON Schema y ejemplos. El fixture recibido no define todavía
   `ConversationContextRequest`; no se modifica silenciosamente ese histórico.
   Añadir vectores para `operation=context`, normalización de `permissions` y
   retiradas/conflictos. Ordenar este conjunto es una excepción explícita a la
   regla anterior de no ordenar arrays, limitada a esta operación.

Estos puntos sólo afectan al contrato conversacional. No introducen dependencias
del formato del evento Zoho ni herramientas de consulta de expedientes.

## 5. Recuperación, cierre y retención

Conformes con persistir asociaciones por cuenta e integración en ambos extremos.
Otro dispositivo recupera el mismo id; ni renovar sesión móvil ni recibir
contexto reinicia ChatSession. No se traslada historial por email/teléfono,
cambio de subject o contacto CRM. Los ids internos de LidIA quedan S2S.

Conversación cerrada: recuperación para lectura autorizada, sin saludo, turnos
nuevos, handoff o reactivación de IA. Proponemos admitir actualización de
contexto mientras el registro esté retenido, también para retirar permisos;
no reabre la sesión ni convierte un cierre en una nueva atención. Una nueva
conversación se solicita de forma explícita y usa otra identidad de operación.

Se conserva la propuesta de 30 días para detalle de recibos y el ledger de
operaciones no resueltas. Mensajes/historial, cursores y marcas de retirada
requieren política conjunta específica; no confirmamos un plazo inventado.
La marca de creación de sesión debe conservar key/huella→resultado retirado,
para que repetir ese inicio no cree otra conversación después de retirar el
historial. Contexto y handoff necesitan también marcas suficientes para impedir
repetir sus efectos. Recuperación de handoff conserva su key y recibo originales,
sin inventar un `turn_id` cuando sea null.

## 6. Respuesta y trabajo de cada equipo

**Portal:** conforme con identidad y alcance; preparará el diseño de evidencia
de cuenta/estado, asociación durable, revisión de contexto y referencias de
asignación para su API. Hoy son propuestas, no persistencias implementadas.

**LidIA:** solicitamos consolidar la adenda de contexto con las precisiones
anteriores, su esquema/vectores, permisos de credenciales y reglas de cierre
y retirada. Mantiene como comprobación propia el agente APP, mapping operativo
y aislamiento DEV; el estado del 119 no se acredita en esta revisión.

**Conjunto:** cerrar evidencia de cuenta, política de retención y mapping/cola
de atención. Los flujos Zoho, altas comerciales y pagos continúan en el trabajo
Portal/Zoho y no son condiciones del contrato conversacional.

Se han contrastado fuente recibida, anexos, esquema existente y código local.
No se han ejecutado validadores/endpoints APP, pruebas S2S conectadas ni revisión
autenticada de agentes o DEV. La conformidad es de diseño con las precisiones
indicadas, no de runtime ni autorización de ejecución.
