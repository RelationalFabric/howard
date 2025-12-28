# Benchmark Report

This report compares benchmark results between the `main` and `develop` branches.
Results are automatically updated when benchmarks are recorded for either branch.

## Quick Summary

| Branch | Last Updated | Status |
| :--- | :--- | :--- |
| main | 2025-12-28 | ✅ Available |
| develop | 2025-12-28 | ✅ Available |

## Branch Comparison

| Benchmark | main (ops/sec) | develop (ops/sec) | Δ | Status |
| :--- | ---: | ---: | ---: | :---: |
| claim.and (positive & even) | 90.9K | 90.4K | -0.5% | ≈ |
| claim.check negative branch | 173.5K | 179.1K | +3.3% | ≈ |
| claim.check positive number | 157.4K | 157.0K | -0.3% | ≈ |
| claim.on (object.value) | 60.9K | 55.1K | -9.5% | ⚠️ |
| claim.or (number | string) | 168.7K | 170.2K | +0.9% | ≈ |

### Legend

- 🚀 **Improvement**: >5% faster than baseline
- ⚠️ **Regression**: >5% slower than baseline
- ≈ **Stable**: Within ±5% of baseline
- ✨ **New**: Benchmark added in this branch
- 🗑️ **Removed**: Benchmark removed in this branch

## Detailed Results

### main Branch

| Benchmark | ops/sec | mean (ms) | ±RME | p99 (ms) | samples |
| :--- | ---: | ---: | ---: | ---: | ---: |
| claim.check negative branch | 173.5K | 5.7674 | ±0.11% | 9.5380 | 520,566 |
| claim.or (number | string) | 168.7K | 5.9276 | ±0.07% | 7.9383 | 506,323 |
| claim.check positive number | 157.4K | 6.3528 | ±0.22% | 9.2907 | 472,235 |
| claim.and (positive & even) | 90.9K | 11.0069 | ±0.09% | 17.9040 | 272,558 |
| claim.on (object.value) | 60.9K | 16.4338 | ±0.11% | 25.3373 | 182,789 |

### develop Branch

| Benchmark | ops/sec | mean (ms) | ±RME | p99 (ms) | samples |
| :--- | ---: | ---: | ---: | ---: | ---: |
| claim.check negative branch | 179.1K | 5.5835 | ±0.07% | 8.1213 | 537,301 |
| claim.or (number | string) | 170.2K | 5.8762 | ±0.09% | 10.9437 | 510,571 |
| claim.check positive number | 157.0K | 6.3691 | ±0.23% | 9.9553 | 471,029 |
| claim.and (positive & even) | 90.4K | 11.0606 | ±0.13% | 18.6450 | 271,239 |
| claim.on (object.value) | 55.1K | 18.1685 | ±0.16% | 33.8700 | 165,396 |

## How to Update

### Automatic (CI)

Benchmarks run automatically when changes are pushed to `main` or `develop`.
Results are submitted via PR from `bench/*` branches to `develop`.

### Manual (Local)

```bash
# Record benchmarks for main branch
git checkout main
npm run bench:record -- --branch main

# Record benchmarks for develop branch
git checkout develop
npm run bench:record -- --branch develop

# Regenerate this report only
npm run bench:report
```

## Notes

- All measurements in operations per second (higher is better)
- RME = Relative Margin of Error (lower is more stable)
- p99 = 99th percentile latency
- Results updated via `bench/*` branches → PR to `develop`
