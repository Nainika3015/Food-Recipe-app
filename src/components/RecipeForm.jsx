/* ============================================================
   CraveCart - RecipeForm.jsx
   Shared create/edit recipe form used by BOTH modules:
   - User  : /create (new recipe)
   - Admin : /admin/recipes/add and /admin/recipes/edit/:id
   Field markup/classes identical to legacy create-recipe.html.
   Ingredient records keep the legacy shape { name, quantity, unit }.
   ============================================================ */

import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { getCategories, getRecipes, saveRecipes } from '../services/storageService.js';
import { fbGenerateId, fbGetToday, fbFormatDate } from '../services/storageCore.js';
import { useAuth } from '../context/AuthContext.jsx';

const CUISINES = ['Indian', 'Italian', 'Chinese', 'Mexican'];
const DIETS = ['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Gluten Free', 'High Protein', 'Low Calorie'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const EMPTY = () => ({
  name: '',
  description: '',
  image: '',
  cuisine: '',
  category: '',
  dietaryPreference: '',
  difficulty: '',
  prepTime: '',
  cookTime: '',
  servings: '',
  tags: '',
  ingredients: [{ name: '', quantity: '', unit: '' }],
  instructions: ['']
});

export default function RecipeForm({ recipe, onDone, isAdminSubmit }) {
  const toast = useToast();
  const { user } = useAuth();
  const categories = getCategories();

  const [f, setF] = useState(EMPTY());
  const [error, setError] = useState('');

  useEffect(() => {
    if (recipe) {
      setF({
        name: recipe.name || '',
        description: recipe.description || '',
        image: recipe.image || '',
        cuisine: recipe.cuisine || '',
        category: recipe.category || '',
        dietaryPreference: recipe.dietaryPreference || '',
        difficulty: recipe.difficulty || '',
        prepTime: recipe.prepTime !== undefined ? String(recipe.prepTime) : '',
        cookTime: recipe.cookTime !== undefined ? String(recipe.cookTime) : '',
        servings: recipe.servings !== undefined ? String(recipe.servings) : '',
        tags: Array.isArray(recipe.tags) ? recipe.tags.join(', ') : (recipe.tags || ''),
        ingredients: (recipe.ingredients && recipe.ingredients.length ? recipe.ingredients.map((x) => ({ name: x.name || '', quantity: x.quantity || '', unit: x.unit || '' })) : [{ name: '', quantity: '', unit: '' }]),
        instructions: (recipe.instructions && recipe.instructions.length ? recipe.instructions.slice() : [''])
      });
    }
  }, [recipe && recipe.id]); // eslint-disable-line

  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));

  const setIng = (i, key, v) =>
    setF((prev) => ({ ...prev, ingredients: prev.ingredients.map((r, j) => (j === i ? { ...r, [key]: v } : r)) }));
  const addIng = () => setF((prev) => ({ ...prev, ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }] }));
  const rmIng = (i) =>
    setF((prev) => ({ ...prev, ingredients: prev.ingredients.length > 1 ? prev.ingredients.filter((_, j) => j !== i) : prev.ingredients }));

  const setStep = (i, v) =>
    setF((prev) => ({ ...prev, instructions: prev.instructions.map((s, j) => (j === i ? v : s)) }));
  const addStep = () => setF((prev) => ({ ...prev, instructions: [...prev.instructions, ''] }));
  const rmStep = (i) =>
    setF((prev) => ({ ...prev, instructions: prev.instructions.length > 1 ? prev.instructions.filter((_, j) => j !== i) : prev.instructions }));

  const validate = () => {
    if (!f.name.trim()) return 'Recipe name is required.';
    if (f.description.trim().length < 10) return 'Description must be at least 10 characters.';
    if (!f.image.trim()) return 'Image URL is required.';
    if (!f.cuisine) return 'Please select a cuisine.';
    if (!f.category) return 'Please select a category.';
    if (!f.dietaryPreference) return 'Please select a dietary preference.';
    if (!f.difficulty) return 'Please select a difficulty.';
    if (f.prepTime === '' || Number.isNaN(Number(f.prepTime)) || Number(f.prepTime) < 0) return 'Preparation time must be 0 or more (minutes).';
    if (f.cookTime === '' || Number.isNaN(Number(f.cookTime)) || Number(f.cookTime) < 0) return 'Cooking time must be 0 or more (minutes).';
    if (f.servings === '' || Number.isNaN(Number(f.servings)) || Number(f.servings) < 1) return 'Servings must be at least 1.';
    if (f.ingredients.filter((r) => r.name.trim() !== '').length < 2) return 'Please add at least 2 ingredients.';
    if (f.instructions.filter((s) => s.trim() !== '').length < 2) return 'Please add at least 2 instruction steps.';
    return null;
  };

  const buildRecipe = (existing) => {
    const authorInfo = isAdminSubmit
      ? { author: user.id, authorName: 'CraveCart Admin' }
      : { author: user.id, authorName: user.name };
    const base = {
      ...authorInfo,
      name: f.name.trim(),
      description: f.description.trim(),
      image: f.image.trim(),
      cuisine: f.cuisine,
      category: f.category,
      dietaryPreference: f.dietaryPreference,
      difficulty: f.difficulty,
      prepTime: Number(f.prepTime),
      cookTime: Number(f.cookTime),
      time: Number(f.prepTime) + Number(f.cookTime),
      servings: Number(f.servings),
      tags: f.tags.trim() ? f.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      ingredients: f.ingredients.filter((r) => r.name.trim() !== '').map((r) => ({ name: r.name.trim(), quantity: r.quantity.trim(), unit: r.unit.trim() })),
      instructions: f.instructions.filter((s) => s.trim() !== '').map((s) => s.trim())
    };
    if (existing) return { ...existing, ...base };
    return {
      id: fbGenerateId('recipe'),
      ...base,
      createdAt: fbGetToday(),
      dateDisplay: fbFormatDate(fbGetToday())
    };
  };

  const submit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      toast(err, 'error');
      return;
    }
    setError('');
    const recipes = getRecipes();
    if (recipe) {
      const idx = recipes.findIndex((r) => r.id === recipe.id);
      if (idx === -1) {
        toast('Recipe no longer exists.', 'error');
        return;
      }
      recipes[idx] = buildRecipe(recipes[idx]);
      saveRecipes(recipes);
      toast('Recipe updated successfully!', 'success');
    } else {
      recipes.unshift(buildRecipe(null));
      saveRecipes(recipes);
      toast('Recipe published successfully!', 'success');
    }
    onDone && onDone();
  };

  return (
    <form className="form-card" onSubmit={submit} noValidate>
      {error && <div className="form-error-banner">⚠ {fbEscapeJP(error)}</div>}

      <div className="form-group">
        <label>Recipe Name <span className="req">*</span></label>
        <input type="text" className="form-control" value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Spicy Garlic Noodles" maxLength={80} />
      </div>

      <div className="form-group">
        <label>Description <span className="req">*</span></label>
        <textarea className="form-control" value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe your dish — what makes it special? (min 10 characters)" maxLength={400} />
      </div>

      <div className="form-group">
        <label>Image URL <span className="req">*</span></label>
        <input type="url" className="form-control" value={f.image} onChange={(e) => set('image', e.target.value)} placeholder="https://images.unsplash.com/photo-..." />
        <div className="form-hint">Tip: paste any food photo URL (e.g. from Unsplash).</div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Cuisine <span className="req">*</span></label>
          <select value={f.cuisine} onChange={(e) => set('cuisine', e.target.value)}>
            <option value="">Select cuisine</option>
            {CUISINES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Category <span className="req">*</span></label>
          <select value={f.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Dietary Preference <span className="req">*</span></label>
          <select value={f.dietaryPreference} onChange={(e) => set('dietaryPreference', e.target.value)}>
            <option value="">Select preference</option>
            {DIETS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Difficulty <span className="req">*</span></label>
          <select value={f.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
            <option value="">Select difficulty</option>
            {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Preparation Time (min) <span className="req">*</span></label>
          <input type="number" className="form-control" min={0} value={f.prepTime} onChange={(e) => set('prepTime', e.target.value)} placeholder="e.g. 15" />
        </div>
        <div className="form-group">
          <label>Cooking Time (min) <span className="req">*</span></label>
          <input type="number" className="form-control" min={0} value={f.cookTime} onChange={(e) => set('cookTime', e.target.value)} placeholder="e.g. 25" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Servings <span className="req">*</span></label>
          <input type="number" className="form-control" min={1} value={f.servings} onChange={(e) => set('servings', e.target.value)} placeholder="e.g. 4" />
        </div>
        <div className="form-group">
          <label>Tags</label>
          <input type="text" className="form-control" value={f.tags} onChange={(e) => set('tags', e.target.value)} placeholder="comma, separated, tags" />
        </div>
      </div>

      <div className="form-group">
        <label>Ingredients <span className="req">*</span> <span className="muted small">(at least 2)</span></label>
        <div className="dyn-list">
          {f.ingredients.map((ing, i) => (
            <div key={i} className="dyn-row">
              <input className="ing-name" placeholder="Ingredient name" value={ing.name} onChange={(e) => setIng(i, 'name', e.target.value)} />
              <input className="ing-qty" placeholder="Qty" value={ing.quantity} onChange={(e) => setIng(i, 'quantity', e.target.value)} />
              <input className="ing-unit" placeholder="Unit" value={ing.unit} onChange={(e) => setIng(i, 'unit', e.target.value)} />
              <button type="button" className="dyn-remove" onClick={() => rmIng(i)} title="Remove">✕</button>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={addIng}>+ Add Ingredient</button>
      </div>

      <div className="form-group">
        <label>Instruction Steps <span className="req">*</span> <span className="muted small">(at least 2)</span></label>
        <div className="dyn-list">
          {f.instructions.map((s, i) => (
            <div key={i} className="dyn-row single">
              <span className="step-num-badge">{i + 1}.</span>
              <input className="step-text" placeholder={`Describe step ${i + 1}`} value={s} onChange={(e) => setStep(i, e.target.value)} />
              <button type="button" className="dyn-remove" onClick={() => rmStep(i)} title="Remove">✕</button>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={addStep}>+ Add Step</button>
      </div>

      <button type="submit" className="btn btn-primary btn-block">
        🍳 {recipe ? 'Save Changes' : 'Publish Recipe'}
      </button>
    </form>
  );
}

function fbEscapeJP(str) {
  return String(str); /* plain React text node — safe */
}
