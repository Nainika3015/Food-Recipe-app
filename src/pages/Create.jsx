/* ============================================================
   CraveCart - Create.jsx
   "Add Recipe" page (legacy create-recipe.html): publishes a new
   recipe authored by the logged-in user.
   ============================================================ */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserLayout from '../components/UserLayout.jsx';
import RecipeForm from '../components/RecipeForm.jsx';

export default function Create() {
  const navigate = useNavigate();

  return (
    <UserLayout>
      <div className="page-head">
        <div className="container">
          <h1>👩‍🍳 Add a New Recipe</h1>
          <p className="sub">Share one of your favourite dishes with the CraveCart community.</p>
        </div>
      </div>

      <div className="container section-pad" style={{ paddingTop: 0 }}>
        <RecipeForm onDone={() => navigate('/my-recipes')} />
      </div>
    </UserLayout>
  );
}
