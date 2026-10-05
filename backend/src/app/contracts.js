import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { AppProblem } from './problem.js';
const ajv=new Ajv2020({strict:false,allErrors:false,coerceTypes:false,removeAdditional:false});
addFormats(ajv);
const validators=new Map();
for(const file of ['app-v1-dtos.schema.json','app-context-v1-1.schema.json']){
 const schema=JSON.parse(readFileSync(new URL(`./contracts/${file}`,import.meta.url)));
 const id=schema.$id||`urn:gestadia:${file}`;schema.$id=id;ajv.addSchema(schema);
 for(const name of Object.keys(schema.$defs)) validators.set(name,ajv.compile({$ref:`${id}#/$defs/${name}`}));
}
function unicode(value){
 if(typeof value==='string'&&!value.isWellFormed()) return false;
 if(Array.isArray(value)) return value.every(unicode);
 if(value&&typeof value==='object')return Object.entries(value).every(([k,v])=>k.isWellFormed()&&unicode(v));
 return true;
}
export function validateContract(name,dto,{response=false}={}){
 const valid=validators.get(name);
 if(!valid||!unicode(dto)||!valid(dto)|| (name==='TurnRequest'&&dto.kind==='text'&&!dto.text.trim())) throw new AppProblem(response?502:400,response?'invalid_upstream_response':name.startsWith('ConversationContext')?'invalid_context':'invalid_payload');
 return true;
}
export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const PUBLIC_ID=/^[A-Za-z0-9_-]{1,128}$/;
export const IDEM=/^[A-Za-z0-9._:-]{16,128}$/;
