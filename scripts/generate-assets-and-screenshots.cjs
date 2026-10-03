const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'frontend/dist');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const BRAND_DIR = path.join(ASSETS_DIR, 'brand');
const SHOTS_MOBILE_DIR = path.join(ASSETS_DIR, 'screenshots/mobile');
const SHOTS_FULL_DIR = path.join(ASSETS_DIR, 'screenshots/mobile-fullpage');

// Ensure output directories exist
[BRAND_DIR, SHOTS_MOBILE_DIR, SHOTS_FULL_DIR].forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

// 1. Static SPA Server for frontend/dist
const mimeTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
};

function startServer(port = 4173) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      let filePath = path.join(DIST_DIR, urlPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, 'index.html');
      }

      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });

    server.listen(port, () => resolve(server));
  });
}

// 2. Mock Data for Portal and APIs
const MOCK_ME = {
  nombre: 'Carlos',
  apellidos: 'Gómez Martínez',
  email: 'carlos.gomez@gestadia-demo.es',
  telefono: '+34612345678',
  tipoDocumento: 'DNI',
  numDocumento: '12345678Z',
  direccion: {
    tipoVia: 'Calle',
    nombreVia: 'Velázquez',
    numero: '45',
    bloque: '',
    portal: 'A',
    escalera: 'Dcha',
    planta: '3',
    puerta: 'B',
    codigoPostal: '28001',
    municipio: 'Madrid',
    provincia: 'Madrid',
  },
};

const MOCK_SERVICIOS = [
  {
    slug: 'canje-carnet',
    nombre: 'Canje de Carnet Extranjero',
    descripcion: 'Homologa tu permiso de conducir extranjero por el carnet español ante la DGT.',
    precio: 210,
    categoria: 'permiso',
    requierePais: true,
    requiereDireccion: true,
    includes: ['Tasas DGT incluidas', 'Gestión completa', 'Especialista personal asignado', 'Garantía de éxito del trámite'],
    documentos: [
      { clave: 'residencia', label: 'Documento de residencia legal en España' },
      { clave: 'permiso_extranjero', label: 'Permiso de conducir extranjero original en vigor' },
      { clave: 'psicotecnico', label: 'Examen psicotécnico' },
    ],
  },
  {
    slug: 'transferencia',
    nombre: 'Transferencia de Vehículo',
    descripcion: 'Cambio de titularidad de vehículos ante la DGT.',
    precio: 135,
    categoria: 'vehiculo',
    requierePais: false,
    requiereDireccion: false,
    includes: ['Informe DGT', 'Liquidación ITP', 'Tasa DGT', 'Permiso provisional'],
    documentos: [
      { clave: 'dni_comprador', label: 'DNI / NIE del comprador' },
      { clave: 'dni_vendedor', label: 'DNI / NIE del vendedor' },
    ],
  },
];

const MOCK_EXPEDIENTES = [
  {
    id: '1',
    nPedido: 'GST-2026-8942',
    titulo: 'Canje de Carnet Extranjero',
    servicioSlug: 'canje-carnet',
    estado: 'en_gestion',
    estadoLabel: 'En gestión ante la DGT',
    progreso: 60,
    importe: 210,
    fechaPago: '2026-09-24T10:15:00.000Z',
    finDesistimiento: '2026-10-08T10:15:00.000Z',
    createdAt: '2026-09-24T10:15:00.000Z',
  },
  {
    id: '2',
    nPedido: 'GST-2026-7510',
    titulo: 'Transferencia de Vehículo',
    servicioSlug: 'transferencia',
    estado: 'completado',
    estadoLabel: 'Completado con éxito',
    progreso: 100,
    importe: 135,
    fechaPago: '2026-08-11T12:30:00.000Z',
    finDesistimiento: null,
    createdAt: '2026-08-11T12:30:00.000Z',
  },
];

const MOCK_EXPEDIENTE_DETALLE = {
  id: '1',
  nPedido: 'GST-2026-8942',
  titulo: 'Canje de Carnet Extranjero',
  servicioSlug: 'canje-carnet',
  estado: 'en_gestion',
  estadoLabel: 'En gestión ante la DGT',
  progreso: 60,
  importe: 210,
  fechaPago: '2026-09-24T10:15:00.000Z',
  finDesistimiento: '2026-10-08T10:15:00.000Z',
  createdAt: '2026-09-24T10:15:00.000Z',
  paisCanje: 'colombia',
  direccion: {
    tipoVia: 'Calle',
    nombreVia: 'Velázquez',
    numero: '45',
    portal: 'B',
    planta: '3',
    puerta: 'B',
    codigoPostal: '28001',
    municipio: 'Madrid',
    provincia: 'Madrid',
  },
  datosPais: {
    numIdentidad: 'C.C. 1020304050',
    numPermiso: 'COL-987654321',
  },
  documentos: [
    { id: 'd1', clave: 'residencia', nombre: 'residencia_nie_carlos.pdf', createdAt: '2026-09-24T11:00:00.000Z' },
    { id: 'd2', clave: 'permiso_extranjero', nombre: 'licencia_colombia.jpg', createdAt: '2026-09-24T11:05:00.000Z' },
  ],
  checklist: [
    { clave: 'residencia', label: 'Documento de residencia legal en España', subido: true },
    { clave: 'permiso_extranjero', label: 'Permiso de conducir extranjero original en vigor', subido: true },
    { clave: 'psicotecnico', label: 'Examen psicotécnico (centro médico)', subido: false },
  ],
  eventos: [
    { id: 'e1', estado: 'pago_pendiente', nota: 'Expediente registrado en plataforma', createdAt: '2026-09-24T10:14:00.000Z' },
    { id: 'e2', estado: 'pagado', nota: 'Pago con tarjeta confirmado correctamente (210,00 €)', createdAt: '2026-09-24T10:15:00.000Z' },
    { id: 'e3', estado: 'documentacion_pendiente', nota: 'Revisión de documentos aportados iniciada', createdAt: '2026-09-24T12:00:00.000Z' },
    { id: 'e4', estado: 'en_gestion', nota: 'Documentación inicial verificada. En trámite ante Jefatura Provincial de Tráfico.', createdAt: '2026-09-25T09:30:00.000Z' },
  ],
};

const MOCK_NOTIFICACIONES = [
  {
    id: 'n1',
    titulo: 'Actualización de expediente GST-2026-8942',
    cuerpo: 'Tu expediente de Canje de Carnet ha sido admitido a trámite en la DGT. Estamos a la espera de la resolución final.',
    leida: false,
    createdAt: '2026-09-28T10:45:00.000Z',
  },
  {
    id: 'n2',
    titulo: 'Documentación recibida',
    cuerpo: 'Hemos validado la documentación de residencia y permiso extranjero. Queda pendiente el examen psicotécnico.',
    leida: true,
    createdAt: '2026-09-24T11:15:00.000Z',
  },
  {
    id: 'n3',
    titulo: 'Expediente de Transferencia finalizado',
    cuerpo: 'Tu permiso de circulación definitivo ya está emitido y disponible.',
    leida: true,
    createdAt: '2026-08-11T12:30:00.000Z',
  },
];

async function generateBrandAssets(browser) {
  console.log('\n🎨 [1/3] Generando assets de marca...');

  // SVG 1: Logo Dark (white text on transparent)
  const logoDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100">
  <text x="10" y="70" font-family="'Playfair Display', Georgia, serif" font-size="68" font-weight="800" fill="#ffffff" letter-spacing="-1">gestadia<tspan fill="#c0392b">.</tspan></text>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'logo-dark.svg'), logoDarkSvg);

  // SVG 2: Logo Light (graphite text on transparent)
  const logoLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100">
  <text x="10" y="70" font-family="'Playfair Display', Georgia, serif" font-size="68" font-weight="800" fill="#2c2c2c" letter-spacing="-1">gestadia<tspan fill="#c0392b">.</tspan></text>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'logo-light.svg'), logoLightSvg);

  // SVG 3: Logo con Tagline Dark
  const logoTaglineDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 140">
  <text x="10" y="75" font-family="'Playfair Display', Georgia, serif" font-size="68" font-weight="800" fill="#ffffff" letter-spacing="-1">gestadia<tspan fill="#c0392b">.</tspan></text>
  <text x="14" y="112" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="16" font-weight="700" letter-spacing="3" text-transform="uppercase" fill="#c0392b">TRÁMITES DGT ONLINE</text>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'logo-with-tagline-dark.svg'), logoTaglineDarkSvg);

  // SVG 4: Logo con Tagline Light
  const logoTaglineLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 140">
  <text x="10" y="75" font-family="'Playfair Display', Georgia, serif" font-size="68" font-weight="800" fill="#2c2c2c" letter-spacing="-1">gestadia<tspan fill="#c0392b">.</tspan></text>
  <text x="14" y="112" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="16" font-weight="700" letter-spacing="3" text-transform="uppercase" fill="#c0392b">TRÁMITES DGT ONLINE</text>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'logo-with-tagline-light.svg'), logoTaglineLightSvg);

  // SVG 5: App Icon (512x512)
  const appIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#363636"/>
      <stop offset="100%" stop-color="#222222"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  <rect x="2" y="2" width="508" height="508" rx="110" fill="none" stroke="#444444" stroke-width="4"/>
  <g filter="url(#shadow)">
    <text x="128" y="365" font-family="'Playfair Display', Georgia, serif" font-size="360" font-weight="800" fill="#ffffff">g</text>
    <circle cx="376" cy="336" r="44" fill="#c0392b"/>
  </g>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'app-icon.svg'), appIconSvg);

  // Render PNGs via Chromium
  const page = await browser.newPage();

  // Render Logo Dark PNG (transparent)
  await page.setViewportSize({ width: 1200, height: 320 });
  await page.setContent(`
    <style>body { margin:0; display:flex; align-items:center; justify-content:center; height:100vh; background:transparent; font-family:Georgia, serif; }</style>
    ${logoDarkSvg.replace('width="100%"', '').replace('<svg ', '<svg style="width:90%;height:auto;" ')}
  `);
  await page.screenshot({ path: path.join(BRAND_DIR, 'logo-dark.png'), omitBackground: true });

  // Render Logo Light PNG (transparent)
  await page.setContent(`
    <style>body { margin:0; display:flex; align-items:center; justify-content:center; height:100vh; background:transparent; font-family:Georgia, serif; }</style>
    ${logoLightSvg.replace('width="100%"', '').replace('<svg ', '<svg style="width:90%;height:auto;" ')}
  `);
  await page.screenshot({ path: path.join(BRAND_DIR, 'logo-light.png'), omitBackground: true });

  // Render Logo with Tagline Dark (transparent)
  await page.setViewportSize({ width: 1200, height: 380 });
  await page.setContent(`
    <style>body { margin:0; display:flex; align-items:center; justify-content:center; height:100vh; background:transparent; font-family:Georgia, serif; }</style>
    ${logoTaglineDarkSvg.replace('<svg ', '<svg style="width:90%;height:auto;" ')}
  `);
  await page.screenshot({ path: path.join(BRAND_DIR, 'logo-with-tagline-dark.png'), omitBackground: true });

  // Render Logo with Tagline Light (transparent)
  await page.setContent(`
    <style>body { margin:0; display:flex; align-items:center; justify-content:center; height:100vh; background:transparent; font-family:Georgia, serif; }</style>
    ${logoTaglineLightSvg.replace('<svg ', '<svg style="width:90%;height:auto;" ')}
  `);
  await page.screenshot({ path: path.join(BRAND_DIR, 'logo-with-tagline-light.png'), omitBackground: true });

  // Render App Icon 512x512
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`
    <style>body { margin:0; display:flex; align-items:center; justify-content:center; height:100vh; background:transparent; }</style>
    ${appIconSvg.replace('<svg ', '<svg style="width:100%;height:100%;" ')}
  `);
  await page.screenshot({ path: path.join(BRAND_DIR, 'app-icon-512.png'), omitBackground: true });

  // Render App Icon 192x192
  await page.setViewportSize({ width: 192, height: 192 });
  await page.setContent(`
    <style>body { margin:0; display:flex; align-items:center; justify-content:center; height:100vh; background:transparent; }</style>
    ${appIconSvg.replace('<svg ', '<svg style="width:100%;height:100%;" ')}
  `);
  await page.screenshot({ path: path.join(BRAND_DIR, 'app-icon-192.png'), omitBackground: true });

  // Render Social Share Card (1200x630 OpenGraph Banner)
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1200px;
          height: 630px;
          background: #232323;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 70px 80px;
        }
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1.5px, transparent 1.5px);
          background-size: 32px 32px;
          pointer-events: none;
        }
        .glow {
          position: absolute;
          top: -120px;
          right: -100px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(192,57,43,0.3) 0%, transparent 65%);
          pointer-events: none;
        }
        .top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 2;
        }
        .logo {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 58px;
          font-weight: 800;
          letter-spacing: -1px;
          color: #fff;
        }
        .logo span { color: #c0392b; }
        .badge {
          background: rgba(192,57,43,0.18);
          border: 1.5px solid #c0392b;
          color: #ff7669;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 10px 22px;
          border-radius: 999px;
        }
        .content {
          position: relative;
          z-index: 2;
          margin-top: 20px;
        }
        .eyebrow {
          color: #c0392b;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .headline {
          font-family: Georgia, serif;
          font-size: 52px;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 16px;
          max-width: 900px;
        }
        .headline em {
          color: #c0392b;
          font-style: normal;
        }
        .sub {
          font-size: 22px;
          color: #aaaaaa;
          line-height: 1.5;
          max-width: 820px;
        }
        .footer-row {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 28px;
          border-top: 1px solid #383838;
          padding-top: 28px;
        }
        .pill {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          color: #dddddd;
          font-weight: 600;
        }
        .pill-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #c0392b;
        }
        .whatsapp-tag {
          margin-left: auto;
          background: #25D366;
          color: #ffffff;
          font-weight: 700;
          font-size: 15px;
          padding: 10px 20px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      </style>
    </head>
    <body>
      <div class="grid-bg"></div>
      <div class="glow"></div>
      <div class="top-row">
        <div class="logo">gestadia<span>.</span></div>
        <div class="badge">Plataforma DGT Oficial</div>
      </div>
      <div class="content">
        <div class="eyebrow">Trámites de Tráfico Online</div>
        <h1 class="headline">Tus trámites de tráfico, <em>resueltos hoy.</em></h1>
        <p class="sub">100% online, sin colas ni cita previa en la DGT. Canjes, transferencias, duplicados y bajas con asesor personal.</p>
      </div>
      <div class="footer-row">
        <div class="pill"><div class="pill-dot"></div>Sin cita previa DGT</div>
        <div class="pill"><div class="pill-dot"></div>Tasas DGT incluidas</div>
        <div class="pill"><div class="pill-dot"></div>Pago seguro con tarjeta o Bizum</div>
        <div class="whatsapp-tag">💬 Soporte WhatsApp 24h</div>
      </div>
    </body>
    </html>
  `);
  await page.screenshot({ path: path.join(BRAND_DIR, 'og-social-card-1200x630.png') });

  // Favicon 32x32 PNG
  await page.setViewportSize({ width: 32, height: 32 });
  await page.setContent(`
    <style>body { margin:0; display:flex; align-items:center; justify-content:center; height:100vh; background:transparent; }</style>
    ${fs.readFileSync(path.join(ROOT_DIR, 'frontend/public/favicon.svg'), 'utf8')}
  `);
  await page.screenshot({ path: path.join(BRAND_DIR, 'favicon-32x32.png'), omitBackground: true });
  fs.copyFileSync(path.join(ROOT_DIR, 'frontend/public/favicon.svg'), path.join(BRAND_DIR, 'favicon.svg'));

  await page.close();
  console.log('✅ Brand assets generados en assets/brand/');
}

// 3. Screen Captures Definition
const SCREENS = [
  { id: '01-inicio', route: '/', title: 'Página de Inicio', hasFullPage: true, waitMs: 1200 },
  {
    id: '02-menu-navegacion',
    route: '/',
    title: 'Menú Móvil Desplegado',
    waitMs: 600,
    action: async (page) => {
      const btn = page.locator('button[aria-label*="menú" i], button[class*="menuBtn"]');
      if (await btn.count()) {
        await btn.click();
        await page.waitForTimeout(400);
      }
    },
  },
  { id: '03-catalogo-tramites', route: '/tramites', title: 'Catálogo de Trámites DGT', hasFullPage: true, waitMs: 800 },
  { id: '04-tramite-canje-carnet', route: '/tramites/canje-carnet', title: 'Ficha Canje de Carnet Extranjero', hasFullPage: true, waitMs: 800 },
  {
    id: '05-tramite-canje-verificador',
    route: '/tramites/canje-carnet',
    title: 'Verificador de Requisitos Canje (Interactivo)',
    waitMs: 600,
    action: async (page) => {
      // Open verification accordion
      const toggle = page.locator('button:has-text("Comprobar requisitos")').first();
      if (await toggle.count()) {
        await toggle.scrollIntoViewIfNeeded();
        await toggle.click();
        await page.waitForTimeout(300);
        // Click "Sí" on residence
        const siBtn1 = page.locator('button:text-is("Sí")').first();
        if (await siBtn1.count()) await siBtn1.click();
        // Select country
        const countrySelect = page.locator('select[aria-label*="País"]').first();
        if (await countrySelect.count()) await countrySelect.selectOption('Colombia');
        // Click "Sí" on in force
        const siBtn2 = page.locator('button:text-is("Sí")').nth(1);
        if (await siBtn2.count()) await siBtn2.click();
        // Click "Sí" on before residency
        const siBtn3 = page.locator('button:text-is("Sí")').nth(2);
        if (await siBtn3.count()) await siBtn3.click();
        // Click verify
        const verifBtn = page.locator('button:has-text("Verificar")').first();
        if (await verifBtn.count()) await verifBtn.click();
        await page.waitForTimeout(400);
      }
    },
  },
  { id: '06-tramite-transferencia', route: '/tramites/transferencia', title: 'Ficha Transferencia de Vehículo', hasFullPage: true, waitMs: 800 },
  { id: '07-tramite-duplicado-carnet', route: '/tramites/duplicado-carnet', title: 'Ficha Duplicado de Carnet', waitMs: 800 },
  { id: '08-tramite-duplicado-datos', route: '/tramites/duplicado-datos', title: 'Ficha Duplicado Cambio de Datos', waitMs: 800 },
  { id: '09-tramite-duplicado-circulacion', route: '/tramites/duplicado-circulacion', title: 'Ficha Permiso de Circulación', waitMs: 800 },
  { id: '10-tramite-permiso-internacional', route: '/tramites/permiso-internacional', title: 'Ficha Permiso Internacional', waitMs: 800 },
  { id: '11-tramite-baja-vehiculo', route: '/tramites/baja-vehiculo', title: 'Ficha Baja de Vehículo', waitMs: 800 },
  { id: '12-tramite-cancelacion-dominio', route: '/tramites/cancelacion-dominio', title: 'Ficha Cancelación Reserva Dominio', waitMs: 800 },
  { id: '13-contacto-whatsapp', route: '/contacto', title: 'Contacto y Soporte WhatsApp', hasFullPage: true, waitMs: 800 },
  { id: '14-checkout-formulario', route: '/checkout?servicio=canje-carnet', title: 'Pasarela de Pago y Checkout Seguro', hasFullPage: true, waitMs: 800 },
  { id: '15-confirmacion-gracias', route: '/gracias?ref=GST-2026-8942', title: 'Confirmación de Pedido y Gracias', waitMs: 800 },
  { id: '16-portal-login', route: '/portal/login', title: 'Portal Clientes - Inicio de Sesión', waitMs: 800 },
  { id: '17-portal-mis-servicios', route: '/portal/mis-servicios', title: 'Portal Clientes - Mis Servicios / Expedientes', isAuthed: true, waitMs: 800 },
  { id: '18-portal-expediente-detalle', route: '/portal/mis-servicios/1', title: 'Portal Clientes - Detalle de Expediente', isAuthed: true, waitMs: 800 },
  { id: '19-portal-mis-datos', route: '/portal/mis-datos', title: 'Portal Clientes - Mis Datos Personales', isAuthed: true, waitMs: 800 },
  { id: '20-portal-notificaciones', route: '/portal/notificaciones', title: 'Portal Clientes - Centro de Notificaciones', isAuthed: true, waitMs: 800 },
  { id: '21-legal-aviso-legal', route: '/aviso-legal', title: 'Información Legal - Aviso Legal', waitMs: 800 },
  { id: '22-legal-privacidad', route: '/privacidad', title: 'Información Legal - Política de Privacidad', waitMs: 800 },
  { id: '23-legal-cookies', route: '/cookies', title: 'Información Legal - Política de Cookies', waitMs: 800 },
  { id: '24-legal-condiciones-pagos', route: '/pagos-devoluciones', title: 'Información Legal - Condiciones y Devoluciones', waitMs: 800 },
  { id: '25-pantalla-404', route: '/pagina-inexistente', title: 'Pantalla de Error 404', waitMs: 800 },
];

async function captureAllScreens(browser, baseUrl) {
  console.log('\n📱 [2/3] Capturando pantallas móviles (iPhone 14/15 390x844 @2x)...');

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  });

  // Intercept API routes to provide realistic mock data
  await context.route('**/api/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/api/auth/login')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'mock-valid-token', nombre: 'Carlos' }) });
    }
    if (url.includes('/api/me')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ME) });
    }
    if (url.includes('/api/servicios')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SERVICIOS) });
    }
    if (url.includes('/api/expedientes/1')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_EXPEDIENTE_DETALLE) });
    }
    if (url.includes('/api/expedientes')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_EXPEDIENTES) });
    }
    if (url.includes('/api/notificaciones')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_NOTIFICACIONES) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });

  const page = await context.newPage();
  page.on('pageerror', (err) => console.log(`\n    ⚠️  [Page Error] ${err.message}`));

  for (const s of SCREENS) {
    process.stdout.write(`  📸 Capturando: ${s.title} (${s.id})... `);

    // If authenticated screen, set localStorage token
    if (s.isAuthed) {
      await page.addInitScript(() => {
        localStorage.setItem('gestadia_token', 'mock-valid-token');
      });
    }

    await page.goto(`${baseUrl}${s.route}`, { waitUntil: 'load' });
    if (s.waitMs) await page.waitForTimeout(s.waitMs);

    if (s.action) {
      await s.action(page);
    }

    // 1. Mobile Viewport Screenshot (exact 390x844 @2x = 780x1688 px)
    const mobilePath = path.join(SHOTS_MOBILE_DIR, `${s.id}.png`);
    await page.screenshot({ path: mobilePath, fullPage: false });

    // 2. Full-Page Screenshot if requested
    if (s.hasFullPage) {
      const fullPath = path.join(SHOTS_FULL_DIR, `${s.id}-completo.png`);
      await page.screenshot({ path: fullPath, fullPage: true });
    }

    console.log('✅');
  }

  await page.close();
  await context.close();
}

// 4. Generate Visual Catalog and Brand Guide
function generateDocumentation() {
  console.log('\n📝 [3/3] Generando catálogo visual y guía de marca...');

  // Brand Guide Markdown
  const brandGuideMd = `# Guía de Marca y Assets — Gestadia

## 1. Identidad Visual de Gestadia
Gestadia es la plataforma digital de tramitación DGT en España con atención jurídica personalizada y servicio 100% online sin cita previa.

### Paleta de Colores Oficial
| Color | Hex | Uso principal |
|---|---|---|
| **Grafito Gestadia** | \`#2c2c2c\` | Cabecera, botones oscuros, títulos principales, fondos dark |
| **Rojo DGT** | \`#c0392b\` | Punto de marca (logo), acentos, CTAs primarios, precios |
| **Rojo Hover** | \`#a93226\` | Estado hover/active de botones principales |
| **Verde WhatsApp** | \`#25D366\` | Botones de contacto y asistencia directa vía WhatsApp |
| **Verde Éxito** | \`#16a34a\` | Checkmarks, badges de completado y estados de éxito |
| **Gris Fondo** | \`#f7f7f7\` | Fondos de portal, paneles de información y tarjetas |
| **Borde Neutro** | \`#e8e8e8\` | Separadores y contornos de tarjetas |

### Tipografía
- **Titulares y Marca:** \`Playfair Display\`, \`Georgia\`, \`serif\` (800 Bold).
- **Textos de Interfaz:** \`-apple-system\`, \`BlinkMacSystemFont\`, \`'Segoe UI'\`, \`sans-serif\`.

---

## 2. Inventario de Assets de Marca

| Archivo | Formato | Dimensiones | Descripción |
|---|---|---|---|
| \`logo-dark.svg\` / \`.png\` | Vector / PNG | 1200×320 | Logotipo en blanco con punto rojo sobre fondo transparente (para fondos oscuros). |
| \`logo-light.svg\` / \`.png\` | Vector / PNG | 1200×320 | Logotipo en grafito con punto rojo sobre fondo transparente (para fondos claros). |
| \`logo-with-tagline-dark.svg\` / \`.png\` | Vector / PNG | 1200×380 | Logotipo oficial con subtítulo "TRÁMITES DGT ONLINE" en versión oscura. |
| \`logo-with-tagline-light.svg\` / \`.png\` | Vector / PNG | 1200×380 | Logotipo oficial con subtítulo "TRÁMITES DGT ONLINE" en versión clara. |
| \`app-icon-512.png\` | PNG Retina | 512×512 | Icono de app móvil cuadrada con esquinas curvadas y brillo sutil. |
| \`app-icon-192.png\` | PNG | 192×192 | Icono estándar para PWA y accesos directos en Android/iOS. |
| \`app-icon.svg\` | Vector SVG | Escalable | Vectorial del isotipo de la aplicación. |
| \`og-social-card-1200x630.png\` | PNG | 1200×630 | Banner de previsualización social para WhatsApp, Twitter/X, LinkedIn y Facebook. |
| \`favicon.svg\` / \`favicon-32x32.png\` | SVG / PNG | 32×32 | Favicon oficial del portal. |

---

## 3. Instrucciones para Subir y Presentar tu Sistema
- **En tu web/hosting:** Sube la carpeta \`assets/brand/\` a tu CDN o carpeta pública para disponer de los logotipos en alta resolución.
- **En presentaciones y dossiers de producto:** Utiliza las capturas en \`assets/screenshots/mobile/\` que tienen la resolución Retina nativa (780×1688 px) correspondiente a un iPhone moderno.
- **En redes sociales y WhatsApp:** Configura \`og-social-card-1200x630.png\` en tu etiqueta \`<meta property="og:image">\` para que al compartir el enlace se vea la tarjeta profesional de Gestadia.
`;

  fs.writeFileSync(path.join(BRAND_DIR, 'BRAND_GUIDE.md'), brandGuideMd);

  // Markdown Catalog of Screenshots
  const catalogMd = `# Catálogo de Capturas Móviles — Gestadia Portal

Este directorio contiene las capturas de pantalla de **todas las pantallas del sistema** optimizadas para móvil (resolución Retina 390×844 @2x = 780×1688 px).

## 📱 Pantallas Principales
1. **Inicio:** [\`01-inicio.png\`](file://${SHOTS_MOBILE_DIR}/01-inicio.png) (Hero, 2x2 stats, CTA WhatsApp)
2. **Menú Desplegado:** [\`02-menu-navegacion.png\`](file://${SHOTS_MOBILE_DIR}/02-menu-navegacion.png) (Navegación móvil con menú hamburguesa abierto)
3. **Catálogo de Trámites:** [\`03-catalogo-tramites.png\`](file://${SHOTS_MOBILE_DIR}/03-catalogo-tramites.png) (Filtros y trámites disponibles)
4. **Contacto y WhatsApp:** [\`13-contacto-whatsapp.png\`](file://${SHOTS_MOBILE_DIR}/13-contacto-whatsapp.png) (Formulario y atención 24h)
5. **Checkout y Pago Seguro:** [\`14-checkout-formulario.png\`](file://${SHOTS_MOBILE_DIR}/14-checkout-formulario.png) (Formulario de pago adaptado a móvil)
6. **Confirmación / Gracias:** [\`15-confirmacion-gracias.png\`](file://${SHOTS_MOBILE_DIR}/15-confirmacion-gracias.png) (Número de expediente y confirmación)
7. **Error 404:** [\`25-pantalla-404.png\`](file://${SHOTS_MOBILE_DIR}/25-pantalla-404.png) (Página no encontrada)

## 📋 Fichas de Trámites DGT
- **Canje de Carnet Extranjero:** [\`04-tramite-canje-carnet.png\`](file://${SHOTS_MOBILE_DIR}/04-tramite-canje-carnet.png)
- **Verificador Interactivo de Requisitos:** [\`05-tramite-canje-verificador.png\`](file://${SHOTS_MOBILE_DIR}/05-tramite-canje-verificador.png)
- **Transferencia de Vehículo:** [\`06-tramite-transferencia.png\`](file://${SHOTS_MOBILE_DIR}/06-tramite-transferencia.png)
- **Duplicado de Carnet de Conducir:** [\`07-tramite-duplicado-carnet.png\`](file://${SHOTS_MOBILE_DIR}/07-tramite-duplicado-carnet.png)
- **Duplicado por Cambio de Datos:** [\`08-tramite-duplicado-datos.png\`](file://${SHOTS_MOBILE_DIR}/08-tramite-duplicado-datos.png)
- **Duplicado Permiso de Circulación:** [\`09-tramite-duplicado-circulacion.png\`](file://${SHOTS_MOBILE_DIR}/09-tramite-duplicado-circulacion.png)
- **Permiso Internacional:** [\`10-tramite-permiso-internacional.png\`](file://${SHOTS_MOBILE_DIR}/10-tramite-permiso-internacional.png)
- **Baja de Vehículo:** [\`11-tramite-baja-vehiculo.png\`](file://${SHOTS_MOBILE_DIR}/11-tramite-baja-vehiculo.png)
- **Cancelación de Reserva de Dominio:** [\`12-tramite-cancelacion-dominio.png\`](file://${SHOTS_MOBILE_DIR}/12-tramite-cancelacion-dominio.png)

## 🔐 Portal de Clientes (Área Privada)
- **Iniciar Sesión:** [\`16-portal-login.png\`](file://${SHOTS_MOBILE_DIR}/16-portal-login.png)
- **Mis Servicios / Expedientes en curso:** [\`17-portal-mis-servicios.png\`](file://${SHOTS_MOBILE_DIR}/17-portal-mis-servicios.png)
- **Detalle de Expediente (Timeline y Docs):** [\`18-portal-expediente-detalle.png\`](file://${SHOTS_MOBILE_DIR}/18-portal-expediente-detalle.png)
- **Mis Datos de Contacto y Envío:** [\`19-portal-mis-datos.png\`](file://${SHOTS_MOBILE_DIR}/19-portal-mis-datos.png)
- **Centro de Notificaciones DGT:** [\`20-portal-notificaciones.png\`](file://${SHOTS_MOBILE_DIR}/20-portal-notificaciones.png)

## ⚖️ Páginas Legales
- **Aviso Legal:** [\`21-legal-aviso-legal.png\`](file://${SHOTS_MOBILE_DIR}/21-legal-aviso-legal.png)
- **Política de Privacidad:** [\`22-legal-privacidad.png\`](file://${SHOTS_MOBILE_DIR}/22-legal-privacidad.png)
- **Política de Cookies (Tabla adaptable):** [\`23-legal-cookies.png\`](file://${SHOTS_MOBILE_DIR}/23-legal-cookies.png)
- **Condiciones de Contratación y Devoluciones:** [\`24-legal-condiciones-pagos.png\`](file://${SHOTS_MOBILE_DIR}/24-legal-condiciones-pagos.png)

## 📜 Capturas de Página Completa (Scroll)
Para ver la composición vertical completa en móvil:
- \`01-inicio-completo.png\`
- \`03-catalogo-tramites-completo.png\`
- \`04-tramite-canje-carnet-completo.png\`
- \`06-tramite-transferencia-completo.png\`
- \`13-contacto-completo.png\`
- \`14-checkout-formulario-completo.png\`
`;

  fs.writeFileSync(path.join(ASSETS_DIR, 'README.md'), catalogMd);

  // HTML Visual Gallery for easy browser preview
  const galleryHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galería de Assets y Capturas Móviles — Gestadia</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a1a; color: #eee; padding: 40px 24px; }
    .header { max-width: 1300px; margin: 0 auto 40px; }
    h1 { font-family: Georgia, serif; font-size: 36px; margin-bottom: 8px; color: #fff; }
    h1 span { color: #c0392b; }
    p.lead { color: #aaa; font-size: 16px; margin-bottom: 24px; }
    .tabs { display: flex; gap: 12px; margin-bottom: 32px; border-bottom: 1px solid #333; padding-bottom: 16px; }
    .tab { background: #2a2a2a; border: 1px solid #444; color: #fff; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; text-decoration: none; }
    .tab:hover { background: #c0392b; border-color: #c0392b; }
    .section-title { font-size: 22px; font-weight: 700; color: #fff; margin: 36px 0 20px; border-left: 4px solid #c0392b; padding-left: 12px; }
    .brand-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 40px; }
    .brand-card { background: #262626; border: 1px solid #383838; border-radius: 12px; padding: 20px; text-align: center; }
    .brand-card.light { background: #f7f7f7; color: #222; }
    .brand-card img { max-width: 100%; max-height: 140px; object-fit: contain; margin-bottom: 14px; }
    .brand-card .name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
    .brand-card .desc { font-size: 12px; opacity: 0.7; }
    .screens-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }
    .screen-card { background: #262626; border: 1px solid #383838; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; transition: transform .2s, box-shadow .2s; }
    .screen-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.5); border-color: #555; }
    .screen-card .img-wrap { background: #000; overflow: hidden; border-bottom: 1px solid #383838; }
    .screen-card img { width: 100%; height: auto; display: block; }
    .screen-info { padding: 14px 16px; }
    .screen-num { font-size: 11px; font-weight: 800; color: #c0392b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .screen-title { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 6px; }
    .screen-link { font-size: 12px; color: #888; text-decoration: none; word-break: break-all; }
    .screen-link:hover { color: #fff; }
  </style>
</head>
<body>
  <div class="header">
    <h1>gestadia<span>.</span> — Catálogo de Assets y Capturas Móviles</h1>
    <p class="lead">Kit completo de marca, iconos de aplicación y capturas en formato móvil (iPhone 14/15 390×844 @2x Retina) de todas las pantallas del sistema.</p>
    <div class="tabs">
      <a href="#brand" class="tab">Identidad de Marca</a>
      <a href="#screens" class="tab">Pantallas Móviles (25)</a>
      <a href="#fullpage" class="tab">Scroll Completo</a>
    </div>

    <h2 class="section-title" id="brand">1. Elementos de Marca y Logotipo</h2>
    <div class="brand-grid">
      <div class="brand-card">
        <img src="../brand/logo-dark.png" alt="Logo Dark">
        <div class="name">Logo Dark (Fondo Oscuro)</div>
        <div class="desc">logo-dark.svg / .png (Transparente)</div>
      </div>
      <div class="brand-card light">
        <img src="../brand/logo-light.png" alt="Logo Light">
        <div class="name">Logo Light (Fondo Claro)</div>
        <div class="desc">logo-light.svg / .png (Transparente)</div>
      </div>
      <div class="brand-card">
        <img src="../brand/app-icon-512.png" alt="App Icon 512" style="max-height:100px; border-radius: 22px;">
        <div class="name">Icono de App (512×512)</div>
        <div class="desc">app-icon-512.png / 192.png / .svg</div>
      </div>
      <div class="brand-card" style="grid-column: span 2;">
        <img src="../brand/og-social-card-1200x630.png" alt="Social Banner" style="max-height: 160px; border-radius: 8px;">
        <div class="name">Banner Social Card (1200×630)</div>
        <div class="desc">og-social-card-1200x630.png (Para WhatsApp, redes sociales y prensa)</div>
      </div>
    </div>

    <h2 class="section-title" id="screens">2. Capturas de Pantalla Móvil (${SCREENS.length} Pantallas)</h2>
    <div class="screens-grid">
      ${SCREENS.map(
        (s) => `
      <div class="screen-card">
        <div class="img-wrap">
          <a href="./mobile/${s.id}.png" target="_blank">
            <img src="./mobile/${s.id}.png" alt="${s.title}" loading="lazy">
          </a>
        </div>
        <div class="screen-info">
          <div class="screen-num">${s.id.split('-')[0]}</div>
          <div class="screen-title">${s.title}</div>
          <a class="screen-link" href="${s.route}" target="_blank">${s.route}</a>
        </div>
      </div>`
      ).join('')}
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(ASSETS_DIR, 'screenshots/galeria.html'), galleryHtml);
  console.log('✅ Documentación y galería visual generada en assets/');
}

// 5. Main Execution
async function main() {
  console.log('🚀 Iniciando generación completa de assets y capturas móviles...');

  // Start static server
  const server = await startServer(4173);
  console.log('🌐 Servidor estático listo en http://localhost:4173');

  // Launch browser with macOS Chrome
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  try {
    // 1. Generate brand assets
    await generateBrandAssets(browser);

    // 2. Capture all mobile screens
    await captureAllScreens(browser, 'http://localhost:4173');

    // 3. Generate documentation and gallery
    generateDocumentation();

    console.log('\n✨ ¡Proceso completado con éxito!');
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
