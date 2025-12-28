/**
 * Type invariants for ClaimsInput and ClaimsResult
 *
 * These compile-time assertions verify the claims() function type transformations.
 */

import type { Expect, Predicate, TypeGuard } from '@relational-fabric/canon'
import type { ClaimFor, ClaimInterface, ClaimsInput, ClaimsResult } from '../types/index.js'
import { invariant } from '@relational-fabric/canon'

// Test types for verification
interface User { id: number, email: string }
interface Cart { items: unknown[] }

class Product {
  constructor(public id: number, public name: string) {}
}

// ClaimsInput should accept relations (predicates)
interface RelationInput { relations: { isEmpty: Predicate<unknown> } }
invariant<Expect<RelationInput, ClaimsInput>>()

// ClaimsInput should accept types (guards)
interface TypeInput { types: { isUser: TypeGuard<User> } }
invariant<Expect<TypeInput, ClaimsInput>>()

// ClaimsInput should accept both
interface MixedInput {
  relations: { isEmpty: Predicate<unknown> }
  types: { isUser: TypeGuard<User> }
}
invariant<Expect<MixedInput, ClaimsInput>>()

// ClaimsResult should transform relation names
type RelationResult = ClaimsResult<{ relations: { isEmpty: Predicate<string> } }>
invariant<Expect<'IsEmpty' extends keyof RelationResult ? true : false, true>>()

// ClaimsResult should transform type guard names
type TypeResult = ClaimsResult<{ types: { isUser: TypeGuard<User> } }>
invariant<Expect<'aUser' extends keyof TypeResult ? true : false, true>>()

// ClaimsResult values should preserve actual types from TypeGuards
type UserClaimResult = ClaimsResult<{ types: { isUser: TypeGuard<User> } }>['aUser']
invariant<Expect<UserClaimResult, ClaimInterface<User>>>()

// ClaimsResult values should preserve actual types from Predicates
type StringClaimResult = ClaimsResult<{ relations: { isEmpty: Predicate<string> } }>['IsEmpty']
invariant<Expect<StringClaimResult, ClaimInterface<string>>>()

// ClaimsResult should handle mixed inputs with preserved types
type MixedResult = ClaimsResult<{
  relations: { isEmpty: Predicate<string>, hasValue: Predicate<number> }
  types: { isUser: TypeGuard<User>, hasCart: TypeGuard<Cart> }
}>
type MixedKeys = keyof MixedResult
invariant<Expect<'IsEmpty' extends MixedKeys ? true : false, true>>()
invariant<Expect<'HasValue' extends MixedKeys ? true : false, true>>()
invariant<Expect<'aUser' extends MixedKeys ? true : false, true>>()
invariant<Expect<'HasCart' extends MixedKeys ? true : false, true>>()

// Verify types are preserved in mixed result
invariant<Expect<MixedResult['IsEmpty'], ClaimInterface<string>>>()
invariant<Expect<MixedResult['HasValue'], ClaimInterface<number>>>()
invariant<Expect<MixedResult['aUser'], ClaimInterface<User>>>()
invariant<Expect<MixedResult['HasCart'], ClaimInterface<Cart>>>()

// Empty input should produce empty result
type EmptyResult = ClaimsResult<Record<string, never>>
invariant<Expect<keyof EmptyResult, never>>()

// ClaimFor should handle constructor types (classes)
type ProductConstructor = typeof Product
type ProductClaim = ClaimFor<ProductConstructor>
invariant<Expect<ProductClaim, ClaimInterface<Product>>>()
