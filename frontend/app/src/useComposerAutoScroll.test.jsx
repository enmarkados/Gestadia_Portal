import React, { useRef } from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useComposerAutoScroll } from "./useComposerAutoScroll.js";

let frames, resize, reduced;
beforeEach(() => {
  frames = new Map(); reduced = false;
  let id = 0;
  vi.stubGlobal("requestAnimationFrame", fn => { frames.set(++id, fn); return id; });
  vi.stubGlobal("cancelAnimationFrame", id => frames.delete(id));
  vi.stubGlobal("matchMedia", () => ({ matches: reduced }));
  vi.stubGlobal("ResizeObserver", class {
    constructor(fn) { resize = fn; }
    observe() {}
    disconnect() { resize = null; }
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function tick(time) { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(time)); }
function Check() {
  const end = useRef(null), events = useComposerAutoScroll(end, "test");
  return <><main className="app-main"><div>Historial</div><div ref={end}/></main><textarea aria-label="Consulta" {...events}/></>;
}
function mount() {
  const result = render(<Check/>), main = result.container.querySelector("main"), input = result.getByRole("textbox");
  Object.defineProperties(main, { scrollHeight: { value: 1200, configurable: true }, clientHeight: { value: 600, configurable: true } });
  main.scrollTop = 100;
  return { ...result, main, input };
}
it("al enfocar o tocar el campo baja suavemente hasta el último mensaje y sigue la altura del teclado", () => {
  const { main, input } = mount();
  input.focus(); fireEvent.click(input);
  expect(frames.size).toBe(1);
  tick(0); tick(140);
  expect(main.scrollTop).toBeGreaterThan(100); expect(main.scrollTop).toBeLessThan(600);
  Object.defineProperty(main, "clientHeight", { value: 300, configurable: true }); resize();
  tick(280); expect(main.scrollTop).toBe(900);
  main.scrollTop = 200; fireEvent.click(input); tick(300); tick(580);
  expect(main.scrollTop).toBe(900);
});
it("con movimiento reducido baja directamente y mantiene el final durante el resize", () => {
  reduced = true;
  const { main, input } = mount(); input.focus();
  expect(main.scrollTop).toBe(600); expect(frames.size).toBe(0);
  Object.defineProperty(main, "clientHeight", { value: 300, configurable: true }); resize();
  expect(main.scrollTop).toBe(900);
});
it("desenfocar o salir cancela el movimiento y permite leer el historial sin perseguir el teclado", () => {
  const { main, input, unmount } = mount(); input.focus(); tick(0); input.blur();
  expect(frames.size).toBe(0); expect(resize).toBeNull();
  main.scrollTop = 150; tick(300); expect(main.scrollTop).toBe(150);
  input.focus(); unmount(); expect(frames.size).toBe(0); expect(resize).toBeNull();
});
