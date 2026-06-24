// Sube los archivos del portal Gestadia al servidor FTP
// Uso: node ftp-deploy.js
// Variables leídas desde .env

require('dotenv').config();
const ftp = require('basic-ftp');
const fs  = require('fs');
const path = require('path');

const ROOT = __dirname;

// Archivos y carpetas a subir (relativo a ROOT)
const INCLUDE = [
  'preview-home.html',
  'preview-tramites.html',
  'preview-contacto.html',
  'preview-aviso-legal.html',
  'preview-privacidad.html',
  'preview-pagos-devoluciones.html',
  'preview-proteccion-datos.html',
  'preview-cookies.html',
  'preview-canje.html',
  'preview-baja-vehiculo.html',
  'preview-transferencia.html',
  'preview-duplicado-carnet.html',
  'preview-duplicado-datos.html',
  'preview-duplicado-circulacion.html',
  'preview-cancelacion-dominio.html',
  'preview-permiso-internacional.html',
  'server.js',
  'package.json',
  'package-lock.json',
];

const SKIP = (process.env.FTP_SKIP_PATHS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

const RETRIES = parseInt(process.env.FTP_UPLOAD_RETRIES || '4', 10);

async function uploadFile(client, localPath, remotePath, retries) {
  for (let i = 1; i <= retries; i++) {
    try {
      await client.uploadFrom(localPath, remotePath);
      return;
    } catch (err) {
      if (i === retries) throw err;
      console.warn(`  ↺ reintento ${i}/${retries}: ${remotePath}`);
    }
  }
}

async function deploy() {
  const host    = process.env.FTP_HOST;
  const user    = process.env.FTP_USER;
  const pass    = process.env.FTP_PASS;
  const port    = parseInt(process.env.FTP_PORT || '21', 10);
  const secure  = process.env.FTP_SECURE === 'true';
  const remoteDir = process.env.FTP_REMOTE_DIR || '/';

  if (!host || !user || !pass) {
    console.error('❌ Faltan FTP_HOST, FTP_USER o FTP_PASS en .env');
    process.exit(1);
  }

  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    console.log(`\n🚀 Conectando a ${host}:${port}…`);
    await client.access({
      host, user, password: pass, port, secure,
      secureOptions: {
        rejectUnauthorized: process.env.FTP_SECURE_REJECT_UNAUTHORIZED !== 'false',
      },
    });

    if (process.env.FTP_FORCE_PASSIVE_IPV4 === 'true') {
      client.ftp.socket.setKeepAlive(true);
    }

    await client.ensureDir(remoteDir);
    console.log(`📂 Directorio remoto: ${remoteDir}\n`);

    let ok = 0, skipped = 0;
    for (const file of INCLUDE) {
      if (SKIP.includes(file)) { skipped++; continue; }
      const localPath = path.join(ROOT, file);
      if (!fs.existsSync(localPath)) {
        console.warn(`  ⚠ No encontrado localmente: ${file}`);
        continue;
      }
      const remotePath = path.posix.join(remoteDir, file);
      process.stdout.write(`  ↑ ${file} … `);
      await uploadFile(client, localPath, remotePath, RETRIES);
      console.log('✓');
      ok++;
    }

    console.log(`\n✅ Deploy completado: ${ok} archivo(s) subido(s), ${skipped} omitido(s).`);
  } catch (err) {
    console.error('\n❌ Error durante el deploy:', err.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
