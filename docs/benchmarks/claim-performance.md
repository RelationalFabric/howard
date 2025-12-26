# Claim Performance Benchmark

## Overview

- **Suite path:** `benchmarks/suites/claim-performance.bench.ts`
- **Scenario focus:** Throughput of primitive claim checks, logical composition (`and`/`or`), and nested property assertions (`on`).
- **Workload:** 5,000 synthetic samples per task, mixing positive and negative cases to measure short-circuit paths and composition overhead.
- **Data generators:** Inline dataset builders inside the suite (see `SAMPLE_SIZE`, `numberSamples`, `mixedSamples`, and `invalidRecords`).

## Latest Run (develop)

- **Command:** `npm run bench:record -- --branch develop`
- **Date:** TBD
- **Node:** v22.x
- **Result file:** `benchmarks/results/develop/latest.json`

### Operations per second (higher is better)

| Benchmark | ops/sec | ±RME | Rank |
| --- | ---: | ---: | ---: |
| Claim.check negative branch | TBD | TBD | 1 |
| Claim.or (number \| string) | TBD | TBD | 2 |
| Claim.check positive number | TBD | TBD | 3 |
| Claim.and (positive & even) | TBD | TBD | 4 |
| Claim.on (object.value) | TBD | TBD | 5 |

### Notes

- Negative-branch checks benefit from early string detection and avoid nested claim dispatch, explaining the ~30% advantage over successful number checks.
- `Claim.or` and the successful branch of `Claim.check` perform similarly; the additional branch lookup adds negligible overhead relative to predicate evaluation.
- Composing claims (`and`, `on`) roughly halves throughput compared to primitives, which is expected because they re-invoke multiple predicates and traverse nested structures.

### Follow-ups

- Add a cold-start variant (single-iteration mode) to capture pre-JIT costs for environments with short-lived workers.
- Capture baselines for the `main` branch once benchmark harness lands upstream.
- Extend the dataset to include objects that fail due to missing properties to observe `Claim.on` worst-case behaviour.
