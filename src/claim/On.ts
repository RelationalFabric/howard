/**
 * ClaimOn class - nested property checking
 */

import type { ClaimInterface } from '../types/claim.js'
import type { ConditionInterface } from '../types/condition.js'
import ConditionClass from '../Condition.js'
import ClaimAnd from './And.js'
import ClaimOr from './Or.js'

/**
 * ClaimOn class represents checking a nested property with a claim.
 */
export default class ClaimOn<T, K extends keyof T> implements ClaimInterface<T> {
  constructor(
    private readonly parent: ClaimInterface<T>,
    private readonly path: K,
    private readonly claim: ClaimInterface<unknown>,
  ) {}

  check(value: unknown): value is T {
    if (!this.parent.check(value))
      return false

    const property = value[this.path]
    return this.claim.check(property)
  }

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
