import React, { useLayoutEffect, useRef } from "react";
import Icon from "./Icon.jsx";
export default function Sheet({
  title,
  icon,
  subtitle,
  closeLabel = "Cerrar",
  className = "",
  children,
  onClose,
  closing = false,
  presentation = "panel",
  anchorRef,
}) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const previous = anchorRef?.current || document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    function position() {
      if (presentation !== "menu" || !anchorRef?.current) return;
      const anchor = anchorRef.current.getBoundingClientRect(), box = dialog.getBoundingClientRect();
      const viewport = window.visualViewport;
      const leftBound = viewport?.offsetLeft || 0, topBound = viewport?.offsetTop || 0;
      const width = viewport?.width || window.innerWidth, height = viewport?.height || window.innerHeight;
      const left = Math.max(leftBound + 8, Math.min(anchor.right - box.width, leftBound + width - box.width - 8));
      const below = anchor.bottom + 8;
      const top = Math.max(topBound + 8, Math.min(below, topBound + height - box.height - 8));
      dialog.style.left = `${left}px`;
      dialog.style.top = `${top}px`;
      dialog.style.transformOrigin = `${Math.max(0, Math.min(box.width, anchor.right - left))}px top`;
    }
    position();
    window.addEventListener("resize", position);
    window.visualViewport?.addEventListener("resize", position);
    return () => {
      window.removeEventListener("resize", position);
      window.visualViewport?.removeEventListener("resize", position);
      dialog.close();
      if (previous?.isConnected) previous.focus?.({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`sheet ${className}`}
      aria-label={title}
      data-presentation={presentation}
      data-motion-closing={closing || undefined}
      inert={closing ? "" : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="sheet-handle" aria-hidden="true" />
      <div className="sheet-head">
        <div className="sheet-title-group">
          {icon}
          <div>
            <h2>{title}</h2>
            {subtitle}
          </div>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label={closeLabel}>
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
