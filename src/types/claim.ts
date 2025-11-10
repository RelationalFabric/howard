/**
 * Claim type definitions
 */

import type { ConditionInterface } from './condition.js'

/**
 * A Claim is a first-class object representing a verifiable proposition.
 *
 * @template T - The type that this claim narrows to when it passes
 */
export interface ClaimInterface<T> {
  /**
   * Check if a value satisfies this claim.
   */
  check: (value: unknown) => value is T

  /**
   * Compose with another claim using logical AND.
   */
  and: <U>(other: ClaimInterface<U>) => ClaimInterface<T & U>

  /**
   * Compose with another claim using logical OR.
   */
  or: <U>(other: ClaimInterface<U>) => ClaimInterface<T | U>

  /**
   * Check a nested property of an object.
   */
  on: <K extends keyof T>(path: K, claim: ClaimInterface<unknown>) => ClaimInterface<T>

  /**
   * Bind this claim to a reference function, creating a reactive condition.
   */
  given: <U>(ref: () => U) => ConditionInterface<T>
}

/**
 * Type alias for a claim that accepts any value.
 */
export type AnyClaim = ClaimInterface<unknown>
