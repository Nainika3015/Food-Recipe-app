/* ============================================================
   CraveCart - storageService.js
   Thin facades around the ported legacy data layer (storageCore.js,
   which keeps the EXACT Local Storage keys and object shapes used by
   the original vanilla CraveCart app, so existing browser data is
   preserved when migrating).
   ============================================================ */

import { LS_KEYS, getData, saveData } from './storageCore.js';

export { LS_KEYS, getData, saveData };

export const getUsers = () => getData(LS_KEYS.USERS) || [];
export const getCategories = () => getData(LS_KEYS.CATEGORIES) || [];
export const getReviews = () => getData(LS_KEYS.REVIEWS) || [];

/* Saved recipes live on the account record (field savedRecipes: []).
   These helpers drive the same array through the shared cravecart_users
   key so every page stays in sync after one refreshSession() call. */
export const getSavedIds = (userId) => {
  if (!userId) return [];
  const me = getUsers().find((u) => u.id === userId);
  return (me && me.savedRecipes) || [];
};

/* Toggles the recipe on the account record; returns whether the
   recipe is NOW saved. */
export function toggleSaved(recipeId, userId) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  const saved = users[idx].savedRecipes || [];
  const has = saved.indexOf(recipeId) !== -1;
  users[idx].savedRecipes = has ? saved.filter((x) => x !== recipeId) : [...saved, recipeId];
  saveData(LS_KEYS.USERS, users);
  return !has;
}

/* Full cascade used by both user and admin delete flows: removes the
   recipe, strips it from every account's saved/created lists, deletes
   its reviews and pulls it out of every collection. */
export function deleteRecipeCascade(recipeId) {
  saveData(LS_KEYS.RECIPES, (getData(LS_KEYS.RECIPES) || []).filter((r) => r.id !== recipeId));

  const users = getData(LS_KEYS.USERS) || [];
  users.forEach((u) => {
    u.savedRecipes = (u.savedRecipes || []).filter((rid) => rid !== recipeId);
    u.createdRecipes = (u.createdRecipes || []).filter((rid) => rid !== recipeId);
  });
  saveData(LS_KEYS.USERS, users);

  saveData(LS_KEYS.REVIEWS, (getData(LS_KEYS.REVIEWS) || []).filter((rv) => rv.recipeId !== recipeId));

  const cols = getData(LS_KEYS.COLLECTIONS) || [];
  cols.forEach((c) => { c.recipeIds = (c.recipeIds || []).filter((rid) => rid !== recipeId); });
  saveData(LS_KEYS.COLLECTIONS, cols);
}

export const getRecipes = () => getData(LS_KEYS.RECIPES) || [];
export const saveRecipes = (list) => saveData(LS_KEYS.RECIPES, list);

/* Collection shape: { id, name, userId, recipeIds: [], createdAt } */
export const getUserCollections = (userId) =>
  (getData(LS_KEYS.COLLECTIONS) || []).filter((c) => c.userId === userId);

/* Category icon map (from legacy recipes.js fbCatIcon) */
export function catIcon(name) {
  const map = {
    Indian: '🍛', Italian: '🍝', Chinese: '🥡', Mexican: '🌮',
    Desserts: '🍰', Breakfast: '🍳', Healthy: '🥗', Vegetarian: '🥦',
    Snacks: '🍿', Dinner: '🍽️', Lunch: '🍱', Drinks: '🥤'
  };
  return map[name] || '🍴';
}

/* Cuisine-type categories also count matching cuisines so chips never
   look empty — same counting rule as the legacy homepage and admin pages. */
export function countCategoryRecipes(category, recipes) {
  const cuisineNames = ['Indian', 'Italian', 'Chinese', 'Mexican'];
  return recipes.filter((r) =>
    r.category === category.name ||
    (cuisineNames.indexOf(category.name) !== -1 && r.cuisine === category.name) ||
    (category.name === 'Vegetarian' && (r.dietaryPreference === 'Vegetarian' || r.dietaryPreference === 'Vegan'))
  ).length;
}
