/* ============================================================
   CraveCart - main.jsx
   Vite entry: the four legacy stylesheets (copied verbatim),
   BrowserRouter plus the Toast and Auth providers.
   ============================================================ */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './styles/global.css';
import './styles/user.css';
import './styles/admin.css';
import './styles/auth.css';
import './index.css';

import App from './App.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
