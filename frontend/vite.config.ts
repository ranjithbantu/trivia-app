// FILE: frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],



  /* dev-only API proxy */
  server: {
    proxy: { '/api': 'http://localhost:4000' }
  },

  /* aliases that match tsconfig.json */
  resolve: {
    alias: {
      '@app':        resolve(__dirname, 'src/app'),
      '@components': resolve(__dirname, 'src/components'),
      '@lib':        resolve(__dirname, 'src/lib')
    }
  }
});