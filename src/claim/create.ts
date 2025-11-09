/**
 * Claim creation utilities
 */

import type { Predicate } from '@relational-fabric/canon'
import type { Claim } from './types.js'

/**
 * Create a Claim object from a predicate function.
 *
 * This is the low-level primitive for creating claims. Most users will
 * use the higher-level `claims()` factory instead.
 *
 * @param predicate - A Canon Predicate function
 * @returns A Claim wrapping the predicate
 */
export function createClaim<T>(predicate: Predicate<T>): Claim<T> {
  return {
    check(value: unknown): value is T {
      return predicate(value)
    },
  }
}
