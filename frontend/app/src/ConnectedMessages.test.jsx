import React from "react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ConnectedMessages, { ConversationHome, ConversationList } from "./ConnectedMessages.jsx";
import { setToken } from "./api.js";
let rows, patches, failRename;
beforeEach(() => {
  localStorage.clear(); sessionStorage.clear(); setToken("ga_test");
  window.GESTADIA_APP_CONFIG = { demoOnly: false, demoEnabled: false, conversationsEnabled: true };
  rows = [
    { id: "chat-1", purpose: "sondeo", case_ref: null, title: "Mi canje de Perú", status: "closed", ready: true,
      created_at: "2026-10-06T10:00:00.000Z", last_message_at: "2026-10-07T10:05:00.000Z", metadata_ready: true },
    { id: "chat-2", purpose: "atencion", case_ref: null, title: null, status: "active", ready: true,
      created_at: "2026-10-07T11:00:00.000Z", last_message_at: null, metadata_ready: false },
  ]; patches = []; failRename = false;
  vi.stubGlobal("fetch", vi.fn(async (url, opts = {}) => {
    if (opts.method === "PATCH") {
      patches.push(JSON.parse(opts.body));
      if (failRename) return { ok: false, status: 503, json: async () => ({ code: "runtime_unavailable" }) };
      rows = rows.map(c => c.id === "chat-1" ? { ...c, title: JSON.parse(opts.body).title } : c);
      return { ok: true, status: 200, json: async () => rows[0] };
    }
    return { ok: true, status: 200, json: async () => ({ conversations: rows }) };
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const mount = () => render(<MemoryRouter><ConversationList kind="lidia" /></MemoryRouter>);
it("busca por nombre sin tildes y muestra fechas/estado confirmado sin inventarlo ante fallo", async () => {
  const view = mount();
  await screen.findByRole("link", { name: /Mi canje de Perú/ });
  expect(screen.getByText("Cerrada")).toBeInTheDocument();
  expect(screen.queryByText("Sin actualizar")).toBeNull();
  expect(screen.queryByText("Abierta")).toBeNull();
  expect(view.container.querySelector('time[datetime="2026-10-07T10:05:00.000Z"]')).not.toBeNull();
  fireEvent.change(screen.getByRole("searchbox", { name: "Buscar conversaciones" }), { target: { value: "PERU" } });
  expect(screen.getByRole("link", { name: /Mi canje de Perú/ })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Renombrar Tu gestor" })).toBeNull();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "equipo" } });
  expect(screen.queryByRole("link", { name: /Mi canje de Perú/ })).toBeNull();
  expect(screen.queryByRole("button", { name: "Renombrar Tu gestor" })).toBeNull();
});
it("renombrar actualiza la cuenta y se conserva tras remontar sin cambiar actividad", async () => {
  mount(); await screen.findByRole("button", { name: "Renombrar Mi canje de Perú" });
  fireEvent.click(screen.getByRole("button", { name: "Renombrar Mi canje de Perú" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Nombre de la conversación" }), { target: { value: "Documentos Perú" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar nombre" }));
  await screen.findByRole("link", { name: /Documentos Perú/ });
  expect(patches).toEqual([{ title: "Documentos Perú" }]);
  cleanup(); const view = mount(); await screen.findByRole("link", { name: /Documentos Perú/ });
  expect(view.container.querySelector('time[datetime="2026-10-07T10:05:00.000Z"]')).not.toBeNull();
});
it("rechazo al guardar conserva el nombre confirmado y el borrador", async () => {
  failRename = true; mount(); await screen.findByRole("button", { name: "Renombrar Mi canje de Perú" });
  fireEvent.click(screen.getByRole("button", { name: "Renombrar Mi canje de Perú" }));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Otro nombre" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar nombre" }));
  await screen.findByRole("alert");
  expect(screen.getByRole("textbox")).toHaveValue("Otro nombre");
  expect(screen.getByRole("link", { name: /Mi canje de Perú/ })).toBeInTheDocument();
});

it("limpia la búsqueda y devuelve el foco al buscador sin alterar conversaciones", async () => {
  mount(); await screen.findByRole("link", { name: /Mi canje de Perú/ });
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "no existe" } });
  expect(screen.getByRole("status")).toHaveTextContent("No hay conversaciones que coincidan.");
  fireEvent.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
  expect(screen.getByRole("searchbox")).toHaveValue("");
  expect(screen.getByRole("searchbox")).toHaveFocus();
  expect(screen.getByRole("link", { name: /Mi canje de Perú/ })).toBeInTheDocument();
  expect(patches).toEqual([]);
});
it("despliega sólo el nombre seleccionado y cancelar restituye foco y nombre", async () => {
  mount(); const edit = await screen.findByRole("button", { name: "Renombrar Mi canje de Perú" });
  fireEvent.click(edit);
  expect(edit).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("textbox", { name: "Nombre de la conversación" })).toHaveFocus();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Borrador sin guardar" } });
  fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(edit).toHaveFocus();
  expect(edit).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByRole("link", { name: /Mi canje de Perú/ })).toBeInTheDocument();
  expect(patches).toEqual([]);
});

it("mantiene visible el editor y sus acciones cuando el teclado reduce la lista y deja de seguir al cancelar", async () => {
  const observers = [];
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback) { observers.push(callback); }
    observe() {}
    disconnect() {}
  });
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  const view = render(<MemoryRouter><main className="app-main"><ConversationList kind="lidia" /></main></MemoryRouter>);
  fireEvent.click(await screen.findByRole("button", { name: "Renombrar Mi canje de Perú" }));
  const container = view.container.querySelector(".app-main");
  const input = screen.getByRole("textbox", { name: "Nombre de la conversación" });
  const form = input.closest("form");
  let height = 360;
  Object.defineProperties(container, { clientHeight: { get: () => height }, scrollHeight: { value: 1100 } });
  container.getBoundingClientRect = () => ({ top: 0, bottom: height, height });
  form.getBoundingClientRect = () => ({ top: 700 - container.scrollTop, bottom: 900 - container.scrollTop, height: 200 });
  input.blur(); input.focus();
  expect(container.scrollTop).toBe(552);
  height = 260;
  act(() => observers.forEach(callback => callback()));
  expect(container.scrollTop).toBe(652);
  expect(form.getBoundingClientRect().bottom).toBeLessThanOrEqual(height - 12);
  fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  container.scrollTop = 0;
  act(() => observers.forEach(callback => callback()));
  expect(container.scrollTop).toBe(0);
  expect(patches).toEqual([]);
});

it("acompaña la reducción de altura durante la animación sin saltar directamente al destino", async () => {
  const observers = [], frames = new Map(); let id = 0;
  vi.stubGlobal("ResizeObserver", class { constructor(callback) { observers.push(callback); } observe() {} disconnect() {} });
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  vi.stubGlobal("requestAnimationFrame", callback => { frames.set(++id, callback); return id; });
  vi.stubGlobal("cancelAnimationFrame", frame => frames.delete(frame));
  const advance = time => act(() => { const [frame, callback] = frames.entries().next().value; frames.delete(frame); callback(time); });
  const view = render(<MemoryRouter><main className="app-main"><ConversationList kind="lidia" /></main></MemoryRouter>);
  fireEvent.click(await screen.findByRole("button", { name: "Renombrar Mi canje de Perú" }));
  const container = view.container.querySelector(".app-main"), input = screen.getByRole("textbox"), form = input.closest("form");
  let height = 360;
  Object.defineProperties(container, { clientHeight: { get: () => height }, scrollHeight: { value: 1100 } });
  container.getBoundingClientRect = () => ({ top: 0, bottom: height, height });
  form.getBoundingClientRect = () => ({ top: 700 - container.scrollTop, bottom: 900 - container.scrollTop, height: 200 });
  input.blur(); input.focus();
  expect(container.scrollTop).toBe(0);
  advance(0); advance(140);
  expect(container.scrollTop).toBeGreaterThan(0);
  expect(container.scrollTop).toBeLessThan(552);
  height = 260; act(() => observers.forEach(callback => callback()));
  advance(280);
  expect(container.scrollTop).toBe(652);
  expect(form.getBoundingClientRect().bottom).toBeLessThanOrEqual(height - 12);
});

it("el autofoco al abrir el editor conserva el seguimiento del teclado sin necesitar otro toque", async () => {
  const observers = [];
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback) { this.callback = callback; this.connected = true; observers.push(this); }
    observe() {}
    disconnect() { this.connected = false; }
  });
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  const view = render(<MemoryRouter><main className="app-main"><ConversationList kind="lidia" /></main></MemoryRouter>);
  const container = view.container.querySelector(".app-main"); let height = 360;
  Object.defineProperties(container, { clientHeight: { get: () => height }, scrollHeight: { value: 1100 } });
  const original = Element.prototype.getBoundingClientRect;
  const geometry = vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function () {
    if (this === container) return { top: 0, bottom: height, height };
    if (this.classList.contains("conversation-rename")) return { top: 700 - container.scrollTop, bottom: 900 - container.scrollTop, height: 200 };
    return original.call(this);
  });
  try {
    fireEvent.click(await screen.findByRole("button", { name: "Renombrar Mi canje de Perú" }));
    expect(screen.getByRole("textbox")).toHaveFocus();
    expect(container.scrollTop).toBe(552);
    height = 260;
    act(() => observers.filter(observer => observer.connected).forEach(observer => observer.callback()));
    expect(container.scrollTop).toBe(652);
  } finally { geometry.mockRestore(); }
});

it("LidIA contiene nueva, continuar e historial y Mensajes sólo gestores", async () => {
  render(<MemoryRouter><ConversationHome /></MemoryRouter>);
  expect(screen.getByRole("link", { name: /Nueva conversación con LidIA/ })).toHaveAttribute("href", expect.stringMatching(/^\/lidia\/conversacion\?nueva=[a-f0-9-]{36}$/));
  expect(await screen.findByRole("link", { name: /Continuar conversación/ })).toHaveAttribute("href", "/lidia/conversacion?conversacion=chat-1");
  expect(screen.queryByRole("button", { name: "Renombrar Tu gestor" })).toBeNull();
  cleanup(); render(<MemoryRouter><ConnectedMessages /></MemoryRouter>);
  await screen.findByRole("button", { name: "Renombrar Tu gestor" });
  expect(screen.queryByRole("link", { name: /Mi canje de Perú/ })).toBeNull();
  expect(screen.queryByRole("link", { name: /Nueva conversación con LidIA/ })).toBeNull();
  expect(screen.getAllByText("Sin actualizar").length).toBeGreaterThan(0);
});

it("la carga inicial muestra una animación y al actualizar conserva el historial hasta completar o fallar", async () => {
  let finish;
  vi.stubGlobal("fetch", vi.fn(url => String(url) === "/api/app/v1/conversations" ? new Promise(resolve => { finish = resolve; }) : Promise.resolve({ ok: true, status: 200, json: async () => ({ conversations: [] }) })));
  mount();
  const initial = screen.getByRole("status");
  expect(initial).toHaveTextContent("Cargando conversaciones…");
  expect(initial.querySelector('img[src$=".gif"]')).not.toBeNull();
  finish({ ok: true, status: 200, json: async () => ({ conversations: rows }) });
  await screen.findByRole("link", { name: /Mi canje de Perú/ });
  fireEvent.click(screen.getByRole("button", { name: "Actualizar conversaciones" }));
  expect(screen.getByRole("status")).toHaveTextContent("Actualizando conversaciones…");
  expect(screen.getByRole("link", { name: /Mi canje de Perú/ })).toBeInTheDocument();
  finish({ ok: false, status: 503, json: async () => ({ code: "runtime_unavailable" }) });
  await screen.findByRole("alert");
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("link", { name: /Mi canje de Perú/ })).toBeInTheDocument();
});
