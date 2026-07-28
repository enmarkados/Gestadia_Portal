# Acta — Matriz de pruebas §14 del contrato 1.0 LidIA-Portal

**Fecha de ejecución:** 2026-07-29 (ventana acordada "ya" por ambos equipos)
**Entorno:** producción única (`https://gestadia.com` ↔ `https://lidia.devvozenter.com`)
**Datos:** pares de prueba Zoho de LidIA (`TEST AGENTE V2`); sesión de matriz `matriz-2026-07-29`.

## Parte 1 — Casos ejecutados por API (Portal): 13/13 PASS

| Caso §14 | Prueba | Resultado | Evidencia |
|---|---|---|---|
| 1 | Creación válida | ✅ PASS | `201` → `gci_25lyklGKHyWH2a_l` (par 592) |
| 2 | Misma `idempotency_key` + mismo payload | ✅ PASS | `200`, `reused: true`, mismo `checkout_intent_id` |
| 3 | Misma clave + payload distinto | ✅ PASS | `409 idempotency_conflict` |
| 4 | `canje_2_categorias` | ✅ PASS | `409 catalog_code_no_disponible` |
| 5 | Importe incorrecto (20000) | ✅ PASS | `409 importe_no_coincide`, `amount_minor_catalogo: 21000` |
| 6* | Referencias Zoho inutilizables | ✅ PASS | `409 zoho_reference_invalid` (id no numérico) |
| 7 | Apertura del enlace | ✅ PASS | `200` con prefill mapeado (`CO→colombia`), sin ids internos; `checkout.opened` `evt_UJTNINGtwdHFHSNf` entregado **HTTP 200** |
| 11 | Callback con firma inválida | ✅ PASS | LidIA respondió `401` |
| 12 | Callback con timestamp fuera de ventana (-10 min, firma válida) | ✅ PASS | LidIA respondió `401` |
| 13 | Callback atrasado de intento sustituido — precondición | ✅ PASS | ver caso 15: el sustituido queda `cancelled`, sin evento |
| 14 | Caducidad sin regeneración automática | ✅ PASS | smoke forzado a vencer → worker lo marcó `expired`; `checkout.expired` `evt_TEfztqwQGiI41y_P` entregado **HTTP 200**; nada lo regeneró |
| 15 | Regeneración con `replaces_checkout_intent_id` | ✅ PASS | nuevo `201` (`gci_RtF0zrcQm8nKnAIH`, mismo `lidia_payment_id`), anterior → `cancelled` |
| 19 | Reconciliación por `GET` | ✅ PASS | `opened` tras apertura (19a) y `expired` tras caducidad (19b) |

\* Caso 6 en su vertiente Portal (validación de formato); la vertiente LidIA
(bloquear checkout si faltan IDs verificados) la cubren ellos.

**Además, verificado en ambos ledgers (2026-07-28/29):** el primer
`checkout.opened` real (`evt_u-hkXVozV42zF8VX`) entregado firmado tras la
rotación del secreto y procesado por LidIA (su intent pasó a Opened).

## Parte 2 — Casos que requieren pago (PREPARADOS, pendientes de ejecutar juntos)

**Enlace activo listo para la fase de pago:**

```
Intent:  gci_RtF0zrcQm8nKnAIH   (par Zoho 592: contacto …6559 / trato …6560)
Enlace:  https://gestadia.com/c/dJwSYomsgDSyo7laIl05UF5L
Caduca:  2026-08-05
```

**Guion del pago (lo ejecuta una persona con tarjeta — Gonzalo):**

1. Abrir el enlace → comprobar visualmente el banner ámbar de verificación y
   el prellenado (nombre "Matriz", apellidos "Prueba Portal").
2. **Corregir datos en el formulario** (esto ejecuta el caso 16): cambiar
   nombre/apellidos por unos reales de prueba y **poner un email tuyo real**
   (para recibir el email de bienvenida). Cambiar también el teléfono
   (caso 17: el Mobile de Zoho NO debe cambiar).
3. Completar país/dirección, aceptar condiciones y pagar (caso 8, tarjeta).
   Nota: si la pasarela acepta `4242 4242 4242 4242` es que el server está en
   modo test (sin cobro real); si la rechaza, es live → tarjeta real y
   reembolso inmediato después desde el dashboard de Stripe.
4. Confirmar que aterriza en la página de gracias con nº de pedido.

**Verificación post-pago (la ejecuta Claude, ya preparada):**

- Intent `paid` + expediente con `procedencia: lidia` y nº de pedido.
- `payment.succeeded` entregado con `payment_ref`, `datos_confirmados` y
  `correcciones` (deben listar nombre/apellidos/email/teléfono cambiados).
- Trato Zoho `…6560`: `Stage = Cerrado ganado` + campos económicos escritos
  **exactamente una vez** (caso 18), `Lead_Source` intacto; Contacto `…6559`
  actualizado solo por allowlist y **`Mobile` intacto** (caso 17).
- Caso 10 (callback duplicado): replay manual del `payment.succeeded`
  (`node scripts/lidia-replay.mjs <event_id>`) → LidIA debe responder `2xx`
  sin repetir efectos (confirman ellos).
- Reconciliación `GET` → `paid` con `n_pedido`, `payment_method`, `paid_at`.

**Caso 9 (Bizum):** opcional — si está habilitado, repetir el guion con un
intent nuevo sobre el par 593 (se genera al momento).

**Caso 20:** PARCIAL según lo acordado — dentro de ventana OK; fuera de
ventana pendiente de la plantilla de Meta de LidIA. Se cerrará con prueba
puntual sin repetir la matriz.

## Estado

- Parte 1: **cerrada, 13/13**.
- Parte 2: preparada; falta ejecutar el pago y la verificación post-pago.
- Intents residuales de pruebas: los `diag-*`/`matriz-*` no pagados caducarán
  solos (2026-08-04/05) y sus `checkout.expired` se descartan por ambas
  partes, como acordado.
