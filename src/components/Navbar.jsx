/* ============================================================
   CraveCart - Navbar.jsx
   User-module navbar (same layout/classes as the legacy app),
   labelled "CraveCart User Module".
   ============================================================ */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { FBC_LOGO_SVG } from '../services/storageCore.js';

const LINKS = [
  { to: '/', label: 'Home', active: (loc) => loc.pathname === '/' && !loc.hash },
  { to: '/explore', label: 'Explore', active: (loc) => loc.pathname.startsWith('/explore') },
  { to: '/#categories', label: 'Categories', active: (loc) => loc.hash === '#categories' },
  { to: '/saved', label: 'Saved', active: (loc) => loc.pathname.startsWith('/saved') },
  { to: '/collections', label: 'Collections', active: (loc) => loc.pathname.startsWith('/collections') },
  { to: '/create', label: 'Create Recipe', active: (loc) => loc.pathname.startsWith('/create') },
  { to: '/my-recipes', label: 'My Recipes', active: (loc) => loc.pathname.startsWith('/my-recipes') },
  { to: '/profile', label: 'Profile', active: (loc) => loc.pathname.startsWith('/profile') }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast('You have been logged out. See you soon!', 'info');
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo">
          <span className="logo-icon" dangerouslySetInnerHTML={{ __html: FBC_LOGO_SVG }} />
          <span className="logo-text">Crave<span>Cart</span></span>
        </Link>
        <nav className={`nav-links${open ? ' open' : ''}`} onClick={() => setOpen(false)}>
          {LINKS.map((l) => (
            <Link key={l.label} to={l.to} className={l.active(location) ? 'active' : ''}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="nav-user">
          {user ? (
            <div className="nav-user-row">
              <Link to="/profile" className="nav-user-chip">
                <span className="avatar">{(user.name || 'U').charAt(0).toUpperCase()}</span>
                <span>{user.name}</span>
              </Link>
              <button className="nav-logout" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="nav-user-row">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
          <button className="nav-toggle" aria-label="Menu" onClick={() => setOpen((o) => !o)}>☰</button>
        </div>
      </div>
    </header>
  );
}
