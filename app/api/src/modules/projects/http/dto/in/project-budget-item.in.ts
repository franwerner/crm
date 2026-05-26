import { z } from '@hono/zod-openapi'

export const AddBudgetItemBodySchema = z
  .object({
    concept: z.string().min(1).openapi({ description: 'Budget item description', example: 'Design phase' }),
    amountMinor: z.number().int().nonnegative().openapi({ description: 'Amount in minor currency units (e.g. cents)', example: 150000 }),
  })
  .openapi('AddBudgetItemBody')

export type AddBudgetItemRequest = z.infer<typeof AddBudgetItemBodySchema>

export const UpdateBudgetItemBodySchema = z
  .object({
    concept: z.string().min(1).optional().openapi({ description: 'Budget item description', example: 'Design phase' }),
    amountMinor: z.number().int().nonnegative().optional().openapi({ description: 'Amount in minor currency units', example: 150000 }),
  })
  .openapi('UpdateBudgetItemBody')

export type UpdateBudgetItemRequest = z.infer<typeof UpdateBudgetItemBodySchema>
