/* ============================================================
   CraveCart - Saved.jsx
   My Saved Recipes page, ported from legacy js/collections.js:
   grid of saved cards; un-saving removes the card after the
   same 350 ms re-render cadence as the original.
   ============================================================ */

import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout.jsx';
import RecipeCard from '../components/RecipeCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getRecipes, getSavedIds, toggleSaved } from '../services/storageService.js';

export default function Saved() {
  const { user, refreshSession } = useAuth();
  const toast = useToast();
  const [, force] = useState(0);

  const savedIds = getSavedIds(user.id);
  const recipes = getRecipes().filter((r) => savedIds.indexOf(r.id) !== -1);

  /* After un-saving, re-render so the card disappears (legacy 350 ms) */
  const onToggleSave = useCallback(
    (id) => {
      const nowSaved = toggleSaved(id, user.id);
      refreshSession();
      toast(nowSaved ? 'Recipe saved to your collection' : 'Recipe removed from saved', nowSaved ? 'success' : 'info');
      if (!nowSaved) setTimeout(() => force((n) => n + 1), 350);
      else force((n) => n + 1);
    },
    [user.id] // eslint-disable-line
  );

  return (
    <UserLayout>
      <div className="page-head">
        <div className="container">
          <h1>🔖 My Saved Recipes</h1>
          <p className="sub">All the recipes you bookmarked, ready for your next cooking session. ({recipes.length} saved)</p>
        </div>
      </div>

      <div className="container section-pad" style={{ paddingTop: 0 }}>
        {recipes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔖</div>
            <h3>No saved recipes yet</h3>
            <p>Browse recipes and tap the heart to save them here.</p>
            <Link to="/explore" className="btn btn-primary">Explore Recipes</Link>
          </div>
        ) : (
          <div className="recipe-grid" id="saved-grid">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} saved onToggleSave={() => onToggleSave(r.id)} />
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
