import { z } from '@hono/zod-openapi'

export const BulkDeleteProjectsBodySchema = z
  .object({
    ids: z
      .array(z.string().min(1))
      .min(1)
      .max(500)
      .openapi({
        description: 'IDs of projects to soft-delete (1 to 500).',
        example: ['p1a2b3', 'q4e5f6'],
      }),
  })
  .openapi('BulkDeleteProjectsBody')

export type BulkDeleteProjectsRequest = z.infer<typeof BulkDeleteProjectsBodySchema>
