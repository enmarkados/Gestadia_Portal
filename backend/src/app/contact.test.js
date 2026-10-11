import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { createAppContactService } from "./contact.js";
const url=process.env.GESTADIA_MOBILE_TEST_DATABASE_URL;
const enabled=!!url && new URL(url).hostname==="127.0.0.1" && new URL(url).pathname==="/gestadia_app_test";
test("contexto sin asignación autoritativa ofrece llamada y no crea un chat sondeo",async()=>{
  let opens=0;const db={expediente:{findMany:async()=>[]}};
  const svc=createAppContactService({db,config:{enabled:true},crm:{available:()=>true},conversations:{start:async()=>{opens++;}}});
  assert.deepEqual(await svc.context(null),{kind:"call"});
  await assert.rejects(svc.open({id:"user"},"token",randomUUID()),e=>e.code==="identity_link_required");assert.equal(opens,0);
});
test("solicitud durable: concurrencia/replay no duplican lead/tarea y pérdida remota no se repite",{skip:!enabled},async()=>{
  const db=new PrismaClient({datasourceUrl:url});const scope=`test:${randomUUID()}`;let leads=0,tasks=0;
  const crm={available:()=>true,findOrCreateLead:async()=>{leads++;return"lead1";},createTask:async()=>{tasks++;return"task1";}};
  const svc=createAppContactService({db,config:{},crm,conversations:{}}),input={nombre:"Ana Prueba",telefono:"684460971"},key=randomUUID(), uncertain=randomUUID();
  try {
    const results=await Promise.all([svc.callback(scope,input,key),svc.callback(scope,input,key)]);
    assert.ok(results.some(r=>r.status==="confirmed"));assert.equal(leads,1);assert.equal(tasks,1);
    assert.equal((await svc.callback(scope,input,key)).status,"confirmed");
    await assert.rejects(svc.callback(scope,{...input,telefono:"600000000"},key),e=>e.code==="idempotency_conflict");
    crm.createTask=async()=>{tasks++;throw Error("respuesta perdida");};
    assert.equal((await svc.callback(scope,input,uncertain)).status,"pending_confirmation");
    assert.equal((await svc.callback(scope,input,uncertain)).status,"pending_confirmation");assert.equal(tasks,2);
  } finally { await db.appCallbackRequest.deleteMany({where:{idempotencyKey:{in:[key,uncertain]}}});await db.$disconnect(); }
});
