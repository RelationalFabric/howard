import { bench, describe } from 'vitest'
import { Claim } from '~/Claim.js'

const SAMPLE_SIZE = 5_000

const numberSamples = Array.from({ length: SAMPLE_SIZE }, (_, index) => index + 1)
const mixedSamples = numberSamples.map((value, index) =>
  index % 2 === 0 ? value : value.toString(),
)

const recordSamples = numberSamples.map((value, index) => ({
  value,
  nested: {
    even: value % 2 === 0,
    label: `value-${value}`,
  },
  tags: index % 3 === 0 ? ['primary'] : ['secondary'],
}))

const invalidRecords = recordSamples.map((record, index) =>
  index % 4 === 0
    ? { ...record, value: null }
    : index % 5 === 0
      ? { ...record, value: -record.value }
      : { ...record, value: record.value },
)

const isPositiveNumber = new Claim<number>((value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
})

const isEvenNumber = new Claim<number>((value: unknown): value is number => {
  return typeof value === 'number' && Number.isInteger(value) && value % 2 === 0
})

const isStringValue = new Claim<string>((value: unknown): value is string => {
  return typeof value === 'string'
})

const isPlainObject = new Claim<Record<string, unknown>>(
  (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null
  },
)

const evenPositiveNumber = isPositiveNumber.and(isEvenNumber)
const positiveOrString = isPositiveNumber.or(isStringValue)
const objectWithValue = isPlainObject.on('value', evenPositiveNumber)

describe('claim performance', () => {
  bench(
    'claim.check positive number',
    () => {
      for (const value of numberSamples) {
        if (!isPositiveNumber.check(value)) {
          throw new Error('Expected number to be positive')
        }
      }
    },
    {
      time: 1_000,
      warmupTime: 250,
    },
  )

  bench(
    'claim.check negative branch',
    () => {
      for (const value of mixedSamples) {
        if (typeof value === 'string' && isPositiveNumber.check(value)) {
          throw new Error('Expected string to fail positive number claim')
        }
      }
    },
    {
      time: 1_000,
      warmupTime: 250,
    },
  )

  bench(
    'claim.and (positive & even)',
    () => {
      for (const value of numberSamples) {
        evenPositiveNumber.check(value)
      }
    },
    {
      time: 1_000,
      warmupTime: 250,
    },
  )

  bench(
    'claim.or (number | string)',
    () => {
      for (const value of mixedSamples) {
        positiveOrString.check(value)
      }
    },
    {
      time: 1_000,
      warmupTime: 250,
    },
  )

  bench(
    'claim.on (object.value)',
    () => {
      for (const record of invalidRecords) {
        objectWithValue.check(record)
      }
    },
    {
      time: 1_000,
      warmupTime: 250,
    },
  )
})
