/**
 * Type guard naming transformations
 */

/**
 * Transform a type guard function name into a claim name.
 *
 * Conventions:
 * - isUser → aUser
 * - isObject → anObject
 * - isEmpty → anEmpty
 * - hasCart → HasCart
 * - custom → Custom (fallback)
 *
 * Uses 'an' for words starting with A, E, I, O (not U which often sounds like 'yoo')
 *
 * @param name - The type guard function name
 * @returns The transformed claim name
 */
export function nameForGuard(name: string): string {
  if (name.startsWith('is') && name.length > 2) {
    const rest = name.slice(2)
    const firstChar = rest.charAt(0).toLowerCase()
    // Use 'an' for vowel letters that typically sound like vowels
    const article = ['a', 'e', 'i', 'o'].includes(firstChar) ? 'an' : 'a'
    return `${article}${rest}`
  }
  if (name.startsWith('has') && name.length > 3) {
    return `Has${name.slice(3)}`
  }
  // Capitalize first letter for other cases
  return name.charAt(0).toUpperCase() + name.slice(1)
}
