import { it, expect, vi } from "vitest";
import { createPushClient } from "./push.js";
function fixture() {
  const listeners = {};
  const push = {
    checkPermissions: vi.fn(async () => ({ receive: "denied" })),
    requestPermissions: vi.fn(async () => ({ receive: "denied" })),
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
      platform: () => "ios",
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
