/**
 * Condition and Conditional type definitions
 */

import type { ClaimInterface } from './claim.js'

/**
 * A reference function that provides a value from external state.
 */
export type ReferenceFn<T> = () => T

/**
 * A Condition is a declarative, immutable coupling of a claim and a reference function.
 *
 * @template T - The type that the claim narrows to
 */
export interface ConditionInterface<T> {
  /**
   * Apply the eager strategy - tick then check.
   */
  eager: () => ConditionalInterface<T>

  /**
   * Apply the lazy strategy - only check when called.
   */
  lazy: () => ConditionalInterface<T>
}

/**
 * A Conditional is the dynamic, stateful result of applying a Strategy to a Condition.
 *
 * @template T - The type that the claim narrows to
 */
export interface ConditionalInterface<T> {
  /**
   * Evaluate the condition.
   */
  (): boolean

  /**
   * Compose with another claim using logical AND.
   */
  and: <U>(other: ClaimInterface<U>) => ConditionalInterface<T & U>

  /**
   * Compose with another claim using logical OR.
   */
  or: <U>(other: ClaimInterface<U>) => ConditionalInterface<T | U>
}

/**
 * Type alias for a condition that accepts any value.
 */
export type AnyCondition = ConditionInterface<unknown>

/**
 * Type alias for a conditional that accepts any value.
 */
export type AnyConditional = ConditionalInterface<unknown>
