/**
 * Core public API functions
 */

import type { ClaimInterface } from './types/claim.js'
import type { ClaimsInput, ClaimsResult } from './types/claims.js'
import ClaimClass from './Claim.js'
import { nameForGuard, nameForPredicate } from './naming/index.js'

/**
 * Transform predicates and type guards into first-class claim objects.
 *
 * This is the primary entry point for defining claims in Howard.
 *
 * @param input - An object containing predicates and/or guards
 * @returns An object with Claim instances, keyed by transformed names
 */
export function claims<T extends ClaimsInput>(input: T): ClaimsResult<T> {
  const result: Record<string, ClaimInterface<unknown>> = {}

  if (input.predicates) {
    for (const [name, predicate] of Object.entries(input.predicates)) {
      const claimName = nameForPredicate(name)
      result[claimName] = new ClaimClass(predicate)
    }
  }

  if (input.guards) {
    for (const [name, guard] of Object.entries(input.guards)) {
      const claimName = nameForGuard(name)
      result[claimName] = new ClaimClass(guard)
    }
  }

  return result as ClaimsResult<T>
}
