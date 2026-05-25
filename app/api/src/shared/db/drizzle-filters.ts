import {
  and,
  between,
  eq,
  getTableColumns,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lt,
  lte,
  ne,
  notInArray,
  or,
  type AnyColumn,
  type SQL,
  type Table,
} from 'drizzle-orm'
import { ValidationError } from '@shared/errors'
import type { Filter, FilterGroup, FilterOp, FilterValue } from '@shared/types/filters'

export type ColumnMap = Record<string, AnyColumn>

type TableColumns<T extends Table> = ReturnType<typeof getTableColumns<T>>

export function tableColumnsExcept<T extends Table, K extends keyof TableColumns<T>>(
  table: T,
  exclude: readonly K[],
): Omit<TableColumns<T>, K> {
  const excluded = new Set<PropertyKey>(exclude)
  return Object.fromEntries(
    Object.entries(getTableColumns(table)).filter(([key]) => !excluded.has(key)),
  ) as Omit<TableColumns<T>, K>
}

type ScalarValue = string | number | boolean | Date | null

const TEXT_OPS: ReadonlyArray<FilterOp> = ['eq', 'ne', 'in', 'nin', 'ilike', 'isNull', 'isNotNull']
const NUMERIC_OPS: ReadonlyArray<FilterOp> = ['eq', 'ne', 'in', 'nin', 'gt', 'gte', 'lt', 'lte', 'between', 'isNull', 'isNotNull']
const DATE_OPS: ReadonlyArray<FilterOp> = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'between', 'isNull', 'isNotNull']
const BOOL_OPS: ReadonlyArray<FilterOp> = ['eq', 'ne', 'isNull', 'isNotNull']
const ENUM_OPS: ReadonlyArray<FilterOp> = ['eq', 'ne', 'in', 'nin', 'isNull', 'isNotNull']
const UUID_OPS: ReadonlyArray<FilterOp> = ['eq', 'ne', 'in', 'nin', 'isNull', 'isNotNull']

export function enumValuesOf(col: AnyColumn): readonly string[] | null {
  const ev = (col as unknown as { enumValues?: readonly string[] }).enumValues
  return ev && ev.length > 0 ? ev : null
}

export function opsForColumn(col: AnyColumn): ReadonlyArray<FilterOp> {
  if (enumValuesOf(col)) return ENUM_OPS
  switch (col.columnType) {
    case 'PgUUID':
      return UUID_OPS
    case 'PgText':
    case 'PgVarchar':
      return TEXT_OPS
    case 'PgTimestamp':
    case 'PgDate':
      return DATE_OPS
    case 'PgBoolean':
      return BOOL_OPS
    case 'PgInteger':
    case 'PgBigInt':
    case 'PgNumeric':
    case 'PgReal':
    case 'PgDoublePrecision':
    case 'PgSmallInt':
      return NUMERIC_OPS
    default:
      return TEXT_OPS
  }
}

function coerceScalar(raw: unknown, col: AnyColumn, fieldPath: string): ScalarValue {
  if (raw === null) return null

  const enums = enumValuesOf(col)
  if (enums) {
    if (typeof raw !== 'string' || !enums.includes(raw)) {
      throw new ValidationError(`Invalid value for field`, [
        { field: fieldPath, message: `must be one of: ${enums.join(', ')}` },
      ])
    }
    return raw
  }

  switch (col.columnType) {
    case 'PgUUID':
    case 'PgText':
    case 'PgVarchar': {
      if (typeof raw !== 'string') {
        throw new ValidationError('Expected string', [{ field: fieldPath, message: 'expected string' }])
      }
      return raw
    }
    case 'PgBoolean': {
      if (raw === true || raw === 'true') return true
      if (raw === false || raw === 'false') return false
      throw new ValidationError('Expected boolean', [{ field: fieldPath, message: 'expected true|false' }])
    }
    case 'PgInteger':
    case 'PgBigInt':
    case 'PgNumeric':
    case 'PgReal':
    case 'PgDoublePrecision':
    case 'PgSmallInt': {
      const n = typeof raw === 'number' ? raw : Number(raw)
      if (Number.isNaN(n)) {
        throw new ValidationError('Expected number', [{ field: fieldPath, message: 'expected numeric value' }])
      }
      return n
    }
    case 'PgTimestamp':
    case 'PgDate': {
      const d = raw instanceof Date ? raw : new Date(String(raw))
      if (Number.isNaN(d.getTime())) {
        throw new ValidationError('Expected ISO date', [{ field: fieldPath, message: 'expected ISO 8601 date' }])
      }
      return d
    }
    default:
      return String(raw)
  }
}

function coerceValue(raw: FilterValue, op: FilterOp, col: AnyColumn, fieldPath: string): ScalarValue | ScalarValue[] {
  if (op === 'isNull' || op === 'isNotNull') return null

  if (op === 'in' || op === 'nin') {
    const arr = Array.isArray(raw) ? raw : [raw]
    return arr.map((v) => coerceScalar(v, col, fieldPath))
  }

  if (op === 'between') {
    if (!Array.isArray(raw) || raw.length !== 2) {
      throw new ValidationError('between requires exactly two values', [
        { field: fieldPath, message: 'expected: a,b' },
      ])
    }
    return [coerceScalar(raw[0], col, fieldPath), coerceScalar(raw[1], col, fieldPath)]
  }

  const scalar = Array.isArray(raw) ? raw[0] : raw
  return coerceScalar(scalar, col, fieldPath)
}

function buildSQL(col: AnyColumn, op: FilterOp, value: ScalarValue | ScalarValue[]): SQL {
  switch (op) {
    case 'eq':
      return eq(col, value as ScalarValue)
    case 'ne':
      return ne(col, value as ScalarValue)
    case 'in':
      return inArray(col, value as ScalarValue[])
    case 'nin':
      return notInArray(col, value as ScalarValue[])
    case 'gt':
      return gt(col, value as ScalarValue)
    case 'gte':
      return gte(col, value as ScalarValue)
    case 'lt':
      return lt(col, value as ScalarValue)
    case 'lte':
      return lte(col, value as ScalarValue)
    case 'between': {
      const [a, b] = value as [ScalarValue, ScalarValue]
      return between(col, a, b)
    }
    case 'ilike':
      return ilike(col, `%${value as string}%`)
    case 'isNull':
      return isNull(col)
    case 'isNotNull':
      return isNotNull(col)
  }
}

export function applyFilterGroup(columnMap: ColumnMap, group: FilterGroup): SQL | undefined {
  const clauses: SQL[] = []
  for (const f of group) {
    const col = columnMap[f.field]
    const path = `filter[${f.field}][${f.op}]`
    if (!col) {
      throw new ValidationError(`Field '${f.field}' is not filterable`, [
        { field: `filter[${f.field}]`, message: 'unknown field' },
      ])
    }
    const allowed = opsForColumn(col)
    if (!allowed.includes(f.op)) {
      throw new ValidationError(`Operator '${f.op}' not supported for field '${f.field}'`, [
        { field: path, message: `allowed ops: ${allowed.join(', ')}` },
      ])
    }
    const value = coerceValue(f.value, f.op, col, path)
    clauses.push(buildSQL(col, f.op, value))
  }
  if (clauses.length === 0) return undefined
  if (clauses.length === 1) return clauses[0]
  return and(...clauses)
}

export function applyFilterGroups(columnMap: ColumnMap, groups: FilterGroup[]): SQL | undefined {
  const groupClauses = groups.map((g) => applyFilterGroup(columnMap, g)).filter((c): c is SQL => c !== undefined)
  if (groupClauses.length === 0) return undefined
  if (groupClauses.length === 1) return groupClauses[0]
  return or(...groupClauses)
}

export function applySearch(columns: AnyColumn[], term: string | undefined): SQL | undefined {
  if (!term || columns.length === 0) return undefined
  const pattern = `%${term}%`
  const exprs = columns.map((c) => ilike(c, pattern))
  return exprs.length === 1 ? exprs[0] : or(...exprs)
}

export function combineWhere(clauses: Array<SQL | undefined>): SQL | undefined {
  const filtered = clauses.filter((c): c is SQL => c !== undefined)
  if (filtered.length === 0) return undefined
  if (filtered.length === 1) return filtered[0]
  return and(...filtered)
}

export type { Filter, FilterGroup }
