import { z } from '@hono/zod-openapi'

export const ImportSetMappingResponseSchema = z
  .object({
    importId: z.string().uuid().openapi({ description: 'UUID of the import record', example: '01938b0c-0000-7000-0000-000000000001' }),
    status: z.string().openapi({ description: 'Import status after mapping (pending)', example: 'pending' }),
  })
  .openapi('ImportSetMappingResponse')

export type ImportSetMappingResponse = z.infer<typeof ImportSetMappingResponseSchema>
