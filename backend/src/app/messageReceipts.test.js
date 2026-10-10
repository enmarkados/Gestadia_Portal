import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateContract } from "./contracts.js";
import { receiptQuery, validateMessageSnapshot } from "./messageReceipts.js";
const samples = JSON.parse(readFileSync(new URL('../../../docs/integraciones/fixtures/app-message-receipts-v1-samples.json',import.meta.url)));
for(const sample of samples.valid) test(`recibo acordado válido: ${sample.name}`,()=>assert.equal(validateContract(sample.definition,sample.value),true));
for(const sample of samples.invalid) test(`rechaza recibo acordado: ${sample.name}`,()=>assert.throws(()=>validateContract(sample.definition,sample.value),{code:'invalid_payload'}));
test('el selector de recibos no admite coerción, mezclas, IDs duplicados o exceso de lote',()=>{
 assert.deepEqual(receiptQuery({summary:'true'}),{summary:true});
 for(const query of [{summary:true},{summary:'false'},{message_ids:['a']},{message_ids:'a,a'},{message_ids:'a',summary:'true'},{message_ids:Array.from({length:51},(_,i)=>`m${i}`).join(',')}])assert.throws(()=>receiptQuery(query),{code:'invalid_payload'});
});
test('las revisiones y secuencias recibidas conservan el entero de 64 bits y la identidad',()=>{
 const r=samples.valid.find(s=>s.definition==='MessageReceipt').value;
 const snapshot={schema_version:'1.0',conversation_id:'chat-1',message_receipts_revision:'3',items:[r]};
 for(const data of [{...snapshot,conversation_id:'chat-2'},{...snapshot,items:[r,r]},{...snapshot,message_receipts_revision:'9223372036854775808'},{...snapshot,items:[{...r,sequence:'9223372036854775808'}]},{...snapshot,items:[{...r,receipt_revision:'4'}]}])assert.throws(()=>validateMessageSnapshot(data,'chat-1'),{code:'invalid_upstream_response'});
});
