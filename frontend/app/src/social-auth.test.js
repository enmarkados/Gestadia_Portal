import { it, expect, vi } from "vitest";
import { createSocialClient } from "./social-auth.js";
const cfg = {
  demoOnly: false,
  social: {
    google: { webClientId: "web", iosClientId: "ios" },
    apple: { clientId: "app" },
  },
};
it("demo bloquea proveedores; Google incluye nonce y descarta sesión tardía", async () => {
  let token = null;
  const discard = vi.fn();
  const plugin = {
    initialize: vi.fn(),
    login: vi.fn(async () => ({ result: { idToken: "identity" } })),
  };
  const request = vi.fn(async (path) => {
    if (path.endsWith("attempts"))
      return { id: "attempt", proof: "proof", nonce: "nonce" };
    token = "changed";
    return { token: "late" };
  });
  const svc = createSocialClient({
    config: () => ({ ...cfg, demoOnly: true }),
    platform: () => "ios",
    request,
    plugin,
    current: () => token,
    discard,
  });
  await expect(svc.start("google")).rejects.toThrow();
  expect(request).not.toHaveBeenCalled();
  const connected = createSocialClient({
    config: () => cfg,
    platform: () => "ios",
    request,
    plugin,
    current: () => token,
    discard,
  });
  await expect(connected.start("google")).rejects.toThrow("sesión");
  expect(plugin.login).toHaveBeenCalledWith({
    provider: "google",
    options: {
      nonce: "nonce",
      forcePrompt: true,
      scopes: ["openid", "email", "profile"],
    },
  });
  expect(discard).toHaveBeenCalledWith("late");
});
it("Apple Android abre sólo autorización servidor y prueba retenida; rechaza retorno ajeno", async () => {
  const secure = { set: vi.fn(), get: vi.fn(), remove: vi.fn() };
  const browser = { open: vi.fn() };
  const request = vi.fn(async () => ({
    id: "attempt",
    proof: "proof",
    nonce: "nonce",
    authorizationUrl: "https://appleid.apple.com/auth/authorize?state=fixture",
  }));
  const svc = createSocialClient({
    config: () => cfg,
    platform: () => "android",
    request,
    plugin: {},
    browser,
    secure,
    current: () => null,
    discard: vi.fn(),
  });
  expect((await svc.start("apple")).status).toBe("browser_open");
  expect(secure.set.mock.calls[0][1].proof).toBe("proof");
  expect(browser.open).toHaveBeenCalledOnce();
  await expect(
    svc.resume("gestadia://auth/apple?code=stolen&attempt=other"),
  ).rejects.toThrow();
  expect(request).toHaveBeenCalledOnce();
});
