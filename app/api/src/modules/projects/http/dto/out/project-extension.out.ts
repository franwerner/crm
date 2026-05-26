import { z } from '@hono/zod-openapi'

export const ProjectExtensionViewSchema = z
  .object({
    id: z.string().openapi({ description: 'Extension UUID' }),
    projectId: z.string().openapi({ description: 'Project UUID' }),
    additionalDays: z.number().openapi({ description: 'Number of additional days granted', example: 14 }),
    appliedEndDate: z.string().openapi({ description: 'Computed end date after this extension (YYYY-MM-DD)', example: '2025-07-15' }),
    reason: z.string().openapi({ example: 'Client requested scope change' }),
    cost: z.number().nullable().openapi({ description: 'Extension cost in minor currency units', example: 50000 }),
    billedAmount: z.number().nullable().openapi({ description: 'Amount billed in minor currency units', example: 75000 }),
    grantedAt: z.string().openapi({ description: 'Date the extension was granted (YYYY-MM-DD)', example: '2025-06-01' }),
    grantedBy: z.string().openapi({ description: 'User UUID who granted the extension' }),
    createdAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
    updatedAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
  })
  .openapi('ProjectExtensionView')

export type ProjectExtensionView = z.infer<typeof ProjectExtensionViewSchema>
