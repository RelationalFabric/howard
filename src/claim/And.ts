/**
 * ClaimAnd class - logical AND composition of claims
 */

import type { ClaimInterface } from '../types/claim.js'
import type { ConditionInterface } from '../types/condition.js'
import ConditionClass from '../Condition.js'
import ClaimOn from './On.js'
import ClaimOr from './Or.js'

/**
 * ClaimAnd class represents the logical AND composition of two claims.
 */
export default class ClaimAnd<T, U> implements ClaimInterface<T & U> {
  constructor(
    private readonly left: ClaimInterface<T>,
    private readonly right: ClaimInterface<U>,
  ) {}

  check(value: unknown): value is T & U {
    return this.left.check(value) && this.right.check(value)
  }

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
