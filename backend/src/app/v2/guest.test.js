import { test,after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import { AppGuestService } from './guest.js';
import { responseV2 } from './responses.js';
import { AppIdentity } from '../identity.js';
import { AppProblem } from '../problem.js';
import { appV2ConversationConfig } from '../../config.js';
const url=new URL(process.env.DATABASE_URL||'http://invalid');
if(url.hostname!=='127.0.0.1'||url.pathname!=='/gestadia_app_test')throw Error('Sólo BBDD efímera local');
const db=new PrismaClient();after(()=>db.$disconnect());
const samples=JSON.parse(readFileSync(new URL('../../../../docs/integraciones/fixtures/app-v2-service-samples.json',import.meta.url))).outputs;
class Remote {
 constructor(){this.sent=[];this.results=new Map();this.lost=false;this.revoked=false;}
 async call(cap,method,path,authority,dto,opts={}){
  this.sent.push({cap,method,path,authority:structuredClone(authority),dto:structuredClone(dto),key:opts.idempotencyKey});
  if(this.revoked)throw new AppProblem(403,'capability_denied');
  let data;
  if(path==='/sessions') {
   data=this.results.get(opts.idempotencyKey);
   if(!data){data={...samples.SessionAck,conversation_id:randomUUID(),lidia_session_id:randomUUID(),conversation_subject_id:authority.subject,actor:authority.actor};this.results.set(opts.idempotencyKey,data);}
   this.remoteId=data.conversation_id;
  }else if(path.endsWith('/bindings'))data={...samples[dto.phase==='prepare'?'BindingPrepared':'BindingCommitted'],binding_id:dto.binding_id,conversation_id:this.remoteId};
  else if(path.endsWith('/turns'))data={...samples.Receipt,conversation_id:this.remoteId,turn_id:dto.turn_id};
  else if(path.endsWith('/message-receipts'))data={...samples.MessageSummary,conversation_id:this.remoteId};
  else data={...samples.Timeline,conversation_id:this.remoteId};
  opts.validateResponse(data);
  if(this.lost){this.lost=false;throw new AppProblem(503,'outcome_unknown');}
  return {status:200,data};
 }
}
async function fixture(t){
 const remote=new Remote(),config={enabled:true,guestEnabled:true,integrationId:`fixture-${randomUUID()}`};
 let clock=new Date('2026-10-11T10:00:00.000Z');const svc=new AppGuestService(db,config,{client:remote,clock:()=>clock});
 const installation=await svc.installation(),actor=await svc.actor(installation.token);
 t.after(async()=>{const ids=(await db.appGuestConversation.findMany({where:{integrationId:config.integrationId},select:{id:true}})).map(r=>r.id);await db.appGuestBinding.deleteMany({where:{conversationId:{in:ids}}});await db.appGuestOperation.deleteMany({where:{conversationId:{in:ids}}});await db.appGuestConversation.deleteMany({where:{integrationId:config.integrationId}});await db.appGuestInstallation.deleteMany({where:{id:installation.installation_id}});});
 return {svc,config,remote,installation,actor,setClock:v=>clock=new Date(v)};
}
const bindingKeys=()=>Object.fromEntries(['app.bindings.write','app.bindings.read'].map(cap=>[cap,{keyId:'fixture-binding',secretBase64:Buffer.alloc(32,7).toString('base64')}]));
test('historial invitado entrega pendientes propios para la pantalla APP',async t=>{
 const f=await fixture(t),start=await f.svc.start(f.actor,{purpose:'sondeo'},randomUUID());
 assert.deepEqual((await f.svc.timeline(f.actor,start.conversation.id,{})).pending_operations,[]);
 const other=await fixture(t),otherStart=await other.svc.start(other.actor,{purpose:'sondeo'},randomUUID());
 const rows=[];
 for(const [index,status] of ['prepared','outcome_unknown','admitted','failed'].entries()){
  rows.push(await db.appGuestOperation.create({data:{conversationId:start.conversation.id,kind:'turn',key:randomUUID(),hash:'fixture',status,errorCode:status==='outcome_unknown'?'outcome_unknown':null,request:{turn_id:randomUUID()},createdAt:new Date(`2026-10-11T10:00:0${index}.000Z`)}}));
 }
 await db.appGuestOperation.create({data:{conversationId:otherStart.conversation.id,kind:'turn',key:randomUUID(),hash:'fixture',status:'prepared',request:{turn_id:randomUUID()}}});
 const timeline=await f.svc.timeline(f.actor,start.conversation.id,{});
 assert.deepEqual(timeline.pending_operations,[
  {id:rows[0].id,operation:'turn',status:'prepared',error_code:null,turn_id:rows[0].request.turn_id},
  {id:rows[1].id,operation:'turn',status:'outcome_unknown',error_code:'outcome_unknown',turn_id:rows[1].request.turn_id},
 ]);
 assert.equal(timeline.conversation_id,start.conversation.id);
});
async function accountActor(t,f,guestToken=f.installation.token){
 const user=await db.user.create({data:{email:`guest-bind-${randomUUID()}@example.test`,nombre:'Fixture',apellidos:'Local',passwordHash:'not-used-by-this-test',emailVerified:true,accountVerifiedAt:new Date('2026-10-10T10:00:00Z'),accountVerificationMethod:'email'}});
 t.after(async()=>{await db.appDeviceSession.deleteMany({where:{userId:user.id}});await db.user.delete({where:{id:user.id}});});
 const token=`ga_${(await import('node:crypto')).randomBytes(32).toString('base64url')}`;
 await db.appDeviceSession.create({data:{userId:user.id,tokenHash:(await import('../s2s.js')).sha256(token),deviceLabel:'Fixture',expiresAt:new Date('2026-10-20T10:00:00Z')}});
 return {actor:await f.svc.actor(guestToken,token),user,token};
}
test('schema HTTP r4 valida las14 salidas del servicio LidIA local y rechaza campos extra',()=>{
 const names={BindingCommitted:'BindingAck',BindingLookup:'BindingAck',BindingPrepared:'BindingAck',ContextAck:'ContextAck',Error:'Error',MessageAck:'MessageReceiptAckResponse',MessageSummary:'MessageReceiptSummary',OperationReceipt:'Receipt',Receipt:'Receipt',ReceiptLookup:'ReceiptLookup',RevocationAck:'RevocationAck',SessionAck:'SessionAck',SessionRecovery:'Receipt',Timeline:'Timeline'};
 for(const[name,data]of Object.entries(samples)) { assert.equal(responseV2(names[name])(data),true,name);assert.throws(()=>responseV2(names[name])({...data,unexpected:true})); }
});
test('v2 apagado no emite instalaciones ni cae a v1',async()=>{
 const service=new AppGuestService(db,appV2ConversationConfig({}));await assert.rejects(service.installation(),{code:'runtime_unavailable'});
});
test('token opaco de instalación autentica; ID, cuenta o token alterado no autentican',async t=>{
 const f=await fixture(t);assert.equal(f.actor.installation.id,f.installation.installation_id);
 await assert.rejects(f.svc.actor(f.installation.installation_id),{code:'guest_session_expired'});
 await assert.rejects(f.svc.actor(f.installation.token.slice(0,-1)+'!'),{code:'guest_session_expired'});
 const row=await db.appGuestInstallation.findUnique({where:{id:f.installation.installation_id}});assert.notEqual(row.tokenHash,f.installation.token);
});
test('nuevo sondeo concurrente/replay selecciona mismo sujeto y no solicita datos de contacto',async t=>{
 const f=await fixture(t),key=randomUUID(),input={purpose:'sondeo',case_ref:null,create_new:true};
 const a=await f.svc.start(f.actor,input,key);const b=await f.svc.start(f.actor,input,key);
 assert.equal(a.conversation.id,b.conversation.id);assert.equal(f.remote.sent.length,1);assert.equal(f.remote.sent[0].dto.identity.method,'installation_session');
 assert.deepEqual(f.remote.sent[0].dto.identity.expires_at,'2026-10-12T10:00:00.000Z');
 await assert.rejects(f.svc.start(f.actor,{purpose:'atencion'},randomUUID()),{code:'invalid_payload'});
 await assert.rejects(f.svc.start(f.actor,{...input,agent_id:119},randomUUID()),{code:'invalid_payload'});
 await assert.rejects(f.svc.start(f.actor,{purpose:'sondeo',case_ref:null},key),{code:'idempotency_conflict'});
});
test('ACK perdido conserva sujeto, DTO/key y atestación en retry; caducidad no se renueva',async t=>{
 const f=await fixture(t);f.remote.lost=true;
 const start=await f.svc.start(f.actor,{purpose:'sondeo'},randomUUID());assert.equal(start.operation.status,'outcome_unknown');
 f.setClock('2026-10-11T10:15:00.000Z');const recovered=await f.svc.operation(f.actor,start.operation.id,true);
 assert.equal(recovered.conversation.id,start.conversation.id);assert.equal(recovered.conversation.ready,true);
 assert.deepEqual(f.remote.sent[0].dto,f.remote.sent[1].dto);assert.equal(f.remote.sent[1].authority.access_revision,'0');
 f.setClock('2026-10-12T10:00:00.000Z');await assert.rejects(f.svc.timeline(f.actor,start.conversation.id,{}),{code:'conversation_not_found'});
});
test('otra instalación no lee, escribe, renombra, recupera ni vincula una conversación',async t=>{
 const f=await fixture(t),other=await f.svc.installation(),actor=await f.svc.actor(other.token);
 t.after(()=>db.appGuestInstallation.delete({where:{id:other.installation_id}}));
 const c=await f.svc.start(f.actor,{purpose:'sondeo'},randomUUID());
 for(const action of [()=>f.svc.timeline(actor,c.conversation.id,{}),()=>f.svc.rename(actor,c.conversation.id,{title:'Ajeno'}),()=>f.svc.operation(actor,c.operation.id,true)])await assert.rejects(action(),{code:'conversation_not_found'});
 assert.equal((await f.svc.list(actor)).conversations.length,0);
});
test('turno literal durable y conflicto de idempotencia; respuesta del motor sin cuestionario local',async t=>{
 const f=await fixture(t),c=await f.svc.start(f.actor,{purpose:'sondeo'},randomUUID()),dto={schema_version:'1.0',turn_id:randomUUID(),kind:'text',text:'Mi consulta literal',correlation_id:randomUUID()};
 const op=await f.svc.turn(f.actor,c.conversation.id,dto);assert.equal(op.status,'admitted');assert.equal(f.remote.sent.at(-1).dto.text,dto.text);
 await f.svc.turn(f.actor,c.conversation.id,dto);assert.equal(f.remote.sent.filter(r=>r.path.endsWith('/turns')).length,1);
 await assert.rejects(f.svc.turn(f.actor,c.conversation.id,{...dto,text:'Otra consulta'}),{code:'idempotency_conflict'});
 const timeline=await f.svc.timeline(f.actor,c.conversation.id,{});assert.equal(timeline.items.at(-1).text,'Respuesta local');assert.equal(timeline.sondeo,null);
});
test('vínculo cuenta comprobada y control original conserva sesión; guest antiguo deja de leer',async t=>{
 const f=await fixture(t);f.config.keys=bindingKeys();const c=await f.svc.start(f.actor,{purpose:'sondeo'},randomUUID());
 const user=await db.user.create({data:{email:`guest-bind-${randomUUID()}@example.test`,nombre:'Fixture',apellidos:'Local',passwordHash:'not-used-by-this-test',emailVerified:true,accountVerifiedAt:new Date('2026-10-10T10:00:00Z'),accountVerificationMethod:'email'}});t.after(async()=>{await db.appDeviceSession.deleteMany({where:{userId:user.id}});await db.user.delete({where:{id:user.id}});});
 const token=`ga_${(await import('node:crypto')).randomBytes(32).toString('base64url')}`;
 const session=await db.appDeviceSession.create({data:{userId:user.id,tokenHash:(await import('../s2s.js')).sha256(token),deviceLabel:'Fixture',expiresAt:new Date('2026-10-20T10:00:00Z')}});t.after(()=>db.appDeviceSession.deleteMany({where:{id:session.id}}));
 const actor=await f.svc.actor(f.installation.token,token),bound=await f.svc.bind(actor,c.conversation.id);
 assert.equal(bound.id,c.conversation.id);assert.equal(bound.expires_at,null);
 const calls=f.remote.sent.filter(r=>r.path.endsWith('/bindings'));assert.equal(calls[0].authority.actor,`guest:${f.installation.installation_id}`);assert.equal(calls[1].authority.actor,`account:${user.id}`);
 await assert.rejects(f.svc.timeline(f.actor,c.conversation.id,{}),{code:'conversation_not_found'});
 const accountOnly=await f.svc.actor(null,token);assert.equal((await f.svc.list(accountOnly)).conversations[0].id,c.conversation.id);await f.svc.timeline(accountOnly,c.conversation.id,{});
 await db.user.update({where:{id:user.id},data:{accessRevokedAt:new Date()}});await assert.rejects(f.svc.timeline(accountOnly,c.conversation.id,{}),{code:'account_disabled'});
});
test('disponibilidad local exige ambas claves de binding y no se filtra al contrato S2S',async t=>{
 const f=await fixture(t),c=await f.svc.start(f.actor,{purpose:'sondeo'},randomUUID());
 assert.equal(c.conversation.can_bind,false);assert.equal((await f.svc.list(f.actor)).conversations[0].can_bind,false);
 f.config.keys=bindingKeys();assert.equal((await f.svc.list(f.actor)).conversations[0].can_bind,true);
 assert.equal((await f.svc.rename(f.actor,c.conversation.id,{title:'Consulta propia'})).can_bind,true);
 assert.equal((await f.svc.start(f.actor,{purpose:'sondeo'},randomUUID())).conversation.can_bind,true);
 assert.ok(f.remote.sent.every(r=>!Object.hasOwn(r.dto,'can_bind')));
});
test('binding no disponible rechaza antes de escribir o emitir S2S y mantiene el historial',async t=>{
 const cases=[
  ['sin claves',undefined],
  ['falta write',{'app.bindings.read':bindingKeys()['app.bindings.read']}],
  ['falta read',{'app.bindings.write':bindingKeys()['app.bindings.write']}],
  ['key ID inválido',{...bindingKeys(),'app.bindings.write':{...bindingKeys()['app.bindings.write'],keyId:'not/valid'}}],
  ['base64 inválido',{...bindingKeys(),'app.bindings.read':{keyId:'valid',secretBase64:'not-base64'}}],
  ['secreto corto',{...bindingKeys(),'app.bindings.read':{keyId:'valid',secretBase64:Buffer.alloc(31).toString('base64')}}],
 ];
 for(const [name,keys]of cases)await t.test(name,async t=>{
  const f=await fixture(t);f.config.keys=keys;const c=await f.svc.start(f.actor,{purpose:'sondeo'},randomUUID()),{actor}=await accountActor(t,f);
  await assert.rejects(f.svc.bind(actor,c.conversation.id),{code:'runtime_unavailable'});
  assert.equal(await db.appGuestBinding.count({where:{conversationId:c.conversation.id}}),0);
  const row=await db.appGuestConversation.findUnique({where:{id:c.conversation.id}});assert.equal(row.ownerUserId,null);assert.equal(row.accessRevision,'1');
  assert.equal(f.remote.sent.filter(r=>r.cap==='app.bindings.write').length,0);
  assert.equal((await f.svc.list(actor)).conversations[0].can_bind,false);
  assert.equal((await f.svc.timeline(actor,c.conversation.id,{})).items.at(-1).text,'Respuesta local');
  await f.svc.timeline(f.actor,c.conversation.id,{});
 });
});
test('propiedad se comprueba antes del guard de binding',async t=>{
 const f=await fixture(t),c=await f.svc.start(f.actor,{purpose:'sondeo'},randomUUID()),other=await f.svc.installation();
 t.after(()=>db.appGuestInstallation.delete({where:{id:other.installation_id}}));
 const {actor}=await accountActor(t,f,other.token);
 await assert.rejects(f.svc.bind(actor,c.conversation.id),{code:'conversation_not_found'});
 assert.equal(await db.appGuestBinding.count({where:{conversationId:c.conversation.id}}),0);
 assert.equal(f.remote.sent.length,1);
});
test('binding incierto conserva operación al retirar claves y recupera prepare/commit al restaurarlas',async t=>{
 const f=await fixture(t);f.config.keys=bindingKeys();const c=await f.svc.start(f.actor,{purpose:'sondeo'},randomUUID()),{actor,user}=await accountActor(t,f);
 f.remote.lost=true;await assert.rejects(f.svc.bind(actor,c.conversation.id),{code:'outcome_unknown'});
 const pending=await db.appGuestBinding.findUnique({where:{conversationId:c.conversation.id}});assert.equal(pending.status,'preparing');
 const before=f.remote.sent.length;f.config.keys={};
 await assert.rejects(f.svc.bind(actor,c.conversation.id),{code:'runtime_unavailable'});
 assert.deepEqual(await db.appGuestBinding.findUnique({where:{conversationId:c.conversation.id}}),pending);assert.equal(f.remote.sent.length,before);
 f.config.keys=bindingKeys();const bound=await f.svc.bind(actor,c.conversation.id);assert.equal(bound.id,c.conversation.id);assert.equal(bound.can_bind,false);assert.equal(bound.expires_at,null);
 const calls=f.remote.sent.filter(r=>r.cap==='app.bindings.write');assert.equal(calls.length,3);assert.equal(calls[0].key,calls[1].key);assert.deepEqual(calls[0].dto,calls[1].dto);assert.equal(calls[2].key,`${pending.id}:commit`);
 const row=await db.appGuestConversation.findUnique({where:{id:c.conversation.id}});assert.equal(row.ownerUserId,user.id);assert.equal(row.accessRevision,'2');
 f.config.keys={};assert.equal((await f.svc.bind(actor,c.conversation.id)).id,c.conversation.id);assert.equal(f.remote.sent.filter(r=>r.cap==='app.bindings.write').length,3);
});
test('lease vencida recupera entrega parada; timeout tardío no degrada un ACK ya admitido',async t=>{
 const f=await fixture(t),base=f.remote.call.bind(f.remote);let release,first=true;
 f.remote.call=async(...args)=>{const r=await base(...args);if(first){first=false;await new Promise(resolve=>release=resolve);throw new AppProblem(503,'outcome_unknown');}return r;};
 const promise=f.svc.start(f.actor,{purpose:'sondeo'},randomUUID());
 let o;for(let n=0;n<100;n++){o=await db.appGuestOperation.findFirst({where:{status:'dispatching',conversationId:{in:(await db.appGuestConversation.findMany({where:{integrationId:f.svc.config.integrationId}})).map(c=>c.id)}}});if(o&&release)break;await new Promise(r=>setTimeout(r,10));}
 assert.ok(o&&release);f.setClock('2026-10-11T10:02:00.000Z');
 const second=await f.svc.operation(f.actor,o.id,true);assert.equal(second.operation.status,'admitted');release();
 const late=await promise;assert.equal(late.operation.status,'admitted');assert.equal((await f.svc.operation(f.actor,o.id)).status,'admitted');
 assert.deepEqual(f.remote.sent[0].dto,f.remote.sent[1].dto);
});

test('recibos guest conservan actor y rechazan cobertura, rol y revisiones falsas',async t=>{
 const f=await fixture(t),c=await f.svc.start(f.actor,{purpose:'sondeo'},randomUUID()),id=samples.MessageAck.items[0].message_id;
 const dto={ack_id:randomUUID(),state:'read',message_ids:[id],correlation_id:randomUUID()};let alter=d=>d;
 f.remote.call=async(cap,method,path,authority,body,opts)=>{const data=alter({...structuredClone(samples.MessageAck),conversation_id:f.remote.remoteId,ack_id:dto.ack_id});opts.validateResponse(data);return {data};};
 const ack=await f.svc.receipts(f.actor,c.conversation.id,{},dto,randomUUID());assert.equal(ack.items[0].read_by,'guest');
 alter=d=>({...d,items:[{...d.items[0],message_id:randomUUID()}]});await assert.rejects(f.svc.receipts(f.actor,c.conversation.id,{},dto,randomUUID()),{code:'invalid_upstream_response'});
 alter=d=>({...d,items:[{...d.items[0],receipt_revision:'3'}]});await assert.rejects(f.svc.receipts(f.actor,c.conversation.id,{},dto,randomUUID()),{code:'invalid_upstream_response'});
 await assert.rejects(f.svc.receipts(f.actor,c.conversation.id,{}, {...dto,message_ids:[]},randomUUID()),{code:'invalid_payload'});
});
