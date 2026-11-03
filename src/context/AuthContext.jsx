/* ============================================================
   CraveCart - AuthContext.jsx
   Centralised session for the ONE shared login system.

   Roles live on each stored account (`role: 'user' | 'admin'`).
   Login never asks which role you are — it resolves the role from
   the authenticated account and redirects accordingly.
   ============================================================ */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  login as svcLogin,
  signup as svcSignup,
  logout as svcLogout,
  getCurrentSession,
  migrateStorage,
  findAccountById
} from '../services/authService.js';
import { LS_KEYS, getData, saveData } from '../services/storageCore.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    /* storageCore.js seeds the classic CraveCart dataset once
       (cravecart_seeded flag, never re-seeding).                                       */
    if (getData(LS_KEYS.CURRENT_USER) === null && !getData(LS_KEYS.USERS)) {
      saveData(LS_KEYS.CURRENT_USER, null);
    }
    migrateStorage();
    setSession(getCurrentSession());
    setReady(true);
  }, []);

  const login = useCallback((email, password) => {
    const result = svcLogin(email, password);
    if (result.ok) {
      setSession({ account: result.user, role: result.role });
    }
    return result;
  }, []);

  const signup = useCallback((payload) => svcSignup(payload), []);

  const logout = useCallback(() => {
    svcLogout();
    setSession(null);
  }, []);

  /* Re-read the session (used after profile edits/admin user deletions) */
  const refreshSession = useCallback(() => {
    const s = getCurrentSession();
    setSession(s ? { ...s } : null);
    return s;
  }, []);

  const updateCurrentUser = useCallback((patch) => {
    const cur = getData(LS_KEYS.CURRENT_USER);
    if (!cur) return null;
    const users = getData(LS_KEYS.USERS) || [];
    const idx = users.findIndex((u) => u.id === cur);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...patch };
    saveData(LS_KEYS.USERS, users);
    setSession({ account: users[idx], role: users[idx].role || 'user' });
    return users[idx];
  }, []);

  const user = session ? session.account : null;

  return (
    <AuthContext.Provider
      value={{ session, ready, user, role: session ? session.role : null, login, signup, logout, refreshSession, updateCurrentUser, findAccountById }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
