import { test } from "node:test";
import assert from "node:assert/strict";
test("config v2 separada, explícita y deshabilitada por defecto", async () => {
  const { appV2ConversationConfig, appConversationConfig } = await import(
    "../../config.js"
  );
  assert.equal(typeof appV2ConversationConfig, "function");
  const original = {
    APP_CONVERSATIONS_ENABLED: "true",
    APP_LIDIA_BASE_URL: "https://v1.test",
    APP_LIDIA_TURN_KEY_ID: "v1-key",
    APP_LIDIA_TURN_SECRET_BASE64: "v1-secret",
  };
  const v2 = appV2ConversationConfig(original);
  assert.equal(v2.enabled, false);
  assert.equal(v2.guestEnabled, false);
  assert.equal(v2.baseUrl, "");
  assert.equal(v2.keys["app.turns.write"].keyId, "");
  assert.equal(appConversationConfig(original).keys.turn.keyId, "v1-key");
  const cfg = appV2ConversationConfig({
    APP_V2_ENABLED: "true",
    APP_V2_GUEST_ENABLED: "true",
    APP_V2_LIDIA_BASE_URL: "https://v2.test",
    APP_V2_LIDIA_TURN_KEY_ID: "v2-key",
  });
  assert.equal(cfg.enabled, true);
  assert.equal(cfg.guestEnabled, true);
  assert.equal(cfg.keys["app.turns.write"].keyId, "v2-key");
});
test("r3 no publica capabilities de contacto desde variables reservadas", async () => {
  const { appV2ConversationConfig } = await import("../../config.js");
  const cfg = appV2ConversationConfig({
    APP_V2_ENABLED: "true",
    APP_V2_LIDIA_CONTACT_WRITE_KEY_ID: "reserved-write",
    APP_V2_LIDIA_CONTACT_READ_KEY_ID: "reserved-read",
    APP_V2_LIDIA_CONTACT_ACK_KEY_ID: "reserved-ack",
  });
  for (const cap of [
    "app.contact_requests.write",
    "app.contact_requests.read",
    "app.contact_requests.ack",
  ])
    assert.equal(cfg.keys[cap], undefined);
});
