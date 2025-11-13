/**
 * @document.title Basic Predicate Claims
 * @document.description Transform pure predicates into first-class claim objects that can check values
 * @document.keywords claims, predicates, check, curry-howard
 * @document.difficulty introductory
 */

/*
# The Foundation: From Boolean Functions to Claims

In traditional programming, we write functions that return booleans. These work,
but they're ephemeral—they exist only at the moment of evaluation. Howard
transforms these humble predicates into something more: first-class claim objects
that embody the Curry-Howard correspondence.

A claim is not just a function; it's a verifiable proposition about data.
*/

/*
# Defining a Simple Predicate

We start with a pure function—a predicate that tests for emptiness. This is
the kind of logic you write every day, but we're about to give it structure.
*/

// ```
// ```

/*
# The Transformation

The `claims()` function is Howard's gateway. It takes your predicates and
elevates them into claim objects. Notice the naming convention: `isEmpty`
becomes `IsEmpty`. This isn't arbitrary—it signals the shift from function
to proposition.
*/

// ```
import { typeGuard } from '@relational-fabric/canon'
import { claims } from '@relational-fabric/howard'

// Empty values can be empty arrays, empty objects, or empty strings
type EmptyValue = [] | Record<string, never> | ''

const isEmpty = typeGuard<EmptyValue>((value: unknown): value is EmptyValue => {
  if (Array.isArray(value)) {
    return value.length === 0
  }
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).length === 0
  }
  if (typeof value === 'string') {
    return value.length === 0
  }
  return false
})

const { IsEmpty } = claims({
  relations: { isEmpty },
})
// ```

/*
# Checking Values

A claim has a `.check()` method. This is where the proposition meets reality.
Unlike the raw predicate, the claim carries with it the semantic weight of
what it represents—not just "does this return true?" but "does this value
satisfy the IsEmpty proposition?"
*/

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('An empty object satisfies the IsEmpty claim', () => {
    expect(IsEmpty.check({})).toBe(true)
  })

  it('An object with properties does not satisfy IsEmpty', () => {
    expect(IsEmpty.check({ a: 1 })).toBe(false)
  })

  it('An empty array satisfies the IsEmpty claim', () => {
    expect(IsEmpty.check([])).toBe(true)
  })

  it('An array with elements does not satisfy IsEmpty', () => {
    expect(IsEmpty.check([1, 2, 3])).toBe(false)
  })

  it('An empty string satisfies the IsEmpty claim', () => {
    expect(IsEmpty.check('')).toBe(true)
  })

  it('A string with content does not satisfy IsEmpty', () => {
    expect(IsEmpty.check('hello')).toBe(false)
  })

  it('Numbers do not satisfy IsEmpty', () => {
    expect(IsEmpty.check(0)).toBe(false)
    expect(IsEmpty.check(42)).toBe(false)
  })
}

/*
# Multiple Predicates

You can define multiple predicates at once. Each gets transformed into its
own claim, following the same naming conventions.
*/

// ```
function isPositive(value: unknown): boolean {
  return typeof value === 'number' && value > 0
}

function hasLength(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0
  }
  if (typeof value === 'string') {
    return value.length > 0
  }
  return false
}

const { IsPositive, HasLength } = claims({
  relations: {
    isPositive,
    hasLength,
  },
})
// ```

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('Positive numbers satisfy the IsPositive claim', () => {
    expect(IsPositive.check(42)).toBe(true)
    expect(IsPositive.check(0.1)).toBe(true)
  })

  it('Zero and negative numbers do not satisfy IsPositive', () => {
    expect(IsPositive.check(0)).toBe(false)
    expect(IsPositive.check(-5)).toBe(false)
  })

  it('Non-numbers do not satisfy IsPositive', () => {
    expect(IsPositive.check('42')).toBe(false)
    expect(IsPositive.check(null)).toBe(false)
  })

  it('Non-empty arrays and strings satisfy HasLength', () => {
    expect(HasLength.check([1, 2, 3])).toBe(true)
    expect(HasLength.check('hello')).toBe(true)
  })

  it('Empty arrays and strings do not satisfy HasLength', () => {
    expect(HasLength.check([])).toBe(false)
    expect(HasLength.check('')).toBe(false)
  })

  it('Values without length do not satisfy HasLength', () => {
    expect(HasLength.check(42)).toBe(false)
    expect(HasLength.check({})).toBe(false)
  })
}

/*
# What We've Built

We've established the foundation: predicates become claims, and claims can check
values. This might seem simple, but it's the bedrock of Howard's power.

In the next examples, we'll see how claims compose, how they work with type
guards for TypeScript integration, and how they transform into verifiable proofs.
But everything starts here—with the humble act of making a proposition about data.
*/
