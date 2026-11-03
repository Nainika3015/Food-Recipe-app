/* ============================================================
   CraveCart - Footer.jsx (same classes/structure as legacy)
   ============================================================ */

import React from 'react';
import { Link } from 'react-router-dom';
import { FBC_LOGO_SVG } from '../services/storageCore.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ color: '#fff' }}>
              <span className="logo-icon" dangerouslySetInnerHTML={{ __html: FBC_LOGO_SVG }} />
              <span className="logo-text">Crave<span style={{ color: 'var(--accent)' }}>Cart</span></span>
            </div>
            <p className="small mt-1" style={{ color: '#9a9aa5', maxWidth: 300 }}>
              Discover. Create. Crave. — Search, save, cook and share your favourite recipes.
            </p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/explore">Explore Recipes</Link>
            <Link to="/collections">Collections</Link>
            <Link to="/create">Create Recipe</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
            <Link to="/admin">Admin</Link>
          </div>
        </div>
        <div className="footer-bottom">© 2026 CraveCart – Food Recipe &amp; Meal Planning App. Built with React + Vite.</div>
      </div>
    </footer>
  );
}
