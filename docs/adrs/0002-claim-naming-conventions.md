# 2. Claim Naming Conventions

Date: 2025-11-09

## Status

Accepted

## Context

When transforming predicates and type guards into claims, we need naming conventions that are:
1. Consistent and predictable
2. Natural to read in English
3. Distinguishable between different kinds of claims
4. Type-safe and compatible with TypeScript's identifier rules

Howard transforms function names into claim names automatically. The challenge is determining what conventions best serve readability and usability.

## Decision

We adopt the following naming transformations:

### Predicates → Capital Claims
Predicates use the "Is" or "Has" prefix:
- `isEmpty` → `IsEmpty`
- `hasValue` → `HasValue`
- `isValidEmail` → `IsValidEmail`
- `custom` → `Custom` (fallback)

### Type Guards → Article Claims
Type guards use article forms ("a" or "an"):
- `isUser` → `aUser`
- `isObject` → `anObject`
- `isArray` → `anArray`
- `isItem` → `anItem`
- `hasCart` → `HasCart`

The article "an" is used when the word starts with letters A, E, I, or O (not U, which often has a consonant sound like "yoo").

### Rationale

1. **Predicates as Properties**: "IsEmpty" reads like a property or adjective - describing a characteristic
2. **Type Guards as Nouns**: "aUser" reads like a noun with an article - identifying what something is
3. **Possession**: "Has" prefix for both maintains consistency
4. **Natural English**: The conventions mirror how we'd speak: "is it empty?" vs "is it a user?"

## Consequences

### Positive

- **Readable composition**: `aUser.and(HasCart)` reads naturally
- **Clear distinction**: You can tell predicates from guards by their names
- **Type safety**: The naming preserves TypeScript's understanding
- **Predictable**: Given a function name, the claim name is deterministic

### Negative

- **Learning curve**: Users must learn the convention
- **Not all words fit**: Some words don't naturally take articles (numbers, booleans)
- **Vowel ambiguity**: "User" starts with U but sounds like "yoo" (consonant)

### Mitigations

- Document the conventions clearly in getting-started guide
- Provide examples showing the transformation
- Add unit tests verifying transformation logic
- For edge cases, users can manually alias: `const { aUser: TheUser } = claims(...)`

## Implementation

See:
- `src/claims/transform.ts` - Transformation functions
- `src/claims/transform.test.ts` - Comprehensive test coverage
- Examples demonstrating usage patterns

## Notes

The vowel detection is simplified to check the first letter after the prefix against [a, e, i, o], excluding 'u' which often has consonant sounds. This works for common cases but isn't perfect for all English words. If this becomes problematic, we could:
- Maintain a lookup table for exceptions
- Let users override with manual aliasing
- Provide a configuration option for custom transformations

For now, the simple rule serves the 90% case well.
