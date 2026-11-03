/* ============================================================
   CraveCart - AdminLayout.jsx
   Admin module shell — identical sidebar/topbar to the legacy
   admin pages, labelled "CraveCart Admin Module".
   ============================================================ */

import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { FBC_LOGO_SVG } from '../services/storageCore.js';

const ADMIN_LINKS = [
  { to: '/admin', icon: '📊', label: 'Dashboard', end: true },
  { to: '/admin/recipes', icon: '🍲', label: 'Manage Recipes' },
  { to: '/admin/users', icon: '👥', label: 'Manage Users' },
  { to: '/admin/categories', icon: '🏷️', label: 'Manage Categories' },
  { to: '/admin/reviews', icon: '⭐', label: 'Manage Reviews' }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  /* Legacy admin pages used `body.admin-body` for their dark styling. */
  useEffect(() => {
    document.body.classList.add('admin-body');
    return () => document.body.classList.remove('admin-body');
  }, []);

  const handleLogout = () => {
    logout();
    toast('Admin session ended. You have been logged out.', 'info');
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        <div className="admin-logo">
          <span dangerouslySetInnerHTML={{ __html: FBC_LOGO_SVG }} /> <span className="logo-text">Crave<span>Cart</span></span>
        </div>
        <nav className="admin-nav" onClick={() => setOpen(false)}>
          {ADMIN_LINKS.map((l) => (
            <NavLink key={l.label} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="nav-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <nav className="admin-nav" style={{ flex: "0 0 auto" }}>
          <Link to="/"><span className="nav-icon">🌐</span> View User Site</Link>
        </nav>
        <button className="btn btn-danger btn-sm btn-block admin-exit" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <div className="sub">Signed in as {user ? user.email : 'admin'}</div>
          </div>
          <div className="admin-top-actions">
            <button className="admin-burger" onClick={() => setOpen(true)}>☰</button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export function AdminPanel({ title, children }) {
  return <div className="admin-panel">{children}</div>;
}

export function AdminDivider({ label }) {
  return <div className="admin-divider">{label}</div>;
}
