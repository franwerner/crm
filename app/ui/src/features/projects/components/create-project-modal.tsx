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
import { projectCreateForm, projectCreateFormSchema, projectCreateDefaultValues } from '@features/projects/constants/project.form'
import type { ProjectCreateFormValues } from '@features/projects/constants/project.form'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ProjectCreateFormValues) => Promise<void>
  isPending: boolean
  errorMessage: string | null
}

export function CreateProjectModal({ open, onOpenChange, onSubmit, isPending, errorMessage }: Props) {
  async function handleSubmit(data: ProjectCreateFormValues) {
    const succeeded = await onSubmit(data).then(() => true, () => false)
    if (succeeded) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Nuevo proyecto</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogDescription>Crear un nuevo proyecto</DialogDescription>
        <DialogBody>
          <EntityForm
            descriptor={projectCreateForm}
            schema={projectCreateFormSchema}
            defaultValues={projectCreateDefaultValues}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            submitLabel="Crear proyecto"
            pendingLabel="Creando…"
            isPending={isPending}
            errorMessage={errorMessage}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
