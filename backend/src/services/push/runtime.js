import { db } from "../../db.js";
import { mobileConfig } from "../../mobile-config.js";
import { createPushService } from "../push.js";
import { sealCredential, openCredential } from "../mobile-crypto.js";
import { sendPush } from "./providers.js";
export const pushService = createPushService({
  db,
  enabled: mobileConfig.enabled && mobileConfig.push.enabled,
  environment: mobileConfig.push.apnsEnvironment,
  seal: sealCredential,
  open: openCredential,
  send: sendPush,
});
