import { z } from '@hono/zod-openapi'

export const ProjectExpenseViewSchema = z
  .object({
    id: z.string().openapi({ description: 'Expense UUID' }),
    projectId: z.string().openapi({ description: 'Project UUID' }),
    concept: z.string().openapi({ example: 'Contractor invoice' }),
    amountMinor: z.number().openapi({ description: 'Amount in minor currency units', example: 80000 }),
    incurredAt: z.string().openapi({ description: 'Date expense was incurred (YYYY-MM-DD)', example: '2025-03-15' }),
    createdAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
    updatedAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
  })
  .openapi('ProjectExpenseView')

export type ProjectExpenseView = z.infer<typeof ProjectExpenseViewSchema>
