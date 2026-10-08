import React from "react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Link } from "react-router-dom";
import { AppProvider } from "./AppContext.jsx";
import AppConversation from "./AppConversation.jsx";
import ConnectedMessages from "./ConnectedMessages.jsx";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { setToken } from "./api.js";
const nativeBridge = vi.hoisted(() => ({ getState: vi.fn(), addListener: vi.fn() }));
vi.mock("@capacitor/app", () => ({ App: nativeBridge }));
const user = "11111111-1111-4111-8111-111111111111";
const item = (id, role, sequence) => ({ message_id:id, role, sequence, text:`Texto ${id}`, occurred_at:"2026-10-08T10:00:00.000Z", presentation:null });
const messages = { "chat-1":[item("own","user","1"),item("incoming","operator","2"),item("below","operator","3")], "chat-2":[item("other","user","1")] };
const rows = Object.keys(messages).map(id => ({id,purpose:"sondeo",case_ref:null,ready:true,metadata_ready:true,status:"active",title:id,created_at:"2026-10-08T10:00:00.000Z",last_message_at:"2026-10-08T10:00:00.000Z"}));
function receipt(m, state="sent", revision="0", agent=false) {
 return { message_id:m.message_id,sequence:m.sequence,role:m.role,turn_id:null,stored_at:m.occurred_at,delivery_status:state,received_at:state==="sent"?null:m.occurred_at,received_by:state==="sent"?null:m.role==="user"?(agent?"agent":"operator"):"account",read_at:state==="read"?m.occurred_at:null,read_by:state==="read"?(m.role==="user"?"operator":"account"):null,receipt_revision:revision };
}
let hidden, observers, acks, reads, receipts, loseReply, oldReply;
const response = data => ({ok:true,status:200,json:async()=>structuredClone(data)});
beforeEach(()=>{
 sessionStorage.clear();localStorage.clear();setToken("ga_test");
 window.GESTADIA_APP_CONFIG={demoOnly:false,demoEnabled:false,conversationsEnabled:true};
 hidden=false;observers=new Set();acks=[];reads=[];loseReply=false;oldReply=null;
 receipts=Object.fromEntries(Object.values(messages).flat().map(m=>[m.message_id,receipt(m)]));
 vi.spyOn(document,"visibilityState","get").mockImplementation(()=>hidden?"hidden":"visible");
 vi.spyOn(document,"hidden","get").mockImplementation(()=>hidden);
 vi.stubGlobal("IntersectionObserver",class {
  constructor(callback,options){this.callback=callback;this.nodes=new Set();this.options=options;observers.add(this);}
  observe(n){observers.add(this);this.nodes.add(n);}unobserve(n){this.nodes.delete(n);}disconnect(){this.nodes.clear();observers.delete(this);}
 });
 vi.stubGlobal("fetch",vi.fn(async(url,options={})=>{
  if(url==="/api/me")return response({id:user,nombre:"Local",apellidos:"Prueba",email:"local@example.test"});
  if(["/api/expedientes","/api/notificaciones"].includes(url))return response([]);
  if(url==="/api/app/v1/conversations")return response({conversations:rows});
  const parsed=new URL(url,"http://localhost"),id=parsed.pathname.split("/")[5];
  if(parsed.pathname.endsWith("/timeline"))return response({conversation_id:id,items:messages[id],next_cursor:null,has_more:false,state_revision:"1",conversation_status:"active",permissions:["history","sondeo"],pending_operations:[],turn_statuses:[],support:{status:"none",operator_display_name:null}});
  if(parsed.pathname.endsWith("/message-receipts")){
   if(options.method==="POST"){
    const body=JSON.parse(options.body);acks.push({id,body,key:new Headers(options.headers).get("Idempotency-Key")});
    const duplicate=body.message_ids.every(mid=>receipts[mid].delivery_status===body.state || receipts[mid].delivery_status==="read");
    for(const mid of body.message_ids)if(receipts[mid].delivery_status!=="read")receipts[mid]=receipt(messages[id].find(m=>m.message_id===mid),body.state,body.state==="read"?"2":"1");
    if(loseReply){loseReply=false;throw new TypeError("Respuesta perdida");}
    return response({schema_version:"1.0",conversation_id:id,message_receipts_revision:"10",ack_id:body.ack_id,acked_at:"2026-10-08T10:00:00.000Z",duplicate,items:body.message_ids.map(mid=>receipts[mid])});
   }
   reads.push(url);
   if(parsed.searchParams.get("summary")==="true"){
    const {presentation,...last}=messages[id].at(-1);
    return response({schema_version:"1.0",conversation_id:id,message_receipts_revision:"10",last_message:{...last,receipt:receipts[last.message_id]}});
   }
   const data={schema_version:"1.0",conversation_id:id,message_receipts_revision:"10",items:(parsed.searchParams.get("message_ids")||"").split(",").map(mid=>receipts[mid])};
   if(oldReply&&id==="chat-1")return oldReply(data);
   return response(data);
  }
  throw new Error(`Petición inesperada ${url}`);
 }));
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
function mount(){return render(<MemoryRouter initialEntries={["/lidia/conversacion?conversacion=chat-1"]}><AppProvider><main id="main"><Link to="/lidia/conversacion?conversacion=chat-2">Otro chat</Link><AppConversation/></main></AppProvider></MemoryRouter>);}
function visible(id){act(()=>{for(const o of observers)for(const n of o.nodes)if(n.dataset.messageId===id)o.callback([{target:n,isIntersecting:true,intersectionRatio:1}]);});}
it("confirma recepción de mensajes entrantes y sólo lee la burbuja visible",async()=>{
 mount();await screen.findByText("Texto incoming");
 await waitFor(()=>expect(acks.some(a=>a.body.state==="received")).toBe(true));
 expect(acks.flatMap(a=>a.body.message_ids)).not.toContain("own");expect(acks.some(a=>a.body.state==="read")).toBe(false);
 visible("incoming");await waitFor(()=>expect(acks.filter(a=>a.body.state==="read").flatMap(a=>a.body.message_ids)).toEqual(["incoming"]));
 expect(receipts.below.read_at).toBeNull();
});
it("una APP oculta no confirma lectura aunque el observador informe visibilidad",async()=>{
 mount();await screen.findByText("Texto incoming");hidden=true;fireEvent(document,new Event("visibilitychange"));visible("incoming");
 await act(async()=>{});expect(acks.some(a=>a.body.state==="read")).toBe(false);
 hidden=false;fireEvent(document,new Event("visibilitychange"));visible("incoming");
 await waitFor(()=>expect(acks.some(a=>a.body.state==="read")).toBe(true));
});
it("recupera un ACK con respuesta perdida usando exactamente el mismo cuerpo y clave",async()=>{
 loseReply=true;mount();await screen.findByText("Texto incoming");await waitFor(()=>expect(acks.length).toBe(1));
 fireEvent(document,new Event("visibilitychange"));await waitFor(()=>expect(acks.length).toBeGreaterThan(1));expect(acks[1]).toEqual(acks[0]);
});
it("recibido por IA no equivale a leído y una revisión antigua no hace retroceder los ticks",async()=>{
 receipts.own=receipt(messages["chat-1"][0],"received","2",true);mount();await screen.findByLabelText("Recibido por LidIA");expect(screen.queryByLabelText("Leído por Gestadia")).toBeNull();
 receipts.own=receipt(messages["chat-1"][0],"read","3");fireEvent(document,new Event("visibilitychange"));await screen.findByLabelText("Leído por Gestadia");
 receipts.own=receipt(messages["chat-1"][0],"sent","1");const before=reads.length;fireEvent(document,new Event("visibilitychange"));await waitFor(()=>expect(reads.length).toBeGreaterThan(before));expect(screen.getByLabelText("Leído por Gestadia")).toBeTruthy();
});
it("descarta respuestas y ACK pendientes del chat anterior al navegar",async()=>{
 let release;oldReply=data=>new Promise(resolve=>{release=()=>resolve(response(data));});mount();await screen.findByText("Texto incoming");await waitFor(()=>expect(release).toBeTypeOf("function"));
 fireEvent.click(screen.getByText("Otro chat"));await screen.findByText("Texto other");await act(async()=>{release();});
 expect(screen.queryByText("Texto incoming")).toBeNull();expect(acks.filter(a=>a.id==="chat-1")).toHaveLength(0);expect(screen.getByLabelText("Enviado a Gestadia")).toBeTruthy();
});
it("Mensajes muestra el último mensaje real y sus ticks sin confirmar recepción ni lectura",async()=>{
 receipts.other=receipt(messages["chat-2"][0],"read","3");render(<MemoryRouter><ConnectedMessages/></MemoryRouter>);
 await screen.findByText("Texto other");await screen.findByLabelText("Leído por Gestadia");expect(reads.some(url=>url.includes("summary=true"))).toBe(true);expect(acks).toHaveLength(0);
});

it("añadir un mensaje al historial no borra un leído confirmado ni acepta una revisión más antigua",async()=>{
 const {useMessageReceipts}=await import("./useMessageReceipts.js");
 const {default:DeliveryTicks}=await import("./DeliveryTicks.jsx");
 function History({items}) { const state=useMessageReceipts({userId:user,conversationId:"chat-1",items,enabled:true});return <DeliveryTicks receipt={state.own}/>; }
 receipts.own=receipt(messages["chat-1"][0],"read","3");
 const view=render(<History items={[messages["chat-1"][0]]}/>);await screen.findByLabelText("Leído por Gestadia");
 receipts.own=receipt(messages["chat-1"][0],"sent","1");const before=reads.length;
 view.rerender(<History items={messages["chat-1"].slice(0,2)}/>);
 await waitFor(()=>expect(reads.length).toBeGreaterThan(before));expect(screen.getByLabelText("Leído por Gestadia")).toBeTruthy();
});


it("la APP nativa en segundo plano no consulta ni confirma leído hasta volver a primer plano",async()=>{
 const {useMessageReceipts}=await import("./useMessageReceipts.js");
 let onState;vi.spyOn(Capacitor,"isNativePlatform").mockReturnValue(true);
 vi.spyOn(App,"getState").mockResolvedValue({isActive:false});
 vi.spyOn(App,"addListener").mockImplementation((name,callback)=>{onState=callback;return Promise.resolve({remove:vi.fn()});});
 function NativeHistory(){useMessageReceipts({userId:user,conversationId:"chat-1",items:messages["chat-1"],enabled:true});return <main id="main"><div data-message-id="incoming">Mensaje</div></main>;}
 render(<NativeHistory/>);await act(async()=>{});visible("incoming");expect(reads).toHaveLength(0);expect(acks).toHaveLength(0);
 act(()=>onState({isActive:true}));visible("incoming");await waitFor(()=>expect(acks.some(a=>a.body.state==="read")).toBe(true));
 act(()=>onState({isActive:false}));const count=acks.length;fireEvent(document,new Event("visibilitychange"));await act(async()=>{});expect(acks).toHaveLength(count);
});


it("un getState antiguo no reactiva la APP después de un evento de segundo plano",async()=>{
 const {useMessageReceipts}=await import("./useMessageReceipts.js");
 let onState,resolveState;vi.spyOn(Capacitor,"isNativePlatform").mockReturnValue(true);
 vi.spyOn(App,"getState").mockImplementation(()=>new Promise(resolve=>{resolveState=resolve;}));
 vi.spyOn(App,"addListener").mockImplementation((name,callback)=>{onState=callback;return Promise.resolve({remove:vi.fn()});});
 function NativeHistory(){useMessageReceipts({userId:user,conversationId:"chat-1",items:messages["chat-1"],enabled:true});return <main id="main"><div data-message-id="incoming">Mensaje</div></main>;}
 render(<NativeHistory/>);await act(async()=>{});act(()=>onState({isActive:false}));
 await act(async()=>resolveState({isActive:true}));visible("incoming");await act(async()=>{});expect(reads).toHaveLength(0);expect(acks).toHaveLength(0);
});

it("Actualizar conversaciones refresca también el tick sin esperar al polling",async()=>{
 receipts.other=receipt(messages["chat-2"][0],"received","2");render(<MemoryRouter><ConnectedMessages/></MemoryRouter>);
 await screen.findByLabelText("Recibido por Gestadia");receipts.other=receipt(messages["chat-2"][0],"read","3");
 fireEvent.click(screen.getByRole("button",{name:"Actualizar conversaciones"}));await screen.findByLabelText("Leído por Gestadia");
});
