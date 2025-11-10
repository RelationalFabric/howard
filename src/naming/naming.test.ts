/**
 * Tests for name transformation logic
 */

import { describe, expect, it } from 'vitest'
import { nameForGuard, nameForPredicate } from './index.js'

describe('nameForPredicate', () => {
  it('transforms is* predicates to Is* claims', () => {
    expect(nameForPredicate('isEmpty')).toBe('IsEmpty')
    expect(nameForPredicate('isValid')).toBe('IsValid')
    expect(nameForPredicate('isValidEmail')).toBe('IsValidEmail')
  })

  it('transforms has* predicates to Has* claims', () => {
    expect(nameForPredicate('hasValue')).toBe('HasValue')
    expect(nameForPredicate('hasLength')).toBe('HasLength')
  })

  it('capitalizes other predicate names', () => {
    expect(nameForPredicate('custom')).toBe('Custom')
    expect(nameForPredicate('validate')).toBe('Validate')
  })
})

describe('nameForGuard', () => {
  it('transforms is* guards to a* claims', () => {
    expect(nameForGuard('isUser')).toBe('aUser')
    expect(nameForGuard('isCart')).toBe('aCart')
    expect(nameForGuard('isString')).toBe('aString')
  })

  it('transforms is* guards to an* for vowel-starting names', () => {
    expect(nameForGuard('isObject')).toBe('anObject')
    expect(nameForGuard('isEmpty')).toBe('anEmpty')
    expect(nameForGuard('isArray')).toBe('anArray')
    expect(nameForGuard('isItem')).toBe('anItem')
  })

  it('transforms has* guards to Has* claims', () => {
    expect(nameForGuard('hasCart')).toBe('HasCart')
    expect(nameForGuard('hasValue')).toBe('HasValue')
  })

  it('capitalizes other guard names', () => {
    expect(nameForGuard('custom')).toBe('Custom')
  })
})
