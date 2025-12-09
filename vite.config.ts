import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress source map warnings for lucide-react icons
        if (warning.code === 'SOURCEMAP_ERROR' && warning.message.includes('lucide-react')) {
          return;
        }
        warn(warning);
      },
    },
  },
});
