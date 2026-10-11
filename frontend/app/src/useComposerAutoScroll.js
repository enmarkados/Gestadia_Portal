import { useCallback, useEffect, useRef } from "react";
import { MOTION_MS } from "./motion.jsx";

// The composer may live in a portal outside the scrollable conversation.
// Follow its real scroll container, including the keyboard's animated resize.
export function useComposerAutoScroll(end, conversationId) {
  const state = useRef({ field: null, container: null, frame: null, observer: null });
  const stop = useCallback(() => {
    const current = state.current;
    if (current.frame !== null) cancelAnimationFrame(current.frame);
    current.observer?.disconnect();
    state.current = { field: null, container: null, frame: null, observer: null };
  }, []);
  useEffect(() => stop, [conversationId, stop]);
  const activate = useCallback(event => {
    const field = event.currentTarget;
    const current = state.current;
    if (current.field !== field) stop();
    const active = state.current;
    active.field = field;
    active.container = end.current?.closest(".app-main");
    const scroll = () => {
      if (document.activeElement !== field || active.frame !== null) return;
      const container = active.container;
      const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? true;
      if (!container) {
        end.current?.scrollIntoView?.({ block: "end", behavior: reduced() ? "instant" : "smooth" });
        return;
      }
      const bottom = () => Math.max(0, container.scrollHeight - container.clientHeight);
      if (reduced()) { container.scrollTop = bottom(); return; }
      const from = container.scrollTop;
      let started;
      const step = now => {
        if (document.activeElement !== field) { stop(); return; }
        started ??= now;
        const progress = reduced() ? 1 : Math.min(1, (now - started) / MOTION_MS);
        const ease = 1 - (1 - progress) ** 3;
        container.scrollTop = from + (bottom() - from) * ease;
        active.frame = progress < 1 ? requestAnimationFrame(step) : null;
      };
      active.frame = requestAnimationFrame(step);
    };
    if (!active.observer && active.container && typeof ResizeObserver !== "undefined") {
      active.observer = new ResizeObserver(scroll);
      active.observer.observe(active.container);
    }
    scroll();
  }, [end, stop]);
  return { onFocus: activate, onClick: activate, onBlur: stop };
}
