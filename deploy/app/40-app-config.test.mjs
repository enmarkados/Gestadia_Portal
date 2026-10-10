import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const image = process.env.GESTADIA_APP_TEST_IMAGE || 'gestadia-app:mobile';
const config = {
  appId:'com.gestadia.app', demoOnly:false, demoEnabled:false,
  apiBaseUrl:'https://app.gestadia.com', checkoutBaseUrl:'https://gestadia.com',
  push:{enabled:true},
  social:{google:{webClientId:'web.apps.googleusercontent.com',iosClientId:'ios.apps.googleusercontent.com'},apple:{clientId:'com.gestadia.app',androidServiceId:'com.gestadia.app.login',redirectUrl:'https://app.gestadia.com/api/auth/social/apple/callback'}},
  pluginWeb:{baseUrl:'/lidia',key:''},
};
function runConfig(value, supplied=true) {
  const dir=mkdtempSync(join(tmpdir(),'gestadia-docker-config-'));
  try {
    writeFileSync(join(dir,'public.json'),JSON.stringify(value));
    const args=['run','--rm','--mount',`type=bind,source=${dir},target=/test,readonly`];
    if(supplied)args.push('-e','APP_PUBLIC_CONFIG_FILE=/test/public.json');
    args.push(image,'sh','-ec','/docker-entrypoint.d/40-app-config.sh; jq -c . /usr/share/nginx/html/app-config.json');
    return spawnSync('docker',args,{encoding:'utf8',timeout:20000});
  }finally{rmSync(dir,{recursive:true,force:true});}
}
test('el contenedor publica los clientes reales y flags conectados completos',()=>{
  const result=runConfig(config); assert.equal(result.status,0,result.stderr);
  const body=JSON.parse(result.stdout.trim().split('\n').at(-1)); assert.deepEqual(body,config);
});
test('rechaza un secreto anidado antes de publicar configuracion',()=>{
  const result=runConfig({...config, social:{...config.social, apple:{...config.social.apple,privateKey:'fixture-secret-never-public'}}});
  assert.notEqual(result.status,0); assert.doesNotMatch(result.stdout,/fixture-secret-never-public/);
});
test('rechaza modo conectado sin clientes Google',()=>{
  const result=runConfig({...config,social:{apple:config.social.apple}}); assert.notEqual(result.status,0);
});
test('sin archivo publico mantiene la demo predeterminada',()=>{
  const result=runConfig({},false);assert.equal(result.status,0,result.stderr);
  const body=JSON.parse(result.stdout.trim().split('\n').at(-1));assert.equal(body.demoOnly,true);assert.equal(body.demoEnabled,true);
});
