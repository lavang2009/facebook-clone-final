import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, title, onClose, children, maxWidth = 720 }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && open) onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal-shell" style={{ maxWidth }}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
