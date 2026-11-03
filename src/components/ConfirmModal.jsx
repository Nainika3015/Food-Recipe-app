/* ============================================================
   CraveCart - ConfirmModal.jsx (+ generic Modal)
   Same overlay/markup classes as the legacy confirm modal.
   ============================================================ */

import React from 'react';

export function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default function ConfirmModal({ title = 'Please confirm', message, confirmText = 'Confirm', danger, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay open" onClick={onCancel}>
      <div className="modal-box modal-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: 1.6 }}>{message}</p>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline btn-sm" onClick={onCancel}>Cancel</button>
          <button className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
