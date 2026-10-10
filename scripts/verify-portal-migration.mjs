import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {PrismaClient} from '../backend/node_modules/@prisma/client/default.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const dumpPath=process.argv[2];
if(!dumpPath)throw Error('Se requiere la ruta de una copia SQL privada');
let dump=readFileSync(dumpPath).toString('utf8');
const schemas=[...dump.matchAll(/^USE `([A-Za-z0-9_]+)`;\r?$/gm)].map(m=>m[1]);
if(new Set(schemas).size>1)throw Error('La copia debe contener una única base Portal');
// El original privado permanece intacto. Solo adaptar las dos cabeceras de
// mariadb-dump; todos los datos y definiciones de tabla se restauran sin cambios.
if(schemas.length) {
 const creates=[...dump.matchAll(/^CREATE DATABASE[^\r\n]+;\r?$/gm)];
 if(creates.length>1 || creates.some(m=>!m[0].includes('`'+schemas[0]+'`')))throw Error('Cabecera de base inesperada');
 dump=dump.replace(/^CREATE DATABASE[^\r\n]+;\r?$/gm,'').replace(/^USE `[A-Za-z0-9_]+`;\r?$/gm,'USE `gestadia_migration_restore_test`;');
}
if(/^CREATE DATABASE|^USE (?!`gestadia_migration_restore_test`;)/mi.test(dump))throw Error('Cabecera de base no soportada');
const name=`gestadia-migration-test-${randomUUID()}`;
const owner=randomUUID();
const env={...process.env,DOTENV_CONFIG_PATH:'/dev/null'};
function run(command,args,{input,quiet=false}={}) {
 const r=spawnSync(command,args,{cwd:root,env,encoding:'utf8',input,maxBuffer:32*1024*1024,timeout:180000});
 if(r.status!==0)throw Error(`${command} no completado (código ${r.status}); no se imprime contenido privado`);
 if(!quiet&&r.stdout)process.stdout.write(r.stdout);
 return r.stdout?.trim();
}
const host=run('docker',['context','inspect','--format','{{.Endpoints.docker.Host}}'],{quiet:true});
if(!host.startsWith('unix://'))throw Error('Solo Docker local Unix');
const docker=(args,options={})=>run('docker',['--host',host,...args],{quiet:true,...options});
let created=false,db;
const identifier=value=>{if(!/^[A-Za-z0-9_]+$/.test(value))throw Error('Identificador inesperado');return '`'+value+'`';};
const canonical=value=>JSON.stringify(value,(_,item)=>typeof item==='bigint'?String(item):item);
async function digest(table,columns) {
 const rows=await db.$queryRawUnsafe(`SELECT ${columns.map(identifier).join(',')} FROM ${identifier(table)}`);
 const ordered=rows.map(canonical).sort();
 return {count:rows.length,hash:createHash('sha256').update(ordered.join('\n')).digest('hex')};
}
try {
 docker(['run','--pull=never','--detach','--rm','--name',name,'--label',`gestadia.migration.test.owner=${owner}`,'--publish','127.0.0.1::3306','--tmpfs','/var/lib/mysql','--env','MARIADB_ROOT_PASSWORD=local-test-only','--env','MARIADB_DATABASE=gestadia_migration_restore_test','mariadb:11.4.12']);created=true;
 for(let n=0;;n++) {
  const r=spawnSync('docker',['--host',host,'exec',name,'healthcheck.sh','--connect','--innodb_initialized'],{stdio:'ignore'});
  if(r.status===0)break;if(n>=45)throw Error('MariaDB efímera no está lista');await new Promise(r=>setTimeout(r,1000));
 }
 docker(['exec','-i',name,'mariadb','--binary-mode=1','--user=root','--password=local-test-only','gestadia_migration_restore_test'],{input:dump});
 const address=docker(['port',name,'3306/tcp']);if(!/^127\.0\.0\.1:\d+$/.test(address))throw Error('Destino local inesperado');
 env.DATABASE_URL=`mysql://root:local-test-only@${address}/gestadia_migration_restore_test`;
 db=new PrismaClient({datasourceUrl:env.DATABASE_URL});
 const names=await db.$queryRaw`SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' AND TABLE_NAME <> '_prisma_migrations' ORDER BY TABLE_NAME`;
 const before=[];
 for(const {name:table} of names) {
  const columns=(await db.$queryRaw`SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=${table} ORDER BY ORDINAL_POSITION`).map(c=>c.name);
  before.push({table,columns,...await digest(table,columns)});
 }
 run('npm',['exec','--prefix','backend','--','prisma','migrate','deploy','--schema','backend/prisma/schema.prisma']);
 for(const prior of before) {
  const after=await digest(prior.table,prior.columns);
  if(after.count!==prior.count||after.hash!==prior.hash)throw Error(`Datos originales alterados en ${prior.table}`);
 }
 const migrations=await db.$queryRaw`SELECT migration_name AS name, finished_at AS finishedAt, rolled_back_at AS rolledBackAt FROM _prisma_migrations ORDER BY migration_name`;
 if(migrations.some(m=>!m.finishedAt||m.rolledBackAt))throw Error('Migraciones incompletas');
 console.log(JSON.stringify({result:'PASS',originalTables:before.map(b=>({table:b.table,rows:b.count,valuesUnchanged:true})),migrations:migrations.map(m=>m.name),productionModified:false,outboundProvidersStarted:false},null,2));
} finally {
 await db?.$disconnect();
 if(created) {
  const label=docker(['inspect','--format','{{index .Config.Labels "gestadia.migration.test.owner"}}',name]);
  if(label===owner)docker(['stop',name]);
 }
}
