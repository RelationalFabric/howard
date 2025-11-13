import { performance as nodePerformance } from 'node:perf_hooks'

if (typeof globalThis.performance === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  globalThis.performance = nodePerformance as typeof globalThis.performance
}

export {}
