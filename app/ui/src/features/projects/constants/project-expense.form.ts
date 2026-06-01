import { z } from 'zod/v4'
import type { FormDescriptor } from '@shared/lib/form-view/types'
import { addExpenseBodySchema } from '@shared/api/schemas/addExpenseBodySchema'

function toIsoDate(value: unknown): unknown {
  if (typeof value === 'string' && value.length > 10) return value.slice(0, 10)
  return value
}

export const expenseCreateFormSchema = addExpenseBodySchema.extend({
  incurredAt: z.preprocess(toIsoDate, z.iso.date()),
})

export type ExpenseCreateFormValues = z.infer<typeof expenseCreateFormSchema>

export const expenseCreateDefaultValues: ExpenseCreateFormValues = {
  concept: '',
  amountMinor: 0,
  incurredAt: '',
}

export const expenseCreateForm: FormDescriptor<ExpenseCreateFormValues> = {
  name: 'expense-create',
  fields: [
    { key: 'concept', label: 'Concepto', widget: 'text', required: true, placeholder: 'Descripción del gasto' },
    { key: 'amountMinor', label: 'Monto (centavos)', widget: 'number', required: true, placeholder: '0' },
    { key: 'incurredAt', label: 'Fecha del gasto', widget: 'date', required: true },
  ],
}
