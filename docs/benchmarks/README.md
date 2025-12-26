# Benchmark Summaries

This directory tracks human-readable summaries for Howard's benchmark suites. Machine-readable outputs live under `benchmarks/results/<branch>/latest.json` and mirror the branch that produced them (`main`, `develop`, or feature branches). Each suite maintains its own markdown report that explains the scenario, highlights the latest numbers, and calls out risks or follow-up actions.

## How to record benchmarks

- Run all suites locally: `npm run bench`
- Record results for a specific branch (updates both JSON and docs):
  - `npm run bench:record -- --branch develop`
  - `npm run bench:record -- --branch main`
- The helper script auto-detects the current Git branch when no `--branch` flag is provided.

## Adding new suites

1. Create the benchmark in `benchmarks/suites/`.
2. Document the data generators and control knobs in `benchmarks/harness/`.
3. Capture a summary markdown file in `docs/benchmarks/`.
4. Update or create baselines for `main` and `develop` via `npm run bench:record`.

See `claim-performance.md` for an example format.
