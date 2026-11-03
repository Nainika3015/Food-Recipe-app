/* ============================================================
   CraveCart - Profile.jsx
   Profile card + stats + name edit, ported from legacy
   js/auth.js fbInitProfilePage. Renaming also syncs the
   authorName on the user's recipes and userName on reviews.
   ============================================================ */

import React, { useState } from 'react';
import UserLayout from '../components/UserLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getRecipes, getUserCollections } from '../services/storageService.js';
import { getData, saveData, LS_KEYS, fbFormatDate } from '../services/storageCore.js';

export default function Profile() {
  const { user, updateCurrentUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user.name || '');
  const [, force] = useState(0);

  const recipes = getRecipes();
  const savedCount = (user.savedRecipes || []).length;
  const createdCount = recipes.filter((r) => r.author === user.id).length;
  const collCount = getUserCollections(user.id).length;

  const submit = (e) => {
    e.preventDefault();
    const newName = name.trim();
    if (!newName) { toast('Name cannot be empty', 'error'); return; }
    if (newName.length < 2) { toast('Name must be at least 2 characters', 'error'); return; }

    updateCurrentUser({ name: newName });

    /* Keep author names on this user's recipes in sync */
    const all = getRecipes();
    let changed = false;
    all.forEach((r) => {
      if (r.author === user.id) { r.authorName = newName; changed = true; }
    });
    if (changed) saveData(LS_KEYS.RECIPES, all);

    /* Keep review names in sync */
    const reviews = getData(LS_KEYS.REVIEWS) || [];
    let rChanged = false;
    reviews.forEach((rv) => {
      if (rv.userId === user.id) { rv.userName = newName; rChanged = true; }
    });
    if (rChanged) saveData(LS_KEYS.REVIEWS, reviews);

    toast('Profile updated successfully!', 'success');
    force((n) => n + 1);
  };

  return (
    <UserLayout>
      <div className="page-head">
        <div className="container">
          <h1>👤 My Profile</h1>
          <p className="sub">Manage your CraveCart account details.</p>
        </div>
      </div>

      <div className="container section-pad" style={{ paddingTop: 0 }}>
        <div className="profile-layout">
          {/* Left card */}
          <div className="profile-card">
            <div className="profile-avatar">{(user.name || 'U').charAt(0).toUpperCase()}</div>
            <h2>{user.name}</h2>
            <p className="p-email">{user.email}</p>
            <p className="small muted">Member since {fbFormatDate(user.createdAt)}</p>
          </div>

          {/* Right content */}
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🔖</div>
                <div className="stat-num">{savedCount}</div>
                <div className="stat-lbl">Saved Recipes</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📖</div>
                <div className="stat-num">{createdCount}</div>
                <div className="stat-lbl">Created Recipes</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📁</div>
                <div className="stat-num">{collCount}</div>
                <div className="stat-lbl">Collections</div>
              </div>
            </div>

            <div className="form-card" style={{ maxWidth: 'none' }}>
              <h3 style={{ marginBottom: 16 }}>✏️ Edit Profile</h3>
              <form onSubmit={submit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    maxLength={60}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Email (read-only)</label>
                  <input type="email" className="form-control" value={user.email} disabled readOnly />
                </div>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
