/* ============================================================
   CraveCart - ToastContext.jsx
   React port of the legacy fbToast() notifications.
   ============================================================ */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

const ICONS = { success: '✔', error: '✖', info: 'ℹ' };

let toastSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const toast = useCallback((message, type = 'success') => {
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, message, type }]);
    timers.current[id] = setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
      delete timers.current[id];
    }, 3000);
    return id;
  }, []);

  const hide = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <div id="fb-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`fb-toast ${t.type}`} onClick={() => hide(t.id)}>
            <span className="fb-toast-icon">{ICONS[t.type] || 'ℹ'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx ? ctx.toast : () => {};
}
