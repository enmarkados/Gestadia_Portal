import {test,mock} from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
test('HTTP notificaciones aísla propietarios y destinos, permite lectura reversible y rechaza campos extra',async t=>{
 const notices=[{id:'n1',userId:'u1',conversationId:'chat-ajeno',leida:false},{id:'n2',userId:'u2',leida:false}];
 const db={notificacion:{findMany:async({where})=>notices.filter(n=>n.userId===where.userId),findFirst:async({where})=>notices.find(n=>n.id===where.id&&n.userId===where.userId),updateMany:async({where,data})=>{const n=notices.find(n=>n.id===where.id&&n.userId===where.userId);if(n)Object.assign(n,data);return {count:n?1:0};}},appConversation:{findFirst:async()=>null},appGuestConversation:{findFirst:async()=>null}};
 mock.module('../db.js',{namedExports:{db}});mock.module('../middleware/auth.js',{namedExports:{requireAuth:(req,res,next)=>{req.user={id:'u1'};next();}}});
 const {portalRouter}=await import(`./portal.js?notices=${Date.now()}`),app=express();app.use(express.json());app.use(portalRouter);
 const server=app.listen(0,'127.0.0.1');t.after(()=>{server.close();mock.reset();});await new Promise(r=>server.on('listening',r));const base=`http://127.0.0.1:${server.address().port}/api/notificaciones`;
 const items=await (await fetch(base)).json();assert.equal(items.length,1);assert.equal(items[0].conversationId,null);
 assert.equal((await fetch(`${base}/n2`)).status,404);
 const patch=(id,body)=>fetch(`${base}/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await patch('n2',{leida:true})).status,404);assert.equal(notices[1].leida,false);
 assert.equal((await patch('n1',{leida:true})).status,200);assert.equal(notices[0].leida,true);
 assert.equal((await patch('n1',{leida:false})).status,200);assert.equal(notices[0].leida,false);
 assert.equal((await patch('n1',{leida:true,userId:'u2'})).status,400);
});
