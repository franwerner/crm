import type { ColumnDef } from '@tanstack/react-table'
import type { EntityDescriptor, AnyFieldDescriptor } from './types'

function fieldToColumn<T>(field: AnyFieldDescriptor<T>): ColumnDef<T> {
  return {
    accessorKey: field.key as string,
    header: field.label,
    enableSorting: !!field.sortable,
    cell: field.render
      ? ({ getValue, row }) => (field.render as NonNullable<typeof field.render>)(getValue() as T[typeof field.key], row.original)
      : undefined,
  }
}

export function toColumns<T>(descriptor: EntityDescriptor<T>): ColumnDef<T>[] {
  return descriptor.fields
    .filter((f) => !f.hidden)
    .map((f) => fieldToColumn(f))
}
