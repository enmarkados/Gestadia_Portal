# Respuesta de Gestadia Portal — catálogo implementado + datos de acceso + lo que necesitamos

**Fecha:** 2026-07-28 (v2 — URL definitiva y petición de datos completa)
**Referencia:** vuestro mensaje "petición de endpoint de catálogo"
**Nota interna:** al enviar, sustituir `<API_KEY>` por la clave real (está en
el `backend/.env` local, `LIDIA_API_KEY`). La clave NUNCA se comitea a este
repositorio.

---

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

- Los productos inactivos aparecen con `active: false` y `amount_minor: null`
  — podéis usar `active` como interruptor: un producto inactivo responde
  `409 catalog_code_no_disponible` en el checkout.
- El precio sale de la **misma fuente única** que valida el checkout: este
  GET y el `409 importe_no_coincide` no pueden discrepar entre sí.
- Cambios aditivos (productos o campos nuevos) serán compatibles 1.x.

## 2. Los datos que pedíais

- **URL base — entorno único** (no habrá staging separado; la prueba conjunta
  se hace contra el entorno real):

  ```
  https://gestadia.com
  ```

  Endpoints: `POST /api/integrations/lidia/checkout-intent` ·
  `GET /api/integrations/lidia/catalog` ·
  `GET /api/integrations/lidia/checkout-intents/{id}`.

  ⚠️ Si tenéis apuntado `portal.gestadia.com` de algún intercambio anterior,
  descartadlo: ese dominio **nunca ha existido**, era un error nuestro
  arrastrado y ya está corregido en nuestra documentación.

- **API key** (única; sirve para los tres endpoints):

  ```
  <API_KEY>
  ```

## 3. Importante — ventana de despliegue

El código de la integración está terminado, probado y fusionado, pero **aún no
desplegado** en gestadia.com: hasta que despleguemos (os avisaremos con
fecha), las llamadas reales devolverán 404/401. Podéis dejar todo listo
contra el contrato; vuestro humo de arranque cuando os digamos "desplegado":

```
GET https://gestadia.com/api/integrations/lidia/catalog  (con api key)
→ 200 con canje_1_categoria activo
```

## 4. Lo que necesitamos de vosotros (con esto quedamos completos para activar)

1. **URL base de vuestro callback** — nosotros añadimos la ruta fija del
   contrato (`/api/integrations/gestadia-portal/payment-events`), así que
   pasadnos solo la base, p. ej. `https://api.lidia.example`. Es lo que
   configuraremos en nuestro emisor de eventos.
2. **Secreto HMAC + `key_id`** (generáis vosotros, como acordamos): secreto
   de al menos 32 bytes (hex o base64) y el `key_id` que enviaremos en
   `X-Gestadia-Key-Id` (p. ej. `v1`). Por este mismo canal.
3. **El número de WhatsApp de pruebas** (E.164) que usará vuestro agente en
   el piloto: lo necesitamos para crear el Contacto de prueba en Zoho con ese
   `Mobile` y la Oportunidad colgando de él, y devolveros ambos IDs
   (`zoho_contact_id` / `zoho_deal_id`) antes de la ventana.
4. **Fecha propuesta para la ventana de pruebas** de la matriz §14 y quién
   estará al otro lado durante la ventana (para resolver en vivo firmas,
   reintentos y reconciliación).
5. **Acuse de recibo de la API key** y confirmación de que vuestra tool
   apunta ya a `https://gestadia.com` (y no a ningún dominio anterior).

Con vuestros puntos 1-2 configuramos las variables del servidor y
desplegamos; os avisamos con el humo del catálogo en verde, y en la fecha del
punto 4 ejecutamos la matriz completa (con el caso 20 parcial, como quedó
acordado).

— Equipo Portal Gestadia
