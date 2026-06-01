import { useMemo } from 'react'
import type { DefaultValues } from 'react-hook-form'
import type { RegisterEventBody } from '@shared/api/types/RegisterEventBody'
import type { ContactViewPipelineStateEnumKey } from '@shared/api/types/ContactView'
import { registerEventBodySchema } from '@shared/api/schemas/registerEventBodySchema'
import { makeRegisterEventForm } from '@features/contacts/components/register-event.form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseButton,
  DialogDescription,
} from '@shared/ui/dialog'
import { EntityForm } from '@shared/ui/entity-form'

const defaultValues: DefaultValues<RegisterEventBody> = {
  eventType: undefined,
  detail: '',
  occurredAt: new Date().toISOString(),
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: RegisterEventBody) => Promise<void>
  isPending: boolean
  errorMessage: string | null
  pipelineState: ContactViewPipelineStateEnumKey
}

export function RegisterEventModal({ open, onOpenChange, onSubmit, isPending, errorMessage, pipelineState }: Props) {
  const descriptor = useMemo(() => makeRegisterEventForm(pipelineState), [pipelineState])

  async function handleSubmit(data: RegisterEventBody) {
    const succeeded = await onSubmit(data).then(() => true, () => false)
    if (succeeded) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Registrar evento</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogDescription>Registrar un nuevo evento para este contacto</DialogDescription>
        <DialogBody>
          <EntityForm
            descriptor={descriptor}
            schema={registerEventBodySchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            submitLabel="Registrar"
            pendingLabel="Registrando…"
            isPending={isPending}
            errorMessage={errorMessage}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
