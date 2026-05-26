import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
  DialogBody,
  DialogFooter,
  DialogDescription,
} from '@shared/ui/dialog'
import { Button } from '@shared/ui/button'
import { FilterBuilder } from '@shared/ui/filter-builder/filter-builder'
import { projectsFilterSchema } from '@features/projects/constants/projects-filter-schema'
import type { FilterGroups } from '@shared/lib/utils/filter'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  committedGroups: FilterGroups
  onApply: (groups: FilterGroups) => void
}

export function ProjectsFilterModal({ open, onOpenChange, committedGroups, onApply }: Props) {
  const [draft, setDraft] = useState<FilterGroups>(committedGroups)

  useEffect(() => {
    if (open) {
      setDraft(committedGroups)
    }
  }, [open, committedGroups])

  function handleApply() {
    onApply(draft)
    onOpenChange(false)
  }

  function handleCancel() {
    onOpenChange(false)
  }

  function handleClear() {
    setDraft([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Filtros</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogDescription>Configurar filtros de proyectos</DialogDescription>
        <DialogBody>
          <FilterBuilder schema={projectsFilterSchema} groups={draft} onChange={setDraft} />
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Limpiar
          </Button>
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button variant="default" size="sm" onClick={handleApply}>
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
