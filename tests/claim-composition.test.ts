/**
 * Tests for Claim composition classes (And, Or, On)
 */

import { typeGuard } from '@relational-fabric/canon'
import { claims } from '@relational-fabric/howard'
import { describe, expect, it } from 'vitest'

describe('and', () => {
  it('performs logical AND of two claims', () => {
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
    const andClaim = IsPositive.and(IsEven)

    expect(andClaim.check(4)).toBe(true)
    expect(andClaim.check(3)).toBe(false)
    expect(andClaim.check(2)).toBe(true)
    expect(andClaim.check(-2)).toBe(false)
  })

  it('supports chaining with and()', () => {
    const isPositive = typeGuard<number>((value: unknown) => {
      return typeof value === 'number' && value > 0
    })
    const isEven = typeGuard<number>((value: unknown) => {
      return typeof value === 'number' && value % 2 === 0
    })
    const isLessThan10 = typeGuard<number>((value: unknown) => {
      return typeof value === 'number' && value < 10
    })

    const { IsPositive } = claims({
      relations: { isPositive },
    })
    const { IsEven } = claims({
      relations: { isEven },
    })
    const { IsLessThan10 } = claims({
      relations: { isLessThan10 },
    })
    const composed = IsPositive.and(IsEven).and(IsLessThan10)

    expect(composed.check(4)).toBe(true)
    expect(composed.check(12)).toBe(false)
  })
})

describe('or', () => {
  it('performs logical OR of two claims', () => {
    const isPositive = typeGuard<number>((value: unknown) => {
      return typeof value === 'number' && value > 0
    })
    const isZero = typeGuard<number>((value: unknown) => {
      return value === 0
    })

    const { IsPositive } = claims({
      relations: { isPositive },
    })
    const { IsZero } = claims({
      relations: { isZero },
    })
    const orClaim = IsPositive.or(IsZero)

    expect(orClaim.check(5)).toBe(true)
    expect(orClaim.check(0)).toBe(true)
    expect(orClaim.check(-1)).toBe(false)
  })

  it('supports chaining with or()', () => {
    const isZero = typeGuard<number>((value: unknown) => value === 0)
    const isOne = typeGuard<number>((value: unknown) => value === 1)
    const isTwo = typeGuard<number>((value: unknown) => value === 2)

    const { IsZero } = claims({
      relations: { isZero },
    })
    const { IsOne } = claims({
      relations: { isOne },
    })
    const { IsTwo } = claims({
      relations: { isTwo },
    })
    const composed = IsZero.or(IsOne).or(IsTwo)

    expect(composed.check(0)).toBe(true)
    expect(composed.check(1)).toBe(true)
    expect(composed.check(2)).toBe(true)
    expect(composed.check(3)).toBe(false)
  })
})

describe('on', () => {
  it('checks nested property with a claim', () => {
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

    const { aPerson } = claims({
      types: { isPerson },
    })
    const { anAdult } = claims({
      types: { isAdult },
    })
    const onClaim = aPerson.on('age', anAdult)

    expect(onClaim.check({ name: 'Alice', age: 25 })).toBe(true)
    expect(onClaim.check({ name: 'Bob', age: 15 })).toBe(false)
    expect(onClaim.check({ name: 'Charlie' })).toBe(false)
  })

  it('fails when parent claim fails', () => {
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

    const { aPerson } = claims({
      types: { isPerson },
    })
    const { anAdult } = claims({
      types: { isAdult },
    })
    const onClaim = aPerson.on('age', anAdult)

    expect(onClaim.check({ invalid: 'object' })).toBe(false)
    expect(onClaim.check(null)).toBe(false)
  })

  it('supports chaining with on()', () => {
    interface Address {
      street: string
      city: string
    }
    interface Person {
      name: string
      address: Address
    }

    const isPerson = typeGuard<Person>((value: unknown) => {
      return typeof value === 'object'
        && value !== null
        && 'name' in value
        && 'address' in value
    })

    const isNonEmpty = typeGuard<string>((value: unknown) => {
      return typeof value === 'string' && value.length > 0
    })

    const { aPerson } = claims({
      types: { isPerson },
    })
    const { IsNonEmpty } = claims({
      relations: { isNonEmpty },
    })
    const composed = aPerson.on('name', IsNonEmpty)

    expect(composed.check({ name: 'Alice', address: { street: '123 Main', city: 'NYC' } })).toBe(true)
    expect(composed.check({ name: '', address: { street: '123 Main', city: 'NYC' } })).toBe(false)
  })
})
