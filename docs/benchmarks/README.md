# Benchmark Documentation

This directory tracks benchmark documentation for Howard's performance suites.

## Reports

- **[comparison.md](./comparison.md)** - Comparative report between `main` and `develop` branches (auto-generated)
- **[claim-performance.md](./claim-performance.md)** - Detailed documentation of the Claim performance benchmark suite

## Data Storage

Machine-readable outputs live under `benchmarks/results/<branch>/latest.json` and mirror the branch that produced them (`main`, `develop`, or feature branches).

## Commands

| Command | Description |
| :--- | :--- |
| `npm run bench` | Run benchmarks interactively (results not saved) |
| `npm run bench:record` | Record benchmarks for current branch and regenerate comparison report |
| `npm run bench:record -- --branch main` | Record benchmarks explicitly for `main` branch |
| `npm run bench:record -- --branch develop` | Record benchmarks explicitly for `develop` branch |
| `npm run bench:report` | Regenerate comparison report from existing JSON results |

## Workflow

### Recording Baseline Results

```bash
# Record main branch baseline
git checkout main
npm run bench:record -- --branch main

# Record develop branch baseline
git checkout develop
npm run bench:record -- --branch develop
```

The `bench:record` command automatically regenerates the [comparison report](./comparison.md) after recording.

### Adding New Benchmark Suites

1. Create the benchmark in `benchmarks/suites/` (e.g., `my-feature.bench.ts`)
2. Document data generators and control knobs in the suite file
3. Add a detailed documentation file in `docs/benchmarks/` (e.g., `my-feature.md`)
4. Record baselines for both branches

See [claim-performance.md](./claim-performance.md) for an example format.
