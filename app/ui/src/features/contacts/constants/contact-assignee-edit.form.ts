import { z } from 'zod/v4'
import type { FormDescriptor } from '@shared/lib/form-view/types'

export const assigneeEditFormSchema = z.object({
  role: z.enum(['Owner', 'Collaborator']),
})

export type AssigneeEditFormValues = z.infer<typeof assigneeEditFormSchema>

export const assigneeEditForm: FormDescriptor<AssigneeEditFormValues> = {
  name: 'assignee-edit',
  fields: [
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

export function getAssigneeEditDefaults(role: string): AssigneeEditFormValues {
  return { role: role as AssigneeEditFormValues['role'] }
}
