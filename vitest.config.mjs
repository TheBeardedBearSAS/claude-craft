import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: '.',
    testTimeout: 120_000,
    hookTimeout: 120_000,
    coverage: {
      provider: 'v8',
      include: ['cli/**/*.js'],
      exclude: ['cli/flattener.js'],
      reporter: ['text', 'json-summary'],
      thresholds: {
        lines: 80,
        branches: 85,
        functions: 70,
        statements: 80,
      },
    },
  },
});
