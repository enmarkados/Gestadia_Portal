# Solicitar Información — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all payment CTAs (Stripe, "Pagar con tarjeta") with a "Solicitar información" lead capture form across 10 HTML files.

**Architecture:** Pure static HTML. Each service page gets its own inline `<script>` with a `submitLead()` stub ready for Zoho CRM wiring. No shared JS file — pages are independent. Playwright tests verify the desired state after changes.

**Tech Stack:** HTML, vanilla JS (inline), Playwright for verification tests.

## Global Constraints

- Prices (€) remain visible on all cards and panels — never remove them.
- WhatsApp number: `https://wa.me/34684462670`
- Phone: `910 600 314`
- Lead form fields: Nombre (text), Teléfono (tel), Email (email) — exactly these three, no DNI/NIE.
- Button style class stays `.checkout-btn` (same red, same padding).
- Zoho integration is a commented-out TODO — do NOT implement it yet.
- Server runs at `http://localhost:3000` for tests (started via `npx serve .`).

---

### Task 1: Playwright config + failing tests

**Files:**
- Create: `playwright.config.js`
- Create: `tests/ctas.spec.js`

**Interfaces:**
- Produces: `npm test` command that runs Playwright against `http://localhost:3000`

- [ ] **Step 1: Create playwright config**

Create `playwright.config.js` at project root:

```js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

- [ ] **Step 2: Add test script to package.json**

Edit `package.json` so it reads:

```json
{
  "scripts": {
    "test": "playwright test"
  },
  "devDependencies": {
    "playwright": "^1.60.0"
  }
}
```

- [ ] **Step 3: Install Playwright browsers**

```
npx playwright install chromium
```

Expected: downloads Chromium, exits 0.

- [ ] **Step 4: Create the test file**

Create `tests/ctas.spec.js`:

```js
const { test, expect } = require('@playwright/test');

const SERVICE_PAGES = [
  '/preview-canje.html',
  '/preview-baja-vehiculo.html',
  '/preview-transferencia.html',
  '/preview-duplicado-carnet.html',
  '/preview-duplicado-datos.html',
  '/preview-duplicado-circulacion.html',
  '/preview-cancelacion-dominio.html',
  '/preview-permiso-internacional.html',
];

// ── Home ──────────────────────────────────────────────────────────────────────

test('home: no Stripe references', async ({ page }) => {
  await page.goto('/preview-home.html');
  await expect(page.locator('body')).not.toContainText('Stripe');
});

test('home: service card buttons say "Solicitar información"', async ({ page }) => {
  await page.goto('/preview-home.html');
  const btns = page.locator('.service-card-btn');
  const count = await btns.count();
  for (let i = 0; i < count; i++) {
    await expect(btns.nth(i)).toContainText('Solicitar información');
  }
});

test('home: step 2 has no "pago" or "Stripe" text', async ({ page }) => {
  await page.goto('/preview-home.html');
  const steps = page.locator('.how-step');
  const secondStep = steps.nth(1);
  await expect(secondStep).not.toContainText('Stripe');
  await expect(secondStep).not.toContainText('pago seguro');
});

// ── Tramites ──────────────────────────────────────────────────────────────────

test('tramites: all solicitar buttons say "Solicitar información"', async ({ page }) => {
  await page.goto('/preview-tramites.html');
  const btns = page.locator('.service-card-btn');
  const count = await btns.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await expect(btns.nth(i)).toContainText('Solicitar información');
  }
});

// ── Service pages ─────────────────────────────────────────────────────────────

for (const url of SERVICE_PAGES) {
  test(`${url}: no "Pagar con tarjeta" or Stripe text`, async ({ page }) => {
    await page.goto(url);
    await expect(page.locator('body')).not.toContainText('Pagar con tarjeta');
    await expect(page.locator('body')).not.toContainText('Stripe');
  });

  test(`${url}: lead form has nombre, telefono, email fields`, async ({ page }) => {
    await page.goto(url);
    await expect(page.locator('#lead-nombre')).toBeVisible();
    await expect(page.locator('#lead-telefono')).toBeVisible();
    await expect(page.locator('#lead-email')).toBeVisible();
  });

  test(`${url}: form submit shows success state`, async ({ page }) => {
    await page.goto(url);
    await page.fill('#lead-nombre', 'Test Usuario');
    await page.fill('#lead-telefono', '+34 600 000 000');
    await page.fill('#lead-email', 'test@example.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('.checkout-body')).toContainText('¡Solicitud recibida!');
  });

  test(`${url}: price is still visible`, async ({ page }) => {
    await page.goto(url);
    await expect(page.locator('.checkout-price')).toBeVisible();
  });
}
```

- [ ] **Step 5: Run tests — expect failures**

Make sure the dev server is running first: `npx serve . --listen 3000`

```
npm test
```

Expected: many FAIL. This confirms our tests are measuring the right things before we make changes.

- [ ] **Step 6: Commit**

```
git add playwright.config.js package.json tests/ctas.spec.js
git commit -m "test: add Playwright tests for solicitar-informacion CTA changes"
```

---

### Task 2: Update `preview-home.html`

**Files:**
- Modify: `preview-home.html`

**Interfaces:**
- Consumes: nothing
- Produces: updated home with no Stripe references, buttons say "Solicitar información →"

- [ ] **Step 1: Update hero subtitle — remove "Paga online"**

Find (line ~161):
```html
<p class="hero-sub">Sin desplazamientos, sin colas y sin cita previa en la DGT. Paga online y nuestro equipo jurídico se encarga de todo.</p>
```

Replace with:
```html
<p class="hero-sub">Sin desplazamientos, sin colas y sin cita previa en la DGT. Solicita información y nuestro equipo jurídico se encarga de todo.</p>
```

- [ ] **Step 2: Remove "Pago 100% seguro con Stripe" hero trust item**

Find (line ~174):
```html
        <div class="hero-trust-item">Pago 100% seguro con Stripe</div>
```

Delete that line entirely.

- [ ] **Step 3: Update "¿Cómo funciona?" section subtitle**

Find (line ~233):
```html
      <p class="section-sub">Nos encargamos de todo. Tú solo rellenas el formulario y pagas.</p>
```

Replace with:
```html
      <p class="section-sub">Nos encargamos de todo. Tú solo rellenas el formulario y te llamamos.</p>
```

- [ ] **Step 4: Update step 2 of "¿Cómo funciona?"**

Find (lines ~242-244):
```html
        <div class="how-step reveal" style="transition-delay:.12s">
          <div class="how-step-num">2</div>
          <div class="how-step-title">Rellena y paga</div>
          <div class="how-step-desc">Formulario rápido y pago seguro con tarjeta a través de Stripe.</div>
        </div>
```

Replace with:
```html
        <div class="how-step reveal" style="transition-delay:.12s">
          <div class="how-step-num">2</div>
          <div class="how-step-title">Solicita información</div>
          <div class="how-step-desc">Formulario rápido. Te contactamos en menos de 24h.</div>
        </div>
```

- [ ] **Step 5: Replace "Pago 100% seguro" trust block with "Sin compromiso"**

Find (lines ~267-274):
```html
      <div class="trust-item reveal" style="transition-delay:.0s">
        <div class="trust-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <div>
          <div class="trust-title">Pago 100% seguro</div>
          <div class="trust-desc">Procesamos los pagos a través de Stripe. Nunca almacenamos datos de tu tarjeta.</div>
        </div>
      </div>
```

Replace with:
```html
      <div class="trust-item reveal" style="transition-delay:.0s">
        <div class="trust-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div>
          <div class="trust-title">Sin compromiso</div>
          <div class="trust-desc">Solicita información sin coste. Solo pagas si decides contratar el servicio.</div>
        </div>
      </div>
```

- [ ] **Step 6: Update the 3 service card buttons**

Find each occurrence of `class="service-card-btn">Solicitar →` and replace with `class="service-card-btn">Solicitar información →`. There are 3 occurrences (lines ~196, ~206, ~216).

- [ ] **Step 7: Commit**

```
git add preview-home.html
git commit -m "feat: remove Stripe CTAs and update copy on home page"
```

---

### Task 3: Update `preview-tramites.html`

**Files:**
- Modify: `preview-tramites.html`

**Interfaces:**
- Consumes: nothing
- Produces: all 7 service card buttons say "Solicitar información →"

- [ ] **Step 1: Replace all Solicitar buttons**

In `preview-tramites.html`, do a find-and-replace of:
```
>Solicitar →<
```
with:
```
>Solicitar información →<
```

There are 7 occurrences (one per service card). All have `href` links to service pages — leave those unchanged.

- [ ] **Step 2: Verify count**

Open `preview-tramites.html` in the browser at `http://localhost:3000/preview-tramites.html`. Confirm all 7 buttons read "Solicitar información →" and still navigate to their respective service pages.

- [ ] **Step 3: Commit**

```
git add preview-tramites.html
git commit -m "feat: update solicitar buttons on tramites page"
```

---

### Task 4: Update service pages — lead form pattern

This is the main change. Apply it to all 8 service pages. The pattern is identical in all of them: replace the entire `checkout-body` contents, add two CSS rules, add inline `<script>`.

**Files:**
- Modify: `preview-canje.html`, `preview-baja-vehiculo.html`, `preview-transferencia.html`, `preview-duplicado-carnet.html`, `preview-duplicado-datos.html`, `preview-duplicado-circulacion.html`, `preview-cancelacion-dominio.html`, `preview-permiso-internacional.html`

**Interfaces:**
- Produces: each page has `#lead-nombre`, `#lead-telefono`, `#lead-email` fields; submit shows `.checkout-body` success state; `submitLead()` stub with Zoho TODO comment.

- [ ] **Step 1: Add CSS rules to each page's `<style>` block**

In each of the 8 service pages, find the end of the `<style>` block (just before `</style>`) and add these two rules:

```css
    .lead-form-title { font-size: 14px; font-weight: 700; color: var(--graphite); margin-bottom: 4px; }
    .lead-form-sub { font-size: 12px; color: #888; margin-bottom: 16px; }
```

- [ ] **Step 2: Replace `checkout-body` contents in all 8 pages**

In each page, find the current `.checkout-body` block — which looks like this (slight variations between pages, but always starts with Nombre completo and ends with the WhatsApp line):

```html
        <div class="checkout-body">
          <label class="form-label">Nombre completo</label>
          <input class="form-input" type="text" placeholder="María García López">
          <label class="form-label">DNI / NIE</label>
          <input class="form-input" type="text" placeholder="X1234567A">
          <label class="form-label">Teléfono de contacto</label>
          <input class="form-input" type="tel" placeholder="+34 600 000 000">
          <label class="form-label">Email</label>
          <input class="form-input" type="email" placeholder="maria@email.com">
          <button class="checkout-btn">Pagar con tarjeta →</button>
          <div class="checkout-security">🔒 Pago seguro · Powered by Stripe</div>
          <div class="checkout-divider"></div>
          <div class="checkout-whatsapp">💬 ¿Tienes dudas? Escríbenos por WhatsApp antes de pagar</div>
        </div>
```

Note: `preview-canje.html` also has a DNI field, an email field, and a "Garantía de éxito" green box before the button. Replace the entire contents of `.checkout-body` regardless of what's inside.

Replace the entire `.checkout-body` div in each page with:

```html
        <div class="checkout-body">
          <div class="lead-form-title">Solicita información</div>
          <p class="lead-form-sub">Te llamamos en menos de 24 horas</p>
          <form id="lead-form" novalidate>
            <label class="form-label">Nombre</label>
            <input id="lead-nombre" class="form-input" type="text" placeholder="María García" required>
            <label class="form-label">Teléfono</label>
            <input id="lead-telefono" class="form-input" type="tel" placeholder="+34 600 000 000" required>
            <label class="form-label">Email</label>
            <input id="lead-email" class="form-input" type="email" placeholder="maria@email.com" required>
            <button type="submit" class="checkout-btn">Solicitar información →</button>
          </form>
          <div class="checkout-divider"></div>
          <div class="checkout-whatsapp">💬 ¿Prefieres escribir? <a href="https://wa.me/34684462670" target="_blank" rel="noopener" style="color:#166534;font-weight:700;text-decoration:none;">Escríbenos por WhatsApp</a></div>
        </div>
```

**The `tramite` value for the `submitLead()` call varies per page — see the table below.** The `checkout-body` HTML is identical in all 8 pages; only the JS `tramite` string differs.

- [ ] **Step 3: Add the inline `<script>` to each page**

Add this just before `</body>` in each page. Change the `tramite` string per the table:

| Archivo | Valor de `tramite` |
|---|---|
| `preview-canje.html` | `'Canje de Carnet Extranjero'` |
| `preview-baja-vehiculo.html` | `'Baja de Vehículo'` |
| `preview-transferencia.html` | `'Transferencia de Vehículo'` |
| `preview-duplicado-carnet.html` | `'Duplicado de Carnet de Conducir'` |
| `preview-duplicado-datos.html` | `'Duplicado por Cambio de Datos'` |
| `preview-duplicado-circulacion.html` | `'Duplicado Permiso de Circulación'` |
| `preview-cancelacion-dominio.html` | `'Cancelación de Reserva de Dominio'` |
| `preview-permiso-internacional.html` | `'Permiso Internacional de Conducir'` |

Script to add (substitute `TRAMITE_VALUE` with the value from the table above):

```html
  <script>
    document.getElementById('lead-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = document.getElementById('lead-nombre').value.trim();
      var telefono = document.getElementById('lead-telefono').value.trim();
      var email = document.getElementById('lead-email').value.trim();
      if (!nombre || !telefono || !email) return;
      submitLead({ nombre: nombre, telefono: telefono, email: email, tramite: TRAMITE_VALUE });
    });

    function submitLead(data) {
      // TODO: conectar Zoho CRM
      // fetch('https://www.zohoapis.eu/crm/v2/Leads', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': 'Zoho-oauthtoken ACCESS_TOKEN',
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     data: [{
      //       Last_Name: data.nombre,
      //       Phone: data.telefono,
      //       Email: data.email,
      //       Lead_Source: data.tramite
      //     }]
      //   })
      // });
      showSuccess();
    }

    function showSuccess() {
      document.querySelector('.checkout-body').innerHTML =
        '<div style="text-align:center;padding:32px 16px;">' +
          '<div style="font-size:40px;margin-bottom:12px;color:#16a34a;">✓</div>' +
          '<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin-bottom:8px;">¡Solicitud recibida!</div>' +
          '<p style="font-size:14px;color:#555;margin-bottom:20px;">Te llamamos en menos de 24 horas hábiles.</p>' +
          '<a href="https://wa.me/34684462670" target="_blank" rel="noopener" ' +
             'style="display:inline-flex;align-items:center;gap:8px;background:#25D366;color:#fff;' +
                    'border-radius:8px;padding:10px 18px;font-size:13px;font-weight:700;text-decoration:none;">' +
            '💬 Escríbenos por WhatsApp' +
          '</a>' +
        '</div>';
    }
  </script>
```

- [ ] **Step 4: Commit**

```
git add preview-canje.html preview-baja-vehiculo.html preview-transferencia.html \
        preview-duplicado-carnet.html preview-duplicado-datos.html \
        preview-duplicado-circulacion.html preview-cancelacion-dominio.html \
        preview-permiso-internacional.html
git commit -m "feat: replace checkout panel with lead capture form on all service pages"
```

---

### Task 5: Run Playwright tests — expect all green

**Files:** no changes

- [ ] **Step 1: Ensure dev server is running**

```
npx serve . --listen 3000
```

If already running, leave it.

- [ ] **Step 2: Run tests**

```
npm test
```

Expected output: all tests PASS. If any fail, read the error — it will point to the exact element or text mismatch to fix.

- [ ] **Step 3: Commit test results note**

No code to commit. If tests all pass, you're done.
