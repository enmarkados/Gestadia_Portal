import test from "node:test";
import assert from "node:assert/strict";
import { readMobileConfig, validateMobileConfig } from "./mobile-config.js";
test("features apagadas no requieren credenciales; activadas rechazan secreto JWT débil y cifrado ausente", () => {
  assert.deepEqual(validateMobileConfig(readMobileConfig({}), {}), []);
  const errors = validateMobileConfig(
    readMobileConfig({ MOBILE_FEATURES_ENABLED: "true" }),
    {},
  );
  assert.ok(errors.includes("JWT_SECRET"));
  assert.ok(errors.includes("MOBILE_ENCRYPTION_KEY"));
});
