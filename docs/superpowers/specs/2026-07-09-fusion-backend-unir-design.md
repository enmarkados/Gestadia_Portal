# Backend fusionado: Gestadia_Portal + unir (Express + Prisma/MySQL)

**Fecha:** 2026-07-09
**Sub-proyecto 1 de 2** — ver también [2026-07-09-frontend-react-migration-design.md](2026-07-09-frontend-react-migration-design.md)

## Contexto

`Gestadia_Portal` es hoy un sitio estático (`preview-*.html`) + un `server.js` mínimo en CommonJS con `POST /api/leads` (Lead simple en Zoho). Se despliega por FTP a `gestadia.com`.

En `c:\Users\gloria.aleix\.source\repos\unir` existe `gestadia-backend`: un backend Express en ESM (Node ≥22.5) con checkout + Stripe, login/JWT, portal de cliente, subida de documentos y webhooks de Stripe/Zoho, sobre SQLite nativo de Node.

**Decisión de alcance ampliada:** el frontend completo se migra a React (sub-proyecto 2), así que este backend deja de servir HTML directamente — pasa a ser una **API pura** (`/api/*`, `/webhooks/*`) consumida por el frontend React, más el servido de los estáticos ya compilados de ese frontend en producción.

**Decisión de base de datos:** se sustituye el SQLite nativo de `unir` por **Prisma + MySQL**, retomando la decisión original de `docs/superpowers/specs/2026-05-22-fase1-setup-react-migration-design.md` / `HANDOFF.md`. Esto es viable con poco riesgo porque `unir/src/db.js` ya expone una **API con la forma de Prisma Client** (`db.user.findUnique({where})`, `db.expediente.create({data})`, `include`, etc. — es literalmente el mismo shape). El plan de implementación sustituye ese fichero por un `PrismaClient` real; las rutas (`checkout.js`, `auth.js`, `portal.js`, `webhooks.js`) no cambian su lógica.

## Arquitectura

Un proceso Express (ESM) en `backend/`. En producción sirve la API y, además, los estáticos generados por el build de `frontend/` (`frontend/dist`) con fallback a `index.html` para las rutas de React Router. En desarrollo, el frontend corre aparte con Vite (`:5173`) y hace proxy de `/api` y `/webhooks` al backend (`:3001`).

Rutas API (sin colisiones):

- `POST /api/leads` (existente, comportamiento sin cambios)
- `GET /api/servicios`, `POST /api/checkout` (unir)
- `POST /api/auth/login`, `/api/auth/set-password`, `/api/auth/forgot` (unir)
- `GET/PATCH /api/me`, `GET /api/expedientes[/:id][/documentos...]`, `GET/POST /api/notificaciones...` (unir, JWT)
- `POST /webhooks/stripe` (raw body, montado antes del `express.json()` global), `POST /webhooks/zoho`
- `GET /api/health`

## Estructura de carpetas (monorepo)

```text
Gestadia_Portal/
├── frontend/                    (sub-proyecto 2 — ver spec de frontend)
├── backend/
│   ├── src/
│   │   ├── server.js             entrypoint: monta routers + sirve frontend/dist en prod
│   │   ├── config.js             fusión vars unir + vars leads/FTP
│   │   ├── catalog.js            de unir, sin cambios
│   │   ├── middleware/auth.js    de unir, sin cambios
│   │   ├── routes/
│   │   │   ├── leads.js          extraído del server.js actual, mismo comportamiento
│   │   │   └── checkout.js, auth.js, portal.js, webhooks.js   de unir, sin cambios de lógica
│   │   ├── services/
│   │   │   ├── zoho.js           servicio Zoho ÚNICO (ver siguiente sección)
│   │   │   └── notify.js         de unir, sin cambios
│   │   └── db.js                 nuevo: `export const db = new PrismaClient()`
│   ├── prisma/
│   │   └── schema.prisma         datasource MySQL + 5 modelos (ver abajo)
│   ├── uploads/                  de unir — gitignored
│   └── package.json              "type":"module", deps fusionadas, engines.node ">=22.5"
├── ftp-deploy.js                 actualizado: sube backend/ (sin uploads/ ni node_modules) + frontend/dist
└── package.json                  raíz: scripts `dev` (frontend+backend concurrently) y `build`
```

## Esquema Prisma (`backend/prisma/schema.prisma`)

Modelos equivalentes 1:1 a las tablas ya definidas a mano en `unir/src/db.js`, con tipos nativos (sin las conversiones manuales `toSql`/`normalizarUser` que existían solo por limitación de SQLite):

- `User` — `id, email (unique), passwordHash?, nombre, apellidos, telefono?, tipoDocumento?, numDocumento?, zohoContactId?, emailVerified (Boolean), inviteToken? (unique), resetToken? (unique), resetTokenExp? (DateTime), createdAt` — relación 1-N con `Expediente` y `Notificacion`.
- `Expediente` — `id, nPedido (unique), userId (FK), servicioSlug, titulo, estado, faseZoho?, zohoDealId?, importe (Decimal/Float), moneda, pagoRef?, pagoMetodo?, fechaPago? (DateTime), finDesistimiento? (DateTime), createdAt, updatedAt` — relación 1-N con `Documento` y `EventoExpediente`.
- `Documento` — `id, expedienteId (FK), clave, nombre, mime, size (Int), path, createdAt`.
- `EventoExpediente` — `id, expedienteId (FK), estado, nota?, createdAt`.
- `Notificacion` — `id, userId (FK), expedienteId?, titulo, cuerpo, canal, leida (Boolean), createdAt`.

`DATABASE_URL` apunta a la instancia MySQL (a provisionar en el hosting o en un servicio gestionado — pendiente de credenciales, no bloquea el diseño). `npx prisma migrate dev` genera la primera migración a partir de este schema.

## Servicio Zoho consolidado

Un único `backend/src/services/zoho.js` con un solo caché de token OAuth y un solo `zohoFetch()`, exportando:
- `createLead(leadData, clientIp)` — lógica exacta de hoy (`SERVICIO_MAP`, `normalizePhone`, `ZOHO_ASSIGNMENT_RULE_ID`, `ZOHO_CAMPAIGN_ID`), usada por `routes/leads.js`.
- `upsertContact(user)`, `createDealForExpediente(...)`, `addDealNote(...)` — de unir, usadas por `checkout.js`/`portal.js`.

`config.js` reconcilia las variables duplicadas (`ZOHO_DOMAIN`/`ZOHO_API_BASE_URL` vs `ZOHO_ACCOUNTS_URL`/`ZOHO_API_URL`) a un solo par, sin cambiar el comportamiento de ninguno de los dos flujos Zoho.

## Variables de entorno

Se añaden al `.env` actual: `PORT`, `BASE_URL`, `DATABASE_URL` (MySQL), `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ZOHO_WEBHOOK_SECRET`, `SMTP_HOST/PORT/USER/PASS`, `EMAIL_FROM`. Sin `STRIPE_SECRET_KEY`/`SMTP_HOST`, el backend arranca en modo demo (igual que documenta hoy el README de unir).

## `backend/package.json`

- `"type": "module"`, `engines.node ">=22.5"`.
- `dependencies`: `express`, `dotenv`, `basic-ftp` (o se deja solo en la raíz), `bcryptjs`, `jsonwebtoken`, `multer`, `nodemailer`, `stripe`, `@prisma/client`.
- `devDependencies`: `prisma`, `playwright` (se mantiene).
- `scripts`: `dev` → `node --watch src/server.js`, `start` → `node src/server.js`, `prisma:migrate` → `prisma migrate dev`.

## Fuera de alcance

- No se despliegan aún claves reales de Stripe/SMTP ni la instancia MySQL definitiva — el backend queda operativo en modo demo hasta configurarlas.
- No se conectan los botones "Solicitar información" de las páginas de trámite al nuevo checkout — eso es un cambio de producto, no de esta fusión técnica (se puede abordar como iteración posterior).
- La migración de datos (si llegara a haber datos reales ya en el `dev.db` de SQLite de unir) no está cubierta — se asume que hoy no hay datos de producción en unir todavía.

## Pruebas

Smoke test con Playwright: arranca el backend fusionado y comprueba `GET /api/health` (200), `POST /api/leads` con payload válido, `GET /api/servicios`.
