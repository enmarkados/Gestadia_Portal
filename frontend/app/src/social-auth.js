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
    busy = false,
    generation = 0;
  const check = (owner, version) => {
    if (current() !== owner || version !== generation)
      throw Error("El acceso se ha cancelado al cambiar de sesión.");
  };
  const post = (path, data, auth = false) =>
    request(`/api/auth/social/${path}`, {
      auth,
      method: "POST",
      body: JSON.stringify(data),
    });
  async function finish(result, owner, version) {
    if (current() !== owner || version !== generation) {
      if (result.token) await discard(result.token);
      check(owner, version);
    }
    return result;
  }
  return {
    async cancel() {
      generation++;
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
      const owner = current(),
        version = ++generation;
      try {
        const attempt = await post(
          "attempts",
          { provider, platform: platform(), purpose },
          purpose === "link",
        );
        check(owner, version);
        pending = { ...attempt, owner, purpose };
        if (provider === "apple" && platform() === "android") {
          const url = new URL(attempt.authorizationUrl);
          if (
            url.origin !== "https://appleid.apple.com" ||
            url.pathname !== "/auth/authorize"
          )
            throw Error("Autorización Apple no válida.");
          await secure.set(pendingKey, pending, false, false, 1);
          check(owner, version);
          await browser.open({ url: url.href });
          check(owner, version);
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
        check(owner, version);
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
        check(owner, version);
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
        return finish(result, owner, version);
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
      const version = generation;
      const saved = pending || (await secure.get(pendingKey, false, false));
      if (
        !saved ||
        saved.id !== parsed.searchParams.get("attempt") ||
        !parsed.searchParams.get("code")
      )
        throw Error("Retorno sin intento válido.");
      check(saved.owner, version);
      pending = saved;
      await secure.remove(pendingKey, false);
      check(saved.owner, version);
      const result = await post(
        "complete",
        {
          attemptId: saved.id,
          proof: saved.proof,
          code: parsed.searchParams.get("code"),
        },
        saved.purpose === "link",
      );
      return finish(result, saved.owner, version);
    },
    async confirm(action) {
      if (!pending) throw Error("Inicia de nuevo el acceso social.");
      const saved = pending,
        version = generation;
      check(saved.owner, version);
      return finish(
        await post(
          "account",
          {
            attemptId: saved.id,
            proof: saved.proof,
            action,
            confirm: true,
          },
          action === "link",
        ),
        saved.owner,
        version,
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
