import type { ColumnDef, Table, Row } from '@tanstack/react-table'
import { Checkbox } from '@shared/ui/checkbox'

export function makeSelectColumn<T>(): ColumnDef<T> {
  return {
    id: 'select',
    size: 32,
    enableSorting: false,
    header: ({ table }: { table: Table<T> }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? 'indeterminate'
              : false
        }
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
        aria-label="Seleccionar todo"
      />
    ),
    cell: ({ row }: { row: Row<T> }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        aria-label="Seleccionar fila"
      />
    ),
  }
}
