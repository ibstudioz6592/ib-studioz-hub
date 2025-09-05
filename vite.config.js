import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Auto-detect Vercel or GitHub Pages for correct base path
const isVercel = !!process.env.VERCEL || !!process.env.VERCEL_URL;
const base = isVercel ? '/' : '/ib-studioz-hub/';

export default defineConfig({
  base,
  plugins: [react()],
});
