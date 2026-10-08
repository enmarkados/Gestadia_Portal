import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { getToken } from "./api.js";
import { conversationApi } from "./conversationApi.js";

const rank = { sent: 0, received: 1, read: 2 };
const chunks = (ids) => Array.from({ length: Math.ceil(ids.length / 50) }, (_, i) => ids.slice(i * 50, i * 50 + 50));
function newer(old, next) {
  return next && Object.hasOwn(rank, next.delivery_status) && /^\d{1,19}$/.test(next.receipt_revision)
    && (!old || BigInt(next.receipt_revision) > BigInt(old.receipt_revision))
    && (!old || rank[next.delivery_status] >= rank[old.delivery_status]);
}
// Visibility includes native foreground state; WebView visibility alone is insufficient.
function watchActivity(onChange) {
  let alive = true, foreground = !Capacitor.isNativePlatform(), listener, stateEventSeen = false;
  const active = () => alive && foreground && document.visibilityState === "visible";
  const changed = () => onChange(active());
  document.addEventListener("visibilitychange", changed);
  if (Capacitor.isNativePlatform()) {
    App.addListener("appStateChange", ({ isActive }) => { stateEventSeen = true; foreground = isActive; changed(); })
      .then(handle => { if (alive) listener = handle; else handle.remove(); }).catch(() => {});
    App.getState().then(state => { if (alive && !stateEventSeen) { foreground = state.isActive; changed(); } }).catch(() => {});
  }
  return { active, stop() { alive = false; document.removeEventListener("visibilitychange", changed); listener?.remove(); } };
}
export function useMessageReceipts({ userId, conversationId, items, enabled }) {
  const [receipts, setReceipts] = useState({});
  const cache = useRef({ userId: null, conversationId: null, items: {} });
  const idsKey = items.filter(m => ["user", "assistant", "operator"].includes(m.role)).map(m => m.message_id).join(",");
  useEffect(() => {
    if (cache.current.userId !== userId || cache.current.conversationId !== conversationId || !enabled)
      cache.current = { userId, conversationId, items: {} };
    setReceipts({ ...cache.current.items });
    if (!enabled || !userId || !conversationId || !idsKey) return;
    let alive = true, fetching = false, sending = false, timer, observer, modalObserver;
    const accepted = new Map(items.filter(m => ["user", "assistant", "operator"].includes(m.role)).map(m => [m.message_id, m]));
    const visible = new Set(), confirmed = cache.current.items;
    const key = `gestadia_app_conversation_v1:receipt-acks:${userId}:${conversationId}`;
    let queue;
    try { queue = JSON.parse(sessionStorage.getItem(key) || "[]"); } catch { queue = []; }
    // Stored outbox entries cannot introduce a sender, account or timestamp.
    queue = Array.isArray(queue) ? queue.filter(op => op?.key && op.body?.ack_id
      && ["received", "read"].includes(op.body.state) && Array.isArray(op.body.message_ids)
      && op.body.message_ids.length > 0 && op.body.message_ids.length <= 50) : [];
    const persist = () => {
      try { sessionStorage.setItem(key, JSON.stringify(queue)); return true; } catch { return false; }
    };
    function merge(snapshot) {
      if (!alive || snapshot?.conversation_id !== conversationId || !Array.isArray(snapshot.items)) return;
      for (const r of snapshot.items) {
        const m = accepted.get(r.message_id);
        if (m?.role === r.role && m.sequence === r.sequence && newer(confirmed[r.message_id], r)) confirmed[r.message_id] = r;
      }
      setReceipts({ ...confirmed });
    }
    const incoming = id => ["assistant", "operator"].includes(accepted.get(id)?.role);
    async function flush() {
      if (sending || !alive || !activity.active()) return;
      sending = true;
      try {
        while (alive && activity.active() && queue.length) {
          const op = queue.find(entry => entry.body.message_ids.every(id => incoming(id))
            && (entry.body.state !== "read" || (readActive() && entry.body.message_ids.every(id => visible.has(id)))));
          if (!op) break;
          try {
            const result = await conversationApi.ackMessages(conversationId, op.body, op.key);
            if (!alive) return;
            // Only a matching authoritative response settles an unknown outcome.
            if (result?.ack_id !== op.body.ack_id || result.conversation_id !== conversationId || !Array.isArray(result.items)
              || op.body.message_ids.some(id => !result.items.some(r => r.message_id === id && rank[r.delivery_status] >= rank[op.body.state]))) break;
            merge(result);
            queue = queue.filter(entry => entry !== op); persist();
          } catch (error) {
            if (!alive) return;
            if (error.status >= 400 && error.status < 500 && ![408, 429].includes(error.status)) {
              queue = queue.filter(entry => entry !== op); persist();
            }
            break; // Same key/body survives a lost response; retry on refresh/resume.
          }
        }
      } finally { sending = false; }
    }
    function enqueue(state, ids) {
      if (!alive || !activity.active() || (state === "read" && !readActive())) return;
      const needed = ids.filter(id => incoming(id) && confirmed[id]
        && rank[confirmed[id].delivery_status] < rank[state]
        && !queue.some(op => rank[op.body.state] >= rank[state] && op.body.message_ids.includes(id)));
      for (const batch of chunks(needed)) {
        const uuid = crypto.randomUUID();
        const entry = { key: uuid, body: { schema_version: "1.0", ack_id: uuid, state, message_ids: batch, correlation_id: crypto.randomUUID() } };
        queue.push(entry);
        if (!persist()) { queue.pop(); break; }
      }
      void flush();
    }
    let page = 0;
    async function refresh(all = true) {
      if (!alive || fetching || !activity.active()) return;
      fetching = true;
      try {
        const batches = chunks([...accepted.keys()]);
        // A long loaded history costs one lookup per poll, rather than unbounded requests.
        const selected = all ? batches : [batches[page++ % batches.length]];
        for (const ids of selected) {
          const snapshot = await conversationApi.messageReceipts(conversationId, { message_ids: ids.join(",") });
          if (!alive) return;
          merge(snapshot);
        }
        enqueue("received", [...accepted.keys()]);
        enqueue("read", [...visible]);
      } catch { /* Receipt availability never invents delivery or blocks the composer. */ }
      finally { fetching = false; }
    }
    const activity = watchActivity(active => {
      visible.clear();
      if (active) {
        // Re-observation forces fresh geometry after resuming/rotation.
        observer?.disconnect(); observeMessages();
        void flush(); void refresh();
      }
    });
    // Geometry under a modal does not establish human visibility of the chat.
    const readActive = () => activity.active() && !document.querySelector('dialog[open], [aria-modal="true"]');
    let reading = readActive();
    function observeMessages() {
      if (!observer || !readActive()) return;
      for (const element of document.querySelectorAll("[data-message-id]"))
        if (incoming(element.dataset.messageId)) observer.observe(element);
    }
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          const id = entry.target.dataset.messageId;
          if (readActive() && entry.isIntersecting && entry.intersectionRatio > 0) visible.add(id); else visible.delete(id);
        }
        enqueue("read", [...visible]);
      }, { root: document.getElementById("main"), threshold: [0, 0.01, 0.5] });
      observeMessages();
    }
    modalObserver = new MutationObserver(() => {
      const next = readActive();
      if (next === reading) return;
      reading = next; visible.clear(); observer?.disconnect();
      if (next) observeMessages(); // A fresh intersection is required after the sheet closes.
    });
    modalObserver.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["open", "aria-modal"] });
    void refresh();
    async function poll() { if (!alive) return; await flush(); await refresh(false); if (alive) timer = setTimeout(poll, 3000); }
    timer = setTimeout(poll, 3000);
    return () => { alive = false; clearTimeout(timer); observer?.disconnect(); modalObserver?.disconnect(); activity.stop(); };
  }, [userId, conversationId, !!enabled, idsKey]);
  return receipts;
}

// A summary GET is deliberately read-only: displaying a preview never sends ACK.
export function useReceiptSummaries(rows) {
  const [summaries, setSummaries] = useState({});
  const token = getToken(), cache = useRef({ token: null, items: {} });
  const key = rows.filter(c => c.ready).map(c => c.id).join(",");
  useEffect(() => {
    if (!token || cache.current.token !== token) cache.current = { token, items: {} };
    if (!key || !token) { setSummaries({}); return; }
    let alive = true, fetching = false, timer, observer;
    const ids = key.split(","), current = cache.current.items, visible = new Set(ids.slice(0, 10));
    setSummaries({ ...current });
    function merge(id, result) {
      if (!alive || getToken() !== token || result?.conversation_id !== id || !Object.hasOwn(result, "last_message")) return;
      const old = current[id]?.last_message, next = result.last_message;
      if (old && (!next || BigInt(next.sequence) < BigInt(old.sequence))) return;
      if (old?.message_id === next?.message_id && old?.receipt && !newer(old.receipt, next.receipt)) return;
      current[id] = result; setSummaries({ ...current });
    }
    async function refresh() {
      if (!alive || fetching || !activity.active()) return;
      fetching = true;
      try {
        if (getToken() !== token) return;
        const targets = [...visible].slice(0, 20);
        for (let i = 0; i < targets.length; i += 4) await Promise.all(targets.slice(i, i + 4).map(async id => {
          try { merge(id, await conversationApi.messageReceipts(id, { summary: "true" })); } catch { /* No synthetic tick/preview on error. */ }
        }));
      } finally { fetching = false; }
    }
    const activity = watchActivity(active => { if (active) void refresh(); });
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(entries => {
        for (const e of entries) { const id = e.target.dataset.receiptConversation;
          if (e.isIntersecting) visible.add(id); else visible.delete(id);
        }
        void refresh();
      }, { root: document.getElementById("main") });
      document.querySelectorAll("[data-receipt-conversation]").forEach(n => observer.observe(n));
    }
    void refresh();
    async function poll() { await refresh(); if (alive) timer = setTimeout(poll, 10000); }
    timer = setTimeout(poll, 10000);
    return () => { alive = false; clearTimeout(timer); observer?.disconnect(); activity.stop(); };
  }, [key, rows, token]);
  return summaries;
}
