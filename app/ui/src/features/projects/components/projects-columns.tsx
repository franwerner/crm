import { MoreHorizontal } from 'lucide-react'
import { toColumns } from '@shared/lib/data-view'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@shared/ui/dropdown-menu'
import { Button } from '@shared/ui/button'
import { projectsDescriptor } from '@features/projects/components/projects.descriptor'
import type { RowOf } from '@shared/lib/data-view'
import type { ColumnDef } from '@tanstack/react-table'

type ProjectRow = RowOf<typeof projectsDescriptor>

type ActionsColumnHandlers = {
  onViewDetail: (id: string) => void
}

export function makeProjectActionsColumn({
  onViewDetail,
}: ActionsColumnHandlers): ColumnDef<ProjectRow> {
  return {
    id: 'actions',
    size: 40,
    enableSorting: false,
    header: () => null,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onViewDetail(row.original.id)}>
            Ver detalle
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }
}

export const projectBaseColumns = toColumns(projectsDescriptor)
