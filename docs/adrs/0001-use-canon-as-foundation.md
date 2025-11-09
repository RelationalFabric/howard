# 1. Use Canon as Foundation

Date: 2025-11-09

## Status

Accepted

## Context

Howard is a logical engine for building truly relational data systems. It implements the Curry-Howard correspondence, transforming predicates into first-class claim objects that can be composed, checked, and proven.

To build Howard, we need:
- Type primitives for predicates and type guards
- Runtime metadata attachment without object pollution
- Content-based hashing for value semantics
- Immutable data structures for structural sharing
- A curated set of utilities that work together coherently

We could either:
1. Select and integrate multiple third-party libraries independently
2. Build all primitives from scratch
3. Use Canon as a cohesive foundation

Canon provides:
- The lazy typing pattern (axioms, canons, universal APIs)
- `Predicate<T>` and `TypeGuard<T>` interfaces with proper variance
- Runtime metadata APIs via `reflect-metadata`
- Content-based hashing via `object-hash`
- Immutable data structures via `Immutable.js`
- Pre-configured TypeScript and ESLint setups
- A curated library ecosystem as a canonical starting point

## Decision

We will use Canon as Howard's foundation, importing its primitives directly rather than re-exporting them.

Users will import Canon types directly:
```typescript
import { Predicate, TypeGuard } from '@relational-fabric/canon'
import { claims, type Claim } from '@relational-fabric/howard'
```

This makes the architectural layering explicit:
- **Canon** provides universal type primitives and utilities
- **Howard** provides the logical engine built on those primitives

## Consequences

### Positive

- **Honest architecture**: The layering is clear and explicit
- **No indirection**: Canon types are Canon types, reducing confusion
- **Focused scope**: Howard only exports Howard-specific concepts
- **Reduced maintenance**: Canon changes don't require Howard updates
- **Coherent ecosystem**: All utilities (hashing, metadata, immutability) work together
- **Better DX**: Users can leverage Canon's full capabilities alongside Howard

### Negative

- **Two import statements**: Users need both Canon and Howard imports
- **Dependency coupling**: Howard is tightly coupled to Canon's type system
- **Learning curve**: Users must understand both libraries

### Neutral

- Canon is a peer dependency, explicitly declared
- Howard's examples will demonstrate both Canon and Howard usage patterns
- Documentation must clearly explain the relationship between the two libraries

## Notes

This decision aligns with the principle that foundational primitives should be visible and explicit. Like React Hook libraries don't re-export React, Howard doesn't re-export Canon.

The relationship is: **Canon provides the language, Howard provides the semantics.**

