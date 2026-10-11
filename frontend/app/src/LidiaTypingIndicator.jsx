import React, { useEffect, useState } from "react";
import { MOTION_MS, useReducedMotion } from "./motion.jsx";

export default function LidiaTypingIndicator({ active }) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(active);
  useEffect(() => {
    if (active) { setVisible(true); return; }
    if (reduced) { setVisible(false); return; }
    const timer = setTimeout(() => setVisible(false), MOTION_MS);
    return () => clearTimeout(timer);
  }, [active, reduced]);
  if (!visible) return null;
  return (
    <p className="lidia-typing" role={active ? "status" : undefined}
      aria-label={active ? "LidIA está escribiendo" : undefined}
      aria-hidden={active ? undefined : true}
      data-motion-closing={!active || undefined}>
      <strong>
        <span className="lidia-typing-label">LidIA está escribiendo</span>
        <span className="lidia-typing-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span>
      </strong>
    </p>
  );
}
