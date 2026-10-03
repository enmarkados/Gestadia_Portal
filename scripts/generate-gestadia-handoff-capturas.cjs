const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const HANDOFF_DIR = path.join(ROOT_DIR, 'RECURSOS/DISEÑO/GESTADIA-handoff-diseno');
const CAPTURAS_DIR = path.join(HANDOFF_DIR, 'capturas');
const CORREO_DIR = path.join(HANDOFF_DIR, 'correo');

const VIEWPORTS = {
  iphone: { width: 430, height: 932, dir: 'iphone' },
  android: { width: 432, height: 768, dir: 'android' },
  ipad: { width: 1024, height: 1366, dir: 'ipad' },
  'tablet-7': { width: 720, height: 1280, dir: 'tablet-7' },
  'tablet-10': { width: 900, height: 1600, dir: 'tablet-10' }
};

const SCREENS = [
  { id: '01-inicio', filename: '01-inicio.jpg' },
  { id: '02-nueva-consulta', filename: '02-nueva-consulta.jpg' },
  { id: '05-mensajes', filename: '05-mensajes.jpg' },
  { id: '08-contratar', filename: '08-servicios.jpg' },
  { id: '03-mis-tramites', filename: '03-mis-tramites.jpg' },
  { id: '04-chat-gestor', filename: '04-chat-gestor.jpg' },
  { id: '07-verificacion-datos', filename: '07-verificacion-datos.jpg' },
  { id: '06-contacto', filename: '06-contacto-gestor.jpg' }
];

// Ensure output directories exist
Object.values(VIEWPORTS).forEach((vp) => {
  const dirPath = path.join(CAPTURAS_DIR, vp.dir);
  fs.mkdirSync(dirPath, { recursive: true });
  // Remove deprecated notification screenshots
  const oldNotifPath = path.join(dirPath, '05-notificaciones.jpg');
  if (fs.existsSync(oldNotifPath)) {
    try { fs.unlinkSync(oldNotifPath); } catch {}
  }
});

// Simple static server
const mimeTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

function startServer(port = 4571) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      if (urlPath === '/') urlPath = '/index.html';
      const filePath = path.join(HANDOFF_DIR, urlPath);
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'text/plain';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
    server.listen(port, () => resolve(server));
  });
}

const INJECTED_CSS = `
  body, html {
    margin: 0 !important;
    padding: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    overflow: hidden !important;
    background: #181818 !important;
  }
  .preview-sidebar, .preview-main-header, .showcase-header, .controls-panel, #phoneNotch {
    display: none !important;
  }
  .preview-container, .showcase-main {
    display: block !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
  }
  .preview-main {
    padding: 0 !important;
    margin: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    display: block !important;
  }
  .phone-mockup {
    width: 100vw !important;
    height: 100vh !important;
    max-width: none !important;
    max-height: none !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    background: #F7F7F7 !important;
  }
  .phone-status-bar {
    height: 44px !important;
    background: #181818 !important;
    color: #FFFFFF !important;
    flex-shrink: 0 !important;
    display: flex !important;
  }
  .status-time, .status-icons {
    color: #FFFFFF !important;
  }
  .screen-viewport {
    flex: 1 !important;
    height: calc(100vh - 44px) !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
  }
`;

async function run() {
  console.log('🚀 Iniciando servidor y Playwright...');
  const server = await startServer(4571);
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });

  try {
    for (const [vpKey, vp] of Object.entries(VIEWPORTS)) {
      console.log(`\n📸 Capturando resolución: ${vpKey} (${vp.width}×${vp.height} px)...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2
      });
      const page = await context.newPage();

      for (const screen of SCREENS) {
        await page.goto('http://localhost:4571/index.html', { waitUntil: 'networkidle' });
        await page.addStyleTag({ content: INJECTED_CSS });
        await page.evaluate((id) => {
          loadScreen(id);
        }, screen.id);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(150);

        const outPath = path.join(CAPTURAS_DIR, vp.dir, screen.filename);
        await page.screenshot({ path: outPath, type: 'jpeg', quality: 90 });
        console.log(`  ✓ Guardado: capturas/${vp.dir}/${screen.filename}`);
      }

      await context.close();
    }

    // Capturas del correo (mobile y desktop)
    console.log('\n📧 Capturando plantillas de correo transaccional...');
    const mailContextMobile = await browser.newContext({
      viewport: { width: 414, height: 750 },
      deviceScaleFactor: 2
    });
    const pageMailMobile = await mailContextMobile.newPage();
    await pageMailMobile.goto('http://localhost:4571/correo/verificacion.html', { waitUntil: 'networkidle' });
    await pageMailMobile.evaluate(() => document.fonts.ready);
    await pageMailMobile.screenshot({
      path: path.join(CORREO_DIR, 'alta-mobile.jpg'),
      type: 'jpeg',
      quality: 90,
      fullPage: true
    });
    console.log('  ✓ Guardado: correo/alta-mobile.jpg');
    await mailContextMobile.close();

    const mailContextDesktop = await browser.newContext({
      viewport: { width: 1200, height: 850 },
      deviceScaleFactor: 2
    });
    const pageMailDesktop = await mailContextDesktop.newPage();
    await pageMailDesktop.goto('http://localhost:4571/correo/verificacion.html', { waitUntil: 'networkidle' });
    await pageMailDesktop.evaluate(() => document.fonts.ready);
    await pageMailDesktop.screenshot({
      path: path.join(CORREO_DIR, 'alta-desktop.jpg'),
      type: 'jpeg',
      quality: 90,
      fullPage: true
    });
    console.log('  ✓ Guardado: correo/alta-desktop.jpg');
    await mailContextDesktop.close();

    console.log('\n✅ Todas las capturas generadas exitosamente con fidelidad pixel-perfect.');
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error('Error generando capturas:', err);
  process.exit(1);
});
