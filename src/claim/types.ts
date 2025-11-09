/**
 * Claim type definition
 *
 * A Claim is Howard's core abstraction - a first-class object representing
 * a verifiable proposition about data. Unlike raw predicates or type guards,
 * claims are composable, cacheable, and can generate proofs.
 */

/**
 * A Claim is a first-class object that represents a verifiable proposition.
 * Claims can be checked against values to determine if they hold true.
 *
 * @template T - The type that this claim narrows to when it passes
 */
export interface Claim<T = unknown> {
  /**
   * Check if a value satisfies this claim.
   *
   * @param value - The value to check against this claim
   * @returns True if the value satisfies the claim, false otherwise
   */
  check: (value: unknown) => value is T
}
