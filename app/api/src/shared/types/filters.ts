import type { Sort } from '@shared/types/sort'

export { type Sort }

export const FILTER_OPS = [
  'eq',
  'ne',
  'in',
  'nin',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'ilike',
  'isNull',
  'isNotNull',
] as const

export type FilterOp = (typeof FILTER_OPS)[number]

export type FilterPrimitive = string | number | boolean | null

export type FilterValue = FilterPrimitive | FilterPrimitive[]

export interface Filter {
  field: string
  op: FilterOp
  value: FilterValue
}

export type FilterGroup = Filter[]

export const MAX_OR_GROUPS = 10
export const MAX_CONDITIONS_PER_GROUP = 25

export interface SearchTerm {
  term: string
  fields: string[]
}

export interface PageParams {
  limit: number
  offset: number
}

export interface ListQuery {
  filterGroups: FilterGroup[]
  search?: string
  pagination: PageParams
  sort?: Sort
}
