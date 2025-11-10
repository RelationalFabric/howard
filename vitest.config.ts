import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    includeSource: ['examples/*.{js,ts}', 'examples/**/index.{js,ts}'],
    globals: true,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
})
