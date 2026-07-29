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

## Parte 2 — EJECUTADA el 2026-07-29 (ventana Stripe TEST): todos PASS

Método: swap temporal del servidor a claves Stripe de test (backup previo del
`.env` real, git-ignored), webhook de test creado hacia
`gestadia.com/webhooks/stripe` (`we_1TyKa8F1ccj1C5JbnopPwZt3` — se conserva
para futuras ventanas), pago ejecutado con Playwright (tarjeta `4242`,
casilla de agente IA de Stripe marcada), y **claves reales restauradas y
verificadas** al terminar (health/catálogo 200, bloque `LIDIA_*` intacto).

| Caso §14 | Prueba | Resultado | Evidencia |
|---|---|---|---|
| 7 (visual) | Banner + prellenado + teléfono E.164 separado | ✅ PASS | Captura `stripe-checkout-estado.png`; Colombia preseleccionada |
| 8 | Pago con tarjeta (test) | ✅ PASS | Pedido `GST-202607-59327`, página de gracias; `pi_3TyKhQF1ccj1C5Jb0C3iKldA` |
| 10 | Callback duplicado sin repetir efectos | ✅ PASS | Replay de `evt_lKxTghgIGuqgfO2e` → reenviado (`intentos=2`) → LidIA `HTTP 200` |
| 16 | Correcciones permitidas | ✅ PASS | `correcciones`: nombre→Gonzalo, apellidos→Prueba Matriz, email→vozentercom@gmail.com, teléfono→+34655555600 (informativo) |
| 17 | Teléfono sin reasignación | ✅ PASS | Contacto Zoho `…6559`: datos corregidos por allowlist y **`Mobile: +34655555592` INTACTO** |
| 18 | Escritura económica exactamente una vez | ✅ PASS | Deal `…6560`: `Cerrado ganado`, `N_Pedido`, `Pago_Confirmado`, `Ref_pago` = `payment_ref`, **`Lead_Source "TEST AGENTE V2" intacto`**, 1 sola modificación |
| — | `payment.succeeded` completo | ✅ PASS | `evt_lKxTghgIGuqgfO2e` `HTTP 200` con `payment_ref`, `amount_minor 21000`, `datos_confirmados` y 4 `correcciones` |
| — | Flujo post-pago del portal | ✅ PASS | Expediente `documentacion_pendiente`, email de bienvenida a vozentercom@gmail.com, intent `paid` |

## Caso 9 (Bizum) — EJECUTADO, PASS con hallazgo corregido

Pago con Bizum en ventana test (par 594): autorización simulada → pedido
`GST-202607-44155`, expediente `documentacion_pendiente`, intent `paid`,
`payment.succeeded` `evt_3egejBOYeF0TC0dD` entregado **HTTP 200**. Circuito
completo ✅.

**Hallazgo (bug real detectado por esta prueba):** el método quedó registrado
como `card` en lugar de `bizum` — el webhook deducía el método de
`session.payment_method_types` (métodos *permitidos*), no del método
*realmente usado*. Impacto: `M_todos_de_pago` de Zoho y `payment_method` del
callback habrían dicho "Stripe/card" en todos los pagos por Bizum.
**Corregido** (`metodoDeSesion` lee `payment_intent.latest_charge.
payment_method_details.type`, con 4 tests) y desplegado. Pendiente de
re-verificar con el próximo pago Bizum (test o real).

## Mejora operativa asociada: `STRIPE_MODE`

Ya no hace falta intercambiar claves para probar: el `.env` (local y del
servidor) tiene los dos juegos (`STRIPE_*_DEV` y `STRIPE_*_PRO`) y
`STRIPE_MODE=dev|pro` elige cuál se usa. Servidor desplegado con
`STRIPE_MODE=pro`. Webhook de test hacia `gestadia.com/webhooks/stripe`
(`we_1TyKa8F1ccj1C5JbnopPwZt3`) permanente para futuras ventanas.

## Casos restantes
- **20 (comunicación post-pago):** requiere acción de LidIA — la parte
  *dentro de ventana* NO se puede validar con nuestros intents sintéticos
  (sus `lidia_session_id` no corresponden a conversaciones vivas, así que su
  agente correlaciona y archiva sin escribir a nadie). Hace falta que LidIA
  genere un enlace desde una **conversación real** en su número piloto
  (`+34684469182`) y lo paguemos en ventana test; entonces su agente debe
  enviar el mensaje de confirmación. La parte *fuera de ventana* sigue
  pendiente de su plantilla de Meta (parcial acordado).
- **Prueba live preparada (sin pagar):** intent `gci_L2WxaC8EyriLLZpR` sobre el
  par 593 → `https://gestadia.com/c/pNE58YMDAPTW3ArVqvIMKkL1` (caduca
  2026-08-04). Ejecutar hasta la pantalla de pago de Stripe LIVE y pagar solo
  cuando se decida (cobro real 210 € + reembolso).

## Estado

- Parte 1: **cerrada, 13/13**. Parte 2: **cerrada, 8/8**.
- Matriz completa salvo 9 (opcional) y 20 (parcial acordado).
- Intents residuales de pruebas: los `diag-*`/`matriz-*` no pagados caducarán
  solos (2026-08-04/05) y sus `checkout.expired` se descartan por ambas
  partes, como acordado.
