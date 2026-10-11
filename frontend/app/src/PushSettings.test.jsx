import React from "react";
import { afterEach, it, expect, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import PushSettings from "./PushSettings.jsx";
const state=vi.hoisted(()=>({status:"",enable:vi.fn(),disable:vi.fn()}));
vi.mock("./AppContext.jsx",()=>({useApp:()=>({mode:"real",pushStatus:state.status})}));
vi.mock("./push.js",()=>({pushAvailable:()=>true,enablePush:state.enable,disablePush:state.disable}));
afterEach(()=>{cleanup();vi.clearAllMocks();state.status="";});
it("la campana retira la invitación después del registro y Perfil ofrece un toggle",async()=>{
  const view=render(<PushSettings promptOnly />);
  fireEvent.click(screen.getByRole("button",{name:"Activar notificaciones"}));
  await waitFor(()=>expect(state.enable).toHaveBeenCalledTimes(1));
  state.status="Activadas";view.rerender(<PushSettings promptOnly />);
  expect(screen.queryByText("Activa los avisos")).toBeNull();
  view.rerender(<PushSettings />);
  const toggle=screen.getByRole("switch",{name:"Notificaciones en este dispositivo"});expect(toggle).toHaveAttribute("aria-checked","true");
  expect(screen.getByRole("status")).toHaveClass("success");fireEvent.click(toggle);
  await waitFor(()=>expect(state.disable).toHaveBeenCalledTimes(1));
  state.status="Desactivadas en este dispositivo";view.rerender(<PushSettings />);
  expect(screen.getByRole("switch")).toHaveAttribute("aria-checked","false");expect(screen.getByRole("status")).toHaveClass("push-disabled");
});
it("permiso denegado conserva la invitación sin avisar de activación",async()=>{
  state.status="Permiso no concedido. Puedes cambiarlo en los ajustes del sistema.";
  render(<PushSettings promptOnly />);
  expect(screen.getByRole("button",{name:"Activar notificaciones"})).toBeInTheDocument();
  expect(screen.getByRole("status")).not.toHaveClass("success");
});
it("desactivar desde Perfil no vuelve a mostrar la invitación en campana",()=>{
  state.status="Desactivadas en este dispositivo";
  render(<PushSettings promptOnly />);
  expect(screen.queryByRole("button",{name:"Activar notificaciones"})).toBeNull();
});
