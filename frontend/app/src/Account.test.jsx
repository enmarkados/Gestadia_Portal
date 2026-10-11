import React from "react";
import { it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProvider } from "./AppContext.jsx";
import { PluginWebProvider } from "./PluginWebContext.jsx";
import App from "./App.jsx";
beforeEach(() => {
  sessionStorage.clear();
  sessionStorage.setItem("gestadia_app_token", "test-token");
  window.GESTADIA_APP_CONFIG = {};
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options) => {
      const data =
        url === "/api/me"
          ? { id: "u1", nombre: "Ana", email: "fixture@example.test" }
          : [];
      if (options.method === "PATCH")
        return new Response(JSON.stringify({ ok: true }));
      return new Response(JSON.stringify(data));
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  sessionStorage.clear();
  delete window.GESTADIA_APP_CONFIG;
});
function mount() {
  render(
    <MemoryRouter initialEntries={["/cuenta"]}>
      <AppProvider>
        <PluginWebProvider enabled={false}>
          <App />
        </PluginWebProvider>
      </AppProvider>
    </MemoryRouter>,
  );
}
it("el perfil guarda sólo mediante el Portal y ofrece recuperación real", async () => {
  mount();
  await screen.findByRole("heading", { name: "Mi Perfil" });
  fireEvent.change(screen.getByLabelText("Nombre"), {
    target: { value: "Ana Nueva" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Datos guardados en el portal",
  );
  expect(
    fetch.mock.calls.some(
      ([url, options]) => url === "/api/me" && options.method === "PATCH",
    ),
  ).toBe(true);
  expect(
    screen.getByRole("link", { name: "Recuperar acceso" }),
  ).toHaveAttribute("href", "https://gestadia.com/portal/recuperar");
  expect(document.body.textContent).not.toMatch(/demo|demostración|ejemplo/i);
});
it("cancelar la solicitud de borrado conserva la sesión y no envía una petición", async () => {
  mount();
  await screen.findByRole("heading", { name: "Mi Perfil" });
  fireEvent.click(
    screen.getByRole("button", { name: "Solicitar borrado de cuenta" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Conservar mi cuenta" }));
  expect(sessionStorage.getItem("gestadia_app_token")).toBe("test-token");
  expect(
    fetch.mock.calls.some(([url]) => url.includes("deletion-request")),
  ).toBe(false);
});

it("confirmar el borrado registra la solicitud real y cierra el acceso", async () => {
  mount();
  await screen.findByRole("heading", { name: "Mi Perfil" });
  fireEvent.click(screen.getByRole("button", { name: "Solicitar borrado de cuenta" }));
  fireEvent.click(screen.getByRole("button", { name: "Confirmar solicitud de borrado" }));
  expect(await screen.findByRole("status")).toHaveTextContent("Solicitud de borrado registrada");
  const [, options] = fetch.mock.calls.find(([url]) => url === "/api/me/deletion-request");
  expect(options.method).toBe("POST");
  expect(JSON.parse(options.body)).toEqual({ confirm: true });
  expect(options.headers.get("Authorization")).toBe("Bearer test-token");
  expect(sessionStorage.getItem("gestadia_app_token")).toBeNull();
});

it("una solicitud de borrado fallida conserva la sesión y permite reintentar", async () => {
  const original = fetch.getMockImplementation();
  fetch.mockImplementation((url, options) => url === "/api/me/deletion-request"
    ? Promise.resolve(new Response(JSON.stringify({ error: "No disponible" }), { status: 503 }))
    : original(url, options));
  mount();
  await screen.findByRole("heading", { name: "Mi Perfil" });
  fireEvent.click(screen.getByRole("button", { name: "Solicitar borrado de cuenta" }));
  fireEvent.click(screen.getByRole("button", { name: "Confirmar solicitud de borrado" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo registrar la solicitud");
  expect(sessionStorage.getItem("gestadia_app_token")).toBe("test-token");
  expect(screen.getByRole("button", { name: "Confirmar solicitud de borrado" })).toBeEnabled();
});
