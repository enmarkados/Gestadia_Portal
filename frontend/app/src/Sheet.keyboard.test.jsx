import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Sheet from "./Sheet.jsx";
let resized, viewport, jobs;
beforeEach(() => {
  jobs = [];
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  viewport = new EventTarget(); viewport.height = 844; viewport.offsetTop = 0;
  vi.stubGlobal("visualViewport", viewport);
  vi.stubGlobal("requestAnimationFrame", fn => { jobs.push(fn); return jobs.length; });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal("ResizeObserver", class { constructor(fn) { resized = fn; } observe() {} disconnect() {} });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
it("al reducir la altura visible desplaza sólo el teléfono dentro de la hoja y conserva el borrador", () => {
  render(<Sheet title="Hablar con un gestor" onClose={() => {}}><label>Teléfono<input type="tel" defaultValue="600123456" /></label></Sheet>);
  const dialog = screen.getByRole("dialog"), phone = screen.getByLabelText("Teléfono");
  dialog.getBoundingClientRect = () => ({ top: 80, bottom: 524 });
  phone.getBoundingClientRect = () => ({ top: 550, bottom: 598 });
  phone.focus(); fireEvent.focusIn(phone);
  viewport.height = 524; viewport.dispatchEvent(new Event("resize")); resized();
  jobs.splice(0).forEach(fn => fn());
  expect(dialog.style.getPropertyValue("--sheet-viewport-height")).toBe("524px");
  expect(dialog.scrollTop).toBeGreaterThan(0);
  expect(phone).toHaveValue("600123456");
  expect(phone).toHaveFocus();
});
