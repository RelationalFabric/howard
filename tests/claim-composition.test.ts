/**
 * Tests for Claim composition classes (And, Or, On)
 */

import { typeGuard } from '@relational-fabric/canon'
import { describe, expect, it } from 'vitest'
import Claim from '~/Claim.js'
import ClaimAnd from '~/Claim/And.js'
import ClaimOn from '~/Claim/On.js'
import ClaimOr from '~/Claim/Or.js'

describe('and', () => {
  it('performs logical AND of two claims', () => {
    const isPositive = typeGuard<number>((value: unknown) => {
      return typeof value === 'number' && value > 0
    })
    const isEven = typeGuard<number>((value: unknown) => {
      return typeof value === 'number' && value % 2 === 0
    })

    const claim1 = new Claim(isPositive)
    const claim2 = new Claim(isEven)
    const andClaim = new ClaimAnd(claim1, claim2)

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

    const claim1 = new Claim(isPositive)
    const claim2 = new Claim(isEven)
    const claim3 = new Claim(isLessThan10)
    const composed = claim1.and(claim2).and(claim3)

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

    const claim1 = new Claim(isPositive)
    const claim2 = new Claim(isZero)
    const orClaim = new ClaimOr(claim1, claim2)

    expect(orClaim.check(5)).toBe(true)
    expect(orClaim.check(0)).toBe(true)
    expect(orClaim.check(-1)).toBe(false)
  })

  it('supports chaining with or()', () => {
    const isZero = typeGuard<number>((value: unknown) => value === 0)
    const isOne = typeGuard<number>((value: unknown) => value === 1)
    const isTwo = typeGuard<number>((value: unknown) => value === 2)

    const claim1 = new Claim(isZero)
    const claim2 = new Claim(isOne)
    const claim3 = new Claim(isTwo)
    const composed = claim1.or(claim2).or(claim3)

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

    const personClaim = new Claim<Person>(isPerson)
    const adultClaim = new Claim<number>(isAdult)
    const onClaim = new ClaimOn<Person, 'age'>(personClaim, 'age', adultClaim)

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

    const personClaim = new Claim<Person>(isPerson)
    const adultClaim = new Claim<number>(isAdult)
    const onClaim = new ClaimOn<Person, 'age'>(personClaim, 'age', adultClaim)

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

    const personClaim = new Claim<Person>(isPerson)
    const nonEmptyClaim = new Claim<string>(isNonEmpty)
    const composed = personClaim.on('name', nonEmptyClaim)

    expect(composed.check({ name: 'Alice', address: { street: '123 Main', city: 'NYC' } })).toBe(true)
    expect(composed.check({ name: '', address: { street: '123 Main', city: 'NYC' } })).toBe(false)
  })
})
