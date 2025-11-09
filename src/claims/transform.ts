/**
 * Name transformation utilities
 * 
 * Converts predicate function names to claim names following Howard's conventions.
 */

/**
 * Transform a predicate function name into a claim name.
 * 
 * Follows these conventions:
 * - `isEmpty` → `IsEmpty` (is* prefix)
 * - `hasValue` → `HasValue` (has* prefix)
 * - `isValidEmail` → `IsValidEmail` (is* prefix preserved)
 * - `custom` → `Custom` (fallback to capitalization)
 * 
 * @param name - The predicate function name
 * @returns The transformed claim name
 */
export function transformPredicateName(name: string): string {
  if (name.startsWith('is') && name.length > 2) {
    return 'Is' + name.slice(2)
  }
  if (name.startsWith('has') && name.length > 3) {
    return 'Has' + name.slice(3)
  }
  // Capitalize first letter for other cases
  return name.charAt(0).toUpperCase() + name.slice(1)
}

