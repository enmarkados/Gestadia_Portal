import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import App from "./App.jsx";
import { AppProvider } from "./AppContext.jsx";
import { PluginWebProvider } from "./PluginWebContext.jsx";
import { createDemo, DEMO_KEY } from "./demo.js";

function mount(path = "/tramites") {
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
function openProfile() {
  fireEvent.click(screen.getByRole("button", { name: "Mi cuenta" }));
  fireEvent.click(screen.getByRole("button", { name: "Mi Perfil" }));
}
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  window.GESTADIA_APP_CONFIG = { demoOnly: true, demoEnabled: true };
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new Error("Sin conexiones")),
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("abre Cuenta antes de Mi Perfil, devuelve el foco al cerrar y conserva el selector propio", () => {
  mount();
  const card = screen
    .getByRole("link", { name: "Ver trámite y documentos" })
    .closest("article");
  expect(within(card).queryByText("Hablar con un gestor")).toBeNull();
  expect(
    within(card).getByRole("link", { name: "Ver trámite y documentos" }),
  ).toHaveClass("dark-btn");
  const trigger = screen.getByRole("button", { name: "Mi cuenta" });
  trigger.focus();
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("dialog", { name: "Cuenta" })).toHaveTextContent(
    "Alex Ejemplo",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Cerrar menú de cuenta" }),
  );
  expect(trigger).toHaveFocus();
  openProfile();
  expect(
    screen.getByRole("heading", { name: "Mi Perfil" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Cliente con trámite" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Lead sin trámite" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Hablar con un gestor" }),
  ).toBeNull();
  expect(screen.getByLabelText("Email")).toHaveAttribute("readonly");
  expect(fetch).not.toHaveBeenCalled();
});

it("guarda preferencias al recargar sin pedir permisos ni iniciar medición", () => {
  const permission = vi.fn();
  vi.stubGlobal("Notification", { requestPermission: permission });
  mount("/cuenta");
  for (const label of [
    "Avisos push",
    "Analítica de producto",
    "Medición de campañas Meta/Google",
    "Diagnóstico técnico de errores",
  ])
    fireEvent.click(screen.getByRole("switch", { name: label }));
  cleanup();
  mount("/cuenta");
  expect(
    screen
      .getAllByRole("switch")
      .every((item) => item.getAttribute("aria-checked") === "true"),
  ).toBe(true);
  expect(permission).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});

it("valida la confirmación de contraseña y descarta todos sus valores después del ejemplo", () => {
  mount("/cuenta");
  fireEvent.change(screen.getByLabelText("Contraseña actual"), {
    target: { value: "ActualFicticia123!" },
  });
  fireEvent.change(screen.getByLabelText("Nueva contraseña"), {
    target: { value: "NuevaFicticia456!" },
  });
  fireEvent.change(screen.getByLabelText("Confirmar nueva contraseña"), {
    target: { value: "DistintaFicticia789!" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Cambiar contraseña" }));
  expect(screen.getByRole("alert")).toHaveTextContent("no coinciden");
  fireEvent.change(screen.getByLabelText("Confirmar nueva contraseña"), {
    target: { value: "NuevaFicticia456!" },
  });
  fireEvent.click(
    screen.getByRole("button", {
      name: "Mostrar nueva contraseña",
      exact: true,
    }),
  );
  expect(screen.getByLabelText("Nueva contraseña")).toHaveAttribute(
    "type",
    "text",
  );
  fireEvent.click(screen.getByRole("button", { name: "Cambiar contraseña" }));
  expect(screen.getByRole("status")).toHaveTextContent(
    "No se ha cambiado una contraseña real",
  );
  expect(screen.getByLabelText("Contraseña actual")).toHaveValue("");
  expect(screen.getByLabelText("Nueva contraseña")).toHaveValue("");
  expect(screen.getByLabelText("Confirmar nueva contraseña")).toHaveValue("");
  expect(JSON.stringify({ ...localStorage, ...sessionStorage })).not.toContain(
    "Ficticia",
  );
  expect(fetch).not.toHaveBeenCalled();
});

it("permite cancelar el borrado y elimina sólo el ejemplo de Gestadia al confirmar", async () => {
  const demo = createDemo();
  demo.profile.nombre = "Borrar este perfil";
  demo.preferences = { analytics: true };
  demo.consultations = [{ summary: "Consulta para borrar" }];
  localStorage.setItem(DEMO_KEY, JSON.stringify(demo));
  localStorage.setItem("datos_de_otra_app", "Conservar");
  sessionStorage.setItem("sesion_de_otra_app", "Conservar");
  mount("/cuenta");
  fireEvent.click(
    screen.getByRole("button", { name: "Cerrar y borrar cuenta" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Conservar mi cuenta" }));
  expect(localStorage.getItem(DEMO_KEY)).toContain("Borrar este perfil");
  fireEvent.click(
    screen.getByRole("button", { name: "Cerrar y borrar cuenta" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Borrar cuenta de ejemplo" }),
  );
  await screen.findByRole("heading", { name: "Iniciar sesión" });
  expect(screen.getByRole("status")).toHaveTextContent(
    "Cuenta de ejemplo borrada",
  );
  expect(localStorage.getItem(DEMO_KEY)).toBeNull();
  expect(localStorage.getItem("datos_de_otra_app")).toBe("Conservar");
  expect(sessionStorage.getItem("sesion_de_otra_app")).toBe("Conservar");
  fireEvent.click(
    screen.getByRole("button", { name: "Explorar la demostración" }),
  );
  openProfile();
  expect(screen.getByLabelText("Nombre")).toHaveValue("Alex");
  expect(localStorage.getItem(DEMO_KEY)).not.toContain("Consulta para borrar");
  expect(
    screen.getByRole("switch", { name: "Analítica de producto" }),
  ).toHaveAttribute("aria-checked", "false");
  expect(fetch).not.toHaveBeenCalled();
});

it("mantiene el perfil y muestra el fallo si no se puede borrar el almacenamiento", () => {
  mount("/cuenta");
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
    throw new Error("Almacenamiento bloqueado");
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Cerrar y borrar cuenta" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Borrar cuenta de ejemplo" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Almacenamiento bloqueado",
  );
  expect(localStorage.getItem(DEMO_KEY)).toContain("Alex");
  expect(
    screen.getByRole("heading", { name: "Mi Perfil" }),
  ).toBeInTheDocument();
});

it("conserva el origen al navegar entre documentos y ofrece información sin sesión", async () => {
  mount("/cuenta");
  fireEvent.click(
    screen.getByRole("link", { name: "Privacidad", exact: true }),
  );
  expect(
    screen.getByRole("heading", { name: "Política de privacidad" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: "Términos", exact: true }));
  fireEvent.click(screen.getByRole("link", { name: "Soporte", exact: true }));
  fireEvent.click(screen.getByRole("link", { name: "Volver a Mi Perfil" }));
  fireEvent.click(screen.getByRole("button", { name: "Mi cuenta" }));
  fireEvent.click(screen.getByRole("button", { name: "Cerrar Sesión" }));
  expect(
    screen.getByRole("heading", { name: "Iniciar sesión" }),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("link", { name: "Privacidad", exact: true }),
  );
  fireEvent.click(
    screen.getByRole("link", { name: "Eliminar cuenta", exact: true }),
  );
  expect(
    screen.getByText(/No hay una sesión de ejemplo abierta/),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: "Volver al acceso" }));
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeInTheDocument(),
  );
  expect(
    screen.queryByRole("button", { name: "Hablar con un gestor" }),
  ).toBeNull();
  fireEvent.click(screen.getByRole("link", { name: "Gestadia, inicio" }));
  expect(
    screen.getByRole("heading", { name: "Iniciar sesión" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Hablar con un gestor" }),
  ).toBeNull();
  expect(
    screen.queryByRole("navigation", { name: "Navegación principal" }),
  ).toBeNull();
  fireEvent.click(
    screen.getByRole("link", { name: "Crear cuenta", exact: true }),
  );
  expect(
    screen.queryByRole("button", { name: "Hablar con un gestor" }),
  ).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
});
