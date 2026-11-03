/* ============================================================
   CraveCart Admin - AdminCategories.jsx
   Ported from legacy js/admin.js fbInitAdminCategories():
   category cards with counts, add/edit modal with duplicate-name
   check, and delete confirm (recipe data is left untouched).
   ============================================================ */

import React, { useState } from 'react';
import { AdminPanel } from '../../components/AdminLayout.jsx';
import { Modal } from '../../components/ConfirmModal.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getCategories, getRecipes, catIcon, countCategoryRecipes } from '../../services/storageService.js';
import { getData, saveData, LS_KEYS, fbGenerateId, fbGetToday, fbFormatDate } from '../../services/storageCore.js';

export default function AdminCategories() {
  const toast = useToast();
  const [, force] = useState(0);
  const [modal, setModal] = useState(null);      /* null | { cat } | 'create' */
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const categories = getCategories();
  const recipes = getRecipes();

  const openCreate = () => { setNameInput(''); setDescInput(''); setModal('create'); };
  const openEdit = (cat) => { setNameInput(cat.name); setDescInput(cat.description || ''); setModal({ cat }); };

  const save = () => {
    const name = nameInput.trim();
    const desc = descInput.trim();
    if (!name) { toast('Category name is required', 'error'); return; }

    const all = getData(LS_KEYS.CATEGORIES) || [];
    const editing = modal && modal !== 'create' ? modal.cat : null;

    if (all.some((c) => c.name.toLowerCase() === name.toLowerCase() && (!editing || c.id !== editing.id))) {
      toast('A category with this name already exists', 'error');
      return;
    }

    if (editing) {
      const idx = all.findIndex((c) => c.id === editing.id);
      all[idx].name = name;
      all[idx].description = desc;
      saveData(LS_KEYS.CATEGORIES, all);
      toast('Category updated', 'success');
    } else {
      all.push({ id: fbGenerateId('cat'), name, description: desc, createdAt: fbGetToday() });
      saveData(LS_KEYS.CATEGORIES, all);
      toast('Category added', 'success');
    }
    setModal(null);
    force((n) => n + 1);
  };

  const onDelete = () => {
    saveData(LS_KEYS.CATEGORIES, getCategories().filter((c) => c.id !== pendingDelete.id));
    toast('Category deleted', 'info');
    setPendingDelete(null);
    force((n) => n + 1);
  };

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2>Manage Categories</h2>
          <p className="muted small">{categories.length} categories</p>
        </div>
      </div>

      <div className="cats-admin-grid" id="admin-cats-grid">
        {categories.map((c) => {
          const count = countCategoryRecipes(c, recipes);
          return (
            <div className="cat-admin-card" key={c.id}>
              <div className="c-icon">{catIcon(c.name)}</div>
              <h3>{c.name}</h3>
              <p>{c.description || ''}</p>
              <div className="c-meta">{count} recipe{count === 1 ? '' : 's'} · added {fbFormatDate(c.createdAt || fbGetToday())}</div>
              <div className="c-actions">
                <button className="icon-btn" onClick={() => openEdit(c)}>Edit</button>
                <button className="icon-btn danger" onClick={() => setPendingDelete(c)}>Delete</button>
              </div>
            </div>
          );
        })}
        <div className="cat-admin-card add-coll-card" onClick={openCreate}>
          ＋<br />Add Category
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'create' ? 'Add Category' : 'Edit Category'} onClose={() => setModal(null)}>
          <div className="form-group">
            <label>Category Name <span className="req">*</span></label>
            <input
              type="text"
              className="form-control"
              maxLength={30}
              placeholder="e.g. Seafood"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              className="form-control"
              maxLength={80}
              placeholder="Short description (optional)"
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>{modal === 'create' ? 'Add Category' : 'Save Changes'}</button>
          </div>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete Category"
          message={`Delete category "${pendingDelete.name}"? Recipes keep their category value but it will no longer appear in chips.`}
          confirmText="Delete"
          danger
          onConfirm={onDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
