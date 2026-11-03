/* ============================================================
   CraveCart - Collections.jsx
   Personal Collections CRUD, ported from legacy js/collections.js:
   collection cards -> detail view with recipe rows, create/rename
   modals and confirm-delete (recipes themselves are untouched).
   ============================================================ */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getRecipes, getUserCollections } from '../services/storageService.js';
import { getData, saveData, LS_KEYS, fbGetRecipeRating, fbGenerateId, fbGetToday } from '../services/storageCore.js';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';

export default function Collections() {
  const { user } = useAuth();
  const toast = useToast();
  const [, force] = useState(0);

  /* view: 'grid' | 'detail' */
  const [view, setView] = useState({ view: 'grid' });
  const [modal, setModal] = useState(null);            /* 'create' | renameColId | null */
  const [confirmCol, setConfirmCol] = useState(null);  /* collection pending delete */
  const [nameInput, setNameInput] = useState('');

  const cols = getUserCollections(user.id);
  const reRender = () => force((n) => n + 1);

  const createCollection = () => {
    const name = nameInput.trim();
    if (!name) { toast('Please enter a collection name', 'error'); return; }
    const all = getData(LS_KEYS.COLLECTIONS) || [];
    all.push({ id: fbGenerateId('coll'), name, userId: user.id, recipeIds: [], createdAt: fbGetToday() });
    saveData(LS_KEYS.COLLECTIONS, all);
    setModal(null); setNameInput('');
    toast(`Collection "${name}" created`, 'success');
    reRender();
  };

  const renameCollection = (colId) => {
    const name = nameInput.trim();
    if (!name) { toast('Please enter a collection name', 'error'); return; }
    const all = getData(LS_KEYS.COLLECTIONS) || [];
    const idx = all.findIndex((c) => c.id === colId);
    if (idx !== -1) { all[idx].name = name; saveData(LS_KEYS.COLLECTIONS, all); }
    setModal(null); setNameInput('');
    toast('Collection renamed', 'success');
    reRender();
  };

  const deleteCollection = () => {
    saveData(LS_KEYS.COLLECTIONS, (getData(LS_KEYS.COLLECTIONS) || []).filter((c) => c.id !== confirmCol.id));
    toast('Collection deleted', 'info');
    setConfirmCol(null);
    reRender();
  };

  const removeFromCol = (colId, rid) => {
    const all = getData(LS_KEYS.COLLECTIONS) || [];
    const idx = all.findIndex((c) => c.id === colId);
    if (idx !== -1) {
      all[idx].recipeIds = (all[idx].recipeIds || []).filter((x) => x !== rid);
      saveData(LS_KEYS.COLLECTIONS, all);
      toast('Recipe removed from collection', 'info');
      reRender();
    }
  };

  /* ---------------- Detail view ---------------- */
  if (view.view === 'detail') {
    const col = (getData(LS_KEYS.COLLECTIONS) || []).find((c) => c.id === view.colId);
    if (!col) { setView({ view: 'grid' }); return null; }

    const recipes = getRecipes().filter((r) => (col.recipeIds || []).indexOf(r.id) !== -1);
    return (
      <UserLayout>
        <div className="container section-pad">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <h2 className="section-title" style={{ margin: 0 }}>{col.name}</h2>
            <span className="muted small">{(col.recipeIds || []).length} recipes</span>
            <button className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => setView({ view: 'grid' })}>
              ← All Collections
            </button>
          </div>

          {recipes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <h3>This collection is empty</h3>
              <p>Open a recipe and use "Add to Collection" to fill it.</p>
              <Link to="/explore" className="btn btn-primary">Explore Recipes</Link>
            </div>
          ) : (
            <div id="collection-recipes">
              {recipes.map((r) => {
                const rating = fbGetRecipeRating(r.id);
                return (
                  <div className="recipe-row" key={r.id}>
                    <img src={r.image} alt={r.name} onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
                    <div>
                      <div className="row-title"><Link to={`/recipe/${r.id}`}>{r.name}</Link></div>
                      <div className="row-sub">{r.cuisine} • {r.category} • {rating.count ? `★ ${rating.avg.toFixed(1)}` : 'No ratings'}</div>
                    </div>
                    <div className="row-actions">
                      <Link className="btn btn-ghost btn-sm" to={`/recipe/${r.id}`}>View</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => removeFromCol(col.id, r.id)}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </UserLayout>
    );
  }

  /* ---------------- Grid view ---------------- */
  return (
    <UserLayout>
      <div className="page-head">
        <div className="container">
          <h1>📁 My Collections</h1>
          <p className="sub">Group recipes into themed collections like "Weekend Dinners" or "Party Snacks".</p>
        </div>
      </div>

      <div className="container section-pad" style={{ paddingTop: 0 }}>
        <div className="collections-grid" id="collections-grid">
          {cols.map((col) => (
            <div className="collection-card" key={col.id}>
              <div className="col-icon">📁</div>
              <h3>{col.name}</h3>
              <div className="col-count">{(col.recipeIds || []).length} recipes</div>
              <div className="col-actions">
                <button className="btn btn-primary btn-sm" onClick={() => setView({ view: 'detail', colId: col.id })}>View</button>
                <button className="btn btn-outline btn-sm" onClick={() => { setNameInput(col.name); setModal(col.id); }}>Rename</button>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmCol(col)}>Delete</button>
              </div>
            </div>
          ))}
          <div className="collection-card add-coll-card" id="new-collection-card" onClick={() => { setNameInput(''); setModal('create'); }}>
            ＋<br />Create New Collection
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay open" id="fb-coll-modal" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal-box">
            <div className="modal-head">
              <h3>{modal === 'create' ? 'Create New Collection' : 'Rename Collection'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>&times;</button>
            </div>
            <div className="form-group">
              <label>Collection Name <span className="req">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Weekend Recipes"
                maxLength={40}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => (modal === 'create' ? createCollection() : renameCollection(modal))}>
                {modal === 'create' ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmCol && (
        <ConfirmModal
          title="Delete Collection"
          message="This will delete the collection. Saved recipes themselves are not deleted. Continue?"
          confirmText="Delete"
          danger
          onConfirm={deleteCollection}
          onCancel={() => setConfirmCol(null)}
        />
      )}
    </UserLayout>
  );
}
