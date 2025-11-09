/**
 * A predicate function that evaluates to a boolean.
 * Predicates are pure functions that should be deterministic and side-effect free.
 */
export type PredicateFn = (value: unknown) => boolean

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
  check(value: unknown): value is T
}

/**
 * Input structure for creating claims from predicates.
 */
export interface ClaimsInput {
  predicates?: Record<string, PredicateFn>
}

/**
 * The result of calling claims() - an object containing claim instances.
 */
export type ClaimsResult<T extends ClaimsInput> = {
  [K in keyof T['predicates'] as TransformPredicateName<K & string>]: Claim
}

/**
 * Transform a predicate function name into a claim name.
 * Examples:
 * - isEmpty -> IsEmpty
 * - hasValue -> HasValue
 * - isValidEmail -> IsValidEmail
 */
type TransformPredicateName<Name extends string> =
  Name extends `is${infer Rest}` ? `Is${Rest}` :
  Name extends `has${infer Rest}` ? `Has${Rest}` :
  Capitalize<Name>

