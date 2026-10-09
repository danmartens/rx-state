import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    clearMocks: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/**'],
    },
  },
});
