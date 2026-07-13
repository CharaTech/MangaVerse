import { defineConfig } from 'vitest/config';

// Configure the Vitest unit-test runner for the project.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
