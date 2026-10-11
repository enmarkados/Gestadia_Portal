import { Capacitor } from '@capacitor/core';
import { SecureStorage,KeychainAccess } from '@aparajita/capacitor-secure-storage';
import { request,getToken } from './api.js';
const storeKey='gestadia.app-guest-installation';
let cached,opening;
export async function guestInstallation(create=false){
 if(cached===undefined){
  try{cached=Capacitor.isNativePlatform()?await SecureStorage.get(storeKey,false,false):JSON.parse(localStorage.getItem(storeKey)||'null');}catch{cached=null;}
 }
 if(cached && create && Date.parse(cached.expires_at) <= Date.now()){
  cached=null;
  if(Capacitor.isNativePlatform())await SecureStorage.remove(storeKey,false);else localStorage.removeItem(storeKey);
 }
 if(cached)return cached;
 if(!create)return null;
 if(!opening)opening=(async()=>{
  const next=await request('/api/app/guest/installations',{auth:false,method:'POST',body:'{}'});
  if(!/^gg_[A-Za-z0-9_-]{43}$/.test(next.token||'')||!next.installation_id)throw Error('No se pudo conservar la sesión de este dispositivo.');
  if(Capacitor.isNativePlatform())await SecureStorage.set(storeKey,next,false,false,KeychainAccess.whenUnlockedThisDeviceOnly);
  else localStorage.setItem(storeKey,JSON.stringify(next));
  cached=next;return next;
 })().finally(()=>{opening=null;});
 return opening;
}
async function call(path,options={}){
 const installation=await guestInstallation();
 if(!installation&&!getToken())throw Object.assign(Error('La sesión sin registro ha caducado.'),{code:'guest_session_expired'});
 return request(`/api/app/guest${path}`,{...options,headers:{...options.headers,...(installation?{'X-App-Guest':installation.token}:{})}});
}
const encoded=id=>encodeURIComponent(id);
const post=(path,body={},headers={})=>call(path,{method:'POST',body:JSON.stringify(body),headers});
export const guestConversationApi={
 list:async()=>{if(!await guestInstallation()&&!getToken())return {conversations:[]};return call('/conversations');},
 start:async(purpose,caseRef,key,createNew=false,id=null)=>{
  if(purpose!=='sondeo'||caseRef)throw Error('El chat del gestor requiere tu cuenta.');
  await guestInstallation(true);
  return post('/conversations',{purpose:'sondeo',case_ref:null,...(createNew?{create_new:true}:{}),...(id?{conversation_id:id}:{})},{'Idempotency-Key':key});
 },
 timeline:(id,query={})=>call(`/conversations/${encoded(id)}/timeline?${new URLSearchParams(query)}`),
 rename:(id,title)=>call(`/conversations/${encoded(id)}`,{method:'PATCH',body:JSON.stringify({title})}),
 turn:(id,dto)=>post(`/conversations/${encoded(id)}/turns`,dto),
 messageReceipts:(id,query)=>call(`/conversations/${encoded(id)}/message-receipts?${new URLSearchParams(query)}`),
 ackMessages:(id,dto,key)=>post(`/conversations/${encoded(id)}/message-receipts`,dto,{'Idempotency-Key':key}),
 operation:id=>call(`/operations/${encoded(id)}`),retry:id=>post(`/operations/${encoded(id)}/retry`),
 bind:id=>post(`/conversations/${encoded(id)}/bind`),
 handoff:async()=>{throw Object.assign(Error('Solicita la llamada del gestor desde la APP.'),{code:'identity_link_required'});},
};
