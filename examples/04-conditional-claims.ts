/**
 * @document.title Conditional Claims
 * @document.description Bind claims to changing state using .given() and strategies
 * @document.keywords conditional, reactive, given, eager, lazy, state
 * @document.difficulty intermediate
 */

/*
# Making Claims Reactive

So far, all our claims have been pure—they check the value you pass them. But
real applications have state that changes: logged-in users, shopping carts,
feature flags. Conditional claims let you bind a claim to changing state,
creating reactive propositions that respond to your application's context.
*/

/*
# The Application State

We'll model a simple authentication state that changes over time.
*/

/*
# Composing Conditional Claims

Conditional claims can be composed with pure claims using `.and()` and `.or()`.
This lets you build complex reactive propositions.
*/

// ```
import type { TypeGuard } from '@relational-fabric/canon'
import { typeGuard } from '@relational-fabric/canon'
import { claims } from '@relational-fabric/howard'

interface User {
  id: number
  email: string
  cart: {
    items: Record<string, number>
  }
}

const appState = {
  currentUser: null as User | null,
}

const isUser = typeGuard<User>((value) => {
  return (
    typeof value === 'object'
    && value !== null
    && 'id' in value
    && 'email' in value
  )
})

const { aUser } = claims({ types: { isUser } })
// ```

/*
# Binding to State: The .given() Operator

The `.given()` method binds a claim to a reference function—a function that
reads from your application's state. This creates a Condition, which couples
the claim with the state it depends on.
*/

// ```
function currentUser() {
  return appState.currentUser
}

const LoggedInUser = aUser.given(currentUser)
// ```

/*
# Applying a Strategy

A Condition isn't callable by itself—you need to apply a strategy. Strategies
determine *when* and *how* the condition evaluates.

The `.eager()` strategy fetches the value before checking each time.
*/

// ```
const CurrentlyLoggedIn = LoggedInUser.eager()
// ```

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe('Eager Conditional Claims', () => {
    it('Returns false when user is null', () => {
      appState.currentUser = null
      expect(CurrentlyLoggedIn()).toBe(false)
    })

    it('Returns true when user is logged in', () => {
      appState.currentUser = { id: 1, email: 'user@test.com', cart: { items: {} } }
      expect(CurrentlyLoggedIn()).toBe(true)
    })

    it('Responds to state changes', () => {
      appState.currentUser = null
      expect(CurrentlyLoggedIn()).toBe(false)

      appState.currentUser = { id: 1, email: 'user@test.com', cart: { items: {} } }
      expect(CurrentlyLoggedIn()).toBe(true)

      appState.currentUser = null
      expect(CurrentlyLoggedIn()).toBe(false)
    })
  })
}

const isEmpty: TypeGuard<unknown> = typeGuard((value) => {
  if (Array.isArray(value))
    return value.length === 0
  if (typeof value === 'object' && value !== null)
    return Object.keys(value).length === 0
  return false
})

const { anEmpty: _anEmpty } = claims({ types: { isEmpty } })

const hasCart = typeGuard<{ cart: unknown }>((value) => {
  return typeof value === 'object' && value !== null && 'cart' in value
})

const { HasCart: UserHasCart } = claims({ types: { hasCart } })

// Combine conditional claim with pure claim
const LoggedInWithCart = CurrentlyLoggedIn.and(UserHasCart)
// ```

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe('Composed Conditional Claims', () => {
    it('All conditions must be satisfied', () => {
      appState.currentUser = {
        id: 1,
        email: 'user@test.com',
        cart: { items: {} },
      }

      // User is logged in and has cart
      expect(LoggedInWithCart()).toBe(true)
    })

    it('Fails if conditional is false', () => {
      appState.currentUser = null
      expect(LoggedInWithCart()).toBe(false)
    })

    it('Fails if claim is false', () => {
      appState.currentUser = { id: 1, email: 'user@test.com' } as User
      // User is logged in but doesn't have cart property
      expect(LoggedInWithCart()).toBe(false)
    })
  })
}

/*
# The Lazy Strategy

The `.lazy()` strategy is similar to `.eager()` but for different use cases.
Both evaluate the reference function when called—the difference is semantic
and will matter more when we add caching in the annotations system.
*/

// ```
const LazyLoggedIn = aUser.given(currentUser).lazy()
// ```

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe('Lazy Conditional Claims', () => {
    it('Works the same as eager for basic checks', () => {
      appState.currentUser = null
      expect(LazyLoggedIn()).toBe(false)

      appState.currentUser = { id: 1, email: 'user@test.com', cart: { items: {} } }
      expect(LazyLoggedIn()).toBe(true)
    })
  })
}

/*
# Reactive Logic

Conditional claims transform static propositions into reactive logic. They give
you the ability to write code that adapts to changing context without littering
your business logic with state checks.

The combination of pure claims and conditional claims creates a vocabulary for
describing both timeless truths (this value is a User) and contextual truths
(the current user is logged in).

Next, we'll see how all these pieces come together in a complete example.
*/
