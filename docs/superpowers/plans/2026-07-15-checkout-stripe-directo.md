# Checkout directo a Stripe (catálogo, canal web, Zoho por móvil, teléfono con prefijo) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El checkout registra con teléfono obligatorio (con selector de prefijo internacional), crea/actualiza el contacto de Zoho deduplicando por móvil (rellenando solo huecos), y —cuando Stripe está activo— genera la sesión de pago referenciando el precio real por `lookup_key`, con el Customer ligado a Zoho y `metadata.canal=web`.

**Architecture:** Datos nuevos en módulos `shared/` (prefijos, `stripeLookupKey`). Helpers de Stripe puros y testeables en `backend/src/services/stripe.js` (reciben el cliente `stripe` como parámetro → mockeable). `upsertContact` (Zoho) cambia a búsqueda por móvil + merge de huecos. El checkout compone el teléfono internacional y valida su presencia. El webhook existente no cambia.

**Tech Stack:** Node ≥22.5 (ESM), Express, Prisma/MySQL, Stripe SDK, Vite+React, Vitest (front), `node --test` (back/shared).

## Global Constraints

- Node ≥22.5, todo ESM.
- **No trimar la lista de prefijos**: lista internacional completa (indicación explícita del usuario).
- Teléfono **obligatorio** en el checkout para **todos** los servicios; se guarda el número internacional completo (`+<prefijo><numero>`).
- Zoho: dedup por **móvil**; al actualizar un contacto existente **no se pisan** campos ya rellenos (solo se rellenan los vacíos); el **Deal se sigue creando nuevo** por expediente.
- Stripe: referenciar el `price` por `lookup_key` (no `price_data` inline); Customer ligado a Zoho (`external_provider: zoho`, `external_id: <zohoContactId>`); `metadata.canal='web'` + `nPedido` + `servicio` + `expedienteId`, propagados a `payment_intent_data.metadata`.
- Solo `canje-carnet` variante 1 categoría (210 €, `lookup_key` de Lidia).
- Modo demo (sin `STRIPE_SECRET_KEY`) intacto. `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` los pone el usuario en `backend/.env` (nunca en el repo).
- Migración Prisma additiva (columna nullable) sobre la BD hosteada `gestadia_portal_db`; con shadow DB deshabilitada se aplica con `prisma db execute` + `migrate resolve` (el usuario no tiene permiso CREATE DATABASE).

---

### Task 1: `shared/prefijos.js` (lista internacional completa)

**Files:**
- Create: `shared/prefijos.js`
- Test: `shared/prefijos.test.js`

**Interfaces:**
- Produces: `export const PREFIJOS` = `{ codigo: string, pais: string }[]` (ordenado por país; incluye `+34 España`) y `export const PREFIJO_DEFECTO = '+34'`. Consumido por Task 3 (checkout).

- [ ] **Step 1: Escribir el test que falla** — `shared/prefijos.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PREFIJOS, PREFIJO_DEFECTO } from './prefijos.js';

test('lista amplia con España, y varios de canje', () => {
  assert.ok(PREFIJOS.length >= 150, `esperaba lista completa, hay ${PREFIJOS.length}`);
  assert.equal(PREFIJO_DEFECTO, '+34');
  const codigos = PREFIJOS.map((p) => p.codigo);
  for (const c of ['+34', '+54', '+51', '+58', '+212', '+380', '+44', '+81']) {
    assert.ok(codigos.includes(c), `falta prefijo ${c}`);
  }
});

test('cada entrada tiene codigo (+n) y país', () => {
  for (const p of PREFIJOS) {
    assert.match(p.codigo, /^\+\d{1,4}$/);
    assert.ok(p.pais && p.pais.length);
  }
});
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node --test shared/prefijos.test.js`
Expected: FAIL — `Cannot find module './prefijos.js'`.

- [ ] **Step 3: Escribir `shared/prefijos.js`** (lista internacional completa, ordenada por país)

```js
// Prefijos telefónicos internacionales (lista completa). Selector del checkout.
export const PREFIJO_DEFECTO = '+34';

export const PREFIJOS = [
  { codigo: '+93', pais: 'Afganistán' }, { codigo: '+355', pais: 'Albania' }, { codigo: '+49', pais: 'Alemania' },
  { codigo: '+376', pais: 'Andorra' }, { codigo: '+244', pais: 'Angola' }, { codigo: '+1268', pais: 'Antigua y Barbuda' },
  { codigo: '+966', pais: 'Arabia Saudí' }, { codigo: '+213', pais: 'Argelia' }, { codigo: '+54', pais: 'Argentina' },
  { codigo: '+374', pais: 'Armenia' }, { codigo: '+61', pais: 'Australia' }, { codigo: '+43', pais: 'Austria' },
  { codigo: '+994', pais: 'Azerbaiyán' }, { codigo: '+1242', pais: 'Bahamas' }, { codigo: '+973', pais: 'Baréin' },
  { codigo: '+880', pais: 'Bangladés' }, { codigo: '+1246', pais: 'Barbados' }, { codigo: '+32', pais: 'Bélgica' },
  { codigo: '+501', pais: 'Belice' }, { codigo: '+229', pais: 'Benín' }, { codigo: '+975', pais: 'Bután' },
  { codigo: '+375', pais: 'Bielorrusia' }, { codigo: '+591', pais: 'Bolivia' }, { codigo: '+387', pais: 'Bosnia y Herzegovina' },
  { codigo: '+267', pais: 'Botsuana' }, { codigo: '+55', pais: 'Brasil' }, { codigo: '+673', pais: 'Brunéi' },
  { codigo: '+359', pais: 'Bulgaria' }, { codigo: '+226', pais: 'Burkina Faso' }, { codigo: '+257', pais: 'Burundi' },
  { codigo: '+238', pais: 'Cabo Verde' }, { codigo: '+855', pais: 'Camboya' }, { codigo: '+237', pais: 'Camerún' },
  { codigo: '+1', pais: 'Canadá' }, { codigo: '+235', pais: 'Chad' }, { codigo: '+56', pais: 'Chile' },
  { codigo: '+86', pais: 'China' }, { codigo: '+357', pais: 'Chipre' }, { codigo: '+57', pais: 'Colombia' },
  { codigo: '+269', pais: 'Comoras' }, { codigo: '+242', pais: 'Congo' }, { codigo: '+243', pais: 'Congo (RD)' },
  { codigo: '+82', pais: 'Corea del Sur' }, { codigo: '+225', pais: 'Costa de Marfil' }, { codigo: '+506', pais: 'Costa Rica' },
  { codigo: '+385', pais: 'Croacia' }, { codigo: '+53', pais: 'Cuba' }, { codigo: '+45', pais: 'Dinamarca' },
  { codigo: '+1767', pais: 'Dominica' }, { codigo: '+593', pais: 'Ecuador' }, { codigo: '+20', pais: 'Egipto' },
  { codigo: '+503', pais: 'El Salvador' }, { codigo: '+971', pais: 'Emiratos Árabes Unidos' }, { codigo: '+291', pais: 'Eritrea' },
  { codigo: '+421', pais: 'Eslovaquia' }, { codigo: '+386', pais: 'Eslovenia' }, { codigo: '+34', pais: 'España' },
  { codigo: '+1', pais: 'Estados Unidos' }, { codigo: '+372', pais: 'Estonia' }, { codigo: '+251', pais: 'Etiopía' },
  { codigo: '+63', pais: 'Filipinas' }, { codigo: '+358', pais: 'Finlandia' }, { codigo: '+679', pais: 'Fiyi' },
  { codigo: '+33', pais: 'Francia' }, { codigo: '+241', pais: 'Gabón' }, { codigo: '+220', pais: 'Gambia' },
  { codigo: '+995', pais: 'Georgia' }, { codigo: '+233', pais: 'Ghana' }, { codigo: '+1473', pais: 'Granada' },
  { codigo: '+30', pais: 'Grecia' }, { codigo: '+502', pais: 'Guatemala' }, { codigo: '+224', pais: 'Guinea' },
  { codigo: '+245', pais: 'Guinea-Bisáu' }, { codigo: '+240', pais: 'Guinea Ecuatorial' }, { codigo: '+592', pais: 'Guyana' },
  { codigo: '+509', pais: 'Haití' }, { codigo: '+504', pais: 'Honduras' }, { codigo: '+36', pais: 'Hungría' },
  { codigo: '+91', pais: 'India' }, { codigo: '+62', pais: 'Indonesia' }, { codigo: '+964', pais: 'Irak' },
  { codigo: '+98', pais: 'Irán' }, { codigo: '+353', pais: 'Irlanda' }, { codigo: '+354', pais: 'Islandia' },
  { codigo: '+972', pais: 'Israel' }, { codigo: '+39', pais: 'Italia' }, { codigo: '+1876', pais: 'Jamaica' },
  { codigo: '+81', pais: 'Japón' }, { codigo: '+962', pais: 'Jordania' }, { codigo: '+7', pais: 'Kazajistán' },
  { codigo: '+254', pais: 'Kenia' }, { codigo: '+996', pais: 'Kirguistán' }, { codigo: '+686', pais: 'Kiribati' },
  { codigo: '+965', pais: 'Kuwait' }, { codigo: '+856', pais: 'Laos' }, { codigo: '+266', pais: 'Lesoto' },
  { codigo: '+371', pais: 'Letonia' }, { codigo: '+961', pais: 'Líbano' }, { codigo: '+231', pais: 'Liberia' },
  { codigo: '+218', pais: 'Libia' }, { codigo: '+423', pais: 'Liechtenstein' }, { codigo: '+370', pais: 'Lituania' },
  { codigo: '+352', pais: 'Luxemburgo' }, { codigo: '+389', pais: 'Macedonia del Norte' }, { codigo: '+261', pais: 'Madagascar' },
  { codigo: '+60', pais: 'Malasia' }, { codigo: '+265', pais: 'Malaui' }, { codigo: '+960', pais: 'Maldivas' },
  { codigo: '+223', pais: 'Malí' }, { codigo: '+356', pais: 'Malta' }, { codigo: '+212', pais: 'Marruecos' },
  { codigo: '+230', pais: 'Mauricio' }, { codigo: '+222', pais: 'Mauritania' }, { codigo: '+52', pais: 'México' },
  { codigo: '+691', pais: 'Micronesia' }, { codigo: '+373', pais: 'Moldavia' }, { codigo: '+377', pais: 'Mónaco' },
  { codigo: '+976', pais: 'Mongolia' }, { codigo: '+382', pais: 'Montenegro' }, { codigo: '+258', pais: 'Mozambique' },
  { codigo: '+95', pais: 'Myanmar' }, { codigo: '+264', pais: 'Namibia' }, { codigo: '+977', pais: 'Nepal' },
  { codigo: '+505', pais: 'Nicaragua' }, { codigo: '+227', pais: 'Níger' }, { codigo: '+234', pais: 'Nigeria' },
  { codigo: '+47', pais: 'Noruega' }, { codigo: '+64', pais: 'Nueva Zelanda' }, { codigo: '+968', pais: 'Omán' },
  { codigo: '+31', pais: 'Países Bajos' }, { codigo: '+92', pais: 'Pakistán' }, { codigo: '+680', pais: 'Palaos' },
  { codigo: '+507', pais: 'Panamá' }, { codigo: '+675', pais: 'Papúa Nueva Guinea' }, { codigo: '+595', pais: 'Paraguay' },
  { codigo: '+51', pais: 'Perú' }, { codigo: '+48', pais: 'Polonia' }, { codigo: '+351', pais: 'Portugal' },
  { codigo: '+974', pais: 'Catar' }, { codigo: '+44', pais: 'Reino Unido' }, { codigo: '+236', pais: 'Rep. Centroafricana' },
  { codigo: '+420', pais: 'República Checa' }, { codigo: '+1809', pais: 'República Dominicana' }, { codigo: '+250', pais: 'Ruanda' },
  { codigo: '+40', pais: 'Rumanía' }, { codigo: '+7', pais: 'Rusia' }, { codigo: '+685', pais: 'Samoa' },
  { codigo: '+1869', pais: 'San Cristóbal y Nieves' }, { codigo: '+378', pais: 'San Marino' }, { codigo: '+1758', pais: 'Santa Lucía' },
  { codigo: '+239', pais: 'Santo Tomé y Príncipe' }, { codigo: '+1784', pais: 'San Vicente y las Granadinas' }, { codigo: '+221', pais: 'Senegal' },
  { codigo: '+381', pais: 'Serbia' }, { codigo: '+248', pais: 'Seychelles' }, { codigo: '+232', pais: 'Sierra Leona' },
  { codigo: '+65', pais: 'Singapur' }, { codigo: '+963', pais: 'Siria' }, { codigo: '+252', pais: 'Somalia' },
  { codigo: '+94', pais: 'Sri Lanka' }, { codigo: '+27', pais: 'Sudáfrica' }, { codigo: '+249', pais: 'Sudán' },
  { codigo: '+211', pais: 'Sudán del Sur' }, { codigo: '+46', pais: 'Suecia' }, { codigo: '+41', pais: 'Suiza' },
  { codigo: '+597', pais: 'Surinam' }, { codigo: '+66', pais: 'Tailandia' }, { codigo: '+255', pais: 'Tanzania' },
  { codigo: '+992', pais: 'Tayikistán' }, { codigo: '+670', pais: 'Timor Oriental' }, { codigo: '+228', pais: 'Togo' },
  { codigo: '+676', pais: 'Tonga' }, { codigo: '+1868', pais: 'Trinidad y Tobago' }, { codigo: '+216', pais: 'Túnez' },
  { codigo: '+993', pais: 'Turkmenistán' }, { codigo: '+90', pais: 'Turquía' }, { codigo: '+688', pais: 'Tuvalu' },
  { codigo: '+380', pais: 'Ucrania' }, { codigo: '+256', pais: 'Uganda' }, { codigo: '+598', pais: 'Uruguay' },
  { codigo: '+998', pais: 'Uzbekistán' }, { codigo: '+678', pais: 'Vanuatu' }, { codigo: '+58', pais: 'Venezuela' },
  { codigo: '+84', pais: 'Vietnam' }, { codigo: '+967', pais: 'Yemen' }, { codigo: '+253', pais: 'Yibuti' },
  { codigo: '+260', pais: 'Zambia' }, { codigo: '+263', pais: 'Zimbabue' },
];
```

- [ ] **Step 4: Ejecutar el test para verificar que pasa**

Run: `node --test shared/prefijos.test.js`
Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add shared/prefijos.js shared/prefijos.test.js
git commit -m "feat: add shared/prefijos.js (full international dial codes)"
```

---

### Task 2: `stripeLookupKey` por servicio en `shared/servicios.js`

**Files:**
- Modify: `shared/servicios.js`
- Test: `shared/servicios.test.js` (ampliar)

**Interfaces:**
- Produces: cada servicio de `SERVICIOS` gana `stripeLookupKey: string`.

- [ ] **Step 1: Escribir el test que falla** — añadir a `shared/servicios.test.js`

```js
test('cada servicio tiene stripeLookupKey', () => {
  assert.equal(SERVICIOS['canje-carnet'].stripeLookupKey, 'gestadia_canje_1_categoria_2026');
  assert.equal(SERVICIOS['transferencia'].stripeLookupKey, 'gestadia_portal_transferencia');
  for (const s of Object.values(SERVICIOS)) {
    assert.match(s.stripeLookupKey, /^gestadia_/);
  }
});
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node --test shared/servicios.test.js`
Expected: FAIL — `stripeLookupKey` undefined.

- [ ] **Step 3: Añadir `stripeLookupKey` a cada servicio** en `shared/servicios.js` (una línea por servicio, junto a `precio`):

| slug | línea a añadir |
|---|---|
| canje-carnet | `stripeLookupKey: 'gestadia_canje_1_categoria_2026',` |
| duplicado-carnet | `stripeLookupKey: 'gestadia_portal_duplicado_carnet',` |
| duplicado-datos | `stripeLookupKey: 'gestadia_portal_duplicado_datos',` |
| permiso-internacional | `stripeLookupKey: 'gestadia_portal_permiso_internacional',` |
| transferencia | `stripeLookupKey: 'gestadia_portal_transferencia',` |
| baja-vehiculo | `stripeLookupKey: 'gestadia_portal_baja_vehiculo',` |
| cancelacion-dominio | `stripeLookupKey: 'gestadia_portal_cancelacion_dominio',` |
| duplicado-circulacion | `stripeLookupKey: 'gestadia_portal_duplicado_circulacion',` |

- [ ] **Step 4: Ejecutar el test para verificar que pasa**

Run: `node --test shared/servicios.test.js`
Expected: todos PASS.

- [ ] **Step 5: Commit**

```bash
git add shared/servicios.js shared/servicios.test.js
git commit -m "feat: add stripeLookupKey to each service"
```

---

### Task 3: Checkout — teléfono obligatorio con selector de prefijo

**Files:**
- Modify: `frontend/src/pages/Checkout.jsx`
- Modify: `frontend/src/pages/Checkout.test.jsx`
- Modify: `backend/src/routes/checkout.js` (validar teléfono)

**Interfaces:**
- Consumes: `PREFIJOS`, `PREFIJO_DEFECTO` de `@shared/prefijos.js`.
- Produces: `POST /api/checkout` recibe `telefono` en formato internacional (`+<prefijo><numero>`) y es obligatorio.

- [ ] **Step 1: Actualizar/añadir tests** en `frontend/src/pages/Checkout.test.jsx`

En el **primer test existente** (`loads the service…`), añadir el relleno del teléfono antes del submit (si no, el `required` bloquea el envío). Tras la línea que rellena el email:

```jsx
    fireEvent.change(screen.getByLabelText(/^teléfono/i), { target: { value: '600111222' } });
```

Y añadir un test nuevo dentro del `describe('Checkout', …)`:

```jsx
  it('el teléfono es obligatorio y se envía con prefijo', async () => {
    global.fetch = vi.fn(async (url, opts) => {
      if (String(url).includes('/api/servicios')) {
        return { ok: true, json: async () => [{ slug: 'duplicado-carnet', nombre: 'Duplicado de Carnet de Conducir', descripcion: 'x', precio: 70, checklist: [], requierePais: false, requiereDireccion: false }] };
      }
      return { ok: true, json: async () => ({ demo: true, url: '/gracias?pedido=X' }) };
    });
    render(<MemoryRouter initialEntries={['/checkout?servicio=duplicado-carnet']}><Checkout /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Tus datos/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/apellidos/i), { target: { value: 'Ruiz' } });
    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText(/^teléfono/i), { target: { value: '600111222' } });
    fireEvent.click(screen.getByLabelText(/acepto las condiciones/i));
    fireEvent.click(screen.getByRole('button', { name: /pagar/i }));
    await waitFor(() => {
      const call = global.fetch.mock.calls.find((c) => c[0] === '/api/checkout');
      const body = JSON.parse(call[1].body);
      expect(body.telefono).toBe('+34600111222');
    });
  });
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `cd frontend && npx vitest run src/pages/Checkout.test.jsx`
Expected: FAIL (aún no existe el select de prefijo ni se compone el teléfono).

- [ ] **Step 3: Modificar `frontend/src/pages/Checkout.jsx`**

Añadir el import (junto a los otros `@shared`):
```jsx
import { PREFIJOS, PREFIJO_DEFECTO } from '@shared/prefijos.js';
```

En `EMPTY_FORM`, sustituir `telefono: ''` por:
```jsx
  prefijo: PREFIJO_DEFECTO, telefono: '',
```

Sustituir el `formGroup` del teléfono (el `<input ... name="telefono" ...>`) por prefijo + número, ambos con `label` "Teléfono móvil" (obligatorio):
```jsx
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="checkout-telefono">Teléfono móvil</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select className={`${styles.formInput} ${styles.formSelect}`} style={{ maxWidth: '130px' }} aria-label="Prefijo" value={form.prefijo} onChange={(e) => setForm((f) => ({ ...f, prefijo: e.target.value }))}>
                      {PREFIJOS.map((p) => <option key={`${p.codigo}-${p.pais}`} value={p.codigo}>{p.codigo} {p.pais}</option>)}
                    </select>
                    <input className={styles.formInput} type="tel" id="checkout-telefono" name="telefono" autoComplete="tel" value={form.telefono} onChange={handleChange} required />
                  </div>
                </div>
```

En `handleSubmit`, componer el teléfono internacional y excluir `prefijo` del payload. Sustituir el bloque del destructuring/envío por:
```jsx
      const { paisCanje, datosPais, direccion, prefijo, telefono, ...persona } = form;
      const telefonoFull = `${prefijo}${String(telefono).replace(/\D/g, '')}`;
      const extra = {};
      if (servicio.requierePais) { extra.paisCanje = paisCanje; extra.datosPais = datosPais; }
      if (servicio.requiereDireccion) { extra.direccion = direccion; }
      const body = await postCheckout({ servicio: servicio.slug, ...persona, telefono: telefonoFull, ...extra });
      window.location.href = toReactRoute(body.url);
```

- [ ] **Step 4: Validar teléfono en el backend** — en `backend/src/routes/checkout.js`, en la comprobación de campos obligatorios, añadir `telefono`:

```js
    const { servicio: slug, nombre, apellidos, email, telefono, tipoDocumento, numDocumento, aceptaCondiciones } = req.body || {};
    const servicio = getServicio(slug);
    if (!servicio) return res.status(400).json({ error: 'Servicio no válido' });
    if (!nombre || !apellidos || !email) return res.status(400).json({ error: 'Nombre, apellidos y email son obligatorios' });
    if (!telefono) return res.status(400).json({ error: 'El teléfono es obligatorio' });
```

- [ ] **Step 5: Ejecutar los tests del checkout (front)**

Run: `cd frontend && npx vitest run src/pages/Checkout.test.jsx`
Expected: PASS (los 4 casos, incluido el del teléfono con prefijo).

- [ ] **Step 6: Compilar el front**

Run: `cd frontend && npm run build`
Expected: build OK.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/Checkout.jsx frontend/src/pages/Checkout.test.jsx backend/src/routes/checkout.js
git commit -m "feat: checkout requires phone with international prefix selector"
```

---

### Task 4: Prisma `User.stripeCustomerId`

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/20260715090000_user_stripe_customer/migration.sql`

**Interfaces:**
- Produces: columna `stripeCustomerId` en `User` — consumida por Task 6.

- [ ] **Step 1: Añadir el campo** al modelo `User` en `backend/prisma/schema.prisma` (junto a `zohoContactId`):

```prisma
  stripeCustomerId String?
```

- [ ] **Step 2: Crear el fichero de migración** `backend/prisma/migrations/20260715090000_user_stripe_customer/migration.sql`:

```sql
ALTER TABLE `User` ADD COLUMN `stripeCustomerId` VARCHAR(191) NULL;
```

- [ ] **Step 3: Parar el backend, aplicar y marcar aplicada** (la shadow DB está deshabilitada; el proceso `node --watch` bloquea el engine en Windows, así que primero se para)

Run: parar el proceso `npm run dev` del backend (o `Stop-Process` de `node ... src/server.js`), y luego:
```bash
cd backend
npx prisma db execute --file prisma/migrations/20260715090000_user_stripe_customer/migration.sql --schema prisma/schema.prisma
npx prisma migrate resolve --applied 20260715090000_user_stripe_customer
npx prisma generate
```
Expected: `Script executed successfully.`, `marked as applied.`, `Generated Prisma Client`.

- [ ] **Step 4: Verificar estado**

Run: `cd backend && npx prisma migrate status`
Expected: `Database schema is up to date!`.

- [ ] **Step 5: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations
git commit -m "feat: add User.stripeCustomerId (additive migration)"
```

---

### Task 5: Zoho `upsertContact` — dedup por móvil + merge de huecos

**Files:**
- Modify: `backend/src/services/zoho.js`
- Test: `backend/src/services/zoho.test.js` (ampliar)

**Interfaces:**
- Produces: `upsertContact(user)` busca por `Mobile`, y con contacto existente solo escribe campos vacíos; devuelve `contactId`.

- [ ] **Step 1: Escribir los tests que fallan** — añadir a `backend/src/services/zoho.test.js`

```js
test('upsertContact busca por móvil y solo rellena huecos', async () => {
  const calls = [];
  global.fetch = mock.fn(async (url, opts) => {
    calls.push({ url: String(url), opts });
    if (String(url).includes('/oauth/v2/token')) return { ok: true, json: async () => ({ access_token: 'tok', expires_in: 3600 }) };
    if (String(url).includes('/Contacts/search')) {
      // contacto existente con First_Name ya relleno y N_de_documento vacío
      return { ok: true, status: 200, json: async () => ({ data: [{ id: 'c1', First_Name: 'AnaVieja', Last_Name: 'Ruiz', Email: 'x@x.com', N_de_documento: '' }] }) };
    }
    return { ok: true, json: async () => ({ data: [{ details: { id: 'c1' } }] }) }; // PUT/POST
  });
  const { upsertContact } = await import('./zoho.js?t=' + Date.now());
  const id = await upsertContact({ nombre: 'Ana', apellidos: 'Ruiz', email: 'ana@example.com', telefono: '+34600111222', numDocumento: '12345678Z', tipoDocumento: 'DNI' });
  assert.equal(id, 'c1');
  const search = calls.find((c) => c.url.includes('/Contacts/search'));
  assert.match(decodeURIComponent(search.url), /Mobile:equals:\+34600111222/);
  const put = calls.find((c) => c.opts?.method === 'PUT');
  const body = JSON.parse(put.opts.body).data[0];
  assert.equal(body.First_Name, undefined);          // ya estaba relleno → no se pisa
  assert.equal(body.N_de_documento, '12345678Z');    // estaba vacío → se rellena
});
```

*(Nota: el test de `upsertContact creates a contact when none exists` ya existente sigue valiendo; el search por Mobile devuelve `data: []` y se crea.)*

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `cd backend && node --experimental-test-module-mocks --test src/services/zoho.test.js`
Expected: FAIL (hoy busca por Email y hace update completo).

- [ ] **Step 3: Reescribir `upsertContact`** en `backend/src/services/zoho.js` (sustituye la función actual):

```js
export async function upsertContact(user) {
  if (!config.zoho.enabled) {
    console.log('[zoho:demo] upsertContact', user.email);
    return null;
  }
  const movil = user.telefono ? normalizePhone(user.telefono) : '';
  const criteria = movil ? `(Mobile:equals:${movil})` : `(Email:equals:${user.email})`;
  const search = await zohoFetch(
    `/crm/v6/Contacts/search?criteria=${encodeURIComponent(criteria)}`
  ).catch(() => null);
  const existing = search?.data?.[0];

  const deseado = {
    First_Name: user.nombre,
    Last_Name: user.apellidos || user.nombre,
    Email: user.email,
    Mobile: movil || undefined,
    N_de_documento: user.numDocumento || undefined,
    Tipo_de_documento: user.tipoDocumento || undefined,
    Lead_Source: 'Formulario web Gestadia',
  };

  if (existing) {
    // merge de huecos: solo escribimos los campos que estén vacíos en Zoho
    const parche = {};
    for (const [k, v] of Object.entries(deseado)) {
      if (v === undefined) continue;
      const actual = existing[k];
      if (actual === undefined || actual === null || actual === '') parche[k] = v;
    }
    if (Object.keys(parche).length) {
      await zohoFetch('/crm/v6/Contacts', { method: 'PUT', body: JSON.stringify({ data: [{ id: existing.id, ...parche }] }) });
    }
    return existing.id;
  }
  const created = await zohoFetch('/crm/v6/Contacts', { method: 'POST', body: JSON.stringify({ data: [deseado], trigger: ['workflow'] }) });
  return created?.data?.[0]?.details?.id ?? null;
}
```

- [ ] **Step 4: Ejecutar los tests de zoho**

Run: `cd backend && node --experimental-test-module-mocks --test src/services/zoho.test.js`
Expected: PASS (el nuevo + los existentes).

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/zoho.js backend/src/services/zoho.test.js
git commit -m "feat: upsertContact dedups by mobile and fills only empty Zoho fields"
```

---

### Task 6: Helpers de Stripe (`resolvePrice`, `getOrCreateCustomer`, `linkCustomerToZoho`)

**Files:**
- Create: `backend/src/services/stripe.js`
- Test: `backend/src/services/stripe.test.js`

**Interfaces:**
- Produces: `resolvePrice(stripe, lookupKey)` → `priceId`; `getOrCreateCustomer(stripe, user)` → `{ id }`; `linkCustomerToZoho(stripe, customerId, zohoContactId)`. Reciben el cliente `stripe` como parámetro (mockeable). Consumidos por Task 7.

- [ ] **Step 1: Escribir el test que falla** — `backend/src/services/stripe.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePrice, getOrCreateCustomer, linkCustomerToZoho } from './stripe.js';

function fakeStripe() {
  const calls = { search: [], create: [], update: [], pricesList: [] };
  return {
    calls,
    prices: { list: async (args) => { calls.pricesList.push(args); return { data: [{ id: 'price_X' }] }; } },
    customers: {
      search: async (args) => { calls.search.push(args); return { data: [] }; },
      create: async (args) => { calls.create.push(args); return { id: 'cus_NEW' }; },
      update: async (id, args) => { calls.update.push({ id, args }); return { id }; },
    },
  };
}

test('resolvePrice devuelve el price id del lookup_key', async () => {
  const s = fakeStripe();
  const id = await resolvePrice(s, 'gestadia_portal_transferencia');
  assert.equal(id, 'price_X');
  assert.deepEqual(s.calls.pricesList[0].lookup_keys, ['gestadia_portal_transferencia']);
});

test('getOrCreateCustomer crea con metadata de Zoho cuando no existe', async () => {
  const s = fakeStripe();
  const c = await getOrCreateCustomer(s, { id: 'u1', email: 'a@a.com', nombre: 'Ana', apellidos: 'Ruiz', zohoContactId: 'z1' });
  assert.equal(c.id, 'cus_NEW');
  const meta = s.calls.create[0].metadata;
  assert.equal(meta.external_provider, 'zoho');
  assert.equal(meta.external_id, 'z1');
  assert.equal(meta.portal_user_id, 'u1');
});

test('linkCustomerToZoho actualiza external_id', async () => {
  const s = fakeStripe();
  await linkCustomerToZoho(s, 'cus_1', 'z9');
  assert.equal(s.calls.update[0].id, 'cus_1');
  assert.equal(s.calls.update[0].args.metadata.external_id, 'z9');
});
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `cd backend && node --experimental-test-module-mocks --test src/services/stripe.test.js`
Expected: FAIL — `Cannot find module './stripe.js'`.

- [ ] **Step 3: Escribir `backend/src/services/stripe.js`**

```js
// Helpers de Stripe para el checkout. Reciben el cliente `stripe` como
// parámetro para poder testearlos con un doble. Caché de lookup_key→price
// en memoria (los precios del catálogo cambian raras veces).
const priceCache = new Map();

export async function resolvePrice(stripe, lookupKey) {
  if (priceCache.has(lookupKey)) return priceCache.get(lookupKey);
  const res = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  const price = res.data?.[0];
  if (!price) throw new Error(`No existe un precio de Stripe con lookup_key "${lookupKey}"`);
  priceCache.set(lookupKey, price.id);
  return price.id;
}

export async function getOrCreateCustomer(stripe, user) {
  if (user.stripeCustomerId) return { id: user.stripeCustomerId };
  const email = String(user.email).trim().toLowerCase();
  const found = await stripe.customers.search({ query: `email:'${email}'`, limit: 1 }).catch(() => null);
  if (found?.data?.[0]) return found.data[0];
  return stripe.customers.create({
    email,
    name: `${user.nombre} ${user.apellidos || ''}`.trim(),
    phone: user.telefono || undefined,
    metadata: {
      external_provider: 'zoho',
      portal_user_id: user.id,
      ...(user.zohoContactId ? { external_id: user.zohoContactId } : {}),
    },
  });
}

export async function linkCustomerToZoho(stripe, customerId, zohoContactId) {
  if (!customerId || !zohoContactId) return;
  await stripe.customers.update(customerId, { metadata: { external_provider: 'zoho', external_id: zohoContactId } });
}
```

- [ ] **Step 4: Ejecutar el test para verificar que pasa**

Run: `cd backend && node --experimental-test-module-mocks --test src/services/stripe.test.js`
Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/stripe.js backend/src/services/stripe.test.js
git commit -m "feat: add testable Stripe helpers (resolvePrice, getOrCreateCustomer, linkCustomerToZoho)"
```

---

### Task 7: Cablear el checkout a Stripe (precio por lookup_key, customer, canal)

**Files:**
- Modify: `backend/src/routes/checkout.js`

**Interfaces:**
- Consumes: `resolvePrice`, `getOrCreateCustomer`, `linkCustomerToZoho` (Task 6); `servicio.stripeLookupKey` (Task 2); `user.stripeCustomerId` (Task 4).

- [ ] **Step 1: Importar los helpers** en `backend/src/routes/checkout.js` (junto a los imports):

```js
import { resolvePrice, getOrCreateCustomer, linkCustomerToZoho } from '../services/stripe.js';
```

- [ ] **Step 2: Sustituir la rama Stripe** de `POST /api/checkout`. Reemplazar el bloque `const session = await stripe.checkout.sessions.create({ … price_data … })` … `res.json({ url: session.url });` por:

```js
    const priceId = await resolvePrice(stripe, servicio.stripeLookupKey);
    const customer = await getOrCreateCustomer(stripe, user);
    if (!user.stripeCustomerId) {
      await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } });
    }
    const meta = { expedienteId: expediente.id, nPedido: expediente.nPedido, servicio: servicio.slug, canal: 'web' };
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'bizum'],
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: meta,
      payment_intent_data: { metadata: meta },
      success_url: `${config.baseUrl}/gracias?pedido=${expediente.nPedido}`,
      cancel_url: `${config.baseUrl}/checkout?servicio=${servicio.slug}&cancelado=1`,
    });
    res.json({ url: session.url });
```

- [ ] **Step 3: En `fulfillPayment`, ligar el Customer a Zoho** tras el `upsertContact`. Localizar en `fulfillPayment` el bloque donde se obtiene `contactId` y se guarda `zohoContactId`, y añadir justo después:

```js
    if (contactId && updated.user.stripeCustomerId && stripe) {
      await linkCustomerToZoho(stripe, updated.user.stripeCustomerId, contactId);
    }
```

*(Nota: `fulfillPayment` ya tiene un `try/catch` alrededor de la sincronización Zoho; este bloque va dentro de ese mismo `try`, reutilizando `contactId` y el `stripe` de módulo —`null` en demo—.)*

- [ ] **Step 4: Verificar carga del módulo**

Run: `cd backend && node -e "import('./src/routes/checkout.js').then(()=>console.log('checkout OK')).catch(e=>{console.error(e);process.exit(1)})"`
Expected: `checkout OK`.

- [ ] **Step 5: Ejecutar la suite backend (sin BD/red real)**

Run: `cd backend && node --experimental-test-module-mocks --test src/services/stripe.test.js src/services/zoho.test.js src/catalog.test.js src/server.test.js`
Expected: todos PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/src/routes/checkout.js
git commit -m "feat: checkout uses Stripe price by lookup_key + customer linked to Zoho + canal metadata"
```

---

### Task 8: Verificación end-to-end con Stripe test (requiere claves del usuario)

**Files:** — (verificación; sin cambios de código salvo `.env`, que lo pone el usuario)

**Interfaces:**
- Consumes: `backend/.env` con `STRIPE_SECRET_KEY` (test) y `STRIPE_WEBHOOK_SECRET`; Stripe CLI.

- [ ] **Step 1: Claves en `.env`** — el usuario añade a `backend/.env`: `STRIPE_SECRET_KEY=sk_test_…`. Para el webhook local, en otra terminal: `stripe listen --forward-to localhost:3001/webhooks/stripe` → copiar el `whsec_…` a `STRIPE_WEBHOOK_SECRET=` en `.env`.

- [ ] **Step 2: Arrancar backend + verificar modo Stripe**

Run: `cd backend && npm run dev` y en otra terminal `curl -s http://localhost:3001/api/health`
Expected: `"stripe":"activo"` (ya no "MODO DEMO").

- [ ] **Step 3: Checkout real y enlace generado**

Run:
```bash
curl -s -X POST http://localhost:3001/api/checkout -H "Content-Type: application/json" -d '{
  "servicio":"transferencia","nombre":"Test","apellidos":"Web","email":"test-web@example.com","telefono":"+34600111222","aceptaCondiciones":true
}'
```
Expected: `{"url":"https://checkout.stripe.com/..."}` (URL real de Stripe, no `/gracias.html`).

- [ ] **Step 4: Pagar con tarjeta de prueba y comprobar el webhook**

Abrir la `url` del paso 3, pagar con `4242 4242 4242 4242` (fecha futura, cualquier CVC). En el log de `stripe listen` debe verse `checkout.session.completed` reenviado, y en el log del backend `fulfillPayment`.

- [ ] **Step 5: Comprobar metadata/canal + Customer↔Zoho en Stripe**

Verificar (dashboard test o MCP de Stripe): el PaymentIntent lleva `metadata.canal=web`, `nPedido`, `servicio`; y el Customer del pago tiene `metadata.external_provider=zoho` (y `external_id` si Zoho está activo). El expediente del portal quedó en estado `pagado`/`documentacion_pendiente`.

- [ ] **Step 6: Verificar email de bienvenida + acceso al panel (vía webhook)** — Tras pagar, en el log del backend debe aparecer el email con el enlace `/portal/crear-clave/<token>`. Abrirlo (por 5173 en local), crear contraseña → **se entra al panel** y el expediente sale en *Mis servicios*. Esto confirma que el webhook `checkout.session.completed` disparó `fulfillPayment` (marca pagado → **envía email** → **da acceso al panel**). ⚠️ **Sin este webhook, un pago real NO avanza el expediente, NO envía el email y el cliente NO entra al panel.**

- [ ] **Step 7: Limpiar** los expedientes de prueba (`test-web@example.com`) con el patrón de script `backend/.cleanup-tmp.mjs` de planes anteriores.

---

## Definition of Done

- [ ] `node --test shared/prefijos.test.js shared/servicios.test.js` — PASS (prefijos completos; `stripeLookupKey` en los 8).
- [ ] Checkout: teléfono **obligatorio** con selector de prefijo; envía `+<prefijo><numero>`; backend rechaza sin teléfono. `vitest` y `npm run build` OK.
- [ ] Migración additiva `User.stripeCustomerId` aplicada; `migrate status` up to date.
- [ ] `upsertContact` busca por `Mobile` y solo rellena huecos (no pisa lo relleno); tests PASS.
- [ ] `services/stripe.js` (`resolvePrice`/`getOrCreateCustomer`/`linkCustomerToZoho`) con tests PASS.
- [ ] `checkout.js` (rama Stripe) usa `price` por `lookup_key`, `customer`, `metadata` (canal/nPedido/servicio/expedienteId) + `payment_intent_data.metadata`, y `success/cancel` a rutas React. Modo demo intacto.
- [ ] `fulfillPayment` liga el Customer a Zoho (`external_id`).
- [ ] (Con claves test) enlace real generado, pago de prueba, webhook OK, `metadata.canal=web` en el PaymentIntent.
- [ ] El webhook `checkout.session.completed` marca el expediente pagado, **envía el email de bienvenida y da acceso al panel** (sin el webhook dado de alta, un pago real no avanza).
```
