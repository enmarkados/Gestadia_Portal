import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export const MOTION_MS = 280;
export const MOTION_EASING = "cubic-bezier(0.2, 0.8, 0.2, 1)";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? true,
  );
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

// The live route remains mounted once; only its content moves, never the header.
export function PageMotion({ children, backIntent }) {
  const ref = useRef(null), previous = useRef(null), positions = useRef(new Map());
  const location = useLocation(), navigationType = useNavigationType();
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const old = previous.current;
    const known = positions.current.get(location.key);
    const isBack = !!backIntent?.current ||
      (old?.pathname === "/registro" && location.pathname === "/acceso") ||
      (navigationType === "POP" && (known == null || known < old?.position));
    const position = known ?? (old ? old.position + (navigationType === "REPLACE" ? 0 : isBack ? -1 : 1) : 0);
    positions.current.set(location.key, position);
    previous.current = { pathname: location.pathname, position };
    if (backIntent) backIntent.current = false;
    if (!old || old.pathname === location.pathname) return;
    ref.current.dataset.routeMotion = isBack ? "back" : "forward";
    if (reduced || !ref.current.animate) return;
    const animation = ref.current.animate([
      { opacity: 0, transform: `translateX(${isBack ? -12 : 12}px)` },
      { opacity: 1, transform: "translateX(0)" },
    ], { duration: MOTION_MS, easing: MOTION_EASING });
    return () => animation.cancel();
  }, [location.pathname, location.key, navigationType, reduced, backIntent]);
  return <div ref={ref} className="page-motion">{children}</div>;
}

export function useSheetMotion(pathname) {
  const [sheet, setSheet] = useState(null), [closing, setClosing] = useState(false);
  const timer = useRef(null), continuation = useRef(null), origin = useRef(pathname);
  const reduced = useReducedMotion();
  const reset = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = null;
    continuation.current = null;
    setClosing(false);
    setSheet(null);
  }, []);
  const finish = useCallback(() => {
    const next = continuation.current;
    reset();
    next?.();
  }, [reset]);
  useEffect(() => {
    if (origin.current !== pathname) { origin.current = pathname; reset(); }
  }, [pathname, reset]);
  useEffect(() => { if (reduced && closing) finish(); }, [reduced, closing, finish]);
  useEffect(() => () => clearTimeout(timer.current), []);
  function openSheet(name) { reset(); setSheet(name); }
  function closeSheet(afterClose) {
    if (timer.current !== null) return;
    continuation.current = typeof afterClose === "function" ? afterClose : null;
    if (reduced || !sheet) { finish(); return; }
    setClosing(true);
    timer.current = setTimeout(finish, MOTION_MS);
  }
  return { sheet, closing, openSheet, closeSheet };
}

// A restored snapshot establishes the baseline. Older pages and receipt updates
// never replay entrances; only previously unseen messages after the high-water mark do.
export function useMessageMotion(items, ready = true) {
  const baseline = useRef({ initialized: false, seen: new Set(), order: -1n });
  const [animated, setAnimated] = useState(new Set());
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    if (!ready) {
      baseline.current = { initialized: false, seen: new Set(), order: -1n };
      if (animated.size) setAnimated(new Set());
      return;
    }
    const current = baseline.current, added = [];
    let highest = current.order;
    items.forEach((item, index) => {
      const id = item.message_id ?? item.id ?? index;
      const order = BigInt(item.sequence ?? index);
      if (current.initialized && !current.seen.has(id) && order > current.order) added.push(id);
      current.seen.add(id);
      if (order > highest) highest = order;
    });
    current.initialized = true;
    current.order = highest;
    if (reduced) {
      if (animated.size) setAnimated(new Set());
    } else if (added.length) setAnimated(old => new Set([...old, ...added]));
  }, [items, ready, reduced, animated]);
  return animated;
}
