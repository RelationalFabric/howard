# ADR 0004: Relations vs Types API Distinction

## Status
Accepted

## Context
The original `claims()` API used `predicates` and `guards` keys, but this created ambiguity since every TypeGuard is also a Predicate (both return boolean). Without runtime type inference, users had to arbitrarily choose which bucket to use based solely on desired naming, not semantic meaning.

## Decision

Rename the API keys to clarify intent:
- `predicates` → **`relations`** (boolean propositions about relationships)
- `guards` → **`types`** (type narrowing functions)

### New API

```typescript
claims({
  relations: { isEmpty, hasValue }, // Boolean checks → Is*, Has*
  types: { isUser, hasCart }, // Type narrowing → a*, an*, Has*
})
```

### Naming Rules

**`relations` (Boolean Propositions)**:
- `isEmpty` → `IsEmpty`
- `hasValue` → `HasValue`
- `isValid` → `IsValid`

**`types` (Type Narrowing)**:
- `isUser` → `aUser`
- `isEmpty` → `anEmpty`
- `hasCart` → `HasCart`

## Rationale

1. **Semantic Clarity**: "relations" describes boolean relationships/propositions, "types" describes type narrowing
2. **Intent over Implementation**: The choice is about what you're modeling, not technical implementation details
3. **Flexibility**: A `TypeGuard` can be used as a relation (if you want `IsX` naming) since it's also a Predicate
4. **Future-Proof**: Clearer distinction if/when runtime type inference becomes possible

## Consequences

### Positive
- **Clear Intent**: Users know `relations` = propositions, `types` = narrowing
- **Semantic Names**: Key names reflect purpose, not implementation detail
- **Better Documentation**: Easier to explain and learn
- **Flexible Usage**: TypeGuards work in either bucket based on desired naming

### Negative
- **Breaking Change**: Existing code using `predicates`/`guards` must migrate
- **Learning Curve**: New terminology to understand
- **Documentation Update**: All examples and guides need updating

### Migration Guide

```typescript
// Before
claims({
  predicates: { isEmpty, hasValue },
  guards: { isUser, hasCart },
})

// After
claims({
  relations: { isEmpty, hasValue },
  types: { isUser, hasCart },
})
```

## Examples

```typescript
import type { Predicate, TypeGuard } from '@relational-fabric/canon'
import { typeGuard } from '@relational-fabric/canon'
import { claims } from '@relational-fabric/howard'

// TypeGuard can be used flexibly
type EmptyValue = [] | Record<string, never> | ''
const isEmpty: TypeGuard<EmptyValue> = typeGuard<EmptyValue>((value) => {
  // implementation
})

// Use as relation for IsEmpty name
const { IsEmpty } = claims({ relations: { isEmpty } })

// OR use as type for anEmpty name
const { anEmpty } = claims({ types: { isEmpty } })
```

## References
- ADR 0002: Claim Naming Conventions
- [Canon TypeGuard](https://relationalfabric.github.io/canon/docs/reference/api.html#typeguard-t)
