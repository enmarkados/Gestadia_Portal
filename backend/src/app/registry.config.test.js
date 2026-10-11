import { test } from "node:test";
import assert from "node:assert/strict";
import * as configModule from "../config.js";
const { appConversationConfig } = configModule;

const secret = Buffer.alloc(32, 7).toString("base64");
function env() {
  const e = { APP_CONVERSATIONS_ENABLED: "true", APP_LIDIA_INTEGRATION_ID: "old", APP_LIDIA_AUDIENCE: "old-audience", APP_LIDIA_BASE_URL: "https://lidia.example.test", APP_LIDIA_GENERAL_SUPPORT: "true", APP_LIDIA_GENERAL_COMMERCIAL: "true", APP_LIDIA_SONDEO_ENABLED: "true", APP_LIDIA_SONDEO_INTEGRATION_ID: "native", APP_LIDIA_SONDEO_AUDIENCE: "native-audience" };
  for (const role of ["SESSION", "READ", "TURN", "CONTEXT", "REVOCATION"]) {
    e[`APP_LIDIA_${role}_KEY_ID`] = `old_${role}`;
    e[`APP_LIDIA_${role}_SECRET_BASE64`] = secret;
    e[`APP_LIDIA_SONDEO_${role}_KEY_ID`] = `native_${role}`;
  }
  return e;
}
test("opt-in sondeo resuelve otra audiencia con IDs propios y autoridad limitada", () => {
  const c = appConversationConfig(env());
  assert.equal(c.nativeSondeo?.createNew, true);
  assert.equal(c.nativeSondeo.integrationId, "native");
  assert.equal(c.nativeSondeo.audience, "native-audience");
  assert.equal(c.integrationId, "old");
  assert.deepEqual(c.nativeSondeo.allowedPermissions, ["sondeo", "history"]);
  assert.equal(c.nativeSondeo.generalSupport, false);
  assert.equal(c.nativeSondeo.generalCommercial, false);
  assert.equal(c.nativeSondeo.keys.timeline.keyId, "native_READ");
  assert.equal(c.nativeSondeo.keys.timeline.secretBase64, secret);
  assert.equal(c.keys.timeline.keyId, "old_READ");
  assert.equal(c.nativeSondeo.keys.handoff, undefined);
});
test("apagar creación conserva perfil configurado para recuperar y retirar historial", () => {
  const e = env(); e.APP_LIDIA_SONDEO_ENABLED = "false";
  const c = appConversationConfig(e);
  assert.equal(c.nativeSondeo?.createNew, false);
  assert.equal(c.nativeSondeo.enabled, true);
  assert.equal(c.nativeSondeo.integrationId, "native");
});

test("los dos ámbitos permiten firmas distintas sin repetir IDs de clave", () => {
  const c = appConversationConfig(env());
  assert.deepEqual(configModule.appConversationIntegrations?.(c)?.map(x => x.integrationId), ["old", "native"]);
});
test("perfil activado incompleto y colisiones fallan antes de HTTP", () => {
  for (const change of [
    e => delete e.APP_LIDIA_SONDEO_INTEGRATION_ID,
    e => delete e.APP_LIDIA_SONDEO_AUDIENCE,
    e => delete e.APP_LIDIA_SONDEO_READ_KEY_ID,
    e => e.APP_LIDIA_SONDEO_INTEGRATION_ID = "old",
    e => e.APP_LIDIA_SONDEO_AUDIENCE = "old-audience",
    e => e.APP_LIDIA_SONDEO_READ_KEY_ID = "old_READ",
    e => e.APP_LIDIA_SONDEO_READ_KEY_ID = "native_SESSION",
    e => e.APP_LIDIA_SONDEO_TURN_SECRET_BASE64 = "invalid",
  ]) {
    const e = env(); change(e);
    assert.throws(() => configModule.appConversationIntegrations(appConversationConfig(e)), error => error.code === "runtime_unavailable");
  }
});
test("defaults no registran otro ámbito y el interruptor global no activa nada", () => {
  assert.deepEqual(configModule.appConversationIntegrations?.(appConversationConfig({}))?.map(x => x.integrationId), [""]);
  const e = env(); e.APP_CONVERSATIONS_ENABLED = "false";
  assert.deepEqual(configModule.appConversationIntegrations?.(appConversationConfig(e))?.map(x => x.enabled), [false]);
});
