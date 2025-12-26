# Benchmark Report

This report compares benchmark results between the `main` and `develop` branches.
Results are automatically updated when benchmarks are recorded for either branch.

## Quick Summary

| Branch | Last Updated | Status |
| :--- | :--- | :--- |
| main | 2025-12-26 | ✅ Available |
| develop | 2025-12-26 | ✅ Available |

## Branch Comparison

| Benchmark | main (ops/sec) | develop (ops/sec) | Δ | Status |
| :--- | ---: | ---: | ---: | :---: |
| claim.and (positive & even) | 95.7K | 97.5K | +1.9% | ≈ |
| claim.check negative branch | 226.4K | 230.5K | +1.8% | ≈ |
| claim.check positive number | 180.7K | 182.4K | +0.9% | ≈ |
| claim.on (object.value) | 82.1K | 85.0K | +3.5% | ≈ |
| claim.or (number | string) | 183.2K | 183.8K | +0.3% | ≈ |

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
| claim.check negative branch | 230.5K | 4.3382 | ±0.28% | 5.7300 | 230,509 |
| claim.or (number | string) | 183.8K | 5.4401 | ±0.21% | 5.4880 | 183,822 |
| claim.check positive number | 182.4K | 5.4833 | ±0.26% | 6.4960 | 182,373 |
| claim.and (positive & even) | 97.5K | 10.2564 | ±0.22% | 12.6280 | 97,501 |
| claim.on (object.value) | 85.0K | 11.7616 | ±0.21% | 14.5660 | 85,023 |

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
