import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useContacts } from '@features/contacts/hooks/use-contacts'
import { useContactKpis } from '@features/contacts/hooks/use-contact-kpis'
import { useCreateContact, useBulkDeleteContacts } from '@features/contacts/hooks/use-contact-mutations'
import { contactBaseColumns, makeContactActionsColumn } from '@features/contacts/components/contacts-columns'
import { ContactsKpiBar } from '@features/contacts/components/contacts-kpi-bar'
import { ContactsToolbar } from '@features/contacts/components/contacts-toolbar'
import { ContactsBulkbar } from '@features/contacts/components/contacts-bulkbar'
import { DataTable } from '@shared/ui/data-table'
import { DeleteDialog } from '@shared/ui/delete-dialog'
import { toSearchPresentation } from '@shared/lib/data-view'
import { contactsDescriptor } from '@features/contacts/components/contacts.descriptor'
import type { FilterGroups } from '@shared/lib/utils/filter'
import type { RowOf } from '@shared/lib/data-view'
import type { RowSelectionState, SortingState, OnChangeFn } from '@tanstack/react-table'
import type { CreateContactFormValues } from '@features/contacts/types/contacts.types'

const { placeholder: searchPlaceholder } = toSearchPresentation(contactsDescriptor)

type ContactRow = RowOf<typeof contactsDescriptor>

export function ContactsPage() {
  const { page, search, filterGroups, sortField, sortDir } = useSearch({ from: '/_authenticated/contacts' })
  const navigate = useNavigate({ from: '/contacts' })

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const goToDetail = (id: string) => navigate({ to: '/contacts/$id', params: { id } })

  const contactColumns = useMemo(
    () => [
      ...contactBaseColumns,
      makeContactActionsColumn({
        onViewDetail: goToDetail,
        onDelete: (id) => setDeleteTargetId(id),
      }),
    ],
    [navigate],
  )

  const sorting: SortingState = [{ id: sortField, desc: sortDir === 'desc' }]

  const { rows, total, pageSize, isLoading } = useContacts({ page, search, filterGroups, sortField, sortDir })
  const { total: kpisTotal, kpis, isLoading: isLoadingKpis } = useContactKpis()

  const { createContact, isPending: isCreating, errorMessage: createError } = useCreateContact()
  const { bulkDelete, isPending: isDeleting } = useBulkDeleteContacts()

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  function handlePageChange(next: number) {
    navigate({ search: (prev) => ({ ...prev, page: next }) })
  }

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === 'function' ? updater(sorting) : updater
    const first = next[0]
    navigate({
      search: (prev) => ({
        ...prev,
        sortField: first ? (first.id as typeof sortField) : undefined,
        sortDir: first ? (first.desc ? 'desc' : 'asc') : undefined,
        page: 1,
      }),
    })
  }

  function handleSearchChange(value: string) {
    navigate({
      search: (prev) => ({
        ...prev,
        search: value || undefined,
        page: 1,
      }),
    })
  }

  function handleApplyFilters(groups: FilterGroups) {
    navigate({
      search: (prev) => ({
        ...prev,
        filterGroups: groups.length > 0 ? groups : undefined,
        page: 1,
      }),
    })
  }

  async function handleCreateContact(data: CreateContactFormValues) {
    await createContact(data)
  }

  async function handleBulkDelete() {
    try {
      await bulkDelete(selectedIds)
    } catch {
      toast.error('Error al eliminar los contactos')
    } finally {
      setRowSelection({})
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return
    try {
      await bulkDelete([deleteTargetId])
    } catch {
      toast.error('Error al eliminar el contacto')
    } finally {
      setDeleteTargetId(null)
    }
  }

  const toolbar = (
    <ContactsToolbar
      search={search ?? ''}
      onSearchChange={handleSearchChange}
      searchPlaceholder={searchPlaceholder}
      committedGroups={filterGroups ?? []}
      onApplyFilters={handleApplyFilters}
      onCreateContact={handleCreateContact}
      isCreating={isCreating}
      createError={createError}
      filteredTotal={total}
    />
  )

  const bulkbar = (
    <ContactsBulkbar
      count={selectedIds.length}
      onDelete={handleBulkDelete}
      isDeleting={isDeleting}
    />
  )

  return (
    <div className="flex flex-col gap-8">
      <ContactsKpiBar total={kpisTotal} kpis={kpis} isLoading={isLoadingKpis} />

      <DataTable
        columns={contactColumns}
        data={rows}
        loading={isLoading}
        toolbar={toolbar}
        bulkbar={bulkbar}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        emptyState="No se encontraron contactos."
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        getRowId={(row) => row.id}
        enableSorting
        sorting={sorting}
        onSortingChange={handleSortingChange}
        onRowClick={(row: ContactRow) => goToDetail(row.id)}
      />

      <DeleteDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null)
        }}
        title="Eliminar contacto"
        content="¿Eliminar este contacto? Esta acción no se puede deshacer."
        onDeleted={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
