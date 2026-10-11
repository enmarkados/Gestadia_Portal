import React from "react";
import { afterEach, beforeEach, it, expect, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Notifications from "./Notifications.jsx";
const state = vi.hoisted(() => ({ app: {}, close: vi.fn() }));
vi.mock("./AppContext.jsx", () => ({ useApp: () => state.app }));
vi.mock("./push.js", () => ({ enablePush: vi.fn(), disablePush: vi.fn(), pushAvailable: () => false }));
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function() { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function() { this.removeAttribute("open"); };
  state.app = { mode:"real",pushStatus:"", data:{notifications:[
    { id:"n1", titulo:"Tu gestor te ha escrito", cuerpo:"Revisa el chat", leida:false, conversationId:"chat/1",conversationPurpose:"atencion",createdAt:"2026-10-11T09:00:00Z" },
    { id:"n2", titulo:"Documento revisado", cuerpo:"Consulta tu trámite", leida:true, expedienteId:"case1",createdAt:"2026-10-10T09:00:00Z" },
  ]},setNotificationRead:vi.fn(async()=>{}) };
  state.close.mockReset();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const mount = () => render(<MemoryRouter><Notifications onClose={state.close} /></MemoryRouter>);
it("filtra leídas y no leídas y abre cada recurso concreto", () => {
  mount();
  expect(screen.getByRole("link", {name:/Tu gestor/})).toHaveAttribute("href", "/mensajes/gestor?conversacion=chat%2F1");
  expect(screen.getByRole("link", {name:/Documento revisado/})).toHaveAttribute("href", "/tramites/case1");
  fireEvent.click(screen.getByRole("button", {name:/No leídas/}));
  expect(screen.queryByText("Documento revisado")).toBeNull();
  fireEvent.click(screen.getByRole("button", {name:"Leídas"}));
  expect(screen.queryByText("Tu gestor te ha escrito")).toBeNull();
});
it("abrir confirma la lectura antes de cerrar/navegar y el rechazo conserva el aviso", async () => {
  mount();
  state.app.setNotificationRead.mockRejectedValueOnce(Error("offline"));
  fireEvent.click(screen.getByRole("link",{name:/Tu gestor/}));
  await screen.findByRole("alert"); expect(state.close).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("link",{name:/Tu gestor/}));
  await waitFor(() => expect(state.close).toHaveBeenCalledWith(expect.any(Function)));
  expect(state.app.setNotificationRead).toHaveBeenLastCalledWith("n1",true);
});
it("deslizar cambia lectura sin abrir el chat, y el scroll vertical no lo hace", async () => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  mount(); const card=screen.getByText("Tu gestor te ha escrito").closest(".notification-card");
  fireEvent.pointerDown(card,{clientX:200,clientY:100,button:0}); fireEvent.pointerMove(card,{clientX:198,clientY:190}); fireEvent.pointerUp(card);
  expect(state.app.setNotificationRead).not.toHaveBeenCalled();
  fireEvent.pointerDown(card,{clientX:200,clientY:100,button:0}); fireEvent.pointerMove(card,{clientX:100,clientY:101}); fireEvent.pointerUp(card);
  await waitFor(()=>expect(state.app.setNotificationRead).toHaveBeenCalledWith("n1",true));
  fireEvent.click(screen.getByRole("link",{name:/Tu gestor/})); expect(state.close).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button",{name:"Marcar como no leída"}));
  await waitFor(()=>expect(state.app.setNotificationRead).toHaveBeenCalledWith("n2",false));
});
