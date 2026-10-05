# Zoho Cerrado ganado: evento de alta y cuenta compartida Portal/APP

**Fecha:** 05/10/2026. **Estado:** regla de negocio confirmada por el usuario;
detalles de transporte y correlación propuestos para revisión conjunta.
Trabajo documental: no implementa ni activa integraciones.

Esta decisión sustituye la alternativa de instantáneas de O6 en la
[respuesta LidIA](2026-10-05-respuesta-lidia-observaciones-o1-o8.md) y R3 de la
[revisión Portal](2026-10-05-revision-portal-respuesta-lidia-o1-o8.md) **como
disparador del alta comercial**. Los documentos y anexos recibidos se conservan
como histórico; su DTO `CrmSnapshotEvent` no representa esta nueva decisión.
Nomenclatura en el [glosario](../../GLOSARIO.md).

## 1. Regla confirmada por el usuario

- **Zoho debe postear cuando el trato pasa a Cerrado ganado.** El evento
  dispara el alta de cliente y el acceso a su trámite en Portal y app.
- **Una sola cuenta y las mismas credenciales para Portal y app.** Si falta
  la cuenta, Portal genera el acceso conforme al proceso de credenciales
  acordado. Si ya existe, la reutiliza sin cambiar su contraseña ni crear
  una segunda cuenta.
- **El acceso para hablar es independiente.** Se puede usar la app para hablar
  con LidIA o con comercial/gestor antes de ganar el trato. Al recibir ganado
  se cruzan cuenta, conversación, contacto, trato y trámite.
- Consultar posteriormente la etapa actual del trato no sustituye recibir
  la ocurrencia del cambio. Una instantánea se limita a ayuda de reconciliación.

Ejemplo: Ana usa la app para consultar el canje y tiene cuenta. Cuando su trato
se gana en Zoho, Portal vincula su trámite con esa misma cuenta. Ana conserva
su acceso y su conversación. Si nunca tuvo cuenta, ese evento origina su acceso
de cliente compartido por ambos productos.

## 2. Flujo propuesto

1. La automatización CRM detecta la entrada a Cerrado ganado y emite un POST
   hacia el receptor Portal. Debe cubrir los orígenes reales del cambio
   utilizados por negocio; no depende de que la app esté abierta.
2. Portal autentica el emisor, valida organización/entorno y guarda el evento
   antes de confirmar recepción. El ACK acredita persistencia, no alta concluida.
3. Portal resuelve el contacto y la relación con la cuenta y el servicio.
   Reutiliza o crea la cuenta y el expediente aplicables; habilita el acceso
   comercial y registra los efectos que deba comunicar.
4. Si existe cuenta conversacional, conserva su identidad, contraseña e historial.
   Si no existe, origina el proceso de credenciales de cliente una sola vez.
5. Portal comunica a LidIA el vínculo acreditado para los contextos y permisos
   correspondientes. LidIA conserva la separación entre hablar y gestionar un
   expediente; un mensaje o un id enviado por el móvil no concede pertenencia.

La recepción inicia el procesamiento inmediatamente, sin esperar un sondeo
periódico de Zoho. Si faltan datos para un cruce seguro, el evento queda durable
en `pending_identity` o `pending_correlation` y se resuelve sin perderlo ni
atribuir el trámite a una cuenta por aproximación.

## 3. Qué debe preservar el evento

Propuesta mínima a consolidar con CRM/LidIA: identidad estable de ocurrencia
(`event_id`), organización y entorno CRM, `deal_id`, contacto y servicio,
fecha de la ocurrencia y etapa Cerrado ganado. La etapa anterior sólo se envía
si el origen la acredita. Cuenta, pedido, intent y expediente se incorporan
cuando haya correlación verificada. El webhook no transporta contraseñas.

El productor conserva la identidad y los datos de la ocurrencia en sus
reintentos. No sustituye el cuerpo por una lectura posterior del trato. La
autenticación del POST y la conservación durable de esa evidencia deben quedar
definidas en el contrato; despertar una lectura del estado actual es insuficiente.

Si el trato se gana y vuelve a abierto antes de entregar el evento, la entrada
a ganado sigue siendo evidencia válida del alta. La reapertura se procesa
según una política comercial separada; no invalida silenciosamente el evento
ni borra pagos, cuenta o expediente. La política de suspensión sigue pendiente.

**No se exige reconstruir todas las etapas ni un ordinal global de Zoho para
capturar esta entrada a ganado.** Sí se exige identificar y conservar la
ocurrencia, acreditar su origen y evitar repetir sus efectos. Un contador de
recepción o `Modified_Time` no debe presentarse como historial de transiciones.

Zoho documenta disparadores por modificación de campos y acciones inmediatas
de workflow, incluidos webhooks; éstos admiten POST. Es una base para proponer
la automatización, no prueba de la configuración ni de la fiabilidad del envío
en nuestra organización. Hay que comprobar el comportamiento real de triggers,
reintentos y recuperación antes de activarlo.
([Workflows Zoho](https://help.zoho.com/portal/en/kb/crm/automate-business-processes/workflows/articles/configuring-workflow-rules),
[Webhooks Zoho](https://help.zoho.com/portal/en/kb/crm/automate-business-processes/actions/articles/webhooks-workflow)).

## 4. Correlación y deduplicación propuestas

Portal es autoridad de la cuenta compartida y de sus permisos. Un vínculo
verificado cuenta/contacto/trato tiene prioridad sobre coincidencias de email
o teléfono. Esas coincidencias ayudan a localizar candidatos, pero no bastan
para otorgar historial privado o unir cuentas. Un conflicto queda pendiente de
verificación; tampoco se crea una cuenta duplicada para eludirlo.

Se deduplican tanto la entrega del evento como el alta del mismo negocio. Un
reintento, otro aviso del mismo ganado o una nueva entrada a ganado del mismo
trato no regeneran credenciales ni repiten la bienvenida. Una cuenta puede
tener varios tratos: deduplicar por cuenta no debe suprimir otro trámite legítimo.
La cardinalidad trato/servicio/expediente continúa pendiente de acuerdo R2.

El pago auténtico y ganado convergen en la misma correlación y alta, cualquiera
que llegue primero. Si el pago ya creó cuenta/expediente, ganado los reutiliza;
si ganado llegó primero, el pago se incorpora al mismo negocio. Se conservan
las confirmaciones legítimas de cobro. Ganado por sí solo no fabrica un
`payment.succeeded`, importe pagado ni referencia de proveedor.

## 5. Responsabilidades y pendientes para el contrato

| Responsable | Trabajo propuesto |
|---|---|
| CRM/Zoho | Configurar el disparo al entrar en ganado; confirmar campos, organización/entorno y todos los orígenes de cambio usados. Acreditar la ocurrencia y el comportamiento de entrega. |
| Portal | Ser propietario del adaptador, recepción durable, recuperación de fallos, deduplicación, cuenta/credenciales compartidas, expediente y reconciliación pago/CRM. La forma de preservar la ocurrencia debe acordarse con CRM. |
| LidIA | Mantener conversaciones previas y aceptar el vínculo CRM acreditado por Portal, sin exigir ganado para hablar. Ajustar O6 y su DTO para que el evento de alta no dependa de una instantánea posterior. |
| APP | Autenticarse con la cuenta Portal y mostrar los permisos resueltos por backend; no crear identidad CRM ni comunicar ganado por su cuenta. |

El receptor `/api/integrations/zoho/v1/events` sigue propuesto, no implementado.
El contrato debe cerrar autenticación efectiva Zoho→Portal, identidad de
ocurrencia, payload, ACK, reintentos y recuperación. Un webhook nativo no se
supone capaz de generar por sí solo la firma HMAC del contrato S2S. El adaptador
puede normalizar/firmar evidencia ya capturada, sin reemplazarla por un snapshot.
El webhook documental vigente no constituye el nuevo receptor de alta.

R3 queda resuelto **en su decisión de negocio** a favor del POST de entrada a
ganado. La entrega técnica del evento, R1/R2/R4/R5, agente 119 y aislamiento DEV
siguen pendientes. Esta precisión no autoriza implementación ni despliegue.

## 6. Criterios de aceptación para pruebas futuras

- Cuenta previa para conversar y nuevo cliente sin cuenta: misma identidad
  Portal/APP, sin segunda cuenta ni reinicio de credenciales existentes.
- Ganado→abierto antes de entregar: se conserva y procesa la entrada a ganado;
  una edición de otro campo estando ya ganado no origina una nueva alta.
- Entregas duplicadas, reintentos, reentrada a ganado y caídas: un alta y una
  bienvenida por negocio, recuperación durable sin regenerar contraseñas.
- Pago antes/después/concurrente con ganado: mismo expediente aplicable y
  evidencia económica real, sin altas duplicadas.
- Vínculo ambiguo, contacto convertido o varias ventas del mismo cliente:
  pendientes recuperables, pertenencia verificada y servicios diferenciados.
- Verificar en DEV los cambios manuales, por API y por automatizaciones que
  negocio utilice; comprobar trigger, payload original y recuperación de fallo.

Estas pruebas no se han ejecutado; sólo se han revisado los documentos.

## 7. Mensaje para trasladar al equipo LidIA

> Aclaración de negocio para corregir O6: Zoho debe enviarnos un POST cuando
> el trato entra en Cerrado ganado. Ese evento dispara el alta o vinculación
> de la cuenta y el trámite, con las mismas credenciales para Portal y APP.
> La app puede utilizarse antes para hablar: si ya existe cuenta/conversación,
> cruzamos los datos y conservamos el acceso y el historial. Una instantánea
> posterior del trato no sustituye ese evento, aunque ayude a reconciliar.
> Necesitamos ajustar el contrato del evento y coordinar con CRM su disparo,
> autenticación, identidad estable y recuperación de fallos; pago y ganado
> deben converger sin duplicar cuentas, trámites o bienvenidas. Sigue siendo
> revisión documental, sin autorización de implementación o activación.
