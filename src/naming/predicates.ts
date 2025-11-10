/**
 * Predicate naming transformations
 */

/**
 * Transform a predicate function name into a claim name.
 *
 * Conventions:
 * - isEmpty → IsEmpty
 * - hasValue → HasValue
 * - isValidEmail → IsValidEmail
 * - custom → Custom (fallback)
 *
 * @param name - The predicate function name
 * @returns The transformed claim name
 */
export function nameForPredicate(name: string): string {
  if (name.startsWith('is') && name.length > 2) {
    return `Is${name.slice(2)}`
  }
  if (name.startsWith('has') && name.length > 3) {
    return `Has${name.slice(3)}`
  }
  // Capitalize first letter for other cases
  return name.charAt(0).toUpperCase() + name.slice(1)
}
