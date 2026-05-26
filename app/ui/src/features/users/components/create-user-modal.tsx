import type { DefaultValues } from 'react-hook-form'
import { createUserBodySchema } from '@shared/api/schemas/createUserBodySchema'
import { userCreateForm } from '@features/users/constants/user.create-form'
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
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import type { CreateUserFormValues } from '@features/users/types/users.types'
import type { FieldSlot } from '@shared/lib/form-view/types'
import type { CreateUserBody } from '@shared/api/types/CreateUserBody'

const defaultValues: DefaultValues<CreateUserFormValues> = {
  email: '',
  name: '',
  password: '',
}

const passwordSlot: FieldSlot<CreateUserBody> = ({ field, fieldState, descriptor }) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor="password">{descriptor?.label ?? 'Contraseña'}</Label>
    <Input
      id="password"
      type="password"
      value={field.value as string}
      onChange={(e) => field.onChange(e.target.value)}
      onBlur={field.onBlur}
      name={field.name}
    />
    {fieldState.error && (
      <span className="text-[length:var(--ds-font-size-xs)] text-destructive">
        {fieldState.error.message}
      </span>
    )}
  </div>
)

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateUserFormValues) => Promise<void>
  isPending: boolean
  errorMessage: string | null
}

export function CreateUserModal({ open, onOpenChange, onSubmit, isPending, errorMessage }: Props) {
  async function handleSubmit(data: CreateUserFormValues) {
    const succeeded = await onSubmit(data).then(() => true, () => false)
    if (succeeded) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogDescription>Crear un nuevo usuario</DialogDescription>
        <DialogBody>
          <EntityForm
            descriptor={userCreateForm}
            schema={createUserBodySchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            submitLabel="Crear usuario"
            pendingLabel="Creando…"
            isPending={isPending}
            errorMessage={errorMessage}
            fieldSlots={{ password: passwordSlot }}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
