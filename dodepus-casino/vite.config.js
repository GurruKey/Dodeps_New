/* eslint-env node */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@local-sim': path.resolve(__dirname, 'local-sim'),
    },
  },
  // Важно: сканируем зависимости только из основного входа,
  // чтобы Vite не трогал HTML в public/games/**
  optimizeDeps: {
    entries: ['src/main.jsx'],
  },
});
