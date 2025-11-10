/**
 * @document.title Complete Example - User Cart System
 * @document.description Full demonstration of Howard's capabilities in a realistic scenario
 * @document.keywords complete, real-world, user, cart, composition, conditional
 * @document.difficulty intermediate
 */

/*
# A Complete Howard Application

This example brings together everything we've learned: predicates, type guards,
composition, and conditional claims. We'll build a simple but realistic user
and shopping cart system that demonstrates Howard's power.
*/

/*
# Domain Types

Our application manages users with shopping carts. This is a common pattern in
e-commerce applications.
*/

// ```
// ```

/*
# Type Guards

We define type guards for our domain using Canon's TypeGuard type.
*/

// ```
import type { TypeGuard } from '@relational-fabric/canon'
import { typeGuard } from '@relational-fabric/canon'
import { claims } from '../src/index.js'

interface Cart {
  items: Record<string, number>
}

interface User {
  id: number
  email: string
  name?: string
  cart?: Cart
}

interface AppState {
  currentUser: User | null
}

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

const hasCart: TypeGuard<{ cart: Cart }> = (value): value is { cart: Cart } => {
  return (
    typeof value === 'object'
    && value !== null
    && 'cart' in value
    && typeof (value as { cart: Cart }).cart === 'object'
  )
}

const isEmpty: TypeGuard<unknown> = typeGuard((value) => {
  if (Array.isArray(value))
    return value.length === 0
  if (typeof value === 'object' && value !== null)
    return Object.keys(value).length === 0
  if (typeof value === 'string')
    return value.length === 0
  return false
})
// ```

/*
# Creating Claims

We transform our type guards into claims.
*/

// ```
const { aUser, HasCart, anEmpty: _anEmpty } = claims({
  guards: { isUser, hasCart, isEmpty },
})
// ```

/*
# Composing Pure Claims

We build up our vocabulary by composing simple claims into complex ones.
*/

// ```
const AUserWithCart = aUser.and(HasCart)
// ```

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe('Pure Claim Composition', () => {
    it('User with cart satisfies AUserWithCart', () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
        cart: { items: { 'item-1': 2 } },
      }

      expect(AUserWithCart.check(user)).toBe(true)
    })

    it('User without cart fails AUserWithCart', () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
      }

      expect(AUserWithCart.check(user)).toBe(false)
    })

    it('Composition preserves type safety', () => {
      const value: unknown = {
        id: 1,
        email: 'test@example.com',
        cart: { items: {} },
      }

      if (AUserWithCart.check(value)) {
        // TypeScript knows this is User & { cart: Cart }
        const _id: number = value.id
        const _cart: Cart = value.cart
        expect(value.cart).toBeDefined()
      }
    })
  })
}

/*
# Adding Reactive State

Now we add global application state and make our claims reactive.
*/

// ```
const appState: AppState = {
  currentUser: null,
}

function currentUser() {
  return appState.currentUser
}

const LoggedInUser = aUser.given(currentUser)
const CurrentlyLoggedIn = LoggedInUser.eager()
// ```

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe('Conditional Claims', () => {
    it('Reflects logged out state', () => {
      appState.currentUser = null
      expect(CurrentlyLoggedIn()).toBe(false)
    })

    it('Reflects logged in state', () => {
      appState.currentUser = {
        id: 1,
        email: 'user@test.com',
        cart: { items: {} },
      }
      expect(CurrentlyLoggedIn()).toBe(true)
    })

    it('Responds to state changes', () => {
      appState.currentUser = { id: 1, email: 'user@test.com' }
      expect(CurrentlyLoggedIn()).toBe(true)

      appState.currentUser = null
      expect(CurrentlyLoggedIn()).toBe(false)
    })
  })
}

/*
# Composing Conditional and Pure Claims

The real power emerges when you combine reactive state checks with pure logic.
*/

// ```
const LoggedInWithCart = CurrentlyLoggedIn.and(HasCart)
// ```

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe('Mixed Conditional and Pure Claims', () => {
    it('Both conditions must be satisfied', () => {
      appState.currentUser = {
        id: 1,
        email: 'user@test.com',
        cart: { items: {} },
      }

      expect(LoggedInWithCart()).toBe(true)
    })

    it('Fails if user is not logged in', () => {
      appState.currentUser = null
      expect(LoggedInWithCart()).toBe(false)
    })

    it('Fails if logged in user has no cart', () => {
      appState.currentUser = {
        id: 1,
        email: 'user@test.com',
      }

      expect(LoggedInWithCart()).toBe(false)
    })
  })
}

/*
# The Complete Picture

We've built a claim-based system that:

1. **Validates data** with type guards transformed into claims
2. **Composes logic** using `.and()`, `.or()`, and `.on()` operators
3. **Reacts to state** with conditional claims bound via `.given()`
4. **Maintains type safety** through TypeScript's type narrowing

This is just the beginning. In the annotations document, we'll see how Howard
caches these evaluations automatically. In the proofs document, we'll see how
to generate detailed explanations of why a claim failed.

Howard transforms ad-hoc boolean logic into a structured, composable system
where propositions about data are first-class citizens.
*/
