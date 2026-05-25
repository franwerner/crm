import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type OnChangeFn,
} from '@tanstack/react-table'
import { Button } from '@shared/ui/button'
import { cn } from '@shared/lib/cn'

type Props<TData> = {
  columns: ColumnDef<TData>[]
  data: TData[]
  loading?: boolean
  emptyState?: React.ReactNode
  toolbar?: React.ReactNode
  bulkbar?: React.ReactNode
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  enableRowSelection?: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  getRowId?: (row: TData) => string
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  enableSorting?: boolean
}

const SKELETON_ROWS = 8

function getPageItems(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const items: (number | 'ellipsis')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) items.push('ellipsis')
  for (let p = start; p <= end; p++) items.push(p)
  if (end < total - 1) items.push('ellipsis')
  items.push(total)
  return items
}

export function DataTable<TData>({
  columns,
  data,
  loading = false,
  emptyState,
  toolbar,
  bulkbar,
  page,
  pageSize,
  total,
  onPageChange,
  enableRowSelection = false,
  rowSelection = {},
  onRowSelectionChange,
  getRowId,
  sorting = [],
  onSortingChange,
  enableSorting = false,
}: Props<TData>) {
  const pageCount = Math.ceil(total / pageSize)

  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize,
  }

  const hasSelection = Object.values(rowSelection).some(Boolean)

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { pagination, rowSelection, sorting },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(pagination) : updater
      onPageChange(next.pageIndex + 1)
    },
    onRowSelectionChange,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableRowSelection,
    enableSorting,
    getRowId,
  })

  const isEmpty = !loading && data.length === 0

  return (
    <div
      className="overflow-hidden rounded-[var(--ds-radius-lg)] border-[1.5px] border-[var(--ds-color-border-brand)] bg-card shadow-brutal-md"
    >
      {hasSelection && bulkbar ? (
        <div className="border-b border-[var(--ds-color-primary-200)] bg-[var(--ds-color-primary-50)] px-4 py-2 text-[length:var(--ds-font-size-sm)]">
          {bulkbar}
        </div>
      ) : toolbar ? (
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          {toolbar}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[length:var(--ds-font-size-sm)]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort()
                  const sortDir = header.column.getIsSorted()
                  const ariaSort = sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : undefined

                  return (
                    <th
                      key={header.id}
                      aria-sort={ariaSort}
                      className={cn(
                        'px-4 py-3 text-left text-[length:var(--ds-font-size-xs)] uppercase tracking-[var(--ds-tracking-wide)]',
                        'bg-muted border-b border-border whitespace-nowrap sticky top-0 z-[var(--ds-z-sticky)]',
                        sortDir
                          ? 'text-foreground font-[var(--ds-font-weight-semibold)]'
                          : 'text-muted-foreground font-[var(--ds-font-weight-medium)]',
                      )}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder ? null : isSortable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 cursor-pointer select-none hover:text-foreground transition-colors"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span aria-hidden="true" className="text-[length:var(--ds-font-size-xs)]">
                            {sortDir === 'asc' ? '↑' : sortDir === 'desc' ? '↓' : '↕'}
                          </span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: SKELETON_ROWS }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-border last:border-0">
                    {columns.map((_, colIdx) => (
                      <td key={colIdx} className="px-4 py-3">
                        <div className="h-4 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              : isEmpty
                ? null
                : table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      aria-selected={row.getIsSelected() ? true : undefined}
                      className={cn(
                        'border-b border-border last:border-0 hover:bg-muted transition-colors',
                        row.getIsSelected() && 'bg-[var(--ds-color-primary-50)] hover:bg-[var(--ds-color-primary-100)]',
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-3 align-middle"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>

      {isEmpty && emptyState && (
        <div className="flex items-center justify-center px-4 py-12 text-sm text-muted-foreground">
          {emptyState}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <span>
          {total === 0
            ? 'No hay resultados'
            : `${Math.min((page - 1) * pageSize + 1, total)}–${Math.min(page * pageSize, total)} de ${total}`}
          {pageCount > 1 ? ` · página ${page} de ${pageCount}` : ''}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 px-0"
            onClick={() => onPageChange(page - 1)}
            disabled={!table.getCanPreviousPage() || loading}
            aria-label="Página anterior"
          >
            ‹
          </Button>
          {pageCount > 1 &&
            getPageItems(page, pageCount).map((item, idx) =>
              item === 'ellipsis' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-muted-foreground select-none"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  variant={item === page ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8 px-0"
                  onClick={() => onPageChange(item)}
                  disabled={loading}
                  aria-label={`Página ${item}`}
                  aria-current={item === page ? 'page' : undefined}
                >
                  {item}
                </Button>
              ),
            )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 px-0"
            onClick={() => onPageChange(page + 1)}
            disabled={!table.getCanNextPage() || loading}
            aria-label="Página siguiente"
          >
            ›
          </Button>
        </div>
      </div>
    </div>
  )
}
