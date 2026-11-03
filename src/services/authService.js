/* ============================================================
   CraveCart - authService.js
   Email/password authentication for User and Admin roles.

   Fully client-side demo authentication: credentials and roles
   live in Local Storage (cravecart_users). This is fine for an
   academic demo — it is NOT secure for production; never ship
   real credentials that way.
   ============================================================ */

import {
  LS_KEYS,
  fbGenerateId,
  fbGetToday,
  deleteData
} from './storageCore.js';
import { getData, saveData } from './storageService.js';

/* Admin signup invitation code (demo only — client-side). */
export const ADMIN_AUTH_CODE = 'CRAVECART-ADMIN-2026';
export const MIN_PASSWORD_LENGTH = 6;

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}

/* All registered accounts (users + admins) */
export function getAccounts() {
  return getData(LS_KEYS.USERS) || [];
}

/* Find a registered account by email (emails are stored lowercase) */
export function findAccountByEmail(email) {
  const email_lc = String(email || '').trim().toLowerCase();
  return getAccounts().find((u) => u.email === email_lc) || null;
}

export function findAccountById(id) {
  return getAccounts().find((u) => u.id === id) || null;
}

export function saveAccount(account) {
  const users = getData(LS_KEYS.USERS) || [];
  const idx = users.findIndex((u) => u.id === account.id);
  if (idx === -1) users.push(account);
  else users[idx] = account;
  saveData(LS_KEYS.USERS, users);
  return account;
}

export function deleteAccount(id) {
  saveData(LS_KEYS.USERS, getAccounts().filter((u) => u.id !== id));
}

export function deleteAccounts(ids) {
  saveData(LS_KEYS.USERS, getAccounts().filter((u) => ids.indexOf(u.id) === -1));
}

/* ------------------------------------------------------------------
   LOGIN — one shared entry point for User AND Admin.
   The role is read from the stored account's `role` field; the user
   never picks a role on the login page. Returns { ok, role, user } or
   { ok:false, error }.
------------------------------------------------------------------ */
export function login(email, password) {
  email = String(email || '').trim().toLowerCase();

  if (!email) return { ok: false, error: 'Email is required' };
  if (!password) return { ok: false, error: 'Password is required' };
  if (!isValidEmail(email)) return { ok: false, error: 'Please enter a valid email address' };

  const account = getAccounts().find((u) => u.email === email && u.password === password);
  if (!account) {
    const emailExists = getAccounts().some((u) => u.email === email);
    if (emailExists) {
      return { ok: false, error: 'Invalid email or password' };
    }
    return { ok: false, error: 'No account found with this email. Please sign up first.' };
  }

  /* Persist the session. The legacy cravecart_adminLoggedIn flag is kept
     in sync so the old key semantic (admin session) still works. */
  saveData(LS_KEYS.CURRENT_USER, account.id);
  saveData(LS_KEYS.ADMIN, account.role === 'admin');

  return { ok: true, role: account.role || 'user', user: account };
}

/* ------------------------------------------------------------------
   SIGNUP — one shared entry point for User AND Admin registration.
   `accountType` is 'user' or 'admin'. Admin registrations require the
   authorization code. Returns { ok, account } or
   { ok:false, fieldErrors }.
------------------------------------------------------------------ */
export function signup({ name, email, password, confirmPassword, accountType, adminCode }) {
  name = String(name || '').trim();
  email = String(email || '').trim().toLowerCase();
  accountType = accountType === 'admin' ? 'admin' : 'user';

  const errors = {};
  if (!name) errors.name = 'Full name is required';
  else if (name.length < 2) errors.name = 'Name must be at least 2 characters';

  if (!email) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address';
  else if (findAccountByEmail(email)) errors.email = 'This email is already registered — please log in';

  if (!password) errors.password = 'Password is required';
  else if (password.length < MIN_PASSWORD_LENGTH) errors.password = 'Password must be at least ' + MIN_PASSWORD_LENGTH + ' characters';

  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

  if (accountType === 'admin') {
    if (!adminCode) errors.adminCode = 'Admin authorization code is required';
    else if (adminCode !== ADMIN_AUTH_CODE) errors.adminCode = 'Invalid admin authorization code';
  }

  if (Object.keys(errors).length) {
    return { ok: false, fieldErrors: errors };
  }

  const account = {
    id: fbGenerateId(accountType === 'admin' ? 'admin' : 'user'),
    name,
    email,
    password,
    role: accountType,
    savedRecipes: [],
    collections: [],
    createdRecipes: [],
    createdAt: fbGetToday()
  };
  saveAccount(account);
  return { ok: true, account };
}

/* ------------------------------------------------------------------
   SESSION helpers
------------------------------------------------------------------ */
export function getCurrentSession() {
  const userId = getData(LS_KEYS.CURRENT_USER);
  if (!userId) return null;
  const account = findAccountById(userId);
  if (!account) {
    /* session pointed at a deleted account — clean it up */
    clearSession();
    return null;
  }
  return { account, role: account.role || 'user' };
}

export function clearSession() {
  deleteData(LS_KEYS.CURRENT_USER);
  saveData(LS_KEYS.ADMIN, false);
}

export function logout() {
  clearSession();
}

export function getCurrentUser() {
  const s = getCurrentSession();
  return s ? s.account : null;
}

/* An admin may only exist if a real account with role 'admin' is
   registered — legacy single-flag admins are migrated below. */
export function isLegacyAdminFlag() {
  return getData(LS_KEYS.ADMIN) === true;
}

/* ------------------------------------------------------------------
   DATA MIGRATION (safe, idempotent — runs once per app load)
   1. Every legacy account without a `role` becomes a `user`.
   2. If no admin account exists, the demo admin is appended so
      admin@cravecart.com / admin123 works through the shared login.
      Existing accounts are NEVER overwritten.
   3. The legacy cravecart_adminLoggedIn flag is synced with the
      current session.
------------------------------------------------------------------ */
export function migrateStorage() {
  const users = getData(LS_KEYS.USERS) || [];
  let changed = false;

  users.forEach((u) => {
    if (!u.role) {
      u.role = 'user';
      changed = true;
    }
  });

  const hasAdmin = users.some((u) => u.role === 'admin');
  if (!hasAdmin) {
    users.push({
      id: 'admin_demo',
      name: 'CraveCart Admin',
      email: 'admin@cravecart.com',
      password: 'admin123',
      role: 'admin',
      savedRecipes: [],
      collections: [],
      createdRecipes: [],
      createdAt: fbGetToday()
    });
    changed = true;
  }

  if (changed) {
    saveData(LS_KEYS.USERS, users);
  }

  /* One-time data fix: the old Idli Sambar seed image showed no sambar.
     Patches already-seeded browsers without touching anything else. */
  const recipes = getData(LS_KEYS.RECIPES) || [];
  let recipeChanged = false;
  recipes.forEach((r) => {
    if (r.id === 'recipe_2' && typeof r.image === 'string' && r.image.indexOf('photo-1589301760014') !== -1) {
      r.image = 'https://upload.wikimedia.org/wikipedia/commons/1/11/Idli_Sambar.JPG';
      recipeChanged = true;
    }
  });
  if (recipeChanged) {
    saveData(LS_KEYS.RECIPES, recipes);
  }

  const session = getCurrentSession();
  const isAdminSession = !!session && session.role === 'admin';
  if (getData(LS_KEYS.ADMIN) !== isAdminSession) {
    saveData(LS_KEYS.ADMIN, isAdminSession);
  }
}
