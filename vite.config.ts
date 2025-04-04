/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // AI/ML related
          if (id.includes('@tensorflow')) return 'tensorflow';
          if (id.includes('@xenova')) return 'transformers';
          
          // React ecosystem
          if (id.includes('react-dom')) return 'react-dom';
          if (id.includes('react-router')) return 'react-router';
          if (id.includes('react')) return 'react-core';
          if (id.includes('@tanstack')) return 'tanstack';
          
          // PDF related
          if (id.includes('@react-pdf') || id.includes('react-pdf')) return 'pdf';
          
          // Editor related
          if (id.includes('@tiptap')) return 'editor';
          
          // DnD related
          if (id.includes('@dnd-kit') || id.includes('react-beautiful-dnd')) return 'dnd';
          
          // Utils
          if (id.includes('date-fns') || 
              id.includes('axios') || 
              id.includes('zod')) return 'utils';
          
          // Node polyfills
          if (id.includes('node-libs-browser') || 
              id.includes('buffer') || 
              id.includes('process')) return 'polyfills';
              
          // Vendor chunk for remaining node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          
          return null; // default chunk
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'url': 'url/',
      'stream': 'stream-browserify',
      'util': 'util',
      'os': 'os-browserify/browser',
      'path': 'path-browserify',
      'querystring': 'querystring-es3',
      'https': 'https-browserify',
      'zlib': 'browserify-zlib',
      'process': 'process/browser',
      'assert': 'assert',
      'crypto': 'crypto-browserify',
      'events': 'events',
      'http': 'stream-http',
      'node:events': 'events',
      'node:process': 'process/browser',
      'node:util': 'util',
      'fs': path.resolve(__dirname, './src/lib/emptyShim.js'),
      'child_process': path.resolve(__dirname, './src/lib/emptyShim.js'),
      'http2': path.resolve(__dirname, './src/lib/emptyShim.js'),
      'net': path.resolve(__dirname, './src/lib/emptyShim.js'),
      'tls': path.resolve(__dirname, './src/lib/emptyShim.js'),
      'vm': path.resolve(__dirname, './src/lib/emptyShim.js'),
    },
  },
  define: {
    'global': 'globalThis',
    'process.env': JSON.stringify(process.env),
    'process.browser': 'true',
    'process.version': JSON.stringify(process.version),
  },
  optimizeDeps: {
    exclude: [
      '@tensorflow/tfjs',
      '@xenova/transformers',
      '@react-pdf/renderer',
      'react-pdf'
    ],
    include: [
      'react', 
      'react-dom',
      'process/browser'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: './src/setupTests.ts',
    css: true,
  },
});
