# Howard Examples - Contributing Guide

Howard examples follow the Canon example documentation pattern. Examples are executable TypeScript files that serve as both tests and auto-generated documentation.

## Example File Structure

Each example follows this structure:

```typescript
/**
 * @document.title Example Title
 * @document.description Brief description of what this demonstrates
 * @document.keywords keyword1, keyword2, keyword3
 * @document.difficulty introductory|intermediate|advanced
 */

/*
# Section Header

Narrative explanation in Markdown. Keep it peer-first - explain concepts
as you would to a colleague, not a student.
*/

// ```
// Code blocks use special fences for grouping related code
import { claims } from '@relational-fabric/howard'

const example = 'code here'
// ```

/**
 * # Function Documentation
 *
 * Use JSDoc for function, type, class, and interface definitions.
 * Headers are optional but recommended for clarity.
 *
 * @param value - Description of parameter
 * @returns Description of return value
 */
export function exampleFunction(value: unknown): boolean {
  return true
}

// Tests are the primary evidence
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('describes what this test verifies', () => {
    expect(exampleFunction('test')).toBe(true)
  })
}
```

## Key Principles

1. **Narrative First**: Write for understanding, not just correctness
2. **Tests as Evidence**: Use Vitest tests (`import.meta.vitest`) to verify claims
3. **Little and Often**: Place tests immediately after the concept they verify
4. **No Console Logs**: Tests are the evidence, not `console.log()`
5. **Peer Tone**: Explain concepts colleague-to-colleague

## File-Level Metadata

All examples must include file-level JSDoc with:

- `@document.title` - Clear, descriptive title
- `@document.description` - One-sentence summary
- `@document.keywords` - Comma-separated keywords for searchability
- `@document.difficulty` - One of: `introductory`, `intermediate`, `advanced`

## Code Block Types

### Narrative Comments
Use `/* ... */` for markdown prose:
```typescript
/*
# Defining Claims

Claims are Howard's way of making logical assertions verifiable.
*/
```

### Loose Code Blocks
Use `// ``` ... // ``` ` for code that isn't a definition:
```typescript
// ```
import { claims } from '@relational-fabric/howard'

const { IsEmpty } = claims({ predicates: { isEmpty } })
// ```
```

### Definitions
Use JSDoc for functions, types, classes:
```typescript
/**
 * Checks if a value is empty.
 *
 * @param value - The value to check
 * @returns True if empty, false otherwise
 */
function isEmpty(value: unknown): boolean {
  return false
}
```

### Tests
Tests verify the example works:
```typescript
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('empty object satisfies isEmpty', () => {
    expect(isEmpty({})).toBe(true)
  })
}
```

## Naming Convention

Examples should be numbered and descriptive:
- `01-basic-predicate-claim.ts` - First example, basic concept
- `02-type-guards.ts` - Second example, type guards
- `03-composition.ts` - Third example, composing claims

## Running Examples

Examples run as tests:
```bash
npm test                  # Run all examples
npm run test:watch        # Watch mode
```

## Documentation Generation

When Canon's example builder is available, these examples will automatically generate documentation. The format is designed to be human-readable in source form and beautiful when rendered.

## More Information

For complete details on the Canon example pattern, see:
https://relationalfabric.github.io/canon/docs/example-docs/
