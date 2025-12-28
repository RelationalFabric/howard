/**
 * Types for the claims() function
 */

import type { Predicate, TypeGuard } from '@relational-fabric/canon'
import type { ClaimFor } from './claim.js'
import type { TransformGuardName, TransformPredicateName } from './naming.js'

/**
 * Input structure for claims() function.
 */
export interface ClaimsInput {
  /**
   * Relational checks - boolean propositions (isEmpty, hasValue).
   * Naming: isX → IsX, hasX → HasX
   */
  relations?: Record<string, Predicate<unknown>>

  /**
   * Type guards - type narrowing functions (isUser, isCart).
   * Naming: isX → aX/anX, hasX → HasX
   */
  types?: Record<string, TypeGuard<unknown>>
}

/**
 * The result of calling claims() - an object containing claim instances.
 * Preserves the actual types from TypeGuards and Predicates.
 */
export type ClaimsResult<T extends ClaimsInput>
  = {
    [K in keyof T['relations'] as TransformPredicateName<K & string>]: ClaimFor<T['relations'][K]>
  }
  & {
    [K in keyof T['types'] as TransformGuardName<K & string>]: ClaimFor<T['types'][K]>
  }
