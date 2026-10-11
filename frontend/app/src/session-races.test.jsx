import React from "react";
import { render, act, cleanup } from "@testing-library/react";
import { it, expect, vi, afterEach } from "vitest";
import { Capacitor } from "@capacitor/core";
import { nativeSession } from "./sessionStorage.js";
import { AppProvider, useApp } from "./AppContext.jsx";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("login cancelado durante persistencia segura no reabre modo real", async () => {
  window.GESTADIA_APP_CONFIG = { demoOnly: false };
  let app,
    token = null,
    release,
    started;
  const writing = new Promise((r) => (started = r));
  vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(true);
  vi.spyOn(Capacitor, "getPlatform").mockReturnValue("ios");
  vi.spyOn(nativeSession, "get").mockImplementation(() => token);
  vi.spyOn(nativeSession, "set").mockImplementation(async (value) => {
    if (value) {
      started();
      await new Promise((r) => (release = r));
    }
    token = value;
  });
  vi.spyOn(nativeSession, "logout").mockImplementation(async () => {
    token = null;
    return { pending: 0 };
  });
  const discard = vi
    .spyOn(nativeSession, "discard")
    .mockResolvedValue({ pending: 0 });
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(JSON.stringify({ token: "late" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    ),
  );
  function Probe() {
    app = useApp();
    return <p>{app.mode}</p>;
  }
  render(
    <AppProvider>
      <Probe />
    </AppProvider>,
  );
  let result;
  await act(async () => {
    result = app.login("fixture@example.com", "fixture").catch((e) => e);
    await writing;
  });
  await act(async () => {
    app.logout();
    release();
    await result;
  });
  expect(app.mode).toBe("visitante");
  expect(await result).toBeInstanceOf(Error);
  expect(discard).toHaveBeenCalledWith("late");
  expect(token).toBe(null);
});
it("logout sin conexión muestra revocación pendiente", async () => {
  window.GESTADIA_APP_CONFIG = { demoOnly: false };
  let app;
  vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(true);
  vi.spyOn(nativeSession, "get").mockReturnValue(null);
  vi.spyOn(nativeSession, "logout").mockResolvedValue({ pending: 1 });
  vi.spyOn(nativeSession, "flush").mockResolvedValue({ pending: 1 });
  function Probe() {
    app = useApp();
    return <p>{app.mode}</p>;
  }
  render(
    <AppProvider>
      <Probe />
    </AppProvider>,
  );
  await act(async () => {
    app.logout();
  });
  expect(app.error).toMatch(/revocación.*pendiente/i);
});
