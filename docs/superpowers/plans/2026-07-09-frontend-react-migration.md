# Migración frontend a React + Vite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 16 static `preview-*.html` pages and unir's vanilla `checkout.html`/`portal.html`/`app.js` with a React + Vite single-page app that renders pixel-identical output and talks to the fused backend from `docs/superpowers/plans/2026-07-09-fusion-backend-unir.md`.

**Architecture:** One Vite app in `frontend/`, React Router v6 for client-side routing, CSS Modules co-located per page/component (direct 1:1 extraction of each page's inline `<style>` block — no CSS cleanup). Two shared library files (`lib/api.js`, `lib/auth.js`) wrap all backend calls and JWT storage so every page/component talks to the backend the same way.

**Tech Stack:** React 18, Vite 5, React Router v6, CSS Modules, Playwright (already in the repo) for smoke tests.

## Global Constraints

- Visual output must be pixel-identical to the current `preview-*.html` pages — this is a technology migration, not a redesign (from `docs/superpowers/specs/2026-07-09-frontend-react-migration-design.md`).
- Every page's inline `<style>` block moves verbatim into a `.module.css` file — no selector renaming beyond what CSS Modules requires (class names stay the same; only the import mechanism changes).
- `/api/leads` request contract from each trámite page's form must not change (same fields: `nombre`, `telefono`, `email`, `tramite`).
- New pages (`Checkout`, `Gracias`, `portal/*`) consume the backend's documented contract — see Task 7/8 for the exact request/response shapes, taken from `backend/src/routes/checkout.js`, `auth.js`, `portal.js` in the sibling plan.
- Source of truth for current markup/CSS: the `preview-*.html` files at the repo root (read-only reference during migration — delete only in the final cleanup task, after everything else is verified).

---

### Task 1: Vite scaffold + router shell

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/App.test.jsx` (component smoke test)

**Interfaces:**
- Produces: `<App />` mounted at `#root`, rendering a `<BrowserRouter>` with a placeholder route table — later tasks fill in each `<Route>`'s element.

- [ ] **Step 1: Scaffold with Vite**

Run: `npm create vite@latest frontend -- --template react`
Expected: `frontend/` created with the default Vite+React template.

- [ ] **Step 2: Replace `frontend/package.json` scripts/deps**

```json
{
  "name": "gestadia-frontend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@testing-library/react": "^16.0.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "vite": "^5.4.11",
    "vitest": "^2.1.8"
  }
}
```

Run: `cd frontend && npm install`

- [ ] **Step 3: `frontend/vite.config.js`** — dev proxy to the backend from the sibling plan (`:3001`)

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: './src/setupTests.js' },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/webhooks': 'http://localhost:3001',
    },
  },
});
```

- [ ] **Step 4: `frontend/src/setupTests.js`**

```js
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5: Write the failing test** — `frontend/src/App.test.jsx`

```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from './App.jsx';

describe('App', () => {
  it('renders the home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `cd frontend && npm test`
Expected: FAIL — `Cannot find module './App.jsx'` or similar.

- [ ] **Step 7: Write `frontend/src/App.jsx`** (routes filled in by later tasks — for now, only the shell + Home placeholder so the test passes)

```jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';

export default function App() {
  return (
    <div data-testid="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}
```

- [ ] **Step 8: Write a placeholder `frontend/src/pages/Home.jsx`** (Task 3 replaces this with the real migrated content)

```jsx
export default function Home() {
  return <div>Home placeholder</div>;
}
```

- [ ] **Step 9: Write `frontend/src/main.jsx`**

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

- [ ] **Step 10: Run the test to verify it passes**

Run: `cd frontend && npm test`
Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/vite.config.js frontend/index.html frontend/src/main.jsx frontend/src/App.jsx frontend/src/App.test.jsx frontend/src/setupTests.js frontend/src/pages/Home.jsx
git commit -m "chore: scaffold Vite + React Router frontend shell"
```

---

### Task 2: Shared components — `Header`, `Footer`, `ServiceLayout`

**Files:**
- Create: `frontend/src/components/Header.jsx` (+ `Header.module.css`)
- Create: `frontend/src/components/Footer.jsx` (+ `Footer.module.css`)
- Create: `frontend/src/components/ServiceLayout.jsx` (+ `ServiceLayout.module.css`)
- Create: `frontend/src/components/Header.test.jsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `<Header />`, `<Footer />`, `<ServiceLayout title children>` — every page task (3–6) imports these instead of repeating the nav/footer markup that's currently duplicated at the top/bottom of every `preview-*.html`.

- [ ] **Step 1: Read the nav/footer markup once, from `preview-home.html`**

Run: `sed -n '187,220p;355,380p' "c:/Users/gloria.aleix/.source/repos/Gestadia_Portal/preview-home.html"` (or open the file at those lines) to see the exact `<nav class="nav">...</nav>` and `<footer>...</footer>` markup and their class names — this is what gets extracted.

- [ ] **Step 2: Write the failing test** — `frontend/src/components/Header.test.jsx`

```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Header from './Header.jsx';

describe('Header', () => {
  it('renders the Contacto nav link pointing to /contacto', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /contacto/i })).toHaveAttribute('href', '/contacto');
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `cd frontend && npm test`
Expected: FAIL — `Cannot find module './Header.jsx'`.

- [ ] **Step 4: Write `Header.jsx`** — reproduce the nav markup from Step 1, converting internal `href="preview-X.html"` to React Router `<Link to="/x">`, external/hash links (`#servicios`, `https://wa.me/...`) stay as plain `<a>`

```jsx
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header() {
  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.navLogo}>gestadia</Link>
      <div className={styles.navLinks}>
        <a href="#servicios" className={styles.navLink}>Trámites DGT</a>
        <a href="#como-funciona" className={styles.navLink}>Cómo funciona</a>
        <Link to="/contacto" className={styles.navLink}>Contacto</Link>
        <a href="https://wa.me/34684462670" target="_blank" rel="noopener" className={styles.navCta} style={{ background: '#25D366' }}>WhatsApp →</a>
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: Write `Header.module.css`** — copy the `.nav`, `.nav-logo`, `.nav-links`, `.nav-link`, `.nav-cta` rules verbatim from `preview-home.html`'s `<style>` block (lines 10–182), converting each `.kebab-case` selector to the same `.kebab-case` (CSS Modules doesn't require camelCase selectors — only the JS-side property access is camelCased by Vite's CSS-module transform, e.g. `styles.navLogo` maps to `.nav-logo`)

- [ ] **Step 6: Run the test to verify it passes**

Run: `cd frontend && npm test`
Expected: PASS.

- [ ] **Step 7: Repeat Steps 1–6 for `Footer.jsx`** (source: `preview-home.html` lines ~360–410, the `<footer>` block) and for `ServiceLayout.jsx` (source: any `preview-transferencia.html`-style trámite page, lines ~75–250 — the shared two-column layout wrapping a title, description, checklist and the `CheckoutCard`/lead form). `ServiceLayout` takes `{ title, subtitle, children }` props so Task 5's 8 trámite pages can reuse it with their own body content as `children`.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components
git commit -m "feat: extract Header, Footer, ServiceLayout shared components"
```

---

### Task 3: Migrate `Home.jsx`, `Tramites.jsx`, `Contacto.jsx`

**Files:**
- Modify: `frontend/src/pages/Home.jsx` (+ create `Home.module.css`)
- Create: `frontend/src/pages/Tramites.jsx` (+ `Tramites.module.css`)
- Create: `frontend/src/pages/Contacto.jsx` (+ `Contacto.module.css`)
- Create: `frontend/src/lib/api.js`
- Test: `frontend/src/pages/Contacto.test.jsx`

**Interfaces:**
- Produces: `postLead({ nombre, telefono, email, tramite })` in `lib/api.js` — a `fetch('/api/leads', ...)` wrapper reused by every trámite page's form (Task 5) and by `Contacto.jsx`.

- [ ] **Step 1: Write `frontend/src/lib/api.js`**

```js
const BASE = ''; // same-origin in prod; Vite dev proxy handles /api in dev

export async function postLead({ nombre, telefono, email, tramite }) {
  const res = await fetch(`${BASE}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, telefono, email, tramite }),
  });
  const body = await res.json();
  if (!res.ok || !body.ok) throw new Error(body.error || 'Error al enviar el formulario');
  return body;
}
```

- [ ] **Step 2: Migrate `Home.jsx`** — open `preview-home.html`, copy the `<style>` block (lines 10–182) into `Home.module.css` verbatim, copy the body markup from `<body>` (line 184) to `</body>` into `Home.jsx`'s JSX, replacing:
  - the `<nav>...</nav>` block with `<Header />`
  - the `<footer>...</footer>` block with `<Footer />`
  - `class="x"` → `className={styles.x}` (camelCase property, same CSS Modules mapping as Task 2)
  - `href="preview-contacto.html"` / `href="preview-canje.html"` / `href="preview-tramites.html"` → `<Link to="/contacto">` / `<Link to="/tramites/canje-carnet">` / `<Link to="/tramites">`
  - self-closing void tags (`<img ...>`, `<br>`) get a trailing `/>`
  - inline `style="background:#25D366;"` → `style={{ background: '#25D366' }}`

- [ ] **Step 3: Repeat Step 2 for `Tramites.jsx`** (source `preview-tramites.html`, style lines 7–84, body from line 86) and `Contacto.jsx` (source `preview-contacto.html`, style lines 7–96, body from line 98). `Contacto.jsx`'s form submit handler calls `postLead` from Step 1 and shows a success/error message — reproduce whatever the existing inline `<script>` in `preview-contacto.html` already does for its fetch call (check its `<script>` block near the end of the file) so behavior doesn't change.

- [ ] **Step 4: Write the failing test** — `frontend/src/pages/Contacto.test.jsx`

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Contacto from './Contacto.jsx';

describe('Contacto', () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ ok: true, id: 'lead1' }) }));
  });

  it('submits the form to /api/leads', async () => {
    render(<MemoryRouter><Contacto /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana Ruiz' } });
    fireEvent.change(screen.getByLabelText(/tel[ée]fono/i), { target: { value: '600111222' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ana@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/leads', expect.objectContaining({ method: 'POST' })));
  });
});
```

- [ ] **Step 5: Run it, fix any label/role mismatches against the real migrated markup, until it passes**

Run: `cd frontend && npm test`
Expected: PASS (adjust `getByLabelText`/`getByRole` selectors to match whatever labels/button text the migrated `Contacto.jsx` actually has — they must match the original HTML's form labels).

- [ ] **Step 6: Wire the three routes into `App.jsx`**

```jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Tramites from './pages/Tramites.jsx';
import Contacto from './pages/Contacto.jsx';

export default function App() {
  return (
    <div data-testid="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tramites" element={<Tramites />} />
        <Route path="/contacto" element={<Contacto />} />
      </Routes>
    </div>
  );
}
```

- [ ] **Step 7: Visual check** — Run: `cd frontend && npm run dev`, open `http://localhost:5173/` and `http://localhost:5173/tramites` and `http://localhost:5173/contacto` side by side with the original `preview-home.html`/`preview-tramites.html`/`preview-contacto.html` opened directly in the browser (`file://` or via `npx serve .` at repo root) — confirm identical layout, fonts, colors, spacing.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/Home.jsx frontend/src/pages/Home.module.css frontend/src/pages/Tramites.jsx frontend/src/pages/Tramites.module.css frontend/src/pages/Contacto.jsx frontend/src/pages/Contacto.module.css frontend/src/pages/Contacto.test.jsx frontend/src/lib/api.js frontend/src/App.jsx
git commit -m "feat: migrate Home, Tramites, Contacto pages to React"
```

---

### Task 4: Migrate the 8 trámite pages (`pages/servicios/*`)

**Files:** (all following the exact recipe from Task 3, Step 2 — extract `<style>` verbatim to a sibling `.module.css`, copy body markup into JSX, swap `<nav>`/`<footer>` for `<Header />`/`<Footer />`, `class`→`className`, internal `href`s → `<Link>`, wrap the shared two-column structure in `<ServiceLayout>` from Task 2, and point the "Solicitar información" form submit at `postLead` from Task 3)

| Create (component + module.css) | Source (style lines / body starts) | Route |
|---|---|---|
| `pages/servicios/Transferencia.jsx` | `preview-transferencia.html` (7–73 / 75) | `/tramites/transferencia` |
| `pages/servicios/CanjeCarnet.jsx` | `preview-canje.html` (7–137 / 139) | `/tramites/canje-carnet` |
| `pages/servicios/DuplicadoCarnet.jsx` | `preview-duplicado-carnet.html` (7–75 / 77) | `/tramites/duplicado-carnet` |
| `pages/servicios/DuplicadoDatos.jsx` | `preview-duplicado-datos.html` (7–73 / 75) | `/tramites/duplicado-datos` |
| `pages/servicios/DuplicadoCirculacion.jsx` | `preview-duplicado-circulacion.html` (7–73 / 75) | `/tramites/duplicado-circulacion` |
| `pages/servicios/PermisoInternacional.jsx` | `preview-permiso-internacional.html` (7–73 / 75) | `/tramites/permiso-internacional` |
| `pages/servicios/BajaVehiculo.jsx` | `preview-baja-vehiculo.html` (7–73 / 75) | `/tramites/baja-vehiculo` |
| `pages/servicios/CancelacionDominio.jsx` | `preview-cancelacion-dominio.html` (7–73 / 75) | `/tramites/cancelacion-dominio` |

- [ ] **Step 1: Migrate `Transferencia.jsx`** using the Task 3/Step 2 recipe against `preview-transferencia.html`.

- [ ] **Step 2: Write a test for it** — `frontend/src/pages/servicios/Transferencia.test.jsx`, same shape as `Contacto.test.jsx` from Task 3 (submits the trámite form, asserts `fetch` is called on `/api/leads` with `tramite: 'Transferencia de Vehículo'` — use the exact `tramite` string value the original page's form already sends, found in its `<script>` block).

- [ ] **Step 3: Run it, fix until it passes.**

Run: `cd frontend && npm test -- Transferencia`
Expected: PASS.

- [ ] **Step 4: Repeat Steps 1–3 for the remaining 7 pages in the table**, one at a time, each with its own test file and its own `tramite` value taken from that page's existing `<script>` block (these are the same 8 strings already enumerated in `SERVICIO_MAP` inside `backend/src/services/zoho.js` from the sibling plan — cross-check against that map so the string sent from the frontend matches a key `SERVICIO_MAP` actually recognizes: `'Canje de Carnet Extranjero'`, `'Duplicado de Carnet de Conducir'`, `'Duplicado por Cambio de Datos'`, `'Permiso Internacional de Conducir'`, `'Transferencia de Vehículo'`, `'Baja de Vehículo'`, `'Cancelación de Reserva de Dominio'`, `'Duplicado Permiso de Circulación'`).

- [ ] **Step 5: Wire all 8 routes into `App.jsx`**

```jsx
import Transferencia from './pages/servicios/Transferencia.jsx';
import CanjeCarnet from './pages/servicios/CanjeCarnet.jsx';
import DuplicadoCarnet from './pages/servicios/DuplicadoCarnet.jsx';
import DuplicadoDatos from './pages/servicios/DuplicadoDatos.jsx';
import DuplicadoCirculacion from './pages/servicios/DuplicadoCirculacion.jsx';
import PermisoInternacional from './pages/servicios/PermisoInternacional.jsx';
import BajaVehiculo from './pages/servicios/BajaVehiculo.jsx';
import CancelacionDominio from './pages/servicios/CancelacionDominio.jsx';

// inside <Routes>:
<Route path="/tramites/transferencia" element={<Transferencia />} />
<Route path="/tramites/canje-carnet" element={<CanjeCarnet />} />
<Route path="/tramites/duplicado-carnet" element={<DuplicadoCarnet />} />
<Route path="/tramites/duplicado-datos" element={<DuplicadoDatos />} />
<Route path="/tramites/duplicado-circulacion" element={<DuplicadoCirculacion />} />
<Route path="/tramites/permiso-internacional" element={<PermisoInternacional />} />
<Route path="/tramites/baja-vehiculo" element={<BajaVehiculo />} />
<Route path="/tramites/cancelacion-dominio" element={<CancelacionDominio />} />
```

- [ ] **Step 6: Visual check all 8 against their `preview-*.html` originals** (same side-by-side method as Task 3 Step 7).

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/servicios frontend/src/App.jsx
git commit -m "feat: migrate the 8 trámite pages to React"
```

---

### Task 5: Migrate the 5 legal/info pages

**Files:** (same recipe as Task 4, no form / no `ServiceLayout` needed — these are plain content pages)

| Create | Source (style lines / body starts) | Route |
|---|---|---|
| `pages/legal/AvisoLegal.jsx` | `preview-aviso-legal.html` (7–47 / 49) | `/aviso-legal` |
| `pages/legal/Privacidad.jsx` | `preview-privacidad.html` (7–51 / 53) | `/privacidad` |
| `pages/legal/Cookies.jsx` | `preview-cookies.html` (7–47 / 49) | `/cookies` |
| `pages/legal/PagosDevoluciones.jsx` | `preview-pagos-devoluciones.html` (7–44 / 46) | `/pagos-devoluciones` |
| `pages/legal/ProteccionDatos.jsx` | `preview-proteccion-datos.html` (7–42 / 44) | `/proteccion-datos` |

- [ ] **Step 1: Migrate all 5 pages** using the Task 3/Step 2 recipe (no form to wire — these are static content).

- [ ] **Step 2: Write one shared smoke test** — `frontend/src/pages/legal/legal.test.jsx`

```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import AvisoLegal from './AvisoLegal.jsx';
import Privacidad from './Privacidad.jsx';
import Cookies from './Cookies.jsx';
import PagosDevoluciones from './PagosDevoluciones.jsx';
import ProteccionDatos from './ProteccionDatos.jsx';

describe('legal pages render their heading', () => {
  it.each([
    [AvisoLegal, 'Aviso Legal'],
    [Privacidad, 'Política de Privacidad'],
    [Cookies, 'Política de Cookies'],
    [PagosDevoluciones, 'Pagos, Cancelaciones y Devoluciones'],
    [ProteccionDatos, 'Política de Protección de Datos'],
  ])('%s', (Component, heading) => {
    render(<MemoryRouter><Component /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run it to verify it passes**

Run: `cd frontend && npm test -- legal`
Expected: PASS (5/5).

- [ ] **Step 4: Wire the 5 routes into `App.jsx`.**

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/legal frontend/src/App.jsx
git commit -m "feat: migrate the 5 legal/info pages to React"
```

---

### Task 6: `lib/auth.js` + `ProtectedRoute`

**Files:**
- Create: `frontend/src/lib/auth.js`
- Create: `frontend/src/components/portal/ProtectedRoute.jsx`
- Test: `frontend/src/lib/auth.test.js`

**Interfaces:**
- Produces: `saveToken(token)`, `getToken()`, `clearToken()`, `isAuthenticated()` in `lib/auth.js`; `<ProtectedRoute>{children}</ProtectedRoute>` that redirects to `/portal/login` when `isAuthenticated()` is false — consumed by Task 8's portal pages.

- [ ] **Step 1: Write the failing test** — `frontend/src/lib/auth.test.js`

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { saveToken, getToken, clearToken, isAuthenticated } from './auth.js';

describe('auth token storage', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips a token through localStorage', () => {
    expect(isAuthenticated()).toBe(false);
    saveToken('abc.def.ghi');
    expect(getToken()).toBe('abc.def.ghi');
    expect(isAuthenticated()).toBe(true);
    clearToken();
    expect(isAuthenticated()).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npm test -- auth`
Expected: FAIL — `Cannot find module './auth.js'`.

- [ ] **Step 3: Write `frontend/src/lib/auth.js`**

```js
const KEY = 'gestadia_token';

export function saveToken(token) {
  localStorage.setItem(KEY, token);
}

export function getToken() {
  return localStorage.getItem(KEY);
}

export function clearToken() {
  localStorage.removeItem(KEY);
}

export function isAuthenticated() {
  return !!getToken();
}
```

- [ ] **Step 4: Run the test to verify it passes.**

- [ ] **Step 5: Write `frontend/src/components/portal/ProtectedRoute.jsx`**

```jsx
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../lib/auth.js';

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/portal/login" replace />;
  return children;
}
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/auth.js frontend/src/lib/auth.test.js frontend/src/components/portal/ProtectedRoute.jsx
git commit -m "feat: add JWT storage helpers and ProtectedRoute"
```

---

### Task 7: `Checkout.jsx` + `Gracias.jsx`

**Files:**
- Create: `frontend/src/pages/Checkout.jsx` (+ `Checkout.module.css`)
- Create: `frontend/src/pages/Gracias.jsx` (+ `Gracias.module.css`)
- Create: `frontend/src/components/CheckoutCard.jsx` (+ `CheckoutCard.module.css`)
- Modify: `frontend/src/lib/api.js` — add `getServicios`, `postCheckout`
- Test: `frontend/src/pages/Checkout.test.jsx`

**Interfaces:**
- Consumes: `GET /api/servicios` → `[{slug, nombre, descripcion, precio, checklist}]`; `POST /api/checkout` body `{servicio, nombre, apellidos, email, telefono, tipoDocumento, numDocumento, aceptaCondiciones}` → `{url}` or `{demo:true, url}` (from `backend/src/routes/checkout.js` in the sibling plan — read that file's exact request/response shape before writing this task if the backend has changed since the plan was written).
- Produces: `getServicios()`, `postCheckout(payload)` in `lib/api.js`.

- [ ] **Step 1: Add to `frontend/src/lib/api.js`**

```js
export async function getServicios() {
  const res = await fetch('/api/servicios');
  if (!res.ok) throw new Error('No se pudo cargar el catálogo de servicios');
  return res.json();
}

export async function postCheckout(payload) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'No se pudo iniciar el pago');
  return body;
}
```

- [ ] **Step 2: Write the failing test** — `frontend/src/pages/Checkout.test.jsx`

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Checkout from './Checkout.jsx';

describe('Checkout', () => {
  it('loads the service from ?servicio= and submits to /api/checkout', async () => {
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes('/api/servicios')) {
        return { ok: true, json: async () => [{ slug: 'canje', nombre: 'Canje de permiso de conducir', descripcion: 'x', precio: 149, checklist: [] }] };
      }
      return { ok: true, json: async () => ({ demo: true, url: '/gracias?pedido=GST-1' }) };
    });

    render(
      <MemoryRouter initialEntries={['/checkout?servicio=canje']}>
        <Checkout />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/canje de permiso de conducir/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/apellidos/i), { target: { value: 'Ruiz' } });
    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'ana@example.com' } });
    fireEvent.click(screen.getByLabelText(/acepto las condiciones/i));
    fireEvent.click(screen.getByRole('button', { name: /pagar/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/checkout', expect.objectContaining({ method: 'POST' })));
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `cd frontend && npm test -- Checkout`
Expected: FAIL — `Cannot find module './Checkout.jsx'`.

- [ ] **Step 4: Write `CheckoutCard.jsx`** — a reusable panel showing `{nombre, descripcion, precio}` (same visual component referenced by `HANDOFF.md`'s original component list; style it to match the price/CTA panel already present in each `preview-*.html` trámite page's "Solicitar información" sidebar, since this reuses that visual pattern for the real payment CTA).

- [ ] **Step 5: Write `Checkout.jsx`** — reads `?servicio=` from `useSearchParams()`, calls `getServicios()` on mount, filters to the matching slug, renders `<CheckoutCard>` plus a form (nombre, apellidos, email, telefono, tipoDocumento, numDocumento, checkbox "Acepto las condiciones de contratación"). On submit, calls `postCheckout({ servicio: slug, ...formValues })` and on success does `window.location.href = body.url` (full navigation, since in demo mode it's `/gracias?...` and in real mode it's Stripe's hosted checkout URL — both are external-navigation cases, not React Router links).

- [ ] **Step 6: Run the test to verify it passes.**

- [ ] **Step 7: Write `Gracias.jsx`** — reads `?pedido=` from `useSearchParams()`, shows a confirmation message with the order number and a link to `/portal/login` to set a password (mirrors `unir/public/gracias.html` — check that file's copy/structure and reproduce it in JSX+CSS Modules the same way Task 3's recipe does for the informational pages).

- [ ] **Step 8: Wire `/checkout` and `/gracias` routes into `App.jsx`.**

- [ ] **Step 9: Commit**

```bash
git add frontend/src/pages/Checkout.jsx frontend/src/pages/Checkout.module.css frontend/src/pages/Checkout.test.jsx frontend/src/pages/Gracias.jsx frontend/src/pages/Gracias.module.css frontend/src/components/CheckoutCard.jsx frontend/src/components/CheckoutCard.module.css frontend/src/lib/api.js frontend/src/App.jsx
git commit -m "feat: add Checkout and Gracias pages consuming the backend API"
```

---

### Task 8: Portal de cliente (`pages/portal/*`)

**Files:**
- Create: `frontend/src/pages/portal/Login.jsx`
- Create: `frontend/src/pages/portal/CrearClave.jsx`
- Create: `frontend/src/pages/portal/RecuperarClave.jsx`
- Create: `frontend/src/pages/portal/MisServicios.jsx`
- Create: `frontend/src/pages/portal/ExpedienteDetalle.jsx`
- Create: `frontend/src/pages/portal/MisDatos.jsx`
- Create: `frontend/src/pages/portal/Notificaciones.jsx`
- Create: `frontend/src/components/portal/PortalLayout.jsx` (shared nav: Mis servicios · Mis datos · Notificaciones · Cerrar sesión)
- Modify: `frontend/src/lib/api.js` — add `login`, `setPassword`, `forgotPassword`, `authedFetch`, `getMe`, `patchMe`, `getExpedientes`, `getExpediente`, `uploadDocumento`, `getNotificaciones`, `markNotificacionLeida`
- Test: `frontend/src/pages/portal/Login.test.jsx`

**Interfaces:**
- Consumes: `/api/auth/login`, `/api/auth/set-password`, `/api/auth/forgot`, `/api/me` (GET/PATCH), `/api/expedientes[/:id][/documentos]`, `/api/notificaciones[/:id/leer]` — exact shapes documented in `backend/src/routes/auth.js` and `portal.js` in the sibling plan (re-read those two files before writing this task if the backend contract changed).
- Produces: `authedFetch(path, options)` — attaches `Authorization: Bearer <token>` from `lib/auth.js`'s `getToken()`, used by every function below it.

- [ ] **Step 1: Add auth-aware fetch + all portal API calls to `frontend/src/lib/api.js`**

```js
import { getToken } from './auth.js';

async function authedFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${getToken()}` },
  });
  if (res.status === 401) throw new Error('Sesión caducada, vuelve a entrar');
  return res;
}

export async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'No se pudo iniciar sesión');
  return body; // { token, nombre }
}

export async function setPassword(token, password) {
  const res = await fetch('/api/auth/set-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'No se pudo crear la contraseña');
  return body;
}

export async function forgotPassword(email) {
  const res = await fetch('/api/auth/forgot', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function getMe() {
  const res = await authedFetch('/api/me');
  return res.json();
}

export async function patchMe(data) {
  const res = await authedFetch('/api/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.json();
}

export async function getExpedientes() {
  const res = await authedFetch('/api/expedientes');
  return res.json();
}

export async function getExpediente(id) {
  const res = await authedFetch(`/api/expedientes/${id}`);
  if (res.status === 404) throw new Error('Expediente no encontrado');
  return res.json();
}

export async function uploadDocumento(expedienteId, clave, file) {
  const formData = new FormData();
  formData.append('clave', clave);
  formData.append('fichero', file);
  const res = await authedFetch(`/api/expedientes/${expedienteId}/documentos`, { method: 'POST', body: formData });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'No se pudo subir el documento');
  return body;
}

export async function getNotificaciones() {
  const res = await authedFetch('/api/notificaciones');
  return res.json();
}

export async function markNotificacionLeida(id) {
  const res = await authedFetch(`/api/notificaciones/${id}/leer`, { method: 'POST' });
  return res.json();
}
```

- [ ] **Step 2: Write the failing test** — `frontend/src/pages/portal/Login.test.jsx`

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login.jsx';

describe('Login', () => {
  it('logs in and stores the token', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ token: 'abc.def.ghi', nombre: 'Ana' }) }));
    render(<MemoryRouter><Login /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText(/contrase.a/i), { target: { value: 'supersecreta1' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => expect(localStorage.getItem('gestadia_token')).toBe('abc.def.ghi'));
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `cd frontend && npm test -- portal/Login`
Expected: FAIL — `Cannot find module './Login.jsx'`.

- [ ] **Step 4: Write `Login.jsx`** — email/password form, calls `login()` from Step 1, on success calls `saveToken(body.token)` (from `lib/auth.js`, Task 6) and navigates to `/portal/mis-servicios`.

- [ ] **Step 5: Run the test to verify it passes.**

- [ ] **Step 6: Write `CrearClave.jsx`** (reads `:token` from the URL — mirrors `unir/src/routes/auth.js`'s `set-password` endpoint, used both for post-checkout invite links and password-reset links, same token param for both per that route's logic) and `RecuperarClave.jsx` (email-only form calling `forgotPassword`, always shows the same "revisa tu email" message regardless of whether the account exists — matching the backend's intentionally uniform response).

- [ ] **Step 7: Write `PortalLayout.jsx`** — nav with links to `/portal/mis-servicios`, `/portal/mis-datos`, `/portal/notificaciones`, and a "Cerrar sesión" button calling `clearToken()` + `navigate('/portal/login')`.

- [ ] **Step 8: Write `MisServicios.jsx`** — calls `getExpedientes()` on mount, renders a card per expediente (título, estado label, progreso %) linking to `/portal/mis-servicios/:id`.

- [ ] **Step 9: Write `ExpedienteDetalle.jsx`** — calls `getExpediente(id)`, renders the timeline of `eventos`, the `checklist` with per-item upload buttons calling `uploadDocumento(id, clave, file)`.

- [ ] **Step 10: Write `MisDatos.jsx`** — calls `getMe()` on mount, form pre-filled, submit calls `patchMe(data)`.

- [ ] **Step 11: Write `Notificaciones.jsx`** — calls `getNotificaciones()`, list with a "marcar como leída" action calling `markNotificacionLeida(id)`.

- [ ] **Step 12: Wire all portal routes into `App.jsx`, each `ExpedienteDetalle`/`MisServicios`/`MisDatos`/`Notificaciones` wrapped in `<ProtectedRoute>` from Task 6**

```jsx
<Route path="/portal/login" element={<Login />} />
<Route path="/portal/crear-clave/:token" element={<CrearClave />} />
<Route path="/portal/recuperar" element={<RecuperarClave />} />
<Route path="/portal/mis-servicios" element={<ProtectedRoute><MisServicios /></ProtectedRoute>} />
<Route path="/portal/mis-servicios/:id" element={<ProtectedRoute><ExpedienteDetalle /></ProtectedRoute>} />
<Route path="/portal/mis-datos" element={<ProtectedRoute><MisDatos /></ProtectedRoute>} />
<Route path="/portal/notificaciones" element={<ProtectedRoute><Notificaciones /></ProtectedRoute>} />
```

- [ ] **Step 13: Commit**

```bash
git add frontend/src/pages/portal frontend/src/components/portal frontend/src/lib/api.js frontend/src/App.jsx
git commit -m "feat: add client portal pages (login, expedientes, mis datos, notificaciones)"
```

---

### Task 9: Dev/build wiring + cleanup

**Files:**
- Create: `package.json` (repo root — orchestration scripts)
- Modify: `backend/src/server.js` reference check (no code change — just verify the `FRONTEND_DIST` path from the sibling plan's Task 7 matches `frontend/dist`)
- Delete: all root `preview-*.html` files, `preview-home-v2.html`
- Delete: `c:\Users\gloria.aleix\.source\repos\unir\public\*` references are N/A (that repo is untouched, per Global Constraints)

**Interfaces:**
- Consumes: `backend` dev server on `:3001` (sibling plan), `frontend` dev server on `:5173` (Task 1).

- [ ] **Step 1: Add `concurrently` and root orchestration scripts**

Run: `npm install --save-dev concurrently`

Update repo-root `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently -n backend,frontend -c blue,green \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\"",
    "build": "npm run build --prefix frontend",
    "deploy": "node ftp-deploy.cjs"
  }
}
```

- [ ] **Step 2: Run the full dev stack**

Run: `npm run dev`
Expected: both `backend` and `frontend` logs interleaved, no errors; `http://localhost:5173/` loads the React Home page.

- [ ] **Step 3: Manually click through every route** (`/`, `/tramites`, all 8 `/tramites/*`, `/contacto`, `/pagos-devoluciones`, `/aviso-legal`, `/privacidad`, `/cookies`, `/proteccion-datos`, `/checkout?servicio=canje`, `/portal/login`) in the running dev app — confirm no console errors and visual parity with the corresponding `preview-*.html`.

- [ ] **Step 4: Build and verify the production path**

Run: `npm run build && cd backend && DATABASE_URL="mysql://gestadia:gestadia@localhost:3307/gestadia_test" PORT=3001 npm start`, then open `http://localhost:3001/` and `http://localhost:3001/tramites/canje-carnet` directly (fresh navigation, not client-side routed) to confirm the Express SPA fallback serves `index.html` correctly for a direct URL hit.

- [ ] **Step 5: Only after Steps 3–4 both pass, delete the now-superseded static pages**

```bash
git rm preview-home.html preview-home-v2.html preview-tramites.html preview-contacto.html preview-transferencia.html preview-canje.html preview-duplicado-carnet.html preview-duplicado-datos.html preview-duplicado-circulacion.html preview-permiso-internacional.html preview-baja-vehiculo.html preview-cancelacion-dominio.html preview-pagos-devoluciones.html preview-aviso-legal.html preview-privacidad.html preview-cookies.html preview-proteccion-datos.html
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: wire root dev/build scripts, remove superseded static preview pages"
```

---

### Task 10: Playwright end-to-end test

**Files:**
- Create: `tests/frontend-e2e.spec.js`

**Interfaces:**
- Consumes: the full stack running (`npm run dev` at repo root, or the built+served production path from Task 9 Step 4).

- [ ] **Step 1: Write the failing test** — `tests/frontend-e2e.spec.js`

```js
import { test, expect } from '@playwright/test';

const BASE = process.env.FRONTEND_URL || 'http://localhost:5173';

test('home page renders the hero heading', async ({ page }) => {
  await page.goto(BASE);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('checkout flow in demo mode reaches the gracias page', async ({ page }) => {
  await page.goto(`${BASE}/checkout?servicio=canje`);
  await page.getByLabel(/nombre/i).fill('Ana');
  await page.getByLabel(/apellidos/i).fill('Ruiz');
  await page.getByLabel(/^email/i).fill(`ana-${Date.now()}@example.com`);
  await page.getByLabel(/acepto las condiciones/i).check();
  await page.getByRole('button', { name: /pagar/i }).click();
  await page.waitForURL(/\/gracias/);
  await expect(page.getByText(/GST-/)).toBeVisible();
});
```

- [ ] **Step 2: Run the full stack in one terminal**

Run: `npm run dev` (repo root, needs backend pointed at the test DB: `DATABASE_URL="mysql://gestadia:gestadia@localhost:3307/gestadia_test"` in `backend/.env` for this run, or export it before `npm run dev`)

- [ ] **Step 3: Run the test**

Run: `npx playwright test tests/frontend-e2e.spec.js`
Expected: 2 passed.

- [ ] **Step 4: Commit**

```bash
git add tests/frontend-e2e.spec.js
git commit -m "test: add Playwright e2e test for home + demo checkout flow"
```

---

## Definition of Done

- [ ] `npm run dev` at the repo root starts both backend (`:3001`) and frontend (`:5173`) with no errors.
- [ ] Every one of the 16 original `preview-*.html` pages has a React route rendering visually identical content.
- [ ] `/checkout?servicio=canje` → fill form → demo payment → lands on `/gracias?pedido=...`.
- [ ] `/portal/login` → after a demo checkout, the invite email (printed to console in demo SMTP mode) contains a `/portal/crear-clave/:token` link that successfully sets a password and logs in.
- [ ] `cd frontend && npm test` — all pass.
- [ ] `npx playwright test tests/frontend-e2e.spec.js` — all pass.
- [ ] `npm run build` produces `frontend/dist`, and the backend serves it correctly for both `/` and a deep-linked route.
- [ ] No `preview-*.html` files remain at the repo root.
