/* ============================================================
   CraveCart Admin - AdminReviews.jsx
   Ported from legacy js/admin.js fbInitAdminReviews():
   star filter (all / 5-star / low), newest-first list and
   delete with rating recalculation.
   ============================================================ */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getReviews, getRecipes } from '../../services/storageService.js';
import { saveData, LS_KEYS, fbGetRecipeById, fbFormatDate } from '../../services/storageCore.js';

function starsFor(n) { return '★★★★★'.slice(0, n) + '★★★★★'.slice(n); }

export default function AdminReviews() {
  const toast = useToast();
  const [, force] = useState(0);
  const [filter, setFilter] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const all = getReviews();
  let reviews = all;
  if (filter === '5') reviews = reviews.filter((rv) => rv.rating === 5);
  if (filter === 'low') reviews = reviews.filter((rv) => rv.rating <= 2);

  const sorted = reviews.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  const onDelete = () => {
    saveData(LS_KEYS.REVIEWS, (getReviews() || []).filter((rv) => rv.id !== pendingDelete.id));
    toast('Review deleted', 'info');
    setPendingDelete(null);
    force((n) => n + 1);
  };

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2>Manage Reviews</h2>
          <p className="muted small">{reviews.length} reviews</p>
        </div>
      </div>

      <div className="admin-toolbar" style={{ marginBottom: 16 }}>
        <select className="form-control" style={{ maxWidth: 220 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All reviews</option>
          <option value="5">5-star only</option>
          <option value="low">Low ratings (≤ 2)</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <h3>No reviews</h3>
          <p>Nothing to moderate here.</p>
        </div>
      ) : (
        <div id="admin-reviews-list">
          {sorted.map((rv) => {
            const recipe = fbGetRecipeById(rv.recipeId);
            return (
              <div className="review-admin-item" key={rv.id}>
                <div className="review-admin-head">
                  <div className="mini-avatar">{(rv.userName || 'U').charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="review-name">{rv.userName || 'Anonymous'}</div>
                    <div className="small muted">
                      on <Link to={`/recipe/${rv.recipeId}`}><strong>{recipe ? recipe.name : '[deleted recipe]'}</strong></Link>
                    </div>
                  </div>
                  <span className="r-stars">{starsFor(rv.rating)}</span>
                  <span className="r-date">{fbFormatDate(rv.date)}</span>
                </div>
                {rv.review
                  ? <p className="review-admin-text">{rv.review}</p>
                  : <p className="review-admin-text muted small">No written review.</p>}
                <div className="row-actions-cell">
                  <button className="icon-btn danger" onClick={() => setPendingDelete(rv)}>Delete Review</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete Review"
          message="Remove this review permanently? The average rating will recalculate."
          confirmText="Delete"
          danger
          onConfirm={onDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
