# Handoff — Gestadia Portal
**Última actualización:** 2026-05-28

---

## ¿Qué es este proyecto?

**Gestadia** es una plataforma de tramitación DGT (transferencias, canje de carnet, duplicados, bajas, etc.). El sitio web actual es HTML estático puro. La decisión tomada es transformarlo en una **aplicación full-stack React + Node.js** con autenticación, pagos via Stripe y un dashboard de expedientes para clientes.

---

## Estado actual

### Hecho
- Diseño visual completo en HTML/CSS — 15 páginas `preview-*.html` en la raíz del repo
- Spec técnico aprobado para la **Fase 1** (migración a React + Node.js)
- Spec guardado en `docs/superpowers/specs/2026-05-22-fase1-setup-react-migration-design.md`

### Pendiente — todo el código de la aplicación
El repo solo contiene HTML estático. **No hay ni una línea de React ni Node.js todavía.**

---

## Hoja de ruta completa (5 fases)

| Fase | Contenido | Estado |
|---|---|---|
| **Fase 1** | Setup monorepo + Migración HTML → React + Express vacío | ⏳ Siguiente |
| **Fase 2** | Autenticación (login, registro, recuperar contraseña, JWT) | 🔒 Pendiente |
| **Fase 3** | Pagos con Stripe Checkout Sessions + metadata | 🔒 Pendiente |
| **Fase 4** | Dashboard cliente (mis expedientes, estado, documentos) | 🔒 Pendiente |
| **Fase 5** | Panel de administración (back-office Gestadia) | 🔒 Pendiente |

---

## Stack tecnológico acordado

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Estilos | CSS Modules (migración directa desde CSS actuales) |
| Backend | Node.js + Express |
| ORM | Prisma |
| Base de datos | MySQL |
| Auth | JWT + bcrypt (Fase 2) |
| Pagos | Stripe Checkout Sessions (Fase 3) |
| Email | Nodemailer (Fase 2) |

---

## Estructura objetivo del proyecto (Fase 1)

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
│   │   │   ├── CheckoutCard.jsx   ← Panel de pago reutilizable
│   │   │   └── ServiceLayout.jsx  ← Layout 2 columnas de todas las páginas de trámite
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
├── backend/
│   ├── src/index.js               ← Express con GET /api/health
│   ├── prisma/schema.prisma       ← Datasource MySQL, sin modelos aún
│   └── package.json
└── package.json                   ← Scripts raíz: dev, build
```

---

## Rutas React Router (Fase 1)

| HTML actual | Ruta React |
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

## Criterio de éxito de la Fase 1

- `npm run dev` levanta frontend en `:5173` y backend en `:3001` simultáneamente
- Todas las rutas de React Router cargan la página correcta
- El diseño visual es idéntico al HTML original
- El botón "Pagar con tarjeta →" muestra un placeholder (no hace nada todavía)
- `GET /api/health` responde `{ status: "ok" }`

---

## Prompt para continuar

Copia y pega esto al iniciar una nueva conversación con Claude Code:

---

```
Soy el propietario del proyecto Gestadia Portal, una plataforma de tramitación DGT.

ESTADO ACTUAL DEL REPO:
- Sitio web completo en HTML estático puro (15 archivos preview-*.html en la raíz)
- El diseño visual está TERMINADO — no hay que tocar el diseño, solo migrarlo
- No hay React ni Node.js todavía — hay que crearlo todo desde cero
- Spec de la Fase 1 en: docs/superpowers/specs/2026-05-22-fase1-setup-react-migration-design.md

LO QUE NECESITO AHORA:
Ejecutar la Fase 1: convertir el proyecto en un monorepo React + Node.js siguiendo exactamente el spec. Concretamente:

1. Crear la estructura de carpetas: frontend/ (React 18 + Vite) y backend/ (Express + Prisma)
2. Configurar package.json raíz con scripts `dev` y `build` que levanten frontend y backend juntos
3. Migrar todos los archivos preview-*.html a componentes React, respetando fielmente el diseño CSS actual
4. Crear los componentes compartidos: Header, Footer, CheckoutCard, ServiceLayout
5. Configurar React Router con todas las rutas del spec
6. Crear el backend Express mínimo con GET /api/health y CORS para localhost:5173
7. Configurar Prisma con datasource MySQL (sin modelos todavía)
8. El botón "Pagar con tarjeta →" debe mostrar un placeholder — la lógica Stripe va en Fase 3

STACK:
- Frontend: React 18 + Vite + React Router v6 + CSS Modules
- Backend: Node.js + Express + Prisma + MySQL

Lee el spec completo antes de empezar: docs/superpowers/specs/2026-05-22-fase1-setup-react-migration-design.md

Empieza creando el plan de implementación paso a paso y luego ejecuta.
```

---

## Decisiones clave tomadas (no reabrir)

- **MySQL** como base de datos (no PostgreSQL, no MongoDB)
- **CSS Modules** para estilos (no Tailwind, no styled-components) — migración directa del CSS existente
- **Stripe Checkout Sessions** para pagos (no Payment Links, no Elements embebidos)
- Los datos del formulario (nombre, DNI, teléfono) se pasan a Stripe como **metadata**
- El botón "Pagar" en Fase 1 es un **placeholder** — Stripe va en Fase 3
