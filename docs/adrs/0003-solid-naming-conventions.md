# ADR 0003: SOLID Principles and Naming Conventions

## Status
Accepted

## Context
As Howard's codebase grew, we needed clear conventions for naming classes, interfaces, and managing generic types to ensure maintainability and adherence to SOLID principles.

## Decision

### 1. Path-Prefixed Class Names
All classes are named with a path prefix derived from their file location:
- `src/Claim/And.ts` → exports `ClaimAnd`
- `src/Claim/Or.ts` → exports `ClaimOr`
- `src/Claim/On.ts` → exports `ClaimOn`
- `src/Condition/Eager.ts` → exports `ConditionEager`
- `src/Condition/Lazy.ts` → exports `ConditionLazy`

### 2. Interface Naming with `Interface` Suffix
Instead of `I` prefix (Hungarian notation), we use descriptive suffixes:
- ~~`IClaim`~~ → `ClaimInterface<T>`
- ~~`ICondition`~~ → `ConditionInterface<T>`
- ~~`IConditional`~~ → `ConditionalInterface<T>`

### 3. All Classes Implement Interfaces
Every class implements one or more interfaces without exception:

```typescript
export default class Claim<T> implements ClaimInterface<T> {
  // implementation
}

export default class ClaimAnd<T, U> implements ClaimInterface<T & U> {
  // implementation
}

export default class Condition<T> implements ConditionInterface<T> {
  // implementation
}

export default class ConditionEager<T> {
  // returns ConditionalInterface<T>
  toConditional(): ConditionalInterface<T> {
    // implementation
  }
}
```

### 4. No Default Generic Parameters
Generic types should not have defaults unless it's a fundamental feature. Instead, create type aliases that encode intent:

```typescript
// ❌ Bad: Default obscures intent
export interface ClaimBad<T = unknown> {
  check: (value: unknown) => value is T
}

// ✅ Good: Explicit generic, no default
export interface ClaimInterface<T> {
  check: (value: unknown) => value is T
}

// ✅ Good: Alias encodes intent
export type AnyClaim = ClaimInterface<unknown>
export type AnyCondition = ConditionInterface<unknown>
export type AnyConditional = ConditionalInterface<unknown>
```

### 5. SOLID Principles Applied

#### Single Responsibility Principle
Each class has one clear responsibility:
- `Claim` - wraps a predicate/guard, provides fluent composition API
- `ClaimAnd` - performs logical AND of two claims
- `ClaimOr` - performs logical OR of two claims
- `ClaimOn` - checks nested properties
- `Condition` - couples claim with reference function
- `ConditionEager` - eager evaluation strategy
- `ConditionLazy` - lazy evaluation strategy

#### Open/Closed Principle
Classes are open for extension (via composition) but closed for modification:
- Composition operators return new instances
- Immutable state throughout
- Strategies extend behavior without modifying core classes

#### Liskov Substitution Principle
All classes implementing `ClaimInterface<T>` are substitutable:
- `Claim`, `ClaimAnd`, `ClaimOr`, `ClaimOn` all implement the same interface
- Any `ClaimInterface<T>` can be used anywhere a claim is expected

#### Interface Segregation Principle
Interfaces are focused and minimal:
- `ClaimInterface<T>` - only claim-specific methods
- `ConditionInterface<T>` - only condition-specific methods
- `ConditionalInterface<T>` - callable + composition methods
- `ReferenceFn<T>` - single-purpose type alias

#### Dependency Inversion Principle
High-level modules depend on abstractions, not concretions:
- Composition classes depend on `ClaimInterface<T>`, not concrete `Claim`
- Strategy classes depend on `ClaimInterface<T>`, not concrete implementations
- Core `claims()` function returns `ClaimInterface<unknown>`

## Consequences

### Positive
- **Clear Intent**: Type aliases make generic usage explicit
- **Consistency**: Path-prefixed names create predictable structure
- **Type Safety**: No reliance on defaults that could hide type errors
- **Maintainability**: SOLID principles ensure code remains flexible
- **Discoverability**: Interface suffix makes interfaces easy to identify
- **Testability**: Interface-based design enables easy mocking

### Negative
- **Verbosity**: Longer names (e.g., `ConditionEager` vs `Eager`)
- **Migration Effort**: Existing code needed updates
- **Learning Curve**: Developers must understand the conventions

### Neutral
- More type aliases in codebase
- Explicit generics require more type annotations

## Examples

### Before

```typescript
interface Claim<T = unknown> {
  check: (value: unknown) => value is T
}

class And<T, U> implements Claim<T & U> {
  constructor(private left: Claim<T>, private right: Claim<U>) {}
}

// Uses default generic parameter
const result: Claim = createClaim(somePredicate)
```

### After

```typescript
interface ClaimInterface<T> {
  check: (value: unknown) => value is T
}

type AnyClaim = ClaimInterface<unknown>

class ClaimAnd<T, U> implements ClaimInterface<T & U> {
  constructor(private left: ClaimInterface<T>, private right: ClaimInterface<U>) {}
}

// Explicit intent via type alias
const result: AnyClaim = createClaim(somePredicate)
```

## References
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- Clean Code by Robert C. Martin
- TypeScript Deep Dive - Naming Conventions
