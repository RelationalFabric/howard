# ADR 0008: Use Canon NPM Release

## Status

Accepted

## Context

- ADR 0005 previously established tracking Canon's `develop` branch via git dependency to access latest CLI improvements and dependency fixes.
- Canon version 1.3.0 has been released to npm, containing the necessary updates that were previously only available on the `develop` branch.
- Using a git dependency has drawbacks:
  - Requires git access for all contributors
  - Slower install times
  - Potential for instability from unreleased changes
  - Complicates dependency resolution for downstream consumers
- NPM releases provide stable, versioned dependencies that are easier to manage and more reliable for production use.

## Decision

- Supersede ADR 0005: Track Canon Develop Branch
- Update `@relational-fabric/canon` dependency in `package.json` to use npm version `1.3.0` instead of the git dependency
- Maintain `peerDependencies.@relational-fabric/canon` at `>=1.2.0` to allow flexibility for downstream consumers
- Remove the git dependency reference and rely on the published npm package

## Consequences

### Positive

- **Stable dependencies**: Using a published npm release provides predictable, versioned dependencies
- **Faster installs**: npm packages install faster than git dependencies
- **Better compatibility**: npm packages are more compatible with standard tooling and CI/CD pipelines
- **Easier maintenance**: Version pinning makes it clear which Canon version Howard depends on
- **No git requirement**: Contributors don't need git access to install dependencies

### Negative

- **Delayed updates**: Must wait for npm releases to get new Canon features (vs. immediate access to develop branch)
- **Version management**: Need to explicitly update the version number when upgrading Canon

### Neutral

- Downstream consumers can continue using any Canon version >= 1.2.0 via peerDependencies
- Documentation and examples remain unchanged as they already reference npm-installed Canon

## References

- ADR 0001: Use Canon as Foundation
- ADR 0005: Track Canon Develop Branch (Superseded by this ADR)
