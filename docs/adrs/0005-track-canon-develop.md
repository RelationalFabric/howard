## Title

Track Canon Develop Branch

## Status

Accepted <!-- 2025-11-13 -->

## Context

- Canon's getting-started guidance now assumes projects pull from the latest scaffolding and CLI improvements living on the `develop` branch.
- Howard relies on Canon for configuration templates (`tsconfig`, `eslint`) and type primitives (e.g. `Predicate`, `TypeGuard`, `typeGuard` factory).
- The current npm release (`1.2.x`) does not ship the updated CLI flow nor the dependency fixes we need (e.g. TypeScript declaration coverage, `ADR` tooling updates).
- Downstream packages that depend on Howard should not be forced to adopt Canon's develop stream yet.

## Decision

- Update `@relational-fabric/canon` in our `dependencies` to pull from `git+https://github.com/RelationalFabric/canon.git#develop`, ensuring we pick up the latest Canon tooling and docs.
- Loosen `peerDependencies.@relational-fabric/canon` to `>=1.2.0` so downstream consumers can stay on the latest tagged release while we ride the branch.
- Keep installation instructions aligned with Canon's getting-started doc (use `npm install --ignore-scripts` when necessary to avoid husky hooks).

## Consequences

- Local installs will fetch Canon directly from GitHub; contributors need git access and should expect slightly slower installs.
- Running `npm install` continues to require the `--ignore-scripts` flag until Canon's postinstall flow becomes optional.
- We must monitor Canon's develop branch for breaking changes and plan a revert to a tagged release once the next stable version lands.
- Documentation and examples already match the updated getting-started flow, so no further code changes were necessary.
