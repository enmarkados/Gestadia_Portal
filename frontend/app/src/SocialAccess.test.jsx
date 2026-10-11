import React from "react";
import { afterEach, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
const fixture = vi.hoisted(() => ({
  start: vi.fn(),
  confirm: vi.fn(),
  accept: vi.fn(),
}));
vi.mock("./social-auth.js", () => ({
  socialClient: {
    start: fixture.start,
    confirm: fixture.confirm,
    cancel: vi.fn(),
  },
  takeSocialResult: () => null,
}));
vi.mock("./AppContext.jsx", () => ({
  useApp: () => ({ acceptSession: fixture.accept }),
}));
vi.mock("./api.js", () => ({ platform: () => "ios", demoOnly: () => false }));
import SocialAccess from "./SocialAccess.jsx";
import { MemoryRouter } from "react-router-dom";
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it("sin cuenta no ofrece autorregistro social y lleva al recorrido Gestadia", async () => {
  window.GESTADIA_APP_CONFIG = { social: { apple: { clientId: "app" }, google: { webClientId: "web" } } };
  fixture.start.mockResolvedValue({status:"account_required",emailAvailable:true});
  render(<MemoryRouter><SocialAccess /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Continuar con Apple" }));
  expect(await screen.findByRole("link",{name:"Tu cuenta Gestadia"})).toHaveAttribute("href","/registro");
  expect(screen.queryByRole("button",{name:"Confirmar creación de cuenta"})).toBeNull();
  expect(fixture.accept).not.toHaveBeenCalled(); expect(fixture.confirm).not.toHaveBeenCalled();
});
it("acceso social aceptado abre la cuenta existente sin contraseña previa", async () => {
  window.GESTADIA_APP_CONFIG = { social: { apple: { clientId: "app" }, google: { webClientId: "web" } } };
  fixture.start.mockResolvedValue({token:"session"});
  render(<MemoryRouter><SocialAccess /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Continuar con Google" }));
  await waitFor(() => expect(fixture.accept).toHaveBeenCalledWith("session"));
  expect(fixture.confirm).not.toHaveBeenCalled();
});
