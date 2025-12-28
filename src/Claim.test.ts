/**
 * Tests for Claim class
 */

import { typeGuard } from '@relational-fabric/canon'
import { describe, expect, it } from 'vitest'
import { Claim } from './Claim.js'

describe('claim', () => {
  describe('check()', () => {
    it('evaluates the underlying predicate', () => {
      const isPositive = typeGuard<number>((value: unknown) => {
        return typeof value === 'number' && value > 0
      })
      const claim = new Claim(isPositive)

      expect(claim.check(5)).toBe(true)
      expect(claim.check(-1)).toBe(false)
      expect(claim.check('hello')).toBe(false)
    })
  })

  describe('and()', () => {
    it('returns a composed claim', () => {
      const isPositive = typeGuard<number>((value: unknown) => {
        return typeof value === 'number' && value > 0
      })
      const isEven = typeGuard<number>((value: unknown) => {
        return typeof value === 'number' && value % 2 === 0
      })

      const claim1 = new Claim(isPositive)
      const claim2 = new Claim(isEven)
      const composed = claim1.and(claim2)

      expect(composed.check(4)).toBe(true)
      expect(composed.check(3)).toBe(false)
      expect(composed.check(-2)).toBe(false)
    })
  })

  describe('or()', () => {
    it('returns a composed claim', () => {
      const isPositive = typeGuard<number>((value: unknown) => {
        return typeof value === 'number' && value > 0
      })
      const isZero = typeGuard<number>((value: unknown) => {
        return value === 0
      })

      const claim1 = new Claim(isPositive)
      const claim2 = new Claim(isZero)
      const composed = claim1.or(claim2)

      expect(composed.check(5)).toBe(true)
      expect(composed.check(0)).toBe(true)
      expect(composed.check(-1)).toBe(false)
    })
  })

  describe('on()', () => {
    it('checks nested properties', () => {
      interface Person {
        name: string
        age: number
      }

      const isPerson = typeGuard<Person>((value: unknown) => {
        return typeof value === 'object'
          && value !== null
          && 'name' in value
          && 'age' in value
      })

      const isAdult = typeGuard<number>((value: unknown) => {
        return typeof value === 'number' && value >= 18
      })

      const personClaim = new Claim<Person>(isPerson)
      const adultClaim = new Claim<number>(isAdult)
      const composed = personClaim.on('age', adultClaim)

      expect(composed.check({ name: 'Alice', age: 25 })).toBe(true)
      expect(composed.check({ name: 'Bob', age: 15 })).toBe(false)
      expect(composed.check({ name: 'Charlie' })).toBe(false)
    })
  })

  describe('given()', () => {
    it('returns a Condition', () => {
      const isTrue = typeGuard<boolean>((value: unknown) => value === true)
      const claim = new Claim(isTrue)

      const state = { value: true }
      const condition = claim.given(() => state.value)

      expect(condition).toBeDefined()
      expect(typeof condition.eager).toBe('function')
      expect(typeof condition.lazy).toBe('function')
    })
  })
})
