import React, { useEffect, useRef } from "react";
import Icon from "./Icon.jsx";
export default function Sheet({
  title,
  subtitle,
  className = "",
  children,
  onClose,
}) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    return () => {
      ref.current?.close();
      previous?.focus?.();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`sheet ${className}`}
      aria-label={title}
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
        <div>
          <h2>{title}</h2>
          {subtitle}
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
