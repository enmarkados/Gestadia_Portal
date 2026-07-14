// Sube el backend fusionado y el build de React al servidor FTP
// Uso: node ftp-deploy.cjs
require('dotenv').config();
const ftp = require('basic-ftp');
const fs  = require('fs');
const path = require('path');

const ROOT = __dirname;

const EXCLUDE_DIRS = new Set(['node_modules', 'uploads', '.git']);

function collectFiles(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(full, base));
    else out.push(path.relative(base, full));
  }
  return out;
}

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
    { local: path.join(ROOT, 'frontend', 'dist'), remote: 'frontend/dist' },
  ].filter((t) => fs.existsSync(t.local));

  try {
    console.log(`\n🚀 Conectando a ${host}:${port}…`);
    await client.access({ host, user, password: pass, port, secure, secureOptions: { rejectUnauthorized: process.env.FTP_SECURE_REJECT_UNAUTHORIZED !== 'false' } });
    await client.ensureDir(remoteDir);

    let ok = 0;
    for (const { local, remote } of targets) {
      for (const rel of collectFiles(local)) {
        const localPath = path.join(local, rel);
        const remotePath = path.posix.join(remoteDir, remote, rel.split(path.sep).join('/'));
        process.stdout.write(`  ↑ ${remote}/${rel} … `);
        await uploadFile(client, localPath, remotePath, RETRIES);
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
