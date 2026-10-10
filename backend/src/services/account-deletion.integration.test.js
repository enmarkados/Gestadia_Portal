import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
const url = process.env.GESTADIA_MOBILE_TEST_DATABASE_URL;
const enabled =
  !!url &&
  new URL(url).hostname === "127.0.0.1" &&
  ["/gestadia_mobile_test", "/gestadia_app_test"].includes(new URL(url).pathname);
test(
  "Solicitud de borrado exige sesión reciente, retira acceso y registra estado pendiente",
  { skip: !enabled },
  async () => {
    const { createAccountDeletion } = await import("./account-deletion.js");
    const db = new PrismaClient({ datasourceUrl: url });
    const id = randomUUID();
    const svc = createAccountDeletion({ db, conversationConfig: { integrationId: "fixture-deletion" }, seal: value => `fixture:${value}` });
    try {
      const user = await db.user.create({
        data: { email: `${id}@example.com`, nombre: "Fixture", apellidos: "" },
      });
      const session = await db.authSession.create({
        data: {
          id,
          userId: user.id,
          platform: "ios",
          expiresAt: new Date(Date.now() + 100000),
        },
      });
      await db.appDeviceSession.create({ data: { userId: user.id, tokenHash: randomUUID(), deviceLabel: "Fixture", expiresAt: new Date(Date.now() + 100000) } });
      await assert.rejects(
        svc.request(
          { user, session: { ...session, createdAt: new Date(0) } },
          true,
        ),
      );
      await assert.rejects(svc.request({ user, session }, false));
      const result = await svc.request({ user, session }, true);
      assert.equal(result.status, "pending_review");
      assert.ok(
        (await db.user.findUnique({ where: { id: user.id } })).accessRevokedAt,
      );
      assert.ok((await db.authSession.findUnique({ where: { id } })).revokedAt);
      assert.equal(await db.user.count({ where: { id: user.id } }), 1);
      assert.equal(await db.appDeviceSession.count({ where: { userId: user.id, revokedAt: null } }), 0);
      assert.ok(await db.appOperation.findFirst({ where: { userId: user.id, kind: "revocation" } }));
    } finally {
      await db.accountDeletionRequest.deleteMany({
        where: { user: { email: `${id}@example.com` } },
      });
      await db.appDeviceSession.deleteMany({ where: { user: { email: `${id}@example.com` } } });
      await db.appOperation.deleteMany({ where: { user: { email: `${id}@example.com` } } });
      await db.authSession.deleteMany({ where: { id } });
      await db.user.deleteMany({ where: { email: `${id}@example.com` } });
      await db.$disconnect();
    }
  },
);


test('baja de cuenta sin expedientes elimina perfil, asociaciones y credenciales, y comunica resultado', { skip: !enabled }, async (t) => {
  const { createAccountDeletion } = await import('./account-deletion.js');
  const db = new PrismaClient({ datasourceUrl: url });
  const id = randomUUID();
  const mail = [];
  const svc = createAccountDeletion({ db, conversationConfig: {}, seal: value => `fixture:${value}`, open: value => value.slice(8), sendCompletion: async (...args) => mail.push(args) });
  const user = await db.user.create({ data: { email: `${id}@example.test`, nombre: 'Eliminar', apellidos: 'Prueba', telefono: '600000000', numDocumento: 'fixture-no-real', passwordHash: 'fixture', emailVerified: true } });
  t.after(async()=>{await db.accountDeletionRequest.deleteMany({where:{userId:user.id}});await db.socialIdentity.deleteMany({where:{userId:user.id}});await db.authSession.deleteMany({where:{userId:user.id}});await db.user.delete({where:{id:user.id}});await db.$disconnect();});
  const session=await db.authSession.create({data:{id,userId:user.id,platform:'ios',expiresAt:new Date(Date.now()+100000)}});
  await db.socialIdentity.create({data:{userId:user.id,provider:'google',issuer:'https://accounts.google.com',subject:id}});
  const request=await svc.request({user,session},true);
  await svc.process(user.id);
  const removed=await db.user.findUnique({where:{id:user.id}});
  assert.equal(removed.accountStatus,'deleted');assert.equal(removed.passwordHash,null);assert.equal(removed.telefono,null);assert.equal(removed.numDocumento,null);assert.notEqual(removed.email,user.email);assert.notEqual(removed.nombre,user.nombre);
  assert.equal(await db.authSession.count({where:{userId:user.id}}),0);assert.equal(await db.socialIdentity.count({where:{userId:user.id}}),0);
  const result=await db.accountDeletionRequest.findUnique({where:{id:request.id}});
  assert.equal(result.status,'completed');assert.ok(result.completedAt);
  await svc.sendCompletions();assert.equal(mail.length,1);assert.equal(mail[0][0],user.email);
  await svc.sendCompletions();assert.equal(mail.length,1);
  const sent=await db.accountDeletionRequest.findUnique({where:{id:request.id}});assert.equal(sent.contactEmailEncrypted,null);assert.equal(sent.notificationStatus,'accepted');
});

test('baja con expediente mantiene revisión explícita y no destruye la documentación del servicio', { skip: !enabled }, async (t) => {
  const { createAccountDeletion } = await import('./account-deletion.js');const db=new PrismaClient({datasourceUrl:url});const id=randomUUID();
  const user=await db.user.create({data:{email:`${id}@example.test`,nombre:'Conservar',apellidos:'Prueba',passwordHash:'fixture'}});
  const session=await db.authSession.create({data:{id,userId:user.id,platform:'android',expiresAt:new Date(Date.now()+100000)}});
  const e=await db.expediente.create({data:{userId:user.id,nPedido:id,servicioSlug:'transferencia-vehiculo',titulo:'Prueba',importe:1}});
  t.after(async()=>{await db.expediente.deleteMany({where:{userId:user.id}});await db.accountDeletionReview.deleteMany({where:{request:{userId:user.id}}});await db.accountDeletionRequest.deleteMany({where:{userId:user.id}});await db.authSession.deleteMany({where:{userId:user.id}});await db.user.delete({where:{id:user.id}});await db.$disconnect();});
  const messages=[];
  const svc=createAccountDeletion({db,conversationConfig:{},seal:value=>`fixture:${value}`,open:value=>value.slice(8),sendCompletion:async(...args)=>messages.push(args)});await svc.request({user,session},true);await svc.process(user.id);
  const result=await db.accountDeletionRequest.findUnique({where:{userId:user.id}});assert.equal(result.status,'pending_review');assert.equal(result.completedAt,null);assert.ok(result.result.pendingActions.includes('service_retention_review'));
  assert.equal(await db.expediente.count({where:{id:e.id}}),1);assert.equal((await db.user.findUnique({where:{id:user.id}})).passwordHash,null);
  const {createDeletionReview}=await import('./account-deletion-review.js');
  const review=createDeletionReview({db,seal:value=>`fixture:${value}`,open:value=>value.slice(8)});
  const inventory=await review.inventory(user.id);
  assert.equal(JSON.stringify(inventory).includes(user.email),false);
  const decision={actorRef:'fixture-operator',authorityRef:'fixture-approved-policy',inventoryHash:inventory.hash,cases:[{id:e.id,category:'Expediente de prueba',basis:'Conservación aprobada de prueba',criterion:'Hasta finalizar el servicio de prueba'}],remotes:[],profile:{fields:['nombre'],category:'Identificación del expediente',basis:'Gestión de servicio vigente de prueba',criterion:'Hasta finalizar el servicio de prueba'}};
  await assert.rejects(review.record(user.id,{...decision,cases:[{...decision.cases[0],criterion:''}]}));
  await review.record(user.id,decision);
  const extra=await db.expediente.create({data:{userId:user.id,nPedido:randomUUID(),servicioSlug:'transferencia-vehiculo',titulo:'Nueva dependencia',importe:1}});
  await svc.process(user.id);
  assert.equal((await db.accountDeletionRequest.findUnique({where:{userId:user.id}})).status,'pending_review','Una nueva dependencia invalida la revisión anterior');
  await db.expediente.delete({where:{id:extra.id}});
  await svc.process(user.id);
  const completed=await db.accountDeletionRequest.findUnique({where:{userId:user.id}});
  assert.equal(completed.status,'completed');assert.ok(completed.retainedDataEncrypted);
  assert.equal(await db.expediente.count({where:{id:e.id}}),1);
  assert.equal((await db.user.findUnique({where:{id:user.id}})).nombre,'Cuenta eliminada');
  const retained=await review.readRetained(user.id,{actorRef:'fixture-operator',authorityRef:'fixture-service-ticket'});
  assert.deepEqual(retained,{nombre:user.nombre});
  assert.equal(await db.accountDeletionReview.count({where:{requestId:completed.id,action:'retained_read'}}),1);
  await svc.sendCompletions();assert.match(messages[0][2],/Expediente de prueba/);assert.match(messages[0][2],/Hasta finalizar/);
});

test('baja espera revocación Apple y conserva token para reintento, comunicación fallida no rehabilita acceso', {skip:!enabled},async(t)=>{
  const {createAccountDeletion,processAppleRevocations}=await import('./account-deletion.js');const db=new PrismaClient({datasourceUrl:url});const id=randomUUID();
  const user=await db.user.create({data:{email:`${id}@example.test`,nombre:'Apple',apellidos:'Prueba'}});
  t.after(async()=>{await db.socialIdentity.deleteMany({where:{userId:user.id}});await db.authSession.deleteMany({where:{userId:user.id}});await db.accountDeletionRequest.deleteMany({where:{userId:user.id}});await db.user.delete({where:{id:user.id}});await db.$disconnect();});
  const session=await db.authSession.create({data:{id,userId:user.id,platform:'ios',expiresAt:new Date(Date.now()+100000)}});
  const identity=await db.socialIdentity.create({data:{userId:user.id,issuer:'https://appleid.apple.com',provider:'apple',subject:id,appleAudience:'fixture',appleRefreshEncrypted:'fixture:token'}});
  let clock=new Date();let sends=0;
  const svc=createAccountDeletion({db,conversationConfig:{},now:()=>clock,seal:value=>`fixture:${value}`,open:value=>value.slice(8),sendCompletion:async()=>{sends++;throw Error('fixture_smtp_failure')}});
  await svc.request({user,session},true);await svc.process(user.id);
  assert.ok((await db.accountDeletionRequest.findUnique({where:{userId:user.id}})).result.pendingActions.includes('apple_revocation'));
  await processAppleRevocations({db,userId:user.id,open:value=>value.slice(8),revoke:async()=>{throw Error('fixture_provider_failure')}});
  assert.equal((await db.socialIdentity.findUnique({where:{id:identity.id}})).appleRefreshEncrypted,'fixture:token');
  await processAppleRevocations({db,userId:user.id,open:value=>value.slice(8),revoke:async(token)=>{assert.equal(token,'token')}});
  await svc.process(user.id);
  assert.equal((await db.accountDeletionRequest.findUnique({where:{userId:user.id}})).status,'completed');
  await Promise.all([svc.sendCompletions(),svc.sendCompletions()]);assert.equal(sends,1);
  for(let n=0;n<4;n++){clock=new Date(clock.getTime()+61000);await svc.sendCompletions();}
  const exhausted=await db.accountDeletionRequest.findUnique({where:{userId:user.id}});assert.equal(exhausted.notificationStatus,'failed');assert.equal(sends,5);assert.ok(exhausted.contactEmailEncrypted);
  await db.accountDeletionRequest.update({where:{id:exhausted.id},data:{notificationStatus:'sending',notificationLockedUntil:new Date(0)}});
  await svc.sendCompletions();assert.equal((await db.accountDeletionRequest.findUnique({where:{id:exhausted.id}})).notificationStatus,'failed');assert.equal(sends,5);
  assert.equal((await db.user.findUnique({where:{id:user.id}})).accountStatus,'deleted');
});

test('vía externa solo registra baja con titularidad comprobada y referencia operativa; worker ejecuta solicitud', {skip:!enabled},async(t)=>{
  const {createAccountDeletion}=await import('./account-deletion.js');const db=new PrismaClient({datasourceUrl:url});const id=randomUUID();
  const user=await db.user.create({data:{email:`${id}@example.test`,nombre:'Soporte',apellidos:'Fixture',passwordHash:'fixture'}});
  t.after(async()=>{await db.accountDeletionReview.deleteMany({where:{request:{userId:user.id}}});await db.accountDeletionRequest.deleteMany({where:{userId:user.id}});await db.user.delete({where:{id:user.id}});await db.$disconnect();});
  const svc=createAccountDeletion({db,conversationConfig:{},seal:value=>`fixture:${value}`,open:value=>value.slice(8),sendCompletion:async()=>{}});
  await assert.rejects(svc.requestVerified(user.id,{actorRef:'fixture',authorityRef:'fixture-ticket',verified:false}));
  assert.equal(await db.accountDeletionRequest.count({where:{userId:user.id}}),0);
  await svc.requestVerified(user.id,{actorRef:'fixture',authorityRef:'fixture-ticket',verified:true});
  assert.equal(await db.accountDeletionReview.count({where:{request:{userId:user.id},action:'verified_intake'}}),1);
  await svc.runPending({userId:user.id});
  assert.equal((await db.accountDeletionRequest.findUnique({where:{userId:user.id}})).status,'completed');
  assert.equal((await db.user.findUnique({where:{id:user.id}})).passwordHash,null);
});
