import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { AppProvider } from "./AppContext.jsx";
import { PluginWebProvider } from "./PluginWebContext.jsx";
import App from "./App.jsx";
import { setToken, getToken, request } from "./api.js";
import { pluginRequest } from "./PluginWebContext.jsx";

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
    demoOnly: true,
    demoEnabled: true,
    pluginWeb: { baseUrl: "/lidia", key: "aunque-estuviera-configurada" },
  };
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new Error("La demo no debe intentar conectarse")),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function mount(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider>
        <PluginWebProvider enabled={false}>
          <App />
        </PluginWebProvider>
      </AppProvider>
    </MemoryRouter>,
  );
}

it("el aviso prioritario abre el expediente y cierra el panel sin conexiones", async () => {
  mount("/mensajes");
  fireEvent.click(
    screen.getByRole("button", { name: "Notificaciones pendientes" }),
  );
  expect(
    screen.getByRole("dialog", { name: "Notificaciones y Avisos" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText("1 acción prioritaria pendiente"),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Juan Carlos Acero ha sido asignado a tu trámite"),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("link", { name: "Subir documentación ahora ›" }),
  );
  expect(screen.queryByRole("dialog")).toBeNull();
  await screen.findByText("DEMO-001");
  expect(fetch).not.toHaveBeenCalled();
});

it("arranca en demo con un token antiguo y bloquea las APIs", async () => {
  setToken("sesion-real-antigua");
  mount();
  expect(
    screen.getByRole("heading", {
      name: "¿Qué trámite de Tráfico necesitas gestionar hoy?",
    }),
  ).toBeInTheDocument();
  expect(getToken()).toBeNull();
  await expect(request("/api/me")).rejects.toThrow("no realiza conexiones");
  await expect(pluginRequest("/config")).rejects.toThrow("demostración");
  const recognition = vi.fn();
  vi.stubGlobal("SpeechRecognition", recognition);
  fireEvent.click(screen.getByRole("button", { name: "Dictar consulta" }));
  expect(screen.getByText(/dictado está desactivado/)).toBeInTheDocument();
  expect(recognition).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});
it("el registro recorre un perfil lead sin crear cuenta remota ni guardar contraseñas", async () => {
  mount("/registro");
  fireEvent.change(screen.getByLabelText("Nombre"), {
    target: { value: "María Ejemplo" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "demo@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Contraseña"), {
    target: { value: "ClaveDemo123!" },
  });
  fireEvent.change(screen.getByLabelText("Repetir contraseña"), {
    target: { value: "ClaveDemo123!" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Crear cuenta de ejemplo" }),
  );
  await screen.findByRole("heading", {
    name: "¿Qué trámite de Tráfico necesitas gestionar hoy?",
  });
  expect(
    screen.getByRole("button", { name: "Notificaciones", exact: true }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: "Mi cuenta" }));
  expect(screen.getByLabelText("Nombre")).toHaveValue("María Ejemplo");
  expect(JSON.stringify({ ...localStorage, ...sessionStorage })).not.toContain(
    "ClaveDemo123!",
  );
  expect(fetch).not.toHaveBeenCalled();
});
it("inicio de sesión funciona como recorrido de ejemplo sin transmitir credenciales", async () => {
  mount("/acceso");
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "demo@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Contraseña"), {
    target: { value: "ClaveSoloDemo123!" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Entrar al portal" }));
  await screen.findByRole("heading", {
    name: "¿Qué trámite de Tráfico necesitas gestionar hoy?",
  });
  expect(fetch).not.toHaveBeenCalled();
  expect(JSON.stringify({ ...localStorage, ...sessionStorage })).not.toContain(
    "ClaveSoloDemo123!",
  );
});
it("el recorrido de servicios finaliza localmente sin abrir el checkout real", async () => {
  mount("/servicios");
  fireEvent.click(
    screen.getByRole("button", { name: "Continuar con el ejemplo" }),
  );
  await screen.findByRole("heading", { name: "Revisa tu servicio" });
  expect(
    screen.getByText(/No se contrata ningún servicio/),
  ).toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});

it("Mensajes ofrece una sola llamada, contacto con dos campos y una nueva consulta limpia", async () => {
  mount("/mensajes");
  expect(
    screen.getAllByRole("button", {
      name: "Hablar con un gestor",
      exact: true,
    }),
  ).toHaveLength(1);
  fireEvent.click(
    screen.getByRole("button", { name: "Hablar con un gestor", exact: true }),
  );
  expect(
    screen.getByRole("dialog", { name: "Hablar con un gestor" }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("textbox")).toHaveLength(2);
  expect(screen.getByLabelText("Nombre y apellidos")).toHaveValue(
    "Alex Ejemplo",
  );
  expect(screen.queryByLabelText("Email")).toBeNull();
  expect(screen.queryByRole("combobox")).toBeNull();
  expect(
    screen.getByRole("button", {
      name: "Abrir Chat en la App con Juan Carlos",
    }),
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Teléfono de contacto"), {
    target: { value: "+34 600000000" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Solicitar llamada de un gestor" }),
  );
  expect(
    screen.getByText("Solicitud de ejemplo completada"),
  ).toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Volver a la app" }));
  fireEvent.click(
    screen.getByRole("link", { name: /Nueva consulta con LidIA/ }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Quiero canjear mi carnet de conducir extranjero",
      exact: true,
    }),
  );
  expect(
    screen.getByRole("heading", { name: "Tu consulta" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: "Mensajes", exact: true }));
  fireEvent.click(
    screen.getByRole("link", { name: /Nueva consulta con LidIA/ }),
  );
  expect(
    screen.getByRole("heading", {
      name: "¿Qué trámite de Tráfico necesitas gestionar hoy?",
    }),
  ).toBeInTheDocument();
  expect(screen.queryByText("Consulta con LidIA")).toBeNull();
  expect(screen.queryByText("Consultas habituales")).toBeNull();
  expect(screen.queryByText("Demostración · Datos ficticios")).toBeNull();
  fireEvent.change(screen.getByRole("textbox", { name: "Tu consulta" }), {
    target: { value: "Quiero canjear mi carnet" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Enviar consulta", exact: true }),
  );
  expect(
    screen.getByRole("heading", { name: "Tu consulta" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Tu consulta" })).toHaveValue("");
  fireEvent.click(screen.getByRole("link", { name: "Servicios", exact: true }));
  expect(
    screen.queryByRole("button", { name: "Hablar con un gestor", exact: true }),
  ).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
});
