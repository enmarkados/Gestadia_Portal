import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { MOTION_MS, PageMotion, useMessageMotion, useSheetMotion } from "./motion.jsx";
import Sheet from "./Sheet.jsx";

let media, listeners, animations;
beforeEach(() => {
  listeners = new Set();
  media = { matches: false, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn) };
  vi.stubGlobal("matchMedia", () => media);
  animations = [];
  Element.prototype.animate = vi.fn(function(frames, options) {
    const cancel = vi.fn(); animations.push({ element: this, frames, options, cancel }); return { cancel };
  });
  HTMLDialogElement.prototype.showModal = function() { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function() { this.removeAttribute("open"); };
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); delete Element.prototype.animate; });
function reduceMotion() { act(() => { media.matches = true; listeners.forEach(fn => fn()); }); }
function RouteHarness() {
  const navigate = useNavigate();
  return <><header data-testid="header">Gestadia</header><PageMotion>
    <input aria-label="Borrador" defaultValue="Conservar" />
    <button onClick={() => navigate("/registro")}>Registro</button>
    <button onClick={() => navigate(-1)}>Atrás</button>
    <button onClick={() => navigate("/acceso?retorno=tramites")}>Parámetros</button>
  </PageMotion></>;
}
it("avance y POP usan280ms en el contenido, conservan cabecera/borrador y omiten cambios de parámetros", () => {
  render(<MemoryRouter initialEntries={["/acceso"]}><RouteHarness /></MemoryRouter>);
  const header = screen.getByTestId("header"), input = screen.getByLabelText("Borrador");
  expect(animations).toHaveLength(0);
  fireEvent.click(screen.getByText("Registro"));
  expect(animations[0].options.duration).toBe(280);
  expect(animations[0].frames[0].transform).toBe("translateX(12px)");
  expect(animations[0].element).toHaveClass("page-motion");
  fireEvent.click(screen.getByText("Atrás"));
  expect(animations[1].frames[0].transform).toBe("translateX(-12px)");
  fireEvent.click(screen.getByText("Parámetros"));
  expect(animations).toHaveLength(2);
  expect(screen.getByTestId("header")).toBe(header);
  expect(screen.getByLabelText("Borrador")).toBe(input);
  expect(input).toHaveValue("Conservar");
});
it("activar movimiento reducido cancela la transición en curso y las siguientes son directas", () => {
  render(<MemoryRouter initialEntries={["/acceso"]}><RouteHarness /></MemoryRouter>);
  fireEvent.click(screen.getByText("Registro"));
  reduceMotion();
  expect(animations[0].cancel).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByText("Atrás"));
  expect(animations).toHaveLength(1);
});
it("una salida mantiene el panel/modal hasta280ms, ejecuta la continuación una vez y restaura el foco", () => {
  vi.useFakeTimers();
  const next = vi.fn();
  function Harness() {
    const motion = useSheetMotion("/tramites");
    return <><button onClick={() => motion.openSheet("test")}>Abrir</button>
      {motion.sheet && <Sheet title="Panel" closing={motion.closing} onClose={() => motion.closeSheet(next)}><p>Contenido</p></Sheet>}</>;
  }
  render(<Harness />);
  const trigger = screen.getByText("Abrir"); trigger.focus(); fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
  expect(screen.getByRole("dialog")).toHaveAttribute("data-motion-closing", "true");
  expect(screen.getByRole("dialog")).toHaveAttribute("inert");
  act(() => vi.advanceTimersByTime(MOTION_MS - 1));
  expect(screen.getByRole("dialog")).toBeInTheDocument(); expect(next).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.queryByRole("dialog")).toBeNull(); expect(next).toHaveBeenCalledOnce(); expect(trigger).toHaveFocus();
});
it("cierre reducido es inmediato y cambio de ruta cancela una continuación pendiente", () => {
  vi.useFakeTimers();
  const next = vi.fn();
  const { result, rerender } = renderHook(({ path }) => useSheetMotion(path), { initialProps: { path: "/tramites" } });
  act(() => result.current.openSheet("account"));
  act(() => result.current.closeSheet(next));
  rerender({ path: "/servicios" });
  act(() => vi.advanceTimersByTime(280));
  expect(next).not.toHaveBeenCalled(); expect(result.current.sheet).toBeNull();
  reduceMotion();
  act(() => result.current.openSheet("contact"));
  act(() => result.current.closeSheet(next));
  expect(result.current.sheet).toBeNull(); expect(next).toHaveBeenCalledOnce();
});
it("cambiar a movimiento reducido durante una salida la finaliza sin esperar el timer", () => {
  vi.useFakeTimers();
  const next = vi.fn();
  const { result } = renderHook(() => useSheetMotion("/"));
  act(() => result.current.openSheet("account"));
  act(() => result.current.closeSheet(next));
  reduceMotion();
  expect(result.current.sheet).toBeNull(); expect(next).toHaveBeenCalledOnce();
  act(() => vi.advanceTimersByTime(280)); expect(next).toHaveBeenCalledOnce();
});
it("historia inicial/paginada y cambios de recibos permanecen quietos; sólo mensajes posteriores entran", () => {
  const message = (id, sequence) => ({ message_id: id, sequence: String(sequence) });
  const { result, rerender } = renderHook(({ items, ready }) => useMessageMotion(items, ready), { initialProps: { items: [message("a", 10)], ready: true } });
  expect(result.current.size).toBe(0);
  rerender({ items: [message("old", 1), message("a", 10), message("b", 11)], ready: true });
  expect([...result.current]).toEqual(["b"]);
  const entered = result.current;
  rerender({ items: [message("old", 1), message("a", 10), { ...message("b", 11), read: true }], ready: true });
  expect(result.current).toBe(entered);
  rerender({ items: [], ready: false });
  rerender({ items: [message("a", 10), message("b", 11)], ready: true });
  expect(result.current.size).toBe(0);
});
it("una recuperación paginada no anima la segunda página inicial", () => {
  const { result, rerender } = renderHook(({ items, ready }) => useMessageMotion(items, ready), { initialProps: { items: [{ message_id: "one", sequence: "1" }], ready: false } });
  rerender({ items: [{ message_id: "one", sequence: "1" }, { message_id: "two", sequence: "2" }], ready: true });
  expect(result.current.size).toBe(0);
});
it("activar y desactivar movimiento reducido no vuelve a animar mensajes vistos o recibidos sin movimiento", () => {
  const message = id => ({ message_id: id, sequence: String(id) });
  const { result, rerender } = renderHook(({ items }) => useMessageMotion(items), { initialProps: { items: [message(1)] } });
  rerender({ items: [message(1), message(2)] });
  expect([...result.current]).toEqual([2]);
  reduceMotion();
  expect(result.current.size).toBe(0);
  rerender({ items: [message(1), message(2), message(3)] });
  expect(result.current.size).toBe(0);
  act(() => { media.matches = false; listeners.forEach(fn => fn()); });
  expect(result.current.size).toBe(0);
  rerender({ items: [message(1), message(2), message(3), message(4)] });
  expect([...result.current]).toEqual([4]);
});
