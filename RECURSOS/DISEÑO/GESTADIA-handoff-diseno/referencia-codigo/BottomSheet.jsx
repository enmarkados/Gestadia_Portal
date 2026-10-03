import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * BottomSheet
 * Modal deslizable inferior adaptado a dispositivos móviles:
 * - Soporte de animación slideUp.
 * - Cierre accesible con tecla Escape o clic en backdrop.
 * - Respeta safe-area-inset-bottom.
 */
export function BottomSheet({ isOpen = true, onClose, children }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="gestadia-sheet-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="gestadia-sheet-card">
        <div className="gestadia-sheet-handle" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-12px' }}>
          <button
            type="button"
            className="gestadia-icon-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{ width: 32, height: 32 }}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export default BottomSheet;
