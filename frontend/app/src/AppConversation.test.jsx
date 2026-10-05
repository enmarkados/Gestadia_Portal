import React from "react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProvider } from "./AppContext.jsx";
import AppConversation from "./AppConversation.jsx";
import { setToken } from "./api.js";
const id = "11111111-1111-4111-8111-111111111111";
let calls, failSend, closed, actionBody;
const timeline = () => ({
  conversation_id: "local-1",
  items: [
    {
      message_id: "m1",
      sequence: "1",
      occurred_at: "2026-10-05T10:15:00.000Z",
      role: "assistant",
      text: "Selecciona una opción",
      presentation: {
        presentation_id: "p1",
        presentation_revision: "2",
        kind: "single_choice",
        title: "Permiso",
        description: null,
        expires_at: "2099-01-01T00:00:00.000Z",
        actions: [
          {
            action_id: "yes",
            label: "Sí",
            enabled: true,
            disabled_reason: null,
            expires_at: "2099-01-01T00:00:00.000Z",
          },
        ],
      },
    },
  ],
  next_cursor: "tail-1",
  has_more: false,
  conversation_status: closed ? "closed" : "active",
  support: { status: "none", operator_display_name: null },
  turn_statuses: [],
  sondeo: null,
  state_revision: "1",
  permissions: ["history", "sondeo", "support_handoff"],
  pending_operations: [],
});
beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  window.GESTADIA_APP_CONFIG = {
    demoOnly: false,
    demoEnabled: false,
    conversationsEnabled: true,
  };
  setToken("ga_test");
  calls = [];
  failSend = false;
  closed = false;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, opts = {}) => {
      calls.push({ url, opts });
      let data;
      if (url === "/api/me")
        data = {
          id,
          nombre: "Local",
          apellidos: "Test",
          email: "local@example.test",
        };
      else if (url === "/api/expedientes" || url === "/api/notificaciones")
        data = [];
      else if (url === "/api/app/v1/conversations")
        data = {
          conversations: [
            {
              id: "local-1",
              purpose: "sondeo",
              case_ref: null,
              ready: true,
              status: "active",
            },
          ],
        };
      else if (url.includes("/timeline")) data = timeline();
      else if (url.endsWith("/turns")) {
        if (failSend) throw new TypeError("lost");
        actionBody = JSON.parse(opts.body);
        data = {
          id: "op1",
          status: "admitted",
          receipt: { turn_id: actionBody.turn_id, status: "accepted" },
        };
      } else throw new Error(`Unexpected ${url}`);
      return { ok: true, status: 200, json: async () => data };
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function mount() {
  return render(
    <MemoryRouter>
      <AppProvider>
        <AppConversation purpose="sondeo" />
      </AppProvider>
    </MemoryRouter>,
  );
}
it("muestra mensajes/presentaciones del timeline y envía la revisión exacta de la acción", async () => {
  mount();
  await screen.findByText("Selecciona una opción");
  fireEvent.click(screen.getByRole("button", { name: "Sí", exact: true }));
  await waitFor(() =>
    expect(actionBody).toMatchObject({
      kind: "action",
      presentation_id: "p1",
      presentation_revision: "2",
      action_id: "yes",
    }),
  );
  expect(actionBody).not.toHaveProperty("targetUserId");
  expect(screen.queryByText("Juan Carlos Acero")).toBeNull();
});
it("timeout deja recuperar el mismo turno sin reenviar al recargar ni al hacer polling", async () => {
  failSend = true;
  mount();
  await screen.findByText("Selecciona una opción");
  fireEvent.change(screen.getByLabelText("Tu consulta"), {
    target: { value: "Consulta sin confirmar" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Enviar consulta" }));
  await screen.findByText(/sin confirmación/i);
  expect(calls.filter((c) => c.url.endsWith("/turns"))).toHaveLength(1);
  const sent = JSON.parse(
    calls.find((c) => c.url.endsWith("/turns")).opts.body,
  );
  cleanup();
  mount();
  await screen.findByText(/sin confirmación/i);
  expect(calls.filter((c) => c.url.endsWith("/turns"))).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Recuperar envío" }));
  await waitFor(() =>
    expect(calls.filter((c) => c.url.endsWith("/turns"))).toHaveLength(2),
  );
  expect(
    JSON.parse(calls.filter((c) => c.url.endsWith("/turns"))[1].opts.body)
      .turn_id,
  ).toBe(sent.turn_id);
});
it("conversación cerrada mantiene historia y bloquea texto/acciones nuevas", async () => {
  closed = true;
  mount();
  await screen.findByText("Selecciona una opción");
  expect(screen.getByText(/conversación está cerrada/i)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Enviar consulta" })).toBeNull();
  expect(
    screen.getByRole("button", { name: "Sí", exact: true }),
  ).toBeDisabled();
});
it("la pérdida de autorización oculta el historial ya cargado", async () => {
  mount();
  await screen.findByText("Selecciona una opción");
  const original = global.fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, opts) =>
      url.includes("/timeline")
        ? {
            ok: false,
            status: 403,
            json: async () => ({ code: "capability_denied" }),
          }
        : original(url, opts),
    ),
  );
  await screen.findByText(/permisos actuales/i, {}, { timeout: 4500 });
  expect(screen.queryByText("Selecciona una opción")).toBeNull();
});
it("handoff perdido se recupera con la misma key, sin reenviar la solicitud al recargar", async () => {
  const original = global.fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, opts) => {
      if (url.endsWith("/handoff")) {
        calls.push({ url, opts });
        throw new TypeError("lost");
      }
      return original(url, opts);
    }),
  );
  mount();
  await screen.findByText("Selecciona una opción");
  fireEvent.click(screen.getByRole("button", { name: "Solicitar soporte" }));
  await screen.findByText(/sin confirmación/i);
  const key = calls
    .find((c) => c.url.endsWith("/handoff"))
    .opts.headers.get("Idempotency-Key");
  cleanup();
  mount();
  await screen.findByText(/sin confirmación/i);
  expect(calls.filter((c) => c.url.endsWith("/handoff"))).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Recuperar envío" }));
  await waitFor(() =>
    expect(calls.filter((c) => c.url.endsWith("/handoff"))).toHaveLength(2),
  );
  expect(
    calls
      .filter((c) => c.url.endsWith("/handoff"))[1]
      .opts.headers.get("Idempotency-Key"),
  ).toBe(key);
});

it("rechazo conocido de handoff libera el envío pendiente y permite escribir de nuevo", async () => {
  const original = global.fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, opts) =>
      url.endsWith("/handoff")
        ? {
            ok: true,
            status: 200,
            json: async () => ({
              id: "op-rejected",
              status: "failed",
              error_code: "routing_unavailable",
            }),
          }
        : original(url, opts),
    ),
  );
  mount();
  await screen.findByText("Selecciona una opción");
  fireEvent.click(screen.getByRole("button", { name: "Solicitar soporte" }));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Enviar consulta" }),
    ).toBeInTheDocument(),
  );
  expect(screen.queryByRole("button", { name: "Recuperar envío" })).toBeNull();
  expect(
    sessionStorage.getItem(`gestadia_app_conversation_v1:${id}:local-1`),
  ).toBeNull();
});
it("un retry rechazado libera el pendiente sin cambiar la identidad del turno original", async () => {
  failSend = true;
  mount();
  await screen.findByText("Selecciona una opción");
  fireEvent.change(screen.getByLabelText("Tu consulta"), {
    target: { value: "Consulta" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Enviar consulta" }));
  await screen.findByText(/sin confirmación/i);
  const original = global.fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, opts) =>
      url.endsWith("/turns")
        ? {
            ok: true,
            status: 200,
            json: async () => ({
              id: "rejected",
              status: "failed",
              error_code: "stale_presentation",
            }),
          }
        : original(url, opts),
    ),
  );
  fireEvent.click(screen.getByRole("button", { name: "Recuperar envío" }));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Enviar consulta" }),
    ).toBeInTheDocument(),
  );
  expect(screen.queryByRole("button", { name: "Recuperar envío" })).toBeNull();
});
