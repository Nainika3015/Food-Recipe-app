/* ============================================================
   CraveCart - UserRoute.jsx
   Guard for USER-module routes.
   - Logged-out        -> shared Login page
   - Admin sessions    -> Admin Dashboard (admins never see user pages)
   - User sessions     -> allowed
   ============================================================ */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function UserRoute({ children }) {
  const { session, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null;

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (session.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
}
