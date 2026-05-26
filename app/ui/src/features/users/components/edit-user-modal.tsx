import { updateUserBodySchema } from '@shared/api/schemas/updateUserBodySchema'
import { userEditForm } from '@features/users/constants/user.edit-form'
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
import type { UserView } from '@shared/api/types/UserView'
import type { UpdateUserFormValues } from '@features/users/types/users.types'
import type { FieldSlot } from '@shared/lib/form-view/types'
import type { UpdateUserBody } from '@shared/api/types/UpdateUserBody'

const passwordSlot: FieldSlot<UpdateUserBody> = ({ field, fieldState, descriptor }) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor="edit-password">{descriptor?.label ?? 'Contraseña'}</Label>
    <Input
      id="edit-password"
      type="password"
      value={(field.value as string | undefined) ?? ''}
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
  user: UserView | null
  onClose: () => void
  onSubmit: (id: string, data: UpdateUserFormValues) => Promise<void>
  isPending: boolean
  errorMessage: string | null
}

export function EditUserModal({ user, onClose, onSubmit, isPending, errorMessage }: Props) {
  if (!user) return null

  async function handleSubmit(data: UpdateUserFormValues) {
    const payload: UpdateUserFormValues = {}
    if (data.name) payload.name = data.name
    if (data.password) payload.password = data.password
    const succeeded = await onSubmit(user!.id, payload).then(() => true, () => false)
    if (succeeded) onClose()
  }

  return (
    <Dialog open={!!user} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogDescription>Editar datos del usuario</DialogDescription>
        <DialogBody>
          <EntityForm
            descriptor={userEditForm}
            schema={updateUserBodySchema}
            defaultValues={{ name: user.name, password: '' }}
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitLabel="Guardar cambios"
            pendingLabel="Guardando…"
            isPending={isPending}
            errorMessage={errorMessage}
            fieldSlots={{ password: passwordSlot }}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
