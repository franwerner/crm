import { z } from '@hono/zod-openapi'

export const ProjectBudgetItemViewSchema = z
  .object({
    id: z.string().openapi({ description: 'Budget item UUID' }),
    projectId: z.string().openapi({ description: 'Project UUID' }),
    concept: z.string().openapi({ example: 'Design phase' }),
    amountMinor: z.number().openapi({ description: 'Amount in minor currency units', example: 150000 }),
    createdAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
    updatedAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
  })
  .openapi('ProjectBudgetItemView')

export type ProjectBudgetItemView = z.infer<typeof ProjectBudgetItemViewSchema>
