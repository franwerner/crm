import { useState } from 'react'
import { toast } from 'sonner'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useContacts } from '@features/contacts/hooks/use-contacts'
import { useCreateContact, useBulkDeleteContacts, useBulkChangeState } from '@features/contacts/hooks/use-contact-mutations'
import { contactColumns } from '@features/contacts/components/contacts-columns'
import { ContactsToolbar } from '@features/contacts/components/contacts-toolbar'
import { ContactsBulkbar } from '@features/contacts/components/contacts-bulkbar'
import { DataTable } from '@shared/ui/data-table'
import type { FilterGroups } from '@shared/lib/filter'
import type { RowSelectionState, SortingState, OnChangeFn } from '@tanstack/react-table'
import type { ContactPipelineState, CreateContactFormValues } from '@features/contacts/contacts.types'

export function ContactsPage() {
  const { page, search, filterGroups, sortField, sortDir } = useSearch({ from: '/_authenticated/contacts' })
  const navigate = useNavigate({ from: '/contacts' })

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const sorting: SortingState = [{ id: sortField, desc: sortDir === 'desc' }]

  const { rows, total, pageSize, isLoading } = useContacts({ page, search, filterGroups, sortField, sortDir })

  const { createContact, isPending: isCreating, errorMessage: createError } = useCreateContact()
  const { bulkDelete, isPending: isDeleting } = useBulkDeleteContacts()
  const { bulkChangeState, isPending: isChangingState } = useBulkChangeState()

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

  async function handleBulkChangeState(state: ContactPipelineState) {
    try {
      await bulkChangeState(selectedIds, state)
    } catch {
      toast.error('Error al cambiar el estado de los contactos')
    } finally {
      setRowSelection({})
    }
  }

  const toolbar = (
    <ContactsToolbar
      search={search ?? ''}
      onSearchChange={handleSearchChange}
      committedGroups={filterGroups ?? []}
      onApplyFilters={handleApplyFilters}
      onCreateContact={handleCreateContact}
      isCreating={isCreating}
      createError={createError}
    />
  )

  const bulkbar = (
    <ContactsBulkbar
      count={selectedIds.length}
      onDelete={handleBulkDelete}
      onChangeState={handleBulkChangeState}
      isDeleting={isDeleting}
      isChangingState={isChangingState}
    />
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Contactos</h1>
      </div>

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
      />
    </div>
  )
}
