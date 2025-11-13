# ADR 0006: Fast Object Hashing Composition Function

## Status
Proposed

## Context
- Howard needs deterministic, high-performance object hashing to support incremental reasoning about structural equality.
- Running a full serialization pass on every hash request is too expensive for large or frequently-mutated objects.
- We control the runtime environment (Node ≥ 20) and can observe a stable per-object identifier plus a canonical mapping from property keys to precomputed value hashes.
- Hash invalidation for a single property key is already available; the missing piece is specifying how we compose per-key hashes into an object hash and how we keep the structure correct.

## Decision

### Function Inputs
The hash is derived from immutable inputs supplied by the runtime:
- `objectId`: a stable 64-bit random identifier unique per object.
- `entries`: a finite map `{ propertyKey → valueHash }` covering every enumerable property (string or symbol key) with its canonical value hash.

### Hash Function
Define two entry points that share the same composition logic:
- `objectHashSync(objectId, entries) -> Hash128`
- `objectHashAsync(objectId, entries) -> Promise<Hash128>`

Both variants apply the identical steps:
1. For each `(propertyKey, valueHash)` in `entries`, compute an **entry hash** using the tuple `(objectId, propertyKey, valueHash)`.
2. Combine all entry hashes through a commutative XOR fold.
3. Apply a final avalanche mix to the folded value to minimize collision bias.

`objectHashSync` executes entirely on the calling thread. `objectHashAsync` may offload the XOR fold and avalanche stages to a worker thread or native asynchronous binding but MUST resolve with the same result as the synchronous path.

Base primitive hashing uses `xxHash3` 128-bit (exposed via synchronous or worker-backed Node-API bindings) for its trade-off between throughput and avalanche quality, and `objectId` prevents cross-object collisions when identical key/value pairs appear in different objects.

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
3. **Consistent Snapshots**: With accurate metadata, consumers can treat `objectHash` as the canonical representation of the object's current structure.
4. **Deterministic Composition**: The algorithm depends only on well-defined inputs, keeping it independent from object iteration order or caller context.
5. **Native-Friendly**: `xxHash3` is available in modern Node runtimes through synchronous and worker-thread bindings with high throughput and negligible startup cost.

## Maintenance Requirements

- **Identifier Stability**: `objectId` must remain constant for the lifetime of the object.
- **Key Normalization**: Property keys must be hashed canonically (case-sensitive strings, symbol descriptions) to avoid aliasing.
- **Value Hash Fidelity**: Primitive hashing must be canonical (`-0` vs `0`, `NaN` normalization, bigint range bounds). For objects, read the child's `objectHash`; if unavailable, adopt before hashing.
- **Salt Quality**: `mixKey128` and any salts must retain avalanche properties to prevent structured collisions.
- **Concurrency Discipline**: Any future shared-memory strategy must synchronize mutations to avoid torn updates of the XOR fold.
- **Testing Matrix**: Include mutation stress tests (randomized operations) and collision-resistance property tests comparing to a baseline serializer hash.
- **Execution Contract**: `objectHashSync` must remain fully synchronous; `objectHashAsync` must resolve deterministically with the same value and support cancellation-resistant execution.
- **Observability**: Expose debug instrumentation (`Howard.__debugHash(object)`) to inspect intermediate entry hashes during development.

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
