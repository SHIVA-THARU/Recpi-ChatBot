// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/https://github.com/SHIVA-THARU/Recpi-ChatBot.git/', // ← replace with your GitHub repo name
  plugins: [react()]
});
