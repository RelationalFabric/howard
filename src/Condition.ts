/**
 * Condition class - immutable coupling of claim and reference
 */

import type { ClaimInterface, ConditionInterface, ReferenceFn } from './types/index.js'
import ConditionEager from './Condition/Eager.js'
import ConditionLazy from './Condition/Lazy.js'

/**
 * Condition class implementation.
 *
 * A Condition is a declarative, immutable coupling of a claim and a reference function.
 */
export default class Condition<T> implements ConditionInterface<T> {
  constructor(
    private readonly claim: ClaimInterface<T>,
    private readonly ref: ReferenceFn<unknown>,
  ) {}

  eager() {
    return new ConditionEager(this.claim, this.ref).toConditional()
  }

  lazy() {
    return new ConditionLazy(this.claim, this.ref).toConditional()
  }
}
