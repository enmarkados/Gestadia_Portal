import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
const { app, portal, owner, other, expedienteId, documentId, uploadDir, revision } = JSON.parse(readFileSync(process.env.GESTADIA_COMMON_TEST_INPUT, 'utf8'));
for (const address of [app, portal]) {
  if (new URL(address).hostname !== '127.0.0.1') throw Error('Solo stack local efímero');
}
const authorized = token => ({ authorization: `Bearer ${token}` });
const jsonPost = async (base, path, body) => fetch(base + path, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body) });
let mobileToken, portalToken;
test('web completa y APP tienen assets separados y la misma revisión', async () => {
  const appHtml = await (await fetch(app + '/cuenta')).text();
  const portalHtml = await (await fetch(portal + '/portal/acceso')).text();
  assert.match(appHtml, /Gestadia/); assert.match(portalHtml, /Gestadia/);
  assert.notEqual(appHtml, portalHtml);
  assert.equal((await fetch(portal + '/')).status, 200);
  for (const base of [app, portal]) {
    const response = await fetch(base + '/build-info.json');
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.equal((await response.json()).revision, revision);
  }
});
test('login compartido y autorización conversacional sin JWT Portal', async () => {
  const mobile = await jsonPost(app, '/api/auth/login', {...owner,platform:'ios'});
  assert.equal(mobile.status, 200); mobileToken=(await mobile.json()).token;
  const web = await jsonPost(portal, '/api/auth/login', owner);
  assert.equal(web.status, 200); portalToken=(await web.json()).token;
  for (const base of [app,portal]) assert.equal((await fetch(base+'/api/me',{headers:authorized(mobileToken)})).status,200);
  assert.equal((await fetch(app+'/api/app/v1/conversations',{headers:authorized(mobileToken)})).status,200);
  assert.equal((await fetch(app+'/api/app/v1/conversations',{headers:authorized(portalToken)})).status,401);
});
test('configuración, capacidades y CORS de ambos sistemas conservan el contrato', async () => {
  const config = await (await fetch(app + '/app-config.json')).json();
  assert.equal(config.conversationsEnabled,true); assert.equal(config.demoOnly,false);
  const capabilities = await (await fetch(app + '/api/mobile/capabilities')).json();
  assert.equal(capabilities.mobileEnabled,true); assert.equal(capabilities.pushEnabled,true);
  for (const origin of ['capacitor://localhost','https://localhost']) {
    const response = await fetch(app + '/api/me',{method:'OPTIONS',headers:{origin,'access-control-request-method':'POST','access-control-request-headers':'authorization,content-type,idempotency-key'}});
    assert.equal(response.status,204); assert.equal(response.headers.get('access-control-allow-origin'),origin);
    assert.match(response.headers.get('access-control-allow-headers'),/idempotency-key/i);
  }
  assert.equal((await fetch(app+'/api/me',{method:'OPTIONS',headers:{origin:'https://untrusted.example.test'}})).status,403);
});
test('APP bloquea checkout, leads, webhooks e integraciones; Portal conserva rutas', async () => {
  for (const path of ['/api/checkout','/api/leads','/api/integrations/zoho','/webhooks/stripe']) {
    const response = await jsonPost(app,path,{}); assert.equal(response.status,404,path);
  }
  assert.equal((await jsonPost(portal,'/api/checkout',{})).status,400);
  assert.equal((await fetch(app+'/api/expedientes/unknown/documentos')).status,401);
  assert.equal((await fetch(app+'/lidia/api/health')).status,503);
});
test('documento previo se descarga por ambas superficies y se persiste una nueva subida', async () => {
  const path=`/api/expedientes/${expedienteId}/documentos/${documentId}`;
  for (const base of [app,portal]) {
    const response=await fetch(base+path,{headers:authorized(mobileToken)});
    assert.equal(response.status,200); assert.match(await response.text(),/fixture existente/);
  }
  const form=new FormData(); form.set('clave','otro'); form.set('fichero',new Blob(['%PDF-1.4\nfixture nuevo'],{type:'application/pdf'}),'prueba.pdf');
  const uploaded=await fetch(app+`/api/expedientes/${expedienteId}/documentos`,{method:'POST',headers:authorized(mobileToken),body:form});
  assert.equal(uploaded.status,200);const doc=(await uploaded.json()).documento;
  const response=await fetch(portal+`/api/expedientes/${expedienteId}/documentos/${doc.id}`,{headers:authorized(portalToken)});
  assert.equal(response.status,200);assert.match(await response.text(),/fixture nuevo/);
});
test('otro usuario no descarga ni escribe archivos en el expediente ajeno', async () => {
  const response=await jsonPost(app,'/api/auth/login',{...other,platform:'android'});
  const token=(await response.json()).token;
  const before=readdirSync(uploadDir).sort();
  const url=`/api/expedientes/${expedienteId}/documentos`;
  assert.equal((await fetch(app+url+`/${documentId}`,{headers:authorized(token)})).status,404);
  const form=new FormData();form.set('fichero',new Blob(['%PDF-1.4\nno autorizado'],{type:'application/pdf'}),'ajeno.pdf');
  assert.equal((await fetch(app+url,{method:'POST',headers:authorized(token),body:form})).status,404);
  assert.deepEqual(readdirSync(uploadDir).sort(),before,'un rechazo no debe dejar archivo en uploads');
});
test('logout móvil invalida API Portal y conversaciones de la misma sesión', async () => {
  const response=await fetch(app+'/api/auth/logout',{method:'POST',headers:authorized(mobileToken)});
  assert.equal(response.status,200);
  assert.equal((await fetch(portal+'/api/me',{headers:authorized(mobileToken)})).status,401);
  assert.equal((await fetch(app+'/api/app/v1/conversations',{headers:authorized(mobileToken)})).status,401);
});
