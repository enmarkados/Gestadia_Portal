// Conmuta el entorno de LidIA (URL de callback + secreto HMAC + API key) con
// las comprobaciones que aprendimos a base de fallos:
//
//   1. El endpoint destino debe responder 401 a un POST sin firma. Un 404
//      significa que la ruta no está montada: conmutar dejaría los eventos
//      reintentando contra el vacío.
//   2. El secreto se valida ANTES de tocar nada, firmando un checkout.opened
//      huérfano (LidIA lo descarta en silencio; nunca un payment.succeeded,
//      que les dispara alerta de cobro sin correlación).
//   3. Solo si ambas pasan se escribe el .env del servidor y se reinicia.
//   4. Tras reiniciar se comprueba que el portal sigue sano.
//
// Uso (desde la raíz):
//   node lidia-conmutar-entorno.cjs <base-url> <secreto-hmac> [api-key] [--solo-verificar]
//
// Ejemplo:
//   node lidia-conmutar-entorno.cjs https://lidia.gestadia.com abc123… f2dcb…
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const ftp = require('basic-ftp');

const [baseUrl, secreto, apiKey] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const soloVerificar = process.argv.includes('--solo-verificar');
const RUTA = '/api/integrations/gestadia-portal/payment-events';

if (!baseUrl || !secreto) {
  console.error('Uso: node lidia-conmutar-entorno.cjs <base-url> <secreto-hmac> [api-key] [--solo-verificar]');
  process.exit(1);
}
const keyVersion = (fs.readFileSync('backend/.env', 'utf8').match(/^LIDIA_CALLBACK_KEY_VERSION=(.*)$/m) || [])[1] || 'v1';

async function comprobarRutaMontada() {
  const res = await fetch(baseUrl + RUTA, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  }).catch((e) => ({ status: 0, err: e.message }));
  const ok = res.status === 401;
  console.log(`1) Ruta montada: POST sin firma → ${res.status || 'sin respuesta'} ${ok ? '✓' : '✗ (se espera 401)'}`);
  return ok;
}

async function comprobarSecreto() {
  const body = JSON.stringify({
    schema_version: '1.0',
    event_id: 'evt_probe_' + crypto.randomBytes(6).toString('base64url'),
    event_type: 'checkout.opened',
    occurred_at: new Date().toISOString(),
    emitted_at: new Date().toISOString(),
    checkout_intent_id: 'gci_probe_conmutacion',
    lidia_payment_id: crypto.randomUUID(),
    lidia_payment_attempt_id: crypto.randomUUID(),
    lidia_session_id: null,
  });
  const ts = Math.floor(Date.now() / 1000);
  const firma = `${keyVersion}=` + crypto.createHmac('sha256', secreto).update(`${ts}.${body}`).digest('hex');
  const res = await fetch(baseUrl + RUTA, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Gestadia-Key-Id': keyVersion,
      'X-Gestadia-Timestamp': String(ts),
      'X-Gestadia-Signature': firma,
    },
    body,
  }).catch((e) => ({ status: 0, err: e.message }));
  const ok = res.status >= 200 && res.status < 300;
  console.log(`2) Secreto HMAC: evento de prueba firmado → ${res.status || 'sin respuesta'} ${ok ? '✓' : '✗ (401 = el secreto no coincide)'}`);
  return ok;
}

(async () => {
  console.log(`Destino: ${baseUrl}${RUTA}\n`);
  const rutaOk = await comprobarRutaMontada();
  const secretoOk = rutaOk ? await comprobarSecreto() : false;

  if (!rutaOk || !secretoOk) {
    console.error('\n✗ NO SE CONMUTA. Corrige lo anterior y repite.');
    process.exit(1);
  }
  if (soloVerificar) {
    console.log('\n✓ Verificación correcta (--solo-verificar: no se ha tocado nada).');
    process.exit(0);
  }

  const client = new ftp.Client();
  await client.access({
    host: process.env.FTP_HOST, user: process.env.FTP_USER, password: process.env.FTP_PASS,
    port: parseInt(process.env.FTP_PORT || '21', 10), secure: process.env.FTP_SECURE === 'true',
    secureOptions: { rejectUnauthorized: process.env.FTP_SECURE_REJECT_UNAUTHORIZED !== 'false' },
  });
  const tmp = 'tmp-srv.txt';
  await client.downloadTo(tmp, '/backend/.env');
  let env = fs.readFileSync(tmp, 'utf8');
  const set = (k, v) => { env = env.replace(new RegExp(`^${k}=.*$`, 'm'), `${k}=${v}`); };
  set('LIDIA_CALLBACK_BASE_URL', baseUrl);
  set('LIDIA_CALLBACK_SECRET', secreto);
  if (apiKey) set('LIDIA_API_KEY', apiKey);
  fs.writeFileSync(tmp, env);
  await client.uploadFrom(tmp, '/backend/.env');
  fs.writeFileSync('tmp-mark.txt', String(Date.now()));
  await client.uploadFrom('tmp-mark.txt', '/backend/tmp/restart.txt');
  fs.unlinkSync(tmp); fs.unlinkSync('tmp-mark.txt');
  client.close();
  console.log(`\n3) .env del servidor actualizado (URL, secreto${apiKey ? ', api key' : ''}) y Passenger reiniciando…`);

  await new Promise((r) => setTimeout(r, 15000));
  const h = await fetch('https://gestadia.com/api/health').catch(() => ({ status: 0 }));
  console.log(`4) Portal tras reiniciar: /api/health → ${h.status} ${h.status === 200 ? '✓' : '✗'}`);
  console.log('\n✓ Conmutado. Haz una prueba real (crear intent + abrirlo) y comprueba que el evento se entrega.');
  process.exit(h.status === 200 ? 0 : 1);
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
