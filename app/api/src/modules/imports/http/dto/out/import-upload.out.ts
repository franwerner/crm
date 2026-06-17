import { z } from '@hono/zod-openapi'

export const ImportUploadResponseSchema = z
  .object({
    importId: z.string().uuid().openapi({ description: 'UUID of the created import record', example: '01938b0c-0000-7000-0000-000000000001' }),
    status: z.string().openapi({ description: 'Import status after upload (awaiting_mapping)', example: 'awaiting_mapping' }),
    columnHeaders: z
      .array(z.string())
      .openapi({ description: 'Column headers detected from the first row of the uploaded file', example: ['Full Name', 'Email', 'Phone'] }),
  })
  .openapi('ImportUploadResponse')

export type ImportUploadResponse = z.infer<typeof ImportUploadResponseSchema>
