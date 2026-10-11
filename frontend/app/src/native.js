import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { SplashScreen } from "@capacitor/splash-screen";
import { Keyboard } from "@capacitor/keyboard";

export const isNative = () => Capacitor.isNativePlatform();
export const nativeOrigin = () =>
  isNative()
    ? Capacitor.getPlatform() === "ios"
      ? "capacitor://localhost"
      : "https://localhost"
    : null;

export async function setupNativeKeyboard() {
  if (!isNative() || Capacitor.getPlatform() !== "ios") return;
  // iOS supplies the target frame before its animation. A second native resize
  // after keyboardDidShow would make the footer jump at the end.
  await Keyboard.setResizeMode({ mode: "none" });
  await Keyboard.setScroll({ isDisabled: true });
  const update = ({ detail }) => {
    if (!Number.isFinite(detail?.viewportHeight) || detail.viewportHeight <= 0) return;
    const shell = document.querySelector(".app-shell");
    if (!shell) return;
    const height = `${detail.viewportHeight}px`;
    if (shell.style.height === height) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const duration = Number.isFinite(detail.duration) ? Math.max(0, detail.duration) * 1000 : 0;
    const easing = ["ease-in-out", "ease-in", "ease-out", "linear"][detail.curve] || "ease-in-out";
    shell.style.transition = reduced || !duration ? "none" : `height ${duration}ms ${easing}`;
    shell.style.height = height;
  };
  window.addEventListener("gestadiaKeyboardFrame", update);
  return () => {
    window.removeEventListener("gestadiaKeyboardFrame", update);
    const shell = document.querySelector(".app-shell");
    shell?.style.removeProperty("height");
    shell?.style.removeProperty("transition");
  };
}

export async function loadNativeConfig() {
  if (!isNative()) return;
  // La release empaquetada conserva el origen y los clientes revisados al firmar.
  if (globalThis.GESTADIA_APP_CONFIG?.appId === "com.gestadia.app") return;
  const base = new URL(
    import.meta.env.VITE_GESTADIA_SERVER_URL || "https://app.gestadia.com",
  );
  if (
    base.protocol !== "https:" &&
    !["127.0.0.1", "localhost", "10.0.2.2"].includes(base.hostname)
  ) {
    throw new Error("La conexión de la app debe usar HTTPS.");
  }
  const origin = base.origin;
  const local = globalThis.GESTADIA_APP_CONFIG || {};
  // El frontend permanece empaquetado; únicamente se descarga configuración pública.
  let remote = null;
  try {
    const response = await CapacitorHttp.get({
      url: `${origin}/app-config.json`,
      connectTimeout: 5000,
      readTimeout: 5000,
      responseType: "json",
    });
    if (response.status !== 200 || !response.data?.pluginWeb)
      throw new Error("Configuración no disponible");
    remote = response.data;
  } catch {
    // Conserva el origen configurado; las peticiones mostrarán el fallo de conexión.
  }
  globalThis.GESTADIA_APP_CONFIG = {
    ...local,
    ...(remote || {}),
    apiBaseUrl: origin,
    pluginWeb: {
      baseUrl: `${origin}/lidia`,
      key: remote?.pluginWeb?.key || "",
    },
  };
}

export async function openExternal(url) {
  if (isNative()) await Browser.open({ url });
  else window.open(url, "_blank", "noopener,noreferrer");
}

export function setupNativeNavigation() {
  if (!isNative()) return;
  const backListener = App.addListener("backButton", () => {
    const dialog = document.querySelector("dialog[open]");
    if (dialog) {
      if (dialog.dispatchEvent(new Event("cancel", { cancelable: true })))
        dialog.close();
      return;
    }
    const back = document.querySelector("[data-app-back]");
    if (back) {
      back.click();
      return;
    }
    if (window.location.hash && window.location.hash !== "#/") {
      if (window.history.state?.idx > 0) window.history.back();
      else window.location.hash = "#/";
    } else App.exitApp();
  });
  const handleClick = (event) => {
    if (event.defaultPrevented) return;
    const anchor = event.target.closest?.("a[href]");
    if (!anchor) return;
    const url = new URL(anchor.href);
    if (
      !/^https?:$/.test(url.protocol) ||
      url.origin === window.location.origin
    )
      return;
    event.preventDefault();
    openExternal(anchor.href).catch(() =>
      window.alert("No se pudo abrir el enlace."),
    );
  };
  document.addEventListener("click", handleClick);
  return () => {
    document.removeEventListener("click", handleClick);
    backListener.then((handle) => handle.remove());
  };
}
export async function finishSplash() {
  const logo = document.querySelector("#launch-splash img");
  if (logo?.decode) await logo.decode().catch(() => {});
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );
  document.getElementById("launch-splash")?.remove();
  if (isNative()) await SplashScreen.hide({ fadeOutDuration: 200 });
}
