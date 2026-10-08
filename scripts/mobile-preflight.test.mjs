import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
let validate;
try {
  ({ validateRelease: validate } = await import("./mobile-preflight.mjs"));
} catch {}
const base = () => ({
  appId: "com.gestadia.app",
  apiBaseUrl: "https://app.gestadia.com",
  demoOnly: false,
  demoEnabled: false,
  push: { enabled: true },
  social: {
    google: {
      webClientId: "web.apps.googleusercontent.com",
      iosClientId: "ios.apps.googleusercontent.com",
    },
    apple: {
      clientId: "com.gestadia.app",
      androidServiceId: "com.gestadia.app.web",
      redirectUrl: "https://app.gestadia.com/api/auth/social/apple/callback",
    },
  },
});
test("la release rechaza demo y HTTP aunque haya firma", () => {
  assert.equal(typeof validate, "function", "Falta implementar el preflight");
  const errors = validate(
    { ...base(), demoOnly: true, apiBaseUrl: "http://example.com" },
    { teamId: "ABCDEFGHIJ" },
    "ios",
  );
  assert.ok(errors.some((e) => e.includes("demo")));
  assert.ok(errors.some((e) => e.includes("HTTPS")));
});
test("el cliente no puede empaquetar secretos ni callbacks externos", () => {
  assert.equal(typeof validate, "function", "Falta implementar el preflight");
  const c = base();
  c.social.apple.privateKey = "private";
  c.social.apple.redirectUrl = "https://evil.example/callback";
  const errors = validate(c, { teamId: "ABCDEFGHIJ" }, "ios");
  assert.ok(errors.some((e) => e.includes("secreto")));
  assert.ok(errors.some((e) => e.includes("callback")));
});
test("Android exige keystore, contraseñas disponibles y Firebase del paquete correcto", () => {
  assert.equal(typeof validate, "function", "Falta implementar el preflight");
  const errors = validate(base(), {}, "android");
  assert.ok(errors.some((e) => e.includes("keystore")));
  assert.ok(errors.some((e) => e.includes("Firebase")));
});
test("acepta configuración iOS completa sin convertirla en prueba de firma", () => {
  assert.equal(typeof validate, "function", "Falta implementar el preflight");
  assert.deepEqual(validate(base(), { teamId: "ABCDEFGHIJ" }, "ios"), []);
});
test("Android acepta recursos existentes y rechaza una configuración Firebase ajena", () => {
  assert.equal(typeof validate, "function", "Falta implementar el preflight");
  const dir = mkdtempSync(join(tmpdir(), "gestadia-preflight-"));
  try {
    writeFileSync(join(dir, "upload.jks"), "fixture");
    writeFileSync(
      join(dir, "google-services.json"),
      JSON.stringify({
        client: [
          {
            client_info: {
              android_client_info: { package_name: "com.gestadia.app" },
            },
          },
        ],
      }),
    );
    const signing = {
      keystore: join(dir, "upload.jks"),
      alias: "gestadia-upload",
      storePasswordEnv: "TEST_STORE_PASS",
      keyPasswordEnv: "TEST_KEY_PASS",
      firebaseFile: join(dir, "google-services.json"),
    };
    assert.deepEqual(
      validate(base(), signing, "android", {
        TEST_STORE_PASS: "fixture",
        TEST_KEY_PASS: "fixture",
      }),
      [],
    );
    writeFileSync(
      signing.firebaseFile,
      JSON.stringify({
        client: [
          {
            client_info: {
              android_client_info: { package_name: "com.other.app" },
            },
          },
        ],
      }),
    );
    assert.ok(
      validate(base(), signing, "android", {
        TEST_STORE_PASS: "fixture",
        TEST_KEY_PASS: "fixture",
      }).some((e) => e.includes("Firebase")),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("release empaquetada diferente de configuración validada queda rechazada", async () => {
  const { verifyPackagedRelease } = await import("./mobile-preflight.mjs");
  assert.throws(() =>
    verifyPackagedRelease(
      { appId: "com.gestadia.app" },
      "window.GESTADIA_APP_CONFIG={demoOnly:true};",
    ),
  );
  assert.doesNotThrow(() =>
    verifyPackagedRelease(
      { appId: "com.gestadia.app" },
      "window.GESTADIA_APP_CONFIG = " +
        JSON.stringify({ appId: "com.gestadia.app" }) +
        ";\n",
    ),
  );
});

test("backend demo o audiencias distintas no permite preparar distribución", async () => {
  const { verifyCapabilities } = await import("./mobile-preflight.mjs");
  const config = {
    social: {
      google: { webClientId: "web", iosClientId: "ios" },
      apple: { clientId: "app", androidServiceId: "service" },
    },
  };
  assert.throws(() => verifyCapabilities(config, { mobileEnabled: false }));
  assert.throws(() =>
    verifyCapabilities(config, {
      mobileEnabled: true,
      appId: "com.gestadia.app",
      google: { webClientId: "other", iosClientId: "ios" },
      apple: { clientId: "app", serviceId: "service" },
      pushEnabled: true,
    }),
  );
  assert.doesNotThrow(() =>
    verifyCapabilities(config, {
      mobileEnabled: true,
      appId: "com.gestadia.app",
      google: { webClientId: "web", iosClientId: "ios" },
      apple: { clientId: "app", serviceId: "service" },
      pushEnabled: true,
    }),
  );
});
