/* ============================================================
   CraveCart - PasswordInput.jsx
   Password field with a show/hide toggle (same visual language
   as the legacy auth form inputs).
   ============================================================ */

import React, { useState } from 'react';

export default function PasswordInput({ label, value, onChange, placeholder, required, autoFocus }) {
  const [show, setShow] = useState(false);

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div className="input-wrap">
        <input
          type={show ? 'text' : 'password'}
          className="form-control"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
        />
        <button
          type="button"
          className="pw-toggle"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? '🙈' : '👁'}
        </button>
      </div>
    </div>
  );
}
