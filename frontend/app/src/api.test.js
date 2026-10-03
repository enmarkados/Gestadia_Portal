import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { request, checkoutUrl, setToken, getToken } from "./api.js";
import { pluginRequest, normalizeMessages } from "./PluginWebContext.jsx";
beforeEach(() => {
  sessionStorage.clear();
  window.GESTADIA_APP_CONFIG = {
    checkoutBaseUrl: "https://gestadia.com",
    pluginWeb: {
      baseUrl: "/lidia",
      key: "public-test-key",
    },
  };
});
afterEach(() => {
  vi.unstubAllGlobals();
});
describe("Contratos de conexión de Gestadia", () => {
  it("envía datos de checkout codificados y solo campos de cliente permitidos", () => {
    const url = new URL(
      checkoutUrl("canje-carnet", {
        nombre: "María & José",
        email: "alex+test@example.com",
        paisCanje: "Perú",
        password: "nunca-publicar",
        token: "privado",
      }),
    );
    expect(url.hostname).toBe("gestadia.com");
    expect(url.searchParams.get("nombre")).toBe("María & José");
    expect(url.searchParams.get("procedencia")).toBe("lidia");
    expect(url.searchParams.get("paisCanje")).toBe("peru");
    expect(url.searchParams.has("password")).toBe(false);
    expect(url.searchParams.has("token")).toBe(false);
  });
  it("un 401 de una cuenta anterior no cierra la nueva sesión", async () => {
    setToken("cuenta-a");
    let finish;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      ),
    );
    const result = request("/api/me");
    setToken("cuenta-b");
    finish({
      ok: false,
      status: 401,
      json: async () => ({ error: "Caducada A" }),
    });
    await expect(result).rejects.toThrow("Caducada A");
    expect(getToken()).toBe("cuenta-b");
  });
  it("usa códigos compatibles con el país seleccionado en el checkout", () => {
    for (const [label, key] of [
      ["Perú", "peru"],
      ["Reino Unido", "reino-unido"],
      ["PE", "peru"],
      ["Japón", "japon"],
    ]) {
      expect(
        new URL(
          checkoutUrl("canje-carnet", { paisCanje: label }),
        ).searchParams.get("paisCanje"),
      ).toBe(key);
    }
    expect(
      new URL(
        checkoutUrl("canje-carnet", { paisCanje: "País sin reconocer" }),
      ).searchParams.has("paisCanje"),
    ).toBe(false);
  });
  it("caduca la sesión del portal sin redirigir fuera de la app", async () => {
    setToken("expired");
    const expired = vi.fn();
    window.addEventListener("gestadia-session-expired", expired);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 401,
        ok: false,
        json: async () => ({
          error: "Sesión caducada",
        }),
      }),
    );
    await expect(request("/api/me")).rejects.toThrow("Sesión caducada");
    expect(getToken()).toBeNull();
    expect(expired).toHaveBeenCalledOnce();
    window.removeEventListener("gestadia-session-expired", expired);
  });
  it("mantiene separadas las credenciales de portal y PluginWeb", async () => {
    setToken("portal-secret");
    const fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({
        ok: true,
      }),
    });
    vi.stubGlobal("fetch", fetch);
    await pluginRequest("/sessions/web-session/messages", {
      token: "web-session-token",
      method: "POST",
      body: {
        text: "Hola",
      },
    });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/lidia/api/pluginweb/sessions/web-session/messages");
    expect(options.headers["X-Plugin-Key"]).toBe("public-test-key");
    expect(options.headers["X-Session-Token"]).toBe("web-session-token");
    expect(options.headers.Authorization).toBeUndefined();
    expect(JSON.parse(options.body)).toEqual({
      text: "Hola",
    });
  });
  it("rechaza respuestas HTML de un proxy y conserva errores 429 distinguibles", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: async () => {
            throw new Error("HTML");
          },
        })
        .mockResolvedValueOnce({
          status: 429,
          ok: false,
          json: async () => ({
            error: "Espera",
          }),
        }),
    );
    await expect(request("/api/me")).rejects.toThrow("datos válidos");
    await expect(pluginRequest("/sessions")).rejects.toMatchObject({
      status: 429,
    });
  });
  it("diferencia mensaje humano, IA y usuario sin insertar HTML remoto", () => {
    expect(
      normalizeMessages([
        {
          content: "<script>alert(1)</script>",
          isSupport: true,
        },
        {
          content: "Hola",
          isUser: true,
        },
        {
          content: "Respuesta",
        },
      ]),
    ).toEqual([
      {
        content: "<script>alert(1)</script>",
        role: "manager",
        timestamp: undefined,
      },
      {
        content: "Hola",
        role: "user",
        timestamp: undefined,
      },
      {
        content: "Respuesta",
        role: "assistant",
        timestamp: undefined,
      },
    ]);
  });
});
