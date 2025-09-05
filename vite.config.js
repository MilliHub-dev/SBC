import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import inject from '@rollup/plugin-inject';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      brotli: path.resolve(__dirname, 'shims/empty.js'), // 👈 fix here
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: [
      'ethers',
      "ethers/lib/utils",
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
      plugins: [
        inject({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
      ],
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
