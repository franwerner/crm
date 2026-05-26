import { BusinessRuleError, ValidationError } from '@shared/errors'

export interface Money {
  readonly amountMinor: number
  readonly currency: string
}

export const Money = {
  of(amountMinor: number, currency: string): Money {
    if (!Number.isInteger(amountMinor) || amountMinor < 0) {
      throw new ValidationError('Amount must be a non-negative integer', [
        { field: 'amountMinor', message: 'amountMinor must be an integer >= 0' },
      ])
    }
    if (currency.length !== 3 || currency !== currency.toUpperCase()) {
      throw new ValidationError('Currency must be 3 uppercase ISO 4217 characters', [
        { field: 'currency', message: 'expected 3-char uppercase ISO 4217 code' },
      ])
    }
    return { amountMinor, currency }
  },

  add(a: Money, b: Money): Money {
    if (a.currency !== b.currency) {
      throw new BusinessRuleError(`Currency mismatch: ${a.currency} vs ${b.currency}`)
    }
    return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency }
  },

  subtract(a: Money, b: Money): Money {
    if (a.currency !== b.currency) {
      throw new BusinessRuleError(`Currency mismatch: ${a.currency} vs ${b.currency}`)
    }
    const result = a.amountMinor - b.amountMinor
    if (result < 0) {
      throw new BusinessRuleError('Subtraction would produce a negative amount')
    }
    return { amountMinor: result, currency: a.currency }
  },

  sum(values: Money[]): Money {
    if (values.length === 0) {
      throw new ValidationError('Cannot sum empty array', [
        { field: 'values', message: 'at least one value required' },
      ])
    }
    const first = values[0]!
    const currency = first.currency
    for (const v of values) {
      if (v.currency !== currency) {
        throw new BusinessRuleError(`Currency mismatch in sum: ${currency} vs ${v.currency}`)
      }
    }
    const total = values.reduce((acc, v) => acc + v.amountMinor, 0)
    return { amountMinor: total, currency }
  },
}
