import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@providers': resolve(__dirname, 'src/providers'),
      '@pipelines': resolve(__dirname, 'src/pipelines'),
      '@ui': resolve(__dirname, 'src/ui')
    }
  }
});
