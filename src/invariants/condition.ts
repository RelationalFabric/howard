/**
 * Type invariants for ConditionInterface and ConditionalInterface
 *
 * These compile-time assertions verify reactive claim type relationships.
 */

import type { Expect } from '@relational-fabric/canon'
import type { AnyCondition, AnyConditional, ClaimInterface, ConditionalInterface, ConditionInterface } from '../types/index.js'
import { invariant } from '@relational-fabric/canon'

// ConditionInterface.eager should return ConditionalInterface
type EagerMethod<T> = ConditionInterface<T>['eager']
type EagerResult<T> = EagerMethod<T> extends () => infer R ? R : never
invariant<Expect<EagerResult<string>, ConditionalInterface<string>>>()

// ConditionInterface.lazy should return ConditionalInterface
type LazyMethod<T> = ConditionInterface<T>['lazy']
type LazyResult<T> = LazyMethod<T> extends () => infer R ? R : never
invariant<Expect<LazyResult<string>, ConditionalInterface<string>>>()

// ConditionalInterface should be callable and return boolean
type ConditionalIsCallable = ConditionalInterface<string> extends () => infer R ? R : never
invariant<Expect<ConditionalIsCallable, boolean>>()

// ConditionalInterface.and should compose correctly
type ConditionalAndMethod<T> = ConditionalInterface<T>['and']
type ConditionalAndResult<T, U> = ConditionalAndMethod<T> extends (other: ClaimInterface<U>) => infer R ? R : never
invariant<Expect<ConditionalAndResult<string, number>, ConditionalInterface<string & number>>>()

// ConditionalInterface.or should compose correctly
type ConditionalOrMethod<T> = ConditionalInterface<T>['or']
type ConditionalOrResult<T, U> = ConditionalOrMethod<T> extends (other: ClaimInterface<U>) => infer R ? R : never
invariant<Expect<ConditionalOrResult<string, number>, ConditionalInterface<string | number>>>()

// AnyCondition should be ConditionInterface<unknown>
invariant<Expect<AnyCondition, ConditionInterface<unknown>>>()
invariant<Expect<ConditionInterface<unknown>, AnyCondition>>()

// AnyConditional should be ConditionalInterface<unknown>
invariant<Expect<AnyConditional, ConditionalInterface<unknown>>>()
invariant<Expect<ConditionalInterface<unknown>, AnyConditional>>()

// ConditionInterface should be covariant in T
invariant<Expect<ConditionInterface<string>, ConditionInterface<string | number>>>()

// ConditionalInterface should be covariant in T
invariant<Expect<ConditionalInterface<string>, ConditionalInterface<string | number>>>()
