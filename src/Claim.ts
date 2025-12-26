/**
 * Claim class - the core abstraction of Howard
 */

import type { Predicate } from '@relational-fabric/canon'
import type { ClaimInterface, ConditionInterface } from './types/index.js'
import { typeGuard } from '@relational-fabric/canon'
import { ClaimAnd, ClaimOn, ClaimOr } from './Claim/combinators.js'
import ConditionClass from './Condition.js'

/**
 * Claim class implementation.
 *
 * A Claim wraps a predicate or type guard and provides composition methods.
 */
export default class Claim<T> implements ClaimInterface<T> {
  public readonly check = typeGuard<T>((value: unknown) => this.predicate(value))

  constructor(private readonly predicate: Predicate<T>) {}

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
