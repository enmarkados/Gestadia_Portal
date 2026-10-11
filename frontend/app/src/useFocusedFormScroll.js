import { useCallback, useLayoutEffect, useRef } from "react";
import { MOTION_MS } from "./motion.jsx";

export function useFocusedFormScroll(editingId) {
  const state = useRef({ field: null, frame: null, observer: null });
  const stop = useCallback(() => {
    const active = state.current;
    if (active.frame !== null) cancelAnimationFrame(active.frame);
    active.observer?.disconnect();
    state.current = { field: null, frame: null, observer: null };
  }, []);
  // Clean up the previous editor before the new input receives autofocus.
  useLayoutEffect(() => stop, [editingId, stop]);
  const activate = useCallback(event => {
    const field = event.currentTarget;
    const form = field.closest("form"), container = field.closest(".app-main");
    if (!form || !container) return;
    if (state.current.field !== field) stop();
    const active = state.current;
    active.field = field;
    const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? true;
    const destination = () => {
      const bounds = container.getBoundingClientRect();
      const whole = form.getBoundingClientRect();
      const rect = whole.height <= container.clientHeight - 24 ? whole : field.getBoundingClientRect();
      const delta = rect.bottom > bounds.bottom - 12 ? rect.bottom - bounds.bottom + 12
        : rect.top < bounds.top + 12 ? rect.top - bounds.top - 12 : 0;
      return Math.max(0, Math.min(container.scrollHeight - container.clientHeight, container.scrollTop + delta));
    };
    const follow = () => {
      if (state.current !== active || document.activeElement !== field || active.frame !== null) return;
      if (reduced()) { container.scrollTop = destination(); return; }
      const from = container.scrollTop;
      let started;
      const step = now => {
        if (state.current !== active || document.activeElement !== field) { stop(); return; }
        started ??= now;
        const progress = reduced() ? 1 : Math.min(1, (now - started) / MOTION_MS);
        container.scrollTop = from + (destination() - from) * (1 - (1 - progress) ** 3);
        active.frame = progress < 1 ? requestAnimationFrame(step) : null;
      };
      active.frame = requestAnimationFrame(step);
    };
    if (!active.observer && typeof ResizeObserver !== "undefined") {
      active.observer = new ResizeObserver(follow);
      active.observer.observe(container);
      active.observer.observe(form);
    }
    follow();
  }, [stop]);
  return { onFocus: activate, onClick: activate, onBlur: stop };
}
