# Benchmark Report

This report compares benchmark results between the `main` and `develop` branches.
Results are automatically updated when benchmarks are recorded for either branch.

## Quick Summary

| Branch | Last Updated | Status |
| :--- | :--- | :--- |
| main | 2025-12-27 | ✅ Available |
| develop | 2025-12-27 | ✅ Available |

## Branch Comparison

| Benchmark | main (ops/sec) | develop (ops/sec) | Δ | Status |
| :--- | ---: | ---: | ---: | :---: |
| claim.and (positive & even) | 95.7K | 89.2K | -6.8% | ⚠️ |
| claim.check negative branch | 226.4K | 167.4K | -26.0% | ⚠️ |
| claim.check positive number | 180.7K | 154.0K | -14.8% | ⚠️ |
| claim.on (object.value) | 82.1K | 56.4K | -31.4% | ⚠️ |
| claim.or (number | string) | 183.2K | 163.1K | -11.0% | ⚠️ |

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
| claim.check negative branch | 226.4K | 4.4176 | ±0.41% | 5.7290 | 226,369 |
| claim.or (number | string) | 183.2K | 5.4579 | ±0.77% | 6.0560 | 183,223 |
| claim.check positive number | 180.7K | 5.5345 | ±0.36% | 6.4930 | 180,684 |
| claim.and (positive & even) | 95.7K | 10.4491 | ±0.56% | 12.6220 | 95,703 |
| claim.on (object.value) | 82.1K | 12.1761 | ±0.27% | 14.9200 | 82,128 |

### develop Branch

| Benchmark | ops/sec | mean (ms) | ±RME | p99 (ms) | samples |
| :--- | ---: | ---: | ---: | ---: | ---: |
| claim.check negative branch | 167.4K | 5.9752 | ±0.12% | 11.0610 | 502,357 |
| claim.or (number | string) | 163.1K | 6.1355 | ±0.15% | 11.4517 | 489,871 |
| claim.check positive number | 154.0K | 6.4988 | ±0.26% | 10.0117 | 462,088 |
| claim.and (positive & even) | 89.2K | 11.2095 | ±0.12% | 17.9000 | 267,741 |
| claim.on (object.value) | 56.4K | 17.8141 | ±0.13% | 31.3853 | 169,768 |

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
