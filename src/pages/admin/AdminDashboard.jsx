/* ============================================================
   CraveCart Admin - AdminDashboard.jsx
   Ported from legacy js/admin.js fbInitAdminDashboard():
   five stat cards + recently added recipes, most rated recipes
   and recent users mini-lists.
   ============================================================ */

import React from 'react';
import { Link } from 'react-router-dom';
import { AdminPanel } from '../../components/AdminLayout.jsx';
import { getRecipes, getCategories, getUsers } from '../../services/storageService.js';
import { getData, LS_KEYS, fbGetRecipeRating, fbFormatDate } from '../../services/storageCore.js';

export default function AdminDashboard() {
  const users = getUsers();
  const recipes = getRecipes();
  const categories = getCategories();
  const reviews = getData(LS_KEYS.REVIEWS) || [];
  const savedTotal = users.reduce((sum, u) => sum + (u.savedRecipes || []).length, 0);

  const recent = recipes.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const mostRated = recipes.slice()
    .sort((a, b) => fbGetRecipeRating(b.id).count - fbGetRecipeRating(a.id).count)
    .slice(0, 5);
  const recentUsers = users.slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2>Dashboard</h2>
          <p className="muted small">Overview of the whole CraveCart platform.</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="dash-card">
          <div className="dash-icon">👥</div>
          <div><div className="d-num">{users.length}</div><div className="d-lbl">Total Users</div></div>
        </div>
        <div className="dash-card">
          <div className="dash-icon">🍲</div>
          <div><div className="d-num">{recipes.length}</div><div className="d-lbl">Total Recipes</div></div>
        </div>
        <div className="dash-card">
          <div className="dash-icon">🏷️</div>
          <div><div className="d-num">{categories.length}</div><div className="d-lbl">Categories</div></div>
        </div>
        <div className="dash-card">
          <div className="dash-icon">⭐</div>
          <div><div className="d-num">{reviews.length}</div><div className="d-lbl">Reviews</div></div>
        </div>
        <div className="dash-card">
          <div className="dash-icon">🔖</div>
          <div><div className="d-num">{savedTotal}</div><div className="d-lbl">Saved Recipes</div></div>
        </div>
      </div>

      <div className="dash-grid">
        <AdminPanel>
          <h2>Recently Added Recipes <Link className="btn btn-ghost btn-sm" to="/admin/recipes">Manage →</Link></h2>
          {recent.map((r) => (
            <div className="mini-item" key={r.id}>
              <img src={r.image} alt="" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
              <div>
                <div className="mi-name">{r.name}</div>
                <div className="mi-sub">{r.cuisine} · {r.category}</div>
              </div>
              <div className="mi-right">{fbFormatDate(r.createdAt)}</div>
            </div>
          ))}
        </AdminPanel>

        <AdminPanel>
          <h2>Most Rated Recipes <Link className="btn btn-ghost btn-sm" to="/admin/reviews">Reviews →</Link></h2>
          {mostRated.map((r) => {
            const rt = fbGetRecipeRating(r.id);
            return (
              <div className="mini-item" key={r.id}>
                <div className="mini-avatar">🍳</div>
                <div>
                  <div className="mi-name">{r.name}</div>
                  <div className="mi-sub">{rt.count ? `★ ${rt.avg.toFixed(1)} avg` : 'No ratings yet'}</div>
                </div>
                <div className="mi-right">{rt.count} rating{rt.count === 1 ? '' : 's'}</div>
              </div>
            );
          })}
        </AdminPanel>

        <AdminPanel>
          <h2>Recent Users <Link className="btn btn-ghost btn-sm" to="/admin/users">Manage →</Link></h2>
          {recentUsers.map((u) => (
            <div className="mini-item" key={u.id}>
              <div className="mini-avatar">{(u.name || 'U').charAt(0).toUpperCase()}</div>
              <div>
                <div className="mi-name">{u.name}</div>
                <div className="mi-sub">{u.email}</div>
              </div>
              <div className="mi-right">{fbFormatDate(u.createdAt)}</div>
            </div>
          ))}
        </AdminPanel>
      </div>
    </>
  );
}
