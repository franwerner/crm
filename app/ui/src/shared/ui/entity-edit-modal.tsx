import type { FieldValues, DefaultValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import type { FormDescriptor, FieldSlot } from '@shared/lib/form-view/types'
import {
  Dialog,
  DialogBody,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog'
import { EntityForm } from '@shared/ui/entity-form'

type Props<T extends FieldValues> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  descriptor: FormDescriptor<T>
  schema: ZodType<T>
  defaultValues: DefaultValues<T>
  onSubmit: (data: T) => Promise<void>
  submitLabel?: string
  pendingLabel?: string
  isPending?: boolean
  errorMessage?: string | null
  fieldSlots?: Partial<Record<keyof T, FieldSlot<T>>>
}

export function EntityEditModal<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  descriptor,
  schema,
  defaultValues,
  onSubmit,
  submitLabel = 'Guardar',
  pendingLabel = 'Guardando…',
  isPending = false,
  errorMessage,
  fieldSlots,
}: Props<T>) {
  async function handleSubmit(data: T) {
    const succeeded = await onSubmit(data).then(() => true, () => false)
    if (succeeded) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size={size}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogDescription>{description ?? title}</DialogDescription>
        <DialogBody>
          <EntityForm
            descriptor={descriptor}
            schema={schema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            submitLabel={submitLabel}
            pendingLabel={pendingLabel}
            isPending={isPending}
            errorMessage={errorMessage}
            fieldSlots={fieldSlots}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
