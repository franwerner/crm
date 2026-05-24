import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@shared/ui/button'
import {
  Dialog,
  DialogBody,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'
import type { ContactPipelineState } from '@features/contacts/contacts.types'

const PIPELINE_STATES: ContactPipelineState[] = ['Contact', 'Lead', 'Customer', 'Discarded']

type Props = {
  count: number
  onDelete: () => void
  onChangeState: (state: ContactPipelineState) => void
  isDeleting?: boolean
  isChangingState?: boolean
}

export function ContactsBulkbar({ count, onDelete, onChangeState, isDeleting, isChangingState }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleConfirmDelete() {
    setConfirmOpen(false)
    onDelete()
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-[var(--ds-font-weight-semibold)] text-foreground">
        {count} {count === 1 ? 'seleccionado' : 'seleccionados'}
      </span>

      <Select onValueChange={(val) => onChangeState(val as ContactPipelineState)} disabled={isChangingState || isDeleting}>
        <SelectTrigger
          size="sm"
          className="h-8 w-auto min-w-[140px] rounded-full border-[1.5px] border-brand bg-background text-xs"
        >
          <SelectValue placeholder="Cambiar estado…" />
        </SelectTrigger>
        <SelectContent>
          {PIPELINE_STATES.map((state) => (
            <SelectItem key={state} value={state}>
              {state}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="destructive"
        size="sm"
        onClick={() => setConfirmOpen(true)}
        disabled={isDeleting || isChangingState}
      >
        <Trash2 />
        Eliminar
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Eliminar contactos</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <DialogDescription>Confirmar eliminación de contactos</DialogDescription>
          <DialogBody>
            ¿Eliminar {count} {count === 1 ? 'contacto' : 'contactos'}? Esta acción no se puede deshacer.
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
