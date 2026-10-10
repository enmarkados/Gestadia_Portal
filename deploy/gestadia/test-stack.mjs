import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../',import.meta.url));
const project='gestadia-common-test-'+randomUUID().slice(0,8);
const dir=mkdtempSync(join(tmpdir(),project+'-'));
const revision=process.env.GESTADIA_COMMON_TEST_REVISION || '9221d59-task4';
const env={...process.env,GESTADIA_APP_IMAGE:process.env.GESTADIA_APP_TEST_IMAGE||'gestadia-app:common-candidate',GESTADIA_PORTAL_IMAGE:'gestadia-portal-web:common-candidate',GESTADIA_BACKEND_IMAGE:'gestadia-backend:common-candidate',GESTADIA_CONFIG_DIR:dir,GESTADIA_UPLOADS_DIR:join(dir,'uploads'),GESTADIA_BACKEND_UID:'1000',GESTADIA_BACKEND_GID:'1000',GESTADIA_APP_PORT:'0',GESTADIA_PORTAL_PORT:'0'};
function command(args,capture=true,input) {
  const r=spawnSync('docker',args,{cwd:root,env,encoding:'utf8',stdio:capture?'pipe':'inherit',input,timeout:180000});
  if(r.status!==0)throw Error(`docker ${args.slice(0,5).join(' ')}: ${r.stderr||r.error||'fallo'}`);
  return r.stdout?.trim();
}
const host=command(['context','inspect','--format','{{.Endpoints.docker.Host}}']);
if(!host.startsWith('unix://'))throw Error('Solo Docker local Unix; no usar un servidor de producción');
const files=['-f',join(root,'deploy/gestadia/portainer-stack.yml'),'-f',join(dir,'fixture.json')];
const compose=args=>command(['--host',host,'compose','-p',project,...files,...args]);
try {
  mkdirSync(join(dir,'uploads'));chmodSync(join(dir,'uploads'),0o777); // Solo directorio efímero con datos ficticios.
  mkdirSync(join(dir,'secrets'));
  const publicConfig={appId:'com.gestadia.app',demoOnly:false,demoEnabled:false,conversationsEnabled:true,apiBaseUrl:'https://app.gestadia.com',checkoutBaseUrl:'https://gestadia.com',push:{enabled:true},social:{google:{webClientId:'web.apps.googleusercontent.com',iosClientId:'ios.apps.googleusercontent.com'},apple:{clientId:'com.gestadia.app',androidServiceId:'com.gestadia.app.login',redirectUrl:'https://app.gestadia.com/api/auth/social/apple/callback'}},pluginWeb:{baseUrl:'/lidia',key:''}};
  writeFileSync(join(dir,'mobile-release.json'),JSON.stringify(publicConfig));
  writeFileSync(join(dir,'backend.env'),[
    'DATABASE_URL=mysql://fixture:local-test-only@fixture-db:3306/gestadia_common_test',
    'JWT_SECRET=fixture-only-not-a-production-secret-123456',
    'MOBILE_FEATURES_ENABLED=true','MOBILE_PUSH_ENABLED=true','APP_CONVERSATIONS_ENABLED=true',
    'APP_LIDIA_INTEGRATION_ID=fixture-no-external-conversations',
    'MOBILE_ENCRYPTION_KEY='+Buffer.alloc(32,4).toString('base64'),
    'GOOGLE_WEB_CLIENT_ID=web.apps.googleusercontent.com','GOOGLE_IOS_CLIENT_ID=ios.apps.googleusercontent.com',
    'APPLE_SERVICE_ID=com.gestadia.app.login','APPLE_TEAM_ID=ABCDEFGHIJ','APPLE_AUTH_KEY_ID=ABCDEFGHIJ',
    'APPLE_AUTH_KEY_FILE=/run/gestadia-secrets/not-used.p8','APPLE_CALLBACK_URL=https://app.gestadia.com/api/auth/social/apple/callback',
    'APNS_KEY_ID=ABCDEFGHIJ','APNS_KEY_FILE=/run/gestadia-secrets/not-used.p8','FIREBASE_CREDENTIAL_FILE=/run/gestadia-secrets/not-used.json',
  ].join('\n'));
  writeFileSync(join(dir,'fixture.json'),JSON.stringify({services:{'fixture-db':{image:'mariadb:11.4.12',environment:{MARIADB_ROOT_PASSWORD:'local-test-only',MARIADB_DATABASE:'gestadia_common_test',MARIADB_USER:'fixture',MARIADB_PASSWORD:'local-test-only'},tmpfs:['/var/lib/mysql'],healthcheck:{test:['CMD','healthcheck.sh','--connect','--innodb_initialized'],interval:'2s',timeout:'3s',retries:40}},'gestadia-backend':{depends_on:{'fixture-db':{condition:'service_healthy'}}}}}));
  compose(['config','--quiet']);
  compose(['up','-d','--wait','--wait-timeout','120','fixture-db']);
  compose(['run','--rm','--no-deps','gestadia-backend','npm','run','migrate:deploy']);
  compose(['up','-d','--wait','--wait-timeout','120']);
  const ids=compose(['ps','--all','--quiet']).split('\n');
  const inspect=JSON.parse(command(['--host',host,'inspect',...ids]));
  for(const service of ['gestadia-app','gestadia-portal-web','gestadia-backend']) {
    const container=inspect.find(x=>x.Config.Labels['com.docker.compose.service']===service);
    assert.ok(container.Config.User && !['0','root','0:0'].includes(container.Config.User));
    assert.ok(container.HostConfig.CapDrop.includes('ALL'));
    if(service==='gestadia-backend')assert.ok(!container.HostConfig.PortBindings||Object.keys(container.HostConfig.PortBindings).length===0);
    else assert.equal(container.HostConfig.PortBindings['8080/tcp'][0].HostIp,'127.0.0.1');
    const image=JSON.parse(command(['--host',host,'image','inspect',container.Image]))[0];
    assert.equal(image.Architecture,'amd64');assert.equal(image.Config.Labels['org.opencontainers.image.revision'],revision);
  }
  const seed=`import {PrismaClient} from '@prisma/client';import bcrypt from 'bcryptjs';const db=new PrismaClient();const password='fixture-password-only';const data={passwordHash:await bcrypt.hash(password,10),nombre:'Prueba',apellidos:'Local',emailVerified:true,accountVerifiedAt:new Date(),accountVerificationMethod:'email'};const owner=await db.user.create({data:{...data,email:'owner@example.test'}});const other=await db.user.create({data:{...data,email:'other@example.test'}});const expediente=await db.expediente.create({data:{userId:owner.id,nPedido:'FIXTURE-1',servicioSlug:'transferencia-vehiculo',titulo:'Prueba local',importe:1}});const doc=await db.documento.create({data:{expedienteId:expediente.id,clave:'otro',nombre:'previo.pdf',mime:'application/pdf',size:32,path:'previo.pdf'}});console.log(JSON.stringify({owner:{email:owner.email,password},other:{email:other.email,password},expedienteId:expediente.id,documentId:doc.id}));await db.$disconnect();`;
  const seeded=JSON.parse(compose(['exec','-T','gestadia-backend','node','--import','dotenv/config','--input-type=module','-e',seed]));
  writeFileSync(join(dir,'uploads','previo.pdf'),'%PDF-1.4\nfixture existente');
  const endpoint=service=>'http://'+compose(['port',service,'8080']);
  const input={...seeded,app:endpoint('gestadia-app'),portal:endpoint('gestadia-portal-web'),uploadDir:join(dir,'uploads'),revision};
  writeFileSync(join(dir,'input.json'),JSON.stringify(input));
  const result=spawnSync(process.execPath,['--test',join(root,'deploy/gestadia/stack.test.mjs')],{cwd:root,env:{...env,GESTADIA_COMMON_TEST_INPUT:join(dir,'input.json')},stdio:'inherit'});
  if(result.status!==0)throw Error('Pruebas funcionales del stack fallaron');
  compose(['restart','gestadia-backend']);
  compose(['up','-d','--wait','--wait-timeout','90']);
  const login=await fetch(input.portal+'/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input.owner)});
  assert.equal(login.status,200);const token=(await login.json()).token;
  const docs=await(await fetch(input.portal+`/api/expedientes/${input.expedienteId}`,{headers:{authorization:`Bearer ${token}`}})).json();
  assert.equal(docs.documentos.length,2);
  for(const doc of docs.documentos)assert.equal((await fetch(input.app+`/api/expedientes/${input.expedienteId}/documentos/${doc.id}`,{headers:{authorization:`Bearer ${token}`}})).status,200);
  console.log('PASS: reinicio conserva documentos y acceso compartido; API privada, usuarios no root y revisión coincidente.');
} catch (error) {
  try { console.error(compose(['logs','--tail','45'])); } catch {}
  throw error;
} finally {
  try{compose(['down','--volumes','--remove-orphans']);}finally{rmSync(dir,{recursive:true,force:true});}
}
