/**
 * Type invariants for naming transformations
 *
 * These compile-time assertions verify that name transformations work correctly.
 */

import type { Expect } from '@relational-fabric/canon'
import type { TransformGuardName, TransformPredicateName } from './naming.js'
import { invariant } from '@relational-fabric/canon'

// Predicate name transformations
void invariant<Expect<TransformPredicateName<'isEmpty'>, 'IsEmpty'>>()
void invariant<Expect<TransformPredicateName<'isValid'>, 'IsValid'>>()
void invariant<Expect<TransformPredicateName<'isValidEmail'>, 'IsValidEmail'>>()
void invariant<Expect<TransformPredicateName<'hasValue'>, 'HasValue'>>()
void invariant<Expect<TransformPredicateName<'hasLength'>, 'HasLength'>>()
void invariant<Expect<TransformPredicateName<'custom'>, 'Custom'>>()

// Guard name transformations - consonant sounds use 'a'
void invariant<Expect<TransformGuardName<'isUser'>, 'aUser'>>()
void invariant<Expect<TransformGuardName<'isCart'>, 'aCart'>>()
void invariant<Expect<TransformGuardName<'isString'>, 'aString'>>()

// Guard name transformations - vowel sounds use 'an'
void invariant<Expect<TransformGuardName<'isObject'>, 'anObject'>>()
void invariant<Expect<TransformGuardName<'isEmpty'>, 'anEmpty'>>()
void invariant<Expect<TransformGuardName<'isArray'>, 'anArray'>>()
void invariant<Expect<TransformGuardName<'isItem'>, 'anItem'>>()

// Guard name transformations - 'has' prefix
void invariant<Expect<TransformGuardName<'hasCart'>, 'HasCart'>>()
void invariant<Expect<TransformGuardName<'hasValue'>, 'HasValue'>>()

// Guard name transformations - other cases
void invariant<Expect<TransformGuardName<'custom'>, 'Custom'>>()

// Edge cases - short names
void invariant<Expect<TransformPredicateName<'is'>, 'Is'>>()
void invariant<Expect<TransformPredicateName<'has'>, 'Has'>>()
// Note: 'is' alone would transform to 'aS' - edge case, unlikely in practice
