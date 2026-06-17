import { useState } from 'react'
import { SlidersHorizontal, Plus, X, BrainCircuit } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { InputSearch } from '@shared/ui/input-search'
import { ContactsFilterModal } from './contacts-filter-modal'
import { CreateContactModal } from './create-contact-modal'
import { ContactsBulkAnalyzeModal } from './contacts-bulk-analyze-modal'
import type { FilterGroups } from '@shared/lib/utils/filter'
import type { CreateContactFormValues } from '@features/contacts/types/contacts.types'

type Props = {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  committedGroups: FilterGroups
  onApplyFilters: (groups: FilterGroups) => void
  onCreateContact: (data: CreateContactFormValues) => Promise<void>
  isCreating: boolean
  createError: string | null
  /** Total contacts matching the active filter. Used for "Analizar N filtrados". */
  filteredTotal: number
}

function countActiveConditions(groups: FilterGroups): number {
  return groups.reduce((sum, group) => sum + group.length, 0)
}

export function ContactsToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  committedGroups,
  onApplyFilters,
  onCreateContact,
  isCreating,
  createError,
  filteredTotal,
}: Props) {
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [bulkAnalyzeOpen, setBulkAnalyzeOpen] = useState(false)

  const activeCount = countActiveConditions(committedGroups)

  // Show "Analizar N filtrados" when there is at least one active filter or search term
  // and there are contacts to enrich.
  const showBulkAnalyze = (activeCount > 0 || search.length > 0) && filteredTotal > 0

  return (
    <>
      <div className="flex flex-1 items-center gap-2">
        <InputSearch value={search} onChange={onSearchChange} placeholder={searchPlaceholder} />
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
            <button
              type="button"
              aria-label="Limpiar filtros"
              onClick={() => onApplyFilters([])}
              className="inline-flex cursor-pointer items-center opacity-70 transition-opacity hover:opacity-100"
            >
              <X className="size-3" />
            </button>
          </Badge>
        )}
      </div>

      {showBulkAnalyze && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBulkAnalyzeOpen(true)}
          className="shrink-0"
        >
          <BrainCircuit />
          Analizar {filteredTotal} filtrado{filteredTotal !== 1 ? 's' : ''}
        </Button>
      )}

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

      <ContactsBulkAnalyzeModal
        open={bulkAnalyzeOpen}
        onOpenChange={setBulkAnalyzeOpen}
        filteredCount={filteredTotal}
        filterGroups={committedGroups}
        search={search || undefined}
      />
    </>
  )
}
