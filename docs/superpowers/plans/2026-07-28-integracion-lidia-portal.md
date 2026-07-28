# Integración LidIA — Parte Portal (Contrato 1.0) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar la parte del Portal del contrato 1.0 con LidIA: endpoint de checkout-intent idempotente, enlace corto `/c/:token` con checkout prellenado y banner de verificación, atribución de procedencia en el expediente, escritura económica en la Oportunidad Zoho existente y callbacks firmados con cola persistente.

**Architecture:** LidIA hace `POST /api/integrations/lidia/checkout-intent` (API key + idempotencia) → se persiste un `CheckoutIntent` y se devuelve enlace corto. El cliente abre `/c/:token`, el frontend resuelve el prellenado por un GET público y monta el `CheckoutForm` existente con banner. Al pagar, `fulfillPayment` actualiza el Deal Zoho existente (no crea) y encola eventos en una tabla outbox (`LidiaEvento`) que un worker despacha firmados con HMAC y reintentos.

**Tech Stack:** Node 22 ESM + Express 4 + Prisma 6 (MySQL) + Stripe; tests backend con `node:test` (`--experimental-test-module-mocks`, patrón `mock.module` + `await import('./x.js?t=' + Date.now())`); React 18 + Vite + vitest/testing-library en frontend.

## Global Constraints

- **Fuente de verdad del API:** `docs/integraciones/2026-07-28-contrato-lidia-portal-v1-0.md`. Nombres de campos, códigos de error, estados y firma EXACTOS como allí.
- Errores del API de integración siempre `{ error, message, trace_id }`.
- Estados del intent: `active | opened | paid | expired | cancelled` (en inglés, son API pública).
- Fase 1: solo `catalog_code: canje_1_categoria` → `canje-carnet`, 21000 céntimos EUR (derivado del catálogo, no hardcodear el precio dos veces).
- Firma callback: `X-Gestadia-Signature: <keyId>=hex(HMAC-SHA256(secret, timestamp + "." + raw_body))`, `X-Gestadia-Timestamp` en segundos Unix, `X-Gestadia-Key-Id`.
- Nunca escribir `Lead_Source` ni `Mobile` en Zoho desde el flujo LidIA. Correcciones solo allowlist: First_Name, Last_Name, Email, tipo/nº documento.
- Nunca loguear `num_documento` completo.
- Sin secretos en Git — todo por env vars (`LIDIA_*`).
- Comandos backend se ejecutan desde `backend/`; frontend desde `frontend/`.
- UI en castellano.

## File Structure

- Modify `backend/src/config.js` — sección `config.lidia`.
- Create `backend/src/services/lidia.js` — catálogo LidIA, mapeos de prefill, outbox (encolar/firmar/despachar/expirar), datos de pago/correcciones.
- Create `backend/src/services/lidia.test.js`.
- Modify `backend/prisma/schema.prisma` — `CheckoutIntent`, `LidiaEvento`, `Expediente.procedencia/origenMeta`.
- Modify `shared/paises-canje.js` — `ISO_A_CLAVE`, `claveDesdeISO`.
- Create `backend/src/routes/integrations.js` + `backend/src/routes/integrations.test.js`.
- Modify `backend/src/routes/checkout.js` — token de intent + rama LidIA en `fulfillPayment`.
- Create `backend/src/routes/checkout.lidia.test.js`.
- Modify `backend/src/services/zoho.js` — `updateDealPago`, `updateContactPermitidos`.
- Create `backend/src/services/zoho.lidia.test.js`.
- Modify `backend/src/app.js` (montaje + rate limit) y `backend/src/server.js` (worker).
- Create `backend/scripts/lidia-replay.mjs`.
- Modify `frontend/src/lib/api.js`, `frontend/src/App.jsx`, `frontend/src/pages/Checkout.jsx`, `frontend/src/pages/servicios/CheckoutForm.jsx`, `frontend/src/pages/Checkout.module.css`.
- Create `frontend/src/pages/CheckoutIntent.jsx` + `frontend/src/pages/CheckoutIntent.test.jsx` + `frontend/src/pages/servicios/CheckoutForm.lidia.test.jsx`.

---

### Task 1: Config `lidia` + catálogo LidIA

**Files:**
- Modify: `backend/src/config.js`
- Create: `backend/src/services/lidia.js`
- Test: `backend/src/services/lidia.test.js`

**Interfaces:**
- Produces: `config.lidia` (`apiKey`, `callbackBaseUrl`, `callbackSecret`, `callbackKeyVersion`, `intentTtlDias`, getter `callbackUrl`, getter `enabled`); `catalogoLidia(code) → { servicioSlug, amountMinor, currency } | null`.

- [ ] **Step 1: Write the failing test**

Create `backend/src/services/lidia.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogoLidia } from './lidia.js';
import { config } from '../config.js';

test('catalogoLidia resuelve canje_1_categoria con el precio del catálogo', () => {
  const cat = catalogoLidia('canje_1_categoria');
  assert.equal(cat.servicioSlug, 'canje-carnet');
  assert.equal(cat.amountMinor, 21000);
  assert.equal(cat.currency, 'EUR');
});

test('catalogoLidia devuelve null para códigos no habilitados', () => {
  assert.equal(catalogoLidia('canje_2_categorias'), null);
  assert.equal(catalogoLidia(''), null);
  assert.equal(catalogoLidia(undefined), null);
});

test('config.lidia expone TTL por defecto de 7 días y callbackUrl con la ruta fija', () => {
  assert.equal(config.lidia.intentTtlDias, 7);
  assert.equal(config.lidia.callbackKeyVersion, 'v1');
  // sin LIDIA_CALLBACK_BASE_URL la URL queda vacía (integración apagada)
  assert.equal(config.lidia.callbackUrl, '');
  assert.equal(config.lidia.enabled, false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (desde `backend/`): `node --experimental-test-module-mocks --test src/services/lidia.test.js`
Expected: FAIL — `Cannot find module './lidia.js'` y `config.lidia` undefined.

- [ ] **Step 3: Write minimal implementation**

En `backend/src/config.js`, añadir dentro del objeto `config` (después de `smtp`):

```js
  lidia: {
    apiKey: process.env.LIDIA_API_KEY || '',
    callbackBaseUrl: process.env.LIDIA_CALLBACK_BASE_URL || '',
    callbackSecret: process.env.LIDIA_CALLBACK_SECRET || '',
    callbackKeyVersion: process.env.LIDIA_CALLBACK_KEY_VERSION || 'v1',
    intentTtlDias: Number(process.env.LIDIA_INTENT_TTL_DIAS || 7),
    get callbackUrl() {
      // Ruta relativa fija del contrato 1.0 (§8.1); solo cambia la base por entorno.
      return this.callbackBaseUrl ? `${this.callbackBaseUrl}/api/integrations/gestadia-portal/payment-events` : '';
    },
    get enabled() { return !!this.apiKey; },
  },
```

Create `backend/src/services/lidia.js`:

```js
// Integración LidIA (contrato 1.0: docs/integraciones/2026-07-28-contrato-lidia-portal-v1-0.md)
import { getServicio } from '../catalog.js';

// Fase 1: solo una categoría. canje_2_categorias se activará añadiendo la
// entrada cuando negocio publique el precio (cambio compatible 1.x).
const CATALOGO_LIDIA = {
  canje_1_categoria: { servicioSlug: 'canje-carnet' },
};

export function catalogoLidia(code) {
  const c = CATALOGO_LIDIA[code];
  if (!c) return null;
  const servicio = getServicio(c.servicioSlug);
  return { ...c, amountMinor: Math.round(servicio.precio * 100), currency: 'EUR' };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-test-module-mocks --test src/services/lidia.test.js`
Expected: PASS (3 tests). Nota: si el entorno local tiene `LIDIA_*` en `.env`, el tercer test puede fallar — ejecutarlo sin esas vars.

- [ ] **Step 5: Commit**

```bash
git add backend/src/config.js backend/src/services/lidia.js backend/src/services/lidia.test.js
git commit -m "feat(lidia): config de integración y catálogo fase 1"
```

---

### Task 2: Modelos Prisma `CheckoutIntent`, `LidiaEvento` y procedencia en `Expediente`

**Files:**
- Modify: `backend/prisma/schema.prisma`

**Interfaces:**
- Produces: `db.checkoutIntent` y `db.lidiaEvento` (Prisma Client) con los campos de abajo; `Expediente.procedencia` (default `"web"`) y `Expediente.origenMeta Json?`.

- [ ] **Step 1: Añadir modelos al schema**

En `backend/prisma/schema.prisma`, añadir a `Expediente` (tras `datosPais Json?`):

```prisma
  procedencia      String    @default("web")
  origenMeta       Json?
```

Y al final del fichero:

```prisma
model CheckoutIntent {
  id                    String   @id @default(uuid())
  publicId              String   @unique
  token                 String   @unique
  idempotencyKey        String   @unique
  payloadHash           String
  procedencia           String
  servicioSlug          String
  catalogCode           String
  amountMinor           Int
  currency              String   @default("EUR")
  lidiaPaymentId        String
  lidiaPaymentAttemptId String
  replacesId            String?
  prefill               Json
  origenMeta            Json
  estado                String   @default("active")
  expiresAt             DateTime
  expedienteId          String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([lidiaPaymentId])
  @@index([estado, expiresAt])
}

model LidiaEvento {
  id               String    @id @default(uuid())
  eventId          String    @unique
  eventType        String
  checkoutIntentId String
  payload          String    @db.Text
  estado           String    @default("pendiente")
  intentos         Int       @default(0)
  proximoIntento   DateTime  @default(now())
  ultimaRespuesta  String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  @@index([estado, proximoIntento])
}
```

Nota: `payload` es `String @db.Text` (no `Json`) a propósito — se firma el cuerpo EXACTO serializado una sola vez (contrato §8.2).

- [ ] **Step 2: Validar y migrar**

Run: `npx prisma validate`
Expected: `The schema … is valid`.
Run: `npx prisma migrate dev --name lidia_checkout_intent`
Expected: migración creada en `backend/prisma/migrations/…_lidia_checkout_intent/` y `prisma generate` regenerado. (Si no hay MySQL local: `npx prisma migrate dev --create-only --name lidia_checkout_intent` y aplicar después.)

- [ ] **Step 3: Commit**

```bash
git add backend/prisma
git commit -m "feat(lidia): modelos CheckoutIntent y LidiaEvento + procedencia en Expediente"
```

---

### Task 3: Mapeos de prellenado (ISO 3166 → clave, tipo_documento, prefill)

**Files:**
- Modify: `shared/paises-canje.js`
- Modify: `backend/src/services/lidia.js`
- Test: `backend/src/services/lidia.test.js`

**Interfaces:**
- Produces: `ISO_A_CLAVE`, `claveDesdeISO(iso) → clave|null` (shared); `mapearPrefill(prefill) → { nombre?, apellidos?, email?, tipoDocumento?, numDocumento?, paisCanje?, telefono? }` (solo campos mapeables; `direccion` string NO se mapea).

- [ ] **Step 1: Write the failing tests** (añadir a `backend/src/services/lidia.test.js`)

```js
import { claveDesdeISO } from '../../../shared/paises-canje.js';
import { mapearPrefill } from './lidia.js';

test('claveDesdeISO mapea alfa-2 a claves del catálogo', () => {
  assert.equal(claveDesdeISO('CO'), 'colombia');
  assert.equal(claveDesdeISO('gb'), 'reino-unido');
  assert.equal(claveDesdeISO('DE'), 'alemania');
  assert.equal(claveDesdeISO('US'), null);  // no canjeable
  assert.equal(claveDesdeISO(''), null);
});

test('mapearPrefill traduce el prefill del contrato al formato del formulario', () => {
  const out = mapearPrefill({
    nombre: 'Ana', apellidos: 'García López', email: 'ana@example.com',
    tipo_documento: 'PASAPORTE', num_documento: 'X1234567L',
    pais_canje: 'CO', direccion: 'Calle Ejemplo 10, Madrid', telefono: '+34600111222',
  });
  assert.deepEqual(out, {
    nombre: 'Ana', apellidos: 'García López', email: 'ana@example.com',
    tipoDocumento: 'Pasaporte', numDocumento: 'X1234567L',
    paisCanje: 'colombia', telefono: '+34600111222',
  });
});

test('mapearPrefill omite lo no mapeable sin romper', () => {
  assert.deepEqual(mapearPrefill({ tipo_documento: 'OTRO', pais_canje: 'US' }), {});
  assert.deepEqual(mapearPrefill(undefined), {});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-test-module-mocks --test src/services/lidia.test.js`
Expected: FAIL — `claveDesdeISO`/`mapearPrefill` no exportados.

- [ ] **Step 3: Write implementation**

En `shared/paises-canje.js`, añadir al final:

```js
// ISO 3166-1 alfa-2 → clave interna (contrato LidIA 1.0 §6.4: alfa-2 mayúsculas)
export const ISO_A_CLAVE = {
  AD: 'andorra', DZ: 'argelia', AR: 'argentina', BO: 'bolivia', BR: 'brasil',
  CL: 'chile', CO: 'colombia', KR: 'corea-del-sur', CR: 'costa-rica',
  EC: 'ecuador', SV: 'el-salvador', PH: 'filipinas', GE: 'georgia',
  GT: 'guatemala', HN: 'honduras', JP: 'japon', MK: 'macedonia-del-norte',
  MA: 'marruecos', MD: 'moldavia', MC: 'monaco', NI: 'nicaragua',
  NZ: 'nueva-zelanda', PA: 'panama', PY: 'paraguay', PE: 'peru',
  GB: 'reino-unido', DO: 'republica-dominicana', RS: 'serbia', CH: 'suiza',
  TN: 'tunez', TR: 'turquia', UA: 'ucrania', UY: 'uruguay',
  DE: 'alemania', AT: 'austria', BE: 'belgica', BG: 'bulgaria', CY: 'chipre',
  HR: 'croacia', DK: 'dinamarca', SK: 'eslovaquia', SI: 'eslovenia',
  EE: 'estonia', FI: 'finlandia', FR: 'francia', GR: 'grecia', HU: 'hungria',
  IE: 'irlanda', IS: 'islandia', IT: 'italia', LV: 'letonia',
  LI: 'liechtenstein', LT: 'lituania', LU: 'luxemburgo', MT: 'malta',
  NO: 'noruega', NL: 'paises-bajos', PL: 'polonia', PT: 'portugal',
  CZ: 'republica-checa', RO: 'rumania', SE: 'suecia',
};

export function claveDesdeISO(iso) {
  const clave = ISO_A_CLAVE[String(iso || '').toUpperCase()];
  return clave && PAISES[clave] ? clave : null;
}
```

En `backend/src/services/lidia.js`, añadir:

```js
import { claveDesdeISO } from '../../../shared/paises-canje.js';

const TIPO_DOC_ENTRADA = { DNI: 'DNI', NIE: 'NIE', PASAPORTE: 'Pasaporte' };

// Prefill del contrato (§6.2) → campos del CheckoutForm. Todo lo no mapeable
// se omite: el cliente lo completa a mano. `direccion` llega como texto libre
// y es solo informativa (confirmación 1.0): no prellena el formulario.
export function mapearPrefill(prefill) {
  const p = prefill || {};
  const out = {};
  if (p.nombre) out.nombre = String(p.nombre);
  if (p.apellidos) out.apellidos = String(p.apellidos);
  if (p.email) out.email = String(p.email);
  const tipo = TIPO_DOC_ENTRADA[String(p.tipo_documento || '').toUpperCase()];
  if (tipo) out.tipoDocumento = tipo;
  if (p.num_documento) out.numDocumento = String(p.num_documento);
  const clave = claveDesdeISO(p.pais_canje);
  if (clave) out.paisCanje = clave;
  if (p.telefono) out.telefono = String(p.telefono);
  return out;
}
```

Nota: el backend ya importa `shared/` con rutas relativas (`backend/src/catalog.js` hace `import … from '../../shared/servicios.js'`) — desde `src/services/` son tres niveles (`../../../shared/`).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-test-module-mocks --test src/services/lidia.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add shared/paises-canje.js backend/src/services/lidia.js backend/src/services/lidia.test.js
git commit -m "feat(lidia): mapeo ISO alfa-2 a claves de país y prefill del contrato"
```

---

### Task 4: `POST /api/integrations/lidia/checkout-intent` — validaciones y creación

**Files:**
- Create: `backend/src/routes/integrations.js`
- Test: `backend/src/routes/integrations.test.js`

**Interfaces:**
- Consumes: `catalogoLidia` (Task 1), `db.checkoutIntent` (Task 2), `config.lidia` (Task 1).
- Produces: router `integrationsRouter`; respuesta de creación `{ schema_version, checkout_intent_id ('gci_…'), lidia_payment_id, lidia_payment_attempt_id, url ('<baseUrl>/c/<token>'), expires_at, status, reused }`; helper interno `errRes` con `{ error, message, trace_id }`.

- [ ] **Step 1: Write the failing tests**

Create `backend/src/routes/integrations.test.js`:

```js
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

const cfgFake = {
  baseUrl: 'http://portal.test',
  lidia: {
    apiKey: 'clave-test', callbackBaseUrl: 'http://lidia.test',
    callbackSecret: 'secreto-test', callbackKeyVersion: 'v1', intentTtlDias: 7,
    get callbackUrl() { return 'http://lidia.test/api/integrations/gestadia-portal/payment-events'; },
    get enabled() { return true; },
  },
  stripe: { enabled: false }, zoho: { enabled: false }, smtp: { enabled: false },
};

export function fakeDb() {
  const intents = new Map();
  const eventos = [];
  const buscar = (where) => [...intents.values()].find((i) =>
    (where.id && i.id === where.id) ||
    (where.idempotencyKey && i.idempotencyKey === where.idempotencyKey) ||
    (where.token && i.token === where.token) ||
    (where.publicId && i.publicId === where.publicId)) || null;
  return {
    intents, eventos,
    checkoutIntent: {
      findUnique: async ({ where }) => buscar(where),
      findFirst: async ({ where }) => [...intents.values()].find((i) => !where?.expedienteId || i.expedienteId === where.expedienteId) || null,
      create: async ({ data }) => {
        const intent = { id: `ci${intents.size + 1}`, expedienteId: null, createdAt: new Date(), updatedAt: new Date(), ...data };
        intents.set(intent.id, intent);
        return intent;
      },
      update: async ({ where, data }) => { const i = buscar(where); Object.assign(i, data, { updatedAt: new Date() }); return i; },
      updateMany: async ({ where, data }) => {
        const i = buscar({ publicId: where.publicId });
        if (i && (!where.estado || where.estado.in.includes(i.estado))) { Object.assign(i, data); return { count: 1 }; }
        return { count: 0 };
      },
      findMany: async () => [...intents.values()],
    },
    lidiaEvento: {
      create: async ({ data }) => { eventos.push({ id: `ev${eventos.length + 1}`, ...data }); return eventos.at(-1); },
      findMany: async () => eventos,
      update: async ({ where, data }) => { const e = eventos.find((x) => x.id === where.id || x.eventId === where.eventId); Object.assign(e, data); return e; },
      findUnique: async ({ where }) => eventos.find((x) => x.eventId === where.eventId) || null,
    },
    expediente: { findUnique: async () => null },
  };
}

export async function montarApp(db) {
  mock.module('../config.js', { namedExports: { config: cfgFake } });
  mock.module('../db.js', { namedExports: { db } });
  const { integrationsRouter } = await import('./integrations.js?t=' + Date.now() + Math.random());
  const app = express();
  app.use(express.json());
  app.use(integrationsRouter);
  return app.listen(0);
}

export function bodyValido(extra = {}) {
  return {
    schema_version: '1.0',
    idempotency_key: '6be7f522-1149-45a5-bbd0-58cf420e3d53',
    lidia_payment_id: 'b093ce58-8dc9-4c3e-b4c3-85851b24cf66',
    lidia_payment_attempt_id: 'ee151822-573c-42d6-8a0a-5fe80f0f0f36',
    lidia_session_id: '184237', lidia_contact_id: '9317', lidia_agent_id: '178',
    service: 'canje-carnet', catalog_code: 'canje_1_categoria',
    amount_minor: 21000, currency: 'EUR', telefono: '+34600111222',
    zoho_contact_id: '572576000012345678', zoho_deal_id: '572576000087654321',
    ...extra,
  };
}

export async function postIntent(port, body, apiKey = 'clave-test') {
  return fetch(`http://localhost:${port}/api/integrations/lidia/checkout-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'X-Api-Key': apiKey } : {}) },
    body: JSON.stringify(body),
  });
}

test('sin api key valida → 401 unauthorized con trace_id', async () => {
  const server = await montarApp(fakeDb());
  const res = await postIntent(server.address().port, bodyValido(), 'clave-mala');
  const body = await res.json();
  assert.equal(res.status, 401);
  assert.equal(body.error, 'unauthorized');
  assert.ok(body.trace_id);
  server.close(); mock.reset();
});

test('schema_version desconocida → 400 unsupported_schema_version', async () => {
  const server = await montarApp(fakeDb());
  const res = await postIntent(server.address().port, bodyValido({ schema_version: '2.0' }));
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'unsupported_schema_version');
  server.close(); mock.reset();
});

test('payload inválido → 400 invalid_payload (falta campo, UUID malo, E.164 malo)', async () => {
  const server = await montarApp(fakeDb());
  const port = server.address().port;
  for (const roto of [
    { telefono: undefined }, { idempotency_key: 'no-es-uuid' },
    { telefono: '600111222' }, { amount_minor: 210.5 }, { currency: 'eur' },
  ]) {
    const res = await postIntent(port, bodyValido(roto));
    assert.equal(res.status, 400, JSON.stringify(roto));
    assert.equal((await res.json()).error, 'invalid_payload');
  }
  server.close(); mock.reset();
});

test('ids de Zoho no numéricos → 409 zoho_reference_invalid', async () => {
  const server = await montarApp(fakeDb());
  const res = await postIntent(server.address().port, bodyValido({ zoho_deal_id: 'zcrm_x' }));
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'zoho_reference_invalid');
  server.close(); mock.reset();
});

test('canje_2_categorias → 409 catalog_code_no_disponible', async () => {
  const server = await montarApp(fakeDb());
  const res = await postIntent(server.address().port, bodyValido({ catalog_code: 'canje_2_categorias' }));
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'catalog_code_no_disponible');
  server.close(); mock.reset();
});

test('importe distinto del catálogo → 409 importe_no_coincide con catálogo en céntimos', async () => {
  const server = await montarApp(fakeDb());
  const res = await postIntent(server.address().port, bodyValido({ amount_minor: 20000 }));
  const body = await res.json();
  assert.equal(res.status, 409);
  assert.equal(body.error, 'importe_no_coincide');
  assert.equal(body.amount_minor_catalogo, 21000);
  assert.equal(body.currency_catalogo, 'EUR');
  server.close(); mock.reset();
});

test('creación válida → 201 con la respuesta del contrato §6.6', async () => {
  const db = fakeDb();
  const server = await montarApp(db);
  const res = await postIntent(server.address().port, bodyValido());
  const body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(body.schema_version, '1.0');
  assert.match(body.checkout_intent_id, /^gci_/);
  assert.equal(body.lidia_payment_id, 'b093ce58-8dc9-4c3e-b4c3-85851b24cf66');
  assert.match(body.url, /^http:\/\/portal\.test\/c\/.+/);
  assert.equal(body.status, 'active');
  assert.equal(body.reused, false);
  assert.ok(body.expires_at > new Date().toISOString());
  const intent = [...db.intents.values()][0];
  assert.equal(intent.procedencia, 'lidia');
  assert.equal(intent.origenMeta.zoho_deal_id, '572576000087654321');
  assert.equal(intent.prefill.telefono, '+34600111222');
  server.close(); mock.reset();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-test-module-mocks --test src/routes/integrations.test.js`
Expected: FAIL — `Cannot find module './integrations.js'`.

- [ ] **Step 3: Write implementation**

Create `backend/src/routes/integrations.js`:

```js
// API de integración LidIA — contrato 1.0
// (docs/integraciones/2026-07-28-contrato-lidia-portal-v1-0.md)
import { Router } from 'express';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { db } from '../db.js';
import { catalogoLidia } from '../services/lidia.js';

export const integrationsRouter = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const E164_RE = /^\+[1-9]\d{6,14}$/;

const MENSAJES = {
  unauthorized: 'API key no válida',
  unsupported_schema_version: 'Versión de esquema no soportada',
  invalid_payload: 'Payload inválido',
  zoho_reference_invalid: 'Referencias Zoho no utilizables',
  catalog_code_no_disponible: 'Producto no habilitado',
  importe_no_coincide: 'Precio o moneda no coinciden con el catálogo',
  idempotency_conflict: 'La misma idempotency_key llegó con un payload distinto',
  checkout_intent_not_found: 'Intent inexistente',
};

function errRes(res, status, error, extra = {}) {
  const trace_id = crypto.randomBytes(8).toString('hex');
  console.warn(`[lidia] ${status} ${error} trace=${trace_id}`);
  return res.status(status).json({ error, message: MENSAJES[error] || error, trace_id, ...extra });
}

function requireApiKey(req, res, next) {
  if (!config.lidia.enabled || req.headers['x-api-key'] !== config.lidia.apiKey) {
    return errRes(res, 401, 'unauthorized');
  }
  next();
}

const OBLIGATORIOS = [
  'idempotency_key', 'lidia_payment_id', 'lidia_payment_attempt_id',
  'lidia_session_id', 'lidia_contact_id', 'lidia_agent_id',
  'service', 'catalog_code', 'amount_minor', 'currency', 'telefono',
  'zoho_contact_id', 'zoho_deal_id',
];

// Formatos del contrato §6.4. Devuelve un mensaje de error o null.
function validarFormatos(b) {
  for (const k of OBLIGATORIOS) {
    if (b[k] === undefined || b[k] === null || b[k] === '') return `Falta el campo ${k}`;
  }
  for (const k of ['idempotency_key', 'lidia_payment_id', 'lidia_payment_attempt_id']) {
    if (typeof b[k] !== 'string' || !UUID_RE.test(b[k])) return `${k} debe ser un UUID en minúsculas`;
  }
  for (const k of ['lidia_session_id', 'lidia_contact_id', 'lidia_agent_id', 'zoho_contact_id', 'zoho_deal_id']) {
    if (typeof b[k] !== 'string' || b[k].length > 128) return `${k} debe ser una cadena de hasta 128 caracteres`;
  }
  if (!E164_RE.test(String(b.telefono))) return 'telefono debe usar formato E.164';
  if (!Number.isInteger(b.amount_minor) || b.amount_minor <= 0) return 'amount_minor debe ser un entero positivo';
  if (!/^[A-Z]{3}$/.test(String(b.currency))) return 'currency debe ser ISO 4217 en mayúsculas';
  return null;
}

function respuestaIntent(intent, reused) {
  return {
    schema_version: '1.0',
    checkout_intent_id: intent.publicId,
    lidia_payment_id: intent.lidiaPaymentId,
    lidia_payment_attempt_id: intent.lidiaPaymentAttemptId,
    url: `${config.baseUrl}/c/${intent.token}`,
    expires_at: intent.expiresAt.toISOString(),
    status: intent.estado,
    reused,
  };
}

integrationsRouter.post('/api/integrations/lidia/checkout-intent', requireApiKey, async (req, res) => {
  try {
    const b = req.body || {};
    if (b.schema_version !== '1.0') return errRes(res, 400, 'unsupported_schema_version');
    const errorFormato = validarFormatos(b);
    if (errorFormato) return errRes(res, 400, 'invalid_payload', { message: errorFormato });
    if (!/^\d+$/.test(b.zoho_contact_id) || !/^\d+$/.test(b.zoho_deal_id)) {
      return errRes(res, 409, 'zoho_reference_invalid');
    }
    const cat = catalogoLidia(b.catalog_code);
    if (!cat || cat.servicioSlug !== b.service) return errRes(res, 409, 'catalog_code_no_disponible');
    if (b.amount_minor !== cat.amountMinor || b.currency !== cat.currency) {
      return errRes(res, 409, 'importe_no_coincide', {
        amount_minor_catalogo: cat.amountMinor, currency_catalogo: cat.currency,
      });
    }

    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(b)).digest('hex');
    const existente = await db.checkoutIntent.findUnique({ where: { idempotencyKey: b.idempotency_key } });
    if (existente) {
      if (existente.payloadHash !== payloadHash) return errRes(res, 409, 'idempotency_conflict');
      // Se devuelve sea cual sea su estado (incluido expired) para que LidIA lo sepa.
      return res.status(200).json(respuestaIntent(existente, true));
    }

    if (b.replaces_checkout_intent_id) {
      // El sustituido queda cancelled sin evento: la regeneración la inicia
      // LidIA y así un callback atrasado del intento anterior no pisa al nuevo.
      await db.checkoutIntent.updateMany({
        where: { publicId: String(b.replaces_checkout_intent_id), estado: { in: ['active', 'opened', 'expired'] } },
        data: { estado: 'cancelled' },
      });
    }

    const intent = await db.checkoutIntent.create({
      data: {
        publicId: 'gci_' + crypto.randomBytes(12).toString('base64url'),
        token: crypto.randomBytes(18).toString('base64url'),
        idempotencyKey: b.idempotency_key,
        payloadHash,
        procedencia: 'lidia',
        servicioSlug: b.service,
        catalogCode: b.catalog_code,
        amountMinor: b.amount_minor,
        currency: b.currency,
        lidiaPaymentId: b.lidia_payment_id,
        lidiaPaymentAttemptId: b.lidia_payment_attempt_id,
        replacesId: b.replaces_checkout_intent_id || null,
        prefill: { ...(b.prefill || {}), telefono: b.telefono },
        origenMeta: {
          lidia_session_id: b.lidia_session_id,
          lidia_contact_id: b.lidia_contact_id,
          lidia_agent_id: b.lidia_agent_id,
          zoho_contact_id: b.zoho_contact_id,
          zoho_deal_id: b.zoho_deal_id,
          extra: b.extra ?? null,
        },
        estado: 'active',
        expiresAt: new Date(Date.now() + config.lidia.intentTtlDias * 24 * 3600 * 1000),
      },
    });
    res.status(201).json(respuestaIntent(intent, false));
  } catch (e) {
    console.error('[lidia] checkout-intent error:', e);
    errRes(res, 500, 'internal_error');
  }
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-test-module-mocks --test src/routes/integrations.test.js`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/integrations.js backend/src/routes/integrations.test.js
git commit -m "feat(lidia): POST checkout-intent con validaciones del contrato 1.0"
```

---

### Task 5: Idempotencia (`reused`, `idempotency_conflict`) y `replaces_checkout_intent_id`

**Files:**
- Modify: `backend/src/routes/integrations.test.js` (solo tests — la lógica ya está en Task 4; esta task la verifica y corrige lo que falte)

**Interfaces:**
- Consumes: `montarApp`, `fakeDb`, `bodyValido`, `postIntent` del propio fichero de test (Task 4).

- [ ] **Step 1: Write the failing tests** (añadir al final de `integrations.test.js`)

```js
test('misma idempotency_key y mismo payload → 200 con el mismo intent y reused true', async () => {
  const db = fakeDb();
  const server = await montarApp(db);
  const port = server.address().port;
  const r1 = await postIntent(port, bodyValido());
  const b1 = await r1.json();
  const r2 = await postIntent(port, bodyValido());
  const b2 = await r2.json();
  assert.equal(r2.status, 200);
  assert.equal(b2.reused, true);
  assert.equal(b2.checkout_intent_id, b1.checkout_intent_id);
  assert.equal(db.intents.size, 1);
  server.close(); mock.reset();
});

test('misma idempotency_key con payload distinto → 409 idempotency_conflict', async () => {
  const server = await montarApp(fakeDb());
  const port = server.address().port;
  await postIntent(port, bodyValido());
  const res = await postIntent(port, bodyValido({ telefono: '+34699999999' }));
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'idempotency_conflict');
  server.close(); mock.reset();
});

test('replaces_checkout_intent_id cancela el intent sustituido y crea uno nuevo', async () => {
  const db = fakeDb();
  const server = await montarApp(db);
  const port = server.address().port;
  const b1 = await (await postIntent(port, bodyValido())).json();
  const res = await postIntent(port, bodyValido({
    idempotency_key: '11111111-2222-4333-8444-555555555555',
    lidia_payment_attempt_id: '99999999-8888-4777-8666-555555555555',
    replaces_checkout_intent_id: b1.checkout_intent_id,
  }));
  const b2 = await res.json();
  assert.equal(res.status, 201);
  assert.equal(b2.lidia_payment_id, 'b093ce58-8dc9-4c3e-b4c3-85851b24cf66'); // mismo ciclo
  assert.notEqual(b2.checkout_intent_id, b1.checkout_intent_id);
  const anterior = [...db.intents.values()].find((i) => i.publicId === b1.checkout_intent_id);
  assert.equal(anterior.estado, 'cancelled');
  server.close(); mock.reset();
});
```

- [ ] **Step 2: Run tests**

Run: `node --experimental-test-module-mocks --test src/routes/integrations.test.js`
Expected: PASS directamente si Task 4 quedó bien (la lógica ya existe). Si algo falla, corregir `integrations.js` hasta que pase — estos tres tests son el criterio de aceptación del contrato §5.2.

- [ ] **Step 3: Commit**

```bash
git add backend/src/routes/integrations.test.js
git commit -m "test(lidia): idempotencia reused/conflict y regeneración con replaces"
```

---

### Task 6: Outbox — `encolarEvento`, firma HMAC, despacho con backoff, expiración y replay

**Files:**
- Modify: `backend/src/services/lidia.js`
- Create: `backend/scripts/lidia-replay.mjs`
- Test: `backend/src/services/lidia.test.js`

**Interfaces:**
- Consumes: `db.lidiaEvento`, `db.checkoutIntent` (Task 2), `config.lidia` (Task 1).
- Produces:
  - `firmarCallback(rawBody, timestampSegundos) → 'v1=<hex64>'`
  - `encolarEvento(eventType, intent, extra = {}) → eventId` (persiste el cuerpo EXACTO como string)
  - `despacharEventosPendientes(fetchImpl = fetch) → void` (política: 2xx→`enviado`, 400/401→`manual`, 409→`reconciliar`, 429/5xx/red→reintento 1/10/60/360/1440 min, 6º fallo→`agotado`)
  - `expirarIntents() → void` (`active|opened` vencidos → `expired` + evento `checkout.expired`)

- [ ] **Step 1: Write the failing tests** (añadir a `backend/src/services/lidia.test.js`; usar mocks frescos porque este bloque necesita db/config falsos)

```js
import { mock } from 'node:test';
import crypto from 'node:crypto';

const cfgLidia = {
  baseUrl: 'http://portal.test',
  lidia: {
    apiKey: 'k', callbackBaseUrl: 'http://lidia.test', callbackSecret: 'secreto-test',
    callbackKeyVersion: 'v1', intentTtlDias: 7,
    get callbackUrl() { return 'http://lidia.test/api/integrations/gestadia-portal/payment-events'; },
    get enabled() { return true; },
  },
  zoho: { enabled: false }, stripe: { enabled: false }, smtp: { enabled: false },
};

function dbEventos() {
  const eventos = [];
  const intents = [];
  return {
    eventos, intents,
    lidiaEvento: {
      create: async ({ data }) => { eventos.push({ id: `ev${eventos.length + 1}`, intentos: 0, ...data }); return eventos.at(-1); },
      findMany: async ({ where }) => eventos.filter((e) => e.estado === 'pendiente' && e.proximoIntento <= (where?.proximoIntento?.lte ?? new Date())),
      update: async ({ where, data }) => { const e = eventos.find((x) => x.id === where.id); Object.assign(e, data); return e; },
    },
    checkoutIntent: {
      findMany: async () => intents.filter((i) => ['active', 'opened'].includes(i.estado) && i.expiresAt < new Date()),
      update: async ({ where, data }) => { const i = intents.find((x) => x.id === where.id); Object.assign(i, data); return i; },
    },
  };
}

const intentDemo = {
  id: 'ci1', publicId: 'gci_test1', lidiaPaymentId: 'b093ce58-8dc9-4c3e-b4c3-85851b24cf66',
  lidiaPaymentAttemptId: 'ee151822-573c-42d6-8a0a-5fe80f0f0f36',
  origenMeta: { lidia_session_id: '184237' }, estado: 'active',
  expiresAt: new Date(Date.now() + 1000), amountMinor: 21000, currency: 'EUR', prefill: {},
};

async function cargarLidia(db) {
  mock.module('../config.js', { namedExports: { config: cfgLidia } });
  mock.module('../db.js', { namedExports: { db } });
  return import('./lidia.js?t=' + Date.now() + Math.random());
}

test('firmarCallback firma timestamp.body con HMAC-SHA256 hex y prefijo de clave', async () => {
  const db = dbEventos();
  const { firmarCallback } = await cargarLidia(db);
  const esperado = 'v1=' + crypto.createHmac('sha256', 'secreto-test').update('1785235351.{"a":1}').digest('hex');
  assert.equal(firmarCallback('{"a":1}', 1785235351), esperado);
  mock.reset();
});

test('encolarEvento persiste el cuerpo exacto del contrato como string', async () => {
  const db = dbEventos();
  const { encolarEvento } = await cargarLidia(db);
  const eventId = await encolarEvento('checkout.opened', intentDemo);
  assert.match(eventId, /^evt_/);
  const ev = db.eventos[0];
  assert.equal(ev.eventType, 'checkout.opened');
  const cuerpo = JSON.parse(ev.payload);
  assert.equal(cuerpo.schema_version, '1.0');
  assert.equal(cuerpo.event_id, eventId);
  assert.equal(cuerpo.checkout_intent_id, 'gci_test1');
  assert.equal(cuerpo.lidia_session_id, '184237');
  mock.reset();
});

test('despachar: 2xx → enviado con cabeceras de firma correctas', async () => {
  const db = dbEventos();
  const { encolarEvento, despacharEventosPendientes, firmarCallback } = await cargarLidia(db);
  await encolarEvento('checkout.opened', intentDemo);
  let visto;
  await despacharEventosPendientes(async (url, opts) => { visto = { url, opts }; return { status: 200 }; });
  assert.equal(db.eventos[0].estado, 'enviado');
  assert.equal(visto.url, 'http://lidia.test/api/integrations/gestadia-portal/payment-events');
  assert.equal(visto.opts.headers['X-Gestadia-Key-Id'], 'v1');
  const ts = Number(visto.opts.headers['X-Gestadia-Timestamp']);
  assert.equal(visto.opts.headers['X-Gestadia-Signature'], firmarCallback(visto.opts.body, ts));
  mock.reset();
});

test('despachar: 400/401 → manual; 409 → reconciliar; 5xx → reintento con backoff', async () => {
  for (const [status, esperado] of [[400, 'manual'], [401, 'manual'], [409, 'reconciliar'], [503, 'pendiente']]) {
    const db = dbEventos();
    const { encolarEvento, despacharEventosPendientes } = await cargarLidia(db);
    await encolarEvento('payment.succeeded', intentDemo);
    await despacharEventosPendientes(async () => ({ status }));
    assert.equal(db.eventos[0].estado, esperado, `status ${status}`);
    if (esperado === 'pendiente') {
      assert.equal(db.eventos[0].intentos, 1);
      assert.ok(db.eventos[0].proximoIntento > new Date()); // reprogramado a +1 min
    }
    mock.reset();
  }
});

test('despachar: al sexto fallo el evento queda agotado', async () => {
  const db = dbEventos();
  const { encolarEvento, despacharEventosPendientes } = await cargarLidia(db);
  await encolarEvento('payment.succeeded', intentDemo);
  for (let i = 0; i < 6; i++) {
    db.eventos[0].proximoIntento = new Date(0); // fuerza elegibilidad
    await despacharEventosPendientes(async () => ({ status: 500 }));
  }
  assert.equal(db.eventos[0].estado, 'agotado');
  assert.equal(db.eventos[0].intentos, 6);
  mock.reset();
});

test('expirarIntents marca expired y encola checkout.expired', async () => {
  const db = dbEventos();
  db.intents.push({ ...intentDemo, expiresAt: new Date(Date.now() - 1000) });
  const { expirarIntents } = await cargarLidia(db);
  await expirarIntents();
  assert.equal(db.intents[0].estado, 'expired');
  assert.equal(db.eventos[0]?.eventType, 'checkout.expired');
  mock.reset();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-test-module-mocks --test src/services/lidia.test.js`
Expected: FAIL — funciones no exportadas.

- [ ] **Step 3: Write implementation** (añadir a `backend/src/services/lidia.js`)

```js
import crypto from 'node:crypto';
import { config } from '../config.js';
import { db } from '../db.js';

export function firmarCallback(rawBody, timestampSegundos) {
  const firma = crypto.createHmac('sha256', config.lidia.callbackSecret)
    .update(`${timestampSegundos}.${rawBody}`).digest('hex');
  return `${config.lidia.callbackKeyVersion}=${firma}`;
}

// Persiste el cuerpo EXACTO serializado una sola vez: la firma del contrato
// (§8.2) es sobre el body literal, no sobre un JSON re-serializado.
export async function encolarEvento(eventType, intent, extra = {}) {
  const eventId = 'evt_' + crypto.randomBytes(12).toString('base64url');
  const payload = JSON.stringify({
    schema_version: '1.0',
    event_id: eventId,
    event_type: eventType,
    occurred_at: new Date().toISOString(),
    checkout_intent_id: intent.publicId,
    lidia_payment_id: intent.lidiaPaymentId,
    lidia_payment_attempt_id: intent.lidiaPaymentAttemptId,
    lidia_session_id: intent.origenMeta?.lidia_session_id ?? null,
    ...extra,
  });
  await db.lidiaEvento.create({
    data: { eventId, eventType, checkoutIntentId: intent.id, payload, estado: 'pendiente', intentos: 0, proximoIntento: new Date() },
  });
  return eventId;
}

// Reintentos del contrato §9 (minutos). intento n falla → espera BACKOFF_MIN[n-1].
const BACKOFF_MIN = [1, 10, 60, 360, 1440];

export async function despacharEventosPendientes(fetchImpl = fetch) {
  if (!config.lidia.callbackUrl || !config.lidia.callbackSecret) return;
  const pendientes = await db.lidiaEvento.findMany({
    where: { estado: 'pendiente', proximoIntento: { lte: new Date() } }, take: 20,
  });
  for (const ev of pendientes) {
    const timestamp = Math.floor(Date.now() / 1000);
    let status = 0;
    try {
      const res = await fetchImpl(config.lidia.callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gestadia-Key-Id': config.lidia.callbackKeyVersion,
          'X-Gestadia-Timestamp': String(timestamp),
          'X-Gestadia-Signature': firmarCallback(ev.payload, timestamp),
        },
        body: ev.payload,
      });
      status = res.status;
    } catch { status = 0; } // fallo de red → reintento
    const n = ev.intentos + 1;
    let estado;
    if (status >= 200 && status < 300) estado = 'enviado';
    else if (status === 400 || status === 401) estado = 'manual';
    else if (status === 409) estado = 'reconciliar';
    else estado = n > BACKOFF_MIN.length ? 'agotado' : 'pendiente';
    const data = { estado, intentos: n, ultimaRespuesta: String(status) };
    if (estado === 'pendiente') data.proximoIntento = new Date(Date.now() + BACKOFF_MIN[n - 1] * 60_000);
    if (estado === 'agotado' || estado === 'manual') {
      console.error(`[lidia] evento ${ev.eventId} → ${estado} (HTTP ${status}, ${n} intentos). Replay: node scripts/lidia-replay.mjs ${ev.eventId}`);
    }
    await db.lidiaEvento.update({ where: { id: ev.id }, data });
  }
}

export async function expirarIntents() {
  const vencidos = await db.checkoutIntent.findMany({
    where: { estado: { in: ['active', 'opened'] }, expiresAt: { lt: new Date() } },
  });
  for (const intent of vencidos) {
    await db.checkoutIntent.update({ where: { id: intent.id }, data: { estado: 'expired' } });
    await encolarEvento('checkout.expired', intent);
  }
}
```

Create `backend/scripts/lidia-replay.mjs`:

```js
// Reencola un evento de la outbox LidIA para reenviarlo (contrato §9, replay manual).
// Uso (desde backend/): node scripts/lidia-replay.mjs <event_id>
import { db } from '../src/db.js';

const eventId = process.argv[2];
if (!eventId) { console.error('Uso: node scripts/lidia-replay.mjs <event_id>'); process.exit(1); }
const ev = await db.lidiaEvento.findUnique({ where: { eventId } });
if (!ev) { console.error(`Evento ${eventId} no encontrado`); process.exit(1); }
await db.lidiaEvento.update({ where: { eventId }, data: { estado: 'pendiente', proximoIntento: new Date() } });
console.log(`Evento ${eventId} reencolado (estado anterior: ${ev.estado}, intentos: ${ev.intentos})`);
process.exit(0);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-test-module-mocks --test src/services/lidia.test.js`
Expected: PASS. Ojo: los tests de las Tasks 1/3 importan `./lidia.js` sin mocks — al añadir `import { db } from '../db.js'` a lidia.js, esos tests arrancan un PrismaClient real sin conectar (solo instancia, no conecta hasta la primera query) — siguen pasando. Si fallara la instanciación por `DATABASE_URL` ausente, añadir a `backend/.env` un valor dummy `DATABASE_URL="mysql://user:pass@localhost:3306/db"`.

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/lidia.js backend/src/services/lidia.test.js backend/scripts/lidia-replay.mjs
git commit -m "feat(lidia): outbox de callbacks con firma HMAC, backoff, expiración y replay"
```

---

### Task 7: `GET` autenticado de reconciliación y `GET` público del token

**Files:**
- Modify: `backend/src/routes/integrations.js`
- Test: `backend/src/routes/integrations.test.js`

**Interfaces:**
- Consumes: `mapearPrefill`, `encolarEvento` (Tasks 3/6).
- Produces:
  - `GET /api/integrations/lidia/checkout-intents/:publicId` (auth) → §7.2 del contrato.
  - `GET /api/checkout-intent/:token` (público) → `{ servicio, procedencia, prefill }` | `{ pagado: true, nPedido }` | `404`. Primera apertura: `active → opened` + evento `checkout.opened`.

- [ ] **Step 1: Write the failing tests** (añadir a `integrations.test.js`)

```js
test('GET autenticado devuelve el estado completo; 404 si no existe', async () => {
  const db = fakeDb();
  const server = await montarApp(db);
  const port = server.address().port;
  const creado = await (await postIntent(port, bodyValido())).json();
  const res = await fetch(`http://localhost:${port}/api/integrations/lidia/checkout-intents/${creado.checkout_intent_id}`, { headers: { 'X-Api-Key': 'clave-test' } });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.checkout_intent_id, creado.checkout_intent_id);
  assert.equal(body.status, 'active');
  assert.equal(body.amount_minor, 21000);
  assert.equal(body.n_pedido, null);
  const res404 = await fetch(`http://localhost:${port}/api/integrations/lidia/checkout-intents/gci_nope`, { headers: { 'X-Api-Key': 'clave-test' } });
  assert.equal(res404.status, 404);
  assert.equal((await res404.json()).error, 'checkout_intent_not_found');
  server.close(); mock.reset();
});

test('GET público devuelve solo prellenado mapeado, marca opened y encola el evento una vez', async () => {
  const db = fakeDb();
  const server = await montarApp(db);
  const port = server.address().port;
  await postIntent(port, bodyValido({ prefill: { nombre: 'Ana', pais_canje: 'CO', tipo_documento: 'PASAPORTE', direccion: 'Calle X 1' } }));
  const token = [...db.intents.values()][0].token;
  const res = await fetch(`http://localhost:${port}/api/checkout-intent/${token}`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.servicio, 'canje-carnet');
  assert.equal(body.procedencia, 'lidia');
  assert.equal(body.prefill.nombre, 'Ana');
  assert.equal(body.prefill.paisCanje, 'colombia');
  assert.equal(body.prefill.tipoDocumento, 'Pasaporte');
  assert.equal(body.prefill.telefono, '+34600111222');
  assert.equal(body.prefill.direccion, undefined);          // texto libre: no se prellena
  assert.equal(body.zoho_deal_id, undefined);               // jamás ids internos
  assert.equal([...db.intents.values()][0].estado, 'opened');
  assert.equal(db.eventos.filter((e) => e.eventType === 'checkout.opened').length, 1);
  await fetch(`http://localhost:${port}/api/checkout-intent/${token}`); // segunda apertura
  assert.equal(db.eventos.filter((e) => e.eventType === 'checkout.opened').length, 1); // sigue 1
  server.close(); mock.reset();
});

test('GET público: token desconocido o intent expirado/cancelado → 404; pagado → {pagado, nPedido}', async () => {
  const db = fakeDb();
  const server = await montarApp(db);
  const port = server.address().port;
  await postIntent(port, bodyValido());
  const intent = [...db.intents.values()][0];
  assert.equal((await fetch(`http://localhost:${port}/api/checkout-intent/no-existe`)).status, 404);
  intent.estado = 'expired';
  assert.equal((await fetch(`http://localhost:${port}/api/checkout-intent/${intent.token}`)).status, 404);
  intent.estado = 'paid';
  intent.expedienteId = 'e1';
  db.expediente.findUnique = async () => ({ id: 'e1', nPedido: 'GST-202607-11111' });
  const res = await fetch(`http://localhost:${port}/api/checkout-intent/${intent.token}`);
  const body = await res.json();
  assert.equal(body.pagado, true);
  assert.equal(body.nPedido, 'GST-202607-11111');
  server.close(); mock.reset();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-test-module-mocks --test src/routes/integrations.test.js`
Expected: FAIL — 404 de Express en las rutas GET nuevas.

- [ ] **Step 3: Write implementation** (añadir a `integrations.js`; ampliar el import de lidia.js)

```js
import { catalogoLidia, mapearPrefill, encolarEvento } from '../services/lidia.js';

// Reconciliación (contrato §7): fuente de verdad si un callback se pierde.
integrationsRouter.get('/api/integrations/lidia/checkout-intents/:publicId', requireApiKey, async (req, res) => {
  try {
    const intent = await db.checkoutIntent.findUnique({ where: { publicId: req.params.publicId } });
    if (!intent) return errRes(res, 404, 'checkout_intent_not_found');
    const expediente = intent.expedienteId
      ? await db.expediente.findUnique({ where: { id: intent.expedienteId } })
      : null;
    res.json({
      schema_version: '1.0',
      checkout_intent_id: intent.publicId,
      lidia_payment_id: intent.lidiaPaymentId,
      lidia_payment_attempt_id: intent.lidiaPaymentAttemptId,
      status: intent.estado,
      url: `${config.baseUrl}/c/${intent.token}`,
      expires_at: intent.expiresAt.toISOString(),
      n_pedido: expediente?.nPedido ?? null,
      amount_minor: intent.amountMinor,
      currency: intent.currency,
      payment_method: expediente?.pagoMetodo ?? null,
      paid_at: expediente?.fechaPago ? new Date(expediente.fechaPago).toISOString() : null,
      updated_at: new Date(intent.updatedAt).toISOString(),
    });
  } catch (e) {
    console.error('[lidia] GET intent error:', e);
    errRes(res, 500, 'internal_error');
  }
});

// Resolución pública del enlace corto para el frontend. Devuelve SOLO el
// prellenado — nunca ids de Zoho/LidIA ni estado interno.
integrationsRouter.get('/api/checkout-intent/:token', async (req, res) => {
  try {
    const intent = await db.checkoutIntent.findUnique({ where: { token: req.params.token } });
    if (!intent || intent.estado === 'expired' || intent.estado === 'cancelled') {
      return res.status(404).json({ error: 'Enlace no válido o caducado' });
    }
    if (intent.estado === 'paid') {
      const expediente = intent.expedienteId
        ? await db.expediente.findUnique({ where: { id: intent.expedienteId } })
        : null;
      return res.json({ pagado: true, nPedido: expediente?.nPedido ?? null });
    }
    if (intent.expiresAt < new Date()) {
      return res.status(404).json({ error: 'Enlace no válido o caducado' });
    }
    if (intent.estado === 'active') {
      await db.checkoutIntent.update({ where: { id: intent.id }, data: { estado: 'opened' } });
      await encolarEvento('checkout.opened', intent);
    }
    res.json({ servicio: intent.servicioSlug, procedencia: intent.procedencia, prefill: mapearPrefill(intent.prefill) });
  } catch (e) {
    console.error('[lidia] GET token error:', e);
    res.status(500).json({ error: 'No se pudo procesar la solicitud. Inténtalo de nuevo.' });
  }
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-test-module-mocks --test src/routes/integrations.test.js`
Expected: PASS (13 tests).

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/integrations.js backend/src/routes/integrations.test.js
git commit -m "feat(lidia): GET de reconciliación y resolución pública del enlace corto"
```

---

### Task 8: Zoho — `updateDealPago` y `updateContactPermitidos`

**Files:**
- Modify: `backend/src/services/zoho.js`
- Test: `backend/src/services/zoho.lidia.test.js` (nuevo)

**Interfaces:**
- Consumes: `zohoFetch` interno de `zoho.js`.
- Produces: `updateDealPago(dealId, expediente) → boolean` (PUT económico, sin `Lead_Source`); `updateContactPermitidos(contactId, user) → void` (allowlist, sin `Mobile`).

- [ ] **Step 1: Write the failing tests**

Create `backend/src/services/zoho.lidia.test.js`:

```js
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

const cfgZoho = {
  zoho: {
    clientId: 'id', clientSecret: 'sec', refreshToken: 'rt',
    accountsUrl: 'https://accounts.test', apiUrl: 'https://api.test', apiVersion: 'v6',
    get enabled() { return true; },
  },
  lidia: { get enabled() { return false; } },
  stripe: { enabled: false }, smtp: { enabled: false }, baseUrl: 'http://portal.test',
};

function stubFetch(llamadas) {
  return async (url, opts = {}) => {
    llamadas.push({ url: String(url), opts });
    if (String(url).includes('/oauth/v2/token')) {
      return { ok: true, status: 200, json: async () => ({ access_token: 'tok', expires_in: 3600 }) };
    }
    return { ok: true, status: 200, json: async () => ({ data: [{ status: 'success', details: { id: 'x' } }] }) };
  };
}

const expedienteDemo = { pagoMetodo: 'bizum', pagoRef: 'pi_123', nPedido: 'GST-202607-12345', importe: 210 };

test('updateDealPago hace PUT económico al deal sin tocar Lead_Source ni Pipeline', async (t) => {
  const llamadas = [];
  const originalFetch = global.fetch;
  global.fetch = stubFetch(llamadas);
  t.after(() => { global.fetch = originalFetch; });
  mock.module('../config.js', { namedExports: { config: cfgZoho } });
  const { updateDealPago } = await import('./zoho.js?t=' + Date.now() + Math.random());
  const ok = await updateDealPago('5725760000876', expedienteDemo);
  assert.equal(ok, true);
  const put = llamadas.find((c) => c.opts.method === 'PUT' && c.url.includes('/Deals'));
  const registro = JSON.parse(put.opts.body).data[0];
  assert.equal(registro.id, '5725760000876');
  assert.equal(registro.Stage, 'Cerrado ganado');
  assert.equal(registro.Pago_Confirmado, true);
  assert.equal(registro.M_todos_de_pago, 'Bizum');
  assert.equal(registro.N_Pedido, 'GST-202607-12345');
  assert.equal(registro.Amount, 210);
  assert.equal(registro.Lead_Source, undefined);
  assert.equal(registro.Pipeline, undefined);
  mock.reset();
});

test('updateContactPermitidos actualiza solo la allowlist y nunca Mobile', async (t) => {
  const llamadas = [];
  const originalFetch = global.fetch;
  global.fetch = stubFetch(llamadas);
  t.after(() => { global.fetch = originalFetch; });
  mock.module('../config.js', { namedExports: { config: cfgZoho } });
  const { updateContactPermitidos } = await import('./zoho.js?t=' + Date.now() + Math.random());
  await updateContactPermitidos('5725760000123', {
    nombre: 'Ana', apellidos: 'García López', email: 'ana@example.com',
    telefono: '+34600999888', tipoDocumento: 'NIE', numDocumento: 'X1234567L',
  });
  const put = llamadas.find((c) => c.opts.method === 'PUT' && c.url.includes('/Contacts'));
  const registro = JSON.parse(put.opts.body).data[0];
  assert.equal(registro.First_Name, 'Ana');
  assert.equal(registro.Last_Name, 'García López');
  assert.equal(registro.Email, 'ana@example.com');
  assert.equal(registro.N_de_documento, 'X1234567L');
  assert.equal(registro.Mobile, undefined);
  assert.equal(registro.Phone, undefined);
  assert.equal(registro.Lead_Source, undefined);
  mock.reset();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-test-module-mocks --test src/services/zoho.lidia.test.js`
Expected: FAIL — funciones no exportadas.

- [ ] **Step 3: Write implementation** (añadir al final de `backend/src/services/zoho.js`)

```js
// ---------- Integración LidIA (contrato 1.0 §10.2) ----------

// Escritura económica sobre la Oportunidad YA creada por LidIA. No toca
// Lead_Source ni Pipeline: la atribución y el blueprint son suyos.
export async function updateDealPago(dealId, expediente) {
  if (!config.zoho.enabled || !dealId) {
    console.log('[zoho:demo] updateDealPago', dealId, expediente.nPedido);
    return false;
  }
  const hoy = new Date();
  const fin = new Date(hoy.getTime() + 14 * 24 * 3600 * 1000);
  const d = (x) => x.toISOString().slice(0, 10);
  const registro = {
    id: String(dealId),
    Stage: 'Cerrado ganado',
    Pago_Confirmado: true,
    Fecha_de_pago: d(hoy),
    M_todos_de_pago: expediente.pagoMetodo === 'bizum' ? 'Bizum' : 'Stripe',
    Ref_pago: expediente.pagoRef || undefined,
    N_Pedido: expediente.nPedido,
    Amount: expediente.importe,
    Fecha_M_xima_para_Desistimiento: d(fin),
    Closing_Date: d(hoy),
  };
  const result = await zohoFetch('/crm/v6/Deals', {
    method: 'PUT', body: JSON.stringify({ data: [registro], trigger: ['workflow', 'blueprint'] }),
  }).catch((e) => { console.error('Zoho updateDealPago error:', e.message); return null; });
  return result?.data?.[0]?.status === 'success';
}

// Correcciones del cliente en el checkout → Contacto, SOLO allowlist del
// contrato §8.6. Mobile jamás: es la identidad de la conversación de WhatsApp.
export async function updateContactPermitidos(contactId, user) {
  if (!config.zoho.enabled || !contactId) {
    console.log('[zoho:demo] updateContactPermitidos', contactId);
    return;
  }
  const registro = {
    id: String(contactId),
    First_Name: user.nombre,
    Last_Name: user.apellidos || user.nombre,
    Email: user.email,
    Tipo_de_documento: user.tipoDocumento || undefined,
    N_de_documento: user.numDocumento || undefined,
  };
  await zohoFetch('/crm/v6/Contacts', { method: 'PUT', body: JSON.stringify({ data: [registro] }) })
    .catch((e) => console.error('Zoho updateContactPermitidos error:', e.message));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-test-module-mocks --test src/services/zoho.lidia.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/zoho.js backend/src/services/zoho.lidia.test.js
git commit -m "feat(lidia): update económico del Deal y correcciones allowlist del Contact"
```

---

### Task 9: Checkout con token + rama LidIA en `fulfillPayment`

**Files:**
- Modify: `backend/src/services/lidia.js` (añadir `construirDatosPago`)
- Modify: `backend/src/routes/checkout.js`
- Test: `backend/src/routes/checkout.lidia.test.js` (nuevo) y tests de `construirDatosPago` en `lidia.test.js`

**Interfaces:**
- Consumes: `updateDealPago`, `updateContactPermitidos`, `addDealNote`, `upsertContact`, `createDealForExpediente` (zoho.js); `encolarEvento`, `mapearPrefill` (lidia.js); `db.checkoutIntent`.
- Produces: `construirDatosPago(intent, expediente, user) → { n_pedido, status: 'paid', amount_minor, currency, payment_method, datos_confirmados, correcciones: [{campo, valor_confirmado}] }`; `POST /api/checkout` acepta `token` opcional; expediente con `procedencia`/`origenMeta`; Stripe metadata `canal` dinámico.

- [ ] **Step 1: Tests de `construirDatosPago`** (añadir a `backend/src/services/lidia.test.js`, dentro del bloque con mocks de `cargarLidia`)

```js
test('construirDatosPago calcula datos confirmados y correcciones (teléfono informativo)', async () => {
  const db = dbEventos();
  const { construirDatosPago } = await cargarLidia(db);
  const intent = {
    ...intentDemo,
    prefill: { nombre: 'Anna', apellidos: 'García López', email: 'vieja@example.com', telefono: '+34600111222', tipo_documento: 'NIE', num_documento: 'X1234567L' },
  };
  const user = { nombre: 'Ana', apellidos: 'García López', email: 'ana@example.com', telefono: '+34600999888', tipoDocumento: 'NIE', numDocumento: 'X1234567L' };
  const expediente = { nPedido: 'GST-202607-12345', pagoMetodo: 'bizum' };
  const datos = construirDatosPago(intent, expediente, user);
  assert.equal(datos.n_pedido, 'GST-202607-12345');
  assert.equal(datos.status, 'paid');
  assert.equal(datos.amount_minor, 21000);
  assert.equal(datos.payment_method, 'bizum');
  assert.equal(datos.datos_confirmados.nombre, 'Ana');
  assert.equal(datos.datos_confirmados.tipo_documento, 'NIE');
  const campos = datos.correcciones.map((c) => c.campo).sort();
  assert.deepEqual(campos, ['email', 'nombre', 'telefono']);
  assert.equal(datos.correcciones.find((c) => c.campo === 'email').valor_confirmado, 'ana@example.com');
});
```

- [ ] **Step 2: Implementar `construirDatosPago`** (añadir a `backend/src/services/lidia.js`)

```js
const TIPO_DOC_SALIDA = { DNI: 'DNI', NIE: 'NIE', Pasaporte: 'PASAPORTE' };

// Cuerpo de negocio del evento payment.succeeded (contrato §8.4).
// `correcciones` = diff entre lo que mandó LidIA y lo confirmado por el
// cliente; el teléfono se incluye SOLO a título informativo (§8.6).
export function construirDatosPago(intent, expediente, user) {
  const confirmados = {
    nombre: user.nombre,
    apellidos: user.apellidos,
    email: user.email,
    tipo_documento: TIPO_DOC_SALIDA[user.tipoDocumento] || (user.tipoDocumento ? 'OTRO' : null),
    num_documento: user.numDocumento || null,
    telefono: user.telefono || null,
  };
  const mapeado = mapearPrefill(intent.prefill);
  const previos = {
    nombre: mapeado.nombre,
    apellidos: mapeado.apellidos,
    email: mapeado.email,
    tipo_documento: mapeado.tipoDocumento ? TIPO_DOC_SALIDA[mapeado.tipoDocumento] : undefined,
    num_documento: mapeado.numDocumento,
    telefono: mapeado.telefono,
  };
  const correcciones = [];
  for (const [campo, previo] of Object.entries(previos)) {
    if (previo !== undefined && confirmados[campo] && previo !== confirmados[campo]) {
      correcciones.push({ campo, valor_confirmado: confirmados[campo] });
    }
  }
  return {
    n_pedido: expediente.nPedido,
    status: 'paid',
    amount_minor: intent.amountMinor,
    currency: intent.currency,
    payment_method: expediente.pagoMetodo || 'card',
    datos_confirmados: confirmados,
    correcciones,
  };
}
```

Run: `node --experimental-test-module-mocks --test src/services/lidia.test.js` → PASS.

- [ ] **Step 3: Write the failing route tests**

Create `backend/src/routes/checkout.lidia.test.js`:

```js
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

function fakeDbCheckout() {
  const users = new Map(); const expedientes = new Map(); const intents = new Map(); const eventosExp = [];
  return {
    users, expedientes, intents,
    user: {
      findUnique: async ({ where }) => [...users.values()].find((u) => u.email === where.email || u.id === where.id) || null,
      create: async ({ data }) => { const u = { id: `u${users.size + 1}`, zohoContactId: null, stripeCustomerId: null, passwordHash: null, inviteToken: 'inv', ...data }; users.set(u.id, u); return u; },
      update: async ({ where, data }) => { const u = users.get(where.id); Object.assign(u, data); return u; },
    },
    expediente: {
      create: async ({ data }) => { const e = { id: `e${expedientes.size + 1}`, ...data }; expedientes.set(e.id, e); return e; },
      findUnique: async ({ where, include }) => { const e = expedientes.get(where.id); return e ? { ...e, ...(include?.user ? { user: users.get(e.userId) } : {}) } : null; },
      update: async ({ where, data, include }) => { const e = expedientes.get(where.id); Object.assign(e, data); return { ...e, ...(include?.user ? { user: users.get(e.userId) } : {}) }; },
    },
    eventoExpediente: { create: async ({ data }) => { eventosExp.push(data); return data; } },
    checkoutIntent: {
      findUnique: async ({ where }) => [...intents.values()].find((i) => i.token === where.token || i.id === where.id) || null,
      findFirst: async ({ where }) => [...intents.values()].find((i) => i.expedienteId === where.expedienteId) || null,
      update: async ({ where, data }) => { const i = intents.get(where.id); Object.assign(i, data); return i; },
    },
  };
}

const cfgDemo = {
  baseUrl: 'http://portal.test', jwtSecret: 's',
  stripe: { secretKey: '', get enabled() { return false; } },
  zoho: { get enabled() { return false; } },
  smtp: { get enabled() { return false; } },
  lidia: { apiKey: 'k', callbackBaseUrl: '', callbackSecret: '', callbackKeyVersion: 'v1', intentTtlDias: 7, get callbackUrl() { return ''; }, get enabled() { return true; } },
};

function intentDemo(db) {
  const intent = {
    id: 'ci1', publicId: 'gci_1', token: 'tok-lidia-1', idempotencyKey: 'k1', payloadHash: 'h',
    procedencia: 'lidia', servicioSlug: 'canje-carnet', catalogCode: 'canje_1_categoria',
    amountMinor: 21000, currency: 'EUR',
    lidiaPaymentId: 'b093ce58-8dc9-4c3e-b4c3-85851b24cf66',
    lidiaPaymentAttemptId: 'ee151822-573c-42d6-8a0a-5fe80f0f0f36',
    prefill: { nombre: 'Anna', apellidos: 'García', email: 'ana@example.com', telefono: '+34600111222' },
    origenMeta: { lidia_session_id: '184237', zoho_contact_id: '111', zoho_deal_id: '222' },
    estado: 'opened', expiresAt: new Date(Date.now() + 86400000), expedienteId: null,
  };
  db.intents.set(intent.id, intent);
  return intent;
}

async function montarCheckout(db, zohoMock, lidiaMock) {
  mock.module('../config.js', { namedExports: { config: cfgDemo } });
  mock.module('../db.js', { namedExports: { db } });
  mock.module('../services/zoho.js', { namedExports: zohoMock });
  mock.module('../services/stripe.js', { namedExports: { resolvePrice: async () => 'price', getOrCreateCustomer: async () => ({ id: 'cus' }), linkCustomerToZoho: async () => {} } });
  mock.module('../services/notify.js', { namedExports: { sendEmail: async () => {}, notifyUser: async () => {}, transitionExpediente: async () => {} } });
  mock.module('../services/lidia.js', { namedExports: lidiaMock });
  const { checkoutRouter } = await import('./checkout.js?t=' + Date.now() + Math.random());
  const app = express();
  app.use(express.json());
  app.use(checkoutRouter);
  return app.listen(0);
}

function bodyCheckout(extra = {}) {
  return {
    servicio: 'canje-carnet', nombre: 'Ana', apellidos: 'García López',
    email: 'ana@example.com', telefono: '+34600999888', tipoDocumento: 'NIE',
    numDocumento: 'X1234567L', aceptaCondiciones: true,
    paisCanje: 'colombia', datosPais: {},
    direccion: { tipoVia: 'Calle', nombreVia: 'Mayor', numero: '1', codigoPostal: '28001', municipio: 'Madrid', localidad: '', provincia: 'Madrid', bloque: '', portal: '', escalera: '', planta: '', puerta: '', km: '' },
    ...extra,
  };
}

test('checkout con token LidIA: expediente con procedencia, deal actualizado (no creado) y evento encolado', async () => {
  const db = fakeDbCheckout();
  intentDemo(db);
  const llamadas = { updateDeal: 0, createDeal: 0, eventos: [] };
  const zohoMock = {
    upsertContact: async () => 'contacto-nuevo',
    createDealForExpediente: async () => { llamadas.createDeal++; return 'deal-nuevo'; },
    addDealNote: async () => {},
    updateDealPago: async (dealId) => { llamadas.updateDeal++; assert.equal(dealId, '222'); return true; },
    updateContactPermitidos: async () => {},
  };
  const lidiaMock = {
    encolarEvento: async (tipo, _intent, extra) => { llamadas.eventos.push({ tipo, extra }); return 'evt_x'; },
    construirDatosPago: () => ({ n_pedido: 'X', status: 'paid', amount_minor: 21000, currency: 'EUR', payment_method: 'card', datos_confirmados: {}, correcciones: [] }),
    catalogoLidia: () => null, mapearPrefill: () => ({}),
  };
  const server = await montarCheckout(db, zohoMock, lidiaMock);
  const res = await fetch(`http://localhost:${server.address().port}/api/checkout`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyCheckout({ token: 'tok-lidia-1' })),
  });
  assert.equal(res.status, 200);
  const expediente = [...db.expedientes.values()][0];
  assert.equal(expediente.procedencia, 'lidia');
  assert.equal(expediente.origenMeta.zoho_deal_id, '222');
  assert.equal(llamadas.updateDeal, 1);      // se actualizó el deal de LidIA
  assert.equal(llamadas.createDeal, 0);      // NO se creó deal nuevo
  assert.equal(db.intents.get('ci1').estado, 'paid');
  assert.equal(db.intents.get('ci1').expedienteId, expediente.id);
  assert.deepEqual(llamadas.eventos.map((e) => e.tipo), ['payment.succeeded']);
  const usuario = [...db.users.values()][0];
  assert.equal(usuario.zohoContactId, '111'); // enlazado al contacto de LidIA
  server.close(); mock.reset();
});

test('checkout con token LidIA: si el update del deal falla, cae al flujo actual (crear deal)', async () => {
  const db = fakeDbCheckout();
  intentDemo(db);
  const llamadas = { createDeal: 0, notas: [] };
  const zohoMock = {
    upsertContact: async () => 'contacto-nuevo',
    createDealForExpediente: async () => { llamadas.createDeal++; return 'deal-fallback'; },
    addDealNote: async (dealId, titulo) => { llamadas.notas.push({ dealId, titulo }); },
    updateDealPago: async () => false,
    updateContactPermitidos: async () => {},
  };
  const lidiaMock = {
    encolarEvento: async () => 'evt_x',
    construirDatosPago: () => ({ correcciones: [] }),
    catalogoLidia: () => null, mapearPrefill: () => ({}),
  };
  const server = await montarCheckout(db, zohoMock, lidiaMock);
  await fetch(`http://localhost:${server.address().port}/api/checkout`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyCheckout({ token: 'tok-lidia-1' })),
  });
  assert.equal(llamadas.createDeal, 1);
  assert.ok(llamadas.notas.some((n) => n.dealId === 'deal-fallback'));
  server.close(); mock.reset();
});

test('checkout sin token: regresión intacta (procedencia web, flujo Zoho actual)', async () => {
  const db = fakeDbCheckout();
  const llamadas = { createDeal: 0, updateDeal: 0 };
  const zohoMock = {
    upsertContact: async () => 'c1',
    createDealForExpediente: async () => { llamadas.createDeal++; return 'd1'; },
    addDealNote: async () => {},
    updateDealPago: async () => { llamadas.updateDeal++; return true; },
    updateContactPermitidos: async () => {},
  };
  const lidiaMock = { encolarEvento: async () => 'e', construirDatosPago: () => ({ correcciones: [] }), catalogoLidia: () => null, mapearPrefill: () => ({}) };
  const server = await montarCheckout(db, zohoMock, lidiaMock);
  const res = await fetch(`http://localhost:${server.address().port}/api/checkout`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyCheckout()),
  });
  assert.equal(res.status, 200);
  const expediente = [...db.expedientes.values()][0];
  assert.equal(expediente.procedencia, 'web');
  assert.equal(llamadas.createDeal, 1);
  assert.equal(llamadas.updateDeal, 0);
  server.close(); mock.reset();
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `node --experimental-test-module-mocks --test src/routes/checkout.lidia.test.js`
Expected: FAIL — `procedencia` undefined / `updateDealPago` no llamado.

- [ ] **Step 5: Write implementation** (modificar `backend/src/routes/checkout.js`)

Ampliar imports:

```js
import { upsertContact, createDealForExpediente, addDealNote, updateDealPago, updateContactPermitidos } from '../services/zoho.js';
import { encolarEvento, construirDatosPago } from '../services/lidia.js';
```

En el handler de `POST /api/checkout`, tras validar `errorCanje` y antes de crear el usuario, resolver el intent:

```js
    // Enlace de LidIA (contrato 1.0): si llega un token válido y vigente, el
    // expediente hereda la procedencia y la atribución del intent.
    const { token } = req.body || {};
    let intentLidia = null;
    if (token) {
      const candidato = await db.checkoutIntent.findUnique({ where: { token: String(token) } });
      if (candidato && ['active', 'opened'].includes(candidato.estado) && candidato.expiresAt > new Date()) {
        intentLidia = candidato;
      }
    }
```

En `db.expediente.create`, añadir al objeto `data`:

```js
        ...(intentLidia ? { procedencia: intentLidia.procedencia, origenMeta: intentLidia.origenMeta } : {}),
```

Tras crear el `eventoExpediente`, enlazar el intent:

```js
    if (intentLidia) {
      await db.checkoutIntent.update({ where: { id: intentLidia.id }, data: { expedienteId: expediente.id } });
    }
```

Y en el metadata de Stripe:

```js
    const meta = { expedienteId: expediente.id, nPedido: expediente.nPedido, servicio: servicio.slug, canal: intentLidia ? intentLidia.procedencia : 'web' };
```

En `fulfillPayment`, sustituir el bloque `// --- Zoho: contacto + trato ---` completo por:

```js
  // --- Zoho ---
  const metaLidia = updated.procedencia === 'lidia' ? (updated.origenMeta || {}) : {};
  const esLidia = updated.procedencia === 'lidia' && metaLidia.zoho_deal_id;
  try {
    if (esLidia) {
      // Contrato LidIA 1.0 §10.2: la Oportunidad ya existe — escritura
      // económica sobre ella, sin tocar Lead_Source, y contacto por allowlist.
      if (!updated.user.zohoContactId && metaLidia.zoho_contact_id) {
        const u = await db.user.update({ where: { id: updated.user.id }, data: { zohoContactId: String(metaLidia.zoho_contact_id) } });
        updated = { ...updated, user: u };
      }
      const ok = await updateDealPago(metaLidia.zoho_deal_id, updated);
      if (ok) {
        updated = await db.expediente.update({ where: { id: updated.id }, data: { zohoDealId: String(metaLidia.zoho_deal_id) }, include: { user: true } });
        await updateContactPermitidos(metaLidia.zoho_contact_id, updated.user);
      } else {
        // Fallback: un pago nunca se queda sin reflejo en CRM.
        const contactId = await upsertContact(updated.user);
        const dealId = await createDealForExpediente(updated, updated.user, servicio, contactId);
        if (dealId) {
          updated = await db.expediente.update({ where: { id: updated.id }, data: { zohoDealId: dealId }, include: { user: true } });
          await addDealNote(dealId, 'Aviso integración LidIA', `No se pudo actualizar la Oportunidad ${metaLidia.zoho_deal_id} de LidIA; se creó esta en su lugar.`);
        }
      }
    } else {
      const contactId = await upsertContact(updated.user);
      if (contactId && !updated.user.zohoContactId) {
        await db.user.update({ where: { id: updated.user.id }, data: { zohoContactId: contactId } });
      }
      if (contactId && updated.user.stripeCustomerId && stripe) {
        await linkCustomerToZoho(stripe, updated.user.stripeCustomerId, contactId);
      }
      const dealId = await createDealForExpediente(updated, updated.user, servicio, contactId);
      if (dealId) {
        updated = await db.expediente.update({ where: { id: updated.id }, data: { zohoDealId: dealId }, include: { user: true } });
      }
    }
  } catch (e) {
    console.error('Zoho sync error (el pago NO se pierde, reintentar manualmente):', e.message);
  }
```

Y al FINAL de `fulfillPayment` (tras `transitionExpediente`), cerrar el intent y encolar el evento:

```js
  // --- LidIA: cerrar el intent y notificar (idempotente por estado) ---
  try {
    const intent = await db.checkoutIntent.findFirst({ where: { expedienteId: updated.id } });
    if (intent && intent.estado !== 'paid') {
      await db.checkoutIntent.update({ where: { id: intent.id }, data: { estado: 'paid' } });
      const datos = construirDatosPago(intent, updated, updated.user);
      if (datos.correcciones?.length && updated.zohoDealId) {
        await addDealNote(updated.zohoDealId, 'Datos corregidos en el checkout',
          datos.correcciones.map((c) => `${c.campo} → ${c.valor_confirmado}`).join('\n'));
      }
      await encolarEvento('payment.succeeded', intent, datos);
    }
  } catch (e) {
    console.error('LidIA post-pago error (el pago NO se pierde):', e.message);
  }
```

- [ ] **Step 6: Run all backend tests**

Run: `npm test` (desde `backend/`)
Expected: PASS completo, incluidos los suites previos (regresión checkout web intacta).

- [ ] **Step 7: Commit**

```bash
git add backend/src/routes/checkout.js backend/src/routes/checkout.lidia.test.js backend/src/services/lidia.js backend/src/services/lidia.test.js
git commit -m "feat(lidia): checkout con token de intent y pago sobre la Oportunidad existente"
```

---

### Task 10: Montaje en `app.js` (rate limit) y worker en `server.js`

**Files:**
- Modify: `backend/src/app.js`
- Modify: `backend/src/server.js`

**Interfaces:**
- Consumes: `integrationsRouter` (Task 4/7), `despacharEventosPendientes`/`expirarIntents` (Task 6).

- [ ] **Step 1: Montar el router y su rate limit** (en `createApp`, junto a los otros rate limits y ANTES de `app.use(leadsRouter)`)

```js
  // Integración LidIA: 60 req/min por entorno (contrato 1.0 §12).
  app.use('/api/integrations/lidia', rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false }));
```

Y con los routers (después de `app.use(portalRouter)`):

```js
  app.use(integrationsRouter);
```

Con su import arriba:

```js
import { integrationsRouter } from './routes/integrations.js';
```

- [ ] **Step 2: Worker en `server.js`** (tras el `createApp().listen(...)`)

```js
import { config } from './config.js';
import { despacharEventosPendientes, expirarIntents } from './services/lidia.js';

// Worker de la integración LidIA: despacha la outbox de callbacks y caduca
// intents vencidos. Tolerante a reinicios (estado en BD, no en memoria).
if (config.lidia.enabled) {
  setInterval(() => {
    despacharEventosPendientes().catch((e) => console.error('[lidia] despacho:', e.message));
    expirarIntents().catch((e) => console.error('[lidia] expiración:', e.message));
  }, 30_000);
}
```

- [ ] **Step 3: Verificar arranque y regresión**

Run: `npm test` (desde `backend/`) → Expected: PASS completo.
Run: `node --input-type=module -e "import('./src/app.js').then(m => { const s = m.createApp().listen(0); fetch('http://localhost:' + s.address().port + '/api/integrations/lidia/checkout-intent', { method: 'POST' }).then(r => { console.log('status', r.status); s.close(); }); })"` (desde `backend/`)
Expected: `status 401` (la ruta existe y exige api key).

- [ ] **Step 4: Commit**

```bash
git add backend/src/app.js backend/src/server.js
git commit -m "feat(lidia): montaje del router de integración, rate limit y worker de outbox"
```

---

### Task 11: Frontend — API, ruta `/c/:token` y página `CheckoutIntent`

**Files:**
- Modify: `frontend/src/lib/api.js`
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/pages/Checkout.jsx`
- Create: `frontend/src/pages/CheckoutIntent.jsx`
- Test: `frontend/src/pages/CheckoutIntent.test.jsx`

**Interfaces:**
- Consumes: `GET /api/checkout-intent/:token` (Task 7), `getServicios` existente.
- Produces: `getCheckoutIntent(token)` en api.js; ruta `/c/:token`; `CheckoutForm` recibirá `prefill`, `procedencia`, `intentToken` (se implementa en Task 12 — aquí ya se le pasan las props).

- [ ] **Step 1: Write the failing test**

Create `frontend/src/pages/CheckoutIntent.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CheckoutIntent from './CheckoutIntent.jsx';

vi.mock('../lib/api.js', () => ({
  getCheckoutIntent: vi.fn(),
  getServicios: vi.fn(),
}));
import { getCheckoutIntent, getServicios } from '../lib/api.js';

const servicios = [{ slug: 'canje-carnet', nombre: 'Canje de Carnet Extranjero', descripcion: 'x', precio: 210, requierePais: true, requiereDireccion: true }];

function renderRuta(token = 'tok1') {
  return render(
    <MemoryRouter initialEntries={[`/c/${token}`]}>
      <Routes>
        <Route path="/c/:token" element={<CheckoutIntent />} />
        <Route path="/checkout" element={<div>PAGINA CHECKOUT NORMAL</div>} />
        <Route path="/gracias" element={<div>PAGINA GRACIAS</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => vi.resetAllMocks());

describe('CheckoutIntent (/c/:token)', () => {
  it('monta el checkout prellenado cuando el intent es válido', async () => {
    getServicios.mockResolvedValue(servicios);
    getCheckoutIntent.mockResolvedValue({ servicio: 'canje-carnet', procedencia: 'lidia', prefill: { nombre: 'Ana', apellidos: 'García López' } });
    renderRuta();
    await waitFor(() => expect(screen.getByDisplayValue('Ana')).toBeInTheDocument());
    expect(screen.getByDisplayValue('García López')).toBeInTheDocument();
    expect(getCheckoutIntent).toHaveBeenCalledWith('tok1');
  });

  it('redirige al checkout normal si el enlace no es válido o caducó', async () => {
    getServicios.mockResolvedValue(servicios);
    getCheckoutIntent.mockRejectedValue(new Error('Enlace no válido o caducado'));
    renderRuta();
    await waitFor(() => expect(screen.getByText('PAGINA CHECKOUT NORMAL')).toBeInTheDocument());
  });

  it('redirige a gracias si el intent ya está pagado', async () => {
    getServicios.mockResolvedValue(servicios);
    getCheckoutIntent.mockResolvedValue({ pagado: true, nPedido: 'GST-1' });
    renderRuta();
    await waitFor(() => expect(screen.getByText('PAGINA GRACIAS')).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (desde `frontend/`): `npx vitest run src/pages/CheckoutIntent.test.jsx`
Expected: FAIL — módulo `CheckoutIntent.jsx` inexistente.

- [ ] **Step 3: Write implementation**

Añadir a `frontend/src/lib/api.js` (junto a `postCheckout`):

```js
// Resuelve un enlace corto de LidIA (/c/:token) → { servicio, procedencia,
// prefill } o { pagado, nPedido }. 404 = caducado/inválido.
export async function getCheckoutIntent(token) {
  const res = await fetch(`/api/checkout-intent/${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error('Enlace no válido o caducado');
  return res.json();
}
```

Create `frontend/src/pages/CheckoutIntent.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CheckoutCard from '../components/CheckoutCard.jsx';
import CheckoutForm from './servicios/CheckoutForm.jsx';
import { getCheckoutIntent, getServicios } from '../lib/api.js';
import styles from './Checkout.module.css';

// Página /c/:token — aterrizaje de los enlaces de pago que el agente de LidIA
// envía por WhatsApp. Resuelve el intent, prellena el checkout y muestra el
// banner de verificación. Caducado/inválido → checkout normal con aviso.
export default function CheckoutIntent() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [intent, setIntent] = useState(null);
  const [servicios, setServicios] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getCheckoutIntent(token)
      .then((data) => {
        if (cancelled) return;
        if (data.pagado) navigate(`/gracias?pedido=${data.nPedido || ''}`, { replace: true });
        else setIntent(data);
      })
      .catch(() => { if (!cancelled) navigate('/checkout?enlace=caducado', { replace: true }); });
    return () => { cancelled = true; };
  }, [token, navigate]);

  useEffect(() => {
    let cancelled = false;
    getServicios().then((data) => { if (!cancelled) setServicios(data); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const servicio = intent && servicios ? servicios.find((s) => s.slug === intent.servicio) : null;

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.pageEyebrow}>Pago seguro</div>
          <h1 className={styles.pageTitle}>Contratar servicio</h1>
          <p className={styles.pageSub}>Revisa tus datos, paga y sigue tu trámite desde tu área de cliente.</p>
        </div>
      </div>
      <div className={styles.body}>
        {!servicio && <p className={styles.loading}>Cargando…</p>}
        {servicio && (
          <>
            <CheckoutCard nombre={servicio.nombre} descripcion={servicio.descripcion} precio={servicio.precio} />
            <CheckoutForm servicio={servicio} prefill={intent.prefill} procedencia={intent.procedencia} intentToken={token} />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
```

En `frontend/src/App.jsx`, añadir el import y la ruta (junto a `/checkout`):

```jsx
import CheckoutIntent from './pages/CheckoutIntent.jsx';
```

```jsx
        <Route path="/c/:token" element={<CheckoutIntent />} />
```

En `frontend/src/pages/Checkout.jsx`, mostrar el aviso de enlace caducado — añadir tras `const slug = …`:

```jsx
  const enlaceCaducado = searchParams.get('enlace') === 'caducado';
```

Y dentro de `styles.body`, antes del bloque `{loadError && …}`:

```jsx
        {enlaceCaducado && (
          <p className={styles.formStatus} role="status">
            El enlace de pago ha caducado, pero puedes contratar igualmente rellenando tus datos.
          </p>
        )}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/CheckoutIntent.test.jsx`
Expected: PASS (3 tests). Nota: el primer test pasa cuando Task 12 añada el prellenado a `CheckoutForm`; si se ejecuta esta task aislada, ese test quedará FAIL hasta completar Task 12 — ejecutar Tasks 11 y 12 seguidas antes de dar el suite por verde.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/api.js frontend/src/App.jsx frontend/src/pages/Checkout.jsx frontend/src/pages/CheckoutIntent.jsx frontend/src/pages/CheckoutIntent.test.jsx
git commit -m "feat(lidia): ruta /c/:token con resolución del intent y aviso de caducidad"
```

---

### Task 12: `CheckoutForm` — prellenado, banner de verificación y token en el submit

**Files:**
- Modify: `frontend/src/pages/servicios/CheckoutForm.jsx`
- Modify: `frontend/src/pages/Checkout.module.css`
- Test: `frontend/src/pages/servicios/CheckoutForm.lidia.test.jsx`

**Interfaces:**
- Consumes: props nuevas `prefill` (formato de `mapearPrefill`: `nombre, apellidos, email, tipoDocumento, numDocumento, paisCanje, telefono` E.164), `procedencia`, `intentToken`.
- Produces: `postCheckout` recibe además `{ token: intentToken }` cuando existe.

- [ ] **Step 1: Write the failing tests**

Create `frontend/src/pages/servicios/CheckoutForm.lidia.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CheckoutForm from './CheckoutForm.jsx';

vi.mock('../../lib/api.js', () => ({ postCheckout: vi.fn() }));

const servicio = { slug: 'canje-carnet', nombre: 'Canje', requierePais: true, requiereDireccion: true };

function renderForm(props = {}) {
  return render(
    <MemoryRouter>
      <CheckoutForm servicio={servicio} {...props} />
    </MemoryRouter>
  );
}

describe('CheckoutForm con prellenado LidIA', () => {
  it('prellena los campos y separa el prefijo del teléfono E.164', () => {
    renderForm({
      prefill: { nombre: 'Ana', apellidos: 'García López', email: 'ana@example.com', tipoDocumento: 'NIE', numDocumento: 'X1234567L', paisCanje: 'colombia', telefono: '+34600111222' },
      procedencia: 'lidia',
    });
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana');
    expect(screen.getByLabelText('Apellidos')).toHaveValue('García López');
    expect(screen.getByLabelText('Email')).toHaveValue('ana@example.com');
    expect(screen.getByLabelText('Nº de documento')).toHaveValue('X1234567L');
    expect(screen.getByLabelText('Teléfono móvil')).toHaveValue('600111222');
    expect(screen.getByLabelText('País del permiso')).toHaveValue('colombia');
  });

  it('muestra el banner de verificación solo con procedencia lidia', () => {
    renderForm({ prefill: { nombre: 'Ana' }, procedencia: 'lidia' });
    expect(screen.getByText(/revísalos con calma/i)).toBeInTheDocument();
  });

  it('sin procedencia lidia no hay banner', () => {
    renderForm();
    expect(screen.queryByText(/revísalos con calma/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/servicios/CheckoutForm.lidia.test.jsx`
Expected: FAIL — los inputs salen vacíos y no existe el banner.

- [ ] **Step 3: Write implementation** (modificar `CheckoutForm.jsx`)

Añadir import y helper encima del componente:

```jsx
import { PREFIJOS, PREFIJO_DEFECTO } from '@shared/prefijos.js';

// Aplica el prellenado de un intent de LidIA sobre el formulario vacío.
// El teléfono llega en E.164: se separa el prefijo más largo que encaje.
function aplicarPrefill(base, prefill) {
  if (!prefill) return base;
  const out = { ...base };
  for (const campo of ['nombre', 'apellidos', 'email', 'tipoDocumento', 'numDocumento', 'paisCanje']) {
    if (prefill[campo]) out[campo] = prefill[campo];
  }
  if (prefill.telefono) {
    const prefijo = [...PREFIJOS].sort((a, b) => b.codigo.length - a.codigo.length)
      .find((p) => prefill.telefono.startsWith(p.codigo));
    if (prefijo) {
      out.prefijo = prefijo.codigo;
      out.telefono = prefill.telefono.slice(prefijo.codigo.length);
    }
  }
  return out;
}
```

Cambiar la firma del componente y el estado inicial:

```jsx
export default function CheckoutForm({ servicio, prefill = null, procedencia = '', intentToken = '' }) {
  const [searchParams] = useSearchParams();
  const cancelado = searchParams.get('cancelado');
  const [form, setForm] = useState(() => aplicarPrefill(EMPTY_FORM, prefill));
```

En `handleSubmit`, incluir el token en el body:

```jsx
      const body = await postCheckout({ servicio: servicio.slug, ...persona, telefono: telefonoFull, ...extra, ...(intentToken ? { token: intentToken } : {}) });
```

En el JSX, justo después de `<div className={styles.formTitle}>Tus datos</div>`:

```jsx
      {procedencia === 'lidia' && (
        <p className={styles.avisoVerifica} role="status">
          <strong>Revisa tus datos antes de pagar.</strong> Los hemos recogido en tu
          conversación de WhatsApp y pueden contener errores — revísalos con calma,
          sobre todo el nombre y los apellidos, y corrige lo que haga falta.
        </p>
      )}
```

Añadir a `frontend/src/pages/Checkout.module.css`:

```css
.avisoVerifica {
  background: #fff8e6;
  border: 1px solid #e8c86a;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 4px;
}
```

- [ ] **Step 4: Run all frontend tests**

Run: `npx vitest run`
Expected: PASS completo (incluidos `CheckoutIntent.test.jsx` de Task 11 y los suites previos de Checkout — regresión sin props nuevas intacta).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/servicios/CheckoutForm.jsx frontend/src/pages/servicios/CheckoutForm.lidia.test.jsx frontend/src/pages/Checkout.module.css
git commit -m "feat(lidia): prellenado del checkout con banner de verificación y token"
```

---

### Task 13: Verificación final y smoke E2E en modo demo

**Files:** ninguno nuevo (verificación).

- [ ] **Step 1: Suites completas**

Run: `npm test` (desde `backend/`) → Expected: PASS.
Run: `npx vitest run` (desde `frontend/`) → Expected: PASS.

- [ ] **Step 2: Smoke E2E en modo demo** (sin Stripe/Zoho; requiere MySQL con la migración aplicada)

```bash
# Terminal 1 (backend/): API key de prueba y arrancar
LIDIA_API_KEY=demo-key npm start
# Terminal 2: crear un intent como lo haría LidIA
curl -s -X POST http://localhost:3001/api/integrations/lidia/checkout-intent \
  -H "Content-Type: application/json" -H "X-Api-Key: demo-key" \
  -d '{"schema_version":"1.0","idempotency_key":"6be7f522-1149-45a5-bbd0-58cf420e3d53","lidia_payment_id":"b093ce58-8dc9-4c3e-b4c3-85851b24cf66","lidia_payment_attempt_id":"ee151822-573c-42d6-8a0a-5fe80f0f0f36","lidia_session_id":"184237","lidia_contact_id":"9317","lidia_agent_id":"178","service":"canje-carnet","catalog_code":"canje_1_categoria","amount_minor":21000,"currency":"EUR","telefono":"+34600111222","zoho_contact_id":"572576000012345678","zoho_deal_id":"572576000087654321","prefill":{"nombre":"Ana","apellidos":"García","email":"ana@example.com","pais_canje":"CO"}}'
```

Expected: `201` con `url` → abrir la `url` en el navegador (con `npm run dev` del frontend o build servido): checkout prellenado con banner ámbar; completar dirección + aceptar condiciones + pagar (modo demo simula el pago) → página de gracias. Repetir el mismo curl → `200` con `"reused": true`.

- [ ] **Step 3: Checklist contra la matriz §14 del contrato (parte Portal, pruebas locales)**

Confirmar que hay test automatizado o smoke manual para: creación (T4), reused (T5), conflicto (T5), rechazo `canje_2_categorias` (T4), rechazo importe (T4), apertura (T7), pago demo (T13.2), caducidad sin regeneración (T6), regeneración con `replaces` (T5), correcciones (T9), teléfono sin `Mobile` (T8), escritura económica exactamente una vez (T9: intent `paid` no re-encola), reconciliación por GET (T7). Los puntos 8-9, 11-12 y 20 de la matriz requieren staging conjunto con LidIA (fuera de este plan).

- [ ] **Step 4: Commit final si hubo ajustes**

```bash
git add -A
git commit -m "chore(lidia): ajustes de verificación final de la integración"
```

---

## Self-Review (hecha)

- **Cobertura del spec v3:** endpoint POST (T4-5), GETs (T7), modelos (T2), outbox+firma+expiración+replay (T6), Zoho update/allowlist (T8), fulfillPayment+correcciones+intent paid (T9), wiring+rate limit+worker (T10), frontend completo (T11-12), mapeos (T3), config (T1). Sin huecos.
- **Consistencia de tipos:** `catalogoLidia`, `mapearPrefill`, `encolarEvento(eventType, intent, extra)`, `construirDatosPago(intent, expediente, user)`, `updateDealPago(dealId, expediente) → boolean`, props `prefill/procedencia/intentToken` — usados igual en todas las tasks.
- **Nota conocida:** el test 1 de Task 11 depende del prellenado de Task 12 (avisado en la propia task).
