import React from "react";
import { it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
it("alta Apple requiere confirmación explícita antes de abrir sesión", async () => {
  window.GESTADIA_APP_CONFIG = {
    social: { apple: { clientId: "app" }, google: { webClientId: "web" } },
  };
  fixture.start.mockResolvedValue({
    status: "account_required",
    emailAvailable: true,
  });
  fixture.confirm.mockResolvedValue({ token: "session" });
  render(<SocialAccess />);
  fireEvent.click(screen.getByRole("button", { name: "Continuar con Apple" }));
  await screen.findByRole("button", { name: "Confirmar creación de cuenta" });
  expect(fixture.accept).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "Confirmar creación de cuenta" }),
  );
  await waitFor(() => expect(fixture.accept).toHaveBeenCalledWith("session"));
  expect(fixture.confirm).toHaveBeenCalledWith("create");
});
