# Checkout en la ficha — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Embeber el formulario de pago dentro de la tarjeta del lateral de la ficha de servicio, para que el cliente pague en la propia ficha sin saltar a `/checkout`.

**Architecture:** Se extrae el formulario que hoy vive en `Checkout.jsx` a un componente reutilizable `CheckoutForm`. Lo consumen dos sitios: la tarjeta de la ficha (`ContratarCard`) y la página `/checkout` (que queda de reserva). La lógica de pago se **reutiliza** (mover, no reescribir); el backend solo cambia el `cancel_url`.

**Tech Stack:** React 18 (Vite), React Router 6, Vitest + Testing Library, Express (backend).

## Global Constraints

- Tests frontend: `npm test --prefix frontend` (Vitest). Deben quedar en verde.
- Build: `npm run build` (raíz) debe compilar.
- No tocar la lógica de `/api/checkout` salvo el `cancel_url`.
- El componente `CheckoutForm` recibe `servicio` por prop; NO llama a la API para saber los campos.
- Reutilizar clases de `frontend/src/pages/Checkout.module.css` (import relativo `../Checkout.module.css` desde `pages/servicios/`).
- `servicio.href` (de `shared/servicios.js`) es la ruta de la ficha, p.ej. `/tramites/duplicado-carnet`.

---

### Task 1: Componente reutilizable `CheckoutForm`

**Files:**
- Create: `frontend/src/pages/servicios/CheckoutForm.jsx`
- Test: `frontend/src/pages/servicios/CheckoutForm.test.jsx`

**Interfaces:**
- Produces: `export default function CheckoutForm({ servicio })` — `servicio` es un objeto con `{ slug: string, requierePais?: boolean, requiereDireccion?: boolean }`. Renderiza el `<form>` de pago (sin el bloque de precio) y al enviar hace POST a `/api/checkout` y redirige a `body.url`.

- [ ] **Step 1: Write the failing test** — `frontend/src/pages/servicios/CheckoutForm.test.jsx`

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import CheckoutForm from './CheckoutForm.jsx';

const base = { slug: 'duplicado-carnet', requierePais: false, requiereDireccion: false };

describe('CheckoutForm', () => {
  it('envía a /api/checkout con el teléfono con prefijo', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ demo: true, url: '/gracias?pedido=X' }) }));
    render(<MemoryRouter><CheckoutForm servicio={base} /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/apellidos/i), { target: { value: 'Ruiz' } });
    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText(/^teléfono/i), { target: { value: '600111222' } });
    fireEvent.click(screen.getByLabelText(/acepto las condiciones/i));
    fireEvent.click(screen.getByRole('button', { name: /pagar/i }));
    await waitFor(() => {
      const call = global.fetch.mock.calls.find((c) => c[0] === '/api/checkout');
      const body = JSON.parse(call[1].body);
      expect(body.servicio).toBe('duplicado-carnet');
      expect(body.telefono).toBe('+34600111222');
    });
  });

  it('muestra país y dirección cuando el servicio lo requiere', () => {
    render(<MemoryRouter><CheckoutForm servicio={{ slug: 'canje-carnet', requierePais: true, requiereDireccion: true }} /></MemoryRouter>);
    expect(screen.getByLabelText(/país del permiso/i)).toBeInTheDocument();
    expect(screen.getByText(/Dirección de envío del permiso/i)).toBeInTheDocument();
  });

  it('no muestra país/dirección cuando no se requiere', () => {
    render(<MemoryRouter><CheckoutForm servicio={base} /></MemoryRouter>);
    expect(screen.queryByLabelText(/país del permiso/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- CheckoutForm`
Expected: FAIL — `Failed to resolve import "./CheckoutForm.jsx"` (el componente aún no existe).

- [ ] **Step 3: Create `CheckoutForm.jsx`**

Contenido completo (extraído de `Checkout.jsx`; los bloques de país y dirección se copian **verbatim** de `Checkout.jsx` como se indica):

```jsx
import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { postCheckout } from '../../lib/api.js';
import { PAISES, paisesOrdenados } from '@shared/paises-canje.js';
import { TIPOS_VIA, PROVINCIAS } from '@shared/direccion.js';
import { PREFIJOS, PREFIJO_DEFECTO } from '@shared/prefijos.js';
import styles from '../Checkout.module.css';

const EMPTY_FORM = {
  nombre: '', apellidos: '', email: '', prefijo: PREFIJO_DEFECTO, telefono: '',
  tipoDocumento: 'DNI', numDocumento: '', aceptaCondiciones: false,
  paisCanje: '', datosPais: {},
  direccion: { tipoVia: 'Calle', nombreVia: '', numero: '', bloque: '', portal: '', escalera: '', planta: '', puerta: '', km: '', codigoPostal: '', municipio: '', localidad: '', provincia: '' },
};

// El backend aún puede devolver URLs legacy con `.html`; se limpian antes de navegar.
function toReactRoute(url) {
  return url.replace('/gracias.html', '/gracias').replace('/checkout.html', '/checkout');
}

// Formulario de pago reutilizable. Se usa embebido en la ficha (ContratarCard)
// y en la página /checkout. Recibe `servicio` (slug + flags) y NO llama a la API.
export default function CheckoutForm({ servicio }) {
  const [searchParams] = useSearchParams();
  const cancelado = searchParams.get('cancelado');
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle'); // idle | sending | error
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  const grupos = paisesOrdenados();
  const camposPais = form.paisCanje ? (PAISES[form.paisCanje]?.camposExtra ?? []) : [];

  function handlePais(e) { setForm((f) => ({ ...f, paisCanje: e.target.value, datosPais: {} })); }
  function handleDatoPais(clave, value) { setForm((f) => ({ ...f, datosPais: { ...f.datosPais, [clave]: value } })); }
  function handleDireccion(campo, value) { setForm((f) => ({ ...f, direccion: { ...f.direccion, [campo]: value } })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!servicio) return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const { paisCanje, datosPais, direccion, prefijo, telefono, ...persona } = form;
      const telefonoFull = `${prefijo}${String(telefono).replace(/\D/g, '')}`;
      const extra = {};
      if (servicio.requierePais) { extra.paisCanje = paisCanje; extra.datosPais = datosPais; }
      if (servicio.requiereDireccion) { extra.direccion = direccion; }
      const body = await postCheckout({ servicio: servicio.slug, ...persona, telefono: telefonoFull, ...extra });
      window.location.href = toReactRoute(body.url);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'No se pudo iniciar el pago');
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formTitle}>Tus datos</div>

      {cancelado && (
        <p className={`${styles.formStatus} ${styles.error}`} role="alert">
          El pago se canceló. Puedes intentarlo de nuevo cuando quieras.
        </p>
      )}

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="checkout-nombre">Nombre</label>
          <input className={styles.formInput} type="text" id="checkout-nombre" name="nombre" autoComplete="given-name" value={form.nombre} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="checkout-apellidos">Apellidos</label>
          <input className={styles.formInput} type="text" id="checkout-apellidos" name="apellidos" autoComplete="family-name" value={form.apellidos} onChange={handleChange} required />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="checkout-email">Email</label>
        <input className={styles.formInput} type="email" id="checkout-email" name="email" autoComplete="email" value={form.email} onChange={handleChange} required />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="checkout-telefono">Teléfono móvil</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select className={`${styles.formInput} ${styles.formSelect}`} style={{ width: 'auto', flex: '0 0 auto' }} aria-label="Prefijo" title={PREFIJOS.find((p) => p.codigo === form.prefijo)?.pais} value={form.prefijo} onChange={(e) => setForm((f) => ({ ...f, prefijo: e.target.value }))}>
            {PREFIJOS.map((p) => <option key={`${p.codigo}-${p.pais}`} value={p.codigo}>{p.bandera} {p.codigo}</option>)}
          </select>
          <input className={styles.formInput} type="tel" id="checkout-telefono" name="telefono" autoComplete="tel" placeholder="Número de WhatsApp" value={form.telefono} onChange={handleChange} required style={{ flex: 1 }} />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="checkout-tipoDocumento">Tipo de documento</label>
          <select className={`${styles.formInput} ${styles.formSelect}`} id="checkout-tipoDocumento" name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange}>
            <option value="DNI">DNI</option>
            <option value="NIE">NIE</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="checkout-numDocumento">Nº de documento</label>
          <input className={styles.formInput} type="text" id="checkout-numDocumento" name="numDocumento" autoComplete="off" value={form.numDocumento} onChange={handleChange} />
        </div>
      </div>

      {/* VERBATIM: pega aquí, sin cambios, el bloque `{servicio.requierePais && ( … )}`
          de Checkout.jsx (actualmente líneas 168-190). */}

      {/* VERBATIM: pega aquí, sin cambios, el bloque `{servicio.requiereDireccion && ( … )}`
          de Checkout.jsx (actualmente líneas 192-237). */}

      <div className={styles.formCheck}>
        <input type="checkbox" id="checkout-acepta" name="aceptaCondiciones" checked={form.aceptaCondiciones} onChange={handleChange} required />
        <label htmlFor="checkout-acepta">
          He leído y acepto las <Link to="/pagos-devoluciones" target="_blank" rel="noopener">condiciones de contratación</Link> y la <a href="/privacidad" target="_blank" rel="noopener">política de privacidad</a>. Solicito el inicio inmediato del servicio y entiendo que, una vez ejecutado por completo, perderé el derecho de desistimiento.
        </label>
      </div>

      {status === 'error' && (
        <p className={`${styles.formStatus} ${styles.error}`} role="alert">{errorMsg}</p>
      )}

      <button type="submit" className={styles.formSubmit} disabled={status === 'sending'}>
        {status === 'sending' ? 'Procesando…' : 'Pagar con tarjeta o Bizum'}
      </button>
      <p className={styles.formNote}>Al pagar crearemos tu cuenta automáticamente y te enviaremos un email para establecer tu contraseña.</p>
    </form>
  );
}
```

Los dos bloques marcados `VERBATIM` se copian **tal cual** de `Checkout.jsx` (usan `servicio.requierePais`/`servicio.requiereDireccion`, `grupos`, `camposPais`, `handlePais`, `handleDatoPais`, `handleDireccion`, `TIPOS_VIA`, `PROVINCIAS`, `styles.*` — todo ya disponible en este componente).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- CheckoutForm`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/servicios/CheckoutForm.jsx frontend/src/pages/servicios/CheckoutForm.test.jsx
git commit -m "feat: reusable CheckoutForm component (extracted from Checkout page)"
```

---

### Task 2: `Checkout.jsx` usa `CheckoutForm`

**Files:**
- Modify: `frontend/src/pages/Checkout.jsx`

**Interfaces:**
- Consumes: `CheckoutForm` de Task 1.

- [ ] **Step 1: Reescribe `Checkout.jsx`** para delegar el formulario en `CheckoutForm`

Nuevo contenido de `frontend/src/pages/Checkout.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CheckoutCard from '../components/CheckoutCard.jsx';
import CheckoutForm from './servicios/CheckoutForm.jsx';
import { getServicios } from '../lib/api.js';
import styles from './Checkout.module.css';

// Página /checkout (reserva / enlaces directos). El formulario vive en
// CheckoutForm, compartido con la tarjeta de la ficha.
export default function Checkout() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get('servicio') || '';

  const [servicios, setServicios] = useState(null); // null = loading
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getServicios()
      .then((data) => { if (!cancelled) setServicios(data); })
      .catch((err) => { if (!cancelled) setLoadError(err.message || 'No se pudo cargar el catálogo de servicios'); });
    return () => { cancelled = true; };
  }, []);

  const servicio = servicios ? (servicios.find((s) => s.slug === slug) || servicios[0]) : null;

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.pageEyebrow}>Pago seguro</div>
          <h1 className={styles.pageTitle}>Contratar servicio</h1>
          <p className={styles.pageSub}>Rellena tus datos, paga y sigue tu trámite desde tu área de cliente.</p>
        </div>
      </div>

      <div className={styles.body}>
        {loadError && <p className={`${styles.formStatus} ${styles.error}`} role="alert">{loadError}</p>}
        {!loadError && !servicio && <p className={styles.loading}>Cargando…</p>}
        {servicio && (
          <>
            <CheckoutCard nombre={servicio.nombre} descripcion={servicio.descripcion} precio={servicio.precio} />
            <CheckoutForm servicio={servicio} />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Run the /checkout tests**

Run: `npm test --prefix frontend -- Checkout.test`
Expected: PASS (los 4 tests de `Checkout.test.jsx` siguen verdes — la página carga el servicio por API y `CheckoutForm` pinta el formulario).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Checkout.jsx
git commit -m "refactor: Checkout page delegates the form to CheckoutForm"
```

---

### Task 3: Embeber `CheckoutForm` en `ContratarCard` + CSS + tests de las fichas

**Files:**
- Modify: `frontend/src/pages/servicios/ContratarCard.jsx`
- Modify: `frontend/src/pages/Checkout.module.css:20`
- Modify: `frontend/src/pages/servicios/CanjeCarnet.jsx` (aria-label en el `<select>` del verificador, para no chocar con los `<select>` del formulario embebido)
- Modify (8): `frontend/src/pages/servicios/{Transferencia,BajaVehiculo,CancelacionDominio,DuplicadoCarnet,DuplicadoCirculacion,DuplicadoDatos,PermisoInternacional,CanjeCarnet}.test.jsx`

**Interfaces:**
- Consumes: `CheckoutForm` (Task 1) y `SERVICIOS` (`@shared/servicios.js`).

- [ ] **Step 1: Actualiza un test de ficha para esperar el formulario (falla primero)** — `Transferencia.test.jsx`

```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Transferencia from './Transferencia.jsx';

describe('Transferencia', () => {
  it('la ficha muestra el formulario de pago embebido', () => {
    render(<MemoryRouter><Transferencia /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /pagar con tarjeta o bizum/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it — falla**

Run: `npm test --prefix frontend -- Transferencia.test`
Expected: FAIL (hoy `ContratarCard` tiene el enlace "Contratar ahora", no el botón "Pagar…").

- [ ] **Step 3: Reescribe `ContratarCard.jsx`** para embeber el formulario

```jsx
import { SERVICIOS } from '@shared/servicios.js';
import CheckoutForm from './CheckoutForm.jsx';
// Reutiliza la tarjeta-precio de LeadForm.module.css (.checkout-*) y embebe el
// formulario de pago (CheckoutForm) directamente en la ficha, en lugar de un
// botón que navegaba a /checkout.
import styles from './LeadForm.module.css';

export default function ContratarCard({ slug, servicio, precio, includes }) {
  return (
    <div className={styles.checkoutCard}>
      <div className={styles.checkoutPriceBlock}>
        <div className={styles.checkoutService}>{servicio}</div>
        <div className={styles.checkoutPrice}>{precio}<sub>IVA incluido</sub></div>
        <div className={styles.checkoutIncludes}>
          {includes.map((inc) => (
            <span key={inc}>{inc}</span>
          ))}
        </div>
      </div>

      <div className={styles.checkoutBody}>
        <CheckoutForm servicio={SERVICIOS[slug]} />
        <div className={styles.checkoutDivider} />
        <div className={styles.checkoutWhatsapp}>
          💬 ¿Tienes dudas?{' '}
          <a href="https://wa.me/34684462670" target="_blank" rel="noopener" style={{ color: '#166534', fontWeight: 700, textDecoration: 'none' }}>
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: CSS — que las filas del formulario se apilen en la columna estrecha** — `frontend/src/pages/Checkout.module.css` línea 20

Cambia:
```css
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
```
por:
```css
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
```
(En la columna estrecha del lateral → 1 columna; en la página `/checkout` ancha → 2 columnas. Sin media queries.)

- [ ] **Step 5: Run the Transferencia test — pasa**

Run: `npm test --prefix frontend -- Transferencia.test`
Expected: PASS.

- [ ] **Step 6: Actualiza los otros 7 tests de ficha** con el mismo patrón del Step 1

Para cada fichero, reemplaza el contenido por el patrón del Step 1 cambiando **solo** el import y el nombre del componente en `describe`/`render`. Ficheros y componentes:

| Fichero | Componente |
|---|---|
| `BajaVehiculo.test.jsx` | `BajaVehiculo` |
| `CancelacionDominio.test.jsx` | `CancelacionDominio` |
| `DuplicadoCarnet.test.jsx` | `DuplicadoCarnet` |
| `DuplicadoCirculacion.test.jsx` | `DuplicadoCirculacion` |
| `DuplicadoDatos.test.jsx` | `DuplicadoDatos` |
| `PermisoInternacional.test.jsx` | `PermisoInternacional` |

Para `CanjeCarnet` hay **dos cambios** porque su ficha tiene el verificador de elegibilidad (con su propio `<select>` de país) además del formulario embebido (que añade más `<select>`):

**a) `CanjeCarnet.jsx`** — dale un `aria-label` al `<select>` del verificador para poder distinguirlo. Cambia:
```jsx
                    <select
                      className={styles.formInput}
                      style={{ marginTop: '6px', marginBottom: 0, fontSize: '13px' }}
                      value={country}
```
por:
```jsx
                    <select
                      className={styles.formInput}
                      style={{ marginTop: '6px', marginBottom: 0, fontSize: '13px' }}
                      aria-label="País para verificar el canje"
                      value={country}
```

**b) `CanjeCarnet.test.jsx`** — mantén el **segundo** test (el del verificador) pero cambia dentro de él la línea del combobox, y sustituye el **primer** test (el del enlace) por el del formulario. El fichero queda:
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import CanjeCarnet from './CanjeCarnet.jsx';

describe('CanjeCarnet', () => {
  it('la ficha muestra el formulario de pago embebido', () => {
    render(<MemoryRouter><CanjeCarnet /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /pagar con tarjeta o bizum/i })).toBeInTheDocument();
  });

  it('muestra el resultado de elegibilidad al completar el verificador', async () => {
    render(<MemoryRouter><CanjeCarnet /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /comprobar requisitos/i }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[0]);
    fireEvent.change(screen.getByLabelText(/país para verificar el canje/i), { target: { value: 'ok' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[1]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[2]);
    fireEvent.click(screen.getByRole('button', { name: /verificar →/i }));
    expect(await screen.findByText(/puedes contratar el trámite abajo/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run all frontend tests**

Run: `npm test --prefix frontend`
Expected: PASS (todos).

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/servicios/ContratarCard.jsx frontend/src/pages/Checkout.module.css frontend/src/pages/servicios/*.test.jsx
git commit -m "feat: embed CheckoutForm in the service detail card (single-page checkout)"
```

---

### Task 4: Backend — `cancel_url` vuelve a la ficha

**Files:**
- Modify: `backend/src/routes/checkout.js` (la creación de `stripe.checkout.sessions.create`)

- [ ] **Step 1: Cambia el `cancel_url`**

En `backend/src/routes/checkout.js`, dentro de `stripe.checkout.sessions.create({ … })`, cambia:
```js
      cancel_url: `${config.baseUrl}/checkout?servicio=${servicio.slug}&cancelado=1`,
```
por:
```js
      cancel_url: `${config.baseUrl}${servicio.href}?cancelado=1`,
```
(`servicio.href` es la ruta de la ficha, p.ej. `/tramites/duplicado-carnet`. Al cancelar en Stripe, el cliente vuelve a la ficha, donde `CheckoutForm` lee `?cancelado=1` y avisa.)

- [ ] **Step 2: Verifica que los tests del backend siguen verdes**

Run: `npm test --prefix backend`
Expected: PASS (18/18 — este cambio no afecta a los tests existentes).

- [ ] **Step 3: Commit**

```bash
git add backend/src/routes/checkout.js
git commit -m "feat: Stripe cancel_url returns to the service page instead of /checkout"
```

---

### Task 5: Verificación final

**Files:** ninguno (solo verificación).

- [ ] **Step 1: Tests + build**

Run:
```bash
npm test --prefix frontend
npm test --prefix backend
npm run build
```
Expected: todos en verde y el build compila.

- [ ] **Step 2: Prueba manual (tras desplegar)**

En una ficha (p.ej. Duplicado de Carnet): el formulario aparece en la tarjeta del lateral; rellenar datos → "Pagar con tarjeta o Bizum" → llega a la pantalla de Stripe con el importe correcto. En Canje: aparecen país + dirección. **No completar el pago** (o pago real pequeño + reembolso si se quiere certeza total).

- [ ] **Step 3: Deploy** (lo lanza el usuario): `npm run deploy` → subir `frontend/dist` + `backend`. No requiere NPM install (sin dependencias nuevas). Reiniciar la app en Plesk si se tocó el backend.
