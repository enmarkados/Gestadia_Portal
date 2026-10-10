# Responsabilidades de integración de Gestadia APP

**Actualizado:** 10/10/2026. Reparto confirmado el 05/10; ampliación de acceso anónimo solicitada el 10/10, en revisión.
[Glosario](../../GLOSARIO.md) · [Integración conversacional](INTEGRACION-LIDIA.md).

## Reparto confirmado

| Responsable | Función en estos flujos |
|---|---|
| Zoho / responsable de sus flujos | Detectar los hechos CRM y postear sus datos directamente a la API del backend Portal. Configurar los disparadores y el envío desde Zoho. |
| Backend Gestadia Portal/APP | Definir y recibir los POST; validar y correlacionar los datos, crear o reutilizar la cuenta, gestionar credenciales y avisos, y habilitar los trámites que correspondan. |
| LidIA | Gestionar las conversaciones del sondeo y de atención comercial/gestor. Integrar las conversaciones con la identidad y el contexto que le facilite el backend. |
| APP | Acceder con la cuenta compartida y consumir la API del backend para conversaciones y trámites. |

Dos recorridos distintos:

- **Datos CRM:** Zoho → API Portal → cuenta y trámite.
- **Conversaciones:** APP → API Portal → LidIA → conversación IA/humana.

LidIA no tiene asignada la administración de Zoho ni la producción de los POST
de alta. La configuración de esos flujos y el contrato de sus datos se trabajan
entre el backend Gestadia y el responsable de Zoho.

## Aplicación a las dos propuestas de acceso

- **Cerrado ganado, requisito confirmado:** un flujo Zoho envía el POST al
  cambiar el trato a esa etapa. El backend crea o reutiliza el acceso y
  habilita el trámite sobre la cuenta correspondiente.
- **Conversión a contacto y trato, propuesta para revisar:** un flujo Zoho
  podría enviar los datos de esa conversión y el correo solicitado/confirmado
  para anticipar el acceso. El backend genera o vincula la cuenta y avisa al
  usuario. Ganado conserva después su evento para habilitar el trámite.

LidIA puede necesitar el vínculo de cuenta para conservar o recuperar la
conversación, pero no decide ni configura el disparador Zoho de estos hechos.
Ambos recorridos reutilizan la misma cuenta Portal/APP y sus credenciales.

## A quién corresponde cada coordinación

**Con el responsable de Zoho:** acordar qué flujo postea en ganado y, si se
aprueba el acceso anticipado, en la conversión a contacto/trato; qué datos
envía, cómo se autentica y cómo se recuperan los fallos. El backend proporciona
el contrato y el receptor API correspondiente.

**Con el equipo LidIA:** acordar la API conversacional de la APP, el sondeo,
la atención humana y la asociación de conversaciones con la cuenta validada.

Esta aclaración corrige la atribución a LidIA de coordinar o controlar los
flujos Zoho en los mensajes anteriores. Los documentos fechados de
[ganado](../integraciones/2026-10-05-decision-negocio-zoho-ganado-y-acceso.md) y
[acceso anticipado](2026-10-05-propuesta-acceso-conversion-crm.md) conservan su
histórico; esta página fija el reparto vigente de responsabilidades.
El contrato conversacional está aceptado y Portal ha implementado su [API desactivada y pruebas locales](../integraciones/2026-10-05-entrega-portal-conversaciones-app.md). Zoho→Portal sigue en preparación, sin receptor/disparadores nuevos ni flujos activados.

## Ampliación APP sin cuenta — requisito 10/10, contrato pendiente

El usuario permite conversar con LidIA sin registro, también desde un deeplink, recogiendo nombre y teléfono y/o email. Si se llega a agenda, se ofrece el registro y se vincula la misma conversación al acceso verificado. El sondeo anónimo es exclusivo APP; no concede atención de gestor, identidad de cliente ni acceso a expedientes.

Portal asume identidad previa a cuenta, registro/verificación y operación de vinculación; LidIA asume el sondeo, el punto de suspensión de agenda y la conservación de la sesión/estado durante esa vinculación. APP presenta el acceso sin login y conserva el retorno. El reparto concreto y el contrato S2S se están revisando con LidIA en la [propuesta del 10/10](../integraciones/2026-10-10-propuesta-app-anonima-lidia.md). La cuenta resultante es compartida APP/Portal, sin cambiar quién produce los eventos Zoho ni los requisitos comerciales para habilitar trámites.
