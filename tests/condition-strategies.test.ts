/**
 * Tests for Condition strategy classes (Eager, Lazy)
 */

import { typeGuard } from '@relational-fabric/canon'
import { claims } from '@relational-fabric/howard'
import { describe, expect, it } from 'vitest'

describe('eager', () => {
  it('evaluates immediately when called', () => {
    const isPositive = typeGuard<number>((value: unknown) => {
      return typeof value === 'number' && value > 0
    })
    const { IsPositive } = claims({
      relations: { isPositive },
    })

    let state = 5
    const eager = IsPositive.given(() => state).eager()

    expect(eager()).toBe(true)

    state = -1
    expect(eager()).toBe(false)
  })

  it('supports and() composition', () => {
    const isPositive = typeGuard<number>((value: unknown) => {
      return typeof value === 'number' && value > 0
    })
    const isEven = typeGuard<number>((value: unknown) => {
      return typeof value === 'number' && value % 2 === 0
    })

    const { IsPositive } = claims({
      relations: { isPositive },
    })
    const { IsEven } = claims({
      relations: { isEven },
    })

    let state = 4
    const eager = IsPositive.given(() => state).eager().and(IsEven)

    expect(eager()).toBe(true) // 4 is positive and even

    state = 3
    expect(eager()).toBe(false) // 3 is positive but not even
  })

  it('supports or() composition', () => {
    const isZero = typeGuard<number>((value: unknown) => value === 0)
    const isPositive = typeGuard<number>((value: unknown) => {
      return typeof value === 'number' && value > 0
    })

    const { IsZero } = claims({
      relations: { isZero },
    })
    const { IsPositive } = claims({
      relations: { isPositive },
    })

    let state = 0
    const eager = IsZero.given(() => state).eager().or(IsPositive)

    expect(eager()).toBe(true) // 0 is zero

    state = 5
    expect(eager()).toBe(true) // 5 is positive

    state = -1
    expect(eager()).toBe(false) // -1 is neither zero nor positive
  })
})

describe('lazy', () => {
  it('evaluates when called', () => {
    const isPositive = typeGuard<number>((value: unknown) => {
      return typeof value === 'number' && value > 0
    })
    const { IsPositive } = claims({
      relations: { isPositive },
    })

    let state = 5
    const lazy = IsPositive.given(() => state).lazy()

    expect(lazy()).toBe(true)

    state = -1
    expect(lazy()).toBe(false)
  })

  it('supports and() composition', () => {
    const isPositive = typeGuard<number>((value: unknown) => {
      return typeof value === 'number' && value > 0
    })
    const isEven = typeGuard<number>((value: unknown) => {
      return typeof value === 'number' && value % 2 === 0
    })

    const { IsPositive } = claims({
      relations: { isPositive },
    })
    const { IsEven } = claims({
      relations: { isEven },
    })

    let state = 4
    const lazy = IsPositive.given(() => state).lazy().and(IsEven)

    expect(lazy()).toBe(true) // 4 is positive and even

    state = 3
    expect(lazy()).toBe(false) // 3 is positive but not even
  })

  it('supports or() composition', () => {
    const isZero = typeGuard<number>((value: unknown) => value === 0)
    const isPositive = typeGuard<number>((value: unknown) => {
      return typeof value === 'number' && value > 0
    })

    const { IsZero } = claims({
      relations: { isZero },
    })
    const { IsPositive } = claims({
      relations: { isPositive },
    })

    let state = 0
    const lazy = IsZero.given(() => state).lazy().or(IsPositive)

    expect(lazy()).toBe(true) // 0 is zero

    state = 5
    expect(lazy()).toBe(true) // 5 is positive

    state = -1
    expect(lazy()).toBe(false) // -1 is neither zero nor positive
  })
})
