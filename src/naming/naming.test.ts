/**
 * Tests for name transformation logic
 */

import type { Expect } from '@relational-fabric/canon'
import type { TransformGuardName, TransformPredicateName } from '../types/index.js'
import { invariant } from '@relational-fabric/canon'
import { describe, expect, it } from 'vitest'
import { nameForGuard, nameForPredicate } from './index.js'

describe('nameForPredicate', () => {
  it('transforms is* predicates to Is* claims', () => {
    invariant<Expect<TransformPredicateName<'isEmpty'>, 'IsEmpty'>>()
    expect(nameForPredicate('isEmpty')).toBe('IsEmpty')

    invariant<Expect<TransformPredicateName<'isValid'>, 'IsValid'>>()
    expect(nameForPredicate('isValid')).toBe('IsValid')

    invariant<Expect<TransformPredicateName<'isValidEmail'>, 'IsValidEmail'>>()
    expect(nameForPredicate('isValidEmail')).toBe('IsValidEmail')

    // Names used in howard/tests (predicates - propositional truth)
    invariant<Expect<TransformPredicateName<'isPositive'>, 'IsPositive'>>()
    expect(nameForPredicate('isPositive')).toBe('IsPositive')

    invariant<Expect<TransformPredicateName<'isEven'>, 'IsEven'>>()
    expect(nameForPredicate('isEven')).toBe('IsEven')

    invariant<Expect<TransformPredicateName<'isLessThan10'>, 'IsLessThan10'>>()
    expect(nameForPredicate('isLessThan10')).toBe('IsLessThan10')

    invariant<Expect<TransformPredicateName<'isZero'>, 'IsZero'>>()
    expect(nameForPredicate('isZero')).toBe('IsZero')

    invariant<Expect<TransformPredicateName<'isOne'>, 'IsOne'>>()
    expect(nameForPredicate('isOne')).toBe('IsOne')

    invariant<Expect<TransformPredicateName<'isTwo'>, 'IsTwo'>>()
    expect(nameForPredicate('isTwo')).toBe('IsTwo')

    invariant<Expect<TransformPredicateName<'isAdult'>, 'IsAdult'>>()
    expect(nameForPredicate('isAdult')).toBe('IsAdult')

    invariant<Expect<TransformPredicateName<'isNonEmpty'>, 'IsNonEmpty'>>()
    expect(nameForPredicate('isNonEmpty')).toBe('IsNonEmpty')
  })

  it('transforms has* predicates to Has* claims', () => {
    invariant<Expect<TransformPredicateName<'hasValue'>, 'HasValue'>>()
    expect(nameForPredicate('hasValue')).toBe('HasValue')

    invariant<Expect<TransformPredicateName<'hasLength'>, 'HasLength'>>()
    expect(nameForPredicate('hasLength')).toBe('HasLength')
  })

  it('capitalizes other predicate names', () => {
    invariant<Expect<TransformPredicateName<'custom'>, 'Custom'>>()
    expect(nameForPredicate('custom')).toBe('Custom')

    invariant<Expect<TransformPredicateName<'validate'>, 'Validate'>>()
    expect(nameForPredicate('validate')).toBe('Validate')
  })

  it('handles edge cases with short names', () => {
    invariant<Expect<TransformPredicateName<'is'>, 'Is'>>()
    expect(nameForPredicate('is')).toBe('Is')

    invariant<Expect<TransformPredicateName<'has'>, 'Has'>>()
    expect(nameForPredicate('has')).toBe('Has')
  })
})

describe('nameForGuard', () => {
  it('transforms is* guards to a* claims', () => {
    invariant<Expect<TransformGuardName<'isUser'>, 'aUser'>>()
    expect(nameForGuard('isUser')).toBe('aUser')

    invariant<Expect<TransformGuardName<'isCart'>, 'aCart'>>()
    expect(nameForGuard('isCart')).toBe('aCart')

    invariant<Expect<TransformGuardName<'isString'>, 'aString'>>()
    expect(nameForGuard('isString')).toBe('aString')

    // Names used in howard/tests (type guards - narrow type)
    invariant<Expect<TransformGuardName<'isPerson'>, 'aPerson'>>()
    expect(nameForGuard('isPerson')).toBe('aPerson')
  })

  it('transforms is* guards to an* for vowel-starting names', () => {
    invariant<Expect<TransformGuardName<'isObject'>, 'anObject'>>()
    expect(nameForGuard('isObject')).toBe('anObject')

    invariant<Expect<TransformGuardName<'isEmpty'>, 'anEmpty'>>()
    expect(nameForGuard('isEmpty')).toBe('anEmpty')

    invariant<Expect<TransformGuardName<'isArray'>, 'anArray'>>()
    expect(nameForGuard('isArray')).toBe('anArray')

    invariant<Expect<TransformGuardName<'isItem'>, 'anItem'>>()
    expect(nameForGuard('isItem')).toBe('anItem')

    // Names used in howard/tests (type guards - narrow type)
    invariant<Expect<TransformGuardName<'isAdult'>, 'anAdult'>>()
    expect(nameForGuard('isAdult')).toBe('anAdult')
  })

  it('transforms has* guards to Has* claims', () => {
    invariant<Expect<TransformGuardName<'hasCart'>, 'HasCart'>>()
    expect(nameForGuard('hasCart')).toBe('HasCart')

    invariant<Expect<TransformGuardName<'hasValue'>, 'HasValue'>>()
    expect(nameForGuard('hasValue')).toBe('HasValue')
  })

  it('capitalizes other guard names', () => {
    invariant<Expect<TransformGuardName<'custom'>, 'Custom'>>()
    expect(nameForGuard('custom')).toBe('Custom')
  })
})
