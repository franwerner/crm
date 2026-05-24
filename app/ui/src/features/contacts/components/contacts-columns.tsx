import type { ColumnDef, Table, Row } from '@tanstack/react-table'
import { Badge } from '@shared/ui/badge'
import { Checkbox } from '@shared/ui/checkbox'
import type { BadgeProps } from '@shared/ui/badge'
import type { ContactPipelineState, ContactInterestLevel, ContactSourceChannel } from '@features/contacts/contacts.types'

export type ContactRow = {
  id: string
  name: string
  phone: string | null
  pipelineState: ContactPipelineState
  sourceChannel: ContactSourceChannel | null
  interestLevel: ContactInterestLevel | null
  createdAt: string
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso))
}

const pipelineStateBadge: Record<ContactPipelineState, BadgeProps['variant']> = {
  Contact: 'neutral',
  Lead: 'info',
  Customer: 'success',
  Discarded: 'danger',
}

const interestLevelBadge: Record<ContactInterestLevel, BadgeProps['variant']> = {
  Cold: 'neutral',
  Warm: 'warning',
  Hot: 'danger',
}

const selectColumn: ColumnDef<ContactRow> = {
  id: 'select',
  size: 32,
  enableSorting: false,
  header: ({ table }: { table: Table<ContactRow> }) => (
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
  cell: ({ row }: { row: Row<ContactRow> }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(checked) => row.toggleSelected(!!checked)}
      aria-label="Seleccionar fila"
    />
  ),
}

export const contactColumns: ColumnDef<ContactRow>[] = [
  selectColumn,
  {
    accessorKey: 'name',
    enableSorting: true,
    header: 'Nombre',
    cell: ({ getValue }) => (
      <span className="font-medium text-foreground">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'phone',
    enableSorting: true,
    header: 'Teléfono',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue<string | null>() ?? '—'}</span>
    ),
  },
  {
    accessorKey: 'pipelineState',
    enableSorting: true,
    header: 'Estado',
    cell: ({ getValue }) => {
      const val = getValue<ContactPipelineState>()
      return <Badge variant={pipelineStateBadge[val]}>{val}</Badge>
    },
  },
  {
    accessorKey: 'sourceChannel',
    enableSorting: true,
    header: 'Canal',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue<string | null>() ?? '—'}</span>
    ),
  },
  {
    accessorKey: 'interestLevel',
    enableSorting: true,
    header: 'Interés',
    cell: ({ getValue }) => {
      const val = getValue<ContactInterestLevel | null>()
      if (!val) return <span className="text-muted-foreground">—</span>
      return <Badge variant={interestLevelBadge[val]}>{val}</Badge>
    },
  },
  {
    accessorKey: 'createdAt',
    enableSorting: true,
    header: 'Creado',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{formatDate(getValue<string>())}</span>
    ),
  },
]
