import { z } from '@hono/zod-openapi'

export const UpdateProjectBodySchema = z
  .object({
    name: z.string().min(1).optional().openapi({ description: 'Project name', example: 'Website Redesign' }),
    description: z.string().nullable().optional().openapi({ description: 'Project description', example: 'Full redesign of the corporate website' }),
    contactId: z.string().uuid().optional().openapi({ description: 'UUID of the associated contact', example: '01938b0c-...' }),
    currency: z.string().length(3).toUpperCase().optional().openapi({ description: 'ISO 4217 currency code', example: 'USD' }),
    startDate: z.string().date().optional().openapi({ description: 'Project start date (YYYY-MM-DD)', example: '2025-01-01' }),
    plannedEndDate: z.string().date().optional().openapi({ description: 'Project planned end date (YYYY-MM-DD)', example: '2025-12-31' }),
  })
  .openapi('UpdateProjectBody')

export type UpdateProjectRequest = z.infer<typeof UpdateProjectBodySchema>
