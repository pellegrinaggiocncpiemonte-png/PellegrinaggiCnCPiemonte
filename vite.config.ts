import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const counterScriptPath =
  '/macros/s/AKfycbz2py2LldK05Lm9jVmnDfQuKUFViwY_pxfiYnCcVyaseKgejBPyqEtf4mBP3xNqo7Rv/exec';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/visit-counter': {
        target: 'https://script.google.com',
        changeOrigin: true,
        secure: true,
        followRedirects: true,
        rewrite: (path) => {
          const queryStart = path.indexOf('?');
          const query = queryStart >= 0 ? path.slice(queryStart) : '';
          return `${counterScriptPath}${query}`;
        },
      },
    },
  },
});
