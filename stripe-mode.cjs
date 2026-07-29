// Conmuta el modo de Stripe del SERVIDOR sin tocar claves ni desplegar código.
//
//   node stripe-mode.cjs          → muestra el modo actual
//   node stripe-mode.cjs dev      → claves de PRUEBA (tarjeta 4242…, no cobra)
//   node stripe-mode.cjs pro      → claves REALES (cobros de verdad)
//
// Edita STRIPE_MODE en el .env del servidor por FTP y reinicia Passenger
// (tocando backend/tmp/restart.txt). Las credenciales FTP salen del .env de
// la raíz. No imprime secretos.
//
// ⚠️ Mientras el modo sea `dev`, los clientes reales NO pueden pagar:
//    ventanas de prueba cortas y avisadas.
require('dotenv').config();
const fs = require('fs');
const ftp = require('basic-ftp');

const modo = (process.argv[2] || '').toLowerCase();
if (modo && !['dev', 'pro'].includes(modo)) {
  console.error('Uso: node stripe-mode.cjs [dev|pro]   (sin argumento: consulta el modo actual)');
  process.exit(1);
}

(async () => {
  const client = new ftp.Client();
  await client.access({
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASS,
    port: parseInt(process.env.FTP_PORT || '21', 10),
    secure: process.env.FTP_SECURE === 'true',
    secureOptions: { rejectUnauthorized: process.env.FTP_SECURE_REJECT_UNAUTHORIZED !== 'false' },
  });

  const tmp = 'tmp-server-env.txt';
  await client.downloadTo(tmp, '/backend/.env');
  const env = fs.readFileSync(tmp, 'utf8');
  const actual = (env.match(/^STRIPE_MODE=(.*)$/m) || [])[1];

  if (!actual) {
    console.error('El .env del servidor no tiene STRIPE_MODE — revisar antes de conmutar.');
    fs.unlinkSync(tmp);
    process.exit(1);
  }

  if (!modo) {
    console.log(`STRIPE_MODE actual en el servidor: ${actual}`);
    fs.unlinkSync(tmp);
    client.close();
    return;
  }

  if (actual === modo) {
    console.log(`Ya estaba en "${modo}": no se toca nada.`);
    fs.unlinkSync(tmp);
    client.close();
    return;
  }

  // No conmutar a un modo cuyas claves no estén configuradas: dejaría el
  // checkout en modo demo (pagos simulados) sin que nadie se entere.
  const clave = (env.match(new RegExp(`^STRIPE_SECRET_KEY_${modo.toUpperCase()}=(.+)$`, 'm')) || [])[1];
  if (!clave) {
    console.error(`El servidor no tiene STRIPE_SECRET_KEY_${modo.toUpperCase()} — abortando.`);
    fs.unlinkSync(tmp);
    process.exit(1);
  }

  fs.writeFileSync(tmp, env.replace(/^STRIPE_MODE=.*$/m, `STRIPE_MODE=${modo}`));
  await client.uploadFrom(tmp, '/backend/.env');
  console.log(`✓ STRIPE_MODE: ${actual} → ${modo} (clave ${clave.slice(0, 8)}…)`);

  const marca = 'tmp-restart-marker.txt';
  fs.writeFileSync(marca, String(Date.now()));
  await client.uploadFrom(marca, '/backend/tmp/restart.txt');
  fs.unlinkSync(tmp);
  fs.unlinkSync(marca);
  console.log('✓ Passenger reiniciando (aplica también el código que estuviera desplegado)');
  console.log(modo === 'dev'
    ? '\n⚠️  VENTANA DE PRUEBAS ABIERTA: los clientes reales NO pueden pagar hasta volver a "pro".'
    : '\n✓ Cobros reales activos.');
  client.close();
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
