/**
 * Types for the claims() function
 */

import type { Predicate, TypeGuard } from '@relational-fabric/canon'
import type { ClaimInterface } from './claim.js'
import type { TransformGuardName, TransformPredicateName } from './naming.js'

/**
 * Input structure for claims() function.
 */
export interface ClaimsInput {
  /**
   * Predicate functions to transform into claims.
   */
  predicates?: Record<string, Predicate<unknown>>

  /**
   * Type guard functions to transform into claims.
   */
  guards?: Record<string, TypeGuard<unknown>>
}

/**
 * The result of calling claims() - an object containing claim instances.
 */
export type ClaimsResult<T extends ClaimsInput>
  = {
    [K in keyof T['predicates'] as TransformPredicateName<K & string>]: ClaimInterface<unknown>
  }
  & {
    [K in keyof T['guards'] as TransformGuardName<K & string>]: ClaimInterface<unknown>
  }
