import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AppGuestService } from './guest.js';
const samples=JSON.parse(readFileSync(new URL('../../../../docs/integraciones/fixtures/app-v2-service-samples.json',import.meta.url))).outputs;
const appointment=JSON.parse(readFileSync(new URL('../../../../docs/integraciones/fixtures/app-appointment-receipts-723/v2-operation-receipt.json',import.meta.url)));
function dispatchFixture({enabled=true,permissions=['history','sondeo','crm_prepare','callback_schedule'],kind='session'}={}){
 const c={id:samples.SessionAck.conversation_subject_id,installationId:samples.SessionAck.actor.slice(6),ownerUserId:null,accessRevision:'1',permissions,createdAt:new Date(),expiresAt:new Date(Date.now()+3600000),...(kind==='turn'?{remoteId:appointment.conversation_id}:{})};
 const op={id:'operation-local',status:'prepared',kind,key:'durable-key',request:kind==='turn'?{turn_id:appointment.turn_id}:{}};
 const db={
  appGuestOperation:{async updateMany({data}){Object.assign(op,data);return {count:1}},async findUnique(){return op},async update({data}){Object.assign(op,data);return op}},
  appGuestConversation:{async findUnique(){return c},async update({data}){Object.assign(c,data);return c}},
  async $queryRaw(){return []},async $transaction(fn){return fn(db)},
 };
 const client={async call(cap,method,path,authority,dto,opts){const data=kind==='session'?{...samples.SessionAck,conversation_subject_id:c.id,actor:authority.actor,effective_permissions:permissions}:appointment;opts.validateResponse(data);return {data}}};
 const svc=new AppGuestService(db,{guestCrmEnabled:enabled},{client});svc.owned=async()=>structuredClone(c);
 return {svc,c,op};
}
test('ACK guest con permisos CRM necesita opt-in y no concede otros permisos',async()=>{
 for(const enabled of [false,true]){
  const {svc,c,op}=dispatchFixture({enabled});
  const result=await svc.dispatch({},c,op);
  assert.equal(result.operation.status,enabled?'admitted':'outcome_unknown');
  assert.equal(result.conversation.ready,enabled);
 }
 const {svc,c,op}=dispatchFixture({permissions:['history','sondeo','case_context']});
 assert.equal((await svc.dispatch({},c,op)).operation.status,'outcome_unknown');
 assert.equal(c.remoteId,undefined);
});
test('turno guest acepta sólo cita verificada con ambos permisos y conserva ACK durable',async()=>{
 const {svc,c,op}=dispatchFixture({kind:'turn'});
 assert.equal((await svc.dispatch({},c,op)).status,'admitted');
 assert.deepEqual(op.response.result.appointment_receipt,appointment.result.appointment_receipt);
});

test('reanudar chat existente reconcilia permisos con la misma sesión y atestación',async()=>{
 const {svc,c,op}=dispatchFixture({kind:'turn',permissions:['history','sondeo']});
 const original={schema_version:'2.0',identity:{kind:'guest',actor_id:c.installationId,attested_at:'2026-10-15T10:00:00.000Z'},conversation_subject_id:c.id};
 const session={id:'original-session',kind:'session',key:'original-session-key00',request:original};
 svc.db.appGuestOperation.findFirst=async()=>session;
 svc.db.appGuestConversation.updateMany=async({data})=>{Object.assign(c,data);return {count:1}};
 svc.client.call=async(cap,method,path,authority,dto,opts)=>{
  assert.equal(path,'/sessions');assert.equal(opts.idempotencyKey,session.key);assert.deepEqual(dto,original);
  const data={...samples.SessionAck,conversation_id:c.remoteId,conversation_subject_id:c.id,actor:authority.actor,effective_permissions:['history','sondeo','crm_prepare','callback_schedule']};
  opts.validateResponse(data);return {data};
 };
 const before=c.remoteId;
 const result=await svc.start({}, {purpose:'sondeo',conversation_id:c.id},'resume-permission-key00');
 assert.equal(result.conversation.id,c.id);assert.equal(c.remoteId,before);
 assert.deepEqual(c.permissions,['history','sondeo','crm_prepare','callback_schedule']);
 assert.equal(op.status,'prepared');
});

test('reconciliación tardía no aplica permisos si cambió el propietario',async()=>{
 const {svc,c}=dispatchFixture({kind:'turn',permissions:['history','sondeo']});
 svc.db.appGuestOperation.findFirst=async()=>({key:'original-session-key00',request:{}});
 let writes=0;svc.db.appGuestConversation.updateMany=async()=>{writes++;return {count:1}};
 svc.client.call=async(cap,method,path,authority,dto,opts)=>{
  const data={...samples.SessionAck,conversation_id:c.remoteId,conversation_subject_id:c.id,actor:authority.actor,effective_permissions:['history','sondeo','crm_prepare','callback_schedule']};
  opts.validateResponse(data);c.ownerUserId='account';c.accessRevision='2';return {data};
 };
 await assert.rejects(svc.start({}, {purpose:'sondeo',conversation_id:c.id},'resume-permission-key00'),{code:'stale_access'});
 assert.equal(writes,0);assert.deepEqual(c.permissions,['history','sondeo']);
});

test('binding admite CRM sólo en prepare invitado habilitado y lo rechaza tras commit',async()=>{
 for(const [enabled,status,phase,allowed] of [[true,'prepared','preparing',true],[false,'prepared','preparing',false],[true,'committed','prepared',false],[true,'committed','preparing',false]]){
  const {svc,c}=dispatchFixture({kind:'turn',enabled});
  Object.assign(svc.config,{enabled:true,guestEnabled:true,keys:Object.fromEntries(['app.bindings.write','app.bindings.read'].map(cap=>[cap,{keyId:'fixture',secretBase64:Buffer.alloc(32).toString('base64')}]))});
  const binding={id:'11111111-1111-4111-8111-111111111111',targetUserId:'account-fixture',status:phase,request:{expected_access_revision:'1'}};
  svc.db.appGuestBinding={async findUnique(){return binding}};
  const checked=new Error('validated_fixture_boundary');
  svc.client.call=async(cap,method,path,authority,dto,opts)=>{
   const data={...samples[status==='prepared'?'BindingPrepared':'BindingCommitted'],binding_id:binding.id,conversation_id:c.remoteId,effective_permissions:['history','sondeo','crm_prepare','callback_schedule']};
   opts.validateResponse(data);throw checked;
  };
  await assert.rejects(svc.bind({user:{id:binding.targetUserId},installation:{}},c.id),e=>allowed?e===checked:e.code==='invalid_upstream_response');
 }
});
