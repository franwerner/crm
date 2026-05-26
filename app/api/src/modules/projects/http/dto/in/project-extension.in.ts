import { z } from '@hono/zod-openapi'

export const AddExtensionBodySchema = z
  .object({
    additionalDays: z.number().int().positive().openapi({ description: 'Number of additional days to extend the project', example: 14 }),
    reason: z.string().min(1).openapi({ description: 'Reason for the extension', example: 'Client requested scope change' }),
    cost: z.number().int().nonnegative().nullable().optional().openapi({ description: 'Extension cost in minor currency units', example: 50000 }),
    billedAmount: z.number().int().nonnegative().nullable().optional().openapi({ description: 'Amount billed for this extension in minor currency units', example: 75000 }),
    grantedAt: z.string().date().openapi({ description: 'Date the extension was granted (YYYY-MM-DD)', example: '2025-06-01' }),
  })
  .openapi('AddExtensionBody')

export type AddExtensionRequest = z.infer<typeof AddExtensionBodySchema>

export const UpdateExtensionBodySchema = z
  .object({
    additionalDays: z.number().int().positive().optional().openapi({ description: 'Number of additional days', example: 14 }),
    reason: z.string().min(1).optional().openapi({ description: 'Reason for the extension', example: 'Client requested scope change' }),
    cost: z.number().int().nonnegative().nullable().optional().openapi({ description: 'Extension cost in minor currency units', example: 50000 }),
    billedAmount: z.number().int().nonnegative().nullable().optional().openapi({ description: 'Amount billed in minor currency units', example: 75000 }),
    grantedAt: z.string().date().optional().openapi({ description: 'Date the extension was granted (YYYY-MM-DD)', example: '2025-06-01' }),
  })
  .openapi('UpdateExtensionBody')

export type UpdateExtensionRequest = z.infer<typeof UpdateExtensionBodySchema>
