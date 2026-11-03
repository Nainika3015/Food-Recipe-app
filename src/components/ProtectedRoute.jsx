/* ============================================================
   CraveCart - ProtectedRoute.jsx
   Generic auth guard: any logged-in session passes through,
   logged-out visitors are bounced to the shared Login page.
   ============================================================ */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { session, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null; /* brief bootstrap while storage is read */

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}
