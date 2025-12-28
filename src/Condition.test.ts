/**
 * Tests for Condition class
 */

import { typeGuard } from '@relational-fabric/canon'
import { describe, expect, it } from 'vitest'
import { Claim } from './Claim.js'
import { Condition } from './Condition.js'

describe('condition', () => {
  it('creates a condition from a claim and reference function', () => {
    const isTrue = typeGuard<boolean>((value: unknown) => value === true)
    const claim = new Claim(isTrue)

    const state = { value: true }
    const condition = new Condition(claim, () => state.value)

    expect(condition).toBeDefined()
    expect(typeof condition.eager).toBe('function')
    expect(typeof condition.lazy).toBe('function')
  })

  describe('eager()', () => {
    it('returns a callable Conditional', () => {
      const isTrue = typeGuard<boolean>((value: unknown) => value === true)
      const claim = new Claim(isTrue)

      const state = { value: true }
      const condition = new Condition(claim, () => state.value)
      const eager = condition.eager()

      expect(typeof eager).toBe('function')
      expect(eager()).toBe(true)

      state.value = false
      expect(eager()).toBe(false)
    })

    it('supports composition with and()', () => {
      const isTrue = typeGuard<boolean>((value: unknown) => value === true)
      const isFalse = typeGuard<boolean>((value: unknown) => value === false)
      const claim1 = new Claim(isTrue)
      const claim2 = new Claim(isFalse)

      const state = { value: true }
      const condition = new Condition(claim1, () => state.value)
      const eager = condition.eager().and(claim2)

      expect(typeof eager).toBe('function')
      expect(eager()).toBe(false) // true AND false = false
    })

    it('supports composition with or()', () => {
      const isTrue = typeGuard<boolean>((value: unknown) => value === true)
      const isFalse = typeGuard<boolean>((value: unknown) => value === false)
      const claim1 = new Claim(isTrue)
      const claim2 = new Claim(isFalse)

      const state = { value: true }
      const condition = new Condition(claim1, () => state.value)
      const eager = condition.eager().or(claim2)

      expect(typeof eager).toBe('function')
      expect(eager()).toBe(true) // true OR false = true
    })
  })

  describe('lazy()', () => {
    it('returns a callable Conditional', () => {
      const isTrue = typeGuard<boolean>((value: unknown) => value === true)
      const claim = new Claim(isTrue)

      const state = { value: true }
      const condition = new Condition(claim, () => state.value)
      const lazy = condition.lazy()

      expect(typeof lazy).toBe('function')
      expect(lazy()).toBe(true)

      state.value = false
      expect(lazy()).toBe(false)
    })

    it('supports composition with and()', () => {
      const isTrue = typeGuard<boolean>((value: unknown) => value === true)
      const isFalse = typeGuard<boolean>((value: unknown) => value === false)
      const claim1 = new Claim(isTrue)
      const claim2 = new Claim(isFalse)

      const state = { value: true }
      const condition = new Condition(claim1, () => state.value)
      const lazy = condition.lazy().and(claim2)

      expect(typeof lazy).toBe('function')
      expect(lazy()).toBe(false) // true AND false = false
    })

    it('supports composition with or()', () => {
      const isTrue = typeGuard<boolean>((value: unknown) => value === true)
      const isFalse = typeGuard<boolean>((value: unknown) => value === false)
      const claim1 = new Claim(isTrue)
      const claim2 = new Claim(isFalse)

      const state = { value: true }
      const condition = new Condition(claim1, () => state.value)
      const lazy = condition.lazy().or(claim2)

      expect(typeof lazy).toBe('function')
      expect(lazy()).toBe(true) // true OR false = true
    })
  })
})
