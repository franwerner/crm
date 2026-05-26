import { z } from 'zod'
import type { Option } from '@shared/lib/types/option'

export type FieldType = 'text' | 'enum' | 'boolean' | 'date' | 'relation'

export type RelationOption = Option

export type RelationResolver = {
  search: (query: string) => Promise<RelationOption[]>
  resolve: (ids: string[]) => Promise<RelationOption[]>
}

export type Operator =
  | 'eq'
  | 'ne'
  | 'in'
  | 'nin'
  | 'ilike'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'isNull'
  | 'isNotNull'

export type Condition = {
  field: string
  op: Operator
  value?: string | string[]
}

export type FilterGroups = Condition[][]

export type FieldDescriptor = {
  key: string
  label: string
  type: FieldType
  ops?: Operator[]
  options?: Option[]
  relation?: RelationResolver
}

export type FilterSchema = FieldDescriptor[]

export const OPERATOR_LABELS: Record<Operator, string> = {
  eq: 'es',
  ne: 'no es',
  in: 'es uno de',
  nin: 'no es ninguno de',
  ilike: 'contiene',
  gt: 'mayor que',
  gte: 'mayor o igual',
  lt: 'menor que',
  lte: 'menor o igual',
  between: 'entre',
  isNull: 'está vacío',
  isNotNull: 'no está vacío',
}

const TYPE_OPS: Record<FieldType, Operator[]> = {
  text: ['eq', 'ne', 'in', 'nin', 'ilike', 'isNull', 'isNotNull'],
  enum: ['eq', 'ne', 'in', 'nin', 'isNull', 'isNotNull'],
  boolean: ['eq', 'ne', 'isNull', 'isNotNull'],
  date: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'between', 'isNull', 'isNotNull'],
  relation: ['eq', 'ne', 'in', 'nin', 'isNull', 'isNotNull'],
}

export function opsForField(descriptor: FieldDescriptor): Operator[] {
  return descriptor.ops ?? TYPE_OPS[descriptor.type] ?? []
}

export function defaultOpForField(descriptor: FieldDescriptor): Operator {
  const ops = opsForField(descriptor)
  return ops[0] as Operator
}

export function isArrayOp(op: Operator): boolean {
  return op === 'in' || op === 'nin'
}

export function isNullOp(op: Operator): boolean {
  return op === 'isNull' || op === 'isNotNull'
}

export function isRangeOp(op: Operator): boolean {
  return op === 'between'
}

export function isScalarTextOp(op: Operator): boolean {
  return op === 'eq' || op === 'ne' || op === 'ilike'
}

const NULL_PLACEHOLDER = '__null__'

type GroupObject = Record<string, Record<string, unknown>>

function conditionToEntry(
  cond: Condition,
): [string, Record<string, unknown>] | null {
  if (isNullOp(cond.op)) {
    return [cond.field, { [cond.op]: NULL_PLACEHOLDER }]
  }

  if (isRangeOp(cond.op)) {
    const vals = Array.isArray(cond.value) ? cond.value : []
    const [a, b] = vals
    if (!a || !b) return null
    return [cond.field, { [cond.op]: [a, b] }]
  }

  if (isArrayOp(cond.op)) {
    const vals = Array.isArray(cond.value) ? cond.value : []
    if (vals.length === 0) return null
    return [cond.field, { [cond.op]: vals }]
  }

  if (typeof cond.value !== 'string' || cond.value === '') return null
  return [cond.field, { [cond.op]: cond.value }]
}

function groupToObject(conditions: Condition[]): GroupObject {
  const obj: Record<string, Record<string, unknown>> = {}
  for (const cond of conditions) {
    const entry = conditionToEntry(cond)
    if (!entry) continue
    const [field, opMap] = entry
    if (obj[field]) {
      obj[field] = { ...(obj[field] as object), ...opMap }
    } else {
      obj[field] = opMap
    }
  }
  return obj
}

export function buildFilterParam(
  groups: FilterGroups | undefined,
): { or: GroupObject[] } | undefined {
  if (!groups || groups.length === 0) return undefined

  const mapped = groups
    .map((group) => groupToObject(group))
    .filter((g) => Object.keys(g).length > 0)

  if (mapped.length === 0) return undefined

  return { or: mapped }
}

const operatorSchema = z.enum([
  'eq',
  'ne',
  'in',
  'nin',
  'ilike',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'isNull',
  'isNotNull',
])

const conditionSchema = z.object({
  field: z.string(),
  op: operatorSchema,
  value: z.union([z.string(), z.array(z.string())]).optional(),
})

export const filterGroupsSchema = z.array(z.array(conditionSchema)).optional()
