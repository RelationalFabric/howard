/**
 * ConditionLazy class - lazy evaluation strategy for conditionals
 */

import type { ClaimInterface, ConditionalInterface, ReferenceFn } from '../types/index.js'

/**
 * ConditionLazy class implements the lazy strategy.
 *
 * Only checks when called, assumes value is already available.
 */
export class ConditionLazy<T> {
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
        return new ConditionLazy(
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
        return new ConditionLazy(
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
