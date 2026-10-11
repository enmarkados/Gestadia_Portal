import React from "react";
import { it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProvider } from "./AppContext.jsx";
import { PluginWebProvider } from "./PluginWebContext.jsx";
import App from "./App.jsx";
afterEach(() => { cleanup(); vi.unstubAllGlobals(); sessionStorage.clear(); delete window.GESTADIA_APP_CONFIG; });
it("subir un documento requiere respuesta del Portal y envía el archivo con autorización", async () => {
  sessionStorage.setItem("gestadia_app_token", "test-token");
  window.GESTADIA_APP_CONFIG = { demoOnly: true, demoEnabled: true };
  vi.stubGlobal("fetch", vi.fn(async (url, options) => {
    if (options.method === "POST") return new Response(JSON.stringify({ ok: true }));
    const data = url === "/api/me" ? { id: "u1" }
      : url === "/api/expedientes/case-1" ? { id: "case-1", titulo: "Trámite", documentos: [], checklist: [{ clave: "residencia", label: "Residencia", subido: false }] } : [];
    return new Response(JSON.stringify(data));
  }));
  render(<MemoryRouter initialEntries={["/tramites/case-1"]}><AppProvider><PluginWebProvider enabled={false}><App /></PluginWebProvider></AppProvider></MemoryRouter>);
  const input = await screen.findByLabelText("Subir Residencia");
  const file = new File(["fixture sin datos personales"], "prueba.pdf", { type: "application/pdf" });
  fireEvent.change(input, { target: { files: [file] } });
  expect(await screen.findByText("Documento recibido. Pendiente de revisión por tu gestor.")).toBeInTheDocument();
  const [, options] = fetch.mock.calls.find(([url]) => url === "/api/expedientes/case-1/documentos");
  expect(options.method).toBe("POST");
  expect(options.headers.get("Authorization")).toBe("Bearer test-token");
  expect(options.body.get("clave")).toBe("residencia");
  expect(options.body.get("fichero")).toBe(file);
});
