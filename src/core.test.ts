/**
 * Tests for claims() factory function
 */

import type { Predicate } from '@relational-fabric/canon'
import { typeGuard } from '@relational-fabric/canon'
import { describe, expect, it } from 'vitest'
import { claims } from './core.js'

describe('claims()', () => {
  describe('with predicates', () => {
    it('transforms predicate names correctly', () => {
      const isEmpty = typeGuard<unknown>((_value: unknown) => false)
      const hasValue = typeGuard<unknown>((_value: unknown) => false)

      const result = claims({
        predicates: { isEmpty, hasValue },
      })

      expect('IsEmpty' in result).toBe(true)
      expect('HasValue' in result).toBe(true)
    })

    it('creates working claims from predicates', () => {
      const isEmpty: Predicate<unknown> = (value: unknown) => {
        if (Array.isArray(value))
          return value.length === 0
        return false
      }

      const { IsEmpty } = claims({ predicates: { isEmpty } })

      expect(IsEmpty.check([])).toBe(true)
      expect(IsEmpty.check([1])).toBe(false)
    })
  })

  describe('with guards', () => {
    it('transforms guard names to article form', () => {
      interface User {
        id: number
      }
      const isUser = typeGuard<User>((_value: unknown) => false)
      const hasCart = typeGuard<{ cart: unknown }>((_value: unknown) => false)

      const result = claims({
        guards: { isUser, hasCart },
      })

      expect('aUser' in result).toBe(true)
      expect('HasCart' in result).toBe(true)
    })

    it('creates working claims from guards', () => {
      interface User {
        id: number
      }

      const isUser = typeGuard<User>((value: unknown) => typeof value === 'object' && value !== null && 'id' in value)

      const { aUser } = claims({ guards: { isUser } })

      expect(aUser.check({ id: 1 })).toBe(true)
      expect(aUser.check({})).toBe(false)
    })
  })

  describe('with mixed predicates and guards', () => {
    it('creates claims from both', () => {
      const isEmpty = typeGuard<unknown>((_value: unknown) => false)
      interface User {
        id: number
      }
      const isUser = typeGuard<User>((_value: unknown) => false)

      const result = claims({
        predicates: { isEmpty },
        guards: { isUser },
      })

      expect('IsEmpty' in result).toBe(true)
      expect('aUser' in result).toBe(true)
    })
  })

  describe('created claims', () => {
    it('have check method', () => {
      const isEmpty = typeGuard<unknown>((_value: unknown) => false)
      const { anEmpty } = claims({ guards: { isEmpty } })

      expect(typeof anEmpty.check).toBe('function')
    })

    it('have composition methods', () => {
      const isEmpty = typeGuard<unknown>((_value: unknown) => false)
      const { anEmpty } = claims({ guards: { isEmpty } })

      expect(typeof anEmpty.and).toBe('function')
      expect(typeof anEmpty.or).toBe('function')
      expect(typeof anEmpty.on).toBe('function')
      expect(typeof anEmpty.given).toBe('function')
    })
  })
})
