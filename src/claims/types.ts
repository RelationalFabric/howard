/**
 * Types for the claims() factory function
 */

import type { Predicate } from '@relational-fabric/canon'
import type { Claim } from '../claim/types.js'

/**
 * Input structure for creating claims from predicates.
 * 
 * Future: Will support guards and classes as well.
 */
export interface ClaimsInput {
  /**
   * Predicate functions to transform into claims.
   * Keys will be transformed into claim names (e.g., isEmpty -> IsEmpty)
   */
  predicates?: Record<string, Predicate<unknown>>
}

/**
 * The result of calling claims() - an object containing claim instances.
 * 
 * @template T - The ClaimsInput type
 */
export type ClaimsResult<T extends ClaimsInput> = {
  [K in keyof T['predicates'] as TransformPredicateName<K & string>]: Claim
}

/**
 * Transform a predicate function name into a claim name.
 * 
 * Examples:
 * - isEmpty -> IsEmpty
 * - hasValue -> HasValue
 * - isValidEmail -> IsValidEmail
 * - custom -> Custom (fallback)
 */
export type TransformPredicateName<Name extends string> =
  Name extends `is${infer Rest}` ? `Is${Rest}` :
  Name extends `has${infer Rest}` ? `Has${Rest}` :
  Capitalize<Name>

