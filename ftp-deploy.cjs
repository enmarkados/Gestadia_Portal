// Sube el backend fusionado y el build de React al servidor FTP
// Uso: node ftp-deploy.cjs
require('dotenv').config();
const ftp = require('basic-ftp');
const fs  = require('fs');
const path = require('path');

const ROOT = __dirname;

const EXCLUDE_DIRS = new Set(['node_modules', 'uploads', '.git']);

// Nunca subir ficheros .env: contienen secretos y el .env local está en
// modo DEMO (pagos simulados). La config de producción se pone en el servidor
// (fichero .env del server o variables de entorno del panel Node.js de Plesk).
const isEnvFile = (name) => /^\.env(\.|$)/.test(name);

function collectFiles(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    if (!entry.isDirectory() && isEnvFile(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(full, base));
    else out.push(path.relative(base, full));
  }
  return out;
}

const RETRIES = parseInt(process.env.FTP_UPLOAD_RETRIES || '4', 10);

// Cache de directorios remotos ya creados. basic-ftp NO crea las carpetas
// padre al subir un fichero: un STOR a un directorio inexistente hace que el
// servidor corte la conexión de datos (ECONNRESET). ensureDir usa MKD (canal
// de control, sin transferencia de datos), así que crea las carpetas primero.
const ensuredDirs = new Set();

async function ensureRemoteDir(client, remoteDir) {
  if (ensuredDirs.has(remoteDir)) return;
  await client.ensureDir(remoteDir); // crea remoteDir + intermedios; deja el CWD ahí
  ensuredDirs.add(remoteDir);
}

async function uploadFile(client, localPath, remotePath, retries, accessOptions) {
  const remoteDir = path.posix.dirname(remotePath);
  for (let i = 1; i <= retries; i++) {
    try {
      if (client.closed) {            // una ECONNRESET previa deja el cliente cerrado
        ensuredDirs.clear();
        await client.access(accessOptions);
      }
      await ensureRemoteDir(client, remoteDir);
      await client.uploadFrom(localPath, remotePath); // ruta absoluta → independiente del CWD
      return;
    } catch (err) {
      ensuredDirs.delete(remoteDir); // en el reintento, re-crear también el directorio
      if (i === retries) throw err;
      console.warn(`  ↺ reintento ${i}/${retries}: ${remotePath} (${err.message})`);
      await new Promise((r) => setTimeout(r, 800 * i)); // backoff
    }
  }
}

async function deploy() {
  const host = process.env.FTP_HOST;
  const user = process.env.FTP_USER;
  const pass = process.env.FTP_PASS;
  const port = parseInt(process.env.FTP_PORT || '21', 10);
  const secure = process.env.FTP_SECURE === 'true';
  const remoteDir = process.env.FTP_REMOTE_DIR || '/';

  if (!host || !user || !pass) {
    console.error('❌ Faltan FTP_HOST, FTP_USER o FTP_PASS en .env');
    process.exit(1);
  }

  const client = new ftp.Client();
  client.ftp.verbose = false;

  const targets = [
    { local: path.join(ROOT, 'backend'), remote: 'backend' },
    { local: path.join(ROOT, 'shared'), remote: 'shared' },
    { local: path.join(ROOT, 'frontend', 'dist'), remote: 'frontend/dist' },
  ].filter((t) => fs.existsSync(t.local));

  try {
    console.log(`\n🚀 Conectando a ${host}:${port}…`);
    const accessOptions = { host, user, password: pass, port, secure, secureOptions: { rejectUnauthorized: process.env.FTP_SECURE_REJECT_UNAUTHORIZED !== 'false' } };
    await client.access(accessOptions);
    await client.ensureDir(remoteDir);

    let ok = 0;
    for (const { local, remote } of targets) {
      for (const rel of collectFiles(local)) {
        const localPath = path.join(local, rel);
        const remotePath = path.posix.join(remoteDir, remote, rel.split(path.sep).join('/'));
        process.stdout.write(`  ↑ ${remote}/${rel} … `);
        await uploadFile(client, localPath, remotePath, RETRIES, accessOptions);
        console.log('✓');
        ok++;
      }
    }
    console.log(`\n✅ Deploy completado: ${ok} archivo(s) subido(s).`);
  } catch (err) {
    console.error('\n❌ Error durante el deploy:', err.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
