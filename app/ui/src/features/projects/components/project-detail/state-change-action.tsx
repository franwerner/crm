import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@shared/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseButton,
  DialogDescription,
  DialogFooter,
} from '@shared/ui/dialog'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { Textarea } from '@shared/ui/textarea'
import { Label } from '@shared/ui/label'
import { projectStatusBadge, projectStatusLabels } from '@features/projects/constants/projects.options'
import { ChevronDown } from 'lucide-react'
import type { ProjectViewStatusEnumKey } from '@shared/api/types/ProjectView'
import type { ChangeProjectStateBodyNewStateEnumKey } from '@shared/api/types/ChangeProjectStateBody'

type Transition = {
  target: ChangeProjectStateBodyNewStateEnumKey
  label: string
}

const TRANSITIONS: Record<ProjectViewStatusEnumKey, Transition[]> = {
  Draft: [{ target: 'Active', label: 'Activar' }],
  Active: [
    { target: 'Closed', label: 'Cerrar' },
    { target: 'Cancelled', label: 'Cancelar' },
  ],
  Closed: [],
  Cancelled: [{ target: 'Active', label: 'Reactivar' }],
}

const TERMINAL_STATES: readonly ProjectViewStatusEnumKey[] = ['Closed']

function isNoteRequired(from: ProjectViewStatusEnumKey, to: ChangeProjectStateBodyNewStateEnumKey): boolean {
  if (to === 'Cancelled') return true
  if (from === 'Cancelled' && to === 'Active') return true
  return false
}

type Props = {
  status: ProjectViewStatusEnumKey
  onChangeState: (newState: ChangeProjectStateBodyNewStateEnumKey, note?: string) => Promise<void>
  isPending: boolean
}

export function StateChangeAction({ status, onChangeState, isPending }: Props) {
  const [pendingTarget, setPendingTarget] = useState<ChangeProjectStateBodyNewStateEnumKey | null>(null)
  const [note, setNote] = useState('')

  const transitions = TRANSITIONS[status]
  const isTerminal = TERMINAL_STATES.includes(status)
  const noteRequired = pendingTarget !== null && isNoteRequired(status, pendingTarget)
  const confirmDisabled = isPending || (noteRequired && note.trim().length === 0)

  function closeDialog() {
    setPendingTarget(null)
    setNote('')
  }

  async function handleConfirm() {
    if (!pendingTarget || confirmDisabled) return
    await onChangeState(pendingTarget, note)
    closeDialog()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isTerminal} className="shrink-0">
            Cambiar estado
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {transitions.map((t) => (
            <DropdownMenuItem key={t.target} onClick={() => setPendingTarget(t.target)}>
              {t.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={pendingTarget !== null} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Cambiar estado</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <DialogDescription className="sr-only">Confirmar cambio de estado</DialogDescription>
          <DialogBody className="flex flex-col gap-3">
            <p className="flex flex-wrap items-center gap-1.5 text-[length:var(--ds-font-size-sm)] text-foreground">
              <span>¿Confirmás cambiar el estado de</span>
              <Badge variant={projectStatusBadge[status]}>{projectStatusLabels[status]}</Badge>
              <span>a</span>
              {pendingTarget && (
                <Badge variant={projectStatusBadge[pendingTarget]}>{projectStatusLabels[pendingTarget]}</Badge>
              )}
              <span>?</span>
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="state-change-note">
                Nota{noteRequired ? ' (obligatoria)' : ' (opcional)'}
              </Label>
              <Textarea
                id="state-change-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                aria-invalid={noteRequired && note.trim().length === 0}
                placeholder={noteRequired ? 'Indicá el motivo del cambio' : 'Agregá un comentario (opcional)'}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={closeDialog}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={confirmDisabled}
            >
              {isPending ? 'Cambiando…' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
