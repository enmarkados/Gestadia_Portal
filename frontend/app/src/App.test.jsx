import React from "react";
import { it, expect, vi, afterEach } from "vitest";
import { render, act, cleanup } from "@testing-library/react";
import { AppProvider, useApp } from "./AppContext.jsx";
import { setToken } from "./api.js";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  sessionStorage.clear();
});
it("una respuesta de perfil tardía después del cierre no restaura datos de la cuenta", async () => {
  let app, release;
  setToken("test-token");
  const delayed = new Promise((resolve) => {
    release = resolve;
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => ({
      ok: true,
      status: 200,
      json: async () => (url === "/api/me" ? delayed : []),
    })),
  );
  function Probe() {
    app = useApp();
    return null;
  }
  render(
    <AppProvider>
      <Probe />
    </AppProvider>,
  );
  await act(async () => {
    app.logout();
    release({ id: "old", nombre: "Anterior" });
  });
  expect(app.mode).toBe("visitante");
  expect(app.data.profile).toBeNull();
});
it("un guardado tardío después del cierre no restaura datos ni una sesión", async () => {
  let app, release, saving;
  setToken("test-token");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options) => {
      if (options.method === "PATCH") {
        saving = true;
        await new Promise((resolve) => {
          release = resolve;
        });
      }
      return {
        ok: true,
        status: 200,
        json: async () => (url === "/api/me" ? { id: "old" } : []),
      };
    }),
  );
  function Probe() {
    app = useApp();
    return null;
  }
  render(
    <AppProvider>
      <Probe />
    </AppProvider>,
  );
  await act(async () => {});
  let pending;
  await act(async () => {
    pending = app.saveProfile({ nombre: "Anterior" });
  });
  expect(saving).toBe(true);
  await act(async () => {
    app.logout();
    release();
    await pending;
  });
  expect(app.mode).toBe("visitante");
  expect(app.data.profile).toBeNull();
});
