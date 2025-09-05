import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/ib-studioz-hub/',
  plugins: [react()],
});
