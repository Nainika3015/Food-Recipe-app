/* ============================================================
   CraveCart - AdminRoute.jsx
   Guard for ADMIN-module routes.
   - Logged-out              -> shared Login page
   - User sessions           -> User Home (users never see admin pages)
   - Admin sessions          -> allowed
   ============================================================ */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminRoute({ children }) {
  const { session, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null;

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (session.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}
