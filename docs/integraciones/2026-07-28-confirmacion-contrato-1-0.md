# Confirmación de Gestadia Portal — Contrato 1.0 CERRADO

**Fecha:** 2026-07-28
**Referencia:** Contrato de integración LidIA - Gestadia Portal, versión 1.0
(`docs/integraciones/2026-07-28-contrato-lidia-portal-v1-0.md`)

Hola equipo,

Contrato revisado. **Confirmamos los cuatro puntos solicitados** en el
apartado 16 — con esto damos el **contrato 1.0 por cerrado** y ambos equipos
podemos implementar contra él:

1. **Confirmado** — `lidia_payment_id` estable para el ciclo lógico de pago.
2. **Confirmado** — `lidia_payment_attempt_id` nuevo por cada enlace/intento.
3. **Confirmado** — `replaces_checkout_intent_id` opcional en una
   regeneración. Cuando lo recibamos, marcaremos el intent sustituido como
   `cancelled` (sin emitir evento: la regeneración la iniciáis vosotros, y así
   un callback atrasado del intento anterior nunca pisa al activo).
4. **Confirmado** — firma HMAC canónica del apartado 8.2:
   `hex(HMAC-SHA256(secret, timestamp + "." + raw_body))` sobre el cuerpo
   exacto, con `X-Gestadia-Key-Id`, timestamp Unix en segundos y tolerancia de
   5 minutos.

Aceptamos igualmente el resto de precisiones del contrato: formato de errores
con `trace_id`, `idempotency_conflict` cuando la misma clave llegue con payload
distinto, `zoho_reference_invalid`, la ruta plural
`GET /api/integrations/lidia/checkout-intents/{id}`, los estados
`active | opened | paid | expired | cancelled`, el tratamiento de vuestras
respuestas al callback (reintento solo en `429`/`5xx`/fallo de red; `400`/`401`
a revisión manual; `409` a reconciliación) y el rate limit inicial de
60 req/min por entorno.

## Notas de implementación (sin impacto en el contrato — no requieren acción)

- **`pais_canje` ISO 3166-1 alfa-2:** Portal lo mapea internamente a las claves
  de su catálogo (`CO` → `colombia`, `GB` → `reino-unido`, etc.). Si un código
  no corresponde a un país canjeable, el checkout simplemente no prellenará el
  país y el cliente lo seleccionará a mano.
- **`prefill.direccion` como texto libre:** en 1.0 la aceptamos con carácter
  informativo, pero no prellena el formulario (nuestra dirección de envío es
  estructurada: vía, número, CP, municipio, provincia). Si más adelante podéis
  mandarla estructurada, la añadimos como campo opcional compatible en 1.x.
- **`tipo_documento` `PASAPORTE`/`OTRO`:** mapeo interno (`PASAPORTE` →
  `Pasaporte`; `OTRO` → sin prellenar, el cliente elige).

## Siguiente paso

Portal arranca ya la implementación contra el contrato 1.0. Cuando tengáis
fecha, cerramos los intercambios del apartado 15 (URLs, credenciales por
entorno, Contacto/Oportunidad de prueba) y la ventana de pruebas conjuntas de
la matriz del apartado 14.

— Equipo Portal Gestadia
