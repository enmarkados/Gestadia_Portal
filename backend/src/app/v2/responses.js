import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { AppProblem } from '../problem.js';
import { validAppointmentReceipts } from '../appointment-receipts.js';
const schema=JSON.parse(readFileSync(new URL('./contracts/app-v2-responses.schema.json',import.meta.url)));
const ajv=new Ajv2020({strict:false,coerceTypes:false,removeAdditional:false});addFormats(ajv);ajv.addSchema(schema);
const validators=new Map(Object.keys(schema.$defs).map(name=>[name,ajv.compile({$ref:`${schema.$id}#/$defs/${name}`})]));
export function responseV2(name, extra=()=>true) {
 return data=> { if(!validators.get(name)?.(data) || (['Receipt','ReceiptLookup','Timeline'].includes(name)&&!validAppointmentReceipts(data)) || !extra(data)) throw new AppProblem(502,'invalid_upstream_response'); return true; };
}
