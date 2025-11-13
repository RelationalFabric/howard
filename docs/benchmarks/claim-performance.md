# Claim Performance Benchmark

## Overview

- **Suite path:** `benchmarks/suites/claim-performance.bench.ts`
- **Scenario focus:** Throughput of primitive claim checks, logical composition (`and`/`or`), and nested property assertions (`on`).
- **Workload:** 5,000 synthetic samples per task, mixing positive and negative cases to measure short-circuit paths and composition overhead.
- **Data generators:** Inline dataset builders inside the suite (see `SAMPLE_SIZE`, `numberSamples`, `mixedSamples`, and `invalidRecords`).

## Latest Run (develop)

- **Command:** `npm run bench:record -- --branch develop`
- **Date:** 2025-11-13
- **Node:** v22.21.1
- **Result file:** `benchmarks/results/develop/latest.json`

### Operations per second (higher is better)

| Benchmark | ops/sec | ±RME | Rank |
| --- | ---: | ---: | ---: |
| Claim.check negative branch | 238,156 | ±0.14% | 1 |
| Claim.or (number \| string) | 183,907 | ±0.14% | 2 |
| Claim.check positive number | 183,792 | ±0.24% | 3 |
| Claim.and (positive & even) | 103,517 | ±0.14% | 4 |
| Claim.on (object.value) | 83,358 | ±0.14% | 5 |

### Notes

- Negative-branch checks benefit from early string detection and avoid nested claim dispatch, explaining the ~30% advantage over successful number checks.
- `Claim.or` and the successful branch of `Claim.check` perform similarly; the additional branch lookup adds negligible overhead relative to predicate evaluation.
- Composing claims (`and`, `on`) roughly halves throughput compared to primitives, which is expected because they re-invoke multiple predicates and traverse nested structures.

### Follow-ups

- Add a cold-start variant (single-iteration mode) to capture pre-JIT costs for environments with short-lived workers.
- Capture baselines for the `main` branch once benchmark harness lands upstream.
- Extend the dataset to include objects that fail due to missing properties to observe `Claim.on` worst-case behaviour.
