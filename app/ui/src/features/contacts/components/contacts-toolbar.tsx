import { useState } from 'react'
import { SlidersHorizontal, Plus } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { ContactsSearch } from './contacts-search'
import { ContactsFilterModal } from './contacts-filter-modal'
import { CreateContactModal } from './create-contact-modal'
import type { FilterGroups } from '@shared/lib/filter'
import type { CreateContactFormValues } from '@features/contacts/contacts.types'

type Props = {
  search: string
  onSearchChange: (value: string) => void
  committedGroups: FilterGroups
  onApplyFilters: (groups: FilterGroups) => void
  onCreateContact: (data: CreateContactFormValues) => Promise<void>
  isCreating: boolean
  createError: string | null
}

function countActiveConditions(groups: FilterGroups): number {
  return groups.reduce((sum, group) => sum + group.length, 0)
}

export function ContactsToolbar({
  search,
  onSearchChange,
  committedGroups,
  onApplyFilters,
  onCreateContact,
  isCreating,
  createError,
}: Props) {
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const activeCount = countActiveConditions(committedGroups)

  return (
    <>
      <div className="flex flex-1 items-center gap-2">
        <ContactsSearch value={search} onChange={onSearchChange} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterModalOpen(true)}
          className="shrink-0"
        >
          <SlidersHorizontal />
          Filtros
        </Button>
        {activeCount > 0 && (
          <Badge variant="primary">
            {activeCount} {activeCount === 1 ? 'filtro' : 'filtros'}
          </Badge>
        )}
      </div>

      <Button
        variant="default"
        size="sm"
        onClick={() => setCreateModalOpen(true)}
        className="shrink-0"
      >
        <Plus />
        Crear contacto
      </Button>

      <ContactsFilterModal
        open={filterModalOpen}
        onOpenChange={setFilterModalOpen}
        committedGroups={committedGroups}
        onApply={onApplyFilters}
      />

      <CreateContactModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={onCreateContact}
        isPending={isCreating}
        errorMessage={createError}
      />
    </>
  )
}
