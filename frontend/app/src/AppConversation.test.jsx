import React from "react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AppProvider } from "./AppContext.jsx";
import AppConversation from "./AppConversation.jsx";
import { setToken } from "./api.js";
import serviceSamples from "../../../docs/integraciones/fixtures/app-v1-service-samples.json";
import finalServiceSamples from "../../../docs/integraciones/fixtures/app-v1-service-samples-v2.json";
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
function RouteProbe() { const location = useLocation(); return <output data-testid="route">{location.pathname + location.search}</output>; }
function mount(entry = "/") {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <RouteProbe />
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
it("volver a cargar tras restaurar permisos retira el aviso anterior", async () => {
  mount();
  await screen.findByText("Selecciona una opción");
  const original = global.fetch;
  let allowed = false;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, opts) =>
      url.includes("/timeline") && !allowed
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
  allowed = true;
  fireEvent.click(screen.getByRole("button", { name: "Volver a cargar" }));
  await screen.findByText("Selecciona una opción");
  expect(screen.queryByRole("alert")).toBeNull();
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

it("handoff completed y requested muestra solicitud pendiente, no operador atendiendo", async () => {
  let requested = false;
  const original = global.fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, opts) => {
      if (url.endsWith("/handoff")) {
        requested = true;
        return {
          ok: true,
          status: 202,
          json: async () => ({
            id: "handoff-op",
            status: "admitted",
            receipt: {
              status: "completed",
              result: { handoff_status: "requested" },
            },
          }),
        };
      }
      if (url.includes("/timeline")) {
        const body = timeline();
        if (requested)
          body.support = { status: "requested", operator_display_name: null };
        return { ok: true, status: 200, json: async () => body };
      }
      return original(url, opts);
    }),
  );
  mount();
  await screen.findByText("Selecciona una opción");
  fireEvent.click(screen.getByRole("button", { name: "Solicitar soporte" }));
  await screen.findByText(
    "Solicitud de atención recibida. Pendiente de asignación.",
  );
  expect(screen.queryByRole("button", { name: "Recuperar envío" })).toBeNull();
  expect(
    screen.getByRole("button", { name: "Enviar consulta" }),
  ).toBeInTheDocument();
  expect(screen.queryByText("Juan Carlos Acero")).toBeNull();
});
it("identity_link_required muestra vínculo pendiente y no deriva a otro destino", async () => {
  const original = global.fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, opts) => {
      if (url.includes("/timeline")) {
        const body = timeline();
        body.permissions = ["history", "sondeo", "commercial_handoff"];
        return { ok: true, status: 200, json: async () => body };
      }
      if (url.endsWith("/handoff")) {
        calls.push({ url, opts });
        return {
          ok: true,
          status: 202,
          json: async () => ({
            id: "handoff-op",
            status: "failed",
            error_code: "identity_link_required",
          }),
        };
      }
      return original(url, opts);
    }),
  );
  mount();
  await screen.findByText("Selecciona una opción");
  fireEvent.click(
    screen.getByRole("button", { name: "Hablar con un comercial" }),
  );
  await screen.findByText(/primero necesitamos vincular tu cuenta/i);
  expect(screen.queryByRole("button", { name: "Recuperar envío" })).toBeNull();
  expect(
    screen.getByRole("button", { name: "Enviar consulta" }),
  ).toBeInTheDocument();
  expect(
    calls
      .filter((c) => c.url.endsWith("/handoff"))
      .map((c) => JSON.parse(c.opts.body).target_kind),
  ).toEqual(["commercial"]);
});

it("renderiza muestra LidIA y conserva identidad/revisión de acción emitida por el servicio", async () => {
  const clock = vi
    .spyOn(Date, "now")
    .mockReturnValue(Date.parse("2026-10-05T10:05:00.000Z"));
  const original = global.fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, opts) => {
      if (url.includes("/timeline")) {
        const body = structuredClone(serviceSamples.responses.Timeline);
        delete body.effective_agent;
        body.conversation_id = "local-1";
        body.permissions = ["history", "sondeo"];
        body.pending_operations = [];
        return { ok: true, status: 200, json: async () => body };
      }
      return original(url, opts);
    }),
  );
  try {
    mount();
    await screen.findByText("Respuesta local");
    expect(screen.queryByRole("heading", { name: "Tu sondeo" })).toBeNull();
    expect(screen.queryByText("Sondeo en curso.")).toBeNull();
    expect(screen.queryByText("Canje APP test")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Sí", exact: true }));
    const presentation =
      serviceSamples.responses.Timeline.items[1].presentation;
    await waitFor(() =>
      expect(actionBody).toMatchObject({
        kind: "action",
        presentation_id: presentation.presentation_id,
        presentation_revision: presentation.presentation_revision,
        action_id: presentation.actions[0].action_id,
      }),
    );
  } finally {
    clock.mockRestore();
  }
});

it("cambio de operador no atribuye mensajes históricos al operador actual", async () => {
  const original = global.fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, opts) => {
      if (url.includes("/timeline")) {
        const body = timeline();
        body.items.push({
          message_id: "old-operator-message",
          sequence: "2",
          role: "operator",
          text: "Mensaje de un operador anterior",
          occurred_at: "2026-10-05T09:00:00.000Z",
          presentation: null,
        });
        body.support = {
          status: "assigned",
          operator_display_name: "Nueva Gestora",
          assigned_at: "2026-10-05T10:00:00.000Z",
        };
        return { ok: true, status: 200, json: async () => body };
      }
      return original(url, opts);
    }),
  );
  mount();
  const historic = await screen.findByText("Mensaje de un operador anterior");
  expect(historic.closest(".bubble").querySelector("strong").textContent).toBe(
    "Equipo Gestadia",
  );
  expect(screen.getByText("Te atiende Nueva Gestora.")).toBeInTheDocument();
});

it("atención local LidIA muestra Segundo como actual sin atribuirle la historia", async () => {
  const original = global.fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, opts) => {
      if (url.includes("/timeline")) {
        const body = structuredClone(
          finalServiceSamples.responses.SupportTimeline,
        );
        delete body.effective_agent;
        body.conversation_id = "local-1";
        body.permissions = ["history"];
        body.pending_operations = [];
        return { ok: true, status: 200, json: async () => body };
      }
      return original(url, opts);
    }),
  );
  mount();
  const operator = await screen.findByText("Continúo");
  expect(operator.closest(".bubble").querySelector("strong").textContent).toBe(
    "Equipo Gestadia",
  );
  expect(screen.getByText("Te atiende Segundo.")).toBeInTheDocument();
  expect(screen.queryByText("Canje APP test")).toBeNull();
});
it("routing_error local LidIA libera el pendiente, informa y no deriva a otro destino", async () => {
  const original = global.fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, opts) => {
      if (url.endsWith("/handoff")) {
        calls.push({ url, opts });
        return {
          ok: false,
          status: 409,
          json: async () =>
            structuredClone(finalServiceSamples.responses.RoutingError),
        };
      }
      return original(url, opts);
    }),
  );
  mount();
  await screen.findByText("Selecciona una opción");
  fireEvent.click(screen.getByRole("button", { name: "Solicitar soporte" }));
  await screen.findByText(
    "No hay un destino de atención disponible para esta solicitud.",
  );
  expect(screen.queryByRole("button", { name: "Recuperar envío" })).toBeNull();
  expect(calls.filter((c) => c.url.endsWith("/handoff"))).toHaveLength(1);
  expect(
    sessionStorage.getItem(`gestadia_app_conversation_v1:${id}:local-1`),
  ).toBeNull();
});

it("actualiza las acciones anteriores desde un snapshot paginado al avanzar el historial incremental", async () => {
  const original = global.fetch;
  let sent = false;
  const oldMessage = () => ({
    ...timeline().items[0],
    presentation: { ...timeline().items[0].presentation, actions: [{ ...timeline().items[0].presentation.actions[0], enabled: false, disabled_reason: "superseded" }] },
  });
  const newMessage = () => ({
    ...timeline().items[0], message_id: "m3", sequence: "3", text: "Nueva pregunta",
    presentation: {
      ...timeline().items[0].presentation, presentation_id: "p3", presentation_revision: "3",
      actions: [{ ...timeline().items[0].presentation.actions[0], action_id: "country", label: "Argentina" }],
    },
  });
  vi.stubGlobal("fetch", vi.fn(async (url, opts) => {
    if (url.endsWith("/turns")) sent = true;
    if (!url.includes("/timeline")) return original(url, opts);
    calls.push({ url, opts });
    const body = timeline();
    if (sent) {
      body.state_revision = "3";
      if (url.includes("cursor=")) { body.items = [newMessage()]; body.next_cursor = "tail-3"; }
      else { body.items = [oldMessage()]; body.has_more = true; body.next_cursor = "first-1"; }
    }
    return { ok: true, status: 200, json: async () => body };
  }));
  mount();
  await screen.findByText("Selecciona una opción");
  expect(screen.getByRole("button", { name: "Sí", exact: true })).toBeEnabled();
  fireEvent.change(screen.getByLabelText("Tu consulta"), { target: { value: "Continúo el sondeo" } });
  fireEvent.click(screen.getByRole("button", { name: "Enviar consulta" }));
  await screen.findByText("Nueva pregunta");
  await waitFor(() => expect(screen.getByRole("button", { name: "Argentina", exact: true })).toBeEnabled());
  expect(screen.getByText("Selecciona una opción")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Sí", exact: true })).toBeDisabled();
  expect(calls.filter(c => c.url.endsWith("/turns"))).toHaveLength(1);
  expect(calls.some(c => c.url.includes("cursor=first-1"))).toBe(true);
});
it("refresca una acción consumida aunque el incremental no contenga otra presentación", async () => {
  const original = global.fetch;
  let sent = false;
  vi.stubGlobal("fetch", vi.fn(async (url, opts) => {
    if (url.endsWith("/turns")) sent = true;
    if (!url.includes("/timeline")) return original(url, opts);
    const body = timeline();
    if (sent) {
      body.turn_statuses = [{ turn_id: actionBody.turn_id, status: "failed" }];
      if (url.includes("cursor=")) body.items = [];
      else body.items[0].presentation.actions[0] = { ...body.items[0].presentation.actions[0], enabled: false, disabled_reason: "consumed" };
    }
    return { ok: true, status: 200, json: async () => body };
  }));
  mount();
  await screen.findByText("Selecciona una opción");
  fireEvent.click(screen.getByRole("button", { name: "Sí", exact: true }));
  await waitFor(() => expect(calls.filter(c => c.url.endsWith("/turns"))).toHaveLength(1));
  await waitFor(() => expect(screen.getByRole("button", { name: "Sí", exact: true })).toHaveAttribute("title", "consumed"));
  expect(screen.getByRole("button", { name: "Sí", exact: true })).toBeDisabled();
  expect(screen.getByText("Selecciona una opción")).toBeInTheDocument();
});
it("no publica opciones de un snapshot que cambia de revisión durante la paginación", async () => {
  const original = global.fetch;
  let reads = 0;
  vi.stubGlobal("fetch", vi.fn(async (url, opts) => {
    if (!url.includes("/timeline")) return original(url, opts);
    const body = timeline();
    const count = ++reads;
    if (count > 1) {
      body.state_revision = count >= 4 ? "4" : "3";
      if (count === 3) { body.has_more = true; body.next_cursor = "page-1"; }
      else body.items = [{ ...body.items[0], message_id: "m3", sequence: "3" }];
    }
    return { ok: true, status: 200, json: async () => body };
  }));
  mount();
  await screen.findByText("Selecciona una opción");
  fireEvent.change(screen.getByLabelText("Tu consulta"), { target: { value: "Actualiza" } });
  fireEvent.click(screen.getByRole("button", { name: "Enviar consulta" }));
  await screen.findByRole("alert");
  expect(screen.queryByRole("button", { name: "Sí", exact: true })).toBeNull();
  expect(screen.getByRole("button", { name: "Volver a cargar" })).toBeEnabled();
});
it("el snapshot autorizado retira del historial un mensaje que ya no devuelve la fuente", async () => {
  const original = global.fetch;
  let sent = false;
  vi.stubGlobal("fetch", vi.fn(async (url, opts) => {
    if (url.endsWith("/turns")) sent = true;
    if (!url.includes("/timeline")) return original(url, opts);
    const body = timeline();
    if (sent) {
      body.state_revision = "3";
      body.items = [{ ...body.items[0], message_id: "m3", sequence: "3", text: "Historia autorizada actual", presentation: null }];
    }
    return { ok: true, status: 200, json: async () => body };
  }));
  mount();
  await screen.findByText("Selecciona una opción");
  fireEvent.change(screen.getByLabelText("Tu consulta"), { target: { value: "Actualiza contexto" } });
  fireEvent.click(screen.getByRole("button", { name: "Enviar consulta" }));
  await screen.findByText("Historia autorizada actual");
  expect(screen.queryByText("Selecciona una opción")).toBeNull();
});
it("conserva el recibo terminal de la primera página y libera el envío pendiente al completar el snapshot", async () => {
  const original = global.fetch;
  let sent = null;
  vi.stubGlobal("fetch", vi.fn(async (url, opts) => {
    if (url.endsWith("/turns")) {
      sent = JSON.parse(opts.body); calls.push({ url, opts });
      return { ok: true, status: 200, json: async () => ({ id: "op-lost", status: "outcome_unknown", receipt: null }) };
    }
    if (!url.includes("/timeline")) return original(url, opts);
    const body = timeline();
    if (sent) {
      body.state_revision = "3";
      if (url.includes("cursor=page-1")) {
        body.items = [{ ...body.items[0], message_id: "m3", sequence: "3", text: "Última página", presentation: null }];
        body.next_cursor = "tail-3";
      } else {
        body.turn_statuses = [{ turn_id: sent.turn_id, status: "failed" }];
        if (url.includes("cursor=")) body.items = [];
        else { body.has_more = true; body.next_cursor = "page-1"; }
      }
    }
    return { ok: true, status: 200, json: async () => body };
  }));
  mount();
  await screen.findByText("Selecciona una opción");
  fireEvent.change(screen.getByLabelText("Tu consulta"), { target: { value: "Envío con confirmación recuperada" } });
  fireEvent.click(screen.getByRole("button", { name: "Enviar consulta" }));
  await screen.findByText("Última página");
  await waitFor(() => expect(screen.queryByText(/sin confirmación/i)).toBeNull());
  expect(sessionStorage.getItem(`gestadia_app_conversation_v1:${id}:local-1`)).toBeNull();
  expect(calls.filter(c => c.url.endsWith("/turns"))).toHaveLength(1);
});


it("nueva conversación tras cierre remonta el historial sin reutilizar cursor ni mensajes anteriores", async () => {
  closed = true;
  const original = global.fetch; let started = false;
  vi.stubGlobal("fetch", vi.fn(async (url, opts = {}) => {
    if (url === "/api/app/v1/conversations" && opts.method === "POST") {
      started = true;
      return { ok: true, status: 200, json: async () => ({ conversation: { id: "new-chat", purpose: "sondeo", case_ref: null, ready: true, status: "active" }, operation: null }) };
    }
    if (url === "/api/app/v1/conversations" && started)
      return { ok: true, status: 200, json: async () => ({ conversations: [{ id: "local-1", purpose: "sondeo", case_ref: null, ready: true, status: "closed" }, { id: "new-chat", purpose: "sondeo", case_ref: null, ready: true, status: "active" }] }) };
    if (url.includes("/new-chat/timeline")) {
      expect(url).not.toContain("tail-1");
      return { ok: true, status: 200, json: async () => ({ ...timeline(), conversation_id: "new-chat", items: [], next_cursor: null, conversation_status: "active" }) };
    }
    return original(url, opts);
  }));
  mount(); await screen.findByText(/conversación está cerrada/i);
  fireEvent.click(screen.getByRole("button", { name: "Nueva conversación con LidIA" }));
  fireEvent.click(await screen.findByRole("button", { name: "Iniciar conversación" }));
  await waitFor(() => expect(screen.queryByText("Selecciona una opción")).toBeNull());
  expect(screen.getByRole("button", { name: "Enviar consulta" })).toBeInTheDocument();
});

it.each(["requested", "assigned", "in_support"])("una atención %s conserva el compositor y no ofrece pedirla otra vez", async (status) => {
  const original = global.fetch;
  vi.stubGlobal("fetch", vi.fn(async (url, opts) => {
    if (!url.includes("/timeline")) return original(url, opts);
    return { ok: true, status: 200, json: async () => ({ ...timeline(), support: { status, operator_display_name: status === "requested" ? null : "Integraciones" } }) };
  }));
  mount();
  await screen.findByText("Selecciona una opción");
  expect(screen.getByRole("button", { name: "Enviar consulta" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Solicitar soporte" })).toBeNull();
});

const newIntent = "33333333-3333-4333-8333-333333333333";
it("abrir nueva conversación no recupera ni crea el chat anterior; iniciar canoniza el id", async () => {
  const original = global.fetch; let starts = 0;
  vi.stubGlobal("fetch", vi.fn(async (url, opts = {}) => {
    if (url === "/api/app/v1/conversations" && opts.method === "POST") {
      starts++; expect(JSON.parse(opts.body)).toEqual({ purpose: "sondeo", case_ref: null, create_new: true });
      expect(opts.headers.get("Idempotency-Key")).toBe(newIntent);
      return { ok: true, status: 200, json: async () => ({ conversation: { id: "new-chat", purpose: "sondeo", case_ref: null, ready: true }, operation: null }) };
    }
    if (url === "/api/app/v1/conversations") return { ok: true, status: 200, json: async () => ({ conversations: [{ id: "new-chat", purpose: "sondeo", case_ref: null, ready: true }, { id: "local-1", purpose: "sondeo", case_ref: null, ready: true }] }) };
    if (url.includes("/new-chat/timeline")) return { ok: true, status: 200, json: async () => ({ ...timeline(), conversation_id: "new-chat", items: [], next_cursor: null }) };
    return original(url, opts);
  }));
  mount(`/lidia/conversacion?nueva=${newIntent}`);
  const start = await screen.findByRole("button", { name: "Iniciar conversación" });
  expect(screen.queryByText("Selecciona una opción")).toBeNull();
  expect(starts).toBe(0);
  fireEvent.click(start); fireEvent.click(start);
  await waitFor(() => expect(screen.getByTestId("route")).toHaveTextContent("/lidia/conversacion?conversacion=new-chat"));
  expect(starts).toBe(1);
  expect(screen.queryByText("Selecciona una opción")).toBeNull();
});
it("el chat abierto ofrece nueva conversación y protege borrador y envío sin confirmar", async () => {
  mount("/lidia/conversacion?conversacion=local-1");
  await screen.findByText("Selecciona una opción");
  const fresh = screen.getByRole("button", { name: "Nueva conversación con LidIA" });
  expect(fresh).toBeEnabled();
  fireEvent.change(screen.getByLabelText("Tu consulta"), { target: { value: "Borrador" } });
  expect(fresh).toBeDisabled();
  failSend = true; fireEvent.click(screen.getByRole("button", { name: "Enviar consulta" }));
  await screen.findByText(/sin confirmación/i);
  expect(fresh).toBeDisabled();
  expect(screen.getByTestId("route")).toHaveTextContent("conversacion=local-1");
});
it("respuesta de creación perdida conserva la clave al recargar y reintentar", async () => {
  const original = global.fetch, keys = [];
  vi.stubGlobal("fetch", vi.fn(async (url, opts = {}) => {
    if (url === "/api/app/v1/conversations" && opts.method === "POST") { keys.push(opts.headers.get("Idempotency-Key")); throw new TypeError("lost"); }
    return original(url, opts);
  }));
  const entry = `/lidia/conversacion?nueva=${newIntent}`;
  mount(entry); fireEvent.click(await screen.findByRole("button", { name: "Iniciar conversación" }));
  await screen.findByRole("alert"); fireEvent.click(screen.getByRole("button", { name: "Volver a cargar" }));
  await waitFor(() => expect(keys).toHaveLength(2));
  cleanup(); mount(entry); fireEvent.click(await screen.findByRole("button", { name: "Iniciar conversación" }));
  await waitFor(() => expect(keys).toHaveLength(3));
  expect(keys).toEqual([newIntent, newIntent, newIntent]);
});

it("un chat pendiente abierto por id recupera sólo su sesión original", async () => {
  const original = global.fetch, bodies = [];
  vi.stubGlobal("fetch", vi.fn(async (url, opts = {}) => {
    if (url === "/api/app/v1/conversations" && opts.method === "POST") {
      bodies.push(JSON.parse(opts.body));
      return { ok: true, status: 200, json: async () => ({ conversation: { id: "older-pending", purpose: "sondeo", case_ref: null, ready: false }, operation: { id: "session-op", operation: "session", status: "outcome_unknown" } }) };
    }
    if (url === "/api/app/v1/conversations") return { ok: true, status: 200, json: async () => ({ conversations: [{ id: "latest", purpose: "sondeo", case_ref: null, ready: true }, { id: "older-pending", purpose: "sondeo", case_ref: null, ready: false }] }) };
    return original(url, opts);
  }));
  mount("/lidia/conversacion?conversacion=older-pending");
  await screen.findByRole("button", { name: "Recuperar envío" });
  expect(bodies).toEqual([{ purpose: "sondeo", case_ref: null, conversation_id: "older-pending" }]);
  expect(screen.getByRole("button", { name: "Nueva conversación con LidIA" })).toBeDisabled();
});

it("al recuperar un chat no ofrece abrir otro mientras está cargando el historial", async () => {
  const original = global.fetch; let release;
  const gate = new Promise(resolve => { release = resolve; });
  vi.stubGlobal("fetch", vi.fn(async (url, opts = {}) => {
    if (url === "/api/app/v1/conversations") await gate;
    return original(url, opts);
  }));
  mount("/lidia/conversacion?conversacion=local-1");
  await screen.findByText("Cargando conversación…");
  expect(screen.queryByRole("button", { name: "Abrir conversación" })).toBeNull();
  await act(async () => release());
  await screen.findByText("Selecciona una opción");
  expect(calls.filter(c => c.opts.method === "POST")).toHaveLength(0);
});
it("recuperar una creación pendiente conserva su id y canoniza la ruta sin otra creación", async () => {
  const original = global.fetch; let ready = false, starts = 0, retries = 0;
  vi.stubGlobal("fetch", vi.fn(async (url, opts = {}) => {
    if (url === "/api/app/v1/conversations" && opts.method === "POST") {
      starts++; return { ok: true, status: 200, json: async () => ({ conversation: { id: "new-pending", purpose: "sondeo", case_ref: null, ready: false }, operation: { id: "start-op", operation: "session", status: "outcome_unknown" } }) };
    }
    if (url.endsWith("/start-op/retry")) { ready = true; retries++; return { ok: true, status: 200, json: async () => ({ id: "start-op", operation: "session", status: "admitted" }) }; }
    if (url === "/api/app/v1/conversations") return { ok: true, status: 200, json: async () => ({ conversations: [{ id: "new-pending", purpose: "sondeo", case_ref: null, ready }] }) };
    if (url.includes("/new-pending/timeline")) return { ok: true, status: 200, json: async () => ({ ...timeline(), conversation_id: "new-pending", items: [], next_cursor: null }) };
    return original(url, opts);
  }));
  mount(`/lidia/conversacion?nueva=${newIntent}`);
  fireEvent.click(await screen.findByRole("button", { name: "Iniciar conversación" }));
  fireEvent.click(await screen.findByRole("button", { name: "Recuperar envío" }));
  await waitFor(() => expect(screen.getByTestId("route")).toHaveTextContent("/lidia/conversacion?conversacion=new-pending"));
  await screen.findByRole("button", { name: "Enviar consulta" });
  expect(starts).toBe(1); expect(retries).toBe(1);
});
