import React from "react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AppProvider } from "./AppContext.jsx";
import { PluginWebProvider } from "./PluginWebContext.jsx";
import App from "./App.jsx";

function RouteProbe() {
  const location = useLocation();
  return (
    <output aria-label="Ruta de prueba">
      {location.pathname}
      {location.search}
    </output>
  );
}
function start(entry = "/tramites") {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <AppProvider>
        <PluginWebProvider enabled={false}>
          <App />
          <RouteProbe />
        </PluginWebProvider>
      </AppProvider>
    </MemoryRouter>,
  );
}
async function signIn() {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "a@example.test" },
  });
  fireEvent.change(screen.getByLabelText("Contraseña"), {
    target: { value: "test-only-password" },
  });
  await act(async () =>
    fireEvent.submit(screen.getByLabelText("Email").closest("form")),
  );
}
beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  window.GESTADIA_APP_CONFIG = {
    demoOnly: false,
    demoEnabled: false,
    conversationsEnabled: true,
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      let data;
      if (url === "/api/app/v1/auth/sessions")
        data = { token: "ga_test", session_id: "device" };
      else if (url === "/api/me")
        data = { id: "u1", nombre: "Ana", email: "a@example.test" };
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

it("Trámites visitante permite cancelar el acceso y recupera el menú principal", async () => {
  start();
  fireEvent.click(screen.getByRole("link", { name: "Entrar al portal" }));
  expect(
    screen.getByRole("heading", { name: "Iniciar sesión" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("navigation", { name: "Navegación principal" }),
  ).toBeNull();
  fireEvent.click(screen.getByRole("link", { name: "Volver a Trámites" }));
  await screen.findByRole("heading", { name: "Mis trámites" });
  expect(
    screen.getByRole("navigation", { name: "Navegación principal" }),
  ).toBeInTheDocument();
});
it("al entrar desde Trámites se retoma Trámites, sin desviar al inicio", async () => {
  start();
  fireEvent.click(screen.getByRole("link", { name: "Entrar al portal" }));
  await signIn();
  await screen.findByRole("heading", { name: "Mis trámites" });
  expect(screen.getByLabelText("Ruta de prueba")).toHaveTextContent(
    "/tramites",
  );
});
it("registro y privacidad conservan el origen y la continuación del acceso", async () => {
  start();
  fireEvent.click(screen.getByRole("link", { name: "Entrar al portal" }));
  fireEvent.click(screen.getByRole("link", { name: "Crear cuenta" }));
  fireEvent.click(screen.getByRole("link", { name: "Privacidad" }));
  fireEvent.click(screen.getByRole("link", { name: "Volver" }));
  expect(
    screen.getByRole("heading", { name: "Tu cuenta Gestadia" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: "Iniciar sesión" }));
  await signIn();
  await screen.findByRole("heading", { name: "Mis trámites" });
});
it("el acceso desde un detalle conserva expediente y documento seleccionado", async () => {
  start({
    pathname: "/tramites/exp-42",
    search: "?documento=residencia",
    state: { from: "/tramites" },
  });
  fireEvent.click(screen.getByRole("link", { name: "Entrar al portal" }));
  fireEvent.click(screen.getByRole("link", { name: "Volver a tu trámite" }));
  expect(screen.getByLabelText("Ruta de prueba")).toHaveTextContent(
    "/tramites/exp-42?documento=residencia",
  );
  fireEvent.click(screen.getByRole("link", { name: "Volver a Trámites" }));
  expect(
    screen.getByRole("heading", { name: "Mis trámites" }),
  ).toBeInTheDocument();
});
it("el expediente abierto desde un chat vuelve al chat exacto, no a uno nuevo", () => {
  start({
    pathname: "/tramites/exp-42",
    state: {
      from: "/mensajes/gestor?conversacion=chat-9&caso=case-42",
      fromState: { from: "/mensajes" },
    },
  });
  fireEvent.click(
    screen.getByRole("link", { name: "Volver a la conversación" }),
  );
  expect(screen.getByLabelText("Ruta de prueba")).toHaveTextContent(
    "/mensajes/gestor?conversacion=chat-9&caso=case-42",
  );
  fireEvent.click(screen.getByRole("link", { name: "Volver a Mensajes" }));
  expect(screen.getByLabelText("Ruta de prueba")).toHaveTextContent(
    "/mensajes",
  );
});
it("Perfil devuelve al origen y una entrada directa tiene salida al inicio", () => {
  start({
    pathname: "/cuenta",
    state: { from: "/servicios?servicio=transferencia" },
  });
  fireEvent.click(screen.getByRole("link", { name: "Volver a Servicios" }));
  expect(screen.getByLabelText("Ruta de prueba")).toHaveTextContent(
    "/servicios?servicio=transferencia",
  );
});
it("LidIA abierto desde Mensajes tiene retorno a Mensajes incluso sin sesión", () => {
  start({
    pathname: "/lidia/conversacion",
    search: "?conversacion=chat-1",
    state: { from: "/mensajes" },
  });
  fireEvent.click(screen.getByRole("link", { name: "Volver a Mensajes" }));
  expect(screen.getByLabelText("Ruta de prueba")).toHaveTextContent(
    "/mensajes",
  );
});

it("cambiar entre documentos legales no pierde el destino tras el acceso", async () => {
  start();
  fireEvent.click(screen.getByRole("link", { name: "Entrar al portal" }));
  fireEvent.click(screen.getByRole("link", { name: "Crear cuenta" }));
  fireEvent.click(screen.getByRole("link", { name: "Privacidad" }));
  fireEvent.click(screen.getByRole("link", { name: "Términos" }));
  fireEvent.click(screen.getByRole("link", { name: "Volver" }));
  fireEvent.click(screen.getByRole("link", { name: "Iniciar sesión" }));
  await signIn();
  await screen.findByRole("heading", { name: "Mis trámites" });
});
it("Mensajes visitante desde una pestaña vuelve al origen al cancelar y retoma Mensajes al entrar", async () => {
  start();
  fireEvent.click(screen.getByRole("link", { name: "Mensajes", exact: true }));
  fireEvent.click(screen.getByRole("link", { name: "Volver a Trámites" }));
  expect(
    screen.getByRole("heading", { name: "Mis trámites" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: "Mensajes", exact: true }));
  await signIn();
  await screen.findByRole("heading", { name: "Mensajes" });
});

it("las entradas directas secundarias tienen un retorno seguro aunque el origen recibido no sea interno", () => {
  start({
    pathname: "/tramites/exp-42",
    state: { from: "https://example.test" },
  });
  fireEvent.click(screen.getByRole("link", { name: "Volver a Trámites" }));
  expect(
    screen.getByRole("heading", { name: "Mis trámites" }),
  ).toBeInTheDocument();
});
it("Perfil conectado no solicita contraseñas para una operación que no está disponible", async () => {
  start({ pathname: "/acceso", state: { returnTo: "/cuenta" } });
  await signIn();
  await screen.findByRole("heading", { name: "Mi Perfil" });
  expect(screen.queryByLabelText("Contraseña actual")).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Cambiar contraseña" }),
  ).toBeNull();
  const recover = screen.getByRole("link", { name: "Recuperar acceso" });
  expect(recover).toHaveAttribute(
    "href",
    "https://gestadia.com/portal/recuperar",
  );
  expect(recover).toHaveAttribute("target", "_blank");
  expect(screen.queryByRole("switch", { name: "Avisos push" })).toBeNull();
});
