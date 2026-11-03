/* ============================================================
   CraveCart - Signup.jsx
   THE one shared Signup page for both account types.
   - Account Type selector (User / Admin).
   - Choosing Admin reveals an Authorization Code field
     (`CRAVECART-ADMIN-2026`) — wrong code = rejected registration.
   - The code is never shown as plain text.
   - Layout/classes identical to legacy signup.html (auth-body grid).
   ============================================================ */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { FBC_LOGO_SVG, fbEscape } from '../services/storageCore.js';

export default function Signup() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [f, setF] = useState({ name: '', email: '', password: '', confirmPassword: '', accountType: 'user', adminCode: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.body.classList.add('auth-body');
    return () => document.body.classList.remove('auth-body');
  }, []);

  const set = (k, v) => {
    setF((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const result = signup(f);
    if (!result.ok) {
      setErrors(result.fieldErrors || {});
      return;
    }
    toast('Account created successfully! You can now log in.', 'success');
    navigate('/login');
  };

  const fieldError = (key) =>
    errors[key] ? <div className="field-error" dangerouslySetInnerHTML={{ __html: fbEscape(errors[key]) }} /> : null;

  return (
    <div className="auth-body" style={{ minHeight: '100vh' }}>
      <div className="auth-side">
        <div className="auth-side-inner">
          <div className="auth-logo">
            <span className="auth-logo-icon" dangerouslySetInnerHTML={{ __html: FBC_LOGO_SVG }} />
            <span>Crave<span style={{ color: '#ffe066' }}>Cart</span></span>
          </div>
          <h1>Join the<br />CraveCart Family!</h1>
          <p>Save recipes, build your own collections, publish recipes, and get food inspiration.</p>
          <ul className="auth-features">
            <li><span className="tick">✓</span> Search 60+ curated recipes</li>
            <li><span className="tick">✓</span> Save and organise into collections</li>
            <li><span className="tick">✓</span> Publish your own recipes</li>
          </ul>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <h2>Create Account ✨</h2>
          <p className="auth-sub">One form for both foodies and admins.</p>

          {/* Account Type selector — role is chosen HERE, never at login */}
          <div className="acct-tabs form-group">
            <button type="button" className={f.accountType === 'user' ? 'active' : ''} onClick={() => set('accountType', 'user')}>
              🍽️ I'm a User
            </button>
            <button type="button" className={f.accountType === 'admin' ? 'active' : ''} onClick={() => set('accountType', 'admin')}>
              🛡️ I'm an Admin
            </button>
          </div>

          <form onSubmit={submit} noValidate>
            <div className="form-group">
              <label>Full Name <span className="req">*</span></label>
              <input type="text" className="form-control" placeholder="e.g. Nainika Sharma" value={f.name} onChange={(e) => set('name', e.target.value)} />
              {fieldError('name')}
            </div>

            <div className="form-group">
              <label>Email <span className="req">*</span></label>
              <input type="email" className="form-control" placeholder="you@example.com" autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} />
              {fieldError('email')}
            </div>

            <PasswordInput label={`Password`} value={f.password} onChange={(e) => set('password', e.target.value)} placeholder="Minimum 6 characters" />
            {fieldError('password')}

            <PasswordInput label={`Confirm Password`} value={f.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} placeholder="Repeat the same password" />
            {fieldError('confirmPassword')}

            {f.accountType === 'admin' && (
              <div className="form-group">
                <label>Admin Authorization Code <span className="req">*</span></label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Required for admin accounts"
                  autoComplete="off"
                  value={f.adminCode}
                  onChange={(e) => set('adminCode', e.target.value)}
                />
                <div className="form-hint">Administrator sign-ups require the authorization code issued to your organisation.</div>
                {fieldError('adminCode')}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block">Create Account</button>
          </form>

          <div className="auth-alt">Already have an account? <Link to="/login">Login</Link></div>
          <div className="auth-back"><Link to="/">← Back to Home</Link></div>
        </div>
      </div>
    </div>
  );
}
