import { performance as nodePerformance } from 'node:perf_hooks'

if (typeof globalThis.performance === 'undefined') {
  globalThis.performance = nodePerformance as typeof globalThis.performance
}

export {}
