# Propuesta: acceso Portal/APP al convertir el lead en contacto y trato

**Fecha:** 05/10/2026. **Estado:** propuesta solicitada por el usuario para
revisión con CRM y LidIA. No es una regla activada ni autoriza implementación.
[Glosario](../../GLOSARIO.md) · [Integración APP/LidIA](INTEGRACION-LIDIA.md).

## Objetivo

Proponer que, al convertir el lead en contacto y crear el trato en Zoho,
se solicite el correo electrónico, se genere o vincule el acceso compartido
Gestadia Portal/APP y se avise al usuario. Así puede entrar en la app para
hablar con LidIA o con comercial/gestor antes de que el trato sea ganado.

Esta opción amplía los momentos en que puede existir la cuenta. Mantiene la
[decisión de recibir el POST de Cerrado ganado](../integraciones/2026-10-05-decision-negocio-zoho-ganado-y-acceso.md):
ese evento sigue disparando la habilitación comercial del trámite y el cruce
con la cuenta previa. Si no se creó antes una cuenta, ganado conserva el
flujo de generación de acceso.

## Recorrido propuesto

1. Antes de completar el acceso, pedir el correo electrónico al usuario;
   si ya se tiene, solicitar su confirmación para utilizarlo en el acceso.
2. Con la conversión confirmada y las referencias de contacto y trato
   acreditadas, CRM comunica la conversión a Portal. El contrato del evento
   se acordará con CRM/LidIA; no se reserva ahora un nombre o endpoint nuevo.
3. Portal localiza la cuenta existente y verifica su relación con el contacto,
   o crea el acceso compartido si falta. Email y teléfono permiten localizar
   candidatos, pero una coincidencia no acredita por sí sola la pertenencia.
4. Avisar al usuario de que tiene acceso y enviar al correo las instrucciones
   para entrar en Portal y app. Portal gestiona las credenciales; ambos
   productos utilizan la misma cuenta.
5. Si ya tenía cuenta, conservar contraseña e historial y vincular el trato.
   No generar otra cuenta ni repetir la bienvenida por un reintento.
6. Al recibir después el POST de Cerrado ganado, cruzar contacto, trato,
   cuenta, conversación y expediente, y habilitar el trámite correspondiente.

## Separación de acceso y condición de cliente

| Momento | Resultado propuesto |
|---|---|
| Conversión a contacto y trato | Cuenta y acceso para conversar; aviso e instrucciones de entrada. No acredita pago ni habilita el trámite como cliente. |
| Entrada del trato a Cerrado ganado | Alta comercial y acceso al trámite sobre la misma cuenta; creación del acceso si aún faltaba. |

Un expediente preparatorio, si el diseño lo requiere, no otorga por sí solo
permisos de cliente. El pago auténtico continúa reconciliándose con el mismo
negocio, evitando duplicar cuentas, expedientes y avisos de alta.

## Casos que deberá cubrir el diseño

- Sin correo confirmado o sin trato creado: solicitar el dato o completar
  la conversión; no dar el acceso por generado ni perder el seguimiento.
- Cuenta previa desde APP o Portal: reutilizarla y conservar sus credenciales.
- Conversión repetida, reintentos o varios tratos del mismo contacto:
  un acceso por cuenta, con relaciones comerciales diferenciadas.
- Ganado recibido antes o durante la conversión: reconciliar ambos hechos
  sin crear dos cuentas ni regenerar el acceso.
- Fallo al enviar el aviso: conservar la cuenta creada y recuperar el envío,
  sin volver a crear el usuario.

## Revisión pendiente y mensaje para el equipo

CRM debe confirmar dónde se solicita el correo y qué señal acredita la
conversión con contacto y trato. Portal definirá la creación/vinculación de
cuenta y la entrega del aviso. LidIA conservará la conversación y recibirá
el vínculo validado para el acceso de atención previo a ganado. Falta acordar
el contrato del evento y el proceso de credenciales; no hay cambios de runtime.

> Proponemos una opción adicional: al convertir el lead en contacto y trato,
> pedir o confirmar el correo, crear o reutilizar el acceso compartido
> Portal/APP y avisar al usuario con sus instrucciones de entrada. Podría
> conversar desde ese momento. Al llegar después el POST de Cerrado ganado,
> vincularíamos y habilitaríamos el trámite sobre esa misma cuenta, conservando
> credenciales e historial. Queremos revisar esta opción con CRM/LidIA;
> no sustituye el evento de ganado ni está activada.
