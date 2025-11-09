import type { Claim, ClaimsInput, ClaimsResult, PredicateFn } from './types.js'

/**
 * Transform a predicate function name into a claim name.
 * Follows these conventions:
 * - isEmpty -> IsEmpty
 * - hasValue -> HasValue
 * - isValidEmail -> IsValidEmail
 * - custom -> Custom (fallback to capitalization)
 */
function transformPredicateName(name: string): string {
  if (name.startsWith('is') && name.length > 2) {
    return 'Is' + name.slice(2)
  }
  if (name.startsWith('has') && name.length > 3) {
    return 'Has' + name.slice(3)
  }
  // Capitalize first letter for other cases
  return name.charAt(0).toUpperCase() + name.slice(1)
}

/**
 * Create a Claim object from a predicate function.
 */
function createClaim(predicate: PredicateFn): Claim {
  return {
    check(value: unknown): value is unknown {
      return predicate(value)
    }
  }
}

/**
 * Transform predicates into first-class claim objects.
 * 
 * This is the primary entry point for defining claims in Howard.
 * It takes an object with predicates and returns an object with
 * corresponding Claim instances.
 * 
 * @example
 * ```typescript
 * const { IsEmpty } = claims({
 *   predicates: {
 *     isEmpty: (value) => {
 *       if (Array.isArray(value)) return value.length === 0
 *       if (typeof value === 'object' && value !== null) {
 *         return Object.keys(value).length === 0
 *       }
 *       return false
 *     }
 *   }
 * })
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

