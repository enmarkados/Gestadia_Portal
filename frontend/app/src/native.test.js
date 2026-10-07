import { beforeEach, afterEach, it, expect, vi } from "vitest";
const bridge = vi.hoisted(() => ({
  platform: "android",
  native: true,
  get: vi.fn(),
  open: vi.fn(),
  exit: vi.fn(),
  hide: vi.fn(),
  listeners: {},
}));
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => bridge.native,
    getPlatform: () => bridge.platform,
  },
  CapacitorHttp: { get: bridge.get },
}));
vi.mock("@capacitor/app", () => ({
  App: {
    addListener: vi.fn((name, callback) => {
      bridge.listeners[name] = callback;
      return Promise.resolve({ remove: vi.fn() });
    }),
    exitApp: bridge.exit,
  },
}));
vi.mock("@capacitor/browser", () => ({ Browser: { open: bridge.open } }));
vi.mock("@capacitor/splash-screen", () => ({
  SplashScreen: { hide: bridge.hide },
}));
import {
  loadNativeConfig,
  setupNativeNavigation,
  openExternal,
} from "./native.js";
let remove;
beforeEach(() => {
  vi.clearAllMocks();
  bridge.native = true;
  window.GESTADIA_APP_CONFIG = { demoOnly: true };
  window.location.hash = "#/";
});
afterEach(() => {
  remove?.();
  remove = null;
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});
it("el arranque nativo de la demo no carga configuración externa ni abre navegador", async () => {
  await loadNativeConfig();
  await expect(openExternal("https://gestadia.com")).rejects.toThrow(
    "no abre conexiones",
  );
  expect(bridge.get).not.toHaveBeenCalled();
  expect(bridge.open).not.toHaveBeenCalled();
});
it("en Android los enlaces internos y eventos ya atendidos no abren el navegador", () => {
  window.GESTADIA_APP_CONFIG = { demoOnly: false };
  remove = setupNativeNavigation();
  const anchor = document.createElement("a");
  anchor.href = "#/cuenta";
  document.body.append(anchor);
  anchor.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true }),
  );
  anchor.href = "https://gestadia.com";
  anchor.addEventListener("click", (event) => event.preventDefault());
  anchor.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true }),
  );
  expect(bridge.open).not.toHaveBeenCalled();
});
it("Atrás cierra primero el diálogo sin salir de la app", () => {
  remove = setupNativeNavigation();
  const dialog = document.createElement("dialog");
  dialog.setAttribute("open", "");
  dialog.close = () => dialog.removeAttribute("open");
  document.body.append(dialog);
  bridge.listeners.backButton();
  expect(dialog.hasAttribute("open")).toBe(false);
  expect(bridge.exit).not.toHaveBeenCalled();
  bridge.listeners.backButton();
  expect(bridge.exit).toHaveBeenCalledOnce();
});

it("Atrás nativo ejecuta el retorno visible antes del historial o de salir", () => {
  remove = setupNativeNavigation();
  const back = document.createElement("button");
  back.setAttribute("data-app-back", "");
  const click = vi.fn();
  back.addEventListener("click", click);
  document.body.append(back);
  bridge.listeners.backButton();
  expect(click).toHaveBeenCalledOnce();
  expect(bridge.exit).not.toHaveBeenCalled();
});

it("el checkout web abre otra pestaña y conserva la APP para volver", async () => {
  bridge.native = false;
  window.GESTADIA_APP_CONFIG = { demoOnly: false };
  const open = vi.spyOn(window, "open").mockImplementation(() => null);
  await openExternal("https://gestadia.com/checkout?servicio=transferencia");
  expect(open).toHaveBeenCalledWith(
    "https://gestadia.com/checkout?servicio=transferencia",
    "_blank",
    "noopener,noreferrer",
  );
  expect(bridge.open).not.toHaveBeenCalled();
});
