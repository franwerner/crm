import { z } from '@hono/zod-openapi'

export const BulkDeleteContactsBodySchema = z
  .object({
    ids: z
      .array(z.string().min(1))
      .min(1)
      .max(500)
      .openapi({
        description: 'IDs of contacts to soft-delete (1 to 500).',
        example: ['c1a2b3', 'd4e5f6'],
      }),
  })
  .openapi('BulkDeleteContactsBody')

export type BulkDeleteContactsRequest = z.infer<typeof BulkDeleteContactsBodySchema>
