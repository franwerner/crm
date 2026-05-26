import { z } from '@hono/zod-openapi'

export const AddExpenseBodySchema = z
  .object({
    concept: z.string().min(1).openapi({ description: 'Expense description', example: 'Contractor invoice' }),
    amountMinor: z.number().int().nonnegative().openapi({ description: 'Amount in minor currency units (e.g. cents)', example: 80000 }),
    incurredAt: z.string().date().openapi({ description: 'Date expense was incurred (YYYY-MM-DD)', example: '2025-03-15' }),
  })
  .openapi('AddExpenseBody')

export type AddExpenseRequest = z.infer<typeof AddExpenseBodySchema>

export const UpdateExpenseBodySchema = z
  .object({
    concept: z.string().min(1).optional().openapi({ description: 'Expense description', example: 'Contractor invoice' }),
    amountMinor: z.number().int().nonnegative().optional().openapi({ description: 'Amount in minor currency units', example: 80000 }),
    incurredAt: z.string().date().optional().openapi({ description: 'Date expense was incurred (YYYY-MM-DD)', example: '2025-03-15' }),
  })
  .openapi('UpdateExpenseBody')

export type UpdateExpenseRequest = z.infer<typeof UpdateExpenseBodySchema>
