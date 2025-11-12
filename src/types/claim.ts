/**
 * Claim type definitions
 */

import type { Predicate, TypeGuard } from '@relational-fabric/canon'
import type { ConditionInterface } from './condition.js'
import type { Constructor } from './utils.js'

/**
 * A Claim is a first-class object representing a verifiable proposition.
 *
 * @template T - The type that this claim narrows to when it passes
 */
export interface ClaimInterface<T> {
  /**
   * Check if a value satisfies this claim.
   * Uses Canon's TypeGuard pattern to preserve specific subtypes.
   */
  check: TypeGuard<T>

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
 * Alias for a claim that can hold any type.
 * Use this when you need to reference claims without caring about their specific type.
 */
export type AnyClaim = ClaimInterface<unknown>

/**
 * Extracts the narrowed type from a TypeGuard, Predicate, or Constructor and produces the corresponding ClaimInterface.
 *
 * - For TypeGuard<U>: produces ClaimInterface<U>
 * - For Predicate<U>: produces ClaimInterface<U>
 * - For Constructor<U>: produces ClaimInterface<U>
 * - For other types: produces ClaimInterface<unknown>
 */
export type ClaimFor<T>
  = T extends TypeGuard<infer U> ? ClaimInterface<U>
    : T extends Predicate<infer U> ? ClaimInterface<U>
      : T extends Constructor<infer U> ? ClaimInterface<U>
        : ClaimInterface<unknown>
