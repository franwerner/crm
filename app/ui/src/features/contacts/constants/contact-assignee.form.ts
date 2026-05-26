import { z } from 'zod/v4'
import type { FormDescriptor } from '@shared/lib/form-view/types'
import { makeUserRelation } from '@shared/lib/data-view/relations/user.relation'

export const assigneeCreateFormSchema = z.object({
  userId: z.uuid(),
  role: z.enum(['Owner', 'Collaborator']),
})

export type AssigneeCreateFormValues = z.infer<typeof assigneeCreateFormSchema>

export const assigneeCreateDefaultValues: AssigneeCreateFormValues = {
  userId: '',
  role: 'Collaborator',
}

export function makeAssigneeCreateForm(excludeUserIds: readonly string[] = []): FormDescriptor<AssigneeCreateFormValues> {
  return {
    name: 'assignee-create',
    fields: [
      {
        key: 'userId',
        label: 'Usuario',
        widget: 'relation',
        required: true,
        relation: makeUserRelation(excludeUserIds),
        placeholder: 'Buscar usuario…',
      },
      {
        key: 'role',
        label: 'Rol',
        widget: 'select',
        required: true,
        options: [
          { value: 'Owner', label: 'Responsable' },
          { value: 'Collaborator', label: 'Colaborador' },
        ],
      },
    ],
  }
}
