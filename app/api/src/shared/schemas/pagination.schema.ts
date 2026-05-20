import { z } from '@hono/zod-openapi'

export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100
export const DEFAULT_OFFSET = 0

export const PaginationQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(MAX_LIMIT)
      .default(DEFAULT_LIMIT)
      .openapi({ description: 'Number of items to return', example: 20 }),
    offset: z.coerce
      .number()
      .int()
      .min(0)
      .default(DEFAULT_OFFSET)
      .openapi({ description: 'Number of items to skip', example: 0 }),
  })
  .openapi('PaginationQuery')

export function paginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z
    .object({
      items: z.array(itemSchema).openapi({ description: 'List of items' }),
      total: z.number().int().openapi({ description: 'Total number of items', example: 0 }),
      limit: z.number().int().openapi({ description: 'Page size', example: 20 }),
      offset: z.number().int().openapi({ description: 'Page offset', example: 0 }),
    })
}
