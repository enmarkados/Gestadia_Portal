import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

test('la imagen APP selecciona por defecto el proxy del backend común', () => {
  assert.match(readFileSync(new URL('./Dockerfile', import.meta.url), 'utf8'), /^ARG APP_PROXY_TEMPLATE=common\.conf\.template$/m);
});
const image = process.env.GESTADIA_MANAGER_TEST_IMAGE;
test('el proxy real admite contacto y conserva autenticación y bloqueo de rutas privadas', { skip: !image }, async () => {
  const prefix = 'gestadia-manager-test-' + randomUUID().slice(0, 8);
  const docker = args => {
    const r = spawnSync('docker', args, { encoding: 'utf8', timeout: 60000 });
    assert.equal(r.status, 0, r.stderr); return r.stdout.trim();
  };
  assert.match(docker(['context', 'inspect', '--format', '{{.Endpoints.docker.Host}}']), /^unix:\/\//, 'sólo Docker local');
  const network = prefix + '-net', backend = prefix + '-backend', app = prefix + '-app';
  try {
    docker(['network', 'create', network]);
    const server = `require('http').createServer((req,res)=>{res.setHeader('content-type','application/json');res.statusCode=req.url.endsWith('/chat')?401:200;res.end(JSON.stringify({from:'local-fixture',path:req.url,method:req.method,error:req.url.endsWith('/chat')?'session_expired':undefined,kind:'call'}));}).listen(3001,'0.0.0.0')`;
    docker(['run', '-d', '--name', backend, '--network', network, 'node:22-alpine', 'node', '-e', server]);
    docker(['run', '-d', '--name', app, '--network', network, '-p', '127.0.0.1::8080', '-e', `PORTAL_UPSTREAM=http://${backend}:3001`, '-e', 'PORTAL_HOST=app.gestadia.com', image]);
    const base = 'http://' + docker(['port', app, '8080/tcp']);
    for (let n=0;n<40;n++) {
      try { if ((await fetch(base+'/healthz')).status===200) break; } catch {}
      await new Promise(r=>setTimeout(r,100));
    }
    for (const [path,method,status] of [['context','GET',200],['chat','POST',401],['callback','POST',200]]) {
      const response=await fetch(`${base}/api/app/contact/${path}`,{method,headers:{'content-type':'application/json'},...(method==='POST'?{body:'{}'}:{})});
      assert.equal(response.status,status,path);
      assert.deepEqual(await response.json(),{from:'local-fixture',path:`/api/app/contact/${path}`,method,...(path==='chat'?{error:'session_expired'}:{}),kind:'call'});
    }
    for (const path of ['/api/app/contact/admin','/api/app/contact/context/','/api/app/guest/context','/api/health','/webhooks/test','/uploads/a']) assert.equal((await fetch(base+path)).status,404,path);
    assert.equal((await fetch(base+'/lidia/api/health')).status,503);
    assert.equal((await fetch(base+'/lidia/conversacion')).status,200);
  } finally {
    for (const name of [app,backend]) spawnSync('docker',['rm','-f',name],{encoding:'utf8'});
    spawnSync('docker',['network','rm',network],{encoding:'utf8'});
  }
});
