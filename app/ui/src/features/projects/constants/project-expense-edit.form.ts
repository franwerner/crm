import { z } from 'zod/v4'
import type { FormDescriptor } from '@shared/lib/form-view/types'
import type { ProjectExpenseView } from '@shared/api/types/ProjectExpenseView'
import { addExpenseBodySchema } from '@shared/api/schemas/addExpenseBodySchema'

function toIsoDate(value: unknown): unknown {
  if (typeof value === 'string' && value.length > 10) return value.slice(0, 10)
  return value
}

export const expenseEditFormSchema = addExpenseBodySchema.extend({
  incurredAt: z.preprocess(toIsoDate, z.iso.date()),
})

export type ExpenseEditFormValues = z.infer<typeof expenseEditFormSchema>

export const expenseEditForm: FormDescriptor<ExpenseEditFormValues> = {
  name: 'expense-edit',
  fields: [
    { key: 'concept', label: 'Concepto', widget: 'text', required: true, placeholder: 'Descripción del gasto' },
    { key: 'amountMinor', label: 'Monto (centavos)', widget: 'number', required: true, placeholder: '0' },
    { key: 'incurredAt', label: 'Fecha del gasto', widget: 'date', required: true },
  ],
}

export function getExpenseEditDefaults(item: ProjectExpenseView): ExpenseEditFormValues {
  return {
    concept: item.concept,
    amountMinor: item.amountMinor,
    incurredAt: item.incurredAt,
  }
}
