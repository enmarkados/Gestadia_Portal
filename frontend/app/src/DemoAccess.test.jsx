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
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { AppProvider } from "./AppContext.jsx";
import { PluginWebProvider } from "./PluginWebContext.jsx";
import App from "./App.jsx";
import { setToken, getToken, request } from "./api.js";
import { pluginRequest } from "./PluginWebContext.jsx";
import { createDemo, readDemo, DEMO_KEY } from "./demo.js";

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

it.each(["/", "/mensajes/gestor"])(
  "el aviso del micrófono se oculta y puede volver a abrirse en %s",
  (path) => {
    vi.useFakeTimers();
    try {
      mount(path);
      fireEvent.click(screen.getByRole("button", { name: "Dictar consulta" }));
      expect(screen.getByRole("status")).toHaveClass("warning-toast");
      expect(screen.getByRole("status")).toHaveTextContent(
        /dictado está desactivado/,
      );
      act(() => vi.advanceTimersByTime(4000));
      expect(screen.queryByRole("status")).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "Dictar consulta" }));
      expect(screen.getByRole("status")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Cerrar aviso" }));
      expect(screen.queryByRole("status")).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  },
);

it("LidIA presenta autor y hora, permite solicitar llamada y vuelve al inicio sin conexiones", () => {
  mount();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Quiero canjear mi carnet de conducir extranjero",
      exact: true,
    }),
  );
  expect(
    screen.getByRole("heading", { name: "Habla con LidIA" }),
  ).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Tu consulta" })).toBeNull();
  expect(screen.queryByText("Nueva consulta")).toBeNull();
  const userBubble = screen.getByText("Tú").closest(".bubble");
  expect(userBubble.querySelector(".bubble-time").textContent).toMatch(
    /^\d{2}:\d{2}$/,
  );
  expect(screen.getAllByText("LidIA · Asistente IA Gestadia")).toHaveLength(2);
  fireEvent.click(
    screen.getByRole("button", { name: "Solicitar llamada", exact: true }),
  );
  expect(
    screen.getByRole("dialog", { name: "Hablar con un gestor" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Cerrar", exact: true }));
  fireEvent.click(screen.getByRole("button", { name: "Volver a LidIA" }));
  expect(
    screen.getByRole("heading", {
      name: "¿Qué trámite de Tráfico necesitas gestionar hoy?",
    }),
  ).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Habla con LidIA" })).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
});

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

it("el chat del gestor mantiene cabecera, expediente e input y envía solo al ejemplo local", async () => {
  mount("/mensajes");
  fireEvent.click(screen.getByRole("link", { name: /JA Juan Carlos Acero/ }));
  expect(
    screen.getByRole("heading", { name: "Habla con tu gestor" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText("✓ Expediente DEMO-001 · Juan Carlos Acero asignado"),
  ).toBeInTheDocument();
  expect(screen.queryByText(/Chat de demostración/)).toBeNull();
  expect(screen.getByText("10:15")).toBeInTheDocument();
  expect(screen.getByText("3 documentos obligatorios")).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /^Subir / })).toHaveLength(3);
  expect(screen.queryByText("Revisar documentación del expediente")).toBeNull();
  expect(
    screen.getByRole("textbox", { name: "Mensaje para el gestor" }),
  ).toHaveAttribute("placeholder", "¿Qué necesitas?");
  fireEvent.change(
    screen.getByRole("textbox", { name: "Mensaje para el gestor" }),
    { target: { value: "Hola Juan Carlos" } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Enviar mensaje de ejemplo" }),
  );
  expect(screen.getByText("Hola Juan Carlos")).toBeInTheDocument();
  expect(
    screen.getByRole("textbox", { name: "Mensaje para el gestor" }),
  ).toHaveValue("");
  fireEvent.click(screen.getByRole("button", { name: "Dictar consulta" }));
  expect(screen.getByRole("status")).toHaveTextContent(
    "dictado está desactivado",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Solicitar llamada", exact: true }),
  );
  expect(
    screen.getByRole("dialog", { name: "Hablar con un gestor" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Cerrar", exact: true }));
  fireEvent.click(screen.getByRole("link", { name: "Volver a Mensajes" }));
  expect(
    screen.getByRole("heading", { name: "Mensajes", exact: true }),
  ).toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});

it("actualiza el historial antiguo sin perder perfil, documentos ni mensajes escritos", () => {
  const old = createDemo();
  delete old.managerDemoVersion;
  old.profile.nombre = "Persona Ejemplo";
  old.expedientes[0].documentos = [
    { clave: "residencia", nombre: "ejemplo.pdf" },
  ];
  old.managerMessages = [
    {
      role: "manager",
      content:
        "Hola, soy Juan Carlos. En este ejemplo puedes revisar tu documentación y probar cómo sería nuestra conversación.",
    },
    { role: "user", content: "Mensaje que quiero conservar" },
  ];
  localStorage.setItem(DEMO_KEY, JSON.stringify(old));
  const updated = readDemo();
  expect(updated.managerDemoVersion).toBe(2);
  expect(updated.managerMessages).toHaveLength(5);
  expect(updated.managerMessages[0].content).toContain(
    "¡Hola Persona Ejemplo!",
  );
  expect(updated.managerMessages.at(-1).content).toBe(
    "Mensaje que quiero conservar",
  );
  expect(updated.expedientes[0].documentos).toEqual(
    old.expedientes[0].documentos,
  );
  localStorage.setItem(DEMO_KEY, JSON.stringify(updated));
  expect(readDemo().managerMessages).toHaveLength(5);
  expect(fetch).not.toHaveBeenCalled();
});

it("Subir desde el chat selecciona el documento correcto sin enviar archivos", async () => {
  mount("/mensajes/gestor");
  fireEvent.click(
    screen.getByRole("link", { name: "Subir Psicotécnico oficial" }),
  );
  const input = await screen.findByLabelText(
    "Subir Examen psicotécnico (centro autorizado)",
  );
  await waitFor(() => expect(input).toHaveFocus());
  expect(input.closest(".document")).toHaveClass("selected-document");
  expect(fetch).not.toHaveBeenCalled();
});

it("valida los datos y documentos del ejemplo y vuelve al chat sin enviar nada", async () => {
  mount("/tramites/demo-canje");
  await screen.findByRole("heading", {
    name: "Verificación de Datos y Carnet",
  });
  await screen.findByRole("button", { name: "Validar y Enviar" });
  expect(screen.queryByText("Revisar mis datos")).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Hablar con un gestor" }),
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Validar y Enviar" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Selecciona todos los documentos",
  );
  fireEvent.change(
    screen.getByRole("textbox", { name: "Nombre", exact: true }),
    { target: { value: "Nombre Revisado" } },
  );
  for (const label of [
    "Subir Documento de residencia legal en España (DNI español, tarjeta de residencia, tarjeta roja, intracomunitaria o resguardo de concesión)",
    "Subir Permiso de conducir extranjero original en vigor (ambas caras)",
    "Subir Examen psicotécnico (centro autorizado)",
  ]) {
    fireEvent.change(screen.getByLabelText(label), {
      target: {
        files: [
          new File(["ejemplo"], "ejemplo.pdf", { type: "application/pdf" }),
        ],
      },
    });
  }
  fireEvent.click(screen.getByRole("button", { name: "Validar y Enviar" }));
  await screen.findByRole("heading", { name: "Habla con tu gestor" });
  expect(
    screen.getByText(/Validación de ejemplo completada, sin envío real/),
  ).toBeInTheDocument();
  expect(readDemo().profile.nombre).toBe("Nombre Revisado");
  expect(readDemo().expedientes[0].documentos).toHaveLength(3);
  expect(fetch).not.toHaveBeenCalled();
});

it("la pregunta de recuperación mantiene el aviso local sin enviar correos", () => {
  mount("/acceso");
  fireEvent.click(
    screen.getByRole("button", { name: "¿Has olvidado tu contraseña?" }),
  );
  expect(screen.getByRole("status")).toHaveTextContent("No se envían emails");
  expect(fetch).not.toHaveBeenCalled();
});

it("los ojos alternan las contraseñas de acceso y registro sin enviar el formulario", () => {
  const login = mount("/acceso");
  fireEvent.change(screen.getByLabelText("Contraseña"), {
    target: { value: "ClaveSoloDemo" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
  expect(screen.getByLabelText("Contraseña")).toHaveAttribute("type", "text");
  expect(
    screen.getByRole("button", { name: "Ocultar contraseña" }),
  ).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByRole("button", { name: "Ocultar contraseña" }));
  expect(screen.getByLabelText("Contraseña")).toHaveAttribute(
    "type",
    "password",
  );
  expect(screen.getByLabelText("Contraseña")).toHaveValue("ClaveSoloDemo");
  login.unmount();
  mount("/registro");
  fireEvent.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
  expect(screen.getByLabelText("Contraseña")).toHaveAttribute("type", "text");
  expect(screen.getByLabelText("Repetir contraseña")).toHaveAttribute(
    "type",
    "password",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Mostrar repetición de contraseña" }),
  );
  expect(screen.getByLabelText("Repetir contraseña")).toHaveAttribute(
    "type",
    "text",
  );
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
  fireEvent.click(screen.getByRole("button", { name: "Mi cuenta" }));
  fireEvent.click(screen.getByRole("button", { name: "Mi Perfil" }));
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
    screen.getByRole("heading", { name: "Habla con LidIA" }),
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
    screen.getByRole("heading", { name: "Habla con LidIA" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Tu consulta" })).toHaveValue("");
  fireEvent.click(screen.getByRole("link", { name: "Servicios", exact: true }));
  expect(
    screen.queryByRole("button", { name: "Hablar con un gestor", exact: true }),
  ).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
});
