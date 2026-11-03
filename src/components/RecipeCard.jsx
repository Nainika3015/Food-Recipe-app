/* ============================================================
   CraveCart - RecipeCard.jsx
   Markup ported 1:1 from legacy fbRecipeCard() so the existing
   stylesheet (global.css) applies: .card-img-wrap, .card-body,
   .card-title, .card-meta, .card-foot, .rating-line.
   ============================================================ */

import React from 'react';
import { Link } from 'react-router-dom';
import { fbGetRecipeRating } from '../services/storageCore.js';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';

export default function RecipeCard({ recipe, saved, onToggleSave }) {
  if (!recipe) return null;
  const rating = fbGetRecipeRating(recipe.id);
  const isSaved = !!saved;
  const totalTime = Number(recipe.prepTime) + Number(recipe.cookTime);

  return (
    <article className="recipe-card">
      <div className="card-img-wrap">
        <Link to={`/recipe/${recipe.id}`}>
          <img
            src={recipe.image}
            alt={recipe.name}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
          />
        </Link>
        <div className="card-badges">
          <span className="badge badge-cuisine">{recipe.cuisine}</span>
          <span className="badge badge-time">⏱ {totalTime} min</span>
        </div>
        {onToggleSave && (
          <button
            type="button"
            className={`card-save${isSaved ? ' saved' : ''}`}
            title={isSaved ? 'Remove from saved' : 'Save recipe'}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(); }}
          >
            {isSaved ? '♥' : '♡'}
          </button>
        )}
      </div>
      <div className="card-body">
        <h3 className="card-title">
          <Link to={`/recipe/${recipe.id}`}>{recipe.name}</Link>
        </h3>
        <p className="card-desc">{recipe.description}</p>
        <div className="card-meta">
          <span className="badge">{recipe.category}</span>
          <span className="badge badge-diet">{recipe.dietaryPreference}</span>
          <span className="badge badge-diff">{recipe.difficulty}</span>
        </div>
        <div className="card-foot">
          <span className="rating-line">
            <span className="stars">{rating.avg > 0 ? '★★★★★'.slice(0, Math.round(rating.avg)) : '☆'}</span>
            {' '}{rating.avg > 0 ? rating.avg.toFixed(1) : 'New'}{' '}
            <span className="count">({rating.count})</span>
          </span>
          <Link to={`/recipe/${recipe.id}`} className="btn btn-primary btn-sm">View Recipe</Link>
        </div>
      </div>
    </article>
  );
}
