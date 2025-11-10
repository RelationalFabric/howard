/**
 * Tests for Condition strategy classes (Eager, Lazy)
 */

import { typeGuard } from '@relational-fabric/canon'
import { describe, expect, it } from 'vitest'
import Claim from '~/Claim.js'
import ConditionEager from '~/Condition/Eager.js'
import ConditionLazy from '~/Condition/Lazy.js'

describe('eager', () => {
  it('evaluates immediately when called', () => {
    const isPositive = typeGuard<number>((value: unknown): value is number => {
      return typeof value === 'number' && value > 0
    })
    const claim = new Claim(isPositive)

    let state = 5
    const eager = new ConditionEager(claim, () => state).toConditional()

    expect(eager()).toBe(true)

    state = -1
    expect(eager()).toBe(false)
  })

  it('supports and() composition', () => {
    const isPositive = typeGuard<number>((value: unknown): value is number => {
      return typeof value === 'number' && value > 0
    })
    const isEven = typeGuard<number>((value: unknown): value is number => {
      return typeof value === 'number' && value % 2 === 0
    })

    const claim1 = new Claim(isPositive)
    const claim2 = new Claim(isEven)

    let state = 4
    const eager = new ConditionEager(claim1, () => state).toConditional().and(claim2)

    expect(eager()).toBe(true) // 4 is positive and even

    state = 3
    expect(eager()).toBe(false) // 3 is positive but not even
  })

  it('supports or() composition', () => {
    const isZero = typeGuard<number>((value: unknown): value is number => value === 0)
    const isPositive = typeGuard<number>((value: unknown): value is number => {
      return typeof value === 'number' && value > 0
    })

    const claim1 = new Claim(isZero)
    const claim2 = new Claim(isPositive)

    let state = 0
    const eager = new ConditionEager(claim1, () => state).toConditional().or(claim2)

    expect(eager()).toBe(true) // 0 is zero

    state = 5
    expect(eager()).toBe(true) // 5 is positive

    state = -1
    expect(eager()).toBe(false) // -1 is neither zero nor positive
  })
})

describe('lazy', () => {
  it('evaluates when called', () => {
    const isPositive = typeGuard<number>((value: unknown): value is number => {
      return typeof value === 'number' && value > 0
    })
    const claim = new Claim(isPositive)

    let state = 5
    const lazy = new ConditionLazy(claim, () => state).toConditional()

    expect(lazy()).toBe(true)

    state = -1
    expect(lazy()).toBe(false)
  })

  it('supports and() composition', () => {
    const isPositive = typeGuard<number>((value: unknown): value is number => {
      return typeof value === 'number' && value > 0
    })
    const isEven = typeGuard<number>((value: unknown): value is number => {
      return typeof value === 'number' && value % 2 === 0
    })

    const claim1 = new Claim(isPositive)
    const claim2 = new Claim(isEven)

    let state = 4
    const lazy = new ConditionLazy(claim1, () => state).toConditional().and(claim2)

    expect(lazy()).toBe(true) // 4 is positive and even

    state = 3
    expect(lazy()).toBe(false) // 3 is positive but not even
  })

  it('supports or() composition', () => {
    const isZero = typeGuard<number>((value: unknown): value is number => value === 0)
    const isPositive = typeGuard<number>((value: unknown): value is number => {
      return typeof value === 'number' && value > 0
    })

    const claim1 = new Claim(isZero)
    const claim2 = new Claim(isPositive)

    let state = 0
    const lazy = new ConditionLazy(claim1, () => state).toConditional().or(claim2)

    expect(lazy()).toBe(true) // 0 is zero

    state = 5
    expect(lazy()).toBe(true) // 5 is positive

    state = -1
    expect(lazy()).toBe(false) // -1 is neither zero nor positive
  })
})
