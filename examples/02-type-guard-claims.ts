/**
 * @document.title Type Guard Claims
 * @document.description Transform TypeScript type guards into claims that narrow types
 * @document.keywords claims, type-guards, typescript, type-narrowing
 * @document.difficulty introductory
 */

/*
# From Boolean Logic to Type Narrowing

Predicates tell us if something is true. Type guards tell us *what* something is.
In TypeScript, type guards are special functions that help the compiler understand
the shape of our data. Howard elevates these guards into claims that carry both
runtime verification and compile-time type information.
*/

/*
# Defining Types

We start with interfaces that describe our domain. These are the types we want
our claims to prove and narrow to.
*/

// ```
// ```

/*
# Creating Type Guards

Type guards use TypeScript's `value is Type` syntax. They're predicates that
also provide type information to the compiler.
*/

// ```
import type { Predicate, TypeGuard } from '@relational-fabric/canon'
// ```

/*
# Transforming Guards into Claims

Howard transforms type guard function names using a different convention than predicates:
- `isUser` → `aUser` (article form)
- `isObject` → `anObject` (using 'an' for actual vowel sounds)
- `hasCart` → `HasCart` (possession form)

This creates more natural, English-like claim names.
*/

// ```
import { claims } from '../src/index.js'

const isUser: TypeGuard<User> = (value): value is User => {
  return (
    typeof value === 'object'
    && value !== null
    && 'id' in value
    && 'email' in value
    && typeof (value as User).id === 'number'
    && typeof (value as User).email === 'string'
  )
}

const hasCart: TypeGuard<HasCart> = (value): value is HasCart => {
  return (
    typeof value === 'object'
    && value !== null
    && 'cart' in value
  )
}

const { aUser, HasCart: UserHasCart } = claims({
  guards: { isUser, hasCart },
})
// ```

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe('Type Guard Claims', () => {
    it('aUser claim verifies User objects', () => {
      const validUser = { id: 1, email: 'test@example.com' }
      const invalidUser = { id: 1 }

      expect(aUser.check(validUser)).toBe(true)
      expect(aUser.check(invalidUser)).toBe(false)
    })

    it('aUser claim narrows types', () => {
      const maybeUser: unknown = { id: 1, email: 'test@example.com', name: 'Test' }

      if (aUser.check(maybeUser)) {
        // TypeScript now knows maybeUser is User
        const _userId: number = maybeUser.id
        const _userEmail: string = maybeUser.email
        const _userName: string | undefined = maybeUser.name
        expect(maybeUser.id).toBe(1)
      }
    })

    it('HasCart claim verifies objects with cart property', () => {
      const withCart = { cart: { items: { 'item-1': 2 } } }
      const withoutCart = { id: 1 }

      expect(UserHasCart.check(withCart)).toBe(true)
      expect(UserHasCart.check(withoutCart)).toBe(false)
    })

    it('HasCart claim narrows to HasCart type', () => {
      const maybeHasCart: unknown = { cart: { items: {} } }

      if (UserHasCart.check(maybeHasCart)) {
        // TypeScript knows this has a cart property
        const _cart: Cart | undefined = maybeHasCart.cart
        expect(maybeHasCart.cart).toBeDefined()
      }
    })
  })
}

const isEmpty: Predicate<unknown> = (value) => {
  if (Array.isArray(value))
    return value.length === 0
  if (typeof value === 'object' && value !== null)
    return Object.keys(value).length === 0
  return false
}

const { IsEmpty, aUser: LoggedInUser } = claims({
  predicates: { isEmpty },
  guards: { isUser },
})
// ```

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe('Mixed Predicates and Guards', () => {
    it('Both predicate and guard claims are created', () => {
      expect(IsEmpty.check({})).toBe(true)
      expect(LoggedInUser.check({ id: 1, email: 'test@example.com' })).toBe(true)
    })

    it('Empty object satisfies IsEmpty but not aUser', () => {
      const emptyObj = {}

      expect(IsEmpty.check(emptyObj)).toBe(true)
      expect(LoggedInUser.check(emptyObj)).toBe(false)
    })

    it('Valid user satisfies aUser but not IsEmpty', () => {
      const user = { id: 1, email: 'test@example.com' }

      expect(LoggedInUser.check(user)).toBe(true)
      expect(IsEmpty.check(user)).toBe(false)
    })
  })
}

/*
# The Power of Type Narrowing

Type guard claims don't just return booleans—they teach TypeScript about your data.
This means you get both runtime verification and compile-time type safety. The
compiler understands what `.check()` proves, eliminating the need for type assertions
and making your code safer by default.

Next, we'll see how to compose these claims to build rich, interconnected propositions
about your data.
*/
