import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AppGuestService } from './guest.js';

const conversationId='22222222-2222-4222-8222-222222222222';
const turnId='11111111-1111-4111-8111-111111111111';
const correlationId='33333333-3333-4333-8333-333333333333';

function inputBoundary(){
 let saved;
 const db={appGuestOperation:{
  async create({data}){if(saved)throw Object.assign(new Error('duplicate'),{code:'P2002'});return saved={...data,id:'local-operation',status:'prepared'};},
  async findUnique(){return saved;},
 }};
 const service=new AppGuestService(db,{}, {client:{}});
 // Authorization and delivery are external to input normalization; no DB or S2S I/O.
 service.owned=async()=>({id:conversationId,remoteId:'remote-conversation'});
 service.dispatch=async(_actor,_conversation,operation)=>({id:operation.id,request:structuredClone(operation.request)});
 return service;
}

test('guest APP text without correlation keeps one normalized request on replay',async()=>{
 const service=inputBoundary(),dto={turn_id:turnId,kind:'text',text:'Consulta informativa'};
 const first=await service.turn({},conversationId,dto);
 assert.deepEqual(first.request,{...dto,schema_version:'2.0',correlation_id:turnId});
 const replay=await service.turn({},conversationId,dto);
 assert.equal(replay.id,first.id);
 assert.deepEqual(replay.request,first.request);
 await assert.rejects(service.turn({},conversationId,{...dto,text:'Otra consulta'}),{code:'idempotency_conflict'});
});

test('guest APP preserves explicit correlation and rejects invalid explicit values',async()=>{
 const dto={turn_id:turnId,kind:'text',text:'Consulta informativa'};
 const valid=await inputBoundary().turn({},conversationId,{...dto,correlation_id:correlationId});
 assert.equal(valid.request.correlation_id,correlationId);
 for(const value of [null,'','x'.repeat(129)])await assert.rejects(inputBoundary().turn({},conversationId,{...dto,correlation_id:value}),{code:'invalid_payload'});
});
