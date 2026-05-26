import type React from 'react'
import type { RelationResolver } from '@shared/lib/utils/filter'
import type { Option } from '@shared/lib/types/option'

export type FieldDescriptor<T, K extends keyof T = keyof T> = {
  key: K
  label: string
  sortable?: boolean
  filterable?: boolean
  filterType?: 'text' | 'enum' | 'date' | 'boolean' | 'relation'
  options?: ReadonlyArray<Option>
  relation?: RelationResolver
  searchable?: boolean
  hidden?: boolean
  render?: (value: T[K], row: T) => React.ReactNode
}

export type AnyFieldDescriptor<T> = { [K in keyof T]: FieldDescriptor<T, K> }[keyof T]

export type EntityDescriptor<T> = {
  name: string
  fields: ReadonlyArray<AnyFieldDescriptor<T>>
  defaultSort?: { field: Extract<keyof T, string>; dir: 'asc' | 'desc' }
  selectable?: boolean
}

export type RowOf<D> = D extends EntityDescriptor<infer T> ? T : never
