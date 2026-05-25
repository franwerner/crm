import { z } from '@hono/zod-openapi'
import type { AnyColumn } from 'drizzle-orm'
import { PaginationZ } from '@shared/http/list-query'
import { type Filter, type FilterGroup, type FilterOp, type ListQuery, MAX_CONDITIONS_PER_GROUP, MAX_OR_GROUPS } from '@shared/types/filters'
import type { Sort, SortDir } from '@shared/types/sort'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@shared/schemas/pagination.schema'
import { enumValuesOf, opsForColumn, type ColumnMap } from '@shared/db/drizzle-filters'
import { ValidationError } from '@shared/errors'

const SORT_DIR_VALUES = ['asc', 'desc'] as const

function parseSortParam(raw: string | undefined, sortableFields: readonly string[]): Sort | undefined {
  if (!raw) return undefined

  const colonIdx = raw.indexOf(':')
  if (colonIdx === -1) {
    throw new ValidationError('Invalid sort format', [
      { field: 'sort', message: 'expected format: field:asc or field:desc' },
    ])
  }

  const field = raw.slice(0, colonIdx)
  const dir = raw.slice(colonIdx + 1)

  if (!sortableFields.includes(field)) {
    throw new ValidationError(`Field '${field}' is not sortable`, [
      { field: 'sort', message: `sortable fields: ${sortableFields.join(', ')}` },
    ])
  }

  if (dir !== 'asc' && dir !== 'desc') {
    throw new ValidationError(`Invalid sort direction '${dir}'`, [
      { field: 'sort', message: `must be one of: ${SORT_DIR_VALUES.join(', ')}` },
    ])
  }

  return { field, dir: dir as SortDir }
}

function valueSchemaFor(col: AnyColumn): z.ZodTypeAny {
  const enums = enumValuesOf(col)
  if (enums) {
    const enumZ = z.enum(enums as [string, ...string[]])
    return z.union([enumZ, z.array(enumZ)])
  }
  return z.union([z.string(), z.array(z.string())])
}

function buildGroup(raw: Record<string, Record<string, unknown> | undefined>): FilterGroup {
  const filters: Filter[] = []
  for (const [field, ops] of Object.entries(raw)) {
    if (field === 'or' || !ops) continue
    for (const [op, value] of Object.entries(ops)) {
      filters.push({ field, op: op as FilterOp, value: value as Filter['value'] })
    }
  }
  if (filters.length > MAX_CONDITIONS_PER_GROUP) {
    throw new ValidationError(`Filter group exceeds maximum of ${MAX_CONDITIONS_PER_GROUP} conditions`, [
      { field: 'filter', message: `max ${MAX_CONDITIONS_PER_GROUP} conditions per group` },
    ])
  }
  return filters
}

export function buildListRawSchema(columnMap: ColumnMap) {
  const fieldShapes: Record<string, z.ZodTypeAny> = {}
  for (const [field, col] of Object.entries(columnMap)) {
    const ops = opsForColumn(col)
    const opsEnum = z.enum(ops as [FilterOp, ...FilterOp[]])
    const valueZ = valueSchemaFor(col)
    fieldShapes[field] = z.partialRecord(opsEnum, valueZ).optional()
  }

  const FilterGroupObjectSchema = z.strictObject(fieldShapes).openapi('FilterGroupObject')

  const FilterShape = z.strictObject({
    ...fieldShapes,
    or: z.array(FilterGroupObjectSchema).max(MAX_OR_GROUPS).optional(),
  })

  return z.object({
    filter: FilterShape.optional(),
    search: z.string().min(1).optional(),
    pagination: PaginationZ.optional(),
    sort: z.string().optional(),
  })
}

type ListRawValue = {
  filter?: Record<string, unknown>
  search?: string
  pagination?: { limit: number; offset: number }
  sort?: string
}

export function toListQuery(raw: ListRawValue, sortableFields: readonly string[]): ListQuery {
  const filterGroups: FilterGroup[] = []

  if (raw.filter) {
    const rawFilter = raw.filter as Record<string, Record<string, unknown> | undefined>
    const bareGroup = buildGroup(rawFilter)
    if (bareGroup.length > 0) filterGroups.push(bareGroup)

    const orRaw = (raw.filter as Record<string, unknown>)['or']
    if (Array.isArray(orRaw)) {
      for (const groupRaw of orRaw) {
        const group = buildGroup(groupRaw as Record<string, Record<string, unknown> | undefined>)
        if (group.length > 0) filterGroups.push(group)
      }
    }
  }

  if (filterGroups.length > MAX_OR_GROUPS) {
    throw new ValidationError(`Filter exceeds maximum of ${MAX_OR_GROUPS} OR groups`, [
      { field: 'filter[or]', message: `max ${MAX_OR_GROUPS} groups` },
    ])
  }

  return {
    filterGroups,
    search: raw.search,
    pagination: raw.pagination ?? { limit: DEFAULT_LIMIT, offset: DEFAULT_OFFSET },
    sort: parseSortParam(raw.sort, sortableFields),
  }
}

export function buildListQuerySchema(columnMap: ColumnMap, _searchCols?: AnyColumn[], sortableFields: readonly string[] = []) {
  return buildListRawSchema(columnMap).transform((raw): ListQuery => toListQuery(raw, sortableFields))
}
