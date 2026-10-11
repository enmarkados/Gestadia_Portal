import { test } from 'node:test';
import assert from 'node:assert/strict';
const app=process.env.GESTADIA_ASSETS_APP_URL || 'http://127.0.0.1:18911';
const portal=process.env.GESTADIA_ASSETS_PORTAL_URL || 'http://127.0.0.1:18912';
for(const url of [app,portal])if(new URL(url).hostname!=='127.0.0.1')throw Error('Solo preview local');
test('entradas directas de APP y Portal sirven scripts, estilos e imagen de arranque',async()=>{
  for(const [base,route] of [[app,'/legal/delete-account'],[app,'/lidia/conversacion'],[portal,'/portal/acceso'],[portal,'/privacidad']]) {
    const url=base+route;const response=await fetch(url);assert.equal(response.status,200);
    const html=await response.text();
    const resources=[...html.matchAll(/<(?:script|img)\b[^>]*\bsrc="([^"]+)"/g)].map(x=>x[1]);
    resources.push(...[...html.matchAll(/<link\b(?=[^>]*rel="stylesheet")[^>]*href="([^"]+)"/g)].map(x=>x[1]));
    assert.ok(resources.length>0);
    for(const resource of resources){
      const result=await fetch(new URL(resource,url));assert.equal(result.status,200,`${route}: ${resource}`);
      assert.doesNotMatch(result.headers.get('content-type')||'',/text\/html/,`${route}: recurso ${resource} devuelto como fallback HTML`);
    }
  }
});
