# 🛒 CraveCart – Food Recipe & Meal Planning App

**Tagline:** *Discover. Create. Crave.*

CraveCart is a food recipe web application where users can browse, search, filter, save, cook and share recipes. Users can organise recipes into personal collections, publish their own recipes, and rate & review dishes. The application is divided into **two clearly separated business modules**:

1. **User Module** — signup, login, explore, save, collect, publish, rate, review, profile
2. **Admin Module** — protected portal to manage recipes, users, categories and reviews

The app is built with **React 18 + Vite** (single shared login/signup for both roles, protected routes) and every piece of data lives in the browser's **Local Storage**. No backend, no database.

---

## 📌 Problem Statement

Food lovers switch between blogs, videos and notes while cooking. Recipe sources are scattered, there is no single place to save personal favourites, community feedback on recipes is hard to find, and discovering new dishes by ingredient, cuisine or diet is clumsy.

CraveCart solves this as a single, self-contained web application: **69 curated recipes** are centralised with search/filter/sort, users build their own cookbooks through saved recipes and collections, community ratings signal quality, and publishing is open to every registered user — all working offline in the browser.

## 🎯 Objectives

- Provide a clean, modern, responsive recipe-browsing experience
- Implement complete **CRUD** for recipes, collections, categories, users and reviews
- Demonstrate **role-based modules** (User vs Admin) with role-protected React routes
- Persist all data with **Local Storage** (no server, works offline)
- Practise real-world React: Context, hooks, controlled forms, conditional rendering, modals and toasts

## ✨ Features (User Module)

- One shared Login page (auto-detects the account's role) and one shared Signup page (Account Type selector; admins need the authorization code)
- Home page: hero search, Popular / Trending / Top Rated sections, category tiles, **live statistics** (recipe count, categories, community chefs — computed from Local Storage)
- Explore page: search by name / ingredient / cuisine / category / diet, filters (cuisine, diet, difficulty, max time), sorting (Highest Rated, Most Popular, Newest, Quickest)
- Recipe details: full ingredients with quantities, numbered steps, save, add to collection, star rating, review, share (copy link / WhatsApp / Web Share API)
- My Saved Recipes (personal bookmarks per user)
- Personal Collections: create, rename, delete, add/remove recipes, view
- Create Recipe: dynamic ingredient & step rows, edit and delete own recipes
- Ratings & Reviews: 1–5 stars, one rating per user per recipe, averages computed dynamically
- Profile: live stats and editable display name (synced to recipes and reviews)

## 🛡️ Admin Module

- Same Login page: signing in with an admin account lands on `/admin` (no separate admin login screen)
- Credentials: **admin@cravecart.com / admin123**
- Dashboard: Total Users, Recipes, Categories, Reviews, Saved Recipes — **all computed from Local Storage**, plus recent recipes, most rated recipes and recent users
- Manage Recipes: search, view (modal), edit, delete, add — handles all recipes
- Manage Users: search, view details, delete; shows saved/created counts and registration date
- Manage Categories: add, edit, delete with live recipe counts
- Manage Reviews: view, filter by rating, delete
- Route protection: `AdminRoute` sends logged-out visitors to `/login` and user accounts back to the user home

## 👥 Demo Accounts

| Role | Name | Email | Password |
|---|---|---|---|
| User | Nainika | nainika@cravecart.com | demo123 |
| User | Alisha | alisha@cravecart.com | demo123 |
| User | Swaroopa | swaroopa@cravecart.com | demo123 |
| Admin | Administrator | admin@cravecart.com | admin123 |

Each demo user has **different** saved recipes, collections and their own ratings & reviews. Demo accounts are only seeded when missing and never overwrite existing data.

## 🗄️ Local Storage Implementation

| Key | Contents |
|---|---|
| `cravecart_users` | Registered users (id, name, email, password, role, savedRecipes, createdRecipes, createdAt) |
| `cravecart_recipes` | All recipes (69 samples + user submitted) |
| `cravecart_categories` | Recipe categories |
| `cravecart_reviews` | Ratings & reviews |
| `cravecart_collections` | Personal collections (id, name, userId, recipeIds) |
| `cravecart_currentUser` | Logged-in account's id (session) |
| `cravecart_adminLoggedIn` | Admin session flag (true/false) |
| `cravecart_seeded` | Sample-data seeding marker |

The storage layer lives in `src/services/storageCore.js` (keys, seeding, helpers) and `src/services/storageService.js` (recipes, saved, collections, cascade delete). `migrateStorage()` is idempotent: older accounts without a `role` become `role: 'user'`, and the demo admin account is appended if none exists.

## 🧭 Navigation Flow

```
Shared:   Login / Signup  (one page each; role resolved from the account)
USER:     Home → Explore → Recipe Details → Save / Collect / Rate
          → My Recipes → Profile → Logout
ADMIN:    Login → Dashboard → Recipes → Users → Categories → Reviews → Logout
```

Route guards: `ProtectedRoute`, `UserRoute` (admins are redirected to `/admin`), `AdminRoute` (users are redirected to `/`), and `PublicOnlyRoute` for login/signup.

## 📁 Folder Structure

```
CraveCart/
├── index.html               (Vite entry)
├── vite.config.js
├── vercel.json              (SPA fallback rewrite)
├── src/
│   ├── main.jsx             (providers + stylesheets)
│   ├── App.jsx              (route map)
│   ├── index.css            (small bridge styles)
│   ├── context/
│   │   ├── AuthContext.jsx  (session, role, login/signup/logout)
│   │   └── ToastContext.jsx (fb-toast toasts)
│   ├── components/
│   │   ├── Navbar.jsx  Footer.jsx  UserLayout.jsx  AdminLayout.jsx
│   │   ├── RecipeCard.jsx  RecipeForm.jsx  Stars.jsx
│   │   ├── ConfirmModal.jsx  PasswordInput.jsx
│   │   └── ProtectedRoute.jsx  UserRoute.jsx  AdminRoute.jsx  PublicOnlyRoute.jsx
│   ├── pages/
│   │   ├── Login.jsx  Signup.jsx
│   │   ├── Home.jsx  Explore.jsx  RecipeDetails.jsx
│   │   ├── Saved.jsx  Collections.jsx  Create.jsx  MyRecipes.jsx  Profile.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx  AdminRecipes.jsx  AdminRecipeEditor.jsx
│   │       └── AdminUsers.jsx  AdminCategories.jsx  AdminReviews.jsx
│   ├── services/
│   │   ├── storageCore.js   (Local Storage layer + 69 recipe seed)
│   │   ├── storageService.js
│   │   └── authService.js   (login/signup/session/migration)
│   └── styles/
│       ├── global.css  (design system)
│       ├── auth.css  user.css  admin.css
└── legacy/                  (original vanilla HTML/CSS/JS, kept for reference)
```

## 🚀 How to Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # preview the production build
```

## ☁️ Deploying to Vercel

`vercel.json` already contains the SPA fallback so client-side routes survive a refresh.

```bash
npm i -g vercel     # once
vercel              # first deploy (preview)
vercel --prod       # production deploy
```

Or import the GitHub repo `Food-Recipe-app` in the Vercel dashboard — the Vite preset is detected automatically (Build: `npm run build`, Output: `dist`). No environment variables are needed.

## 🧪 Testing Checklist (viva-ready)

1. Nainika / Alisha / Swaroopa login ✔  2. Admin login → dashboard ✔
3. User & admin logout ✔  4. Search "biryani" → 3 recipes ✔
5. Filters: cuisine / diet / difficulty / time ✔  6. Sorts: rating / popular / newest / quickest ✔
7. Save & unsave ✔  8. Collections create/rename/delete/add/remove ✔
9. Create recipe (dynamic rows) ✔  10. Edit & delete own recipe ✔
11. Star rating + review, duplicate blocked ✔  12. Admin: recipes / users / categories / reviews ✔
13. Role guards redirect both ways ✔  14. Persistence after refresh ✔
15. Responsive: desktop / tablet / mobile ✔

## 🛠️ Technologies Used

- **React 18 + JSX** — components, Context, hooks
- **React Router 6** — protected routes, nested admin layout, `useSearchParams`
- **Vite 5** — dev server and production build
- **CSS3** — the original design system, Grid & Flexbox layouts, media queries (no CSS framework)
- **Local Storage** — all data & sessions

---

© 2026 CraveCart – built with React + Vite.
