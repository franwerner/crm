import { Money } from '@modules/projects/domain/value-objects/money'
import type { ProjectProfit } from '@modules/projects/domain/value-objects/project-profit'
import type { ProjectBudgetItem } from '@modules/projects/domain/entities/project-budget-item'
import type { ProjectExpense } from '@modules/projects/domain/entities/project-expense'
import type { ProjectExtension } from '@modules/projects/domain/entities/project-extension'

export function computeTotalBudget(
  currency: string,
  budgetItems: readonly ProjectBudgetItem[],
  extensions: readonly ProjectExtension[],
): Money {
  const moneys: Money[] = [
    ...budgetItems.map((i) => Money.of(i.amountMinor, currency)),
    ...extensions
      .filter((e) => e.billedAmount !== null)
      .map((e) => Money.of(e.billedAmount!, currency)),
  ]
  if (moneys.length === 0) return Money.of(0, currency)
  return Money.sum(moneys)
}

export function computeTotalExpenses(
  currency: string,
  expenses: readonly ProjectExpense[],
  extensions: readonly ProjectExtension[],
): Money {
  const moneys: Money[] = [
    ...expenses.map((e) => Money.of(e.amountMinor, currency)),
    ...extensions
      .filter((e) => e.cost !== null)
      .map((e) => Money.of(e.cost!, currency)),
  ]
  if (moneys.length === 0) return Money.of(0, currency)
  return Money.sum(moneys)
}

export function computeProfit(
  currency: string,
  budgetItems: readonly ProjectBudgetItem[],
  expenses: readonly ProjectExpense[],
  extensions: readonly ProjectExtension[],
): ProjectProfit {
  const budget = computeTotalBudget(currency, budgetItems, extensions)
  const totalExpenses = computeTotalExpenses(currency, expenses, extensions)
  return { amountMinor: budget.amountMinor - totalExpenses.amountMinor, currency }
}
