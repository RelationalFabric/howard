/**
 * ConditionEager class - eager evaluation strategy for conditionals
 */

import type { ClaimInterface } from '../types/claim.js'
import type { ConditionalInterface, ReferenceFn } from '../types/condition.js'

/**
 * ConditionEager class implements the eager strategy.
 *
 * Fetches the value from the reference before checking each time.
 */
export default class ConditionEager<T> {
  constructor(
    private readonly claim: ClaimInterface<T>,
    private readonly ref: ReferenceFn<unknown>,
  ) {}

  toConditional(): ConditionalInterface<T> {
    const conditional = () => {
      const value = this.ref()
      return this.claim.check(value)
    }

    return Object.assign(conditional, {
      and: <U>(other: ClaimInterface<U>): ConditionalInterface<T & U> => {
        return new ConditionEager(
          {
            check: (value: unknown): value is T & U => {
              return this.claim.check(value) && other.check(value)
            },
            and: this.claim.and,
            or: this.claim.or,
            on: this.claim.on,
            given: this.claim.given,
          },
          this.ref,
        ).toConditional()
      },
      or: <U>(other: ClaimInterface<U>): ConditionalInterface<T | U> => {
        return new ConditionEager(
          {
            check: (value: unknown): value is T | U => {
              return this.claim.check(value) || other.check(value)
            },
            and: this.claim.and,
            or: this.claim.or,
            on: this.claim.on,
            given: this.claim.given,
          },
          this.ref,
        ).toConditional()
      },
    })
  }
}
