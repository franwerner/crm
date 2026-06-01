import { z } from 'zod/v4'
import type { FormDescriptor } from '@shared/lib/form-view/types'
import { addBudgetItemBodySchema } from '@shared/api/schemas/addBudgetItemBodySchema'

export const budgetItemCreateFormSchema = addBudgetItemBodySchema

export type BudgetItemCreateFormValues = z.infer<typeof budgetItemCreateFormSchema>

export const budgetItemCreateDefaultValues: BudgetItemCreateFormValues = {
  concept: '',
  amountMinor: 0,
}

export const budgetItemCreateForm: FormDescriptor<BudgetItemCreateFormValues> = {
  name: 'budget-item-create',
  fields: [
    { key: 'concept', label: 'Concepto', widget: 'text', required: true, placeholder: 'Descripción del ítem' },
    { key: 'amountMinor', label: 'Monto (centavos)', widget: 'number', required: true, placeholder: '0' },
  ],
}
