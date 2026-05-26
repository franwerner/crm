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
  Cancelled: [],
}

const TERMINAL_STATES: readonly ProjectViewStatusEnumKey[] = ['Closed', 'Cancelled']

type Props = {
  status: ProjectViewStatusEnumKey
  onChangeState: (newState: ChangeProjectStateBodyNewStateEnumKey) => Promise<void>
  isPending: boolean
}

export function StateChangeAction({ status, onChangeState, isPending }: Props) {
  const [pendingTarget, setPendingTarget] = useState<ChangeProjectStateBodyNewStateEnumKey | null>(null)

  const transitions = TRANSITIONS[status]
  const isTerminal = TERMINAL_STATES.includes(status)

  async function handleConfirm() {
    if (!pendingTarget) return
    await onChangeState(pendingTarget)
    setPendingTarget(null)
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

      <Dialog open={pendingTarget !== null} onOpenChange={(open) => { if (!open) setPendingTarget(null) }}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Cambiar estado</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <DialogDescription className="sr-only">Confirmar cambio de estado</DialogDescription>
          <DialogBody>
            <p className="text-[length:var(--ds-font-size-sm)] text-foreground">
              ¿Confirmás cambiar el estado a <strong>{transitions.find(t => t.target === pendingTarget)?.label ?? pendingTarget}</strong>?
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPendingTarget(null)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? 'Cambiando…' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
