# ADR 0005: Benchmarking Strategy

## Status
Proposed

## Context
- As Howard evolves into the invariant integrity primitive for Relational Fabric, performance regressions directly impact predicate dispatch latency and claim verification throughput.
- Existing ADRs (0006, 0007) specify hashing algorithms and structural integrity mechanics but do not establish how performance characteristics will be measured or protected over time.
- The project currently lacks a consistent methodology or location for storing benchmark harnesses and historical results.

## Decision

### Benchmarking Principles
1. **Deterministic Harnesses:** Benchmarks must execute with fixed random seeds and clearly documented dataset generators to ensure reproducibility.
2. **Representative Scenarios:** Suites should capture realistic object graph shapes, mutation patterns, and Canon axiom resolutions relevant to production workloads.
3. **Continuous Tracking:** Results from main branch runs are stored to provide trend visibility; regressions trigger investigation before release.

### Repository Layout
- Create a top-level `benchmarks/` directory containing:
  - `benchmarks/harness/`: shared utilities, data generators, and Canon fixtures.
  - `benchmarks/suites/`: individual benchmark suites organized by feature area (e.g., hashing, integrity engine, naming).
  - `benchmarks/results/`: machine-readable output (JSON or CSV) captured by CI for longitudinal comparison.
- Benchmarks are versioned alongside code so historical context is preserved with each revision.

### Tooling & Execution
- Use Node ≥ 20 and `vitest`’s built-in benchmark runner (`vitest bench`) augmented with high-resolution timers (`performance.now`).
- Suites must expose both CLI (`npm run bench`) and programmatic interfaces so CI and local workflows share identical execution paths.
- Each suite documents minimum hardware expectations and how to run in isolation (`npm run bench -- --filter hashing`).

### CI Integration
- Add a non-blocking CI job (`benchmarks`) that:
  1. Installs dependencies with `npm ci`.
  2. Runs `npm run bench` with production build artifacts.
  3. Publishes results to `benchmarks/results/latest.json`.
- A follow-up alerting workflow compares `latest.json` with the previous baseline and posts findings to pull requests. Blocking behavior is deferred until confidence in variance thresholds is established.

### Governance
- Any feature impacting complexity (e.g., new Canon axioms, metadata policies) must add or update benchmark suites.
- Benchmarks are reviewed with the same rigor as tests; PRs modifying suites must include rationale for scenario selection and expected performance signatures.

## Rationale
1. **Regression Detection:** A dedicated benchmarking track catches performance drifts before they reach production.
2. **Shared Vocabulary:** Storing harnesses and results in a canonical location ensures contributors discuss performance using common data.
3. **Scalability:** Using `vitest bench` leverages existing tooling, minimizing maintenance overhead while supporting async and sync workloads.
4. **Transparency:** Persisted results make it easy to audit the impact of architectural changes, aiding decision-making for future ADRs.

## Consequences

### Positive
- Systematic performance validation across the codebase.
- Streamlined onboarding for contributors needing to measure new features.
- Historical baseline kept under version control, supporting data-driven decisions.

### Negative
- Additional CI time and resource usage.
- Ongoing maintenance of harnesses to keep scenarios representative.
- Potential flakiness if environmental controls are insufficient; requires discipline in test design.

## Open Questions
- Should we adopt statistical techniques (e.g., Student’s t-test) to automatically classify regressions vs noise?
- Do we need hardware-specific profiles (ARM vs x86) and how will we store them?
- How frequently should baselines be refreshed to reflect intentional improvements?

## References
- ADR 0006: Fast Object Hashing Composition Function
- ADR 0007: Howard Structural Integrity Engine
