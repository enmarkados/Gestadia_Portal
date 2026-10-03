const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const BRAND_DIR = path.join(ROOT_DIR, 'assets/brand');
const HANDOFF_BRAND_DIR = path.join(ROOT_DIR, 'RECURSOS/DISEÑO/GESTADIA-handoff-diseno/assets/brand');

[BRAND_DIR, HANDOFF_BRAND_DIR].forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

// 1. High-fidelity SVGs with embedded Google Font and optimized viewBox
const logoDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 84">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&amp;display=swap');
      .brand-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 64px;
        font-weight: 800;
        letter-spacing: -1.5px;
        fill: #FFFFFF;
      }
      .brand-dot {
        fill: #C0392B;
      }
    </style>
  </defs>
  <text x="4" y="62" class="brand-title">gestadia<tspan class="brand-dot">.</tspan></text>
</svg>`;

const logoLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 84">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&amp;display=swap');
      .brand-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 64px;
        font-weight: 800;
        letter-spacing: -1.5px;
        fill: #2C2C2C;
      }
      .brand-dot {
        fill: #C0392B;
      }
    </style>
  </defs>
  <text x="4" y="62" class="brand-title">gestadia<tspan class="brand-dot">.</tspan></text>
</svg>`;

const logoTaglineDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 110">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&amp;display=swap');
      .brand-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 62px;
        font-weight: 800;
        letter-spacing: -1.5px;
        fill: #FFFFFF;
      }
      .brand-dot {
        fill: #C0392B;
      }
      .brand-tagline {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13.5px;
        font-weight: 700;
        letter-spacing: 3.5px;
        fill: #9CA3AF;
        text-transform: uppercase;
      }
    </style>
  </defs>
  <text x="4" y="60" class="brand-title">gestadia<tspan class="brand-dot">.</tspan></text>
  <text x="6" y="94" class="brand-tagline">TRÁMITES DGT ONLINE</text>
</svg>`;

const logoTaglineLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 110">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&amp;display=swap');
      .brand-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 62px;
        font-weight: 800;
        letter-spacing: -1.5px;
        fill: #2C2C2C;
      }
      .brand-dot {
        fill: #C0392B;
      }
      .brand-tagline {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13.5px;
        font-weight: 700;
        letter-spacing: 3.5px;
        fill: #6B7280;
        text-transform: uppercase;
      }
    </style>
  </defs>
  <text x="4" y="60" class="brand-title">gestadia<tspan class="brand-dot">.</tspan></text>
  <text x="6" y="94" class="brand-tagline">TRÁMITES DGT ONLINE</text>
</svg>`;

const appIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&amp;display=swap');
      .icon-g {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 340px;
        font-weight: 800;
        fill: #FFFFFF;
      }
    </style>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#363636"/>
      <stop offset="100%" stop-color="#1F1F1F"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#bgGrad)"/>
  <rect x="2" y="2" width="508" height="508" rx="114" fill="none" stroke="#4B5563" stroke-width="3" stroke-opacity="0.6"/>
  <g filter="url(#shadow)">
    <text x="110" y="360" class="icon-g">g</text>
    <circle cx="365" cy="336" r="42" fill="#C0392B"/>
  </g>
</svg>`;

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&amp;display=swap');
      .fav-g {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 46px;
        font-weight: 800;
        fill: #FFFFFF;
      }
    </style>
  </defs>
  <rect width="64" height="64" rx="16" fill="#2C2C2C"/>
  <text x="12" y="47" class="fav-g">g</text>
  <circle cx="48" cy="44" r="6" fill="#C0392B"/>
</svg>`;

// Write SVGs to both directories
[BRAND_DIR, HANDOFF_BRAND_DIR].forEach((dir) => {
  fs.writeFileSync(path.join(dir, 'logo-dark.svg'), logoDarkSvg);
  fs.writeFileSync(path.join(dir, 'logo-light.svg'), logoLightSvg);
  fs.writeFileSync(path.join(dir, 'logo-with-tagline-dark.svg'), logoTaglineDarkSvg);
  fs.writeFileSync(path.join(dir, 'logo-with-tagline-light.svg'), logoTaglineLightSvg);
  fs.writeFileSync(path.join(dir, 'app-icon.svg'), appIconSvg);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), faviconSvg);
});

async function renderPngs() {
  console.log('🎨 Renderizando PNGs oficiales con Playfair Display 800 Bold...');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });

  const page = await browser.newPage();

  async function renderHtmlToPng(html, width, height, filename) {
    await page.setViewportSize({ width, height });
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { width: 100vw; height: 100vh; background: transparent; display: flex; align-items: center; justify-content: center; }
      </style>
    </head><body>${html}</body></html>`);

    // Ensure Playfair Display is fully loaded before taking screenshot
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await page.waitForTimeout(100);

    const outPath1 = path.join(BRAND_DIR, filename);
    const outPath2 = path.join(HANDOFF_BRAND_DIR, filename);
    await page.screenshot({ path: outPath1, omitBackground: true });
    fs.copyFileSync(outPath1, outPath2);
    console.log(`  ✓ Generado: ${filename}`);
  }

  // 1. Logo Dark PNG (White on transparent)
  await renderHtmlToPng(
    `<div style="font-family:'Playfair Display',Georgia,serif; font-size:180px; font-weight:800; color:#FFFFFF; letter-spacing:-4px; white-space:nowrap;">
      gestadia<span style="color:#C0392B;">.</span>
    </div>`,
    1200, 320, 'logo-dark.png'
  );

  // 2. Logo Light PNG (Graphite on transparent)
  await renderHtmlToPng(
    `<div style="font-family:'Playfair Display',Georgia,serif; font-size:180px; font-weight:800; color:#2C2C2C; letter-spacing:-4px; white-space:nowrap;">
      gestadia<span style="color:#C0392B;">.</span>
    </div>`,
    1200, 320, 'logo-light.png'
  );

  // 3. Logo With Tagline Dark PNG
  await renderHtmlToPng(
    `<div style="display:flex; flex-direction:column; align-items:flex-start;">
      <div style="font-family:'Playfair Display',Georgia,serif; font-size:160px; font-weight:800; color:#FFFFFF; letter-spacing:-4px; line-height:0.95;">
        gestadia<span style="color:#C0392B;">.</span>
      </div>
      <div style="font-family:-apple-system,sans-serif; font-size:34px; font-weight:700; color:#9CA3AF; letter-spacing:9px; text-transform:uppercase; margin-top:20px; padding-left:6px;">
        TRÁMITES DGT ONLINE
      </div>
    </div>`,
    1200, 380, 'logo-with-tagline-dark.png'
  );

  // 4. Logo With Tagline Light PNG
  await renderHtmlToPng(
    `<div style="display:flex; flex-direction:column; align-items:flex-start;">
      <div style="font-family:'Playfair Display',Georgia,serif; font-size:160px; font-weight:800; color:#2C2C2C; letter-spacing:-4px; line-height:0.95;">
        gestadia<span style="color:#C0392B;">.</span>
      </div>
      <div style="font-family:-apple-system,sans-serif; font-size:34px; font-weight:700; color:#6B7280; letter-spacing:9px; text-transform:uppercase; margin-top:20px; padding-left:6px;">
        TRÁMITES DGT ONLINE
      </div>
    </div>`,
    1200, 380, 'logo-with-tagline-light.png'
  );

  // 5. App Icon 512
  await renderHtmlToPng(
    `<div style="width:512px; height:512px; border-radius:116px; background:linear-gradient(135deg, #363636, #1F1F1F); border:3px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; box-shadow:0 20px 40px rgba(0,0,0,0.5); position:relative;">
      <span style="font-family:'Playfair Display',Georgia,serif; font-size:340px; font-weight:800; color:#FFFFFF; line-height:1; transform:translateY(-8px);">g</span>
      <div style="width:42px; height:42px; border-radius:50%; background:#C0392B; position:absolute; bottom:144px; right:110px;"></div>
    </div>`,
    512, 512, 'app-icon-512.png'
  );

  // 6. App Icon 192
  await renderHtmlToPng(
    `<div style="width:192px; height:192px; border-radius:44px; background:linear-gradient(135deg, #363636, #1F1F1F); border:2px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; position:relative;">
      <span style="font-family:'Playfair Display',Georgia,serif; font-size:128px; font-weight:800; color:#FFFFFF; line-height:1; transform:translateY(-3px);">g</span>
      <div style="width:16px; height:16px; border-radius:50%; background:#C0392B; position:absolute; bottom:54px; right:42px;"></div>
    </div>`,
    192, 192, 'app-icon-192.png'
  );

  // 7. Favicon 32x32
  await renderHtmlToPng(
    `<div style="width:32px; height:32px; border-radius:8px; background:#2C2C2C; display:flex; align-items:center; justify-content:center; position:relative;">
      <span style="font-family:'Playfair Display',Georgia,serif; font-size:22px; font-weight:800; color:#FFFFFF; line-height:1; transform:translateY(-1px);">g</span>
      <div style="width:3px; height:3px; border-radius:50%; background:#C0392B; position:absolute; bottom:9px; right:7px;"></div>
    </div>`,
    32, 32, 'favicon-32x32.png'
  );

  // 8. OpenGraph Social Card (1200x630)
  await renderHtmlToPng(
    `<div style="width:1200px; height:630px; background:#2C2C2C; padding:70px 90px; display:flex; flex-direction:column; justify-content:space-between; border-bottom:8px solid #C0392B;">
      <div>
        <div style="font-family:'Playfair Display',Georgia,serif; font-size:80px; font-weight:800; color:#FFFFFF; letter-spacing:-2px;">
          gestadia<span style="color:#C0392B;">.</span>
        </div>
        <div style="font-family:-apple-system,sans-serif; font-size:22px; font-weight:700; color:#9CA3AF; letter-spacing:4px; text-transform:uppercase; margin-top:8px;">
          TRÁMITES DGT ONLINE Y ASESORÍA COLEGIADA
        </div>
      </div>
      <div>
        <div style="font-family:'Playfair Display',Georgia,serif; font-size:48px; font-weight:800; color:#FFFFFF; line-height:1.2; margin-bottom:16px;">
          Gestiona tu Canje, Transferencia y Duplicados DGT 100% online y sin cita previa
        </div>
        <div style="display:flex; gap:24px; align-items:center;">
          <span style="background:rgba(255,255,255,0.1); color:#FFFFFF; padding:8px 18px; border-radius:20px; font-size:16px; font-weight:600;">✓ Justificante Provisional Inmediato</span>
          <span style="background:rgba(255,255,255,0.1); color:#FFFFFF; padding:8px 18px; border-radius:20px; font-size:16px; font-weight:600;">✓ Gestor Administrativo Colegiado</span>
          <span style="background:rgba(255,255,255,0.1); color:#FFFFFF; padding:8px 18px; border-radius:20px; font-size:16px; font-weight:600;">✓ Asistencia WhatsApp 24/7</span>
        </div>
      </div>
    </div>`,
    1200, 630, 'og-social-card-1200x630.png'
  );

  await browser.close();
  console.log('✅ Todos los assets de marca regenerados con éxito.');
}

renderPngs().catch(console.error);
