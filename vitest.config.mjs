import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: '.',
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
