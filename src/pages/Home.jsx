/* ============================================================
   CraveCart - Home.jsx (User Home)
   Hero, live stats, popular/trending/top-rated rows and the
   categories grid — same sections/classes as legacy index.html.
   ============================================================ */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import UserLayout from '../components/UserLayout.jsx';
import RecipeCard from '../components/RecipeCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getRecipes, getSavedIds, toggleSaved, getCategories, catIcon } from '../services/storageService.js';
import { fbGetRecipeRating, getData, LS_KEYS } from '../services/storageCore.js';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const recipes = getRecipes();
  const categories = getCategories();
  const savedIds = getSavedIds(user.id);

  const [q, setQ] = useState('');
  const [, force] = useState(0);

  const popular = recipes.slice().sort((a, b) => {
    const rc = fbGetRecipeRating(b.id).count - fbGetRecipeRating(a.id).count;
    return rc !== 0 ? rc : new Date(b.createdAt) - new Date(a.createdAt);
  }).slice(0, 4);

  const trending = recipes.slice()
    .sort((a, b) => fbGetRecipeRating(b.id).count - fbGetRecipeRating(a.id).count)
    .slice(0, 4);

  const topRated = recipes.slice()
    .sort((a, b) => fbGetRecipeRating(b.id).avg - fbGetRecipeRating(a.id).avg)
    .slice(0, 4);

  const cuisines = ['Indian', 'Italian', 'Chinese', 'Mexican'];
  const countFor = (c) => recipes.filter((r) =>
    r.category === c.name ||
    (cuisines.indexOf(c.name) !== -1 && r.cuisine === c.name) ||
    (c.name === 'Vegetarian' && (r.dietaryPreference === 'Vegetarian' || r.dietaryPreference === 'Vegan'))
  ).length;

  const users = getData(LS_KEYS.USERS) || [];
  const chefs = users.filter((u) => recipes.some((r) => r.author === u.id)).length;

  const heroSearch = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/explore?q=${encodeURIComponent(q.trim())}` : '/explore');
  };

  /* "#categories" navbar link scrolls to the categories section */
  useEffect(() => {
    if (location.hash === '#categories') {
      const el = document.getElementById('categories');
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [location.hash]);

  const toggleSave = (id) => { toggleSaved(id, user.id); force((n) => n + 1); };

  const heroImages = [8, 24, 42, 6].map((i) => recipes[i]).filter(Boolean);

  /* One legacy section: heading + "View All" + recipe grid */
  const recipeSection = (title, sub, gridId, list) => (
    <section className="section-pad">
      <div className="container">
        <div className="section-head">
          <div>
            <h2 className="section-title">{title}</h2>
            <p className="section-sub">{sub}</p>
          </div>
          <Link to="/explore" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        <div className="recipe-grid" id={gridId}>
          {list.map((r) => (
            <RecipeCard key={r.id} recipe={r} saved={savedIds.includes(r.id)} onToggleSave={() => toggleSave(r.id)} />
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <UserLayout>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="hero-eyebrow">🍳 15,000+ home cooks trust CraveCart</span>
            <h1>Discover <span className="highlight">Delicious</span><br />Recipes</h1>
            <p className="hero-sub">
              Search, save, cook and share your favourite recipes{user ? `, ${user.name}` : ''}.
            </p>
            <form className="hero-search" id="hero-search-form" onSubmit={heroSearch}>
              <input
                id="hero-search"
                type="text"
                placeholder="Search recipes, ingredients or cuisines..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
            <div className="hero-actions">
              <Link to="/explore" className="btn btn-primary">Explore Recipes</Link>
              <Link to="/create" className="btn btn-outline">Create Recipe</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><div className="num">{recipes.length}+</div><div className="lbl">Recipes</div></div>
              <div className="hero-stat"><div className="num">{categories.length}</div><div className="lbl">Categories</div></div>
              <div className="hero-stat"><div className="num">{chefs}</div><div className="lbl">Community Chefs</div></div>
            </div>
          </div>
          <div className="hero-art">
            {heroImages.map((r) => (
              <Link key={r.id} to={`/recipe/${r.id}`} title={r.name}>
                <img src={r.image} alt={r.name} loading="lazy" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Popular ---------- */}
      {recipeSection('🔥 Popular Recipes', 'The dishes everyone is cooking this week', 'popular-grid', popular)}

      {/* ---------- Trending ---------- */}
      {recipeSection('📈 Trending This Week', 'Most cooked by the CraveCart community', 'trending-grid', trending)}

      {/* ---------- Top rated ---------- */}
      {recipeSection('⭐ Top Rated', 'Highest rated by food lovers like you', 'toprated-grid', topRated)}

      {/* ---------- Categories ---------- */}
      <section id="categories" style={{ background: 'var(--bg-alt)', padding: '56px 0 64px' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">🍽️ Popular Categories</h2>
              <p className="section-sub">Pick a mood, find your meal</p>
            </div>
          </div>
          <div className="cat-grid" id="categories-grid">
            {categories.map((c) => (
              <Link key={c.id} className="cat-card" to={`/explore?q=${encodeURIComponent(c.name)}`}>
                <div className="cat-icon">{catIcon(c.name)}</div>
                <div className="cat-name">{c.name}</div>
                <div className="cat-count">{countFor(c)} recipes</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
