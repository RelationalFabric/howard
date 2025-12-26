/**
 * Type invariants for ClaimInterface
 *
 * These compile-time assertions verify type relationships and guard against regressions.
 */

import type { Expect, TypeGuard } from '@relational-fabric/canon'
import type { AnyClaim, ClaimInterface } from '../types/claim.js'
import { invariant } from '@relational-fabric/canon'

// ClaimInterface should have a check method that is a TypeGuard
type ClaimCheck<T> = ClaimInterface<T>['check']
void invariant<Expect<ClaimCheck<string>, TypeGuard<string>>>()

// ClaimInterface methods should have correct signatures
type AndMethod = ClaimInterface<string>['and']
void invariant<Expect<AndMethod, <U>(other: ClaimInterface<U>) => ClaimInterface<string & U>>>()

type OrMethod = ClaimInterface<string>['or']
void invariant<Expect<OrMethod, <U>(other: ClaimInterface<U>) => ClaimInterface<string | U>>>()

// on() preserves parent type when checking nested properties
interface HasName { name: string }
type HasNameClaim = ClaimInterface<HasName>
type StringClaim = ClaimInterface<string>
type OnMethod = HasNameClaim['on']
// Verify on() accepts the right parameters and returns the parent type
type OnAcceptsPath = Parameters<OnMethod>[0]
type OnAcceptsClaim = Parameters<OnMethod>[1]
void invariant<Expect<'name', OnAcceptsPath>>()
void invariant<Expect<StringClaim, OnAcceptsClaim>>()

// AnyClaim should be ClaimInterface<unknown>
void invariant<Expect<AnyClaim, ClaimInterface<unknown>>>()
void invariant<Expect<ClaimInterface<unknown>, AnyClaim>>()

// ClaimInterface should be covariant in T
void invariant<Expect<ClaimInterface<string>, ClaimInterface<string | number>>>()
