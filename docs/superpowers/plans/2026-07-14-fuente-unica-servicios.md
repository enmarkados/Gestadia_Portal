# Fuente única de servicios (precios + documentos) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que precios y documentos de los servicios vivan en un único módulo compartido (`shared/servicios.js`) que consuman el backend (runtime) y el frontend (build), eliminando la desincronización actual entre el catálogo del backend y las fichas del front.

**Architecture:** `shared/servicios.js` es un módulo de datos puro (sin dependencias de Node ni React) con los 8 servicios reales del front. El backend `catalog.js` lo importa y expone su lista mapeando `documentos`→`checklist` (sin tocar `portal.js`/`checkout.js`). El frontend lo importa vía un alias `@shared` de Vite: `Tramites.jsx` deriva precio/nombre/href, y cada ficha deriva `precio`/`includes`.

**Tech Stack:** Node.js ≥22.5 (ESM), Express, Prisma/MySQL, Vite + React, Vitest (front), `node --test` (back/shared).

## Global Constraints

- Node.js `>=22.5`, todo ESM (`import`/`export`).
- **No cambiar la lógica de rutas** de `backend/src/routes/portal.js` ni `backend/src/routes/checkout.js`: siguen leyendo `servicio.checklist`. El catálogo les da ese campo.
- En las 8 fichas del front **solo** cambian `precio` e `includes` (desde `shared`); los literales `servicio=` (texto mostrado) y `tramite=` (string de lead a Zoho) **se dejan igual** — los 8 `tramite=` coinciden con `SERVICIO_MAP` en `backend/src/services/zoho.js` y no deben alterarse.
- Los valores en `shared` deben ser **idénticos** a los actuales del front: `nombre` = título de `Tramites.jsx` (= string `tramite=`), `precio` = número del precio actual, `includes` = array actual de cada ficha.
- Base de datos: MySQL hosteado `gestadia.com:3306/gestadia_portal_db` (producción); Zoho/Stripe/SMTP en modo demo. Nunca imprimir el contenido de `backend/.env`.
- Mapeo Zoho fiable solo para Canje; el resto es *best-effort* y va marcado para verificar antes de publicar.

---

### Task 1: Módulo compartido `shared/servicios.js`

**Files:**
- Create: `shared/servicios.js`
- Test: `shared/servicios.test.js`

**Interfaces:**
- Produces: `export const SERVICIOS` — objeto indexado por `slug`. Cada servicio: `{ slug, nombre, descripcion, categoria, precio:number, href, includes:string[], documentos:{clave,label}[], zoho:{servicio, faseField, fases} }`. Consumido por Task 2 (backend) y Tasks 3-4 (frontend).

- [ ] **Step 1: Escribir el test que falla** — crear `shared/servicios.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SERVICIOS } from './servicios.js';

const SLUGS = [
  'canje-carnet', 'duplicado-carnet', 'duplicado-datos', 'permiso-internacional',
  'transferencia', 'baja-vehiculo', 'cancelacion-dominio', 'duplicado-circulacion',
];

test('están exactamente los 8 servicios del front', () => {
  assert.deepEqual(Object.keys(SERVICIOS).sort(), [...SLUGS].sort());
});

test('cada servicio tiene precio numérico, documentos con clave+label y mapeo zoho', () => {
  for (const slug of SLUGS) {
    const s = SERVICIOS[slug];
    assert.equal(s.slug, slug);
    assert.equal(typeof s.precio, 'number');
    assert.ok(s.precio > 0);
    assert.ok(Array.isArray(s.documentos) && s.documentos.length > 0);
    for (const d of s.documentos) assert.ok(d.clave && d.label, `doc sin clave/label en ${slug}`);
    assert.ok(Array.isArray(s.includes) && s.includes.length > 0);
    assert.equal(typeof s.zoho.servicio, 'string');
    assert.ok(s.zoho.servicio.length > 0);
    assert.ok(s.zoho.fases && Object.keys(s.zoho.fases).length > 0);
  }
});

test('los precios coinciden con el front', () => {
  assert.equal(SERVICIOS['canje-carnet'].precio, 210);
  assert.equal(SERVICIOS['duplicado-carnet'].precio, 70);
  assert.equal(SERVICIOS['duplicado-datos'].precio, 70);
  assert.equal(SERVICIOS['permiso-internacional'].precio, 100);
  assert.equal(SERVICIOS['transferencia'].precio, 190);
  assert.equal(SERVICIOS['baja-vehiculo'].precio, 190);
  assert.equal(SERVICIOS['cancelacion-dominio'].precio, 120);
  assert.equal(SERVICIOS['duplicado-circulacion'].precio, 70);
});
```

- [ ] **Step 2: Ejecutar el test para verificar que falla**

Run: `node --test shared/servicios.test.js`
Expected: FAIL — `Cannot find module './servicios.js'`.

- [ ] **Step 3: Escribir `shared/servicios.js`**

```js
// ============================================================
// FUENTE ÚNICA DE SERVICIOS — consumida por backend (runtime)
// y frontend (build). Módulo de datos puro: sin imports de Node
// ni de React. Precios y documentos se editan AQUÍ.
//
// `documentos` es la checklist concreta de subida del portal
// (el backend la expone como `servicio.checklist`). La presentación
// rica de documentos vive en cada ficha del front.
//
// AVISO Zoho: solo el mapeo de `canje-carnet` está verificado. El
// resto usa valores best-effort de SERVICIO_MAP (services/zoho.js)
// y faseField:null. Verificar contra el CRM (ZohoCRM_getFields en
// Deals) antes de activar Zoho o de conectar las fichas al pago.
// ============================================================

const FASES_GENERICAS = {
  'Pdte documentación': 'documentacion_pendiente',
  'En gestión': 'en_gestion',
  'Presentado': 'presentado',
  'Completado': 'completado',
};

export const SERVICIOS = {
  'canje-carnet': {
    slug: 'canje-carnet',
    nombre: 'Canje de Carnet Extranjero',
    descripcion: 'Homologa tu permiso de conducir extranjero por el carnet español ante la DGT.',
    categoria: 'permiso',
    precio: 210,
    href: '/tramites/canje-carnet',
    includes: ['Tasas DGT incluidas', 'Gestión completa', 'Especialista personal asignado', 'Garantía de éxito del trámite'],
    documentos: [
      { clave: 'residencia', label: 'Documento de residencia legal en España (DNI español, tarjeta de residencia, tarjeta roja, intracomunitaria o resguardo de concesión)' },
      { clave: 'permiso_extranjero', label: 'Permiso de conducir extranjero original en vigor (ambas caras)' },
      { clave: 'psicotecnico', label: 'Examen psicotécnico (centro autorizado)' },
    ],
    zoho: {
      servicio: 'Canje',
      faseField: 'Fase_del_psicot_cnico',
      fases: {
        'Pte. documentación': 'documentacion_pendiente',
        'Gestión de cita': 'en_gestion',
        'Gestión de psicotécnico': 'en_gestion',
        'Mensajería': 'en_gestion',
        'Entrega de documentación al gestor': 'en_gestion',
        'Tramitación cita': 'en_gestion',
        'Pdte contestación DGT': 'presentado',
        'Completado': 'completado',
      },
    },
  },

  'duplicado-carnet': {
    slug: 'duplicado-carnet',
    nombre: 'Duplicado de Carnet de Conducir',
    descripcion: 'Duplicado de tu carnet de conducir por pérdida, robo o deterioro.',
    categoria: 'permiso',
    precio: 70,
    href: '/tramites/duplicado-carnet',
    includes: ['Tasas DGT incluidas', 'Permiso provisional en 24 h', 'Gestión completa', 'Especialista personal asignado'],
    documentos: [
      { clave: 'dni', label: 'DNI en vigor (anverso y reverso)' },
    ],
    zoho: { servicio: 'Duplicado Carnet De Conducir', faseField: null, fases: FASES_GENERICAS },
  },

  'duplicado-datos': {
    slug: 'duplicado-datos',
    nombre: 'Duplicado por Cambio de Datos',
    descripcion: 'Actualiza los datos de tu carnet: de NIE a DNI, cambio de nombre o de sexo.',
    categoria: 'permiso',
    precio: 70,
    href: '/tramites/duplicado-datos',
    includes: ['Tasas DGT incluidas', 'Gestión completa', 'Especialista personal asignado'],
    documentos: [
      { clave: 'dni', label: 'DNI en vigor con los datos actualizados' },
      { clave: 'nie_anterior', label: 'NIE anterior (si el cambio es de NIE a DNI)' },
      { clave: 'carnet_actual', label: 'Carnet de conducir actual' },
      { clave: 'resolucion_registral', label: 'Resolución registral de cambio de nombre o sexo (si aplica)' },
    ],
    zoho: { servicio: 'Duplicado Carnet De Conducir', faseField: null, fases: FASES_GENERICAS },
  },

  'permiso-internacional': {
    slug: 'permiso-internacional',
    nombre: 'Permiso Internacional de Conducir',
    descripcion: 'Permiso internacional para conducir fuera de la UE, válido un año.',
    categoria: 'permiso',
    precio: 100,
    href: '/tramites/permiso-internacional',
    includes: ['Tasas DGT incluidas', 'Válido en más de 150 países', 'Gestión completa', 'Especialista personal asignado'],
    documentos: [
      { clave: 'dni', label: 'DNI o NIE en vigor' },
      { clave: 'carnet_conducir', label: 'Carnet de conducir español en vigor' },
      { clave: 'foto_carnet', label: 'Foto carnet reciente (fondo blanco)' },
    ],
    zoho: { servicio: 'Otras gestiones', faseField: null, fases: FASES_GENERICAS },
  },

  'transferencia': {
    slug: 'transferencia',
    nombre: 'Transferencia de Vehículo',
    descripcion: 'Cambio de titularidad del vehículo ante la DGT (coches y motos).',
    categoria: 'vehiculo',
    precio: 190,
    href: '/tramites/transferencia',
    includes: ['Tasas DGT incluidas', 'Coches y motos', 'Gestión completa', 'Especialista personal asignado'],
    documentos: [
      { clave: 'dni_comprador', label: 'DNI o NIE del comprador' },
      { clave: 'dni_vendedor', label: 'DNI o NIE del vendedor' },
      { clave: 'contrato_compraventa', label: 'Contrato de compraventa firmado por ambas partes' },
      { clave: 'permiso_circulacion', label: 'Permiso de circulación original' },
      { clave: 'itv', label: 'Tarjeta ITV en vigor' },
    ],
    zoho: { servicio: 'Transferencia de VEhículos', faseField: null, fases: FASES_GENERICAS },
  },

  'baja-vehiculo': {
    slug: 'baja-vehiculo',
    nombre: 'Baja de Vehículo',
    descripcion: 'Baja definitiva o temporal de tu vehículo ante la DGT.',
    categoria: 'vehiculo',
    precio: 190,
    href: '/tramites/baja-vehiculo',
    includes: ['Tasas DGT incluidas', 'Baja definitiva o temporal', 'Gestión completa', 'Especialista personal asignado'],
    documentos: [
      { clave: 'dni', label: 'DNI, pasaporte o NIE en vigor' },
      { clave: 'permiso_circulacion', label: 'Permiso de circulación original' },
      { clave: 'ficha_tecnica', label: 'Ficha técnica o tarjeta ITV' },
    ],
    zoho: { servicio: 'Transferencia de VEhículos', faseField: null, fases: FASES_GENERICAS },
  },

  'cancelacion-dominio': {
    slug: 'cancelacion-dominio',
    nombre: 'Cancelación de Reserva de Dominio',
    descripcion: 'Cancela la reserva de dominio de tu vehículo tras liquidar la financiación.',
    categoria: 'vehiculo',
    precio: 120,
    href: '/tramites/cancelacion-dominio',
    includes: ['Gestión ante Registro Bienes Muebles', 'Gestión completa', 'Especialista personal asignado'],
    documentos: [
      { clave: 'dni', label: 'DNI o NIE en vigor' },
      { clave: 'carta_cancelacion', label: 'Carta de cancelación o certificado de pago de la entidad financiera' },
      { clave: 'permiso_circulacion', label: 'Permiso de circulación del vehículo' },
      { clave: 'itv', label: 'Tarjeta ITV' },
    ],
    zoho: { servicio: 'Otras gestiones', faseField: null, fases: FASES_GENERICAS },
  },

  'duplicado-circulacion': {
    slug: 'duplicado-circulacion',
    nombre: 'Duplicado Permiso de Circulación',
    descripcion: 'Duplicado del permiso de circulación por pérdida o deterioro.',
    categoria: 'vehiculo',
    precio: 70,
    href: '/tramites/duplicado-circulacion',
    includes: ['Tasas DGT incluidas', 'Autorización provisional inmediata', 'Gestión completa', 'Especialista personal asignado'],
    documentos: [
      { clave: 'dni', label: 'DNI o NIE en vigor' },
      { clave: 'denuncia', label: 'Denuncia por pérdida o robo (si aplica)' },
      { clave: 'permiso_deteriorado', label: 'Permiso de circulación deteriorado (si aplica)' },
    ],
    zoho: { servicio: 'Otras gestiones', faseField: null, fases: FASES_GENERICAS },
  },
};
```

- [ ] **Step 4: Ejecutar el test para verificar que pasa**

Run: `node --test shared/servicios.test.js`
Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add shared/servicios.js shared/servicios.test.js
git commit -m "feat: add shared/servicios.js single source of truth (8 servicios)"
```

---

### Task 2: Backend `catalog.js` consume `shared`

**Files:**
- Modify: `backend/src/catalog.js` (reemplaza el objeto `SERVICIOS` hardcodeado)
- Test: `backend/src/catalog.test.js` (nuevo)
- Modify: `backend/src/server.test.js` (slug `canje` → `canje-carnet`)
- Modify: `tests/backend-smoke.spec.js` (slug `canje` → `canje-carnet`)

**Interfaces:**
- Consumes: `SERVICIOS` de `../../shared/servicios.js` (Task 1).
- Produces: `SERVICIOS` (con campo `checklist` = `documentos`), `getServicio(slug)`, `faseToEstado(slug, fase)`, `ESTADOS`, `ESTADO_INCIDENCIA` — mismos nombres que hoy; `portal.js`/`checkout.js` no cambian.

- [ ] **Step 1: Escribir el test que falla** — crear `backend/src/catalog.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SERVICIOS, getServicio, faseToEstado } from './catalog.js';

test('el catálogo tiene los 8 servicios del front con precios correctos', () => {
  assert.equal(Object.keys(SERVICIOS).length, 8);
  assert.equal(getServicio('canje-carnet').precio, 210);
  assert.equal(getServicio('transferencia').precio, 190);
});

test('los slugs viejos ya no existen', () => {
  assert.equal(getServicio('canje'), null);
  assert.equal(getServicio('certificados'), null);
  assert.equal(getServicio('jubilacion'), null);
  assert.equal(getServicio('otros'), null);
});

test('checklist deriva de documentos (clave + label)', () => {
  const s = getServicio('canje-carnet');
  assert.ok(Array.isArray(s.checklist) && s.checklist.length > 0);
  assert.ok(s.checklist.every((c) => c.clave && c.label));
  assert.equal(s.checklist[0].clave, 'residencia');
});

test('faseToEstado sigue funcionando para Canje', () => {
  assert.equal(faseToEstado('canje-carnet', 'Completado'), 'completado');
  assert.equal(faseToEstado('canje-carnet', 'Pte. documentación'), 'documentacion_pendiente');
});
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `cd backend && node --experimental-test-module-mocks --test src/catalog.test.js`
Expected: FAIL — hoy `getServicio('canje-carnet')` es `null` y `getServicio('canje').precio` es 149.

- [ ] **Step 3: Reescribir `backend/src/catalog.js`**

```js
// ============================================================
// Vista de backend del catálogo compartido (shared/servicios.js).
// Expone `checklist` (= `documentos` compartidos) para que
// portal.js/checkout.js sigan funcionando sin cambios.
// Los estados del portal y los helpers viven aquí.
// ============================================================
import { SERVICIOS as SHARED } from '../../shared/servicios.js';

// Estados visibles para el cliente (orden = línea de tiempo)
export const ESTADOS = [
  { id: 'pago_pendiente',          label: 'Pago pendiente' },
  { id: 'pagado',                  label: 'Pago recibido' },
  { id: 'documentacion_pendiente', label: 'Falta documentación' },
  { id: 'en_gestion',              label: 'En gestión' },
  { id: 'presentado',              label: 'Presentado en la administración' },
  { id: 'completado',              label: 'Completado' },
];
export const ESTADO_INCIDENCIA = { id: 'incidencia', label: 'Incidencia — te contactamos' };

// El backend consume `servicio.checklist`; lo derivamos de `documentos`.
export const SERVICIOS = Object.fromEntries(
  Object.entries(SHARED).map(([slug, s]) => [slug, { ...s, checklist: s.documentos }])
);

export function getServicio(slug) {
  return SERVICIOS[slug] || null;
}

// Traduce una fase de Zoho al estado del portal (webhook de Zoho)
export function faseToEstado(servicioSlug, fase) {
  const s = SERVICIOS[servicioSlug];
  if (!s || !fase) return null;
  return s.zoho.fases[fase] ?? null;
}
```

- [ ] **Step 4: Ejecutar el test para verificar que pasa**

Run: `cd backend && node --experimental-test-module-mocks --test src/catalog.test.js`
Expected: 4 tests PASS.

- [ ] **Step 5: Actualizar los tests que asumen el slug viejo `canje`**

En `backend/src/server.test.js`, cambiar la aserción del test de `/api/servicios`:

```js
  assert.ok(body.some((s) => s.slug === 'canje-carnet'));
```

En `tests/backend-smoke.spec.js`, cambiar:

```js
  expect(body.some((s) => s.slug === 'canje-carnet')).toBe(true);
```

- [ ] **Step 6: Ejecutar la suite del backend**

Run: `cd backend && DATABASE_URL="mysql://gestadia:gestadia@localhost:3307/gestadia_test" node --experimental-test-module-mocks --test src/**/*.test.js`
Expected: todos PASS. (Si no hay DB de test disponible, ejecutar al menos `node --experimental-test-module-mocks --test src/catalog.test.js src/config.test.js` y anotar que `db.test.js` requiere DB.)

- [ ] **Step 7: Commit**

```bash
git add backend/src/catalog.js backend/src/catalog.test.js backend/src/server.test.js tests/backend-smoke.spec.js
git commit -m "feat: backend catalog consumes shared/servicios (8 servicios, checklist=documentos)"
```

---

### Task 3: Config de Vite (`@shared`) + `Tramites.jsx` deriva de `shared`

**Files:**
- Modify: `frontend/vite.config.js` (alias `@shared` + `server.fs.allow`)
- Modify: `frontend/src/pages/Tramites.jsx`
- Test: `frontend/src/pages/Tramites.test.jsx` (nuevo)

**Interfaces:**
- Consumes: `SERVICIOS` de `@shared/servicios.js` (Task 1).
- Produces: nada nuevo; `Tramites` renderiza precio/nombre/href derivados de `SERVICIOS`.

- [ ] **Step 1: Añadir alias y `fs.allow` en `frontend/vite.config.js`**

Reemplazar el contenido por:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  test: { environment: 'jsdom', globals: true, setupFiles: './src/setupTests.js' },
  server: {
    port: 5173,
    fs: { allow: ['..'] },
    proxy: {
      '/api': 'http://localhost:3001',
      '/webhooks': 'http://localhost:3001',
    },
  },
});
```

- [ ] **Step 2: Escribir el test guard** — crear `frontend/src/pages/Tramites.test.jsx`

```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Tramites from './Tramites.jsx';
import { SERVICIOS } from '@shared/servicios.js';

describe('Tramites', () => {
  it('muestra el nombre y el precio de cada servicio desde shared', () => {
    render(<MemoryRouter><Tramites /></MemoryRouter>);
    for (const slug of Object.keys(SERVICIOS)) {
      const s = SERVICIOS[slug];
      expect(screen.getByText(s.nombre)).toBeInTheDocument();
      expect(screen.getAllByText(`${s.precio} €`).length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 3: Ejecutar el test**

Run: `cd frontend && npx vitest run src/pages/Tramites.test.jsx`
Expected: hoy PASA (los precios hardcodeados ya coinciden con `shared`). Es un test de anclaje contra desincronización futura; debe seguir en verde tras el refactor. Si fallara por el alias, revisar Step 1.

- [ ] **Step 4: Refactorizar `frontend/src/pages/Tramites.jsx`**

Añadir el import (junto a los demás, arriba):

```jsx
import { SERVICIOS } from '@shared/servicios.js';
```

Reemplazar la constante `CATALOG` (líneas ~20-39) por (solo `slug` + copy de marketing; precio/nombre/href salen de `shared`):

```jsx
const CATALOG = {
  permiso: {
    title: 'Permiso de conducir',
    items: [
      { slug: 'canje-carnet', desc: 'Homologa tu permiso extranjero por el carnet español. Nos encargamos de toda la documentación ante la DGT.' },
      { slug: 'duplicado-carnet', desc: 'Pérdida, robo o deterioro de tu carnet. Tramitamos el duplicado sin que tengas que ir a tráfico.' },
      { slug: 'duplicado-datos', desc: 'NIE a DNI, cambio de nombre o cambio de sexo. Actualizamos los datos de tu carnet de conducir.' },
      { slug: 'permiso-internacional', desc: 'Conduce fuera de la UE con total legalidad. Válido en prácticamente todos los países del mundo durante un año.' },
    ],
  },
  vehiculo: {
    title: 'Vehículo',
    items: [
      { slug: 'transferencia', desc: 'Cambio de titularidad ante la DGT. Coches y motos, compradores y vendedores particulares.' },
      { slug: 'baja-vehiculo', desc: 'Deja de pagar impuestos por un vehículo que ya no usas. Tramitamos la baja definitiva o temporal.' },
      { slug: 'cancelacion-dominio', desc: 'Elimina la reserva de dominio de tu vehículo una vez finalizado el préstamo con el banco o financiera.' },
      { slug: 'duplicado-circulacion', desc: 'Pérdida o deterioro del permiso de circulación. Autorización provisional inmediata mientras se tramita el definitivo.' },
    ],
  },
};
```

Reemplazar el `.map` de items (líneas ~100-112) por:

```jsx
                {group.items.map((item) => {
                  const s = SERVICIOS[item.slug];
                  return (
                    <div className={styles.serviceCard} key={item.slug}>
                      <div className={styles.serviceCardTitle}>{s.nombre}</div>
                      <div className={styles.serviceCardDesc}>{item.desc}</div>
                      <div className={styles.serviceCardFooter}>
                        <div className={styles.serviceCardPrice}>{s.precio} €</div>
                        <Link to={s.href} className={styles.serviceCardBtn}>Solicitar información →</Link>
                      </div>
                    </div>
                  );
                })}
```

- [ ] **Step 5: Ejecutar el test para verificar que sigue en verde**

Run: `cd frontend && npx vitest run src/pages/Tramites.test.jsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/vite.config.js frontend/src/pages/Tramites.jsx frontend/src/pages/Tramites.test.jsx
git commit -m "feat: Tramites derives price/name/href from shared; add @shared vite alias"
```

---

### Task 4: Las 8 fichas derivan `precio` e `includes` de `shared`

**Files:**
- Modify: `frontend/src/pages/servicios/CanjeCarnet.jsx`
- Modify: `frontend/src/pages/servicios/DuplicadoCarnet.jsx`
- Modify: `frontend/src/pages/servicios/DuplicadoDatos.jsx`
- Modify: `frontend/src/pages/servicios/PermisoInternacional.jsx`
- Modify: `frontend/src/pages/servicios/Transferencia.jsx`
- Modify: `frontend/src/pages/servicios/BajaVehiculo.jsx`
- Modify: `frontend/src/pages/servicios/CancelacionDominio.jsx`
- Modify: `frontend/src/pages/servicios/DuplicadoCirculacion.jsx`
- Test: `frontend/src/pages/servicios/CanjeCarnet.precio.test.jsx` (nuevo)

**Interfaces:**
- Consumes: `SERVICIOS` de `@shared/servicios.js`.
- Produces: cada ficha pasa a `LeadForm` `precio={\`${S.precio} €\`}` e `includes={S.includes}`; `servicio=` y `tramite=` **no cambian**.

- [ ] **Step 1: Escribir el test guard** — crear `frontend/src/pages/servicios/CanjeCarnet.precio.test.jsx`

```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import CanjeCarnet from './CanjeCarnet.jsx';
import { SERVICIOS } from '@shared/servicios.js';

describe('CanjeCarnet', () => {
  it('muestra el precio desde shared', () => {
    render(<MemoryRouter><CanjeCarnet /></MemoryRouter>);
    expect(screen.getByText(`${SERVICIOS['canje-carnet'].precio} €`)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Ejecutar el test**

Run: `cd frontend && npx vitest run src/pages/servicios/CanjeCarnet.precio.test.jsx`
Expected: hoy PASA (precio hardcodeado "210 €" = shared). Test de anclaje; seguirá verde tras el refactor.

- [ ] **Step 3: Editar cada ficha** — para cada archivo, (a) añadir tras los imports la línea `const S = SERVICIOS['<slug>'];`, (b) añadir el import `import { SERVICIOS } from '@shared/servicios.js';`, (c) sustituir en el `<LeadForm ...>` los props `precio` e `includes`. Dejar `servicio=` y `tramite=` intactos.

Slug por archivo:

| Archivo | slug |
|---|---|
| CanjeCarnet.jsx | `canje-carnet` |
| DuplicadoCarnet.jsx | `duplicado-carnet` |
| DuplicadoDatos.jsx | `duplicado-datos` |
| PermisoInternacional.jsx | `permiso-internacional` |
| Transferencia.jsx | `transferencia` |
| BajaVehiculo.jsx | `baja-vehiculo` |
| CancelacionDominio.jsx | `cancelacion-dominio` |
| DuplicadoCirculacion.jsx | `duplicado-circulacion` |

Ejemplo concreto para `CanjeCarnet.jsx`:

Añadir import bajo `import styles from './CanjeCarnet.module.css';`:
```jsx
import { SERVICIOS } from '@shared/servicios.js';
```
Añadir bajo los imports, antes de `const COUNTRIES = [`:
```jsx
const S = SERVICIOS['canje-carnet'];
```
En el `<LeadForm>`, cambiar:
```jsx
              precio="210 €"
              includes={['Tasas DGT incluidas', 'Gestión completa', 'Especialista personal asignado', 'Garantía de éxito del trámite']}
```
por:
```jsx
              precio={`${S.precio} €`}
              includes={S.includes}
```

Para las otras 7 fichas es el mismo patrón (el `const S` puede ir a nivel de módulo, tras los imports): sustituir la línea `precio="..."` por `precio={\`${S.precio} €\`}` y la línea `includes={[...]}` por `includes={S.includes}`.

- [ ] **Step 4: Verificar que `servicio=`/`tramite=` NO se tocaron**

Run: `cd frontend && git diff --unified=0 src/pages/servicios/*.jsx | grep -E '^\+.*(servicio=|tramite=)'`
Expected: sin salida (no se añadió/cambió ninguna línea `servicio=`/`tramite=`).

- [ ] **Step 5: Ejecutar los tests del front de servicios**

Run: `cd frontend && npx vitest run src/pages/servicios/`
Expected: todos PASS (incluye el nuevo `CanjeCarnet.precio.test.jsx` y los existentes).

- [ ] **Step 6: Compilar el front para confirmar que el alias resuelve en build**

Run: `cd frontend && npm run build`
Expected: build OK, sin errores de resolución de `@shared`.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/servicios/
git commit -m "feat: trámite pages derive price/includes from shared/servicios"
```

---

### Task 5: `ftp-deploy` sube también `shared/`

**Files:**
- Modify: `ftp-deploy.cjs` (añadir `shared/` a los `targets`)

**Interfaces:**
- Consumes: la carpeta `shared/` (Task 1). El backend en el servidor la importa vía `../../shared/servicios.js`.

- [ ] **Step 1: Añadir `shared` a los targets en `ftp-deploy.cjs`**

Localizar el array `targets` y añadir la carpeta `shared` (queda como hermana de `backend/` en el servidor, igual que en local, para que `../../shared` resuelva):

```js
  const targets = [
    { local: path.join(ROOT, 'backend'), remote: 'backend' },
    { local: path.join(ROOT, 'shared'), remote: 'shared' },
    { local: path.join(ROOT, 'frontend', 'dist'), remote: 'frontend/dist' },
  ].filter((t) => fs.existsSync(t.local));
```

- [ ] **Step 2: Verificar que `collectFiles` incluye `shared/servicios.js`**

Run: `node -e "const fs=require('fs');console.log(fs.readdirSync('shared'))"`
Expected: imprime `[ 'servicios.js', 'servicios.test.js' ]` — confirma que la carpeta existe y se subirá.

- [ ] **Step 3: Commit**

```bash
git add ftp-deploy.cjs
git commit -m "chore: ftp-deploy uploads shared/ alongside backend and frontend"
```

---

### Task 6: Limpiar datos de prueba y verificación end-to-end

**Files:**
- (temporal) `backend/.cleanup-tmp.mjs` (se crea, se ejecuta y se borra)

**Interfaces:**
- Consumes: `backend/src/db.js`, el backend corriendo en modo demo contra `gestadia_portal_db`.

- [ ] **Step 1: Limpiar los expedientes/usuarios de prueba con slugs viejos**

Crear `backend/.cleanup-tmp.mjs`:

```js
import { db } from './src/db.js';

const emails = ['demo@gestadia.local', 'sim-test@example.com', 'test@example.com'];
for (const email of emails) {
  const u = await db.user.findUnique({ where: { email }, include: { expedientes: true } });
  if (!u) { console.log('(no existe)', email); continue; }
  for (const e of u.expedientes) {
    await db.documento.deleteMany({ where: { expedienteId: e.id } });
    await db.eventoExpediente.deleteMany({ where: { expedienteId: e.id } });
  }
  await db.expediente.deleteMany({ where: { userId: u.id } });
  await db.notificacion.deleteMany({ where: { userId: u.id } });
  await db.user.delete({ where: { id: u.id } });
  console.log('borrado', email);
}
await db.$disconnect();
```

Run: `cd backend && node .cleanup-tmp.mjs && rm -f .cleanup-tmp.mjs`
Expected: imprime `borrado ...` para los que existan; script borrado al final.

- [ ] **Step 2: Reiniciar el backend (recoge el catálogo nuevo)**

Si el backend está corriendo con `npm run dev` (`node --watch`), ya se recargó al cambiar `catalog.js`. Si no, arrancarlo:
Run: `cd backend && npm run dev`
Expected: `Gestadia backend ▸ http://localhost:3001` · `Stripe: MODO DEMO · Zoho: off · SMTP: consola`.

- [ ] **Step 3: Verificar `/api/servicios` (precios nuevos)**

Run: `curl -s http://localhost:3001/api/servicios`
Expected: 8 servicios; `canje-carnet` con `"precio":210` y `checklist` con `clave` `residencia`/`permiso_extranjero`/`psicotecnico`.

- [ ] **Step 4: Checkout demo del canje y comprobación del precio + documentos**

Run:
```bash
curl -s -X POST http://localhost:3001/api/checkout -H "Content-Type: application/json" \
  -d '{"servicio":"canje-carnet","nombre":"Demo","apellidos":"Cliente","email":"demo@gestadia.local","aceptaCondiciones":true}'
```
Expected: `{"demo":true,"url":"/gracias.html?pedido=GST-..."}` y en el log del backend `[zoho:demo] createDeal ... Canje`.

- [ ] **Step 5: Recrear la contraseña del usuario demo (para entrar al portal)**

Crear `backend/.seed-tmp.mjs`:

```js
import { db } from './src/db.js';
import bcrypt from 'bcryptjs';
const user = await db.user.findUnique({ where: { email: 'demo@gestadia.local' } });
await db.user.update({
  where: { id: user.id },
  data: { passwordHash: await bcrypt.hash('Gestadia2026', 12), emailVerified: true, inviteToken: null },
});
console.log('OK: contraseña establecida');
await db.$disconnect();
```

Run: `cd backend && node .seed-tmp.mjs && rm -f .seed-tmp.mjs`
Expected: `OK: contraseña establecida`.

- [ ] **Step 6: Verificar que el portal pide los documentos correctos**

Login para obtener token:
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"demo@gestadia.local","password":"Gestadia2026"}' | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).token))")
EXP=$(curl -s http://localhost:3001/api/expedientes -H "Authorization: Bearer $TOKEN" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d)[0].id))")
curl -s http://localhost:3001/api/expedientes/$EXP -H "Authorization: Bearer $TOKEN"
```
Expected: la respuesta incluye `checklist` con las claves de Canje (`residencia`, `permiso_extranjero`, `psicotecnico`) y `importe` 210.

- [ ] **Step 7: Smoke test completo (opcional si hay backend arriba)**

Run: `npx playwright test tests/backend-smoke.spec.js`
Expected: 3 passed (el test de `/api/servicios` ahora comprueba `canje-carnet`).

---

## Definition of Done

- [ ] `node --test shared/servicios.test.js` — PASS (8 servicios, precios correctos).
- [ ] `cd backend && node --experimental-test-module-mocks --test src/catalog.test.js` — PASS; `getServicio('canje')` es `null`.
- [ ] `cd frontend && npx vitest run` — PASS (incluye los guards de Tramites y CanjeCarnet).
- [ ] `cd frontend && npm run build` — OK (alias `@shared` resuelve en build).
- [ ] `curl /api/servicios` devuelve los 8 con `canje-carnet` a 210 € y checklist de Canje.
- [ ] Checkout demo de `canje-carnet` crea expediente por 210 € y el portal pide los documentos de Canje.
- [ ] `git diff` de las fichas no toca ninguna línea `servicio=`/`tramite=`.
- [ ] Datos de prueba con slugs viejos limpiados; usuario demo recreado con `canje-carnet`.
- [ ] Aviso Zoho (best-effort en 7 servicios) queda documentado en `shared/servicios.js` para la fase de publicación.
```
