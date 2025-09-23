import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // Важно: сканируем зависимости только из основного входа,
  // чтобы Vite не трогал HTML в public/games/**
  optimizeDeps: {
    entries: ['src/main.jsx'],
  },
});
