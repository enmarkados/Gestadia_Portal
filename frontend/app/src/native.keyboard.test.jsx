import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { setupNativeKeyboard } from "./native.js";
const device = vi.hoisted(() => ({ platform: "ios" }));
vi.mock("@capacitor/core", () => ({ Capacitor: { isNativePlatform: () => device.platform !== "web", getPlatform: () => device.platform }, CapacitorHttp: {} }));
vi.mock("@capacitor/keyboard", () => ({ Keyboard: { setResizeMode: async () => {}, setScroll: async () => {} } }));
let stop;
beforeEach(() => { device.platform = "ios"; document.body.innerHTML = '<div class="app-shell"></div>'; vi.stubGlobal("matchMedia", () => ({ matches: false })); });
afterEach(() => { stop?.(); stop = null; vi.unstubAllGlobals(); });
const frame = detail => window.dispatchEvent(new CustomEvent("gestadiaKeyboardFrame", { detail }));
it("ajusta el contenedor antes de abrir y cerrar el teclado usando la duración de iOS", async () => {
  stop = await setupNativeKeyboard();
  const shell = document.querySelector(".app-shell");
  frame({ viewportHeight: 524, duration: 0.35, curve: 0, keyboardVisible: true });
  expect(shell.style.height).toBe("524px");
  expect(shell.style.transition).toBe("height 350ms ease-in-out");
  frame({ viewportHeight: 844, duration: 0.25, curve: 2, keyboardVisible: false });
  expect(shell.style.height).toBe("844px");
  expect(shell.style.transition).toBe("height 250ms ease-out");
});
it("retira el ajuste al limpiar y no aplica tiempos animados con movimiento reducido", async () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  stop = await setupNativeKeyboard();
  const shell = document.querySelector(".app-shell");
  frame({ viewportHeight: 524, duration: 0.35, curve: 0, keyboardVisible: true });
  expect(shell.style.height).toBe("524px");
  expect(shell.style.transition).toBe("none");
  stop(); stop = null;
  frame({ viewportHeight: 400, duration: 0.35, curve: 0, keyboardVisible: true });
  expect(shell.style.height).toBe("");
});
it("ignora eventos malformados y conserva el ajuste propio de Android y web", async () => {
  device.platform = "android";
  stop = await setupNativeKeyboard();
  frame({ viewportHeight: 524, duration: 0.35, curve: 0, keyboardVisible: true });
  expect(document.querySelector(".app-shell").style.height).toBe("");
  device.platform = "ios"; stop = await setupNativeKeyboard();
  frame({ viewportHeight: -50, duration: 0.35, curve: 0, keyboardVisible: true });
  expect(document.querySelector(".app-shell").style.height).toBe("");
});
