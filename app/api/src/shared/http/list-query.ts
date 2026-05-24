import { z } from '@hono/zod-openapi'
import { qsQuery } from '@shared/http/qs-query'
import { FILTER_OPS, type Filter, type FilterOp, type ListQuery } from '@shared/types/filters'
import { DEFAULT_LIMIT, DEFAULT_OFFSET, MAX_LIMIT } from '@shared/schemas/pagination.schema'

const FilterOpEnum = z.enum(FILTER_OPS)

const FilterValueZ = z.union([z.string(), z.array(z.string()), z.null()])

const FilterBlockZ = z.record(z.string(), z.partialRecord(FilterOpEnum, FilterValueZ))

export const PaginationZ = z
  .object({
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
    offset: z.coerce.number().int().min(0).default(DEFAULT_OFFSET),
  })
  .openapi('Pagination')

const RawListSchema = z.object({
  filter: FilterBlockZ.optional(),
  search: z.string().min(1).optional(),
  pagination: PaginationZ.optional(),
})

export const ListQuerySchema = qsQuery(
  RawListSchema.transform((raw): ListQuery => {
    const filters: Filter[] = []
    if (raw.filter) {
      for (const [field, ops] of Object.entries(raw.filter)) {
        for (const [op, value] of Object.entries(ops)) {
          filters.push({ field, op: op as FilterOp, value: value as Filter['value'] })
        }
      }
    }
    return {
      filters,
      search: raw.search,
      pagination: raw.pagination ?? { limit: DEFAULT_LIMIT, offset: DEFAULT_OFFSET },
    }
  }),
)

export type ListQueryInput = z.infer<typeof ListQuerySchema>

const RawPaginationOnlySchema = z.object({
  pagination: PaginationZ.optional(),
})

export const PaginationOnlyQuerySchema = qsQuery(
  RawPaginationOnlySchema.transform((raw) => ({
    pagination: raw.pagination ?? { limit: DEFAULT_LIMIT, offset: DEFAULT_OFFSET },
  })),
)

export type PaginationOnlyQuery = z.infer<typeof PaginationOnlyQuerySchema>
