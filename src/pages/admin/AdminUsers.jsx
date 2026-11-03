/* ============================================================
   CraveCart Admin - AdminUsers.jsx
   Ported from legacy js/admin.js fbInitAdminUsers(): searchable
   user table, Info modal and delete (recipes/reviews remain but
   lose the author link, exactly like the original).
   ============================================================ */

import React, { useState } from 'react';
import { AdminPanel } from '../../components/AdminLayout.jsx';
import { Modal } from '../../components/ConfirmModal.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getUsers, getRecipes } from '../../services/storageService.js';
import { getData, saveData, LS_KEYS, fbFormatDate } from '../../services/storageCore.js';

export default function AdminUsers() {
  const toast = useToast();
  const [, force] = useState(0);
  const [q, setQ] = useState('');
  const [viewing, setViewing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const term = q.trim().toLowerCase();
  const users = getUsers().filter((u) => {
    if (!term) return true;
    return u.name.toLowerCase().indexOf(term) !== -1 || u.email.toLowerCase().indexOf(term) !== -1;
  });

  const recipes = getRecipes();
  const collections = getData(LS_KEYS.COLLECTIONS) || [];

  const onDelete = () => {
    saveData(LS_KEYS.USERS, getUsers().filter((x) => x.id !== pendingDelete.id));
    toast('User deleted', 'info');
    setPendingDelete(null);
    force((n) => n + 1);
  };

  const created = viewing ? recipes.filter((r) => r.author === viewing.id) : [];
  const cols = viewing ? collections.filter((c) => c.userId === viewing.id) : [];

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2>Manage Users</h2>
          <p className="muted small">{users.length} users</p>
        </div>
      </div>

      <AdminPanel>
        <div className="admin-toolbar" style={{ marginBottom: 14 }}>
          <input
            type="text"
            className="form-control"
            placeholder="🔍  Search by name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Saved</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="text-center muted">No users found.</td></tr>
              ) : (
                users.map((u) => {
                  const savedCount = (u.savedRecipes || []).length;
                  const createdCount = recipes.filter((r) => r.author === u.id).length;
                  const collCount = collections.filter((c) => c.userId === u.id).length;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="mini-item" style={{ border: 'none', padding: 0 }}>
                          <div className="mini-avatar">{(u.name || 'U').charAt(0).toUpperCase()}</div>
                          <div><div className="mi-name">{u.name}</div></div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{fbFormatDate(u.createdAt)}</td>
                      <td>{savedCount}</td>
                      <td>
                        {createdCount}
                        {collCount ? <span className="muted small"> (+{collCount} coll.)</span> : null}
                      </td>
                      <td>
                        <div className="row-actions-cell">
                          <button className="icon-btn" onClick={() => setViewing(u)}>Info</button>
                          <button className="icon-btn danger" onClick={() => setPendingDelete(u)}>Delete</button>
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
        <Modal title="User Details" onClose={() => setViewing(null)}>
          <p><strong>{viewing.name}</strong><br />{viewing.email}</p>
          <p className="small muted">Account created: {fbFormatDate(viewing.createdAt)}</p>
          <p className="small">Saved recipes: {(viewing.savedRecipes || []).length}</p>
          <p className="small">
            Created recipes: {created.length}
            {created.length > 0 && <><br /><span className="small muted">{created.map((r) => r.name).join(', ')}</span></>}
          </p>
          <p className="small">
            Collections: {cols.length}
            {cols.length > 0 && <><br /><span className="small muted">{cols.map((c) => c.name).join(', ')}</span></>}
          </p>
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={() => setViewing(null)}>Close</button>
          </div>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete User"
          message={`Delete "${pendingDelete.name}"? Their recipes and reviews will remain but lose the author link.`}
          confirmText="Delete"
          danger
          onConfirm={onDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
