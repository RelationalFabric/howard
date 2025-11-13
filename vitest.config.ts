import path from 'node:path'
import { defineConfig } from 'vitest/config'

const benchmarkReporters =
  process.env.VITEST_BENCHMARK_REPORTERS?.split(',').filter(Boolean) ?? []

export default defineConfig({
  test: {
    includeSource: ['examples/*.{js,ts}', 'examples/**/index.{js,ts}'],
    globals: true,
  },
  benchmark: {
    include: ['benchmarks/suites/**/*.bench.ts'],
    setupFiles: ['benchmarks/harness/setup.ts'],
    time: 1_000,
    warmupTime: 250,
    maxConcurrency: 1,
    outputFile: process.env.VITEST_BENCHMARK_OUTPUT_FILE,
    reporters: benchmarkReporters.length > 0 ? benchmarkReporters : ['default'],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
})
