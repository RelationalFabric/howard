/**
 * Type invariants for ClaimsInput and ClaimsResult
 *
 * These compile-time assertions verify the claims() function type transformations.
 */

import type { Expect, Predicate, TypeGuard } from '@relational-fabric/canon'
import type { ClaimFor, ClaimInterface } from './claim.js'
import type { ClaimsInput, ClaimsResult } from './claims.js'
import { invariant } from '@relational-fabric/canon'

// Test types for verification
interface User { id: number, email: string }
interface Cart { items: unknown[] }

class Product {
  constructor(public id: number, public name: string) {}
}

// ClaimsInput should accept relations (predicates)
interface RelationInput { relations: { isEmpty: Predicate<unknown> } }
void invariant<Expect<RelationInput, ClaimsInput>>()

// ClaimsInput should accept types (guards)
interface TypeInput { types: { isUser: TypeGuard<User> } }
void invariant<Expect<TypeInput, ClaimsInput>>()

// ClaimsInput should accept both
interface MixedInput {
  relations: { isEmpty: Predicate<unknown> }
  types: { isUser: TypeGuard<User> }
}
void invariant<Expect<MixedInput, ClaimsInput>>()

// ClaimsResult should transform relation names
type RelationResult = ClaimsResult<{ relations: { isEmpty: Predicate<string> } }>
void invariant<Expect<'IsEmpty' extends keyof RelationResult ? true : false, true>>()

// ClaimsResult should transform type guard names
type TypeResult = ClaimsResult<{ types: { isUser: TypeGuard<User> } }>
void invariant<Expect<'aUser' extends keyof TypeResult ? true : false, true>>()

// ClaimsResult values should preserve actual types from TypeGuards
type UserClaimResult = ClaimsResult<{ types: { isUser: TypeGuard<User> } }>['aUser']
void invariant<Expect<UserClaimResult, ClaimInterface<User>>>()

// ClaimsResult values should preserve actual types from Predicates
type StringClaimResult = ClaimsResult<{ relations: { isEmpty: Predicate<string> } }>['IsEmpty']
void invariant<Expect<StringClaimResult, ClaimInterface<string>>>()

// ClaimsResult should handle mixed inputs with preserved types
type MixedResult = ClaimsResult<{
  relations: { isEmpty: Predicate<string>, hasValue: Predicate<number> }
  types: { isUser: TypeGuard<User>, hasCart: TypeGuard<Cart> }
}>
type MixedKeys = keyof MixedResult
void invariant<Expect<'IsEmpty' extends MixedKeys ? true : false, true>>()
void invariant<Expect<'HasValue' extends MixedKeys ? true : false, true>>()
void invariant<Expect<'aUser' extends MixedKeys ? true : false, true>>()
void invariant<Expect<'HasCart' extends MixedKeys ? true : false, true>>()

// Verify types are preserved in mixed result
void invariant<Expect<MixedResult['IsEmpty'], ClaimInterface<string>>>()
void invariant<Expect<MixedResult['HasValue'], ClaimInterface<number>>>()
void invariant<Expect<MixedResult['aUser'], ClaimInterface<User>>>()
void invariant<Expect<MixedResult['HasCart'], ClaimInterface<Cart>>>()

// Empty input should produce empty result
type EmptyResult = ClaimsResult<Record<string, never>>
void invariant<Expect<keyof EmptyResult, never>>()

// ClaimFor should handle constructor types (classes)
type ProductConstructor = typeof Product
type ProductClaim = ClaimFor<ProductConstructor>
void invariant<Expect<ProductClaim, ClaimInterface<Product>>>()
