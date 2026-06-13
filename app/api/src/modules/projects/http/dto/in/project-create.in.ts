import { z } from '@hono/zod-openapi'

export const CreateProjectBodySchema = z
  .object({
    name: z.string().min(1).openapi({ description: 'Project name', example: 'Website Redesign' }),
    description: z.string().nullable().optional().openapi({ description: 'Project description', example: 'Full redesign of the corporate website' }),
    contactId: z.string().uuid().openapi({ description: 'UUID of the associated contact', example: '01938b0c-...' }),
    currency: z.string().length(3).regex(/^[A-Za-z]{3}$/, 'expected 3-letter ISO 4217 code').toUpperCase().openapi({ description: 'ISO 4217 currency code', example: 'USD' }),
    startDate: z.string().date().openapi({ description: 'Project start date (YYYY-MM-DD)', example: '2025-01-01' }),
    plannedEndDate: z.string().date().openapi({ description: 'Project planned end date (YYYY-MM-DD)', example: '2025-12-31' }),
  })
  .refine(
    (data) => data.plannedEndDate >= data.startDate,
    {
      message: 'plannedEndDate must be on or after startDate',
      path: ['plannedEndDate'],
    },
  )
  .openapi('CreateProjectBody')

export type CreateProjectRequest = z.infer<typeof CreateProjectBodySchema>
