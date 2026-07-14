# Canje: país + dirección + documentos/campos por país — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En el checkout de Canje se captura el país del permiso, una dirección de envío estructurada y los campos de texto que exija el país (§5.4); se guardan en el expediente; y la checklist del portal pasa a ser los documentos base + el documento extra del país.

**Architecture:** Datos país en un módulo puro `shared/paises-canje.js`; helpers puros (`checklistExpediente`, `validarDatosCanje`) en `shared/servicios.js`. El backend guarda `paisCanje`/`direccion`/`datosPais` en `Expediente` (Prisma, campos additivos) y usa el helper para la checklist del portal. El frontend (Checkout) muestra los bloques nuevos según flags del servicio y los envía; el portal muestra una tarjeta "Datos del trámite".

**Tech Stack:** Node ≥22.5 (ESM), Express, Prisma/MySQL, Vite+React, Vitest (front), `node --test` (back/shared).

## Global Constraints

- Node ≥22.5, todo ESM.
- Solo afecta a `canje-carnet` (vía flags `requierePais`/`requiereDireccion`); el resto de servicios no cambian de comportamiento.
- Migración Prisma **additiva** (columnas nullable) sobre la BD hosteada `gestadia.com:3306/gestadia_portal_db`. Nunca imprimir `backend/.env`.
- La checklist del portal NO etiqueta los documentos como "según país": se muestran todos igual (base + extra concatenados).
- Etiqueta del bloque de dirección en el checkout: **"Dirección de envío del permiso"** (sin "formato DGT").
- País restringido a los 33 con convenio (§4) + UE/EEE. `paisCanje` se guarda por su `clave` (slug estable), no por el nombre.
- Diferido (no implementar aquí): documento condicional por DNI + fecha de obtención del permiso; Nº de Computación de Paraguay (tarea interna, no se pide al cliente).

---

### Task 1: `shared/paises-canje.js` + `shared/direccion.js`

**Files:**
- Create: `shared/paises-canje.js`
- Create: `shared/direccion.js`
- Test: `shared/paises-canje.test.js`

**Interfaces:**
- Produces: `export const PAISES` (objeto por `clave`: `{ clave, nombre, tipo:'convenio'|'ue', documentosExtra:[{clave,label}], camposExtra:[{clave,label}] }`) y `export function paisesOrdenados()` (para el desplegable). `shared/direccion.js` exporta `TIPOS_VIA` (string[]) y `PROVINCIAS` (string[]). Consumidos por Task 2 (helper), Task 4/5 (backend) y Task 6 (checkout).

- [ ] **Step 1: Escribir el test que falla** — `shared/paises-canje.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAISES } from './paises-canje.js';

const conv = Object.values(PAISES).filter((p) => p.tipo === 'convenio');
const ue = Object.values(PAISES).filter((p) => p.tipo === 'ue');

test('hay 33 países con convenio y 29 UE/EEE', () => {
  assert.equal(conv.length, 33);
  assert.equal(ue.length, 29);
});

test('España no está (no se canjea un permiso español)', () => {
  assert.ok(!Object.values(PAISES).some((p) => p.nombre === 'España'));
});

test('los 5 países con documento extra', () => {
  assert.equal(PAISES['argentina'].documentosExtra[0].label, 'Historial de conducción apostillado (La Haya)');
  assert.equal(PAISES['reino-unido'].documentosExtra[0].label, 'Check Code actualizado (DVLA)');
  assert.equal(PAISES['corea-del-sur'].documentosExtra[0].label, 'Traducción oficial del permiso');
  assert.equal(PAISES['filipinas'].documentosExtra[0].label, 'Pasaporte');
  assert.equal(PAISES['japon'].documentosExtra[0].label, 'Traducción y verificación del permiso');
});

test('los campos manuales por país (§5.4)', () => {
  assert.deepEqual(PAISES['argelia'].camposExtra.map((c) => c.clave), ['wilaya', 'daira']);
  assert.equal(PAISES['bolivia'].camposExtra[0].clave, 'lugar_expedicion');
  assert.equal(PAISES['nicaragua'].camposExtra[0].clave, 'lugar_expedicion');
  assert.equal(PAISES['republica-dominicana'].camposExtra[0].clave, 'lugar_expedicion');
  assert.equal(PAISES['paraguay'].camposExtra.length, 0); // Nº Computación es tarea interna
});

test('todo país tiene documentosExtra y camposExtra como arrays', () => {
  for (const p of Object.values(PAISES)) {
    assert.ok(Array.isArray(p.documentosExtra));
    assert.ok(Array.isArray(p.camposExtra));
    assert.ok(p.clave && p.nombre);
  }
});
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node --test shared/paises-canje.test.js`
Expected: FAIL — `Cannot find module './paises-canje.js'`.

- [ ] **Step 3: Escribir `shared/paises-canje.js`**

```js
// ============================================================
// Países canjeables (guía DGT §4) + documentos/campos extra por
// país (§2.2.4 y §5.4). Módulo de datos puro (sin Node/React).
// `paisCanje` se guarda por `clave`. Paraguay NO lleva campo
// (el Nº de Computación lo obtiene la gestoría de OPACI).
// ============================================================

const CONVENIO = [
  { clave: 'andorra', nombre: 'Andorra' },
  { clave: 'argelia', nombre: 'Argelia', camposExtra: [
    { clave: 'wilaya', label: 'Wilaya de expedición' },
    { clave: 'daira', label: 'Daira de expedición' },
  ] },
  { clave: 'argentina', nombre: 'Argentina', documentosExtra: [
    { clave: 'historial_apostillado', label: 'Historial de conducción apostillado (La Haya)' },
  ] },
  { clave: 'bolivia', nombre: 'Bolivia', camposExtra: [
    { clave: 'lugar_expedicion', label: 'Lugar de expedición (departamento)' },
  ] },
  { clave: 'brasil', nombre: 'Brasil' },
  { clave: 'chile', nombre: 'Chile' },
  { clave: 'colombia', nombre: 'Colombia' },
  { clave: 'corea-del-sur', nombre: 'Corea del Sur', documentosExtra: [
    { clave: 'traduccion_oficial', label: 'Traducción oficial del permiso' },
  ] },
  { clave: 'costa-rica', nombre: 'Costa Rica' },
  { clave: 'ecuador', nombre: 'Ecuador' },
  { clave: 'el-salvador', nombre: 'El Salvador' },
  { clave: 'filipinas', nombre: 'Filipinas', documentosExtra: [
    { clave: 'pasaporte', label: 'Pasaporte' },
  ] },
  { clave: 'georgia', nombre: 'Georgia' },
  { clave: 'guatemala', nombre: 'Guatemala' },
  { clave: 'honduras', nombre: 'Honduras' },
  { clave: 'japon', nombre: 'Japón', documentosExtra: [
    { clave: 'traduccion_verificacion', label: 'Traducción y verificación del permiso' },
  ] },
  { clave: 'macedonia-del-norte', nombre: 'Macedonia del Norte' },
  { clave: 'marruecos', nombre: 'Marruecos' },
  { clave: 'moldavia', nombre: 'Moldavia' },
  { clave: 'monaco', nombre: 'Mónaco' },
  { clave: 'nicaragua', nombre: 'Nicaragua', camposExtra: [
    { clave: 'lugar_expedicion', label: 'Lugar de expedición' },
  ] },
  { clave: 'nueva-zelanda', nombre: 'Nueva Zelanda' },
  { clave: 'panama', nombre: 'Panamá' },
  { clave: 'paraguay', nombre: 'Paraguay' },
  { clave: 'peru', nombre: 'Perú' },
  { clave: 'reino-unido', nombre: 'Reino Unido e Irlanda del Norte', documentosExtra: [
    { clave: 'check_code', label: 'Check Code actualizado (DVLA)' },
  ] },
  { clave: 'republica-dominicana', nombre: 'República Dominicana', camposExtra: [
    { clave: 'lugar_expedicion', label: 'Lugar de expedición (formato antiguo)' },
  ] },
  { clave: 'serbia', nombre: 'Serbia' },
  { clave: 'suiza', nombre: 'Suiza' },
  { clave: 'tunez', nombre: 'Túnez' },
  { clave: 'turquia', nombre: 'Turquía' },
  { clave: 'ucrania', nombre: 'Ucrania' },
  { clave: 'uruguay', nombre: 'Uruguay' },
];

const UE = [
  ['alemania', 'Alemania'], ['austria', 'Austria'], ['belgica', 'Bélgica'], ['bulgaria', 'Bulgaria'],
  ['chipre', 'Chipre'], ['croacia', 'Croacia'], ['dinamarca', 'Dinamarca'], ['eslovaquia', 'Eslovaquia'],
  ['eslovenia', 'Eslovenia'], ['estonia', 'Estonia'], ['finlandia', 'Finlandia'], ['francia', 'Francia'],
  ['grecia', 'Grecia'], ['hungria', 'Hungría'], ['irlanda', 'Irlanda'], ['islandia', 'Islandia'],
  ['italia', 'Italia'], ['letonia', 'Letonia'], ['liechtenstein', 'Liechtenstein'], ['lituania', 'Lituania'],
  ['luxemburgo', 'Luxemburgo'], ['malta', 'Malta'], ['noruega', 'Noruega'], ['paises-bajos', 'Países Bajos'],
  ['polonia', 'Polonia'], ['portugal', 'Portugal'], ['republica-checa', 'República Checa'], ['rumania', 'Rumanía'],
  ['suecia', 'Suecia'],
].map(([clave, nombre]) => ({ clave, nombre }));

function normalizar(p, tipo) {
  return { documentosExtra: [], camposExtra: [], ...p, tipo };
}

export const PAISES = Object.fromEntries([
  ...CONVENIO.map((p) => normalizar(p, 'convenio')),
  ...UE.map((p) => normalizar(p, 'ue')),
].map((p) => [p.clave, p]));

// Para el desplegable: agrupado y ordenado alfabéticamente por nombre.
export function paisesOrdenados() {
  const orden = (a, b) => a.nombre.localeCompare(b.nombre, 'es');
  return {
    convenio: Object.values(PAISES).filter((p) => p.tipo === 'convenio').sort(orden),
    ue: Object.values(PAISES).filter((p) => p.tipo === 'ue').sort(orden),
  };
}
```

- [ ] **Step 4: Escribir `shared/direccion.js`**

```js
// Constantes del formulario de dirección de envío del permiso.
export const TIPOS_VIA = ['Calle', 'Avenida', 'Plaza', 'Paseo', 'Carretera', 'Camino', 'Travesía', 'Ronda', 'Vía', 'Otro'];

export const PROVINCIAS = [
  'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Baleares', 'Barcelona',
  'Bizkaia', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ceuta', 'Ciudad Real', 'Córdoba',
  'A Coruña', 'Cuenca', 'Gipuzkoa', 'Girona', 'Granada', 'Guadalajara', 'Huelva', 'Huesca', 'Jaén', 'León',
  'Lleida', 'Lugo', 'Madrid', 'Málaga', 'Melilla', 'Murcia', 'Navarra', 'Ourense', 'Palencia', 'Las Palmas',
  'Pontevedra', 'La Rioja', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia', 'Sevilla', 'Soria', 'Tarragona',
  'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Zamora', 'Zaragoza',
];
```

- [ ] **Step 5: Ejecutar el test para verificar que pasa**

Run: `node --test shared/paises-canje.test.js`
Expected: 5 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add shared/paises-canje.js shared/paises-canje.test.js shared/direccion.js
git commit -m "feat: add shared países-canje (convenio+UE, docs/campos por país) + direccion consts"
```

---

### Task 2: Helpers `checklistExpediente` + `validarDatosCanje` + flags

**Files:**
- Modify: `shared/servicios.js` (import PAISES; añadir flags a `canje-carnet`; exportar helpers)
- Test: `shared/servicios.test.js` (ampliar)

**Interfaces:**
- Consumes: `PAISES` de `./paises-canje.js`.
- Produces: `checklistExpediente(servicioSlug, paisCanje)` → `{clave,label}[]`; `validarDatosCanje(servicio, { paisCanje, direccion, datosPais })` → `string|null` (mensaje de error o null); `canje-carnet` gana `requierePais:true` y `requiereDireccion:true`.

- [ ] **Step 1: Escribir los tests que fallan** — añadir a `shared/servicios.test.js`

```js
import { checklistExpediente, validarDatosCanje, SERVICIOS as SRV } from './servicios.js';

test('canje-carnet tiene flags requierePais/requiereDireccion', () => {
  assert.equal(SRV['canje-carnet'].requierePais, true);
  assert.equal(SRV['canje-carnet'].requiereDireccion, true);
  assert.equal(SRV['duplicado-carnet'].requierePais, undefined);
});

test('checklistExpediente = base + extra del país', () => {
  assert.equal(checklistExpediente('canje-carnet', 'argentina').length, 4);
  assert.equal(checklistExpediente('canje-carnet', 'alemania').length, 3);
  assert.equal(checklistExpediente('canje-carnet', null).length, 3);
  const arg = checklistExpediente('canje-carnet', 'argentina');
  assert.equal(arg.at(-1).clave, 'historial_apostillado');
});

test('validarDatosCanje exige país válido y campos manuales', () => {
  const s = SRV['canje-carnet'];
  const dirOK = { nombreVia: 'Gran Vía', numero: '1', codigoPostal: '28013', municipio: 'Madrid', provincia: 'Madrid' };
  assert.equal(validarDatosCanje(s, { paisCanje: 'argentina', direccion: dirOK, datosPais: {} }), null);
  assert.match(validarDatosCanje(s, { paisCanje: '', direccion: dirOK, datosPais: {} }), /país/i);
  assert.match(validarDatosCanje(s, { paisCanje: 'zzz', direccion: dirOK, datosPais: {} }), /país/i);
  // Argelia exige wilaya + daira
  assert.match(validarDatosCanje(s, { paisCanje: 'argelia', direccion: dirOK, datosPais: { wilaya: 'Argel' } }), /Daira/i);
  assert.equal(validarDatosCanje(s, { paisCanje: 'argelia', direccion: dirOK, datosPais: { wilaya: 'Argel', daira: 'X' } }), null);
  // dirección incompleta
  assert.match(validarDatosCanje(s, { paisCanje: 'argentina', direccion: { nombreVia: 'x' }, datosPais: {} }), /dirección/i);
});

test('validarDatosCanje no exige nada a servicios sin flags', () => {
  assert.equal(validarDatosCanje(SRV['duplicado-carnet'], { paisCanje: '', direccion: {}, datosPais: {} }), null);
});
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `cd backend && node --experimental-test-module-mocks --test ../shared/servicios.test.js` *(o `node --test shared/servicios.test.js` desde la raíz)*
Expected: FAIL — `checklistExpediente is not a function` / flags undefined.

- [ ] **Step 3: Modificar `shared/servicios.js`**

Añadir el import arriba:

```js
import { PAISES } from './paises-canje.js';
```

Añadir a la entrada `canje-carnet` (junto a `slug`, `nombre`, …):

```js
    requierePais: true,
    requiereDireccion: true,
```

Añadir al final del archivo:

```js
export function checklistExpediente(servicioSlug, paisCanje) {
  const base = SERVICIOS[servicioSlug]?.documentos ?? [];
  const extra = paisCanje ? (PAISES[paisCanje]?.documentosExtra ?? []) : [];
  return [...base, ...extra];
}

const DIRECCION_OBLIGATORIOS = ['nombreVia', 'numero', 'codigoPostal', 'municipio', 'provincia'];

// Devuelve un mensaje de error (string) o null si es válido.
export function validarDatosCanje(servicio, { paisCanje, direccion, datosPais } = {}) {
  if (servicio?.requierePais) {
    const pais = PAISES[paisCanje];
    if (!pais) return 'Selecciona el país del permiso.';
    for (const campo of pais.camposExtra) {
      if (!String(datosPais?.[campo.clave] || '').trim()) return `Falta el campo "${campo.label}".`;
    }
  }
  if (servicio?.requiereDireccion) {
    for (const k of DIRECCION_OBLIGATORIOS) {
      if (!String(direccion?.[k] || '').trim()) return 'Completa la dirección de envío del permiso.';
    }
  }
  return null;
}
```

- [ ] **Step 4: Ejecutar los tests para verificar que pasan**

Run: `node --test shared/servicios.test.js`
Expected: todos PASS (los previos + los 4 nuevos).

- [ ] **Step 5: Commit**

```bash
git add shared/servicios.js shared/servicios.test.js
git commit -m "feat: checklistExpediente + validarDatosCanje + canje flags in shared"
```

---

### Task 3: Migración Prisma (`paisCanje`, `direccion`, `datosPais`)

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/<timestamp>_canje_pais_direccion/migration.sql` (lo genera Prisma)

**Interfaces:**
- Produces: columnas `paisCanje`, `direccion`, `datosPais` en `Expediente` — consumidas por Tasks 4 y 5.

- [ ] **Step 1: Añadir los campos al modelo `Expediente`** en `backend/prisma/schema.prisma` (tras `finDesistimiento`):

```prisma
  paisCanje        String?
  direccion        Json?
  datosPais        Json?
```

- [ ] **Step 2: Crear y aplicar la migración additiva contra la BD**

Run: `cd backend && npx prisma migrate dev --name canje_pais_direccion`
Expected: `Your database is now in sync with your schema.` y se crea `prisma/migrations/<ts>_canje_pais_direccion/migration.sql` con `ALTER TABLE ... ADD COLUMN` (columnas nullable, sin pérdida de datos).

- [ ] **Step 3: Regenerar el cliente y verificar**

Run: `cd backend && npx prisma generate && npx prisma migrate status`
Expected: `Database schema is up to date!`.

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations
git commit -m "feat: add paisCanje/direccion/datosPais to Expediente (additive migration)"
```

---

### Task 4: Backend checkout — flags en `/api/servicios` + validar y guardar

**Files:**
- Modify: `backend/src/routes/checkout.js`

**Interfaces:**
- Consumes: `validarDatosCanje` (Task 2), `getServicio` (catalog).
- Produces: `GET /api/servicios` incluye `requierePais`/`requiereDireccion`; `POST /api/checkout` valida y guarda `paisCanje`/`direccion`/`datosPais`.

- [ ] **Step 1: Ampliar `/api/servicios`** en `backend/src/routes/checkout.js` (líneas ~19-22):

```js
checkoutRouter.get('/api/servicios', (_req, res) => {
  res.json(Object.values(SERVICIOS).map(({ slug, nombre, descripcion, precio, checklist, requierePais, requiereDireccion }) =>
    ({ slug, nombre, descripcion, precio, checklist, requierePais: !!requierePais, requiereDireccion: !!requiereDireccion })));
});
```

- [ ] **Step 2: Re-exportar los helpers desde `catalog.js`** — añadir al final de `backend/src/catalog.js`:

```js
export { checklistExpediente, validarDatosCanje } from '../../shared/servicios.js';
```

- [ ] **Step 3: Importar `validarDatosCanje` en `checkout.js`** — sustituir la línea de import existente `import { SERVICIOS, getServicio } from '../catalog.js';` por:

```js
import { SERVICIOS, getServicio, validarDatosCanje } from '../catalog.js';
```

- [ ] **Step 4: Validar y guardar en `POST /api/checkout`** — en `backend/src/routes/checkout.js`, dentro del `try`, tras obtener `servicio` y validar los campos personales, añadir:

```js
    const { paisCanje, direccion, datosPais } = req.body || {};
    const errorCanje = validarDatosCanje(servicio, { paisCanje, direccion, datosPais });
    if (errorCanje) return res.status(400).json({ error: errorCanje });
```

Y en `db.expediente.create({ data: { … } })`, añadir a `data` (solo si el servicio los requiere, para no ensuciar otros trámites):

```js
        ...(servicio.requierePais ? { paisCanje } : {}),
        ...(servicio.requiereDireccion ? { direccion, datosPais: datosPais || {} } : {}),
```

- [ ] **Step 5: Actualizar `server.test.js`** para comprobar los flags — en `backend/src/server.test.js`, dentro del test de `/api/servicios`, añadir:

```js
  const canje = body.find((s) => s.slug === 'canje-carnet');
  assert.equal(canje.requierePais, true);
  assert.equal(canje.requiereDireccion, true);
```

- [ ] **Step 6: Ejecutar los tests que no necesitan BD**

Run: `cd backend && node --experimental-test-module-mocks --test src/server.test.js src/catalog.test.js`
Expected: PASS (server.test verifica los flags de `/api/servicios`).

- [ ] **Step 7: Commit**

```bash
git add backend/src/routes/checkout.js backend/src/catalog.js backend/src/server.test.js
git commit -m "feat: checkout validates + stores paisCanje/direccion/datosPais; /api/servicios exposes flags"
```

---

### Task 5: Backend portal — checklist por país + devolver datos

**Files:**
- Modify: `backend/src/routes/portal.js`

**Interfaces:**
- Consumes: `checklistExpediente` (re-exportado desde `catalog.js` en Task 4 Step 3).
- Produces: `GET /api/expedientes/:id` devuelve la checklist base+país y los campos `paisCanje`/`direccion`/`datosPais`; el "completo" del POST usa la misma checklist.

- [ ] **Step 1: Importar el helper** — en `backend/src/routes/portal.js`, cambiar:

```js
import { getServicio, ESTADOS } from '../catalog.js';
```
por:
```js
import { getServicio, ESTADOS, checklistExpediente } from '../catalog.js';
```

- [ ] **Step 2: `GET /api/expedientes/:id`** — sustituir el bloque `checklist:` y añadir los datos. Reemplazar (líneas ~65-73):

```js
  const servicio = getServicio(e.servicioSlug);
  res.json({
    ...resumen(e),
    eventos: e.eventos,
    documentos: e.documentos.map(({ id, clave, nombre, createdAt }) => ({ id, clave, nombre, createdAt })),
    checklist: (servicio?.checklist || []).map((c) => ({
      ...c, subido: e.documentos.some((d) => d.clave === c.clave),
    })),
  });
```
por:
```js
  const checklist = checklistExpediente(e.servicioSlug, e.paisCanje);
  res.json({
    ...resumen(e),
    eventos: e.eventos,
    documentos: e.documentos.map(({ id, clave, nombre, createdAt }) => ({ id, clave, nombre, createdAt })),
    checklist: checklist.map((c) => ({ ...c, subido: e.documentos.some((d) => d.clave === c.clave) })),
    paisCanje: e.paisCanje || null,
    direccion: e.direccion || null,
    datosPais: e.datosPais || null,
  });
```

- [ ] **Step 3: `POST /api/expedientes/:id/documentos`** — que el "completo" use la checklist calculada. Reemplazar (líneas ~99-101):

```js
  const servicio = getServicio(e.servicioSlug);
  const claves = new Set([...e.documentos.map((d) => d.clave), clave]);
  const completo = (servicio?.checklist || []).every((c) => claves.has(c.clave));
```
por:
```js
  const claves = new Set([...e.documentos.map((d) => d.clave), clave]);
  const checklist = checklistExpediente(e.servicioSlug, e.paisCanje);
  const completo = checklist.length > 0 && checklist.every((c) => claves.has(c.clave));
```

- [ ] **Step 4: Verificación de sintaxis/carga del módulo**

Run: `cd backend && node -e "import('./src/routes/portal.js').then(()=>console.log('portal OK'))"`
Expected: `portal OK` (sin errores de import/sintaxis).

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/portal.js
git commit -m "feat: portal checklist = base + país extra; expediente returns paisCanje/direccion/datosPais"
```

---

### Task 6: Frontend — Checkout (país + campos manuales + dirección)

**Files:**
- Modify: `frontend/src/pages/Checkout.jsx`
- Test: `frontend/src/pages/Checkout.test.jsx` (ampliar/añadir casos)

**Interfaces:**
- Consumes: `PAISES`, `paisesOrdenados` de `@shared/paises-canje.js`; `TIPOS_VIA`, `PROVINCIAS` de `@shared/direccion.js`; `servicio.requierePais/requiereDireccion` de `/api/servicios`.
- Produces: el `POST /api/checkout` incluye `paisCanje`, `direccion`, `datosPais`.

- [ ] **Step 1: Escribir el test que falla** — añadir DOS casos dentro del `describe('Checkout', …)` ya existente en `frontend/src/pages/Checkout.test.jsx`, con el MISMO patrón de `global.fetch` que usa el test actual (no usar `vi.mock('../lib/api.js')`, rompería el test existente):

```jsx
  it('muestra país y dirección para un servicio con flags (canje)', async () => {
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes('/api/servicios')) {
        return { ok: true, json: async () => [{ slug: 'canje-carnet', nombre: 'Canje de Carnet Extranjero', descripcion: 'x', precio: 210, checklist: [], requierePais: true, requiereDireccion: true }] };
      }
      return { ok: true, json: async () => ({ demo: true, url: '/gracias?pedido=X' }) };
    });
    render(<MemoryRouter initialEntries={['/checkout?servicio=canje-carnet']}><Checkout /></MemoryRouter>);
    await waitFor(() => expect(screen.getByLabelText(/país del permiso/i)).toBeInTheDocument());
    expect(screen.getByText(/Dirección de envío del permiso/i)).toBeInTheDocument();
  });

  it('no muestra país/dirección para un servicio sin flags', async () => {
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes('/api/servicios')) {
        return { ok: true, json: async () => [{ slug: 'duplicado-carnet', nombre: 'Duplicado de Carnet de Conducir', descripcion: 'x', precio: 70, checklist: [], requierePais: false, requiereDireccion: false }] };
      }
      return { ok: true, json: async () => ({ demo: true, url: '/x' }) };
    });
    render(<MemoryRouter initialEntries={['/checkout?servicio=duplicado-carnet']}><Checkout /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Tus datos/i)).toBeInTheDocument());
    expect(screen.queryByLabelText(/país del permiso/i)).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `cd frontend && npx vitest run src/pages/Checkout.test.jsx`
Expected: FAIL — no existe el campo "País del permiso".

- [ ] **Step 3: Modificar `frontend/src/pages/Checkout.jsx`**

Añadir imports:
```jsx
import { PAISES, paisesOrdenados } from '@shared/paises-canje.js';
import { TIPOS_VIA, PROVINCIAS } from '@shared/direccion.js';
```

Ampliar el estado inicial (`EMPTY_FORM`) con:
```jsx
  paisCanje: '',
  datosPais: {},
  direccion: { tipoVia: 'Calle', nombreVia: '', numero: '', bloque: '', portal: '', escalera: '', planta: '', puerta: '', km: '', codigoPostal: '', municipio: '', localidad: '', provincia: '' },
```

Añadir estos handlers dentro del componente (junto a `handleChange`):
```jsx
  const grupos = paisesOrdenados();
  const camposPais = form.paisCanje ? (PAISES[form.paisCanje]?.camposExtra ?? []) : [];

  function handlePais(e) {
    setForm((f) => ({ ...f, paisCanje: e.target.value, datosPais: {} }));
  }
  function handleDatoPais(clave, value) {
    setForm((f) => ({ ...f, datosPais: { ...f.datosPais, [clave]: value } }));
  }
  function handleDireccion(campo, value) {
    setForm((f) => ({ ...f, direccion: { ...f.direccion, [campo]: value } }));
  }
```

En `handleSubmit`, el body ya envía `...form` (que ahora incluye `paisCanje`, `datosPais`, `direccion`). No hace falta cambiarlo, pero sí evitar mandar los bloques cuando el servicio no los pide:
```jsx
      const { paisCanje, datosPais, direccion, ...persona } = form;
      const extra = {};
      if (servicio.requierePais) { extra.paisCanje = paisCanje; extra.datosPais = datosPais; }
      if (servicio.requiereDireccion) { extra.direccion = direccion; }
      const body = await postCheckout({ servicio: servicio.slug, ...persona, ...extra });
```

Renderizar los bloques nuevos **dentro del `<form>`**, justo después del bloque "Tus datos" (tras el `formRow` del tipo/nº de documento y antes del checkbox de condiciones):

```jsx
              {servicio.requierePais && (
                <>
                  <div className={styles.formTitle}>País del permiso</div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="checkout-pais">País del permiso</label>
                    <select className={`${styles.formInput} ${styles.formSelect}`} id="checkout-pais" name="paisCanje" value={form.paisCanje} onChange={handlePais} required>
                      <option value="">— Selecciona el país —</option>
                      <optgroup label="Con convenio">
                        {grupos.convenio.map((p) => <option key={p.clave} value={p.clave}>{p.nombre}</option>)}
                      </optgroup>
                      <optgroup label="Unión Europea / EEE">
                        {grupos.ue.map((p) => <option key={p.clave} value={p.clave}>{p.nombre}</option>)}
                      </optgroup>
                    </select>
                  </div>
                  {camposPais.map((c) => (
                    <div className={styles.formGroup} key={c.clave}>
                      <label className={styles.formLabel} htmlFor={`checkout-${c.clave}`}>{c.label}</label>
                      <input className={styles.formInput} type="text" id={`checkout-${c.clave}`} value={form.datosPais[c.clave] || ''} onChange={(e) => handleDatoPais(c.clave, e.target.value)} required />
                    </div>
                  ))}
                </>
              )}

              {servicio.requiereDireccion && (
                <>
                  <div className={styles.formTitle}>Dirección de envío del permiso</div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="dir-tipoVia">Tipo de vía</label>
                      <select className={`${styles.formInput} ${styles.formSelect}`} id="dir-tipoVia" value={form.direccion.tipoVia} onChange={(e) => handleDireccion('tipoVia', e.target.value)}>
                        {TIPOS_VIA.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="dir-nombreVia">Nombre de vía</label>
                      <input className={styles.formInput} type="text" id="dir-nombreVia" value={form.direccion.nombreVia} onChange={(e) => handleDireccion('nombreVia', e.target.value)} required />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="dir-numero">Número</label>
                      <input className={styles.formInput} type="text" id="dir-numero" value={form.direccion.numero} onChange={(e) => handleDireccion('numero', e.target.value)} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="dir-cp">Código postal</label>
                      <input className={styles.formInput} type="text" id="dir-cp" value={form.direccion.codigoPostal} onChange={(e) => handleDireccion('codigoPostal', e.target.value)} required />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="dir-municipio">Municipio</label>
                      <input className={styles.formInput} type="text" id="dir-municipio" value={form.direccion.municipio} onChange={(e) => handleDireccion('municipio', e.target.value)} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="dir-provincia">Provincia</label>
                      <select className={`${styles.formInput} ${styles.formSelect}`} id="dir-provincia" value={form.direccion.provincia} onChange={(e) => handleDireccion('provincia', e.target.value)} required>
                        <option value="">— Provincia —</option>
                        {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="dir-bloque">Bloque / Portal / Escalera / Planta / Puerta (opcional)</label>
                      <input className={styles.formInput} type="text" id="dir-bloque" placeholder="Bloque 2, Portal A, 3º B" value={form.direccion.bloque} onChange={(e) => handleDireccion('bloque', e.target.value)} />
                    </div>
                  </div>
                </>
              )}
```

- [ ] **Step 4: Ejecutar los tests del Checkout**

Run: `cd frontend && npx vitest run src/pages/Checkout.test.jsx`
Expected: PASS (los 2 nuevos + los previos del archivo).

- [ ] **Step 5: Compilar para confirmar imports/JSX**

Run: `cd frontend && npm run build`
Expected: build OK.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/Checkout.jsx frontend/src/pages/Checkout.test.jsx
git commit -m "feat: checkout captures país + campos manuales + dirección for canje"
```

---

### Task 7: Frontend — tarjeta "Datos del trámite" en el portal

**Files:**
- Modify: `frontend/src/pages/portal/ExpedienteDetalle.jsx`
- Modify: `frontend/src/pages/portal/ExpedienteDetalle.module.css` (estilos de la tarjeta clave/valor)
- Test: `frontend/src/pages/portal/ExpedienteDetalle.test.jsx` (crear)

**Interfaces:**
- Consumes: `paisCanje`, `direccion`, `datosPais` de `GET /api/expedientes/:id`; `PAISES` de `@shared/paises-canje.js`.
- Produces: tarjeta visible cuando hay datos.

- [ ] **Step 1: Escribir el test que falla** — `frontend/src/pages/portal/ExpedienteDetalle.test.jsx`

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../lib/api.js', () => ({
  getExpediente: vi.fn(async () => ({
    id: 'e1', nPedido: 'GST-1', titulo: 'Canje de Carnet Extranjero', estado: 'documentacion_pendiente',
    estadoLabel: 'Falta documentación', progreso: 40, importe: 210, fechaPago: null, finDesistimiento: null,
    eventos: [], documentos: [], checklist: [],
    paisCanje: 'argelia', direccion: { nombreVia: 'Gran Vía', numero: '1', codigoPostal: '28013', municipio: 'Madrid', provincia: 'Madrid' },
    datosPais: { wilaya: 'Argel', daira: 'Bab El Oued' },
  })),
  uploadDocumento: vi.fn(),
}));

import ExpedienteDetalle from './ExpedienteDetalle.jsx';

describe('ExpedienteDetalle — Datos del trámite', () => {
  it('muestra país, dirección y campos manuales', async () => {
    render(
      <MemoryRouter initialEntries={['/portal/mis-servicios/e1']}>
        <Routes><Route path="/portal/mis-servicios/:id" element={<ExpedienteDetalle />} /></Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText(/Datos del trámite/i)).toBeInTheDocument());
    expect(screen.getByText(/Argelia/)).toBeInTheDocument();
    expect(screen.getByText(/Gran Vía 1/)).toBeInTheDocument();
    expect(screen.getByText('Argel')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `cd frontend && npx vitest run src/pages/portal/ExpedienteDetalle.test.jsx`
Expected: FAIL — no existe "Datos del trámite".

- [ ] **Step 3: Modificar `ExpedienteDetalle.jsx`** — añadir import y la tarjeta.

Import:
```jsx
import { PAISES } from '@shared/paises-canje.js';
```

Antes del `return`, componer los datos:
```jsx
  const pais = expediente.paisCanje ? PAISES[expediente.paisCanje] : null;
  const dir = expediente.direccion;
  const dirLinea = dir
    ? [[dir.tipoVia, dir.nombreVia, dir.numero].filter(Boolean).join(' '),
       [dir.bloque, dir.portal, dir.escalera, dir.planta, dir.puerta].filter(Boolean).join(' '),
       [dir.codigoPostal, dir.municipio, dir.provincia].filter(Boolean).join(' · ')].filter(Boolean).join(', ')
    : '';
  const camposPais = pais?.camposExtra ?? [];
  const tieneDatos = pais || dirLinea || (expediente.datosPais && Object.keys(expediente.datosPais).length);
```

Añadir la tarjeta tras el `card` de "Documentación" (antes de "Historial"):
```jsx
      {tieneDatos && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Datos del trámite</h2>
          <dl className={styles.datos}>
            {pais && (<><dt>País del permiso</dt><dd>{pais.nombre}</dd></>)}
            {dirLinea && (<><dt>Dirección de envío</dt><dd>{dirLinea}</dd></>)}
            {camposPais.map((c) => (
              <div key={c.clave} style={{ display: 'contents' }}>
                <dt>{c.label}</dt><dd>{expediente.datosPais?.[c.clave] || '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
```

- [ ] **Step 4: Estilos** — añadir a `frontend/src/pages/portal/ExpedienteDetalle.module.css`:

```css
.datos {
  display: grid;
  grid-template-columns: minmax(120px, auto) 1fr;
  gap: 8px 16px;
  margin: 0;
}
.datos dt { color: #6b6b6b; font-size: 13px; }
.datos dd { margin: 0; font-size: 14px; }
```

- [ ] **Step 5: Ejecutar el test para verificar que pasa**

Run: `cd frontend && npx vitest run src/pages/portal/ExpedienteDetalle.test.jsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/portal/ExpedienteDetalle.jsx frontend/src/pages/portal/ExpedienteDetalle.module.css frontend/src/pages/portal/ExpedienteDetalle.test.jsx
git commit -m "feat: portal shows 'Datos del trámite' card (país, dirección, campos manuales)"
```

---

### Task 8: Verificación end-to-end + limpieza

**Files:**
- (temporal) `backend/.cleanup-tmp.mjs`

**Interfaces:**
- Consumes: backend + frontend corriendo; BD demo.

- [ ] **Step 1: Suites completas**

Run: `node --test shared/paises-canje.test.js shared/servicios.test.js` (raíz) y `cd frontend && npx vitest run`
Expected: todo PASS.

- [ ] **Step 2: Reiniciar backend (recoge schema + rutas nuevas)**

Si corre con `npm run dev` (`--watch`), ya recargó. Si no: `cd backend && npm run dev`.

- [ ] **Step 3: Checkout demo de Canje con Argentina (con dirección + país)**

Run:
```bash
curl -s -X POST http://localhost:3001/api/checkout -H "Content-Type: application/json" -d '{
  "servicio":"canje-carnet","nombre":"Demo","apellidos":"Cliente","email":"demo@gestadia.local","aceptaCondiciones":true,
  "paisCanje":"argentina",
  "direccion":{"tipoVia":"Calle","nombreVia":"Gran Vía","numero":"24","codigoPostal":"28013","municipio":"Madrid","provincia":"Madrid"},
  "datosPais":{}
}'
```
Expected: `{"demo":true,"url":"/gracias.html?pedido=GST-..."}`.

- [ ] **Step 4: Comprobar el rechazo si falta país**

Run: `curl -s -X POST http://localhost:3001/api/checkout -H "Content-Type: application/json" -d '{"servicio":"canje-carnet","nombre":"D","apellidos":"C","email":"demo2@gestadia.local","aceptaCondiciones":true,"direccion":{"nombreVia":"x","numero":"1","codigoPostal":"28013","municipio":"Madrid","provincia":"Madrid"}}'`
Expected: `{"error":"Selecciona el país del permiso."}` (status 400).

- [ ] **Step 5: Verificar checklist (4 docs) + datos en el portal**

Reutilizar el patrón de login del plan anterior (set-password del demo si hace falta) y:
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"demo@gestadia.local","password":"Gestadia2026"}' | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).token))")
EXP=$(curl -s http://localhost:3001/api/expedientes -H "Authorization: Bearer $TOKEN" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d)[0].id))")
curl -s http://localhost:3001/api/expedientes/$EXP -H "Authorization: Bearer $TOKEN" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const e=JSON.parse(d);console.log('pais:',e.paisCanje,'| docs:',e.checklist.map(c=>c.clave).join(','),'| dir:',JSON.stringify(e.direccion))})"
```
Expected: `pais: argentina | docs: residencia,permiso_extranjero,psicotecnico,historial_apostillado | dir: {...}` (4 documentos, con la dirección guardada).

- [ ] **Step 6: (Navegador) Prueba manual en el checkout**

Abrir `http://localhost:5173/checkout?servicio=canje-carnet`, elegir **Argelia** → aparecen los campos **Wilaya** y **Daira**; rellenar dirección; pagar (demo) → en el portal, la sección Documentación muestra los 3 base (Argelia no añade documento) y la tarjeta "Datos del trámite" muestra país + dirección + Wilaya/Daira.

- [ ] **Step 7: Limpiar los expedientes de prueba**

Crear `backend/.cleanup-tmp.mjs` (borra los expedientes/usuarios de prueba de este plan) y ejecutarlo:

```js
import { db } from './src/db.js';
for (const email of ['demo@gestadia.local', 'demo2@gestadia.local']) {
  const u = await db.user.findUnique({ where: { email }, include: { expedientes: true } });
  if (!u) continue;
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
Expected: `borrado demo@gestadia.local` (y demo2 si se creó).

*(Nota: el Step 4 con 400 no crea expediente; demo2 solo existiría si se hiciera un checkout válido con ese email.)*

---

## Definition of Done

- [ ] `node --test shared/paises-canje.test.js shared/servicios.test.js` — PASS (países 33+29; checklistExpediente Argentina 4 / Alemania 3; validarDatosCanje).
- [ ] Migración additiva aplicada (`paisCanje`, `direccion`, `datosPais`); `prisma migrate status` up to date.
- [ ] `/api/servicios` expone `requierePais`/`requiereDireccion`; `POST /api/checkout` valida (400 si falta país o campo manual) y guarda los tres campos.
- [ ] `GET /api/expedientes/:id` devuelve checklist base+país (Argentina → 4) y `paisCanje`/`direccion`/`datosPais`.
- [ ] Checkout muestra país + campos manuales (dinámicos por país) + dirección estructurada solo en Canje; no en otros servicios.
- [ ] El portal muestra la tarjeta "Datos del trámite".
- [ ] `cd frontend && npx vitest run` y `npm run build` — OK.
- [ ] Expedientes de prueba limpiados.
```
