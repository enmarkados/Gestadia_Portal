# Fase 1 — Setup + Migración a React/Node.js

**Fecha:** 2026-05-22  
**Proyecto:** Gestadia Portal  
**Alcance:** Transformar el sitio HTML estático en una aplicación React + Express lista para las fases de autenticación, pagos y dashboard.

---

## Contexto

El sitio actual es HTML estático puro (sin framework, sin build system). Contiene 8 páginas de servicio DGT, cada una con un formulario de checkout y un botón "Pagar con tarjeta" sin funcionalidad. El objetivo de esta fase es migrar todo a React (Vite) + Express (Node.js), respetando el diseño visual existente, y dejar el monorepo listo para las fases siguientes.

---

## Stack tecnológico

| Capa | Tecnología | Motivo |
|---|---|---|
| Frontend | React 18 + Vite | Build rápido, HMR, estándar moderno |
| Routing | React Router v6 | Navegación SPA |
| Estilos | CSS Modules | Migración directa desde CSS existentes sin romper diseño |
| Backend | Node.js + Express | Sencillo, extensible para auth y Stripe en fases siguientes |
| ORM | Prisma | Compatible con MySQL, tipado, migraciones sencillas |
| Base de datos | MySQL | Elección del cliente |

---

## Estructura del proyecto

```
gestadia-portal/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Tramites.jsx
│   │   │   ├── Contacto.jsx
│   │   │   ├── servicios/
│   │   │   │   ├── Transferencia.jsx
│   │   │   │   ├── CanjeCarnet.jsx
│   │   │   │   ├── DuplicadoCarnet.jsx
│   │   │   │   ├── DuplicadoDatos.jsx
│   │   │   │   ├── DuplicadoCirculacion.jsx
│   │   │   │   ├── PermisoInternacional.jsx
│   │   │   │   ├── BajaVehiculo.jsx
│   │   │   │   └── CancelacionDominio.jsx
│   │   │   └── legal/
│   │   │       ├── AvisoLegal.jsx
│   │   │       ├── Privacidad.jsx
│   │   │       ├── Cookies.jsx
│   │   │       └── PagosDevoluciones.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── CheckoutCard.jsx
│   │   │   └── ServiceLayout.jsx
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── Header.module.css
│   │   │   ├── Footer.module.css
│   │   │   ├── CheckoutCard.module.css
│   │   │   └── ...
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   └── index.js        ← Express vacío con health check
│   ├── prisma/
│   │   └── schema.prisma   ← Solo datasource + generator en Fase 1
│   └── package.json
└── package.json            ← Scripts raíz: dev, build
```

---

## Rutas React Router

| Página HTML actual | Ruta React |
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

---

## Componentes compartidos

### `Header`
Barra de navegación superior con logo "gestadia", links a trámites y contacto, y botón de área de cliente (placeholder en Fase 1 — funcional en Fase 2).

### `Footer`
Footer con dirección, teléfono, WhatsApp, email y links legales. Idéntico al HTML actual.

### `ServiceLayout`
Layout de dos columnas (contenido izquierda / checkout derecha) usado por todas las páginas de trámite. Encapsula la estructura responsive actual.

### `CheckoutCard`
Panel de pago reutilizable. Recibe como props:
- `servicio` (nombre del trámite)
- `precio` (número)
- `incluye` (array de strings)

Contiene el formulario (nombre, DNI, teléfono, email) y el botón "Pagar con tarjeta →". En Fase 1 el botón muestra un alert/toast "Próximamente" — la lógica de Stripe se implementa en Fase 3.

---

## Backend en Fase 1

El servidor Express arranca en el puerto 3001 con:
- `GET /api/health` → `{ status: "ok" }`
- CORS configurado para permitir `localhost:5173` (Vite dev)
- `prisma/schema.prisma` con datasource MySQL configurado, sin modelos (se añaden en Fase 2)

El frontend en Vite usa un proxy hacia `localhost:3001` para las llamadas `/api/*`.

---

## Diseño visual

Se respeta íntegramente el diseño actual:
- Variables CSS existentes (`--red`, `--graphite`, `--border`)
- Tipografía, tamaños, colores, espaciados
- Tarjeta de checkout con sombra y bordes redondeados
- Botón rojo con hover
- Layout responsive (breakpoint móvil existente)

Los CSS actuales se migran a CSS Modules sin modificar los valores.

---

## Lo que NO entra en Fase 1

- Login / registro (Fase 2)
- Stripe (Fase 3)
- Dashboard cliente (Fase 4)
- Panel de administración (Fase 5)
- Envío de emails
- Despliegue en producción

---

## Criterio de éxito

- `npm run dev` en la raíz levanta frontend (`:5173`) y backend (`:3001`) simultáneamente
- Todas las rutas de React Router cargan la página correcta
- El diseño visual es visualmente idéntico al HTML original
- El botón "Pagar" muestra feedback visual (placeholder) sin romper la página
- `GET /api/health` responde correctamente
