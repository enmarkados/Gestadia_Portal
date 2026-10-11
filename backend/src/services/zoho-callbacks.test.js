import test from "node:test";
import assert from "node:assert/strict";
import { createZohoCallbackAdapter, callbackPhone } from "./zoho-callbacks.js";
test("teléfono normalizado y lead existente producen tarea en ese lead sin duplicarlo", async () => {
  const calls=[];const svc=createZohoCallbackAdapter({enabled:()=>true,lead:async()=>{throw Error("no debe crear");},send:async(path,opts)=>{calls.push({path,opts});return path.includes("/search?")?{data:[{id:"12345",Phone:"684 460 971"}]}:path.endsWith('/Leads/12345')?{data:[{id:"12345",Owner:{id:"owner1"}}]}:{data:[{status:"success",details:{id:"task1"}}]};}});
  const telefono=callbackPhone("684 460 971");assert.equal(telefono,"+34684460971");
  const leadId=await svc.findOrCreateLead({nombre:"Ana Prueba",telefono});
  assert.equal(leadId,"12345");await svc.createTask({id:"request1",leadId,payload:{nombre:"Ana Prueba",telefono}});
  const task=JSON.parse(calls.at(-1).opts.body).data[0];assert.equal(task.What_Id.id,"12345");assert.equal(task.$se_module,"Leads");assert.equal(task.Owner.id,"owner1");assert.equal(task.Who_Id,undefined);
});
test("una llamada de contacto crea tarea para su propietario; no acepta un registro distinto",async()=>{
  let body;const svc=createZohoCallbackAdapter({enabled:()=>true,send:async(path,opts)=>opts?(body=JSON.parse(opts.body),{data:[{status:"success",details:{id:"task1"}}]}):{data:[{id:"12345",Owner:{id:"owner1"}}]}});
  await svc.createTask({id:"request1",contactId:"12345",payload:{nombre:"Ana",telefono:"+34684460971"}});
  assert.equal(body.data[0].Who_Id.id,"12345");assert.equal(body.data[0].$se_module,"Contacts");assert.equal(body.data[0].What_Id,undefined);
  await assert.rejects(svc.createTask({id:"request2",contactId:"67890",payload:{nombre:"Ana",telefono:"+34684460971"}}),/Asignación CRM/);
});
test("sin lead crea uno; contacto de otro usuario no resuelve gestor",async()=>{
  let created=0;const svc=createZohoCallbackAdapter({enabled:()=>true,lead:async()=>{created++;return"lead1";},send:async()=>({data:[]})});
  assert.equal(await svc.findOrCreateLead({nombre:"Ana",telefono:callbackPhone("0034684460971")}),"lead1");assert.equal(created,1);
  const other=createZohoCallbackAdapter({enabled:()=>true,send:async()=>({data:[{Contact_Name:{id:"other"},Owner:{id:"owner",name:"Otro gestor"}}]})});
  assert.equal(await other.assignedManager("12345","67890"),null);
  assert.throws(()=>callbackPhone("hello"));
});
