/* ============================================================
   CraveCart - Explore.jsx
   Search / filter / sort over the whole recipe catalogue.
   Same filters and semantics as legacy explore.html:
   debounce search across name/desc/cuisine/category/diet/tags/
   ingredient names + category chips + cuisine/diet/difficulty/
   maxTime selects and 4 sort modes.
   ============================================================ */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import UserLayout from '../components/UserLayout.jsx';
import RecipeCard from '../components/RecipeCard.jsx';
import { getRecipes, getSavedIds, toggleSaved, getCategories, catIcon } from '../services/storageService.js';
import { fbGetRecipeRating } from '../services/storageCore.js';

const CUISINES = ['Indian', 'Italian', 'Chinese', 'Mexican'];
const DIETS = ['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Gluten Free', 'High Protein', 'Low Calorie'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function Explore() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  const recipes = getRecipes();
  const categories = getCategories();
  const savedIds = getSavedIds(user.id);
  const [, force] = useState(0);

  const [q, setQ] = useState(params.get('q') || '');
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [cuisine, setCuisine] = useState('');
  const [diet, setDiet] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [maxTime, setMaxTime] = useState('');
  const [sort, setSort] = useState('rating');
  const [cats, setCats] = useState([]);

  /* Prefill from hero search / category card (?q= param) */
  useEffect(() => {
    const p = params.get('q');
    if (p !== null) { setQ(p); setDebouncedQ(p); }
  }, [params.get('q')]); // eslint-disable-line

  /* Debounced search, like the legacy 250 ms timer */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const list = useMemo(() => {
    let l = recipes.slice();
    const term = debouncedQ.trim().toLowerCase();
    if (term) {
      l = l.filter((r) => {
        const ing = (r.ingredients || []).some((i) => (i.name || '').toLowerCase().indexOf(term) !== -1);
        const tags = (r.tags || []).some((t) => t.toLowerCase().indexOf(term) !== -1);
        return (
          r.name.toLowerCase().indexOf(term) !== -1 ||
          (r.description || '').toLowerCase().indexOf(term) !== -1 ||
          r.cuisine.toLowerCase().indexOf(term) !== -1 ||
          r.category.toLowerCase().indexOf(term) !== -1 ||
          (r.dietaryPreference || '').toLowerCase().indexOf(term) !== -1 ||
          tags || ing
        );
      });
    }
    if (cuisine) l = l.filter((r) => r.cuisine === cuisine);
    if (diet) l = l.filter((r) => r.dietaryPreference === diet);
    if (difficulty) l = l.filter((r) => r.difficulty === difficulty);
    if (maxTime) l = l.filter((r) => (Number(r.prepTime) + Number(r.cookTime)) <= Number(maxTime));
    if (cats.length) l = l.filter((r) => cats.indexOf(r.category) !== -1);

    if (sort === 'rating') l.sort((a, b) => fbGetRecipeRating(b.id).avg - fbGetRecipeRating(a.id).avg);
    else if (sort === 'popular') l.sort((a, b) => fbGetRecipeRating(b.id).count - fbGetRecipeRating(a.id).count);
    else if (sort === 'newest') l.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sort === 'time') l.sort((a, b) => (Number(a.prepTime) + Number(a.cookTime)) - (Number(b.prepTime) + Number(b.cookTime)));
    return l;
  }, [debouncedQ, cuisine, diet, difficulty, maxTime, sort, cats.join('|'), recipes.length]); // eslint-disable-line

  const reset = () => {
    setQ(''); setCuisine(''); setDiet(''); setDifficulty(''); setMaxTime(''); setSort('rating'); setCats([]);
    setParams({});
  };

  const toggleCat = (name) => setCats((c) => (c.indexOf(name) !== -1 ? c.filter((x) => x !== name) : [...c, name]));
  const toggleSave = (id) => { toggleSaved(id, user.id); force((n) => n + 1); };

  const chips = [];
  if (debouncedQ.trim()) chips.push(`Search: "${debouncedQ.trim()}"`);
  if (cuisine) chips.push(`Cuisine: ${cuisine}`);
  if (diet) chips.push(`Diet: ${diet}`);
  if (difficulty) chips.push(`Difficulty: ${difficulty}`);
  if (maxTime) chips.push(`Max time: ${maxTime} min`);
  if (cats.length) chips.push(`Categories: ${cats.join(', ')}`);

  return (
    <UserLayout>
      <div className="page-head">
        <div>
          <h1>🔍 Explore Recipes</h1>
          <p>Search by name, ingredient or cuisine — then filter by diet, difficulty and time.</p>
        </div>
      </div>

      <div className="container section-pad" style={{ paddingTop: 0 }}>
        <div className="explore-layout">
          {/* ---------- Filters sidebar ---------- */}
          <aside className="filter-panel">
            <h3>⚙️ Filters</h3>

            <div className="filter-group">
              <h4>Categories</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`badge badge-chip${cats.indexOf(c.name) !== -1 ? ' active' : ''}`}
                    onClick={() => toggleCat(c.name)}
                  >
                    {catIcon(c.name)} {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Cuisine</h4>
              <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                <option value="">All Cuisines</option>
                {CUISINES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <h4>Dietary Preference</h4>
              <select value={diet} onChange={(e) => setDiet(e.target.value)}>
                <option value="">All Diets</option>
                {DIETS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <h4>Difficulty</h4>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="">Any Difficulty</option>
                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <h4>Max Total Time (min)</h4>
              <input
                type="number"
                min="0"
                placeholder="e.g. 30"
                value={maxTime}
                onChange={(e) => setMaxTime(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <h4>Sort By</h4>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="time">Quickest</option>
              </select>
            </div>

            <div className="filter-actions">
              <button type="button" className="btn btn-outline btn-sm" onClick={reset}>↺ Reset Filters</button>
            </div>
          </aside>

          {/* ---------- Results ---------- */}
          <div>
            <div className="explore-topbar">
              <div className="explore-search">
                <input
                  type="text"
                  placeholder="Search recipes, ingredients or cuisines..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <span className="result-count">
                {list.length} recipe{list.length === 1 ? '' : 's'} found
              </span>
            </div>

            {chips.length > 0 && (
              <div className="active-filters">
                {chips.map((c, i) => <span key={i} className="badge">{c}</span>)}
              </div>
            )}

            <div className="recipe-grid">
              {list.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-icon">🔍</div>
                  <h3>No recipes found</h3>
                  <p>Try different keywords or reset the filters.</p>
                  <button className="btn btn-outline" onClick={reset}>Reset Filters</button>
                </div>
              ) : (
                list.map((r) => (
                  <RecipeCard key={r.id} recipe={r} saved={savedIds.includes(r.id)} onToggleSave={() => toggleSave(r.id)} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
