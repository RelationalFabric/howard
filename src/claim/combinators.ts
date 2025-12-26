/**
 * Claim combinators - logical composition classes
 */

import type { ClaimInterface, ConditionInterface } from '../types/index.js'
import { typeGuard } from '@relational-fabric/canon'
import ConditionClass from '../Condition.js'

/**
 * ClaimOn class represents checking a nested property with a claim.
 */
export class ClaimOn<T, K extends keyof T> implements ClaimInterface<T> {
  public readonly check = typeGuard<T>((value: unknown) => {
    if (!this.parent.check(value))
      return false

    const property = value[this.path]
    return this.claim.check(property)
  })

  constructor(
    private readonly parent: ClaimInterface<T>,
    private readonly path: K,
    private readonly claim: ClaimInterface<unknown>,
  ) {}

  and<U>(other: ClaimInterface<U>): ClaimInterface<T & U> {
    return new ClaimAnd(this, other)
  }

  or<U>(other: ClaimInterface<U>): ClaimInterface<T | U> {
    return new ClaimOr(this, other)
  }

  on<K2 extends keyof T>(path: K2, claim: ClaimInterface<unknown>): ClaimInterface<T> {
    return new ClaimOn(this, path, claim)
  }

  given<U>(ref: () => U): ConditionInterface<T> {
    return new ConditionClass(this, ref)
  }
}

/**
 * ClaimAnd class represents the logical AND composition of two claims.
 */
export class ClaimAnd<T, U> implements ClaimInterface<T & U> {
  public readonly check = typeGuard<T & U>((value: unknown) =>
    this.left.check(value) && this.right.check(value))

  constructor(
    private readonly left: ClaimInterface<T>,
    private readonly right: ClaimInterface<U>,
  ) {}

  and<V>(other: ClaimInterface<V>): ClaimInterface<T & U & V> {
    return new ClaimAnd(this, other)
  }

  or<V>(other: ClaimInterface<V>): ClaimInterface<(T & U) | V> {
    return new ClaimOr(this, other)
  }

  on<K extends keyof (T & U)>(path: K, claim: ClaimInterface<unknown>): ClaimInterface<T & U> {
    return new ClaimOn(this, path, claim)
  }

  given<V>(ref: () => V): ConditionInterface<T & U> {
    return new ConditionClass(this, ref)
  }
}

/**
 * ClaimOr class represents the logical OR composition of two claims.
 */
export class ClaimOr<T, U> implements ClaimInterface<T | U> {
  public readonly check = typeGuard<T | U>((value: unknown) =>
    this.left.check(value) || this.right.check(value))

  constructor(
    private readonly left: ClaimInterface<T>,
    private readonly right: ClaimInterface<U>,
  ) {}

  and<V>(other: ClaimInterface<V>): ClaimInterface<(T | U) & V> {
    return new ClaimAnd(this, other) as ClaimInterface<(T | U) & V>
  }

  or<V>(other: ClaimInterface<V>): ClaimInterface<T | U | V> {
    return new ClaimOr(this, other)
  }

  on<K extends keyof (T | U)>(path: K, claim: ClaimInterface<unknown>): ClaimInterface<T | U> {
    return new ClaimOn(this, path, claim)
  }

  given<V>(ref: () => V): ConditionInterface<T | U> {
    return new ConditionClass(this, ref)
  }
}
