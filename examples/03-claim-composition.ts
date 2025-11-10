/**
 * @document.title Claim Composition
 * @document.description Compose claims using .and(), .or(), and .on() to build rich propositions
 * @document.keywords claims, composition, and, or, nested
 * @document.difficulty intermediate
 */

/*
# Building Rich Propositions

Individual claims are powerful, but the real magic happens when you compose them.
Howard provides three operators that let you build complex logical statements from
simple parts: `.and()` for conjunction, `.or()` for disjunction, and `.on()` for
checking nested properties.
*/

/*
# Setting Up Our Domain

We'll use a User and Cart domain to demonstrate composition.
*/

// ```
import type { TypeGuard } from '@relational-fabric/canon'
import { typeGuard } from '@relational-fabric/canon'
import { claims } from '../src/index.js'

interface User {
  id: number
  email: string
  name?: string
}

interface Cart {
  items: Record<string, number>
}

interface UserWithCart extends User {
  cart: Cart
}

// Using Canon's typeGuard helper to ensure proper type narrowing
const isEmpty: TypeGuard<unknown> = typeGuard((value) => {
  if (Array.isArray(value))
    return value.length === 0
  if (typeof value === 'object' && value !== null)
    return Object.keys(value).length === 0
  return false
})

const isUser: TypeGuard<User> = (value): value is User => {
  return (
    typeof value === 'object'
    && value !== null
    && 'id' in value
    && 'email' in value
  )
}

const hasCart: TypeGuard<UserWithCart> = (value): value is UserWithCart => {
  return (
    isUser(value)
    && 'cart' in value
    && typeof (value as UserWithCart).cart === 'object'
  )
}

const { anEmpty: _anEmpty, aUser, HasCart } = claims({
  guards: { isEmpty, isUser, hasCart },
})
// ```

/*
# Logical AND: Both Must Pass

The `.and()` operator creates a new claim that passes only if both claims pass.
TypeScript understands this and narrows the type to an intersection.
*/

// ```
const AUserWithCart = aUser.and(HasCart)
// ```

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe('AND Composition', () => {
    it('Both claims must pass', () => {
      const validUser: UserWithCart = {
        id: 1,
        email: 'test@example.com',
        cart: { items: {} },
      }
      const userWithoutCart: User = {
        id: 1,
        email: 'test@example.com',
      }

      expect(AUserWithCart.check(validUser)).toBe(true)
      expect(AUserWithCart.check(userWithoutCart)).toBe(false)
    })

    it('Type narrows to intersection', () => {
      const value: unknown = {
        id: 1,
        email: 'test@example.com',
        cart: { items: {} },
      }

      if (AUserWithCart.check(value)) {
        // TypeScript knows value is User & UserWithCart
        const _id: number = value.id
        const _email: string = value.email
        const _cart: Cart = value.cart
        expect(value.cart).toBeDefined()
      }
    })
  })
}

/*
# Logical OR: Either Can Pass

The `.or()` operator creates a claim that passes if either claim passes.
This is useful for accepting multiple valid shapes.
*/

// ```
interface Admin {
  adminId: number
  permissions: string[]
}

const isAdmin: TypeGuard<Admin> = (value): value is Admin => {
  return (
    typeof value === 'object'
    && value !== null
    && 'adminId' in value
    && 'permissions' in value
  )
}

const { anAdmin } = claims({ guards: { isAdmin } })
const AUserOrAdmin = aUser.or(anAdmin)
// ```

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe('OR Composition', () => {
    it('Either claim passing makes composed claim pass', () => {
      const user: User = { id: 1, email: 'test@example.com' }
      const admin: Admin = { adminId: 1, permissions: ['read', 'write'] }
      const neither = { id: 'not-a-number' }

      expect(AUserOrAdmin.check(user)).toBe(true)
      expect(AUserOrAdmin.check(admin)).toBe(true)
      expect(AUserOrAdmin.check(neither)).toBe(false)
    })
  })
}

/*
# Nested Properties: The .on() Operator

The `.on()` operator lets you check properties of an object. This is where
composition becomes truly powerful—you can build claims about the structure
and content of nested data.

For this example, we'll check a property directly on the user.
*/

// ```
interface UserWithName extends User {
  name: string
}

const hasName: TypeGuard<UserWithName> = (value): value is UserWithName => {
  return isUser(value) && 'name' in value && typeof (value as UserWithName).name === 'string'
}

const isEmptyString: TypeGuard<string> = typeGuard((value): value is string => {
  return typeof value === 'string' && value.length === 0
})

const { HasName, anEmptyString } = claims({
  guards: { hasName, isEmptyString },
})

const UserWithEmptyName = HasName.on('name', anEmptyString)
// ```

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe('Nested Property Checking', () => {
    it('Checks nested property with claim', () => {
      const emptyName: UserWithName = {
        id: 1,
        email: 'test@example.com',
        name: '',
      }
      const withName: UserWithName = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      }

      expect(UserWithEmptyName.check(emptyName)).toBe(true)
      expect(UserWithEmptyName.check(withName)).toBe(false)
    })

    it('Parent claim must pass first', () => {
      const notAUser = { name: '' }

      // Fails because HasName requires user properties
      expect(UserWithEmptyName.check(notAUser)).toBe(false)
    })
  })
}

/*
# Chaining Composition

All operators return claims, so you can chain them. This lets you build
arbitrarily complex propositions from simple parts.
*/

// ```
const AUserWithEmptyName = aUser.and(HasName).on('name', anEmptyString)
// ```

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe('Chained Composition', () => {
    it('Multiple operators can be chained', () => {
      const validUser: UserWithName = {
        id: 1,
        email: 'test@example.com',
        name: '',
      }

      expect(AUserWithEmptyName.check(validUser)).toBe(true)
    })

    it('All parts of the chain must pass', () => {
      const userWithName: UserWithName = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      }

      // Fails at the .on('name', anEmptyString) check
      expect(AUserWithEmptyName.check(userWithName)).toBe(false)
    })
  })
}

/*
# The Power of Composition

By composing simple claims, you build a vocabulary for describing your domain.
These composed claims are:

- **Type-safe**: TypeScript tracks the types through composition
- **Reusable**: Build once, use everywhere
- **Composable**: Claims are values that combine naturally
- **Readable**: The code reads like the logic it represents

Next, we'll see how to make claims reactive by binding them to changing state
with conditional claims.
*/
