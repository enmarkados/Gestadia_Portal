import { it, expect, vi } from "vitest";
import { createPushClient } from "./push.js";
function fixture(devicePlatform = "ios") {
  const listeners = {};
  const push = {
    checkPermissions: vi.fn(async () => ({ receive: "denied" })),
    requestPermissions: vi.fn(async () => ({ receive: "denied" })),
    createChannel: vi.fn(async () => {}),
    register: vi.fn(),
    addListener: vi.fn(async (n, cb) => {
      listeners[n] = cb;
      return { remove: vi.fn() };
    }),
  };
  const request = vi.fn(async () => {
    throw Error("not owned");
  });
  const secure = { get: vi.fn(), set: vi.fn() };
  const navigate = vi.fn();
  return {
    listeners,
    push,
    request,
    secure,
    navigate,
    svc: createPushClient({
      push,
      secure,
      request,
      navigate,
      platform: () => devicePlatform,
      current: () => "owner",
      onStatus: vi.fn(),
    }),
  };
}
it("permiso rechazado no registra dispositivo; callback posterior a dispose no conecta", async () => {
  const f = fixture();
  await f.svc.attach();
  await f.svc.enable();
  expect(f.push.register).not.toHaveBeenCalled();
  expect(f.request).not.toHaveBeenCalled();
  await f.svc.dispose();
  await f.listeners.registration({ value: "a".repeat(64) });
  expect(f.request).not.toHaveBeenCalled();
});
it("tap requiere aviso autorizado antes de navegar", async () => {
  const f = fixture();
  await f.svc.attach();
  await f.listeners.pushNotificationActionPerformed({
    notification: { data: { notificationId: "foreign" } },
  });
  expect(f.navigate).not.toHaveBeenCalled();
});

it("Android crea el canal usado por FCM antes de registrar, también al reabrir", async () => {
  const f = fixture("android");
  f.push.checkPermissions.mockResolvedValue({ receive: "granted" });
  f.secure.get.mockResolvedValue(true);
  await f.svc.attach();
  expect(f.push.createChannel).toHaveBeenCalledWith(expect.objectContaining({ id: "gestadia_updates", name: "Actualizaciones de Gestadia", importance: 3 }));
  expect(f.push.createChannel.mock.invocationCallOrder[0]).toBeLessThan(f.push.register.mock.invocationCallOrder[0]);
  f.push.createChannel.mockClear();
  f.push.register.mockClear();
  await f.svc.enable();
  expect(f.push.createChannel).toHaveBeenCalledTimes(1);
  expect(f.push.register).toHaveBeenCalledTimes(1);
});
it("iOS registra sin invocar canales exclusivos de Android", async () => {
  const f = fixture();
  f.push.checkPermissions.mockResolvedValue({ receive: "granted" });
  await f.svc.attach();
  await f.svc.enable();
  expect(f.push.createChannel).not.toHaveBeenCalled();
  expect(f.push.register).toHaveBeenCalledTimes(1);
});
