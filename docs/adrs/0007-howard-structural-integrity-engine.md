# ADR 0007: Howard Structural Integrity Engine

## Status
Proposed

## Context
- Relational Fabric requires a deterministic way to map arbitrary JavaScript object graphs into verifiable addresses that underpin Claims and fast predicate dispatch.
- Howard is positioned to become the invariant integrity primitive inside the ecosystem, and must therefore supply predictable hashes for values, references, and their joint composition.
- A fast object hash composition function is expected to land soon; this ADR captures the surrounding Structural Integrity Engine (SIE) that will manage metadata, incremental updates, and axiomatic termination guarantees around that capability.
- **Fabric of Proof**: The SIE is part of the shift from an "infrastructure of suspicion" (repeated validation) to a "fabric of proof" where data carries verifiable claims. Hashes serve as proofs, not checks.
- **Structure Independence**: The SIE must operate on data structures polymorphically, using Canon's protocol system (e.g., `PAssoc`) for structure-independent property access rather than container-specific logic.
- **Proof Persistence**: Hashes enable proof persistence—once computed, proofs travel with data as persistent annotations, eliminating the need for defensive re-interrogation at boundaries.

## Decision

### Goal and Acceptance Criteria
| Hash Type | Notation | Operational Goal | Acceptance Condition |
| :--- | :--- | :--- | :--- |
| Complete Hash | `H_J` | Contextual Stability | `H_J = Hash(H_V || H_R)` and it changes **iff** `H_V` **or** `H_R` changes. |
| Value Hash | `H_V` | Structural Integrity | Always terminates for cyclic graphs and opaque types by delegating axiomatic resolution. |
| Reference Hash | `H_R` | Ontological Stability | Resolves to a stable identity; if Canon returns `undefined` for `IdAxiom` or `HashableAxiom`, `structuralHash` throws (Fail-Fast Invariant). |

### Integrity Metadata Record (IMR)
Howard stores state using Canon's metadata primitives (`meta.ts`), maintaining an Integrity Metadata Record on every managed subject:
- `H_V`, `H_R`, `H_J` (`string`): the three verifiable hashes.
- `dirty_V` (`boolean`): marks the cached `H_V` as invalid, triggering recomputation on the next read under LTEP.
- `dependents` (`WeakSet<object>`): parent objects that consume this subject's `H_V`, ensuring reachability tracking without leaks.
- `partialComputation` (`Record<string, unknown>`): checkpoints used to resume or incrementally update `H_V` calculations.

### Operational Model (Lazy-Triggered Eager Propagation)
- **Lazy writes:** mutations mark `dirty_V` and update dependency graphs but defer hash recomputation.
- **Eager reads:** accessing `H_V`, `H_R`, or `H_J` forces recalculation if `dirty_V` is set, using any available `partialComputation` checkpoints for acceleration.
- **Dual entry points:** `structuralHashSync` and `structuralHashAsync` share identical semantics; the async variant may offload heavy folding to workers but must resolve to the same hash triple.
- **Environment-Adaptive Implementation**: The underlying hashing primitives use Canon's lazy module pattern to automatically select optimal implementations (native Node-API, WASM, or pure JavaScript) based on runtime capabilities, ensuring peak performance while maintaining universal compatibility.

### Hash Computation Pipeline
1. **Reference Hash (`H_R`):** Query Canon for `IdAxiom` or `HashableAxiom`. If both return `undefined`, throw a fatal exception. Otherwise produce a stable reference hash (e.g., salted identity digest).
2. **Value Hash (`H_V`):**
   - **Structure-Independent Traversal**: Enumerate properties using Canon's `PAssoc` protocol (or equivalent associative protocol) rather than direct property access. This enables polymorphic traversal across POJOs, Maps, Immutable structures, and other associative containers.
   - Traverse enumerable properties using the hashing algorithm defined for Howard's fast hashing module, operating on the relational projection of the data structure.
   - Manage cycles by injecting the child object's `H_R` as the placeholder value when revisiting an already-seen node.
   - Resolve opaque values through Canon's `HashableAxiom`, hashing the returned dual.
3. **Complete Hash (`H_J`):** Compute `Hash(concat(H_V, H_R))` using the same primitive hash family (xxHash3-128) to guarantee contextual stability.

**Relational Operations**: The pipeline uses relational operations (projection, selection) from the Universal API rather than imperative traversal, maintaining structure independence and aligning with the shift from structure-awareness to polymorphic dispatch.

### Dependency Management and Active Cleanup
- Each child IMR maintains a weak set of dependents; during cleanup, the child verifies each parent's reference via strict equality and removes stale parents.
- Parents register with children whenever their `H_V` incorporates the child's value hash, enabling targeted invalidations.
- All dependency tracking must use `WeakSet<object>` to maintain memory safety.

### Axiomatic Termination Guarantees
- **Cycles:** rely on Canon's `IdAxiom` to supply `H_R` placeholders, preventing infinite recursion.
- **Opaque Types:** defer to `HashableAxiom` to obtain finite representations suitable for hashing.
- Failure to obtain either axiom result is treated as a structural anomaly and triggers an immediate exception.

## Rationale
1. **Integrity as a Primitive:** Explicitly modeling `H_V`, `H_R`, and `H_J` gives Claims and proofs stable anchors across distributed systems, enabling the shift from validation (ephemeral checks) to claims (persistent proofs).
2. **Eliminating the Logical Tax:** Fast hashing transforms proof generation from expensive runtime checks into near-zero-cost lookups, directly addressing the computational overhead of verifying complex claims.
3. **Fabric of Proof:** Hashes serve as proofs that travel with data, eliminating the need for defensive re-interrogation at boundaries. This moves from an "infrastructure of suspicion" to a "fabric of proof" where data carries verifiable claims.
4. **Incremental Performance:** The LTEP model minimizes write overhead while providing fast, deterministic reads via cached metadata and partial computations.
5. **Graph Health:** Active cleanup ensures dependency graphs stay accurate, even under complex mutations.
6. **Axiomatic Extensibility:** Delegating identity and opacity handling to Canon keeps Howard future-proof as new axioms emerge.
7. **Deterministic Termination:** Injecting reference placeholders and hashable duals guarantees termination across cycles and opaque values without compromising traceability.
8. **Structure Independence:** Using protocols for property access eliminates structure-awareness, enabling polymorphic hashing across container types without conditional logic—aligning with the universal API approach.

## Consequences

### Positive
- Deterministic, verifiable hashes for arbitrary object graphs.
- Efficient incremental recomputation aligned with Howard's fast hashing pipeline.
- Robust fail-fast behavior when Canon cannot certify structural identity.
- Memory-safe dependency tracking through weak references.

### Negative
- Requires tight coupling with Canon's axiom resolution APIs.
- Additional metadata management overhead per object.
- Complexity in maintaining coherent partial computation checkpoints.
- Async pathways necessitate worker/thread management to match sync semantics.

## Open Questions
- Should `partialComputation` adopt a standardized schema to enable pluggable strategies?
- What telemetry is required to debug fail-fast scenarios in production environments?
- Do we expose configuration knobs for choosing hash width or primitive (e.g., 64-bit vs 128-bit) per deployment?

## References
- ADR 0001: Use Canon as Foundation
- ADR 0006: Fast Object Hashing Composition Function
- Canon Protocols and Lazy Modules: Structure-independent operations and environment-adaptive implementations
- "The Logic of Claims": The Logical Tax, fabric of proof, and proof persistence concepts
- "The Return to Canon": Protocols, lazy modules, universal API, and the structure-awareness problem
