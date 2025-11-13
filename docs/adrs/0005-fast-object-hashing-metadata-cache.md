# ADR 0005: Fast Object Hashing via Metadata Cache

## Status
Proposed

## Context
- Howard needs deterministic, high-performance object hashing to support incremental reasoning about structural equality.
- Running a full serialization pass on every hash request is too expensive for large or frequently-mutated objects.
- We control the runtime environment (Node ≥ 20) and can attach opaque metadata to every managed object without exposing it to userland.
- The runtime already exposes hooks for property definition, mutation, and deletion; we can rely on those hooks to keep cached metadata in sync.
- Hash invalidation for a single property key is already available; the missing piece is specifying how we compose per-key hashes into an object hash and how we keep the structure correct.

## Decision

### Overview
We will attach a metadata record to each managed object that caches:
- `objectHash`: the current 128-bit hash of the object's own enumerable properties.
- `keyEntries`: a side table keyed by property name (string or symbol) storing the last known hash contribution for that property.
- `version`: a monotonic counter that increments every time any property-level mutation occurs, enabling cheap stale-checking by consumers.

All metadata is stored in an out-of-band side table (e.g. `WeakMap<object, Metadata>`) so that the object graph remains serializable without leaking the cache to userland.

### Hash Function
- Base primitive hashing uses `xxHash3` 128-bit (available via native addon) for its trade-off between throughput and avalanche quality.
- Object hashing is compositional:
  1. Each property contributes an **entry hash** derived from the tuple `(objectId, propertyKey, valueHash)`.
  2. Entry hashes are combined through a commutative XOR fold, followed by a final avalanche mix to minimize collision bias.
- `objectId` is a stable 64-bit random value assigned once per object to prevent cross-object collisions when identical key/value pairs appear in different objects.

### Entry Hash Formula
```
entryHash(key, valueHash) =
  avalanche128(
    xor128(
      mixKey128(hashKey(key)),
      valueHash,
      objectIdSalt
    )
  )
```
- `hashKey(key)` hashes the property name (string or symbol description) with the same `xxHash3` primitive.
- `mixKey128` is a lightweight permutation that biases key material across both 64-bit lanes.
- `objectIdSalt` is the stable identifier assigned to the owning object.

### Object Hash Composition
```
objectHash = finalize128(
  xorFold(keyEntries.values())
)
```
- `xorFold` XORs the 128-bit lanes of every entry hash.
- `finalize128` runs a final avalanche step to mitigate the slight bias introduced by XOR.
- Empty objects produce the fixed constant `EMPTY_OBJECT_HASH`.

### Structural Interpretation
- Arrays contribute entry hashes for stringified integer indices plus a pseudo-key `length`, ensuring structural equivalence regardless of construction order.
- Typed collections (`Map`, `Set`, `WeakMap`, `WeakSet`) expose deterministic iterable snapshots; each entry is hashed as `(collectionId, elementSalt, elementHash)` so the aggregate remains order-independent.

## Rationale
1. **Incremental O(1) Updates**: Storing per-key contribution hashes lets us avoid recomputing unaffected properties.
2. **Stable Composition**: XOR folding with per-object salts keeps the hash order-independent while guarding against identical sub-structure collisions.
3. **Version Tracking**: Consumers can perform optimistic reads by comparing the cached version before/after operations.
4. **Runtime Isolation**: Side-table metadata avoids polluting user-visible object shapes, keeping the mechanism transparent.
5. **Native-Friendly**: `xxHash3` is available in modern Node runtimes with high throughput and negligible startup cost.

## Maintenance Requirements

- **Hook Coverage**: Every mutation path (direct `set`, `defineProperty`, `delete`, `Object.assign`, spread, array mutators, structured cloning) must funnel into a mechanism that re-evaluates affected entry hashes.
- **Invalidation Propagation**: When a property's value is another managed object whose `version` changes, the parent must receive a `keyInvalidated` signal so the corresponding entry hash can be recomputed.
- **Value Hash Fidelity**: Primitive hashing must be canonical (`-0` vs `0`, `NaN` normalization, bigint range bounds). For objects, we must read the child's `objectHash`; if unavailable, adopt before hashing.
- **Garbage Safety**: Metadata is stored in `WeakMap` so that unreferenced objects can be collected without manual cleanup.
- **Concurrency Discipline**: Any future shared-memory strategy must synchronize mutations to avoid torn updates of the XOR fold.
- **Testing Matrix**: Include mutation stress tests (randomized operations) and collision-resistance property tests comparing to a baseline serializer hash.
- **Observability**: Expose debug instrumentation (`Howard.__debugHash(object)`) to introspect entry hashes and versions during development.

## Consequences

### Positive
- Constant-time hash maintenance for single-key updates.
- Deterministic, order-independent hashes even under property reordering.
- Transparent integration; consumers interact with plain objects.
- Ready path for incremental invalidation across nested structures.

### Negative
- Requires strict control over object creation and mutation pathways.
- Additional memory overhead per object for metadata and per-key cache.
- Native dependency on `xxHash3` or equivalent high-quality hash primitive.
- More complex debugging when metadata becomes inconsistent; relies on tooling support.

## Open Questions
- Do we need configurable hash width (64 vs 128 vs 256 bits) for different deployments?
- How should we handle non-enumerable or accessor properties—hash getter results, definitions, or ignore entirely?
- Should metadata capture history for time-travel debugging, or is `version` monotonicity sufficient?

## References
- [xxHash3 128-bit reference implementation](https://cyan4973.github.io/xxHash/)
- ADR 0001: Use Canon as Foundation
