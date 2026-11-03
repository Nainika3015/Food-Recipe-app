/* ============================================================
   CraveCart - RecipeDetails.jsx
   Full recipe page ported from legacy js/reviews.js:
   detail hero + badges + meta grid, save / collection / share
   / rate actions, ingredients & instructions columns, and the
   reviews list with the one-rating-per-user rule.
   ============================================================ */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  getData, saveData, LS_KEYS, fbGetRecipeById, fbGetRecipeRating,
  fbFormatDate, fbGenerateId, fbGetToday,
} from '../services/storageCore.js';
import { toggleSaved } from '../services/storageService.js';
import { fbEscape } from '../services/storageCore.js';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';

function starsFor(n) { return '★★★★★'.slice(0, n) + '★★★★★'.slice(n); }

export default function RecipeDetails() {
  const { id } = useParams();
  const { user, refreshSession } = useAuth();
  const toast = useToast();
  const [, force] = useState(0);

  const recipe = fbGetRecipeById(id);

  /* Modal state: 'collection' | 'share' | null */
  const [modal, setModal] = useState(null);
  const [newCollName, setNewCollName] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [savedTick, setSavedTick] = useState(false);

  if (!recipe) {
    return (
      <UserLayout>
        <div className="container section-pad">
          <div className="empty-state">
            <div className="empty-icon">🥄</div>
            <h3>Recipe not found</h3>
            <p>This recipe may have been deleted.</p>
            <Link to="/explore" className="btn btn-primary">Back to Explore</Link>
          </div>
        </div>
      </UserLayout>
    );
  }

  const total = Number(recipe.prepTime) + Number(recipe.cookTime);
  const rating = fbGetRecipeRating(recipe.id);
  const savedIds = getData(LS_KEYS.USERS).find((u) => u.id === user.id)?.savedRecipes || [];
  const isSaved = savedIds.includes(recipe.id);

  const myColls = (getData(LS_KEYS.COLLECTIONS) || []).filter((c) => c.userId === user.id);
  const reviews = (getData(LS_KEYS.REVIEWS) || [])
    .filter((rv) => rv.recipeId === recipe.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const myReview = reviews.find((rv) => rv.userId === user.id);
  const alreadyReviewed = !!myReview;

  const onToggleSave = () => {
    const nowSaved = toggleSaved(recipe.id, user.id);
    refreshSession();
    setSavedTick((t) => !t);
    toast(
      nowSaved ? 'Recipe added to your Saved Recipes' : 'Removed from Saved Recipes',
      nowSaved ? 'success' : 'info'
    );
  };

  const toggleInCollection = (colId, checked) => {
    const all = getData(LS_KEYS.COLLECTIONS) || [];
    const idx = all.findIndex((c) => c.id === colId);
    if (idx === -1) return;
    all[idx].recipeIds = all[idx].recipeIds || [];
    if (checked) {
      if (all[idx].recipeIds.indexOf(recipe.id) === -1) {
        all[idx].recipeIds.push(recipe.id);
        toast(`Added to "${all[idx].name}"`, 'success');
      }
    } else {
      all[idx].recipeIds = all[idx].recipeIds.filter((x) => x !== recipe.id);
      toast(`Removed from "${all[idx].name}"`, 'info');
    }
    saveData(LS_KEYS.COLLECTIONS, all);
    force((n) => n + 1);
  };

  const quickCreateColl = () => {
    const name = newCollName.trim();
    if (!name) { toast('Please enter a collection name', 'error'); return; }
    const all = getData(LS_KEYS.COLLECTIONS) || [];
    all.push({ id: fbGenerateId('coll'), name, userId: user.id, recipeIds: [recipe.id], createdAt: fbGetToday() });
    saveData(LS_KEYS.COLLECTIONS, all);
    toast(`Collection "${name}" created and recipe added`, 'success');
    setNewCollName('');
    force((n) => n + 1);
  };

  const shareText = `Check out this recipe: ${recipe.name} on CraveCart!`;
  const shareUrl = window.location.href;

  const copyLink = () => {
    const url = shareUrl;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => toast('Recipe link copied to clipboard', 'success'))
        .catch(() => fallbackCopy(url));
    } else fallbackCopy(url);
  };
  const fallbackCopy = (text) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('Recipe link copied to clipboard', 'success'); }
    catch (e) { toast('Could not copy the link', 'error'); }
    document.body.removeChild(ta);
  };

  const submitReview = () => {
    if (selectedRating === 0) { toast('Please select a star rating first', 'error'); return; }
    if (alreadyReviewed) { toast('You have already rated this recipe', 'error'); return; }
    const all = getData(LS_KEYS.REVIEWS) || [];
    all.push({
      id: fbGenerateId('review'),
      recipeId: recipe.id,
      userId: user.id,
      userName: user.name,
      rating: selectedRating,
      review: reviewText.trim(),
      date: fbGetToday(),
    });
    saveData(LS_KEYS.REVIEWS, all);
    toast('Review submitted. Thank you!', 'success');
    setReviewText('');
    setTimeout(() => force((n) => n + 1), 300);
  };

  return (
    <UserLayout>
      <section className="detail-hero">
        <div className="container">
          <div className="breadcrumb"><Link to="/explore">Explore</Link> › {recipe.category} › {recipe.name}</div>
          <div className="detail-layout">
            <div>
              <img
                className="detail-img"
                src={recipe.image}
                alt={recipe.name}
                onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
              />
            </div>
            <div className="detail-info">
              <div className="detail-badges">
                <span className="badge badge-cuisine">{recipe.cuisine}</span>
                <span className="badge">{recipe.category}</span>
                <span className="badge badge-diet">{recipe.dietaryPreference}</span>
                <span className="badge badge-diff">{recipe.difficulty}</span>
              </div>
              <h1>{recipe.name}</h1>
              <p className="by-line">By <strong>{recipe.authorName || 'Unknown Chef'}</strong> · Added {fbFormatDate(recipe.createdAt)}</p>
              <p className="detail-desc">{recipe.description}</p>
              <div className="detail-meta-grid">
                <div className="meta-box"><div className="m-val">{recipe.prepTime} min</div><div className="m-lbl">Prep Time</div></div>
                <div className="meta-box"><div className="m-val">{recipe.cookTime} min</div><div className="m-lbl">Cook Time</div></div>
                <div className="meta-box"><div className="m-val">{total} min</div><div className="m-lbl">Total Time</div></div>
                <div className="meta-box"><div className="m-val">{recipe.servings}</div><div className="m-lbl">Servings</div></div>
                <div className="meta-box"><div className="m-val">{recipe.difficulty}</div><div className="m-lbl">Difficulty</div></div>
                <div className="meta-box"><div className="m-val">{rating.avg > 0 ? rating.avg.toFixed(1) : '—'}</div><div className="m-lbl">Avg Rating ({rating.count})</div></div>
              </div>
              <div className="detail-actions">
                <button className="btn btn-primary" id="detail-save-btn" onClick={onToggleSave}>
                  {isSaved ? '♥ Remove from Saved' : '♡ Save Recipe'}
                </button>
                <button className="btn btn-outline" id="detail-coll-btn" onClick={() => setModal('collection')}>📁 Add to Collection</button>
                <button className="btn btn-ghost" id="detail-rate-btn" onClick={() => window.scrollBy({ top: window.scrollY + 800, behavior: 'smooth' })}>⭐ Rate Recipe</button>
                <button className="btn btn-ghost" id="detail-share-btn" onClick={() => setModal('share')}>🔗 Share Recipe</button>
              </div>
              {(recipe.tags || []).length > 0 && (
                <div className="tag-row mt-2">
                  {recipe.tags.map((t) => <span key={t} className="tag-chip">#{fbEscape(t)}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="detail-section">
          <h2>🥘 Ingredients</h2>
          <div className="detail-cols">
            <div>
              <div className="ing-list">
                {(recipe.ingredients || []).map((i, idx) => (
                  <div className="ing-item" key={idx}>
                    <span>{i.name}</span>
                    <span className="qty">{i.quantity}{i.unit ? ` ${i.unit}` : ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: 16 }}>👨‍🍳 Instructions</h2>
              <div className="step-list">
                {(recipe.instructions || []).map((s, idx) => (
                  <div className="step-item" key={idx}>{s}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="detail-section" id="reviews">
          <h2>⭐ Ratings &amp; Reviews</h2>
          <div className="rating-summary" id="rating-summary">
            <div className="rating-big">
              <div className="big-num">{rating.avg > 0 ? rating.avg.toFixed(1) : '—'}</div>
              <div className="stars">{rating.avg > 0 ? starsFor(Math.round(rating.avg)) : '☆☆☆☆☆'}</div>
              <div className="count-lbl">{rating.count} rating{rating.count === 1 ? '' : 's'}</div>
            </div>
            <div>
              <h3 style={{ marginBottom: 4 }}>Rate this recipe</h3>
              <p className="small muted">
                {alreadyReviewed
                  ? `You rated this recipe ★${myReview.rating}. One rating per user.`
                  : 'Click a star, add an optional comment and submit.'}
              </p>
            </div>
          </div>

          <div className="review-form">
            <div className="star-input" id="star-input">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={selectedRating >= n ? 'active' : ''}
                  data-star={n}
                  onClick={() => setSelectedRating(n)}
                >★</button>
              ))}
            </div>
            <div className="form-group">
              <textarea
                id="review-text"
                className="form-control"
                placeholder="Share your cooking experience (optional)..."
                maxLength={400}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" id="submit-review-btn" onClick={submitReview}>Submit Review</button>
          </div>

          <div id="reviews-list">
            {reviews.length === 0 ? (
              <p className="muted">No reviews yet. Be the first to rate this recipe!</p>
            ) : (
              reviews.map((rv) => (
                <div className="review-item" key={rv.id}>
                  <div className="review-head">
                    <div className="review-avatar">{(rv.userName || 'U').charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="review-name">{rv.userName || 'Anonymous'}</div>
                      <div className="review-stars">{starsFor(rv.rating)}</div>
                    </div>
                    <span className="review-date">{fbFormatDate(rv.date)}</span>
                  </div>
                  {rv.review ? <p className="review-text">{rv.review}</p> : null}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* -------- Add to collection modal -------- */}
      {modal === 'collection' && (
        <div className="modal-overlay open" id="fb-addcoll-modal" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal-box">
            <div className="modal-head">
              <h3>Add "{recipe.name}" to Collection</h3>
              <button className="modal-close" onClick={() => setModal(null)}>&times;</button>
            </div>
            {myColls.length ? myColls.map((c) => {
              const has = (c.recipeIds || []).indexOf(recipe.id) !== -1;
              return (
                <label key={c.id} className="filter-check" style={{ padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 10, marginBottom: 8 }}>
                  <input type="checkbox" checked={has} onChange={(e) => toggleInCollection(c.id, e.target.checked)} /> <strong>{c.name}</strong>
                  <span className="muted small" style={{ marginLeft: 'auto' }}>{(c.recipeIds || []).length} recipes</span>
                </label>
              );
            }) : <p className="muted small">You have no collections yet — create your first one below.</p>}
            <div className="form-group mt-2">
              <label>Or create a new collection</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Collection name"
                  maxLength={40}
                  value={newCollName}
                  onChange={(e) => setNewCollName(e.target.value)}
                />
                <button type="button" className="btn btn-outline" onClick={quickCreateColl}>Create</button>
              </div>
            </div>
            <div className="modal-actions"><button className="btn btn-primary" onClick={() => setModal(null)}>Done</button></div>
          </div>
        </div>
      )}

      {/* -------- Share modal -------- */}
      {modal === 'share' && (
        <div className="modal-overlay open" id="fb-share-modal" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal-box">
            <div className="modal-head">
              <h3>Share "{recipe.name}"</h3>
              <button className="modal-close" onClick={() => setModal(null)}>&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-primary btn-block" onClick={copyLink}>🔗 Copy Recipe Link</button>
              <a className="btn btn-outline btn-block" style={{ textDecoration: 'none' }} target="_blank" rel="noopener"
                 href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}>💬 Share on WhatsApp</a>
              {navigator.share && (
                <button className="btn btn-ghost btn-block" onClick={() => navigator.share({ title: recipe.name, text: shareText, url: shareUrl }).catch(() => {})}>
                  📤 More Share Options
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
