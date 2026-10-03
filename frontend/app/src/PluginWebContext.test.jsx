import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { AppProvider } from "./AppContext.jsx";
import { PluginWebProvider } from "./PluginWebContext.jsx";
import PlatformChat from "./PlatformChat.jsx";
let history;
let sends;
let starts;
function mount(identity = "visitante") {
  return render(
    <MemoryRouter>
      <AppProvider>
        <PluginWebProvider enabled identity={identity}>
          <Link to="/gestor">Abrir gestor</Link>
          <Routes>
            <Route path="/" element={<PlatformChat onContact={() => {}} />} />
            <Route
              path="/gestor"
              element={<PlatformChat onContact={() => {}} manager />}
            />
          </Routes>
        </PluginWebProvider>
      </AppProvider>
    </MemoryRouter>,
  );
}
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  history = [];
  sends = 0;
  starts = 0;
  window.GESTADIA_APP_CONFIG = {
    pluginWeb: {
      baseUrl: "/lidia",
      key: "public-test",
    },
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path, options) => {
      if (path.endsWith("/config"))
        return {
          ok: true,
          status: 200,
          json: async () => ({
            modoFormulario: "desactivado",
            camposFormulario: [],
          }),
        };
      if (path.endsWith("/sessions")) {
        starts++;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            sessionId: "test-session",
            sessionToken: "test-token",
            historial: history,
          }),
        };
      }
      if (options.method === "POST") {
        sends++;
        const text = JSON.parse(options.body).text;
        history = [
          ...history,
          {
            content: text,
            isUser: true,
            timestamp: "2026-10-03T12:00:00Z",
          },
          {
            content: "Hola, responde tu gestor.",
            isSupport: true,
            timestamp: "2026-10-03T12:00:01Z",
          },
        ];
        return {
          ok: false,
          status: 504,
          json: async () => ({
            error: "Timeout del proxy",
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => history,
      };
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("recupera una respuesta humana tras un 504 sin reenviar y conserva la sesión al abrir Gestor", async () => {
  mount();
  await waitFor(() =>
    expect(
      screen.getByRole("button", {
        name: "Comenzar conversación",
      }),
    ).toBeEnabled(),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Comenzar conversación",
    }),
  );
  await screen.findByRole("textbox", {
    name: "Mensaje a Gestadia",
  });
  fireEvent.change(
    screen.getByRole("textbox", {
      name: "Mensaje a Gestadia",
    }),
    {
      target: {
        value: "Quiero hablar con el gestor",
      },
    },
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Enviar a Gestadia",
    }),
  );
  await screen.findByText("Hola, responde tu gestor.");
  expect(sends).toBe(1);
  expect(
    screen.getByText("Hola, responde tu gestor.").closest(".bubble"),
  ).toHaveClass("manager");
  fireEvent.click(
    screen.getByRole("link", {
      name: "Abrir gestor",
    }),
  );
  expect(screen.getByText("Hola, responde tu gestor.")).toBeInTheDocument();
  expect(starts).toBe(1);
  expect(
    screen.getByRole("button", {
      name: "Enviar a Gestadia",
    }),
  ).toBeDisabled(); // borrador vacío
});
it("un rechazo 429 conserva el texto para el usuario y no reintenta automáticamente", async () => {
  const originalFetch = fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options) =>
      options.method === "POST" && url.endsWith("/messages")
        ? {
            ok: false,
            status: 429,
            json: async () => ({
              error: "Espera antes de continuar",
            }),
          }
        : originalFetch(url, options),
    ),
  );
  mount();
  await waitFor(() =>
    expect(
      screen.getByRole("button", {
        name: "Comenzar conversación",
      }),
    ).toBeEnabled(),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Comenzar conversación",
    }),
  );
  await screen.findByRole("textbox", {
    name: "Mensaje a Gestadia",
  });
  fireEvent.change(
    screen.getByRole("textbox", {
      name: "Mensaje a Gestadia",
    }),
    {
      target: {
        value: "Mi consulta pendiente",
      },
    },
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Enviar a Gestadia",
    }),
  );
  await screen.findByText("Espera antes de continuar");
  expect(
    screen.getByRole("textbox", {
      name: "Mensaje a Gestadia",
    }),
  ).toHaveValue("Mi consulta pendiente");
  expect(
    fetch.mock.calls.filter(
      ([url, options]) =>
        url.endsWith("/messages") && options.method === "POST",
    ),
  ).toHaveLength(1);
});
it("recupera la conversación al recargar y separa la sesión de otra identidad", async () => {
  const first = mount("real:usuario-a");
  const start = await screen.findByRole("button", {
    name: "Comenzar conversación",
  });
  await waitFor(() => expect(start).toBeEnabled());
  fireEvent.click(start);
  await screen.findByRole("textbox", { name: "Mensaje a Gestadia" });
  history = [{ content: "Respuesta que debe persistir", isUser: false }];
  first.unmount();

  const reloaded = mount("real:usuario-a");
  await screen.findByText("Respuesta que debe persistir");
  expect(starts).toBe(1);
  reloaded.unmount();

  mount("real:usuario-b");
  await screen.findByRole("button", { name: "Comenzar conversación" });
  expect(
    screen.queryByText("Respuesta que debe persistir"),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("textbox", { name: "Mensaje a Gestadia" }),
  ).not.toBeInTheDocument();
});
it("permite omitir el formulario configurado como omitible", async () => {
  const originalFetch = fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options) =>
      url.endsWith("/config")
        ? {
            ok: true,
            status: 200,
            json: async () => ({
              modoFormulario: "omitible",
              camposFormulario: [{ campo: "email", requerido: true }],
            }),
          }
        : originalFetch(url, options),
    ),
  );
  mount();
  await screen.findByRole("button", { name: "Continuar sin estos datos" });
  expect(screen.getByLabelText("Email")).not.toBeRequired();
  fireEvent.click(
    screen.getByRole("button", { name: "Continuar sin estos datos" }),
  );
  await screen.findByRole("textbox", { name: "Mensaje a Gestadia" });
  const [, options] = fetch.mock.calls.find(([url]) =>
    url.endsWith("/sessions"),
  );
  expect(JSON.parse(options.body)).not.toHaveProperty("formulario");
});
it("deja recuperar el texto de un envío sin confirmación y nunca lo reenvía por sí solo", async () => {
  const originalFetch = fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options) =>
      options.method === "POST" && url.endsWith("/messages")
        ? {
            ok: false,
            status: 504,
            json: async () => ({ error: "Sin entrega confirmada" }),
          }
        : originalFetch(url, options),
    ),
  );
  mount();
  const start = await screen.findByRole("button", {
    name: "Comenzar conversación",
  });
  await waitFor(() => expect(start).toBeEnabled());
  fireEvent.click(start);
  await screen.findByRole("textbox", { name: "Mensaje a Gestadia" });
  fireEvent.change(
    screen.getByRole("textbox", { name: "Mensaje a Gestadia" }),
    { target: { value: "Consulta que no llegó" } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Enviar a Gestadia" }));
  await screen.findByRole("button", { name: "Recuperar texto sin reenviar" });
  fireEvent.click(
    screen.getByRole("button", { name: "Recuperar texto sin reenviar" }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("textbox", { name: "Mensaje a Gestadia" }),
    ).toHaveValue("Consulta que no llegó"),
  );
  expect(
    screen.getByRole("button", { name: "Enviar a Gestadia" }),
  ).toBeEnabled();
  expect(
    fetch.mock.calls.filter(
      ([url, options]) =>
        url.endsWith("/messages") && options.method === "POST",
    ),
  ).toHaveLength(1);
  expect(screen.getByText(/podría duplicarse/)).toBeInTheDocument();
});
