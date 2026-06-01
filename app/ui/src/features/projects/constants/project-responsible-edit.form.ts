import { z } from 'zod/v4'
import type { FormDescriptor } from '@shared/lib/form-view/types'
import { updateResponsibleRoleBodySchema } from '@shared/api/schemas/updateResponsibleRoleBodySchema'

export const responsibleEditFormSchema = updateResponsibleRoleBodySchema

export type ResponsibleEditFormValues = z.infer<typeof responsibleEditFormSchema>

export const responsibleEditForm: FormDescriptor<ResponsibleEditFormValues> = {
  name: 'responsible-edit',
  fields: [
    {
      key: 'role',
      label: 'Rol',
      widget: 'select',
      required: true,
      options: [
        { value: 'Lead', label: 'Líder' },
        { value: 'Member', label: 'Miembro' },
      ],
    },
  ],
}

export function getResponsibleEditDefaults(role: string): ResponsibleEditFormValues {
  return { role: role as ResponsibleEditFormValues['role'] }
}
