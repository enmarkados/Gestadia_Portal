# Respuesta de Gestadia Portal — endpoint de catálogo y credenciales

**Fecha:** 2026-07-28
**Referencia:** vuestro mensaje "petición de endpoint de catálogo"

Hola equipo,

## 1. Endpoint de catálogo: aceptado e implementado

Buen argumento — el fallo silencioso que describís es real y la sincronización
automática lo elimina. Ya está implementado:

```http
GET /api/integrations/lidia/catalog
X-Api-Key: <la misma api key del checkout-intent>
```

Respuesta:

```json
{
  "schema_version": "1.0",
  "products": [
    { "service": "canje-carnet", "catalog_code": "canje_1_categoria",
      "amount_minor": 21000, "currency": "EUR", "active": true },
    { "service": "canje-carnet", "catalog_code": "canje_2_categorias",
      "amount_minor": null, "currency": "EUR", "active": false }
  ]
}
```

Notas:

- Los productos **inactivos aparecen con `active: false` y `amount_minor:
  null`** (es el caso de `canje_2_categorias` hasta que negocio publique su
  precio). Un producto inactivo responde `409 catalog_code_no_disponible` en
  el checkout, así que podéis usar `active` como interruptor.
- El precio sale de la **misma fuente única** que valida el checkout
  (catálogo de servicios del Portal): es imposible que este GET y el `409
  importe_no_coincide` discrepen entre sí.
- Cambios aditivos (productos o campos nuevos) serán compatibles 1.x, como el
  resto del contrato.

## 2. Lo bloqueante: URL base y API key

- **URL base — entorno único:** no vamos a tener staging separado; la prueba
  conjunta se hace contra el entorno real:

  ```
  https://gestadia.com
  ```

  (Callback path de referencia: `POST https://gestadia.com/api/integrations/lidia/checkout-intent`,
  catálogo en `/api/integrations/lidia/catalog`, reconciliación en
  `/api/integrations/lidia/checkout-intents/{id}`.)

- **API key:** generada; **os llega por el canal seguro, no por este
  documento**. Es una sola (entorno único) y sirve para los tres endpoints.

- **Importante — ventana de despliegue:** el código de la integración está
  terminado y fusionado, pero **aún no desplegado** en gestadia.com. Hasta
  que despleguemos (os avisaremos con fecha), las llamadas reales devolverán
  404/401. Podéis dejar todo listo contra el contrato; el humo de arranque
  será: `GET /api/integrations/lidia/catalog` con la api key → `200` con el
  producto activo.

- Seguimos esperando de vuestro lado: URL de vuestro callback, secreto HMAC +
  `key_id`, y fecha para la ventana de pruebas.

— Equipo Portal Gestadia
