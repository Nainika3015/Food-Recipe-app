/* ============================================================
   CraveCart - App.jsx
   BrowserRouter route map.

   Public      /login  /signup          (PublicOnlyRoute)
   User module /  /explore  /recipe/:id /saved /collections
               /create /my-recipes /profile      (UserRoute + UserLayout)
   Admin module /admin  /admin/recipes  /admin/recipes/add
               /admin/recipes/edit/:id  /admin/users
               /admin/categories  /admin/reviews (AdminRoute + AdminLayout)
   ============================================================ */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PublicOnlyRoute from './components/PublicOnlyRoute.jsx';
import UserRoute from './components/UserRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AdminLayout from './components/AdminLayout.jsx';

import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import RecipeDetails from './pages/RecipeDetails.jsx';
import Saved from './pages/Saved.jsx';
import Collections from './pages/Collections.jsx';
import Create from './pages/Create.jsx';
import MyRecipes from './pages/MyRecipes.jsx';
import Profile from './pages/Profile.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminRecipes from './pages/admin/AdminRecipes.jsx';
import { AdminRecipeAdd, AdminRecipeEdit } from './pages/admin/AdminRecipeEditor.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminReviews from './pages/admin/AdminReviews.jsx';

export default function App() {
  return (
    <Routes>
      {/* ---------- Auth (shared, one page each) ---------- */}
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />

      {/* ---------- User module ---------- */}
      <Route path="/" element={<UserRoute><Home /></UserRoute>} />
      <Route path="/explore" element={<UserRoute><Explore /></UserRoute>} />
      <Route path="/recipe/:id" element={<UserRoute><RecipeDetails /></UserRoute>} />
      <Route path="/saved" element={<UserRoute><Saved /></UserRoute>} />
      <Route path="/collections" element={<UserRoute><Collections /></UserRoute>} />
      <Route path="/create" element={<UserRoute><Create /></UserRoute>} />
      <Route path="/my-recipes" element={<UserRoute><MyRecipes /></UserRoute>} />
      <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />

      {/* ---------- Admin module ---------- */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="recipes" element={<AdminRecipes />} />
        <Route path="recipes/add" element={<AdminRecipeAdd />} />
        <Route path="recipes/edit/:id" element={<AdminRecipeEdit />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="reviews" element={<AdminReviews />} />
      </Route>

      {/* ---------- Fallback ---------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
