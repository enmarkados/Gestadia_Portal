# Respuesta de Gestadia Portal — cambio de entorno de LidIA

**Fecha:** 2026-07-29
**Referencia:** vuestro "Cambio de entorno de LidIA — nueva URL de callback y credenciales"
**Contrato:** 1.0 sin cambios (solo cambia el destino de los callbacks)
**Nota interna:** las credenciales van por canal seguro, NO en este documento.

---

Hola equipo,

Recibido. Os respondemos a los cuatro puntos, y añadimos una comprobación que
hemos hecho antes de tocar nada.

## 1. Estado actual de los dos endpoints (comprobado ahora mismo)

Antes de conmutar hemos sondeado ambas URLs:

| Endpoint | Respuesta | Lectura |
|---|---|---|
| `https://lidia.devvozenter.com/api/…/payment-events` (actual) | `401` | Vivo y funcionando: rechaza correctamente una petición sin firma |
| `https://dev-lidia.gestadia.com/api/…/payment-events` (nuevo) | `404` | El dominio resuelve, pero **la ruta todavía no está montada** |

Por eso **no hemos conmutado aún**: si apuntáramos ahora, los eventos irían
contra un `404` y quedarían reintentando con backoff. Como vuestro entorno
anterior sigue operativo, no hay ventana ciega ni riesgo de pérdida (nuestra
cola está además vacía: los 11 eventos emitidos hasta hoy están entregados).

**Avisadnos en cuanto vuestra ruta nueva responda `401`** a una petición sin
firma —esa es la señal de que está lista— y conmutamos en menos de un minuto.

## 2. Credenciales del entorno nuevo

Os las enviamos por el canal seguro habitual, no aquí:

- **API key** (LidIA → Portal, cabecera `X-Api-Key`): nueva y exclusiva de
  este entorno, como manda el §12. La anterior seguirá activa hasta que
  confirméis el corte, para no dejaros sin servicio a mitad de migración.
- **Secreto HMAC** (Portal → LidIA): os proponemos uno generado por nosotros
  para agilizar. Si preferís mantener el reparto anterior y generarlo
  vosotros, decidlo y usamos el vuestro — nos da igual quién lo genere
  mientras viaje por canal seguro y sea distinto por entorno.
- **`X-Gestadia-Key-Id`:** mantenemos `v1`.

## 3. Base de nuestra API: seguid apuntando a `https://gestadia.com`

Y aquí va un matiz importante, porque la simetría de nombres puede inducir a
error: **el Portal no tiene entorno de desarrollo separado**. `gestadia.com`
es nuestro **único** entorno y es **producción real**.

Implicaciones de que vuestro entorno de desarrollo apunte ahí:

- Los checkouts que creéis generan **expedientes reales** en nuestra base de
  datos y escriben en el **Zoho real** del cliente.
- Si nuestro servidor está en modo producción, **los pagos cobran de verdad**.
  Para vuestras pruebas abrimos una ventana en modo test de Stripe (tarjeta
  `4242…`, sin cargo) — pero es una ventana global: mientras está abierta,
  **ningún cliente real puede pagar**. De ahí que convenga concentrarlas y
  avisar al terminar, como bien decís.

Si en algún momento necesitáis un entorno nuestro aislado de verdad, decídnoslo
y lo valoramos; hoy no existe.

## 4. Lista blanca por IP: no aplica

No filtramos por IP ni por origen. El control de acceso a
`/api/integrations/lidia/*` es **solo la API key**, más un rate limit de 60
peticiones por minuto. No tenéis que darnos de alta ninguna IP: en cuanto
tengáis la clave nueva, podéis llamar desde donde sea.

## 5. Plan de verificación

Nos parece bien el vuestro y lo ordenamos así:

1. Vosotros confirmáis que la ruta nueva responde `401`.
2. Nosotros conmutamos `LIDIA_CALLBACK_BASE_URL` + secreto y reiniciamos.
3. **`checkout.opened`**: creáis un checkout desde vuestro entorno nuevo y lo
   abrís. Valida ruta, firma y credenciales de una sola vez.
4. **`payment.succeeded`**: sobre un checkout creado por vosotros —nunca
   sintético por nuestra parte, según lo acordado tras la matriz— y pagado en
   ventana de modo test. Vosotros verificáis correlación; nosotros, el
   resultado económico en Zoho.

Entendido y anotado que el aviso final por WhatsApp no se puede probar aún en
este entorno (número no operativo) y que la rama de fuera de ventana sigue
pendiente de Meta. Coincidimos: no lo damos por probado hasta ejecutarlo de
verdad. En el acta de la matriz el caso 20 queda como **probado el 2026-07-29
en el entorno anterior**, pendiente de revalidar aquí cuando el número esté
operativo.

Un saludo,
— Equipo Portal Gestadia
