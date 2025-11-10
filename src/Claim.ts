/**
 * Claim class - the core abstraction of Howard
 */

import type { Predicate } from '@relational-fabric/canon'
import type { ClaimInterface } from './types/claim.js'
import type { ConditionInterface } from './types/condition.js'
import ClaimAnd from './Claim/And.js'
import ClaimOn from './Claim/On.js'
import ClaimOr from './Claim/Or.js'
import ConditionClass from './Condition.js'

/**
 * Claim class implementation.
 *
 * A Claim wraps a predicate or type guard and provides composition methods.
 */
export default class Claim<T> implements ClaimInterface<T> {
  constructor(private readonly predicate: Predicate<T>) {}

  check(value: unknown): value is T {
    return this.predicate(value)
  }

  and<U>(other: ClaimInterface<U>): ClaimInterface<T & U> {
    return new ClaimAnd(this, other)
  }

  or<U>(other: ClaimInterface<U>): ClaimInterface<T | U> {
    return new ClaimOr(this, other)
  }

  on<K extends keyof T>(path: K, claim: ClaimInterface<unknown>): ClaimInterface<T> {
    return new ClaimOn(this, path, claim)
  }

  given<U>(ref: () => U): ConditionInterface<T> {
    return new ConditionClass(this, ref)
  }
}
