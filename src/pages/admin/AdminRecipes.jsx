/* ============================================================
   CraveCart Admin - AdminRecipes.jsx
   Ported from legacy js/admin.js: searchable recipe table with
   View / Edit / Delete, plus Add Recipe. Add & Edit render the
   shared RecipeForm in dedicated admin routes.
   ============================================================ */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminPanel } from '../../components/AdminLayout.jsx';
import { Modal } from '../../components/ConfirmModal.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getRecipes, deleteRecipeCascade } from '../../services/storageService.js';
import { fbGetRecipeRating, fbFormatDate } from '../../services/storageCore.js';

export default function AdminRecipes() {
  const toast = useToast();
  const navigate = useNavigate();
  const [, force] = useState(0);

  const [q, setQ] = useState('');
  const [viewing, setViewing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const term = q.trim().toLowerCase();
  const recipes = getRecipes().filter((r) => {
    if (!term) return true;
    return (
      r.name.toLowerCase().indexOf(term) !== -1 ||
      r.cuisine.toLowerCase().indexOf(term) !== -1 ||
      r.category.toLowerCase().indexOf(term) !== -1
    );
  });

  const onDelete = () => {
    deleteRecipeCascade(pendingDelete.id);
    toast('Recipe deleted', 'info');
    setPendingDelete(null);
    force((n) => n + 1);
  };

  const rt = viewing ? fbGetRecipeRating(viewing.id) : null;
  const total = viewing ? Number(viewing.prepTime) + Number(viewing.cookTime) : 0;

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2>Manage Recipes</h2>
          <p className="muted small">{recipes.length} recipes</p>
        </div>
        <Link className="btn btn-primary" to="/admin/recipes/add">+ Add Recipe</Link>
      </div>

      <AdminPanel>
        <div className="admin-toolbar" style={{ marginBottom: 14 }}>
          <input
            type="text"
            className="form-control"
            placeholder="🔍  Search by name, cuisine or category…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Recipe</th>
                <th>Cuisine</th>
                <th>Rating</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.length === 0 ? (
                <tr><td colSpan={6} className="text-center muted">No recipes found.</td></tr>
              ) : (
                recipes.map((r) => {
                  const rating = fbGetRecipeRating(r.id);
                  return (
                    <tr key={r.id}>
                      <td>
                        <img className="recipe-thumb" src={r.image} alt="" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
                      </td>
                      <td>
                        <strong>{r.name}</strong><br />
                        <span className="muted small">{r.authorName || 'Admin'}</span>
                      </td>
                      <td>{r.cuisine}<br /><span className="muted small">{r.category}</span></td>
                      <td>{rating.count ? `★ ${rating.avg.toFixed(1)}` : '—'}</td>
                      <td>{fbFormatDate(r.createdAt)}</td>
                      <td>
                        <div className="row-actions-cell">
                          <button className="icon-btn" onClick={() => setViewing(r)}>View</button>
                          <button className="icon-btn" onClick={() => navigate(`/admin/recipes/edit/${r.id}`)}>Edit</button>
                          <button className="icon-btn danger" onClick={() => setPendingDelete(r)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      {viewing && (
        <Modal title={viewing.name} onClose={() => setViewing(null)} width={640}>
          <img
            src={viewing.image}
            alt=""
            style={{ width: '100%', borderRadius: 12, maxHeight: 220, objectFit: 'cover', marginBottom: 14 }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <p className="small muted">{viewing.description}</p>
          <div className="detail-badges mt-1">
            <span className="badge badge-cuisine">{viewing.cuisine}</span>
            <span className="badge">{viewing.category}</span>
            <span className="badge badge-diet">{viewing.dietaryPreference}</span>
            <span className="badge badge-diff">{viewing.difficulty}</span>
            <span className="badge badge-time">⏱ {total} min total · {viewing.servings} servings</span>
            <span className="badge">{rt.count ? `★ ${rt.avg.toFixed(1)} (${rt.count})` : 'No ratings'}</span>
          </div>

          <h4 className="mt-2">Ingredients</h4>
          <div className="ing-list">
            {(viewing.ingredients || []).map((i, idx) => (
              <div className="ing-item" key={idx}>
                <span>{i.name}</span>
                <span className="qty">{i.quantity} {i.unit}</span>
              </div>
            ))}
          </div>

          <h4 className="mt-2">Instructions</h4>
          <div className="step-list">
            {(viewing.instructions || []).map((s, idx) => <div className="step-item" key={idx}>{s}</div>)}
          </div>

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={() => setViewing(null)}>Close</button>
          </div>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete Recipe"
          message="Delete this recipe permanently? Reviews and saved links will also be removed."
          confirmText="Delete"
          danger
          onConfirm={onDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
