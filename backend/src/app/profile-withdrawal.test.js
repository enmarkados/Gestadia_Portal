import {test} from 'node:test';
import assert from 'node:assert/strict';
import {deliverLifecycle} from './lifecycle.js';
test('retirar permisos con el mismo parche no espera el contexto de resultado incierto',async()=>{
 const old={id:'old',userId:'user',integrationId:'fixture',conversationId:'chat',kind:'context',status:'outcome_unknown',request:{context_revision:'1',profile_revision:'1',profile:{email:'a@example.test'},permissions:['history','sondeo']}};
 const withdrawal={...old,id:'withdrawal',status:'prepared',request:{...old.request,context_revision:'2',permissions:[]}};
 const c={id:'chat',remoteId:'remote',contextRevision:'2',syncedRevision:'0',profileRevision:'1',context:withdrawal.request};
 const rows=[old,withdrawal];
 const db={user:{findUnique:async()=>({accountStatus:'active'})},appConversation:{findUnique:async()=>c},appOperation:{findMany:async()=>rows,findUnique:async({where})=>rows.find(r=>r.id===where.id),update:async({where,data})=>Object.assign(rows.find(r=>r.id===where.id),data)},$queryRaw:async()=>[], $transaction:async f=>f(db)};
 let attempts=0;
 await deliverLifecycle(db,{call:async()=>{attempts++;throw new Error('offline boundary')}},{enabled:true,integrationId:'fixture'},withdrawal);
 assert.equal(attempts,1);
 assert.equal(old.status,'outcome_unknown');
 assert.deepEqual(withdrawal.request.profile,old.request.profile);
});
