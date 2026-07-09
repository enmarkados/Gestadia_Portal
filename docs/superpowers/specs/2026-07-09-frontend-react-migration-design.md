# Migración del frontend a React + Vite

**Fecha:** 2026-07-09
**Sub-proyecto 2 de 2** — depende de [2026-07-09-fusion-backend-unir-design.md](2026-07-09-fusion-backend-unir-design.md) para las llamadas a la API.

## Contexto

El sitio actual son 15 páginas HTML autocontenidas (`preview-*.html`, cada una con su propio `<style>` inline, ~400-900 líneas) más las páginas vanilla de `unir` (`checkout.html`, `portal.html` + `app.js`, `gracias.html`). El diseño visual está terminado y no se toca — esto es una migración de tecnología, no un rediseño.

Retoma la Fase 1 nunca ejecutada de `HANDOFF.md`, con dos añadidos: incorpora las páginas de checkout/portal de cliente (que no existían cuando se escribió ese documento) y consume el backend fusionado del sub-proyecto 1 en vez del Express+Prisma "vacío" que planteaba aquel documento.

## Stack

React 18 + Vite, React Router v6, CSS Modules (migración directa del CSS inline de cada página actual a un `.module.css` hermano por página/componente) — exactamente lo acordado en `HANDOFF.md`.

## Estructura de carpetas

```text
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.jsx (+ .module.css)
│   │   ├── Tramites.jsx
│   │   ├── Contacto.jsx
│   │   ├── servicios/
│   │   │   ├── Transferencia.jsx, CanjeCarnet.jsx, DuplicadoCarnet.jsx,
│   │   │   │   DuplicadoDatos.jsx, DuplicadoCirculacion.jsx,
│   │   │   │   PermisoInternacional.jsx, BajaVehiculo.jsx, CancelacionDominio.jsx
│   │   ├── legal/
│   │   │   ├── AvisoLegal.jsx, Privacidad.jsx, Cookies.jsx, PagosDevoluciones.jsx, ProteccionDatos.jsx
│   │   ├── Checkout.jsx           nuevo — reemplaza public/checkout.html + app.js de unir
│   │   ├── Gracias.jsx            nuevo — reemplaza public/gracias.html
│   │   └── portal/
│   │       ├── Login.jsx, CrearClave.jsx, RecuperarClave.jsx
│   │       ├── MisServicios.jsx, ExpedienteDetalle.jsx, MisDatos.jsx, Notificaciones.jsx
│   ├── components/
│   │   ├── Header.jsx, Footer.jsx
│   │   ├── ServiceLayout.jsx      layout 2 columnas de las páginas de trámite
│   │   ├── CheckoutCard.jsx       panel de pago reutilizable
│   │   └── portal/ProtectedRoute.jsx   redirige a /login si no hay JWT válido
│   ├── lib/
│   │   ├── api.js                 fetch wrapper: base URL + Authorization Bearer + manejo de errores
│   │   └── auth.js                guarda/lee el JWT (localStorage), decodifica expiración
│   ├── App.jsx                    React Router
│   └── main.jsx
└── vite.config.js                 proxy /api y /webhooks → backend en dev
```

## Enrutado (React Router v6)

Igual que la tabla de `HANDOFF.md`, más las rutas nuevas de checkout/portal:

| Página actual | Ruta React |
|---|---|
| preview-home.html | `/` |
| preview-tramites.html | `/tramites` |
| preview-transferencia.html | `/tramites/transferencia` |
| preview-canje.html | `/tramites/canje-carnet` |
| preview-duplicado-carnet.html | `/tramites/duplicado-carnet` |
| preview-duplicado-datos.html | `/tramites/duplicado-datos` |
| preview-duplicado-circulacion.html | `/tramites/duplicado-circulacion` |
| preview-permiso-internacional.html | `/tramites/permiso-internacional` |
| preview-baja-vehiculo.html | `/tramites/baja-vehiculo` |
| preview-cancelacion-dominio.html | `/tramites/cancelacion-dominio` |
| preview-contacto.html | `/contacto` |
| preview-pagos-devoluciones.html | `/pagos-devoluciones` |
| preview-aviso-legal.html | `/aviso-legal` |
| preview-privacidad.html | `/privacidad` |
| preview-cookies.html | `/cookies` |
| preview-proteccion-datos.html *(no estaba en el HANDOFF.md original — página añadida después)* | `/proteccion-datos` |
| *(nuevo)* public/checkout.html | `/checkout?servicio=:slug` |
| *(nuevo)* public/gracias.html | `/gracias?pedido=:nPedido` |
| *(nuevo)* public/portal.html | `/portal/*` (login, mis-servicios, mis-datos, notificaciones — sub-rutas dentro de `ProtectedRoute`) |

## Migración página a página

Cada `preview-*.html` se convierte 1:1: el `<style>` inline pasa a `NombrePagina.module.css` (mismas clases, mismos valores — sin “limpiar” CSS que no se ha pedido tocar), el `<body>` pasa a JSX dentro del componente, y las partes repetidas entre páginas (nav, footer, ya idénticos en todas) se extraen una sola vez a `Header`/`Footer`. El formulario "Solicitar información" de cada página de trámite sigue llamando a `POST /api/leads` tal cual (mismo contrato, sin cambios de producto).

`Checkout.jsx` y el área de cliente (`portal/*`) se construyen desde cero en React siguiendo el contrato que ya expone el backend fusionado (`GET /api/servicios`, `POST /api/checkout`, `/api/auth/*`, `/api/me`, `/api/expedientes*`, `/api/notificaciones*`) — no hay HTML previo que migrar ahí porque `unir` los tenía en vanilla JS (`app.js`), se reescriben directamente como componentes.

## Dev / build

- Raíz: `package.json` con scripts `dev` (levanta `frontend` en `:5173` y `backend` en `:3001` con `concurrently`) y `build` (`vite build` en frontend, deja `frontend/dist` listo).
- En producción, el Express de `backend/` sirve `frontend/dist` como estático y hace fallback a `index.html` para cualquier ruta no-API (necesario para que React Router funcione con URLs directas).
- `ftp-deploy.js` sube `frontend/dist` (en vez de los `preview-*.html` sueltos) más `backend/` (sin `node_modules` ni `uploads/`).

## Fuera de alcance

- No se toca el diseño visual — es una migración de HTML+CSS inline a JSX+CSS Modules manteniendo el resultado visual idéntico.
- No se añade internacionalización, SSR ni SEO más allá de lo que ya tienen las páginas actuales (esto podría perder algo de SEO al pasar de HTML estático a SPA; si es una preocupación, se puede evaluar un `build` con pre-render por ruta como iteración posterior, pero no está en este alcance).
- No se elimina el `dev.db`/SQLite de `unir` como tal — simplemente el backend fusionado (sub-proyecto 1) ya no lo usa; el propio `unir` queda intacto como referencia hasta confirmar que la fusión funciona.

## Pruebas

Se reutiliza Playwright (ya está en el repo): un test por página migrada que compruebe que renderiza el `<h1>`/hero esperado, más un test end-to-end del flujo de checkout en modo demo (sin claves Stripe) desde `/tramites/canje-carnet` hasta `/gracias`.
