import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateContract} from './contracts.js';
import {validateContractV2} from './v2/contracts.js';
import {signRequest,semanticHash} from './s2s.js';
import {signRequestV2} from './v2/s2s.js';
const fixture=n=>JSON.parse(readFileSync(new URL(`../../../docs/integraciones/fixtures/${n}-perfil-20261011.json`,import.meta.url)));
const v1=fixture('app-context-v1-1-vectors'), v2=fixture('app-v2-vectors');
for(const v of v1.positives.filter(v=>v.id.startsWith('profile-')))test(`perfil v1 esquema y bytes: ${v.id}`,()=>{
 const bytes=Buffer.from(v.body_base64,'base64'), dto=JSON.parse(bytes);
 assert.equal(validateContract('ConversationContextRequest',dto),true);
 const s=signRequest(v,bytes,Buffer.from(v1.keys_hex[v.key_id],'hex'));
 assert.equal(s.signature,v.signature);assert.equal(s.canonical,v.canonical);
 assert.equal(semanticHash('context',v.subject,v.encoded_path.split('/').at(-2),dto),v.semantic_sha256);
});
for(const v of v2.vectors.filter(v=>v.name==='profile-account'))test('perfil v2 esquema y firma de cuenta',()=>{
 const dto=JSON.parse(v.body_json);assert.equal(validateContractV2('context',dto),true);
 const s=signRequestV2({...v,encoded_path:v.path,canonical_query:v.query},Buffer.from(v.body_json),Buffer.from(v2.secret_base64,'base64'));
 assert.equal(s.signature,v.signature);assert.equal(s.canonical,v.canonical);
});
test('perfil cerrado exige revisión emparejada y confirma zona sin coacción',()=>{
 const good=JSON.parse(Buffer.from(v1.positives.find(v=>v.id==='profile-account-data').body_base64,'base64'));
 for(const modify of [d=>delete d.profile_revision,d=>delete d.profile,d=>d.profile_revision='01',d=>d.profile.callback_consent=null,d=>d.profile.agent_id=119,d=>{d.profile={time_zone_confirmed:true}},d=>{d.profile.callback_phone='600111222'}]){
  const bad=structuredClone(good);modify(bad);assert.throws(()=>validateContract('ConversationContextRequest',bad),{code:'invalid_context'});
 }
});

test('v2 valida email de perfil y no acepta un texto arbitrario',()=>{
 const good=JSON.parse(v2.vectors.find(v=>v.name==='profile-account').body_json);
 good.profile.email='no es un email';
 assert.throws(()=>validateContractV2('context',good),{code:'invalid_payload'});
});
