/* ============================================================
   CraveCart - PublicOnlyRoute.jsx
   Login/Signup are the only public pages. A visitor that is
   already logged in is sent straight to their own module home.
   ============================================================ */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function PublicOnlyRoute({ children }) {
  const { session, ready } = useAuth();

  if (!ready) return null;

  if (session) {
    return <Navigate to={session.role === 'admin' ? '/admin' : '/'} replace />;
  }
  return children;
}
