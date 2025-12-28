/**
 * Howard Internals
 *
 * This module exposes internal implementation details for use by:
 * - Benchmarks
 * - Testing utilities
 * - Advanced users who need direct access to implementation classes
 *
 * WARNING: These exports are not part of the stable public API.
 * They may change between minor versions without notice.
 *
 * @example
 * ```typescript
 * // For benchmarks and internal tooling
 * import { Claim, ClaimAnd, ClaimOr, ClaimOn } from '@relational-fabric/howard/internals'
 * ```
 */

export * from './Claim.js'
export * from './Claim/index.js'
export * from './Condition.js'
export * from './Condition/Eager.js'
export * from './Condition/Lazy.js'
