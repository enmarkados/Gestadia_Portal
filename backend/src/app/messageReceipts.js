import { validateContract } from "./contracts.js";
import { AppProblem } from "./problem.js";
export function receiptQuery(query) {
  if (!query || Object.keys(query).length !== 1) throw new AppProblem(400,"invalid_payload");
  let normalized;
  if (typeof query.message_ids === "string") normalized={message_ids:query.message_ids.split(",")};
  else if (query.summary === "true") normalized={summary:true};
  else if (typeof query.turn_id === "string") normalized={turn_id:query.turn_id};
  else throw new AppProblem(400,"invalid_payload");
  validateContract("MessageReceiptQuery",normalized);
  return normalized;
}
export function validateMessageSnapshot(data,remoteId,{query,ack}={}) {
  const summary=query?.summary === "true";
  validateContract(ack?"MessageReceiptAckResponse":summary?"MessageReceiptSummary":"MessageReceiptSnapshot",data,{response:true});
  const bad=()=>{throw new AppProblem(502,"invalid_upstream_response");};
  if(data.conversation_id!==remoteId || (ack && data.ack_id!==ack.ack_id)) bad();
  const items=summary?(data.last_message?.receipt?[data.last_message.receipt]:[]):data.items;
  const ids=new Set(items.map(m=>m.message_id));
  if(ids.size!==items.length)bad();
  const requested=ack?.message_ids||(query?.message_ids?.split(","));
  if(requested&&(ids.size!==requested.length||requested.some(id=>!ids.has(id))))bad();
  if(ack&&items.some(m=>!["assistant","operator"].includes(m.role)))bad();
  if(query?.turn_id&&items.some(m=>m.role==="user"&&m.turn_id!==query.turn_id))bad();
  const max=9223372036854775807n;
  if(BigInt(data.message_receipts_revision)>max)bad();
  for(const m of items) {
    if(BigInt(m.sequence)>max||BigInt(m.receipt_revision)>BigInt(data.message_receipts_revision))bad();
    if(ack&&(ack.state==="read"?m.delivery_status!=="read":m.delivery_status==="sent"))bad();
  }
  const last=data.last_message;
  if(last?.receipt&&(last.message_id!==last.receipt.message_id||last.sequence!==last.receipt.sequence||last.role!==last.receipt.role))bad();
  if(last&&BigInt(last.sequence)>max)bad();
  return data;
}
