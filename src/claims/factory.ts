/**
 * The claims() factory function
 *
 * Transforms predicates (and eventually guards and classes) into first-class
 * claim objects following Howard's naming conventions.
 */

import type { Claim } from '../claim/types.js'
import type { ClaimsInput, ClaimsResult } from './types.js'
import { createClaim } from '../claim/create.js'
import { transformPredicateName } from './transform.js'

/**
 * Transform predicates into first-class claim objects.
 *
 * This is the primary entry point for defining claims in Howard.
 * It takes an object with predicates and returns an object with
 * corresponding Claim instances.
 *
 * @example
 * ```typescript
 * import { Predicate } from '@relational-fabric/canon'
 * import { claims } from '@relational-fabric/howard'
 *
 * const isEmpty: Predicate<unknown> = (value) => {
 *   if (Array.isArray(value)) return value.length === 0
 *   if (typeof value === 'object' && value !== null) {
 *     return Object.keys(value).length === 0
 *   }
 *   return false
 * }
 *
 * const { IsEmpty } = claims({ predicates: { isEmpty } })
 *
 * console.log(IsEmpty.check({})) // true
 * console.log(IsEmpty.check({ a: 1 })) // false
 * ```
 *
 * @param input - An object containing predicates to transform into claims
 * @returns An object with Claim instances, keyed by transformed names
 */
export function claims<T extends ClaimsInput>(input: T): ClaimsResult<T> {
  const result: Record<string, Claim> = {}

  if (input.predicates) {
    for (const [name, predicate] of Object.entries(input.predicates)) {
      const claimName = transformPredicateName(name)
      result[claimName] = createClaim(predicate)
    }
  }

  return result as ClaimsResult<T>
}
