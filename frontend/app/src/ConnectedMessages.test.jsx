import React from "react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ConnectedMessages, { ConversationHome } from "./ConnectedMessages.jsx";
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
const mount = () => render(<MemoryRouter><ConnectedMessages /></MemoryRouter>);
it("busca por nombre sin tildes y muestra fechas/estado confirmado sin inventarlo ante fallo", async () => {
  const view = mount();
  await screen.findByRole("link", { name: /Mi canje de Perú/ });
  expect(screen.getByText("Cerrada")).toBeInTheDocument();
  expect(screen.getAllByText("Sin actualizar").length).toBeGreaterThan(0);
  expect(screen.queryByText("Abierta")).toBeNull();
  expect(view.container.querySelector('time[datetime="2026-10-07T10:05:00.000Z"]')).not.toBeNull();
  fireEvent.change(screen.getByRole("searchbox", { name: "Buscar conversaciones" }), { target: { value: "PERU" } });
  expect(screen.getByRole("link", { name: /Mi canje de Perú/ })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Renombrar Equipo Gestadia" })).toBeNull();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "equipo" } });
  expect(screen.queryByRole("link", { name: /Mi canje de Perú/ })).toBeNull();
  expect(screen.getByRole("button", { name: "Renombrar Equipo Gestadia" })).toBeInTheDocument();
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

it("Inicio y Mensajes distinguen iniciar un chat independiente de recuperar el historial", async () => {
  render(<MemoryRouter><ConversationHome /></MemoryRouter>);
  expect(screen.getByRole("link", { name: /Nueva conversación con LidIA/ })).toHaveAttribute("href", expect.stringMatching(/^\/lidia\/conversacion\?nueva=[a-f0-9-]{36}$/));
  expect(screen.getByRole("link", { name: /Continuar conversación/ })).toHaveAttribute("href", "/lidia/conversacion");
  cleanup(); mount();
  await screen.findByRole("link", { name: /Mi canje de Perú/ });
  expect(screen.getByRole("link", { name: /Nueva conversación con LidIA/ })).toHaveAttribute("href", expect.stringMatching(/^\/lidia\/conversacion\?nueva=[a-f0-9-]{36}$/));
  expect(screen.getByRole("link", { name: /Mi canje de Perú/ })).toHaveAttribute("href", "/lidia/conversacion?conversacion=chat-1");
});
