/* ============================================================
   CraveCart - Login.jsx
   THE one shared Login page for both User and Admin modules.
   - No role selector of any kind.
   - The role comes from the authenticated account record in
     Local Storage and decides the destination:
       user  -> /       (User Home)
       admin -> /admin  (Admin Dashboard)
   - Layout/classes identical to legacy login.html (auth-body grid).
   ============================================================ */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FBC_LOGO_SVG, fbEscape } from '../services/storageCore.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', form: '' });

  useEffect(() => {
    document.body.classList.add('auth-body');
    return () => document.body.classList.remove('auth-body');
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const errs = { email: '', password: '', form: '' };
    if (!email.trim()) errs.email = 'Please enter your email.';
    if (!password) errs.password = 'Please enter your password.';
    setErrors(errs);
    if (errs.email || errs.password) return;

    const result = login(email.trim().toLowerCase(), password);
    if (!result.ok) {
      setErrors({ email: '', password: '', form: result.error || 'Login failed. Check your credentials and try again.' });
      return;
    }
    /* role detected from the account record decides the destination */
    const from = location.state && location.state.from;
    if (result.role === 'admin') navigate('/admin', { replace: true });
    else navigate(from && from.startsWith('/') ? from : '/', { replace: true });
  };

  return (
    <div className="auth-body" style={{ minHeight: '100vh' }}>
      <div className="auth-side">
        <div className="auth-side-inner">
          <div className="auth-logo">
            <span className="auth-logo-icon" dangerouslySetInnerHTML={{ __html: FBC_LOGO_SVG }} />
            <span>Crave<span style={{ color: '#ffe066' }}>Cart</span></span>
          </div>
          <h1>Welcome Back,<br />Food Lover!</h1>
          <p>Your saved recipes, collections and kitchen inspirations are waiting for you.</p>
          <ul className="auth-features">
            <li><span className="tick">✓</span> Pick up where you left off</li>
            <li><span className="tick">✓</span> Your collections, ready to cook</li>
            <li><span className="tick">✓</span> Rate the dishes you tried</li>
          </ul>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <h2>Login 👋</h2>
          <p className="auth-sub">Enter your credentials to continue.</p>

          <form onSubmit={submit} noValidate>
            <div className="form-group">
              <label>Email <span className="req">*</span></label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <div className="field-error" dangerouslySetInnerHTML={{ __html: fbEscape(errors.email) }} />}
            </div>

            <div className="form-group">
              <label>Password <span className="req">*</span></label>
              <input
                type="password"
                className="form-control"
                placeholder="Your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <div className="field-error" dangerouslySetInnerHTML={{ __html: fbEscape(errors.password) }} />}
            </div>

            {errors.form && (
              <div className="field-error" style={{ marginBottom: 12 }} dangerouslySetInnerHTML={{ __html: fbEscape(errors.form) }} />
            )}

            <button type="submit" className="btn btn-primary btn-block">Login</button>
          </form>

          <p className="auth-alt">New to CraveCart? <Link to="/signup">Create an account</Link></p>

          <div className="auth-demo-note">
            <strong>🔑 Demo User Accounts</strong>
            Nainika — nainika@cravecart.com / demo123<br />
            Alisha — alisha@cravecart.com / demo123<br />
            Swaroopa — swaroopa@cravecart.com / demo123
          </div>
          <div className="auth-demo-note" style={{ marginTop: 8 }}>
            <strong>🛡️ Admin Account</strong><br />
            admin@cravecart.com / admin123
          </div>
          <div className="auth-back"><Link to="/">← Back to Home</Link></div>
        </div>
      </div>
    </div>
  );
}
