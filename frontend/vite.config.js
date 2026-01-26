import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Explicitly using the port you are currently on
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Note: We REMOVED the '/uploads' proxy because Cloudinary 
      // provides the full https:// URL for images now.
    },
  },
});