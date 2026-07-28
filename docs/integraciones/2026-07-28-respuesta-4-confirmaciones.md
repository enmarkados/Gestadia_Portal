# Respuesta de Gestadia Portal — 4 confirmaciones técnicas + modo de pago de la ventana

**Fecha:** 2026-07-28
**Referencia:** vuestro "acuse de recibo, secreto HMAC, callback, registros de
prueba y 4 confirmaciones"
**Nota interna:** el secreto HMAC recibido NO se comitea; está configurado en
`backend/.env` local (`LIDIA_CALLBACK_*`) y hay que copiarlo al `.env` del
servidor en el deploy.

---

Hola equipo,

Recibido todo: URL de callback, secreto HMAC + `key_id` (configurados ya en
nuestro emisor) y vuestros registros de Zoho de prueba — perfectos, usaremos
esos cinco pares y el número del piloto (`+34684469182`); gracias por
dárnoslos convertidos por el flujo real del agente.

## Las cuatro confirmaciones

**a) Prefijo de la firma: SÍ va con prefijo.** Enviamos
`X-Gestadia-Signature: <key_id>=<64 hex minúsculas>`, donde `<key_id>` es
siempre exactamente el mismo valor que la cabecera `X-Gestadia-Key-Id` (hoy
`v1`, es decir `v1=…`). El ejemplo del §8.1 es el formato bueno; el §8.2
describe solo el cálculo del hex. Vuestro verificador tolerante ya lo cubre,
pero la forma canónica que emitimos es **con** prefijo.

**b) `reason_code` nulo: indistinto para nosotros — recomendamos omitirlo.**
Persistimos `extra` tal cual llega, sin validar su contenido, así que ambas
formas funcionan. Por coherencia con el resto de opcionales, omitidlo cuando
sea nulo. Único matiz operativo: dentro de un **mismo intento** (misma
`idempotency_key`) el payload debe ser idéntico en los reintentos — si un
reintento añade o quita el campo, saltará `409 idempotency_conflict`. Sea
cual sea la convención, mantenedla estable por intento.

**c) Referencia de pago: teníais razón, era un hueco — corregido.** El evento
`payment.succeeded` incluye desde ya el campo **`payment_ref`** (cambio
aditivo, compatible 1.x): es exactamente la misma referencia que escribimos
en `Ref_pago` de la Oportunidad (el `payment_intent` de Stripe). Ejemplo
actualizado del §8.4:

```json
{
  "event_type": "payment.succeeded",
  "…": "…",
  "amount_minor": 21000,
  "currency": "EUR",
  "payment_method": "bizum",
  "payment_ref": "pi_3PqK8w2eZvKYlo2C1lF9dR7M",
  "datos_confirmados": { "…": "…" },
  "correcciones": []
}
```

**d) `lidia_payment_attempt_id`: confirmado, verbatim.** El valor que
devolvemos — en las respuestas del API y en **todos** los eventos de callback
— es exactamente el que nos enviasteis en el `POST`, sin generarlo ni
transformarlo nunca de nuestro lado. Podéis correlacionarlo con seguridad.

## Sobre los pagos de la ventana

El entorno tiene tráfico real, así que **no** lo pondremos globalmente en modo
test. Para los casos que cobran (8, 9 y 18 de la matriz) haremos **cobro real
con tarjeta nuestra y reembolso inmediato** desde Stripe — las anulaciones
corren de nuestra parte, no os preocupéis por ellas. El resto de la matriz no
genera cargos.

## Estado

Solo nos queda el despliegue. Os avisamos en cuanto esté y lanzáis el humo:
`GET https://gestadia.com/api/integrations/lidia/catalog` con la api key →
`200` con `canje_1_categoria` activo. Con vuestra fecha para la ventana,
cerramos.

— Equipo Portal Gestadia

---

## Anexo interno — registros de prueba de LidIA (para la ventana)

| Teléfono | zoho_contact_id | zoho_deal_id |
|---|---|---|
| +34655555591 | 588164000139685598 | 588164000139685599 |
| +34655555592 | 588164000139676559 | 588164000139676560 |
| +34655555593 | 588164000139658548 | 588164000139658549 |
| +34655555594 | 588164000139614562 | 588164000139614563 |
| +34655555595 | 588164000139615586 | 588164000139615587 |

Marcador `TEST AGENTE V2` en el nombre; Tratos en «En Negociación». Número
WhatsApp del piloto: `+34684469182` (dev Vozenter, proyecto GestadIA v2;
habrá otro número para el definitivo — avisarán).
