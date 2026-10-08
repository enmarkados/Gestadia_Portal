import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { getToken, request } from "./api.js";
import { nativeSession } from "./sessionStorage.js";
let returned = null;
export const takeSocialResult = () => {
  const value = returned;
  returned = null;
  return value;
};
const pendingKey = "gestadia.social-attempt";
export function createSocialClient({
  config,
  platform,
  request,
  plugin,
  browser,
  secure,
  current,
  discard,
}) {
  let pending = null,
    busy = false;
  const check = (owner) => {
    if (current() !== owner)
      throw Error("El acceso se ha cancelado al cambiar de sesión.");
  };
  const post = (path, data, auth = false) =>
    request(`/api/auth/social/${path}`, {
      auth,
      method: "POST",
      body: JSON.stringify(data),
    });
  async function finish(result, owner) {
    if (current() !== owner) {
      if (result.token) await discard(result.token);
      check(owner);
    }
    return result;
  }
  return {
    async cancel() {
      pending = null;
      if (secure) await secure.remove(pendingKey, false);
    },
    async start(provider, purpose = "login") {
      if (
        config().demoOnly ||
        !["ios", "android"].includes(platform()) ||
        !config().social?.[provider] ||
        busy
      )
        throw Error("Acceso social no disponible.");
      busy = true;
      const owner = current();
      try {
        const attempt = await post(
          "attempts",
          { provider, platform: platform(), purpose },
          purpose === "link",
        );
        check(owner);
        pending = { ...attempt, owner, purpose };
        if (provider === "apple" && platform() === "android") {
          const url = new URL(attempt.authorizationUrl);
          if (
            url.origin !== "https://appleid.apple.com" ||
            url.pathname !== "/auth/authorize"
          )
            throw Error("Autorización Apple no válida.");
          await secure.set(pendingKey, pending, false, false, 1);
          await browser.open({ url: url.href });
          return { status: "browser_open" };
        }
        const google = config().social.google;
        await plugin.initialize(
          provider === "google"
            ? {
                google: {
                  iOSClientId: google.iosClientId,
                  iOSServerClientId: google.webClientId,
                  webClientId: google.webClientId,
                  mode: "online",
                },
              }
            : {
                apple: {
                  clientId: config().social.apple.clientId,
                  redirectUrl: "",
                  useProperTokenExchange: true,
                },
              },
        );
        const reply = await plugin.login({
          provider,
          options:
            provider === "google"
              ? {
                  nonce: attempt.nonce,
                  forcePrompt: true,
                  scopes: ["openid", "email", "profile"],
                }
              : { nonce: attempt.nonce, scopes: ["email", "name"] },
        });
        check(owner);
        if (!reply.result?.idToken)
          throw Error("El proveedor no devolvió una identidad válida.");
        const result = await post(
          "complete",
          {
            attemptId: attempt.id,
            proof: attempt.proof,
            idToken: reply.result.idToken,
            authorizationCode: reply.result.authorizationCode,
          },
          purpose === "link",
        );
        return finish(result, owner);
      } finally {
        busy = false;
      }
    },
    async resume(url) {
      const parsed = new URL(url);
      if (
        parsed.protocol !== "gestadia:" ||
        parsed.hostname !== "auth" ||
        parsed.pathname !== "/apple" ||
        parsed.hash ||
        parsed.searchParams.getAll("code").length !== 1
      )
        throw Error("Retorno Apple no válido.");
      const saved = pending || (await secure.get(pendingKey, false, false));
      if (
        !saved ||
        saved.id !== parsed.searchParams.get("attempt") ||
        !parsed.searchParams.get("code")
      )
        throw Error("Retorno sin intento válido.");
      check(saved.owner);
      pending = saved;
      await secure.remove(pendingKey, false);
      const result = await post(
        "complete",
        {
          attemptId: saved.id,
          proof: saved.proof,
          code: parsed.searchParams.get("code"),
        },
        saved.purpose === "link",
      );
      return finish(result, saved.owner);
    },
    async confirm(action) {
      if (!pending) throw Error("Inicia de nuevo el acceso social.");
      check(pending.owner);
      return finish(
        await post(
          "account",
          {
            attemptId: pending.id,
            proof: pending.proof,
            action,
            confirm: true,
          },
          action === "link",
        ),
        pending.owner,
      );
    },
  };
}
export const socialClient = createSocialClient({
  config: () => globalThis.GESTADIA_APP_CONFIG || {},
  platform: () => Capacitor.getPlatform(),
  request,
  plugin: SocialLogin,
  browser: Browser,
  secure: SecureStorage,
  current: getToken,
  discard: (token) => nativeSession.discard(token),
});
export async function setupSocialReturn() {
  if (!Capacitor.isNativePlatform() || globalThis.GESTADIA_APP_CONFIG?.demoOnly)
    return;
  async function handle(url) {
    if (!url?.startsWith("gestadia://auth/apple")) return;
    try {
      const result = await socialClient.resume(url);
      returned = { result };
      if (!getToken()) window.location.hash = "#/acceso";
      window.dispatchEvent(
        new CustomEvent("gestadia-social-result", { detail: returned }),
      );
      await Browser.close().catch(() => {});
    } catch {
      returned = {
        error: "No se pudo completar el acceso Apple. Inténtalo de nuevo.",
      };
      window.dispatchEvent(
        new CustomEvent("gestadia-social-result", { detail: returned }),
      );
    }
  }
  await App.addListener("appUrlOpen", ({ url }) => handle(url));
  const launch = await App.getLaunchUrl();
  if (launch?.url) setTimeout(() => handle(launch.url), 0);
}
