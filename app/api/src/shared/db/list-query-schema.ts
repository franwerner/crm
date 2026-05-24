import { z } from '@hono/zod-openapi'
import type { AnyColumn } from 'drizzle-orm'
import { PaginationZ } from '@shared/http/list-query'
import { type Filter, type FilterOp, type ListQuery } from '@shared/types/filters'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@shared/schemas/pagination.schema'
import { enumValuesOf, opsForColumn, type ColumnMap } from '@shared/db/drizzle-filters'

function valueSchemaFor(col: AnyColumn): z.ZodTypeAny {
  const enums = enumValuesOf(col)
  if (enums) {
    const enumZ = z.enum(enums as [string, ...string[]])
    return z.union([enumZ, z.array(enumZ)])
  }
  return z.union([z.string(), z.array(z.string())])
}

export function buildListQuerySchema(columnMap: ColumnMap, _searchCols?: AnyColumn[]) {
  const fieldShapes: Record<string, z.ZodTypeAny> = {}
  for (const [field, col] of Object.entries(columnMap)) {
    const ops = opsForColumn(col)
    const opsEnum = z.enum(ops as [FilterOp, ...FilterOp[]])
    const valueZ = valueSchemaFor(col)
    fieldShapes[field] = z.partialRecord(opsEnum, valueZ).optional()
  }

  const FilterShape = z.strictObject(fieldShapes)

  const RawSchema = z.object({
    filter: FilterShape.optional(),
    search: z.string().min(1).optional(),
    pagination: PaginationZ.optional(),
  })

  return RawSchema.transform((raw): ListQuery => {
    const filters: Filter[] = []
    if (raw.filter) {
      for (const [field, ops] of Object.entries(raw.filter as Record<string, Record<string, unknown> | undefined>)) {
        if (!ops) continue
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
  })
}
