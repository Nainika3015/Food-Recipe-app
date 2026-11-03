/* ============================================================
   CraveCart - Stars.jsx
   Read-only star row (.stars) + interactive picker (.star-input),
   using the classes defined in user.css.
   ============================================================ */

import React from 'react';

export function StarsDisplay({ value }) {
  const full = Math.round(value || 0);
  return (
    <span className="stars" aria-label={`${full} out of 5 stars`}>
      {full > 0 ? '★★★★★'.slice(0, full) + '★★★★★'.slice(full) : '☆☆☆☆☆'}
    </span>
  );
}

export function StarsInput({ value, onChange }) {
  return (
    <div className="star-input" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={value >= n ? 'active' : ''}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
