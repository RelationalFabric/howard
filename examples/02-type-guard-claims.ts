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
our claims to verify and narrow to.
*/

/*
# Type Guards

Type guards use TypeScript's `value is Type` syntax. They're predicates that
also provide type information to the compiler.
*/

/*
# Transforming Guards into Claims

Howard transforms type guard function names using a different convention than predicates:
- `isUser` → `aUser` (article form)
- `isObject` → `anObject` (using 'an' for actual vowel sounds)
- `hasCart` → `HasCart` (possession form)

This creates more natural, English-like claim names.
*/

// ```
import { typeGuard } from '@relational-fabric/canon'
import { claims } from '@relational-fabric/howard'

interface User {
  id: number
  email: string
  name?: string
}

interface Cart {
  items: Record<string, number>
}

interface HasCart {
  cart?: Cart
}

const isUser = typeGuard<User>((value) => {
  return (
    typeof value === 'object'
    && value !== null
    && 'id' in value
    && 'email' in value
    && typeof (value as User).id === 'number'
    && typeof (value as User).email === 'string'
  )
})

const hasCart = typeGuard<HasCart>((value) => {
  return (
    typeof value === 'object'
    && value !== null
    && 'cart' in value
  )
})

const { aUser, HasCart: UserHasCart } = claims({
  types: { isUser, hasCart },
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

/*
# The Power of Type Narrowing

The magic of type guard claims is that they work seamlessly with TypeScript's
control flow analysis. When you check a claim in an `if` statement, TypeScript
automatically narrows the type for you.

This means your editor gets full autocomplete, and you get compile-time safety
for your runtime checks.
*/

/*
# Naming Flexibility

TypeGuards are also Predicates (they return boolean), so you can choose which
naming convention to use based on your preference:
*/

// ```
const isAdmin = typeGuard<User>((value) => {
  return typeof value === 'object' && value !== null && 'id' in value
})

// Use as relation for IsAdmin name
const { IsAdmin } = claims({ relations: { isAdmin } })

// OR use as type for anAdmin name
const { anAdmin } = claims({ types: { isAdmin } })
// ```

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe('Naming Flexibility', () => {
    it('Same guard can produce different claim names', () => {
      expect(IsAdmin.check({ id: 1, email: 'admin@test.com' })).toBe(true)
      expect(anAdmin.check({ id: 1, email: 'admin@test.com' })).toBe(true)
    })
  })
}
