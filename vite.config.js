import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* Base path '/' – CraveCart deploys to Vercel (edge) with SPA fallback. */
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist'
  }
});
