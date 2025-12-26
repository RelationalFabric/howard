/**
 * Type-level naming transformations
 */

/**
 * Transform a predicate function name into a claim name at the type level.
 *
 * Examples:
 * - isEmpty → IsEmpty
 * - hasValue → HasValue
 * - isValidEmail → IsValidEmail
 */
export type TransformPredicateName<Name extends string>
  = Name extends `is${infer Rest}` ? `Is${Rest}`
    : Name extends `has${infer Rest}` ? `Has${Rest}`
      : Capitalize<Name>

/**
 * Transform a type guard function name into a claim name at the type level.
 *
 * Examples:
 * - isUser → aUser
 * - isObject → anObject
 * - isEmpty → anEmpty
 * - isArray → anArray
 * - hasCart → HasCart
 */
export type TransformGuardName<Name extends string>
  = Name extends `is${infer Rest}`
    ? Rest extends `${'A' | 'E' | 'I' | 'O'}${infer _}`
      ? `an${Rest}`
      : `a${Rest}`
    : Name extends `has${infer Rest}`
      ? `Has${Rest}`
      : Capitalize<Name>
