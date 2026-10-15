import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateContract } from './contracts.js';
import { responseV2 } from './v2/responses.js';
import { receiptView, operationView } from './store.js';
import { AppGuestService } from './v2/guest.js';
const fixture=name=>JSON.parse(readFileSync(new URL(`../../../docs/integraciones/fixtures/app-appointment-receipts-723/${name}.json`,import.meta.url)));
const v1=fixture('v1-receipt-lookup'), v2=fixture('v2-receipt-lookup'), receipt2=fixture('v2-operation-receipt');
const validators=[['v1 lookup',v1,d=>validateContract('ReceiptLookup',d,{response:true}),d=>d.receipt],['v2 lookup',v2,responseV2('ReceiptLookup'),d=>d.receipt],['v2 receipt',receipt2,responseV2('Receipt'),d=>d]];
test('schemas runtime son copias exactas de la entrega 723, sin sustituir los históricos',()=>{
 for(const [runtime,file,hash] of [
  ['./contracts/app-v1-dtos.schema.json','app-v1-dtos.schema.json','4151ef56af4c24033792d0cb7327bd5e092260a5d933d500014f82bd6536897f'],
  ['./v2/contracts/app-v2-responses.schema.json','app-v2-responses.schema.json','c7150b2406586704e3af1d37c5b00146449e3f4247fb4ad896e78a76a86c532b'],
 ]){
  const bytes=readFileSync(new URL(runtime,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),hash);
  assert.deepEqual(bytes,readFileSync(new URL(`../../../docs/integraciones/fixtures/app-appointment-receipts-723/${file}`,import.meta.url)));
 }
});
for(const [name,sample,validate,get] of validators){
 test(`${name}: admite el vector cerrado y conserva legacy sin reserva`,()=>{
  assert.equal(validate(sample),true);
  const legacy=structuredClone(sample);delete get(legacy).result.appointment_receipt;
  assert.equal(validate(legacy),true);
 const utc=structuredClone(sample);get(utc).result.appointment_receipt.client_time_zone='UTC';
 assert.equal(validate(utc),true);
 });
 for(const [description,mutate] of [
  ['hora distinta',r=>r.result.appointment_receipt.zoho_start='2026-10-06T12:00:00.000Z'],
  ['fecha inexistente',r=>{r.result.appointment_receipt.requested_start=r.result.appointment_receipt.zoho_start='2026-02-30T11:00:00.000Z'}],
  ['zona inexistente',r=>r.result.appointment_receipt.client_time_zone='Europe/Inventada'],
  ['verificación anterior',r=>r.result.appointment_receipt.verified_at='2026-10-05T09:59:59.999Z'],
  ['estado pendiente',r=>r.status='running'],
  ['operación distinta',r=>r.operation='handoff'],
  ['error junto a éxito',r=>r.error={type:'urn:test',title:'error',status:503,code:'error',detail:'error',correlation_id:'test',retryable:true}],
  ['id CRM libre',r=>r.result.appointment_receipt.call_id='123456'],
  ['subversión equivocada',r=>r.result.appointment_receipt.schema_version='2.0'],
  ['UTC sin milisegundos',r=>r.result.appointment_receipt.verified_at='2026-10-05T10:00:00Z'],
 ])test(`${name}: rechaza ${description}`,()=>{
  const bad=structuredClone(sample);mutate(get(bad));
  assert.throws(()=>validate(bad),{code:'invalid_upstream_response'});
 });
}
test('proyección retira el recibo adicional sin los dos permisos y conserva bytes persistidos',()=>{
 const receipt=v1.receipt,original=JSON.stringify(receipt),id='local-conversation';
 for(const permissions of [[],['history','sondeo'],['history','crm_prepare'],['history','callback_schedule']]){
  assert.equal(receiptView(receipt,id,permissions).result.appointment_receipt,undefined);
  assert.equal(operationView({id:'op',kind:'turn',response:receipt,conversationId:id},permissions).receipt.result.appointment_receipt,undefined);
 }
 const permissions=['history','sondeo','crm_prepare','callback_schedule'];
 assert.deepEqual(receiptView(receipt,id,permissions).result.appointment_receipt,receipt.result.appointment_receipt);
 assert.equal(JSON.stringify(receipt),original);
});
for(const ownerUserId of [null,'verified-account'])test(`consumidor v2 limitado no acepta recibo CRM owner=${ownerUserId}`,async()=>{
 const c={id:'local-conversation',remoteId:v2.conversation_id,permissions:['history','sondeo'],ownerUserId};
 const client={async call(cap,method,path,authority,dto,opts){opts.validateResponse(v2);return {data:v2}}};
 const svc=new AppGuestService({}, {},{client});svc.owned=async()=>c;
 await assert.rejects(svc.timeline({},c.id,{turn_id:v2.receipt.turn_id}),{code:'invalid_upstream_response'});
});


test('guest CRM configurado admite recibo verificado sin registro y conserva referencia local',async()=>{
 const c={id:'guest-local',remoteId:v2.conversation_id,permissions:['history','sondeo','crm_prepare','callback_schedule'],ownerUserId:null};
 const client={async call(cap,method,path,authority,dto,opts){opts.validateResponse(v2);return {data:structuredClone(v2)}}};
 const svc=new AppGuestService({}, {guestCrmEnabled:true},{client});svc.owned=async()=>c;
 const result=await svc.timeline({},c.id,{turn_id:v2.receipt.turn_id});
 assert.deepEqual(result.receipt.result.appointment_receipt,v2.receipt.result.appointment_receipt);
 assert.equal(result.conversation_id,c.id);
});
test('retirada CRM durante lectura no publica recibo ni permisos antiguos',async()=>{
 const c={id:'guest-local',remoteId:v2.conversation_id,permissions:['history','sondeo','crm_prepare','callback_schedule'],ownerUserId:null};
 const config={guestCrmEnabled:true};
 const client={async call(cap,method,path,authority,dto,opts){opts.validateResponse(v2);config.guestCrmEnabled=false;return {data:structuredClone(v2)}}};
 const svc=new AppGuestService({},config,{client});svc.owned=async()=>c;
 const result=await svc.timeline({},c.id,{turn_id:v2.receipt.turn_id});
 assert.equal(result.receipt.result.appointment_receipt,undefined);
 assert.deepEqual(result.permissions,['history','sondeo']);
 assert.ok(v2.receipt.result.appointment_receipt);
});
test('el opt-in guest no habilita recibos de cuenta ni suple permisos del receptor',async()=>{
 for(const fields of [{ownerUserId:'account'},{permissions:['history','sondeo']},{permissions:['history','sondeo','crm_prepare']}]){
  const c={id:'guest-local',remoteId:v2.conversation_id,permissions:['history','sondeo','crm_prepare','callback_schedule'],ownerUserId:null,...fields};
  const client={async call(cap,method,path,authority,dto,opts){opts.validateResponse(v2);return {data:v2}}};
  const svc=new AppGuestService({}, {guestCrmEnabled:true},{client});svc.owned=async()=>c;
  await assert.rejects(svc.timeline({},c.id,{turn_id:v2.receipt.turn_id}),{code:'invalid_upstream_response'});
 }
});
