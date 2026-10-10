import React from "react";
import { it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProvider, useApp } from "./AppContext.jsx";
import { PluginWebProvider } from "./PluginWebContext.jsx";
import App from "./App.jsx";

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  // Una configuración antigua no debe poder reactivar cuentas ficticias.
  window.GESTADIA_APP_CONFIG = { demoOnly: true, demoEnabled: true };
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(JSON.stringify({ error: "Credenciales incorrectas" }), {
          status: 401,
        }),
    ),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete window.GESTADIA_APP_CONFIG;
});
function mount(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider>
        <PluginWebProvider enabled={false}>
          <App />
        </PluginWebProvider>
      </AppProvider>
    </MemoryRouter>,
  );
}
it.each([
  "/",
  "/acceso",
  "/registro",
  "/servicios",
  "/mensajes",
  "/legal/privacy",
  "/legal/delete-account",
])(
  "%s no ofrece simulaciones aunque conserve configuración antigua",
  (path) => {
    mount(path);
    expect(document.body.textContent).not.toMatch(
      /demo|demostración|cuenta de ejemplo|recorrido de ejemplo|Juan Carlos Acero/i,
    );
  },
);
it("el acceso siempre consulta la API y rechaza credenciales inválidas", async () => {
  mount("/acceso");
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "fixture@example.test" },
  });
  fireEvent.change(screen.getByLabelText("Contraseña"), {
    target: { value: "test-only-invalid" },
  });
  fireEvent.submit(screen.getByLabelText("Email").closest("form"));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Credenciales incorrectas",
  );
  expect(fetch).toHaveBeenCalledOnce();
  expect(sessionStorage.getItem("gestadia_app_token")).toBeNull();
});
it("ignora perfiles ficticios locales y no expone operaciones de simulación", () => {
  localStorage.setItem(
    "gestadia_app_demo_v1",
    JSON.stringify({
      profile: { nombre: "Ficticio" },
      expedientes: [{ id: "fake" }],
    }),
  );
  let app;
  function Probe() {
    app = useApp();
    return null;
  }
  render(
    <AppProvider>
      <Probe />
    </AppProvider>,
  );
  expect(app.mode).toBe("visitante");
  expect(app.data.profile).toBeNull();
  expect(app.data.expedientes).toEqual([]);
  expect(app.startDemo).toBeUndefined();
  expect(app.deleteDemoAccount).toBeUndefined();
});
