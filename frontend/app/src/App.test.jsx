import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import App from "./App.jsx";
import { AppProvider, useApp } from "./AppContext.jsx";
import { PluginWebProvider } from "./PluginWebContext.jsx";
import { setToken } from "./api.js";
import { DEMO_KEY } from "./demo.js";
function mount() {
  return render(
    <MemoryRouter>
      <AppProvider>
        <PluginWebProvider enabled={false}>
          <App />
        </PluginWebProvider>
      </AppProvider>
    </MemoryRouter>,
  );
}
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  localStorage.clear();
  sessionStorage.clear();
  window.GESTADIA_APP_CONFIG = {
    demoEnabled: true,
  };
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("completa el sondeo demo sin afirmar viabilidad y precarga el país del servicio", async () => {
  mount();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Probar demo",
      exact: true,
    }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Quiero canjear mi carnet de conducir extranjero",
      exact: true,
    }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Perú",
      exact: true,
    }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Sí",
      exact: true,
    }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Sí, ambas condiciones",
    }),
  );
  expect(
    screen.getByText(
      /viabilidad y la documentación definitiva quedan pendientes/,
    ),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("link", {
      name: "Ver Servicios DGT",
    }),
  );
  expect(screen.getByLabelText("País del permiso")).toHaveValue("peru");
  expect(screen.getByText(/checkout es real/)).toBeInTheDocument();
});
it("el perfil lead deja la campana sin aviso y ofrece llamada sin chat de cliente", async () => {
  mount();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Probar demo",
      exact: true,
    }),
  );
  fireEvent.click(
    screen.getByRole("link", {
      name: "Mi cuenta",
    }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Lead sin trámite",
    }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Notificaciones",
      exact: true,
    }),
  );
  expect(
    screen.getByRole("heading", { name: "Estás al día" }),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Cerrar",
      exact: true,
    }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Hablar con un gestor",
      exact: true,
    }),
  );
  expect(
    screen.queryByRole("button", {
      name: "Abrir Chat en la App con Juan Carlos",
    }),
  ).toBeNull();
  expect(
    screen.getByRole("button", {
      name: "Solicitar llamada de un gestor",
    }),
  ).toBeInTheDocument();
});
it("no deja aparecer datos de una sesión anterior al cambiar a demo", async () => {
  setToken("real-token");
  const pending = [];
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(
      (url) =>
        new Promise((resolve) => {
          pending.push({
            url,
            resolve,
          });
        }),
    ),
  );
  mount();
  fireEvent.click(
    screen.getByRole("link", {
      name: "Mi cuenta",
    }),
  );
  // La expiración ocurre mientras siguen pendientes las lecturas de esa cuenta.
  act(() => {
    window.dispatchEvent(new Event("gestadia-session-expired"));
  });
  await waitFor(() =>
    expect(
      screen.getByRole("button", {
        name: "Probar demo",
        exact: true,
      }),
    ).toBeInTheDocument(),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Probar demo",
      exact: true,
    }),
  );
  await act(async () => {
    for (const item of pending)
      item.resolve({
        ok: true,
        status: 200,
        json: async () =>
          item.url === "/api/me"
            ? {
                id: "previous-account",
                nombre: "Datos de otra cuenta",
              }
            : [],
      });
  });
  expect(
    screen.getByRole("heading", { name: "Perfil de demostración" }),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("link", {
      name: "Mi cuenta",
    }),
  );
  expect(screen.getByLabelText("Nombre")).toHaveValue("Alex");
  expect(screen.queryByDisplayValue("Datos de otra cuenta")).toBeNull();
});
it("un guardado tardío no introduce datos de una cuenta real en la demo", async () => {
  setToken("cuenta-anterior");
  let completeSave;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options) => {
      if (options.method === "PATCH")
        return new Promise((resolve) => {
          completeSave = resolve;
        });
      return {
        ok: true,
        status: 200,
        json: async () =>
          url === "/api/me" ? { id: "cuenta-a", nombre: "Privado" } : [],
      };
    }),
  );
  let app;
  function Probe() {
    app = useApp();
    return <span>{app.data.profile?.nombre}</span>;
  }
  render(
    <AppProvider>
      <Probe />
    </AppProvider>,
  );
  await screen.findByText("Privado");
  let pendingSave;
  act(() => {
    pendingSave = app.saveProfile({
      id: "cuenta-a",
      nombre: "Datos privados tardíos",
    });
  });
  act(() => {
    app.logout();
    app.startDemo("cliente", true);
  });
  await act(async () => {
    completeSave({ ok: true, status: 200, json: async () => ({ ok: true }) });
    await pendingSave;
  });
  expect(app.mode).toBe("demo");
  expect(app.data.profile.nombre).toBe("Alex");
  expect(localStorage.getItem(DEMO_KEY)).not.toContain(
    "Datos privados tardíos",
  );
});
