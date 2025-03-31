/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Import path module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add alias resolution for tests as well
  resolve: {
     alias: {
       '@': path.resolve(__dirname, './src'),
     },
  },
  optimizeDeps: {
    exclude: ['lucide-react'], // Keep this if still needed
  },
  },
  // define: { // Keep if needed, otherwise remove
  //   'process.env': {},
  // },
  // Add Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts', // Path to setup file
    css: true, // Enable CSS processing if needed for tests
  },
});
