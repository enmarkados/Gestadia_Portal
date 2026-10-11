import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { App } from "@capacitor/app";
import { getToken, request } from "./api.js";
export function createPushClient({
  push,
  secure,
  request,
  navigate,
  platform,
  current,
  onStatus,
  onNotification = () => {},
}) {
  const owner = current();
  let active = true,
    enabled = false,
    id = null;
  const handles = [];
  const valid = () => active && owner && current() === owner;
  async function installation() {
    if (!id) {
      id = await secure.get("gestadia.installation", false, false);
      if (!id) {
        id = crypto.randomUUID();
        await secure.set("gestadia.installation", id, false, false, 1);
      }
    }
    return id;
  }
  const revoke = async () => {
    if (!id) return;
    await request(`/api/push/devices/${encodeURIComponent(id)}`, {
      method: "DELETE",
      auth: false,
      headers: { Authorization: `Bearer ${owner}` },
    });
  };
  async function permission(prompt = false) {
    let status = await push.checkPermissions();
    if (prompt && ["prompt", "prompt-with-rationale"].includes(status.receive))
      status = await push.requestPermissions();
    if (!valid()) return;
    onStatus(
      status.receive === "granted"
        ? enabled
          ? "Activadas"
          : "Permiso concedido; activa los avisos"
        : "Permiso no concedido. Puedes cambiarlo en los ajustes del sistema.",
    );
    return status.receive;
  }
  async function listen(name, callback) {
    const handle = await push.addListener(name, callback);
    if (!active) await handle.remove();
    else handles.push(handle);
  }
  async function register() {
    if (platform() === "android") {
      await push.createChannel({
        id: "gestadia_updates",
        name: "Actualizaciones de Gestadia",
        description: "Avisos sobre tu cuenta y tus trámites. El detalle se consulta en la app.",
        importance: 3,
        visibility: 0,
      });
    }
    if (valid() && enabled) await push.register();
  }
  const service = {
    async attach() {
      enabled =
        (await secure.get("gestadia.push-enabled", false, false)) === true;
      await listen("registration", async ({ value }) => {
        if (!valid() || !enabled) return;
        try {
          const installationId = await installation();
          if (!valid() || !enabled) return;
          await request("/api/push/devices", {
            method: "POST",
            body: JSON.stringify({
              installationId,
              token: value,
              transport: platform() === "ios" ? "apns" : "fcm",
            }),
          });
          if (!valid() || !enabled) await revoke();
          else onStatus("Activadas");
        } catch {
          if (valid())
            onStatus("Inscripción pendiente. Reintenta con conexión.");
        }
      });
      await listen("registrationError", () => {
        if (valid())
          onStatus(
            "No se pudo registrar este dispositivo. Reintenta con conexión.",
          );
      });
      await listen("pushNotificationReceived", () => {
        if (valid()) onNotification();
      });
      await listen(
        "pushNotificationActionPerformed",
        async ({ notification }) => {
          const notificationId = notification?.data?.notificationId;
          if (
            !valid() ||
            typeof notificationId !== "string" ||
            notificationId.length > 100
          )
            return;
          try {
            const n = await request(
              `/api/notificaciones/${encodeURIComponent(notificationId)}`,
            );
            if (!valid()) return;
            onNotification();
            navigate(
              n.expedienteId
                ? `/tramites/${encodeURIComponent(n.expedienteId)}`
                : "/cuenta",
            );
          } catch {
            if (valid())
              onStatus("Este aviso no está disponible para tu sesión actual.");
          }
        },
      );
      await service.resume();
    },
    async enable() {
      if (!valid()) return;
      const status = await permission(true);
      if (status !== "granted") return;
      enabled = true;
      await secure.set("gestadia.push-enabled", true, false, false, 1);
      if (valid()) await register();
    },
    async disable() {
      enabled = false;
      await secure.set("gestadia.push-enabled", false, false, false, 1);
      await installation();
      await revoke();
      if (valid()) onStatus("Desactivadas en este dispositivo");
    },
    async resume() {
      if (!valid()) return;
      const status = await permission();
      if (enabled && status === "granted" && valid()) await register();
      else if (status !== "granted" && enabled) {
        await installation();
        await revoke();
      }
    },
    async dispose() {
      active = false;
      for (const handle of handles) await handle.remove();
    },
  };
  return service;
}
export const pushAvailable = () =>
  Capacitor.isNativePlatform() &&
  globalThis.GESTADIA_APP_CONFIG?.push?.enabled === true;
let currentClient = null;
export async function connectPush(onStatus, onNotification) {
  const svc = createPushClient({
    push: PushNotifications,
    secure: SecureStorage,
    request,
    navigate: (path) => {
      window.location.hash = `#${path}`;
    },
    platform: () => Capacitor.getPlatform(),
    current: getToken,
    onStatus,
    onNotification,
  });
  currentClient = svc;
  const resume = await App.addListener("appStateChange", ({ isActive }) => {
    if (isActive)
      svc.resume().catch(() => onStatus("No se pudo comprobar el permiso."));
  });
  await svc.attach();
  return async () => {
    if (currentClient === svc) currentClient = null;
    await resume.remove();
    await svc.dispose();
  };
}
export const enablePush = () => currentClient?.enable();
export const disablePush = () => currentClient?.disable();
