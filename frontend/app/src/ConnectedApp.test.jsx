import React from "react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProvider } from "./AppContext.jsx";
import { PluginWebProvider } from "./PluginWebContext.jsx";
import App from "./App.jsx";
let calls;
beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  window.GESTADIA_APP_CONFIG = {
    demoOnly: false,
    demoEnabled: false,
    conversationsEnabled: true,
  };
  calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, opts = {}) => {
      calls.push({ url, opts });
      let data;
      if (url === "/api/app/v1/auth/sessions")
        data = { token: "ga_test", session_id: "device" };
      else if (url === "/api/me")
        data = {
          id: "u1",
          nombre: "Ana",
          apellidos: "Local",
          email: "a@example.test",
        };
      else if (url === "/api/app/v1/conversations")
        data = { conversations: [] };
      else if (url === "/api/expedientes" || url === "/api/notificaciones")
        data = [];
      else throw new Error(`Unexpected URL ${url}`);
      return { ok: true, status: 200, json: async () => data };
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("acceso conectado usa sesión APP y el chat no inicia PluginWeb ni muestra un gestor ficticio", async () => {
  render(
    <MemoryRouter initialEntries={["/acceso"]}>
      <AppProvider>
        <PluginWebProvider enabled={false}>
          <App />
        </PluginWebProvider>
      </AppProvider>
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "a@example.test" },
  });
  fireEvent.change(screen.getByLabelText("Contraseña"), {
    target: { value: "test-only-password" },
  });
  fireEvent.submit(screen.getByLabelText("Email").closest("form"));
  await waitFor(() =>
    expect(calls.some((x) => x.url === "/api/app/v1/auth/sessions")).toBe(true),
  );
  await screen.findByRole("link", { name: "Abrir conversación con LidIA" });
  fireEvent.click(
    screen.getByRole("link", { name: "Abrir conversación con LidIA" }),
  );
  await screen.findByRole("heading", { name: "Habla con LidIA" });
  await screen.findByRole("button", { name: "Abrir conversación" });
  expect(calls.some((x) => String(x.url).includes("/lidia/"))).toBe(false);
  expect(screen.queryByText("Juan Carlos Acero")).toBeNull();
});
