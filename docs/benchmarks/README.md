# Benchmark Documentation

This directory tracks benchmark documentation for Howard's performance suites.

## Reports

- **[comparison.md](./comparison.md)** - Comparative report between `main` and `develop` branches (auto-generated)
- **[claim-performance.md](./claim-performance.md)** - Detailed documentation of the Claim performance benchmark suite

## Data Storage

Machine-readable outputs live under `benchmarks/results/<branch>/` with the following naming convention:

| File | Description |
|:---|:---|
| `<batchId>-run<runId>.json` | Individual benchmark run result |
| `latest.json` | Aggregated result from the most recent batch (used for comparison report) |

### Batch and Run IDs

- **Batch ID**: Groups runs from the same workflow trigger (timestamp-based locally, workflow run ID in CI)
- **Run ID**: Identifies individual executions within a batch (1, 2, 3, etc.)

When multiple runs exist for the same batch, they are automatically aggregated using:
- Geometric mean for ops/sec (better for rate metrics)
- Arithmetic mean for timing metrics
- Min of mins, max of maxes for range

## CI Workflow

Benchmarks run automatically via GitHub Actions when changes are pushed to `main` or `develop`:

1. **Trigger**: Push to `main` or `develop` (or manual workflow dispatch)
2. **Execute**: Benchmarks run on CI infrastructure
3. **Branch**: Results committed to `bench/<branch>` (e.g., `bench/main`, `bench/develop`)
4. **PR**: Automated PR opened to `develop` with updated results

### Branch Strategy

```
bench/main ────► develop ────► main
bench/develop ─┘
```

All benchmark PRs target `develop` because:
- `main` and `develop` are protected branches
- Path to `main` must always go via `develop`
- This ensures benchmark updates follow the standard review process

### Manual Trigger

You can trigger benchmarks manually from the Actions tab:
1. Go to Actions → Benchmarks workflow
2. Click "Run workflow"
3. Select the branch to benchmark (`main` or `develop`)

## Local Commands

| Command | Description |
| :--- | :--- |
| `npm run bench` | Run benchmarks interactively (results not saved) |
| `npm run bench:record` | Record benchmarks for current branch |
| `npm run bench:report` | Regenerate comparison report from existing JSON results |

### Recording Options

```bash
# Basic recording (auto-generates batch ID from timestamp)
npm run bench:record -- --branch develop

# Multiple runs with same batch for aggregation
npm run bench:record -- --branch develop --batch mybatch --run 1
npm run bench:record -- --branch develop --batch mybatch --run 2
npm run bench:record -- --branch develop --batch mybatch --run 3

# Aggregate-only mode (skip benchmarks, just aggregate existing batch files)
npm run bench:record -- --branch develop --batch mybatch --aggregate-only
```

## Local Workflow

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
