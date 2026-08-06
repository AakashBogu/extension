import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

function copyManifest() {
  return {
    name: 'copy-manifest',
    closeBundle() {
      if (!existsSync('dist')) {
        mkdirSync('dist', { recursive: true });
      }
      copyFileSync('src/manifest.json', 'dist/manifest.json');
    }
  };
}

export default defineConfig({
  plugins: [react(), copyManifest()],
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@providers': resolve(__dirname, 'src/providers'),
      '@pipelines': resolve(__dirname, 'src/pipelines'),
      '@ui': resolve(__dirname, 'src/ui')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        options: resolve(__dirname, 'src/options/index.html'),
        devtools: resolve(__dirname, 'src/devtools/index.html'),
        offscreen: resolve(__dirname, 'src/offscreen/index.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') return 'background.js';
          if (chunkInfo.name === 'content') return 'content.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});
