import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.',
  publicDir: 'public', // <-- Ļoti svarīgi! Lai Vite ņem /public saturu
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
});
