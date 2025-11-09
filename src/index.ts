/**
 * Howard: The logical engine for a truly relational world
 *
 * Howard is built on Canon's foundation. Users should import primitive types
 * like Predicate and TypeGuard directly from @relational-fabric/canon.
 *
 * @example
 * ```typescript
 * // Import Canon primitives directly
 * import { Predicate } from '@relational-fabric/canon'
 * // Import Howard semantics
 * import { claims, type Claim } from '@relational-fabric/howard'
 * ```
 */

// Claim concept (singular)
export type { Claim } from './claim/index.js'
export { createClaim } from './claim/index.js'

// Claims factory (plural)
export { claims } from './claims/index.js'
export type { ClaimsInput, ClaimsResult } from './claims/index.js'

// Type re-exports for documentation (users should import from Canon)
export type { Predicate, TypeGuard } from './types/index.js'
