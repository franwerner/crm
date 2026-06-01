import { z } from 'zod/v4'
import type { FormDescriptor } from '@shared/lib/form-view/types'
import type { ProjectBudgetItemView } from '@shared/api/types/ProjectBudgetItemView'
import { addBudgetItemBodySchema } from '@shared/api/schemas/addBudgetItemBodySchema'

export const budgetItemEditFormSchema = addBudgetItemBodySchema

export type BudgetItemEditFormValues = z.infer<typeof budgetItemEditFormSchema>

export const budgetItemEditForm: FormDescriptor<BudgetItemEditFormValues> = {
  name: 'budget-item-edit',
  fields: [
    { key: 'concept', label: 'Concepto', widget: 'text', required: true, placeholder: 'Descripción del ítem' },
    { key: 'amountMinor', label: 'Monto (centavos)', widget: 'number', required: true, placeholder: '0' },
  ],
}

export function getBudgetItemEditDefaults(item: ProjectBudgetItemView): BudgetItemEditFormValues {
  return {
    concept: item.concept,
    amountMinor: item.amountMinor,
  }
}
