// eslint-disable-next-line boundaries/element-types
import { useAddResponsible, useUpdateResponsible, useRemoveResponsible } from '@features/projects/hooks/use-project-responsibles-mutations'
import { ProjectResponsiblesPanel } from '@features/projects/components/project-detail/people/project-responsibles-panel'
import type { ProjectView } from '@shared/api/types/ProjectView'
import type { ResponsibleCreateFormValues } from '@features/projects/constants/project-responsible.form'
import type { ResponsibleEditFormValues } from '@features/projects/constants/project-responsible-edit.form'

type Props = {
  projectId: string
  responsibles: ProjectView['responsibles']
}

export function ProjectPeopleTab({ projectId, responsibles }: Props) {
  const { addResponsible, isPending: isAddingResponsible, errorMessage: addResponsibleError } = useAddResponsible(projectId)
  const { updateResponsible, isPending: isUpdatingResponsible, errorMessage: updateResponsibleError } = useUpdateResponsible(projectId)
  const { removeResponsible, isPending: isRemovingResponsible } = useRemoveResponsible(projectId)

  async function handleAdd(data: ResponsibleCreateFormValues) {
    await addResponsible(data)
  }

  async function handleEdit(userId: string, data: ResponsibleEditFormValues) {
    await updateResponsible(userId, data)
  }

  async function handleDelete(userId: string) {
    await removeResponsible(userId)
  }

  return (
    <ProjectResponsiblesPanel
      responsibles={responsibles}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      isAdding={isAddingResponsible}
      isUpdating={isUpdatingResponsible}
      isRemoving={isRemovingResponsible}
      addError={addResponsibleError}
      updateError={updateResponsibleError}
    />
  )
}
