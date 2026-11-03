/* ============================================================
   CraveCart - UserLayout.jsx
   Wraps every User-module page: navbar + content + footer,
   exactly like the legacy page-shell.
   ============================================================ */

import React from 'react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

export default function UserLayout({ children }) {
  return (
    <div className="page-wrap">
      <Navbar />
      <main className="page-main">{children}</main>
      <Footer />
    </div>
  );
}
