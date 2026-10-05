import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import {
  conversationApi,
  rememberPending,
  readPending,
  clearPending,
  conversationsEnabled,
} from "./conversationApi.js";
import ChatComposer from "./ChatComposer.jsx";
const pendingStatuses = new Set(["prepared", "outcome_unknown"]);
const messages = {
  routing_unavailable:
    "No hay un destino de atención disponible para esta solicitud.",
  identity_link_required:
    "Para solicitar atención, primero necesitamos vincular tu cuenta con el equipo de Gestadia.",
  identity_verification_required:
    "Verifica tu cuenta mediante el enlace enviado a tu correo.",
  capability_denied:
    "Esta conversación no está disponible con tus permisos actuales.",
  conversation_not_found: "Esta conversación no está disponible.",
  context_unavailable:
    "Estamos actualizando los permisos. Puedes volver a cargar la conversación.",
  operation_retired: "El detalle de esta operación ya no está disponible.",
  conversation_closed: "Esta conversación está cerrada.",
};
export default function AppConversation({ purpose = "sondeo" }) {
  const { mode, data } = useApp();
  const [search] = useSearchParams();
  return (
    <ConversationBody
      key={`${mode}:${data.profile?.id || ""}:${purpose}:${search.get("caso") || ""}:${search.get("conversacion") || ""}`}
      purpose={purpose}
    />
  );
}
function ConversationBody({ purpose }) {
  const [composerHost, setComposerHost] = useState(null);
  useLayoutEffect(() => {
    setComposerHost(
      document.getElementById(
        purpose === "sondeo" ? "lidia-composer" : "manager-composer",
      ),
    );
  }, [purpose]);
  const { mode, data } = useApp(),
    userId = data.profile?.id;
  const [search] = useSearchParams();
  const caseRef = search.get("caso") || null;
  const [conversation, setConversation] = useState(null),
    [items, setItems] = useState([]),
    [timeline, setTimeline] = useState(null),
    [pending, setPending] = useState(null),
    [error, setError] = useState(""),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [voice, setVoice] = useState("");
  const cursor = useRef(null),
    generation = useRef(0),
    startKey = useRef(null),
    busyRef = useRef(false),
    loadingRef = useRef(false),
    stateRevision = useRef("0"),
    end = useRef(null);
  const showError = (e) => {
    setError(
      messages[e.code] ||
        "No se pudo completar la solicitud. Puedes volver a cargar la conversación.",
    );
    setItems([]);
    setTimeline(null);
    cursor.current = null;
  };
  async function load(id, version = generation.current) {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const result = await conversationApi.timeline(
        id,
        cursor.current
          ? { cursor: cursor.current, limit: "50" }
          : { limit: "50" },
      );
      if (version !== generation.current) return;
      if (
        !Array.isArray(result.items) ||
        !Array.isArray(result.pending_operations)
      )
        throw new Error("Formato inesperado");
      if (BigInt(result.state_revision) < BigInt(stateRevision.current)) return;
      stateRevision.current = result.state_revision;
      cursor.current = result.next_cursor || null;
      setTimeline(result);
      setItems((old) => {
        const map = new Map(old.map((m) => [m.message_id, m]));
        for (const m of result.items) map.set(m.message_id, m);
        return [...map.values()].sort((a, b) =>
          BigInt(a.sequence) < BigInt(b.sequence)
            ? -1
            : BigInt(a.sequence) > BigInt(b.sequence)
              ? 1
              : 0,
        );
      });
      const stored = readPending(userId, id);
      if (
        stored?.turn_id &&
        result.turn_statuses?.some((x) => x.turn_id === stored.turn_id)
      ) {
        clearPending(userId, id);
        setPending(null);
      } else if (stored) setPending(stored);
      else
        setPending(
          result.pending_operations.find((x) =>
            pendingStatuses.has(x.status),
          ) || null,
        );
    } finally {
      if (version === generation.current) loadingRef.current = false;
    }
  }
  useEffect(() => {
    const version = ++generation.current;
    setItems([]);
    setTimeline(null);
    setConversation(null);
    setPending(null);
    setError("");
    busyRef.current = false;
    setBusy(false);
    loadingRef.current = false;
    stateRevision.current = "0";
    cursor.current = null;
    startKey.current = crypto.randomUUID();
    if (mode !== "real" || !userId || !conversationsEnabled()) return;
    let timer,
      stopped = false;
    async function bootstrap() {
      try {
        const result = await conversationApi.list();
        if (stopped || version !== generation.current) return;
        const chosen = search.get("conversacion");
        const c = result.conversations.find(
          (x) =>
            x.purpose === purpose &&
            (chosen ? x.id === chosen : x.case_ref === caseRef),
        );
        if (!c) return;
        setConversation(c);
        if (!c.ready) {
          const started = await conversationApi.start(
            purpose,
            caseRef,
            startKey.current,
          );
          if (stopped || version !== generation.current) return;
          setConversation(started.conversation);
          setPending(started.operation);
          return;
        }
        await load(c.id, version);
      } catch (e) {
        if (!stopped && version === generation.current) showError(e);
      }
    }
    bootstrap();
    return () => {
      stopped = true;
      clearTimeout(timer);
      generation.current++;
    };
  }, [mode, userId, purpose, caseRef, search.get("conversacion")]);
  useEffect(() => {
    if (!conversation?.ready || !userId || mode !== "real") return;
    const version = generation.current;
    let stopped = false,
      timer;
    async function poll() {
      if (stopped) return;
      if (!document.hidden && !busyRef.current)
        try {
          await load(conversation.id, version);
        } catch (e) {
          if (!stopped && version === generation.current) showError(e);
        }
      if (!stopped) timer = setTimeout(poll, 3000);
    }
    timer = setTimeout(poll, 3000);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [conversation?.id, conversation?.ready, userId, mode]);
  useEffect(() => {
    end.current?.scrollIntoView?.({ block: "end" });
  }, [items.length]);
  async function begin() {
    if (busyRef.current) return;
    const version = generation.current;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const r = await conversationApi.start(purpose, caseRef, startKey.current);
      if (version !== generation.current) return;
      setConversation(r.conversation);
      setPending(pendingStatuses.has(r.operation?.status) ? r.operation : null);
      if (r.conversation.ready) await load(r.conversation.id, version);
    } catch (e) {
      if (version === generation.current) showError(e);
    } finally {
      if (version === generation.current) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  }
  async function sendAction(dto) {
    if (
      busyRef.current ||
      pending ||
      !conversation?.ready ||
      timeline?.conversation_status === "closed"
    )
      return;
    const version = generation.current,
      turn = { turn_id: crypto.randomUUID(), ...dto };
    try {
      rememberPending(userId, conversation.id, turn);
    } catch {
      setError(
        "No se puede guardar el envío para recuperarlo. Habilita el almacenamiento de la APP.",
      );
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setPending(turn);
    setError("");
    try {
      const op = await conversationApi.turn(conversation.id, turn);
      if (version !== generation.current) return;
      if (op.status === "admitted") {
        clearPending(userId, conversation.id);
        setPending(null);
        setInput("");
      } else if (op.status === "failed") {
        clearPending(userId, conversation.id);
        setPending(null);
        setError(
          messages[op.error_code] ||
            "El envío fue rechazado. Puedes revisar tu borrador.",
        );
      } else {
        const saved = { ...turn, id: op.id, status: op.status };
        rememberPending(userId, conversation.id, saved);
        setPending(saved);
      }
      await load(conversation.id, version);
    } catch (e) {
      if (version === generation.current) {
        if (e.status >= 400 && e.status < 500) {
          clearPending(userId, conversation.id);
          setPending(null);
          showError(e);
        } else setPending({ ...turn, status: "outcome_unknown" });
      }
    } finally {
      if (version === generation.current) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  }
  async function recover() {
    if (busyRef.current || !pending) return;
    const version = generation.current;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const op = pending.id
        ? await conversationApi.retry(pending.id)
        : pending.operation === "handoff"
          ? await conversationApi.handoff(
              conversation.id,
              pending.target,
              pending.key,
            )
          : await conversationApi.turn(
              conversation.id,
              Object.fromEntries(
                Object.entries(pending).filter(
                  ([k]) => !["id", "status"].includes(k),
                ),
              ),
            );
      if (version !== generation.current) return;
      if (op.status === "admitted") {
        clearPending(userId, conversation.id);
        setPending(null);
        setInput("");
      }
      if (op.status === "failed") {
        clearPending(userId, conversation.id);
        setPending(null);
        setError(
          messages[op.error_code] ||
            "El envío fue rechazado. Puedes revisar tu borrador.",
        );
      }
      if (pending.operation === "session") {
        const rows = await conversationApi.list();
        const c = rows.conversations.find((x) => x.id === conversation.id);
        setConversation(c);
        if (c?.ready) await load(c.id, version);
      } else await load(conversation.id, version);
    } catch (e) {
      if (version === generation.current) {
        if (e.status >= 400 && e.status < 500) {
          clearPending(userId, conversation.id);
          setPending(null);
        }
        showError(e);
      }
    } finally {
      if (version === generation.current) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  }
  async function handoff(target) {
    if (busyRef.current || pending) return;
    const version = generation.current,
      key = crypto.randomUUID();
    const saved = { operation: "handoff", key, target, status: "prepared" };
    try {
      rememberPending(userId, conversation.id, saved);
    } catch {
      setError("No se puede guardar la solicitud.");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setPending(saved);
    try {
      const op = await conversationApi.handoff(conversation.id, target, key);
      if (version !== generation.current) return;
      if (op.status === "admitted") {
        clearPending(userId, conversation.id);
        setPending(null);
      } else if (op.status === "failed") {
        clearPending(userId, conversation.id);
        setPending(null);
        setError(
          messages[op.error_code] ||
            "No se pudo solicitar atención. Puedes seguir escribiendo.",
        );
      } else {
        const value = { ...saved, id: op.id, status: op.status };
        rememberPending(userId, conversation.id, value);
        setPending(value);
      }
      await load(conversation.id, version);
    } catch (e) {
      if (version === generation.current) {
        if (e.status >= 400 && e.status < 500) {
          clearPending(userId, conversation.id);
          setPending(null);
          showError(e);
        } else setPending(saved);
      }
    } finally {
      if (version === generation.current) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  }
  if (mode !== "real")
    return (
      <section className="empty">
        <h1>Habla con LidIA</h1>
        <p>Entra con tu cuenta para recuperar tus conversaciones.</p>
        <Link className="btn primary" to="/acceso">
          Iniciar sesión
        </Link>
      </section>
    );
  const closed = timeline?.conversation_status === "closed",
    permissions = timeline?.permissions || [];
  const human =
    purpose === "atencion" ||
    ["assigned", "in_support"].includes(timeline?.support?.status);
  return (
    <section
      className={
        human ? "manager-chat-page" : "assistant-page assistant-chat-page"
      }
    >
      {error && (
        <div role="alert" className="error">
          <p>{error}</p>
          <button
            className="text-btn"
            onClick={() =>
              conversation?.ready
                ? load(conversation.id).catch(showError)
                : begin()
            }
          >
            Volver a cargar
          </button>
        </div>
      )}
      {!conversation && !error && (
        <div className="card empty">
          <h2>
            {purpose === "sondeo"
              ? "Tu consulta con LidIA"
              : "Atención Gestadia"}
          </h2>
          <p>
            {purpose === "sondeo"
              ? "Consulta los requisitos de tu canje."
              : "Abre una conversación con el equipo de Gestadia."}
          </p>
          <button className="btn primary" disabled={busy} onClick={begin}>
            Abrir conversación
          </button>
        </div>
      )}
      <div className="conversation" aria-live="polite">
        {items.map((m) => (
          <div
            className={`bubble ${m.role === "user" ? "user" : m.role === "operator" ? "manager" : "assistant"}`}
            key={m.message_id}
          >
            {m.role === "assistant" ? (
              <div className="lidia-message-heading">
                <span className="lidia-message-avatar" aria-hidden="true">
                  L.
                </span>
                <strong>LidIA · Asistente IA Gestadia</strong>
              </div>
            ) : (
              <div className="bubble-meta">
                <strong>
                  {m.role === "user"
                    ? "Tú"
                    : m.role === "operator"
                      ? "Equipo Gestadia"
                      : "Gestadia"}
                </strong>
                <span className="bubble-time">
                  {new Date(m.occurred_at).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            <p>{m.text}</p>
            {m.presentation && (
              <div className="stack">
                <strong>{m.presentation.title}</strong>
                {m.presentation.description && (
                  <p>{m.presentation.description}</p>
                )}
                <div className="chips">
                  {m.presentation.actions.map((a) => (
                    <button
                      key={a.action_id}
                      disabled={
                        busy ||
                        !!pending ||
                        closed ||
                        !a.enabled ||
                        Date.parse(a.expires_at) <= Date.now() ||
                        Date.parse(m.presentation.expires_at) <= Date.now()
                      }
                      title={a.disabled_reason || undefined}
                      onClick={() =>
                        sendAction({
                          kind: "action",
                          presentation_id: m.presentation.presentation_id,
                          presentation_revision:
                            m.presentation.presentation_revision,
                          action_id: a.action_id,
                        })
                      }
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {timeline?.sondeo && (
        <div className="card">
          <h2>Tu sondeo</h2>
          <p>{timeline.sondeo.summary}</p>
          <ul>
            {timeline.sondeo.requirements.map((r) => (
              <li key={r.requirement_id}>{r.label}</li>
            ))}
          </ul>
        </div>
      )}
      {["assigned", "in_support"].includes(timeline?.support?.status) &&
        timeline.support.operator_display_name && (
          <p role="status">
            Te atiende {timeline.support.operator_display_name}.
          </p>
        )}
      {timeline?.support?.status === "requested" && (
        <p role="status">
          Solicitud de atención recibida. Pendiente de asignación.
        </p>
      )}
      {closed && (
        <p role="status">
          Esta conversación está cerrada. Puedes consultar su historial.
        </p>
      )}
      {pending && (
        <div className="card" role="status">
          <p>
            {pending.status === "failed"
              ? "El envío fue rechazado."
              : "Envío sin confirmación. Puedes recuperar la misma operación."}
          </p>
          {pending.text && <p>{pending.text}</p>}
          <button className="btn secondary" disabled={busy} onClick={recover}>
            Recuperar envío
          </button>
        </div>
      )}
      {!closed && conversation?.ready && !pending && (
        <>
          <div className="chips">
            {["manager", "commercial", "support"]
              .filter((target) => permissions.includes(`${target}_handoff`))
              .map((target) => (
                <button
                  disabled={busy}
                  key={target}
                  onClick={() => handoff(target)}
                >
                  {target === "manager"
                    ? "Hablar con mi gestor"
                    : target === "commercial"
                      ? "Hablar con un comercial"
                      : "Solicitar soporte"}
                </button>
              ))}
          </div>
          {composerHost ? (
            createPortal(
              <ChatComposer
                value={input}
                onChange={setInput}
                onSend={() => {
                  if (input.trim()) sendAction({ kind: "text", text: input });
                }}
                onDictate={() =>
                  setVoice(
                    "Puedes usar el micrófono del teclado para dictar tu consulta.",
                  )
                }
                label="Tu consulta"
                sendLabel="Enviar consulta"
                status={voice}
                onStatusChange={setVoice}
              />,
              composerHost,
            )
          ) : (
            <ChatComposer
              value={input}
              onChange={setInput}
              onSend={() => {
                if (input.trim()) sendAction({ kind: "text", text: input });
              }}
              onDictate={() =>
                setVoice(
                  "Puedes usar el micrófono del teclado para dictar tu consulta.",
                )
              }
              label="Tu consulta"
              sendLabel="Enviar consulta"
              status={voice}
              onStatusChange={setVoice}
            />
          )}
        </>
      )}
      <div ref={end} />
    </section>
  );
}
