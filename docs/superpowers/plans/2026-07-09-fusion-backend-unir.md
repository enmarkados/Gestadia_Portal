# Fusión backend unir (Express + Prisma/MySQL) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fuse the `unir` backend (checkout/Stripe, auth/JWT, client portal, Stripe+Zoho webhooks) with the existing `/api/leads` endpoint into a single Express (ESM) API server under `backend/`, backed by Prisma + MySQL instead of unir's hand-rolled SQLite layer.

**Architecture:** One Express process in `backend/src/server.js` mounts all routers (`leads`, `checkout`, `auth`, `portal`, `webhooks`) and, in production, serves the React build (`frontend/dist`, produced by the sibling plan) as static files with an SPA fallback. `backend/src/db.js` becomes a thin `PrismaClient` export — the route files already call it with Prisma's exact method shape (`findUnique`, `create`, `update`, `findFirst`, `findMany`, `updateMany`, nested `include`/relation `where`), so no route logic changes.

**Tech Stack:** Node.js ≥22.5, Express 4, Prisma + MySQL, bcryptjs, jsonwebtoken, multer, nodemailer, stripe, dotenv. Playwright for smoke tests.

## Global Constraints

- Node.js `>=22.5` (from `docs/superpowers/specs/2026-07-09-fusion-backend-unir-design.md`).
- `backend/package.json` must have `"type": "module"` — all backend source is ESM (`import`/`export`).
- `/api/leads` behavior (request/response shape, Zoho field mapping, `SERVICIO_MAP`) must not change — it's a live endpoint used by production forms.
- No route logic in `checkout.js`, `auth.js`, `portal.js`, `webhooks.js` changes — only their `db` and `zoho` imports are repointed.
- Source of truth for unchanged files: `c:\Users\gloria.aleix\.source\repos\unir` (read-only reference; never edit files there).
- There is **one** MySQL database for this project (hosted, not local) — dev and automated tests share it. Automated tests must only create rows tagged identifiably (`test-*@example.com` emails, `GST-TEST-*`/`GST-DOC-*` order numbers) — never assume a disposable/droppable database, and never run destructive bulk operations (`DROP TABLE`, `DELETE FROM x` without a narrow `WHERE`) against it.
- `backend/.env` (gitignored, created in Task 1) holds the real `DATABASE_URL` and other secrets — every command in this plan that needs them relies on `backend/.env` being loaded via `dotenv/config`, not on inline `DATABASE_URL=... command` env prefixes. Never print `backend/.env`'s contents in commits, logs, or commit messages; never commit the file itself.

---

### Task 1: MySQL connection setup (hosted database)

**Files:**
- Create: `backend/.env` (gitignored — real secrets, created directly by the implementer, not templated)
- Modify: `.gitignore` (repo root)

**Interfaces:**
- Produces: `backend/.env` with a working `DATABASE_URL` — every later task that touches Prisma or starts the server relies on this file existing and `dotenv/config` loading it.
- Context for the implementer: the connection details are provided directly in this task's brief (ask the controller/orchestrator for them — do not invent placeholder credentials). The database already exists on the host; this task only wires the connection string, it does not provision a new database.

- [ ] **Step 1: Update `.gitignore`**

Add to `c:\Users\gloria.aleix\.source\repos\Gestadia_Portal\.gitignore` (if not already present):

```
node_modules/
.env
backend/.env
backend/uploads/
backend/node_modules/
```

- [ ] **Step 2: Verify the host is reachable before writing any secrets**

Run: `node -e "const net=require('net');const s=new net.Socket();s.setTimeout(6000);s.on('connect',()=>{console.log('TCP OK');s.destroy();});s.on('timeout',()=>{console.log('TIMEOUT');s.destroy();});s.on('error',e=>console.log('ERROR',e.message));s.connect(3306,'gestadia.com');"`
Expected: `TCP OK`. If it prints `TIMEOUT` or `ERROR`, stop and report BLOCKED — the DB is not reachable from this machine and no further backend work can be verified until that's resolved.

- [ ] **Step 3: Create `backend/.env`** (this file is gitignored — never add it with `git add`). Use the exact `DATABASE_URL` given in this task's brief — it already has the password correctly percent-encoded for use in a URL (any `@` in the raw password becomes `%40`; `!` does not need encoding). Do not reformat or "clean up" the connection string.

```
PORT=3001
BASE_URL=http://localhost:3001
DATABASE_URL="<exact value from the task brief>"
```

(Task 2 appends the rest of the variables to this same file — this step only needs `DATABASE_URL` to exist so Task 4's `prisma migrate dev` has something to connect to.)

- [ ] **Step 4: Commit only the `.gitignore` change**

```bash
git add .gitignore
git commit -m "chore: gitignore backend/.env"
```

Verify `backend/.env` is NOT staged: `git status --short` must not list it.

---

### Task 2: Backend workspace skeleton + merged package.json

**Files:**
- Create: `backend/package.json`
- Create: `backend/.env.example`
- Create: `backend/uploads/.gitkeep`

**Interfaces:**
- Produces: `backend/package.json` with scripts `dev`, `start`, `prisma:migrate`, `prisma:generate` — later tasks assume these exist.

- [ ] **Step 1: Create `backend/package.json`**

```json
{
  "name": "gestadia-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "engines": { "node": ">=22.5" },
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "test": "node --test src/**/*.test.js"
  },
  "dependencies": {
    "@prisma/client": "^6.1.0",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.4.5",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.16",
    "stripe": "^17.5.0"
  },
  "devDependencies": {
    "prisma": "^6.1.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `cd backend && npm install`
Expected: `node_modules/` created, no errors.

- [ ] **Step 3: Create `backend/.env.example`** (merges `unir/.env.example` and the Zoho/FTP vars already in the repo root `.env.example`, reconciled per the design doc)

```
# --- Núcleo ---
PORT=3001
BASE_URL=http://localhost:3001
DATABASE_URL="mysql://gestadia:gestadia@localhost:3307/gestadia_dev"
JWT_SECRET=cambia-esto-por-una-cadena-larga-y-aleatoria

# --- Stripe (https://dashboard.stripe.com/apikeys) ---
# Vacío = MODO DEMO (el checkout simula el pago).
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# --- Zoho CRM (datacenter EU) — un solo par de URLs para todo el backend ---
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=
ZOHO_ACCOUNTS_URL=https://accounts.zoho.eu
ZOHO_API_URL=https://www.zohoapis.eu
ZOHO_API_VERSION=v6
ZOHO_WEBHOOK_SECRET=cambia-esto-tambien

# --- Zoho: específico del flujo de leads informativos ---
ZOHO_LEAD_SOURCE_DEFAULT=Formulario Web
ZOHO_LEAD_STATUS_DEFAULT=No contactado
ZOHO_PAGE_SOURCE_DEFAULT=GESTADIA
ZOHO_CAMPAIGN_ID=
ZOHO_ASSIGNMENT_RULE_ID=

# --- Email transaccional ---
# Vacío = los emails se imprimen en consola.
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Gestadia <hola@gestadia.com>"
```

- [ ] **Step 4: Create `backend/uploads/.gitkeep`** (empty file, so the folder exists in git even though its contents are gitignored)

- [ ] **Step 5: Complete the real `backend/.env`** (created with just `DATABASE_URL` in Task 1 — this step fills in the rest; the file stays gitignored, never `git add` it). Append these keys, reusing the Zoho values that already exist in the repo-root `.env` (open it and copy `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_CAMPAIGN_ID`, `ZOHO_ASSIGNMENT_RULE_ID` verbatim — do not invent new values for these) and generating fresh random secrets for `JWT_SECRET`/`ZOHO_WEBHOOK_SECRET`:

```
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
ZOHO_ACCOUNTS_URL=https://accounts.zoho.eu
ZOHO_API_URL=https://www.zohoapis.eu
ZOHO_API_VERSION=v6
ZOHO_WEBHOOK_SECRET=<run: node -e "console.log(require('crypto').randomBytes(24).toString('hex'))">
ZOHO_CLIENT_ID=<copied from repo-root .env>
ZOHO_CLIENT_SECRET=<copied from repo-root .env>
ZOHO_REFRESH_TOKEN=<copied from repo-root .env>
ZOHO_LEAD_SOURCE_DEFAULT=Formulario Web
ZOHO_LEAD_STATUS_DEFAULT=No contactado
ZOHO_PAGE_SOURCE_DEFAULT=GESTADIA
ZOHO_CAMPAIGN_ID=<copied from repo-root .env>
ZOHO_ASSIGNMENT_RULE_ID=<copied from repo-root .env>
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Gestadia <hola@gestadia.com>"
```

Leaving `STRIPE_SECRET_KEY` and `SMTP_HOST` empty is intentional (demo mode) — do not fill them with placeholder-looking fake values.

- [ ] **Step 6: Commit** (never stage `backend/.env`)

```bash
git add backend/package.json backend/package-lock.json backend/.env.example backend/uploads/.gitkeep
git commit -m "chore: scaffold backend/ workspace with merged dependencies"
git status --short
```

Verify the output does NOT list `backend/.env`.

---

### Task 3: Copy unchanged unir source files

**Files:**
- Create: `backend/src/catalog.js` (copy of `unir/src/catalog.js`, unchanged)
- Create: `backend/src/middleware/auth.js` (copy of `unir/src/middleware/auth.js`, unchanged)
- Create: `backend/src/services/notify.js` (copy of `unir/src/services/notify.js`, unchanged)
- Create: `backend/src/routes/checkout.js` (copy of `unir/src/routes/checkout.js`, unchanged)
- Create: `backend/src/routes/auth.js` (copy of `unir/src/routes/auth.js`, unchanged)
- Create: `backend/src/routes/portal.js` (copy of `unir/src/routes/portal.js`, unchanged)
- Create: `backend/src/routes/webhooks.js` (copy of `unir/src/routes/webhooks.js`, unchanged)

**Interfaces:**
- Consumes: nothing new — these files import `../config.js`, `../db.js`, `../services/zoho.js`, `../services/notify.js`, `../middleware/auth.js`, `../catalog.js`, which Tasks 4–6 create with matching exports (`config`, `db`, `upsertContact`, `createDealForExpediente`, `addDealNote`, `sendEmail`, `notifyUser`, `transitionExpediente`, `signToken`, `requireAuth`, `SERVICIOS`, `getServicio`, `ESTADOS`, `faseToEstado`).
- Produces: `checkoutRouter`, `authRouter`, `portalRouter`, `webhooksRouter`, `fulfillPayment` (named export from `checkout.js`) — consumed by Task 7's `server.js`.

- [ ] **Step 1: Copy the five files verbatim**

```bash
mkdir -p backend/src/middleware backend/src/routes backend/src/services
cp "c:/Users/gloria.aleix/.source/repos/unir/src/catalog.js" backend/src/catalog.js
cp "c:/Users/gloria.aleix/.source/repos/unir/src/middleware/auth.js" backend/src/middleware/auth.js
cp "c:/Users/gloria.aleix/.source/repos/unir/src/services/notify.js" backend/src/services/notify.js
cp "c:/Users/gloria.aleix/.source/repos/unir/src/routes/checkout.js" backend/src/routes/checkout.js
cp "c:/Users/gloria.aleix/.source/repos/unir/src/routes/auth.js" backend/src/routes/auth.js
cp "c:/Users/gloria.aleix/.source/repos/unir/src/routes/portal.js" backend/src/routes/portal.js
cp "c:/Users/gloria.aleix/.source/repos/unir/src/routes/webhooks.js" backend/src/routes/webhooks.js
```

- [ ] **Step 2: Verify no file was accidentally modified**

Run: `diff "c:/Users/gloria.aleix/.source/repos/unir/src/catalog.js" backend/src/catalog.js` (repeat for each copied file)
Expected: no output (files identical) for all seven.

- [ ] **Step 3: Commit**

```bash
git add backend/src/catalog.js backend/src/middleware/auth.js backend/src/services/notify.js backend/src/routes/checkout.js backend/src/routes/auth.js backend/src/routes/portal.js backend/src/routes/webhooks.js
git commit -m "chore: copy unir route/service files unchanged into backend/"
```

---

### Task 4: Prisma schema + `db.js`

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/src/db.js`
- Test: `backend/src/db.test.js`

**Interfaces:**
- Produces: `export const db` — a `PrismaClient` instance whose models (`db.user`, `db.expediente`, `db.documento`, `db.eventoExpediente`, `db.notificacion`) match the method calls already used by the copied route files from Task 3.

- [ ] **Step 1: Write `backend/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String?
  nombre        String
  apellidos     String
  telefono      String?
  tipoDocumento String?
  numDocumento  String?
  zohoContactId String?
  emailVerified Boolean   @default(false)
  inviteToken   String?   @unique
  resetToken    String?   @unique
  resetTokenExp DateTime?
  createdAt     DateTime  @default(now())

  expedientes    Expediente[]
  notificaciones Notificacion[]
}

model Expediente {
  id               String    @id @default(uuid())
  nPedido          String    @unique
  userId           String
  user             User      @relation(fields: [userId], references: [id])
  servicioSlug     String
  titulo           String
  estado           String    @default("pago_pendiente")
  faseZoho         String?
  zohoDealId       String?
  importe          Float
  moneda           String    @default("EUR")
  pagoRef          String?
  pagoMetodo       String?
  fechaPago        DateTime?
  finDesistimiento DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  documentos Documento[]
  eventos    EventoExpediente[]
}

model Documento {
  id           String     @id @default(uuid())
  expedienteId String
  expediente   Expediente @relation(fields: [expedienteId], references: [id])
  clave        String
  nombre       String
  mime         String
  size         Int
  path         String
  createdAt    DateTime   @default(now())
}

model EventoExpediente {
  id           String     @id @default(uuid())
  expedienteId String
  expediente   Expediente @relation(fields: [expedienteId], references: [id])
  estado       String
  nota         String?    @db.Text
  createdAt    DateTime   @default(now())
}

model Notificacion {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  expedienteId String?
  titulo       String
  cuerpo       String   @db.Text
  canal        String   @default("portal")
  leida        Boolean  @default(false)
  createdAt    DateTime @default(now())
}
```

- [ ] **Step 2: Generate the client and run the first migration against the dev DB**

Run: `cd backend && npx prisma migrate dev --name init` (reads `DATABASE_URL` from `backend/.env` automatically — Prisma CLI loads `.env` in the current directory on its own, no need to export it manually)
Expected: `Your database is now in sync with your schema.` and `backend/prisma/migrations/<timestamp>_init/migration.sql` created.

- [ ] **Step 3: Write the failing test** — create `backend/src/db.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { db } from './db.js';

test('db.user create/findUnique round-trip returns native types', async () => {
  const email = `test-${Date.now()}@example.com`;
  const created = await db.user.create({
    data: { email, nombre: 'Ana', apellidos: 'Ruiz', inviteToken: `tok-${Date.now()}` },
  });
  assert.equal(created.emailVerified, false);
  assert.equal(typeof created.emailVerified, 'boolean');

  const found = await db.user.findUnique({ where: { email } });
  assert.equal(found.id, created.id);

  await db.expediente.create({
    data: {
      nPedido: `GST-TEST-${Date.now()}`,
      userId: created.id,
      servicioSlug: 'canje',
      titulo: 'Canje de permiso',
      importe: 149,
    },
  });

  const withExp = await db.user.findUnique({ where: { email } });
  assert.ok(withExp);

  const exps = await db.expediente.findMany({
    where: { userId: created.id },
    orderBy: { createdAt: 'desc' },
  });
  assert.equal(exps.length, 1);
  assert.equal(exps[0].estado, 'pago_pendiente');
});

test('db.documento.findFirst supports nested expediente/userId filter', async () => {
  const email = `test-doc-${Date.now()}@example.com`;
  const user = await db.user.create({ data: { email, nombre: 'Luis', apellidos: 'Pardo' } });
  const exp = await db.expediente.create({
    data: { nPedido: `GST-DOC-${Date.now()}`, userId: user.id, servicioSlug: 'canje', titulo: 'x', importe: 1 },
  });
  const doc = await db.documento.create({
    data: { expedienteId: exp.id, clave: 'dni_anverso', nombre: 'dni.jpg', mime: 'image/jpeg', size: 100, path: 'x.jpg' },
  });

  const found = await db.documento.findFirst({
    where: { id: doc.id, expediente: { id: exp.id, userId: user.id } },
  });
  assert.ok(found);

  const notFound = await db.documento.findFirst({
    where: { id: doc.id, expediente: { id: exp.id, userId: 'otro-user' } },
  });
  assert.equal(notFound, null);
});
```

- [ ] **Step 4: Write `backend/src/db.js`**

```js
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();
```

- [ ] **Step 5: Run the test against the test database**

Run: `cd backend && node --test src/db.test.js` (the schema is already migrated from Step 2 against the same database — `db.js` imports `dotenv/config` so `DATABASE_URL` loads from `backend/.env` automatically)
Expected: both tests PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/prisma backend/src/db.js backend/src/db.test.js
git commit -m "feat: add Prisma schema + PrismaClient-backed db.js"
```

---

### Task 5: Merged `config.js`

**Files:**
- Create: `backend/src/config.js`
- Test: `backend/src/config.test.js`

**Interfaces:**
- Produces: `export const config` with shape `{ port, baseUrl, jwtSecret, stripe: {secretKey, webhookSecret, enabled}, zoho: {clientId, clientSecret, refreshToken, accountsUrl, apiUrl, apiVersion, webhookSecret, leadSourceDefault, leadStatusDefault, pageSourceDefault, campaignId, assignmentRuleId, enabled}, smtp: {host, port, user, pass, from, enabled} }` — consumed by `checkout.js`, `auth.js`, `portal.js`, `webhooks.js` (Task 3, unchanged, only reads `config.stripe.*`, `config.zoho.webhookSecret`, `config.jwtSecret`, `config.baseUrl`) and by Task 6's `zoho.js` (reads `config.zoho.*`).

- [ ] **Step 1: Write the failing test** — create `backend/src/config.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('config.zoho.enabled is false without credentials', async () => {
  process.env.ZOHO_CLIENT_ID = '';
  process.env.ZOHO_CLIENT_SECRET = '';
  process.env.ZOHO_REFRESH_TOKEN = '';
  const { config } = await import('./config.js');
  assert.equal(config.zoho.enabled, false);
});

test('config.stripe.enabled is true when STRIPE_SECRET_KEY is set', async () => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  const { config } = await import('./config.js?t=' + Date.now());
  assert.equal(config.stripe.enabled, true);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd backend && node --test src/config.test.js`
Expected: FAIL — `Cannot find module './config.js'`.

- [ ] **Step 3: Write `backend/src/config.js`**

```js
import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3001,
  baseUrl: process.env.BASE_URL || 'http://localhost:3001',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-cambiar',

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    get enabled() { return !!this.secretKey; },
  },

  zoho: {
    clientId: process.env.ZOHO_CLIENT_ID || '',
    clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
    refreshToken: process.env.ZOHO_REFRESH_TOKEN || '',
    accountsUrl: process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.eu',
    apiUrl: process.env.ZOHO_API_URL || 'https://www.zohoapis.eu',
    apiVersion: process.env.ZOHO_API_VERSION || 'v6',
    webhookSecret: process.env.ZOHO_WEBHOOK_SECRET || '',
    leadSourceDefault: process.env.ZOHO_LEAD_SOURCE_DEFAULT || 'Formulario Web',
    leadStatusDefault: process.env.ZOHO_LEAD_STATUS_DEFAULT || 'No contactado',
    pageSourceDefault: process.env.ZOHO_PAGE_SOURCE_DEFAULT || 'GESTADIA',
    campaignId: process.env.ZOHO_CAMPAIGN_ID || '',
    assignmentRuleId: process.env.ZOHO_ASSIGNMENT_RULE_ID || '',
    get enabled() { return !!(this.clientId && this.clientSecret && this.refreshToken); },
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'Gestadia <hola@gestadia.com>',
    get enabled() { return !!this.host; },
  },
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd backend && node --test src/config.test.js`
Expected: both tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/config.js backend/src/config.test.js
git commit -m "feat: add merged config.js (unir + leads env vars, single Zoho URL pair)"
```

---

### Task 6: Consolidated Zoho service

**Files:**
- Create: `backend/src/services/zoho.js`
- Test: `backend/src/services/zoho.test.js`

**Interfaces:**
- Consumes: `config` from `./config.js` (Task 5).
- Produces: `createLead(leadData, clientIp)`, `upsertContact(user)`, `createDealForExpediente(expediente, user, servicio, contactId)`, `addDealNote(dealId, titulo, contenido)` — `createLead` is consumed by Task 7's `routes/leads.js`; the other three are already imported as-is by the copied `checkout.js`/`portal.js` from Task 3.

- [ ] **Step 1: Write the failing test** — create `backend/src/services/zoho.test.js`

```js
import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

beforeEach(() => {
  process.env.ZOHO_CLIENT_ID = 'id';
  process.env.ZOHO_CLIENT_SECRET = 'secret';
  process.env.ZOHO_REFRESH_TOKEN = 'refresh';
});

test('createLead posts to the Leads endpoint with mapped Servicio and normalized phone', async () => {
  const calls = [];
  global.fetch = mock.fn(async (url, opts) => {
    calls.push({ url: String(url), opts });
    if (String(url).includes('/oauth/v2/token')) {
      return { json: async () => ({ access_token: 'tok', expires_in: 3600 }) };
    }
    return { json: async () => ({ data: [{ status: 'success', details: { id: 'lead1' } }] }) };
  });

  const { createLead } = await import('./zoho.js?t=' + Date.now());
  const id = await createLead(
    { nombre: 'Ana Ruiz', telefono: '600111222', email: 'ana@example.com', tramite: 'Canje de Carnet Extranjero' },
    '1.2.3.4'
  );

  assert.equal(id, 'lead1');
  const leadCall = calls.find((c) => c.url.includes('/Leads'));
  const body = JSON.parse(leadCall.opts.body);
  assert.equal(body.data[0].Phone, '+34600111222');
  assert.equal(body.data[0].Campa_a, 'Canje');
  assert.equal(body.data[0].Last_Name, 'Ruiz');
  assert.equal(body.data[0].First_Name, 'Ana');
});

test('upsertContact creates a contact when none exists', async () => {
  global.fetch = mock.fn(async (url) => {
    if (String(url).includes('/oauth/v2/token')) return { json: async () => ({ access_token: 'tok', expires_in: 3600 }) };
    if (String(url).includes('/Contacts/search')) return { status: 200, json: async () => ({ data: [] }) };
    return { json: async () => ({ data: [{ details: { id: 'contact1' } }] }) };
  });
  const { upsertContact } = await import('./zoho.js?t=' + Date.now());
  const id = await upsertContact({ nombre: 'Ana', apellidos: 'Ruiz', email: 'ana@example.com' });
  assert.equal(id, 'contact1');
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd backend && node --test src/services/zoho.test.js`
Expected: FAIL — `Cannot find module './zoho.js'`.

- [ ] **Step 3: Write `backend/src/services/zoho.js`**

```js
import { config } from '../config.js';

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry - 60_000) return cachedToken;
  const url = `${config.zoho.accountsUrl}/oauth/v2/token` +
    `?refresh_token=${encodeURIComponent(config.zoho.refreshToken)}` +
    `&client_id=${encodeURIComponent(config.zoho.clientId)}` +
    `&client_secret=${encodeURIComponent(config.zoho.clientSecret)}` +
    `&grant_type=refresh_token`;
  const res = await fetch(url, { method: 'POST' });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Zoho OAuth error: ${JSON.stringify(data)}`);
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in ?? 3600) * 1000;
  return cachedToken;
}

async function zohoFetch(path, options = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${config.zoho.apiUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Zoho ${path} ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

// ---------- Leads (formularios informativos "Solicitar información") ----------

function normalizePhone(raw) {
  const cleaned = String(raw).trim().replace(/\s+/g, '');
  return cleaned.startsWith('+') ? cleaned : '+34' + cleaned;
}

const SERVICIO_MAP = {
  'Canje de Carnet Extranjero':        'Canje',
  'Duplicado de Carnet de Conducir':   'Duplicado Carnet De Conducir',
  'Duplicado por Cambio de Datos':     'Duplicado Carnet De Conducir',
  'Permiso Internacional de Conducir': 'Otras gestiones',
  'Transferencia de Vehículo':         'Transferencia de VEhículos',
  'Baja de Vehículo':                  'Transferencia de VEhículos',
  'Cancelación de Reserva de Dominio': 'Otras gestiones',
  'Duplicado Permiso de Circulación':  'Otras gestiones',
};

export async function createLead(leadData, clientIp) {
  const nameParts = leadData.nombre.trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts.at(-1) : nameParts[0];
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';

  const phone = normalizePhone(leadData.telefono);
  const servicio = SERVICIO_MAP[leadData.tramite] || 'Otras gestiones';

  const record = {
    Last_Name: lastName,
    ...(firstName && { First_Name: firstName }),
    Phone: phone,
    Mobile: phone,
    Email: leadData.email,
    Lead_Source: config.zoho.leadSourceDefault,
    Lead_Status: config.zoho.leadStatusDefault,
    Pagina_Procedencia: config.zoho.pageSourceDefault,
    Campa_a: servicio,
    LOPD: true,
    Description: `Trámite de interés: ${leadData.tramite}`,
  };

  const baseUrl = `/crm/${config.zoho.apiVersion}/Leads`;
  const url = config.zoho.assignmentRuleId ? `${baseUrl}?lar_id=${config.zoho.assignmentRuleId}` : baseUrl;

  const result = await zohoFetch(url, { method: 'POST', body: JSON.stringify({ data: [record] }) });
  const status = result?.data?.[0]?.status;
  if (status !== 'success') throw new Error(`Zoho lead error: ${JSON.stringify(result)}`);
  return result.data[0].details?.id;
}

// ---------- Contacts / Deals / Notes (checkout + portal) ----------

export async function upsertContact(user) {
  if (!config.zoho.enabled) {
    console.log('[zoho:demo] upsertContact', user.email);
    return null;
  }
  const search = await zohoFetch(
    `/crm/v6/Contacts/search?criteria=${encodeURIComponent(`(Email:equals:${user.email})`)}`
  ).catch(() => null);
  const existing = search?.data?.[0];

  const fields = {
    First_Name: user.nombre,
    Last_Name: user.apellidos || user.nombre,
    Email: user.email,
    Mobile: user.telefono || undefined,
    N_de_documento: user.numDocumento || undefined,
    Tipo_de_documento: user.tipoDocumento || undefined,
    Lead_Source: 'Formulario web Gestadia',
  };

  if (existing) {
    await zohoFetch('/crm/v6/Contacts', { method: 'PUT', body: JSON.stringify({ data: [{ id: existing.id, ...fields }] }) });
    return existing.id;
  }
  const created = await zohoFetch('/crm/v6/Contacts', { method: 'POST', body: JSON.stringify({ data: [fields], trigger: ['workflow'] }) });
  return created?.data?.[0]?.details?.id ?? null;
}

export async function createDealForExpediente(expediente, user, servicio, contactId) {
  if (!config.zoho.enabled) {
    console.log('[zoho:demo] createDeal', expediente.nPedido, servicio.zoho.servicio);
    return null;
  }
  const hoy = new Date();
  const fin = new Date(hoy.getTime() + 14 * 24 * 3600 * 1000);
  const d = (x) => x.toISOString().slice(0, 10);

  const deal = {
    Deal_Name: `${servicio.nombre} — ${user.nombre} ${user.apellidos}`.slice(0, 120),
    Amount: expediente.importe,
    Stage: 'Pte. documentación',
    Contact_Name: contactId ? { id: contactId } : undefined,
    Servicio: servicio.zoho.servicio,
    [servicio.zoho.faseField]: Object.keys(servicio.zoho.fases)[0],
    Pago_Confirmado: true,
    Fecha_de_pago: d(hoy),
    M_todos_de_pago: expediente.pagoMetodo === 'bizum' ? 'Bizum' : 'Stripe',
    Ref_pago: expediente.pagoRef || undefined,
    N_Pedido: expediente.nPedido,
    Fecha_M_xima_para_Desistimiento: d(fin),
    Lead_Source: 'Formulario web Gestadia',
    Closing_Date: d(fin),
    Description: `Contratado online desde el portal. Pedido ${expediente.nPedido}.`,
  };

  const created = await zohoFetch('/crm/v6/Deals', { method: 'POST', body: JSON.stringify({ data: [deal], trigger: ['workflow', 'blueprint'] }) });
  return created?.data?.[0]?.details?.id ?? null;
}

export async function addDealNote(dealId, titulo, contenido) {
  if (!config.zoho.enabled || !dealId) {
    console.log('[zoho:demo] nota en deal', dealId, titulo);
    return;
  }
  await zohoFetch('/crm/v6/Notes', {
    method: 'POST',
    body: JSON.stringify({ data: [{ Note_Title: titulo, Note_Content: contenido, Parent_Id: { module: { api_name: 'Deals' }, id: dealId } }] }),
  }).catch((e) => console.error('Zoho note error:', e.message));
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd backend && node --test src/services/zoho.test.js`
Expected: both tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/zoho.js backend/src/services/zoho.test.js
git commit -m "feat: consolidate Zoho leads + contacts/deals into one service"
```

> **Note for the implementer:** `createLead` no longer sends `IP` or `Zoho_Campaign` — verification against the real CRM schema (`ZohoCRM_getFields` for the `Leads` module) showed neither field exists there, so the old code was silently no-oping. If the business wants IP tracking or campaign linking restored, that needs a real field created in Zoho first — flag it back to the user rather than re-adding a call to a nonexistent field.

---

### Task 7: `routes/leads.js` + `server.js` entrypoint

**Files:**
- Create: `backend/src/routes/leads.js`
- Create: `backend/src/server.js`
- Test: `backend/src/routes/leads.test.js`
- Test: `backend/src/server.test.js`

**Interfaces:**
- Consumes: `createLead` (Task 6), `config` (Task 5), all routers from Task 3.
- Produces: `leadsRouter` (default export style matching the other routers: `export const leadsRouter = Router()`); `backend/src/server.js` exports nothing (it's the entrypoint) but is importable for tests via `createApp()`.

- [ ] **Step 1: Write the failing test** — create `backend/src/routes/leads.test.js`

```js
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'node:http';

test('POST /api/leads returns 400 when required fields are missing', async () => {
  mock.module('../services/zoho.js', { namedExports: { createLead: async () => 'lead1' } });
  const { leadsRouter } = await import('./leads.js?t=' + Date.now());
  const app = express();
  app.use(express.json());
  app.use(leadsRouter);
  const server = app.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Ana' }),
  });
  assert.equal(res.status, 400);
  server.close();
});

test('POST /api/leads returns the lead id on success', async () => {
  mock.module('../services/zoho.js', { namedExports: { createLead: async () => 'lead1' } });
  const { leadsRouter } = await import('./leads.js?t=' + Date.now() + 1);
  const app = express();
  app.use(express.json());
  app.use(leadsRouter);
  const server = app.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Ana Ruiz', telefono: '600111222', email: 'ana@example.com', tramite: 'Canje de Carnet Extranjero' }),
  });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.id, 'lead1');
  server.close();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd backend && node --test src/routes/leads.test.js`
Expected: FAIL — `Cannot find module './leads.js'`.

- [ ] **Step 3: Write `backend/src/routes/leads.js`** (behavior identical to today's `POST /api/leads` in the repo-root `server.js`)

```js
import { Router } from 'express';
import { createLead } from '../services/zoho.js';

export const leadsRouter = Router();

leadsRouter.post('/api/leads', async (req, res) => {
  const { nombre, telefono, email, tramite } = req.body;

  if (!nombre || !telefono || !email || !tramite) {
    return res.status(400).json({ ok: false, error: 'Faltan campos requeridos' });
  }

  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '';

  try {
    const leadId = await createLead({ nombre, telefono, email, tramite }, clientIp);
    res.json({ ok: true, id: leadId });
  } catch (err) {
    console.error('[leads]', err.message);
    res.status(500).json({ ok: false, error: 'Error al registrar la solicitud' });
  }
});
```

- [ ] **Step 4: Run the leads test to verify it passes**

Run: `cd backend && node --test src/routes/leads.test.js`
Expected: both tests PASS.

- [ ] **Step 5: Write the failing server test** — create `backend/src/server.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './server.js';

test('GET /api/health responds ok', async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/api/health`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.ok, true);
  server.close();
});

test('GET /api/servicios responds with the catalog', async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/api/servicios`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(body));
  assert.ok(body.some((s) => s.slug === 'canje'));
  server.close();
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `cd backend && node --test src/server.test.js`
Expected: FAIL — `Cannot find module './server.js'`.

- [ ] **Step 7: Write `backend/src/server.js`**

```js
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { leadsRouter } from './routes/leads.js';
import { checkoutRouter } from './routes/checkout.js';
import { authRouter } from './routes/auth.js';
import { portalRouter } from './routes/portal.js';
import { webhooksRouter } from './routes/webhooks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIST = path.join(__dirname, '..', '..', 'frontend', 'dist');

export function createApp() {
  const app = express();

  // Los webhooks de Stripe necesitan el body en crudo → se montan ANTES del json()
  app.use(webhooksRouter);
  app.use(express.json({ limit: '1mb' }));

  app.use(leadsRouter);
  app.use(authRouter);
  app.use(checkoutRouter);
  app.use(portalRouter);

  app.get('/api/health', (_req, res) => res.json({
    ok: true,
    stripe: config.stripe.enabled ? 'activo' : 'MODO DEMO (pago simulado)',
    zoho: config.zoho.enabled ? 'activo' : 'desactivado (solo log)',
    email: config.smtp.enabled ? 'activo' : 'consola',
  }));

  // En producción, sirve el build de React y hace fallback a index.html
  // para cualquier ruta que no sea /api ni /webhooks (React Router).
  app.use(express.static(FRONTEND_DIST));
  app.get(/^(?!\/api|\/webhooks).*/, (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'), (err) => {
      if (err) res.status(404).send('Frontend no compilado — ejecuta `npm run build` en frontend/');
    });
  });

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(400).json({ error: err.message || 'Error inesperado' });
  });

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createApp().listen(config.port, () => {
    console.log(`Gestadia backend ▸ ${config.baseUrl}`);
    console.log(`  Stripe: ${config.stripe.enabled ? 'activo' : 'MODO DEMO'} · Zoho: ${config.zoho.enabled ? 'activo' : 'off'} · SMTP: ${config.smtp.enabled ? 'activo' : 'consola'}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\nError: el puerto ${config.port} ya está en uso.\nCierra el proceso anterior o usa: PORT=3002 npm start\n`);
      process.exit(1);
    }
    throw err;
  });
}

process.on('uncaughtException', (e) => console.error('uncaughtException:', e));
process.on('unhandledRejection', (e) => console.error('unhandledRejection:', e));
```

- [ ] **Step 8: Run the server test to verify it passes**

Run: `cd backend && node --test src/server.test.js` (reads `DATABASE_URL` from `backend/.env` via `dotenv/config`)
Expected: both tests PASS. (The SPA-fallback route will 404 until the frontend plan produces `frontend/dist` — that's expected and not tested here.)

- [ ] **Step 9: Commit**

```bash
git add backend/src/routes/leads.js backend/src/routes/leads.test.js backend/src/server.js backend/src/server.test.js
git commit -m "feat: add leads router and fused server.js entrypoint"
```

---

### Task 8: Repo-root `.env.example` cleanup

**Files:**
- Modify: `.env.example` (repo root)

**Interfaces:**
- None new — this task is documentation-only. It does not touch `.env` (repo root or `backend/`) since both real env files already have everything they need from Tasks 1–2.

**Context (read before starting):** the original plan text for this task assumed the repo-root `.env` would hold every variable `backend/src/config.js` reads. That's no longer the design — Task 1/2 already put all backend config (Zoho, Stripe, JWT, SMTP, DATABASE_URL) into `backend/.env`, which `backend/src/config.js` reads via `dotenv/config` relative to `backend/`'s working directory. The repo-root `.env` now only needs to supply `FTP_*` variables, which `ftp-deploy.cjs` (Task 9) still reads for deployment. This task exists only to fix the repo-root `.env.example` so it no longer documents a Zoho block that's been superseded by `backend/.env.example` — the real repo-root `.env` (gitignored, already has working FTP + Zoho values) does NOT need any edits.

- [ ] **Step 1: Replace `.env.example`** at the repo root — remove the now-superseded Zoho block (that documentation lives in `backend/.env.example` now) and document only what `ftp-deploy.cjs` reads:

```
# --- Despliegue FTP (usado por ftp-deploy.cjs) ---
FTP_HOST=
FTP_USER=
FTP_PASS=
FTP_PORT=21
FTP_SECURE=true
FTP_SECURE_REJECT_UNAUTHORIZED=true
FTP_FORCE_PASSIVE_IPV4=false
FTP_REMOTE_DIR=/
FTP_UPLOAD_RETRIES=4
FTP_SKIP_PATHS=

# La configuración de Zoho/Stripe/JWT/SMTP/DATABASE_URL del backend fusionado
# vive en backend/.env — ver backend/.env.example para esa plantilla.
```

- [ ] **Step 2: Confirm the real repo-root `.env` still has working `FTP_*` values** (it does — nothing to change there; just open it and check `FTP_HOST`/`FTP_USER`/`FTP_PASS` are non-empty, don't edit anything else in it).

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "docs: simplify repo-root .env.example now that backend config lives in backend/.env.example"
```

---

### Task 9: `ftp-deploy` update

**Files:**
- Create: `ftp-deploy.cjs` (renamed from `ftp-deploy.js`, content updated)
- Delete: `ftp-deploy.js`
- Modify: `package.json` (repo root)

**Interfaces:**
- Consumes: `frontend/dist` (produced by the sibling frontend plan — this task can run before that plan finishes; the upload step will simply find nothing under `frontend/dist` yet, which is fine, it's a manual `npm run deploy` step).

- [ ] **Step 1: Rename and update the file**

```bash
git mv ftp-deploy.js ftp-deploy.cjs
```

Edit `ftp-deploy.cjs`'s `INCLUDE`-building logic: replace the hardcoded list of `preview-*.html` + `server.js` with a recursive upload of `backend/` (excluding `node_modules` and `uploads`) and `frontend/dist/`:

```js
// Sube el backend fusionado y el build de React al servidor FTP
// Uso: node ftp-deploy.cjs
require('dotenv').config();
const ftp = require('basic-ftp');
const fs  = require('fs');
const path = require('path');

const ROOT = __dirname;

const EXCLUDE_DIRS = new Set(['node_modules', 'uploads', '.git']);

function collectFiles(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(full, base));
    else out.push(path.relative(base, full));
  }
  return out;
}

const RETRIES = parseInt(process.env.FTP_UPLOAD_RETRIES || '4', 10);

async function uploadFile(client, localPath, remotePath, retries) {
  for (let i = 1; i <= retries; i++) {
    try {
      await client.uploadFrom(localPath, remotePath);
      return;
    } catch (err) {
      if (i === retries) throw err;
      console.warn(`  ↺ reintento ${i}/${retries}: ${remotePath}`);
    }
  }
}

async function deploy() {
  const host = process.env.FTP_HOST;
  const user = process.env.FTP_USER;
  const pass = process.env.FTP_PASS;
  const port = parseInt(process.env.FTP_PORT || '21', 10);
  const secure = process.env.FTP_SECURE === 'true';
  const remoteDir = process.env.FTP_REMOTE_DIR || '/';

  if (!host || !user || !pass) {
    console.error('❌ Faltan FTP_HOST, FTP_USER o FTP_PASS en .env');
    process.exit(1);
  }

  const client = new ftp.Client();
  client.ftp.verbose = false;

  const targets = [
    { local: path.join(ROOT, 'backend'), remote: 'backend' },
    { local: path.join(ROOT, 'frontend', 'dist'), remote: 'frontend/dist' },
  ].filter((t) => fs.existsSync(t.local));

  try {
    console.log(`\n🚀 Conectando a ${host}:${port}…`);
    await client.access({ host, user, password: pass, port, secure, secureOptions: { rejectUnauthorized: process.env.FTP_SECURE_REJECT_UNAUTHORIZED !== 'false' } });
    await client.ensureDir(remoteDir);

    let ok = 0;
    for (const { local, remote } of targets) {
      for (const rel of collectFiles(local)) {
        const localPath = path.join(local, rel);
        const remotePath = path.posix.join(remoteDir, remote, rel.split(path.sep).join('/'));
        process.stdout.write(`  ↑ ${remote}/${rel} … `);
        await uploadFile(client, localPath, remotePath, RETRIES);
        console.log('✓');
        ok++;
      }
    }
    console.log(`\n✅ Deploy completado: ${ok} archivo(s) subido(s).`);
  } catch (err) {
    console.error('\n❌ Error durante el deploy:', err.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
```

- [ ] **Step 2: Update the repo-root `package.json` `deploy` script**

Modify `c:\Users\gloria.aleix\.source\repos\Gestadia_Portal\package.json`:

```json
{
  "scripts": {
    "deploy": "node ftp-deploy.cjs"
  }
}
```

- [ ] **Step 3: Dry-run against a scratch local folder** (don't hit the real FTP yet — just confirm `collectFiles` walks correctly)

Run: `node -e "const {collectFiles}=(()=>{const m=require('./ftp-deploy.cjs');return {}})();" ` — instead, simpler manual check:
Run: `node -e "console.log(require('fs').readdirSync('backend').filter(f=>f!=='node_modules'))"`
Expected: prints `['prisma','src','uploads','package.json','package-lock.json','.env.example']` (order may vary) — confirms the directory structure `ftp-deploy.cjs` will walk.

- [ ] **Step 4: Commit**

```bash
git add ftp-deploy.cjs package.json
git rm ftp-deploy.js
git commit -m "feat: rewrite ftp-deploy to upload backend/ and frontend/dist"
```

---

### Task 10: Playwright smoke test for the fused backend

**Files:**
- Create: `tests/backend-smoke.spec.js`
- Modify: `package.json` (repo root) — Playwright config already exists; verify `testDir` covers `tests/`

**Interfaces:**
- Consumes: a running instance of `backend` (`npm run dev` inside `backend/`, pointed at the test DB).

- [ ] **Step 1: Write the failing test** — create `tests/backend-smoke.spec.js`

```js
import { test, expect } from '@playwright/test';

const BASE = process.env.BACKEND_URL || 'http://localhost:3001';

test('GET /api/health returns ok', async ({ request }) => {
  const res = await request.get(`${BASE}/api/health`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
});

test('GET /api/servicios returns the catalog', async ({ request }) => {
  const res = await request.get(`${BASE}/api/servicios`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.some((s) => s.slug === 'canje')).toBe(true);
});

test('POST /api/leads with valid payload returns ok:true', async ({ request }) => {
  const res = await request.post(`${BASE}/api/leads`, {
    data: { nombre: 'Test Usuario', telefono: '600111222', email: 'test@example.com', tramite: 'Canje de Carnet Extranjero' },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
});
```

- [ ] **Step 2: Start the backend against the test DB in one terminal**

Run: `cd backend && npm run dev` (`PORT=3001` and `DATABASE_URL` both come from `backend/.env`)
Expected: `Gestadia backend ▸ http://localhost:3001` printed, no errors.

- [ ] **Step 3: Run the smoke test**

Run: `npx playwright test tests/backend-smoke.spec.js`
Expected: 3 passed. (`POST /api/leads` runs with `ZOHO_CLIENT_ID` unset in the test DB env, so `createLead`'s underlying `zohoFetch` will hit real Zoho only if credentials are present in that shell's env — if you deliberately unset them for this run, `config.zoho.enabled` is irrelevant here because `createLead` doesn't check `enabled` before calling Zoho, so use a `.env.test`-scoped shell without real Zoho creds and expect this specific test to instead assert `res.status() === 500` in that case. Prefer running this test with real (sandboxed test-safe) Zoho creds if available, otherwise adjust the assertion to `expect([200,500]).toContain(res.status())` and log the body for manual inspection.)

- [ ] **Step 4: Commit**

```bash
git add tests/backend-smoke.spec.js
git commit -m "test: add Playwright smoke test for the fused backend"
```

---

## Definition of Done

- [ ] `cd backend && npm run dev` starts without errors and logs the Stripe/Zoho/SMTP mode line.
- [ ] `curl http://localhost:3001/api/health` returns `{"ok":true,...}`.
- [ ] `curl -X POST http://localhost:3001/api/leads -H 'Content-Type: application/json' -d '{"nombre":"Test","telefono":"600111222","email":"t@example.com","tramite":"Canje de Carnet Extranjero"}'` returns `{"ok":true,"id":"..."}` (verify the corresponding Lead appears in Zoho CRM using `ZohoCRM_getRecords` on the `Leads` module, filtered by that email).
- [ ] `cd backend && node --test src/**/*.test.js` — all pass.
- [ ] `npx playwright test tests/backend-smoke.spec.js` — all pass.
- [ ] No file under `c:\Users\gloria.aleix\.source\repos\unir` was modified.
