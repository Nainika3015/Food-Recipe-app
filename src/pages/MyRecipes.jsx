/* ============================================================
   CraveCart - MyRecipes.jsx
   The user's own recipes (legacy my-recipes.html): recipe rows
   with View / Edit / Delete. Delete uses the exact cascade from
   the legacy recipes.js (saved, created lists, reviews, collections).
   ============================================================ */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout.jsx';
import RecipeForm from '../components/RecipeForm.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { Modal } from '../components/ConfirmModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getRecipes, deleteRecipeCascade } from '../services/storageService.js';
import { fbGetRecipeRating } from '../services/storageCore.js';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';

export default function MyRecipes() {
  const { user, refreshSession } = useAuth();
  const toast = useToast();
  const [, force] = useState(0);

  const [editing, setEditing] = useState(null);       /* recipe object in edit modal */
  const [pendingDelete, setPendingDelete] = useState(null);

  const recipes = getRecipes().filter((r) => r.author === user.id);

  const onDelete = () => {
    deleteRecipeCascade(pendingDelete.id);
    refreshSession();
    toast('Recipe deleted', 'info');
    setPendingDelete(null);
    force((n) => n + 1);
  };

  return (
    <UserLayout>
      <div className="page-head">
        <div className="container">
          <h1>📝 My Recipes</h1>
          <p className="sub">Recipes you have published on CraveCart ({recipes.length}).</p>
        </div>
      </div>

      <div className="container section-pad" style={{ paddingTop: 0 }}>
        {recipes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No recipes yet</h3>
            <p>Share your first recipe with the CraveCart community.</p>
            <Link to="/create" className="btn btn-primary">+ Create Your First Recipe</Link>
          </div>
        ) : (
          <div id="my-recipes-list">
            {recipes.map((r) => {
              const rating = fbGetRecipeRating(r.id);
              return (
                <div className="recipe-row" key={r.id}>
                  <img src={r.image} alt={r.name} onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
                  <div>
                    <div className="row-title">{r.name}</div>
                    <div className="row-sub">
                      {r.cuisine} • {r.category} • {r.cookTime} min •{' '}
                      {rating.count ? `★ ${rating.avg.toFixed(1)} (${rating.count})` : 'No ratings yet'}
                    </div>
                  </div>
                  <div className="row-actions">
                    <Link className="btn btn-ghost btn-sm" to={`/recipe/${r.id}`}>View</Link>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditing(r)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setPendingDelete(r)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* -------- Edit modal (legacy create-recipe.html?edit=id) -------- */}
      {editing && (
        <Modal title="Edit Recipe" onClose={() => setEditing(null)} width={760}>
          <RecipeForm
            recipe={editing}
            onDone={() => { setEditing(null); force((n) => n + 1); }}
          />
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete Recipe"
          message="Are you sure you want to permanently delete this recipe?"
          confirmText="Delete"
          danger
          onConfirm={onDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </UserLayout>
  );
}
