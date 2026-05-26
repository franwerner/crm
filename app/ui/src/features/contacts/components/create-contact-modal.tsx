import type { DefaultValues } from 'react-hook-form'
import type { CreateContactFormValues } from '@features/contacts/types/contacts.types'
import { createContactBodySchema } from '@shared/api/schemas/createContactBodySchema'
import { contactCreateForm } from '@features/contacts/constants/contact.form'
import { ChannelsEditor } from '@features/contacts/components/channels-editor'
import type { ChannelInput } from '@features/contacts/components/channels-editor'
import type { FieldSlot } from '@shared/lib/form-view/types'
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

const defaultValues: DefaultValues<CreateContactFormValues> = {
  name: '',
  contactType: 'Person',
  channels: [],
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateContactFormValues) => Promise<void>
  isPending: boolean
  errorMessage: string | null
}

const channelsSlot: FieldSlot<CreateContactFormValues> = ({ field }) => {
  const channels = (field.value as ChannelInput[] | undefined) ?? []
  return (
    <ChannelsEditor
      value={channels}
      onChange={(next) => field.onChange(next)}
    />
  )
}

export function CreateContactModal({ open, onOpenChange, onSubmit, isPending, errorMessage }: Props) {
  async function handleSubmit(data: CreateContactFormValues) {
    const succeeded = await onSubmit(data).then(() => true, () => false)
    if (succeeded) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Nuevo contacto</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogDescription>Crear un nuevo contacto</DialogDescription>
        <DialogBody>
          <EntityForm
            descriptor={contactCreateForm}
            schema={createContactBodySchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            submitLabel="Crear contacto"
            pendingLabel="Creando…"
            isPending={isPending}
            errorMessage={errorMessage}
            fieldSlots={{ channels: channelsSlot }}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
