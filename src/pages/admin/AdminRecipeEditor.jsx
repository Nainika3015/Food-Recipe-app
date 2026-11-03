/* ============================================================
   CraveCart Admin - AdminRecipeEditor.jsx
   Add / Edit recipe inside the admin shell, reusing the shared
   RecipeForm (isAdminSubmit flags the author as CraveCart Admin).
   ============================================================ */

import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AdminPanel } from '../../components/AdminLayout.jsx';
import RecipeForm from '../../components/RecipeForm.jsx';
import { fbGetRecipeById } from '../../services/storageCore.js';

export function AdminRecipeAdd() {
  const navigate = useNavigate();
  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2>Add Recipe</h2>
          <p className="muted small">Publish a new recipe to the CraveCart catalogue.</p>
        </div>
        <Link className="btn btn-ghost" to="/admin/recipes">← Back to Recipes</Link>
      </div>
      <AdminPanel>
        <RecipeForm onDone={() => navigate('/admin/recipes')} isAdminSubmit />
      </AdminPanel>
    </>
  );
}

export function AdminRecipeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipe = fbGetRecipeById(id);

  if (!recipe) {
    return (
      <>
        <div className="admin-toolbar">
          <h2>Edit Recipe</h2>
          <Link className="btn btn-ghost" to="/admin/recipes">← Back to Recipes</Link>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🥄</div>
          <h3>Recipe not found</h3>
          <p>This recipe may have been deleted.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2>Edit Recipe</h2>
          <p className="muted small">{recipe.name}</p>
        </div>
        <Link className="btn btn-ghost" to="/admin/recipes">← Back to Recipes</Link>
      </div>
      <AdminPanel>
        <RecipeForm recipe={recipe} onDone={() => navigate('/admin/recipes')} isAdminSubmit />
      </AdminPanel>
    </>
  );
}
