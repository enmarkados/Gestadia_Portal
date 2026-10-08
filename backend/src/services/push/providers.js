import http2 from "node:http2";
import { readFile } from "node:fs/promises";
import { importPKCS8, SignJWT } from "jose";
import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { mobileConfig } from "../../mobile-config.js";
const title = "Gestadia",
  body = "Tienes una nueva actualización. Abre la app para consultarla.";
let firebase;
async function fcm({ token, payload }) {
  if (!firebase) {
    const credentials = JSON.parse(
      await readFile(mobileConfig.push.firebaseCredentialFile, "utf8"),
    );
    firebase = initializeApp(
      { credential: cert(credentials) },
      "gestadia-mobile",
    );
  }
  try {
    await getMessaging(firebase).send({
      token,
      notification: { title, body },
      data: payload,
      android: {
        notification: {
          channelId: "gestadia_updates",
          icon: "ic_stat_gestadia",
        },
        ttl: 86400000,
      },
    });
    return { accepted: true };
  } catch (error) {
    const invalid = [
      "messaging/registration-token-not-registered",
      "messaging/invalid-registration-token",
    ].includes(error.code);
    return {
      accepted: false,
      invalidToken: invalid,
      permanent: error.code === "messaging/mismatched-credential",
      reason: invalid ? "invalid_token" : "fcm_error",
    };
  }
}
async function apns({ token, payload, environment }) {
  const c = mobileConfig.push;
  if (!c.apnsKeyId || !c.apnsTeamId || !c.apnsKeyFile)
    throw new Error("APNs no configurado");
  const key = await importPKCS8(await readFile(c.apnsKeyFile, "utf8"), "ES256");
  const auth = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: c.apnsKeyId })
    .setIssuer(c.apnsTeamId)
    .setIssuedAt()
    .sign(key);
  return new Promise((resolve, reject) => {
    const client = http2.connect(
      environment === "production"
        ? "https://api.push.apple.com"
        : "https://api.sandbox.push.apple.com",
    );
    let done = false;
    const finish = (error, result) => {
      if (done) return;
      done = true;
      client.destroy();
      error ? reject(error) : resolve(result);
    };
    client.on("error", (e) => finish(e));
    client.setTimeout(10000, () => finish(new Error("APNs timeout")));
    const req = client.request({
      ":method": "POST",
      ":path": `/3/device/${token}`,
      authorization: `bearer ${auth}`,
      "apns-topic": "com.gestadia.app",
      "apns-push-type": "alert",
      "apns-priority": "10",
      "apns-collapse-id": payload.notificationId,
    });
    let status = 0,
      raw = "";
    req.on("response", (headers) => {
      status = Number(headers[":status"]);
    });
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      if (raw.length < 4096) raw += chunk;
    });
    req.on("error", (e) => finish(e));
    req.on("end", () => {
      let reason;
      try {
        reason = JSON.parse(raw).reason;
      } catch {}
      const invalid = [
        "BadDeviceToken",
        "Unregistered",
        "DeviceTokenNotForTopic",
      ].includes(reason);
      finish(null, {
        accepted: status === 200,
        invalidToken: invalid,
        permanent: status === 400 && !invalid,
        reason: invalid
          ? "invalid_token"
          : status === 429
            ? "rate_limited"
            : "apns_error",
      });
    });
    req.end(
      JSON.stringify({
        aps: { alert: { title, body }, sound: "default" },
        ...payload,
      }),
    );
  });
}
export const sendPush = (input) =>
  input.transport === "apns" ? apns(input) : fcm(input);
