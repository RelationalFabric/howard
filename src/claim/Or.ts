/**
 * ClaimOr class - logical OR composition of claims
 */

import type { ClaimInterface } from '../types/claim.js'
import type { ConditionInterface } from '../types/condition.js'
import { typeGuard } from '@relational-fabric/canon'
import ConditionClass from '../Condition.js'
import ClaimAnd from './And.js'
import ClaimOn from './On.js'

/**
 * ClaimOr class represents the logical OR composition of two claims.
 */
export default class ClaimOr<T, U> implements ClaimInterface<T | U> {
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
