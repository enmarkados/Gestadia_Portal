import { createHash } from 'node:crypto';
import { accountTransaction } from '../app/store.js';
import { sealCredential, openCredential } from './mobile-crypto.js';

export const retainedProfileFields = ['email','nombre','apellidos','telefono','tipoDocumento','numDocumento','zohoContactId','stripeCustomerId'];
const text = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 1000;
const reason = value => value && text(value.category) && text(value.basis) && text(value.criterion);
const sameIds = (expected, actual) => JSON.stringify([...expected].sort()) === JSON.stringify([...actual].sort());

// Devuelve referencias y una huella, nunca el perfil ni los documentos privados.
export async function deletionInventory(tx, userId) {
  const request = await tx.accountDeletionRequest.findUnique({where:{userId},include:{user:true}});
  if (!request || !request.user.accessRevokedAt) throw new Error('deletion_request_not_found');
  const cases = await tx.expediente.findMany({where:{userId},select:{id:true,updatedAt:true,documentos:{select:{id:true}}},orderBy:{id:'asc'}});
  const conversations = await tx.appConversation.findMany({where:{userId},select:{id:true,remoteId:true,integrationId:true},orderBy:{id:'asc'}});
  const remotes = [
    ...(request.user.zohoContactId ? [{key:'zoho',reference:request.user.zohoContactId}] : []),
    ...(request.user.stripeCustomerId ? [{key:'stripe',reference:request.user.stripeCustomerId}] : []),
    ...conversations.map(c=>({key:`lidia:${c.id}`,reference:c.remoteId || c.id,integrationId:c.integrationId})),
  ];
  const profile = Object.fromEntries(retainedProfileFields.map(field=>[field,request.user[field]]));
  const hash = createHash('sha256').update(JSON.stringify({requestId:request.id,profile,cases:cases.map(c=>({...c,documentos:c.documentos.map(d=>d.id).sort()})),remotes})).digest('hex');
  return {requestId:request.id,status:request.status,hash,cases:cases.map(c=>({id:c.id,documentCount:c.documentos.length})),remotes};
}

export function validateDeletionDecision(decision, inventory) {
  if (!decision || !text(decision.actorRef) || !text(decision.authorityRef) || decision.inventoryHash !== inventory.hash) throw new Error('deletion_review_stale_or_unauthorized');
  if (!Array.isArray(decision.cases) || !Array.isArray(decision.remotes) || !sameIds(inventory.cases.map(c=>c.id),decision.cases.map(c=>c.id)) || !sameIds(inventory.remotes.map(r=>r.key),decision.remotes.map(r=>r.key))) throw new Error('deletion_review_incomplete');
  if (decision.cases.some(c=>!reason(c))) throw new Error('retention_reason_required');
  if (decision.remotes.some(r=>!['erased','retained'].includes(r.outcome) || !text(r.evidenceRef) || (r.outcome === 'retained' && !reason(r)))) throw new Error('remote_receipt_required');
  if (decision.profile && (!reason(decision.profile) || !Array.isArray(decision.profile.fields) || !decision.profile.fields.length || decision.profile.fields.some(f=>!retainedProfileFields.includes(f)))) throw new Error('invalid_retained_profile');
  if (decision.profile && !decision.cases.length && !decision.remotes.some(r=>r.outcome==='retained')) throw new Error('retained_profile_without_service');
  return decision;
}

export function createDeletionReview({db,seal=sealCredential,open=openCredential}) {
  return {
    inventory(userId) {return accountTransaction(db,userId,tx=>deletionInventory(tx,userId));},
    record(userId,decision) {return accountTransaction(db,userId,async tx=>{
      const inventory=await deletionInventory(tx,userId);
      if(inventory.status==='completed') throw new Error('deletion_already_completed');
      validateDeletionDecision(decision,inventory);
      return tx.accountDeletionReview.create({data:{requestId:inventory.requestId,actorRef:decision.actorRef,authorityRef:decision.authorityRef,inventoryHash:inventory.hash,decision}});
    });},
    readRetained(userId,{actorRef,authorityRef}) {return accountTransaction(db,userId,async tx=>{
      if(!text(actorRef)||!text(authorityRef)) throw new Error('retention_access_reason_required');
      const request=await tx.accountDeletionRequest.findUnique({where:{userId}});
      if(!request?.retainedDataEncrypted) throw new Error('retained_data_not_found');
      await tx.accountDeletionReview.create({data:{requestId:request.id,action:'retained_read',actorRef,authorityRef,inventoryHash:'completed',decision:{reason:authorityRef}}});
      return JSON.parse(open(request.retainedDataEncrypted,`retention:${request.id}`));
    });},
  };
}
