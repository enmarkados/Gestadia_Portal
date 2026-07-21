# Checkout en la ficha — Diseño

**Fecha:** 2026-07-21

## Objetivo

Quitar el paso de navegación a la página `/checkout`. El cliente rellena sus datos y paga **en la propia ficha del servicio**, dentro de la tarjeta del lateral (la que hoy muestra precio + botón "Contratar ahora"). Un paso menos = menos abandono.

## Estado actual

- Las **8 fichas** de servicio (`frontend/src/pages/servicios/*.jsx`) renderizan en el lateral (`ServiceLayout` → columna derecha) el componente `<ContratarCard slug servicio precio includes />`.
- **`ContratarCard.jsx`**: bloque de precio + lista "incluye" + botón **"Contratar ahora →"** (`<Link to="/checkout?servicio=slug">`) + enlace "¿dudas? WhatsApp".
- **`Checkout.jsx`** (ruta `/checkout?servicio=slug`): formulario completo. Carga el catálogo por API (`getServicios`), gestiona el estado del formulario, muestra país+dirección solo para Canje, prefijo de teléfono, checkbox de condiciones, y al enviar llama a `postCheckout` → `/api/checkout` → redirige a Stripe (`window.location.href`). Muestra el resumen de precio con `CheckoutCard`. Lee `?cancelado=1` para avisar de pago cancelado.
- Backend `POST /api/checkout` (`backend/src/routes/checkout.js`): `success_url` = `/gracias?pedido=…`; `cancel_url` = `/checkout?servicio=slug&cancelado=1`. **La lógica de pago no cambia.**

## Diseño

### 1. Extraer el formulario a un componente reutilizable `CheckoutForm`

Nuevo `frontend/src/pages/servicios/CheckoutForm.jsx`. Contiene **solo el formulario** (no el bloque de precio):

- **Prop:** `servicio` — objeto con `slug`, `requierePais` y `requiereDireccion` (esos 3 campos existen tanto en `SERVICIOS` de `shared/servicios.js` como en la respuesta de `/api/servicios`, así que el mismo componente sirve para los dos consumidores).
- **Contenido:** todo el estado y campos del formulario actual de `Checkout.jsx` (nombre, apellidos, email, teléfono con prefijo, tipo/nº documento, país + `datosPais` y dirección **solo si `requierePais`/`requiereDireccion`**, checkbox de condiciones), el estado de error, y el botón **"Pagar con tarjeta o Bizum"**.
- **Envío:** idéntico al actual → `postCheckout({ servicio: servicio.slug, ...persona, telefono: telefonoCompleto, ...extra })` → `window.location.href = toReactRoute(body.url)`.
- **Cancelación:** lee `?cancelado=1` de la URL y muestra el aviso "El pago se canceló. Puedes intentarlo de nuevo".

Como la ficha ya conoce el `servicio` (desde `SERVICIOS`), el componente **no necesita llamar a la API** para saber si pide país/dirección — lo recibe por prop. Es una **extracción** de la lógica que ya existe y funciona, no una reescritura (esto minimiza el riesgo en el pago).

### 2. `ContratarCard` pasa a llevar el formulario embebido

`ContratarCard.jsx` queda así (de arriba a abajo):
- Bloque de **precio** (servicio + precio + "IVA incluido") — igual que ahora.
- Lista "**incluye**" (Tasas DGT, etc.) — igual que ahora.
- **`<CheckoutForm servicio={S} />`** — el formulario + botón de pago. **Sustituye al botón "Contratar ahora".**
- Pie "**¿Tienes dudas? Escríbenos por WhatsApp**" — igual que ahora.

`ContratarCard` ya recibe `slug`; obtiene el objeto completo con `SERVICIOS[slug]` (importando `SERVICIOS`) y se lo pasa a `<CheckoutForm servicio={SERVICIOS[slug]} />`. **Las 8 fichas no cambian sus props.**

### 3. `Checkout.jsx` reutiliza `CheckoutForm`

La página `/checkout` **sigue existiendo** (fallback / enlaces directos) pero se simplifica: renderiza `CheckoutCard` (precio) + `<CheckoutForm servicio={servicio} />`. Así **la lógica del formulario vive en un solo sitio** (`CheckoutForm`), sin duplicar.

### 4. Backend: `cancel_url` vuelve a la ficha

En `backend/src/routes/checkout.js`, cambiar `cancel_url` de `/checkout?servicio=slug&cancelado=1` a la ficha del servicio: **`${config.baseUrl}${servicio.href}?cancelado=1`** (p.ej. `/tramites/duplicado-carnet?cancelado=1`), para que al cancelar en Stripe el cliente vuelva a donde estaba. `success_url` no cambia. `servicio.href` ya existe en `shared/servicios.js`.

### 5. Layout / CSS (columna estrecha)

El lateral es más estrecho (~350px) que la página `/checkout` (~600px). El `CheckoutForm` debe verse bien ahí: los campos que hoy van en fila (nombre/apellidos, tipo/nº documento, prefijo/teléfono) **se apilan** en la columna estrecha (formulario en una sola columna). Se reutilizan las clases de `Checkout.module.css` adaptando lo mínimo para que el `.formRow` apile en anchos estrechos. La tarjeta quedará **alta** (sobre todo en Canje con país+dirección) — es asumible y esperado.

### 6. Tests

- **`CheckoutForm`** (nuevo test): renderiza los campos; para un servicio con `requierePais/requiereDireccion` (Canje) muestra país + dirección; al enviar llama a `/api/checkout` con el payload correcto.
- **Fichas** (`*.test.jsx`): hoy comprueban el enlace "Contratar ahora → /checkout". Se actualizan: ya no hay enlace; ahora comprueban que **el formulario está presente** (p.ej. el botón "Pagar con tarjeta o Bizum"), y en Canje que aparece el campo de país.
- **`Checkout.test.jsx`**: sigue funcionando (la página usa `CheckoutForm`).
- Verificación final: `npm test` (frontend) + `npm run build`, y prueba manual del pago hasta la pantalla de Stripe.

## Ficheros afectados

- **Nuevo:** `frontend/src/pages/servicios/CheckoutForm.jsx` (reutiliza las clases de formulario de `Checkout.module.css`; ajuste mínimo para que `.formRow` apile en la columna estrecha).
- **Modificados:** `ContratarCard.jsx` (embebe el form), `Checkout.jsx` (usa `CheckoutForm`), los 8 `*.test.jsx` de servicios, `backend/src/routes/checkout.js` (`cancel_url`).

## Fuera de alcance

- Rediseñar el resto de la ficha (info/documentos/pasos) más allá de embeber el formulario.
- Tocar la página `/gracias` ni el flujo del webhook.
- Cambios en `/api/checkout` salvo el `cancel_url`.

## Riesgos

- **Pago (crítico):** se mitiga **reutilizando** el formulario existente (extracción, no reescritura) y reprobando el flujo hasta Stripe antes de publicar.
- **Tarjeta alta** en Canje: aceptado por el usuario.
- **CSS en columna estrecha:** requiere que el `.formRow` apile; se valida visualmente.
