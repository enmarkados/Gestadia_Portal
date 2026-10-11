import { createHash,randomBytes,randomUUID } from 'node:crypto';
import { AppProblem } from '../problem.js';
import { AppIdentity,accountProof } from '../identity.js';
import { IDEM,UUID } from '../contracts.js';
import { AppS2SClientV2 } from './s2s.js';
import { validateContractV2 } from './contracts.js';
import { canonicalJson } from '../s2s.js';
import { responseV2 } from './responses.js';
import { receiptQuery, validateMessageSnapshotSemantics } from '../messageReceipts.js';
const hash=value=>createHash('sha256').update(value).digest('hex');
const bad=()=>{throw new AppProblem(400,'invalid_payload');};
const permission=data=>data.effective_permissions?.every(p=>['sondeo','history'].includes(p));
const view=c=>({id:c.id,protocol:'v2',purpose:'sondeo',case_ref:null,title:c.title,status:c.status,ready:!!c.remoteId,metadata_ready:false,created_at:c.createdAt.toISOString(),last_message_at:c.lastMessageAt?.toISOString()||null,expires_at:c.ownerUserId?null:c.expiresAt.toISOString()});
const opView=o=>({id:o.id,operation:o.kind,status:o.status,error_code:o.errorCode,turn_id:o.request.turn_id||null});
export class AppGuestService {
 constructor(db,config,{client=new AppS2SClientV2(config),clock=()=>new Date()}={}) {Object.assign(this,{db,config,client,clock});}
 enabled(){if(!this.config.enabled||!this.config.guestEnabled||!this.config.integrationId)throw new AppProblem(503,'runtime_unavailable');}
 async installation(){
  this.enabled();const token=`gg_${randomBytes(32).toString('base64url')}`;
  const row=await this.db.appGuestInstallation.create({data:{tokenHash:hash(token),expiresAt:new Date(this.clock().getTime()+30*86400000)}});
  return {token,installation_id:row.id,expires_at:row.expiresAt.toISOString()};
 }
 async actor(guestToken,accountToken){
  this.enabled();let installation=null,user=null;
  if(accountToken)({user}=await new AppIdentity(this.db,{clock:this.clock}).authenticate(accountToken));
  if(guestToken){
   if(!/^gg_[A-Za-z0-9_-]{43}$/.test(guestToken))throw new AppProblem(401,'guest_session_expired');
   installation=await this.db.appGuestInstallation.findUnique({where:{tokenHash:hash(guestToken)}});
   if(!installation||installation.revokedAt||installation.expiresAt<=this.clock())throw new AppProblem(401,'guest_session_expired');
  }
  if(!installation&&!user)throw new AppProblem(401,'guest_session_expired');
  return {installation,user,guestToken,accountToken};
 }
 async owned(actor,id,{binding=false}={}){
  if(!UUID.test(id||''))bad();
  const c=await this.db.appGuestConversation.findUnique({where:{id}});
  if(!c||c.integrationId!==this.config.integrationId)throw new AppProblem(404,'conversation_not_found');
  const fresh=await this.actor(actor.guestToken,actor.accountToken);
  if(c.ownerUserId){if(fresh.user?.id!==c.ownerUserId)throw new AppProblem(404,'conversation_not_found');}
  else if(fresh.installation?.id!==c.installationId||(!binding&&c.expiresAt<=this.clock()))throw new AppProblem(404,'conversation_not_found');
  return c;
 }
 authority(c){return {subject:c.id,actor:c.ownerUserId?`account:${c.ownerUserId}`:`guest:${c.installationId}`,access_revision:c.accessRevision};}
 async list(actor){
  const fresh=await this.actor(actor.guestToken,actor.accountToken);
  const where={integrationId:this.config.integrationId,OR:[...(fresh.installation?[{installationId:fresh.installation.id,ownerUserId:null,expiresAt:{gt:this.clock()}}]:[]),...(fresh.user?[{ownerUserId:fresh.user.id}]:[])]};
  return {conversations:(await this.db.appGuestConversation.findMany({where,orderBy:{createdAt:'desc'},take:100})).map(view)};
 }
 async start(actor,input,key){
  if(!input||Object.keys(input).some(k=>!['purpose','case_ref','create_new','conversation_id'].includes(k))||input.purpose!=='sondeo'||input.case_ref!=null||!IDEM.test(key||'')||(input.create_new!=null&&typeof input.create_new!=='boolean')||(input.conversation_id!=null&&!UUID.test(input.conversation_id))||(input.create_new&&input.conversation_id))bad();
  if(input.conversation_id){const c=await this.owned(actor,input.conversation_id);if(c.remoteId)return {conversation:view(c)};const operation=await this.db.appGuestOperation.findFirst({where:{conversationId:c.id,kind:'session'}});return this.dispatch(actor,c,operation);}
  if(!actor.installation)throw new AppProblem(401,'guest_session_expired');
  // The installation lock makes a repeated start key select its original subject.
  const pair=await this.db.$transaction(async tx=>{
   await tx.$queryRaw`SELECT id FROM AppGuestInstallation WHERE id=${actor.installation.id} FOR UPDATE`;
   const existing=await tx.appGuestOperation.findFirst({where:{kind:'session',key,conversationId:{in:(await tx.appGuestConversation.findMany({where:{installationId:actor.installation.id,integrationId:this.config.integrationId},select:{id:true}})).map(c=>c.id)}}});
   if(existing)return {c:await tx.appGuestConversation.findUnique({where:{id:existing.conversationId}}),o:existing};
   const id=randomUUID(),attested=this.clock(),expires=new Date(attested.getTime()+86400000);
   const c=await tx.appGuestConversation.create({data:{id,installationId:actor.installation.id,integrationId:this.config.integrationId,expiresAt:expires}});
   const request={schema_version:'2.0',conversation_subject_id:id,purpose:'sondeo',identity:{kind:'guest',actor_id:actor.installation.id,attested_at:attested.toISOString(),expires_at:expires.toISOString(),method:'installation_session'},correlation_id:randomUUID()};
   const o=await tx.appGuestOperation.create({data:{conversationId:id,kind:'session',key,hash:hash(canonicalJson(input)),request}});return {c,o};
  });
  if(pair.o.hash!==hash(canonicalJson(input)))throw new AppProblem(409,'idempotency_conflict');
  return this.dispatch(actor,pair.c,pair.o);
 }
 async dispatch(actor,c,o){
  c=await this.owned(actor,c.id);
  if(o.status==='admitted'||o.status==='failed')return o.kind==='session'?{conversation:view(c),operation:opView(o)}:opView(o);
  const claimId=randomUUID();
  const lock=await this.db.appGuestOperation.updateMany({where:{id:o.id,OR:[{status:{in:['prepared','outcome_unknown']}},{status:'dispatching',leaseUntil:{lte:this.clock()}}]},data:{status:'dispatching',claimId,leaseUntil:new Date(this.clock().getTime()+60000)}});
  if(!lock.count)return o.kind==='session'?{conversation:view(c),operation:opView({...o,status:'outcome_unknown'})}:opView({...o,status:'outcome_unknown'});
  const isSession=o.kind==='session',path=isSession?'/sessions':`/sessions/${c.remoteId}/turns`;
  try {
   // Exact DTO/key are durable. Retrying never changes attestation, text, or action.
   const authority=isSession?{...this.authority(c),access_revision:'0'}:this.authority(c);
   const r=await this.client.call(isSession?'app.sessions.write':'app.turns.write','POST',path,authority,o.request,{idempotencyKey:o.key,validateResponse:responseV2(isSession?'SessionAck':'Receipt',data=>isSession?data.conversation_subject_id===c.id&&data.actor===authority.actor&&data.access_revision==='1'&&permission(data):data.conversation_id===c.remoteId&&data.turn_id===o.request.turn_id&&data.operation==='turn')});
   // A revoked/expired credential or changed owner cannot apply a late response.
   await this.owned(actor,c.id);
   const updated=await this.db.$transaction(async tx=>{
    await tx.$queryRaw`SELECT id FROM AppGuestConversation WHERE id=${c.id} FOR UPDATE`;
    const currentOp=await tx.appGuestOperation.findUnique({where:{id:o.id}});
    if(currentOp.claimId!==claimId || currentOp.status==='admitted')return currentOp;
    const latest=await tx.appGuestConversation.findUnique({where:{id:c.id}});
    if(latest.ownerUserId!==c.ownerUserId||latest.accessRevision!==c.accessRevision)throw new AppProblem(409,'stale_access');
    if(isSession)await tx.appGuestConversation.update({where:{id:c.id},data:{remoteId:r.data.conversation_id,accessRevision:r.data.access_revision,status:r.data.conversation_status,permissions:r.data.effective_permissions}});
    return tx.appGuestOperation.update({where:{id:o.id},data:{response:r.data,remoteOperationId:r.data.operation_id,status:'admitted'}});
   });
   c=await this.owned(actor,c.id);return isSession?{conversation:view(c),operation:opView(updated)}:opView(updated);
  }catch(error){
   const definitive=error.status>=400&&error.status<500&&![408,429].includes(error.status);
   await this.db.appGuestOperation.updateMany({where:{id:o.id,claimId,status:'dispatching'},data:{status:definitive?'failed':'outcome_unknown',errorCode:error.code||'outcome_unknown'}});
   const updated=await this.db.appGuestOperation.findUnique({where:{id:o.id}});
   c=await this.owned(actor,c.id);
   return isSession?{conversation:view(c),operation:opView(updated)}:opView(updated);
  }
 }
 async turn(actor,id,dto){
  const c=await this.owned(actor,id);if(!c.remoteId)throw new AppProblem(409,'binding_in_progress');
  if(!dto||!UUID.test(dto.turn_id||'')||Object.keys(dto).some(k=>!['schema_version','turn_id','kind','text','presentation_id','presentation_revision','action_id','correlation_id'].includes(k)))bad();
  const request={...dto,schema_version:'2.0'};validateContractV2(dto.kind==='text'?'textTurn':'actionTurn',request);const digest=hash(canonicalJson(request));let o;
  try{o=await this.db.appGuestOperation.create({data:{conversationId:id,kind:'turn',key:dto.turn_id,hash:digest,request}});}catch(e){if(e.code!=='P2002')throw e;o=await this.db.appGuestOperation.findUnique({where:{conversationId_kind_key:{conversationId:id,kind:'turn',key:dto.turn_id}}});}
  if(o.hash!==digest)throw new AppProblem(409,'idempotency_conflict');return this.dispatch(actor,c,o);
 }
 async operation(actor,id,retry=false){
  const o=await this.db.appGuestOperation.findUnique({where:{id}});if(!o)throw new AppProblem(404,'operation_not_found');const c=await this.owned(actor,o.conversationId);
  if(retry)return this.dispatch(actor,c,o);return opView(o);
 }
 async timeline(actor,id,query){
  const c=await this.owned(actor,id);if(!c.remoteId)throw new AppProblem(409,'binding_in_progress');
  const kind=query.turn_id?'ReceiptLookup':'Timeline';
  const r=await this.client.call('app.timeline.read','GET',`/sessions/${c.remoteId}/timeline`,this.authority(c),undefined,{query,validateResponse:responseV2(kind,d=>d.conversation_id===c.remoteId)});
  await this.owned(actor,id);
  if(kind==='Timeline')await this.db.appGuestConversation.update({where:{id},data:{status:r.data.conversation_status,lastMessageAt:r.data.last_message_at?new Date(r.data.last_message_at):null}});
  return {...r.data,conversation_id:id,permissions:c.permissions || [],metadata_ready:true};
 }
 async receipts(actor,id,query,dto,key){
  const c=await this.owned(actor,id);if(!c.remoteId)throw new AppProblem(409,'binding_in_progress');
  const name=dto?'MessageReceiptAckResponse':query.summary==='true'?'MessageReceiptSummary':'MessageReceiptSnapshot';
  const request=dto?{...dto,schema_version:'2.0'}:undefined;
  if(dto){validateContractV2('messageReceiptAck',request);if(!IDEM.test(key||''))bad();}else receiptQuery(query);
  const r=await this.client.call(dto?'app.turns.write':'app.timeline.read',dto?'POST':'GET',`/sessions/${c.remoteId}/message-receipts`,this.authority(c),request,{...(dto?{idempotencyKey:key}:{query}),validateResponse:responseV2(name,d=>{
   // r4 keeps v1 receipt semantics; only the envelope version changes.
   validateMessageSnapshotSemantics(d,c.remoteId,{query,ack:dto});return true;
  })});
  await this.owned(actor,id);return {...r.data,conversation_id:id};
 }
 async rename(actor,id,input){
  const c=await this.owned(actor,id);if(!input||Object.keys(input).length!==1||!Object.hasOwn(input,'title')||input.title!==null&&(typeof input.title!=='string'||!input.title.trim()||[...input.title].length>120||/\p{Cc}/u.test(input.title)))bad();
  return view(await this.db.appGuestConversation.update({where:{id:c.id},data:{title:input.title?.trim().normalize('NFC')||null}}));
 }
 async bind(actor,id){
  if(!actor.user||!actor.installation)throw new AppProblem(403,'identity_verification_required');
  const c=await this.owned(actor,id,{binding:true});if(c.ownerUserId)return view(c);if(!c.remoteId)throw new AppProblem(409,'binding_in_progress');
  let binding=await this.db.appGuestBinding.findUnique({where:{conversationId:id}});
  if(!binding){
   if(c.expiresAt<=this.clock())throw new AppProblem(403,'guest_session_expired');
   const bindingId=randomUUID(),request={schema_version:'2.0',binding_id:bindingId,conversation_subject_id:id,source_guest_id:c.installationId,target_portal_user_id:actor.user.id,expected_access_revision:c.accessRevision,verified_account_identity:{kind:'account',actor_id:actor.user.id,attested_at:this.clock().toISOString(),...accountProof(actor.user)},source_control_ref:hash(actor.guestToken),correlation_id:randomUUID()};
   try{binding=await this.db.appGuestBinding.create({data:{id:bindingId,conversationId:id,targetUserId:actor.user.id,request}});}catch(e){if(e.code!=='P2002')throw e;binding=await this.db.appGuestBinding.findUnique({where:{conversationId:id}});}
  }
  if(binding.targetUserId!==actor.user.id)throw new AppProblem(409,'binding_conflict');
  const preparing=binding.status==='preparing';
  const request={...binding.request,phase:preparing?'prepare':'commit'};
  const authority={subject:id,actor:preparing?`guest:${c.installationId}`:`account:${actor.user.id}`,access_revision:binding.request.expected_access_revision};
  const r=await this.client.call('app.bindings.write','POST',`/sessions/${c.remoteId}/bindings`,authority,request,{idempotencyKey:`${binding.id}:${request.phase}`,validateResponse:responseV2('BindingAck',d=>d.binding_id===binding.id&&d.conversation_id===c.remoteId&&permission(d)&&BigInt(d.access_revision)===BigInt(binding.request.expected_access_revision)+(d.status==='committed'?1n:0n))});
  await this.owned(actor,id,{binding:true});
  binding=await this.db.$transaction(async tx=>{
   await tx.$queryRaw`SELECT id FROM User WHERE id=${actor.user.id} FOR UPDATE`;
   await new AppIdentity(tx,{clock:this.clock}).authenticate(actor.accountToken);
   await tx.$queryRaw`SELECT id FROM AppGuestConversation WHERE id=${id} FOR UPDATE`;
   const latest=await tx.appGuestConversation.findUnique({where:{id}}),current=await tx.appGuestBinding.findUnique({where:{id:binding.id}});
   if(latest.ownerUserId && latest.ownerUserId!==actor.user.id)throw new AppProblem(409,'binding_conflict');
   if(current.status==='committed')return current;
   if(latest.accessRevision!==binding.request.expected_access_revision)throw new AppProblem(409,'stale_access');
   if(r.data.status==='committed')await tx.appGuestConversation.update({where:{id},data:{ownerUserId:actor.user.id,accessRevision:r.data.access_revision,permissions:r.data.effective_permissions}});
   return tx.appGuestBinding.update({where:{id:binding.id},data:{response:r.data,status:r.data.status==='committed'?'committed':r.data.status==='prepared'?'prepared':current.status}});
  });
  if(binding.status==='committed')return view(await this.owned(actor,id));
  if(r.data.status==='prepared'&&preparing)return this.bind(actor,id);
  if(r.data.status==='prepared')throw new AppProblem(502,'invalid_upstream_response');
  throw new AppProblem(409,'binding_in_progress');
 }
}
