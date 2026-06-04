import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@ng-error-tooltips': fileURLToPath(
        new URL('../ng-error-tooltips-lib/projects/ng-error-tooltips/src/public-api.ts', import.meta.url)
      )
    }
  },
  test: {
    environment: 'jsdom'
  }
});