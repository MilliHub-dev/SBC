import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'ethers',
      '@thirdweb-dev/sdk',
      '@thirdweb-dev/react',
      '@uniswap/sdk-core',
      '@uniswap/v3-sdk',
      '@uniswap/smart-order-router'
    ],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {
          'ethers': 'ethers'
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173,
  },
});
