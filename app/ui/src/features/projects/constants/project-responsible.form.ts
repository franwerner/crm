import { z } from 'zod/v4'
import type { FormDescriptor } from '@shared/lib/form-view/types'
import { makeUserRelation } from '@shared/lib/data-view/relations/user.relation'

export const responsibleCreateFormSchema = z.object({
  userId: z.uuid(),
  role: z.enum(['Lead', 'Member']),
})

export type ResponsibleCreateFormValues = z.infer<typeof responsibleCreateFormSchema>

export const responsibleCreateDefaultValues: ResponsibleCreateFormValues = {
  userId: '',
  role: 'Member',
}

export function makeResponsibleCreateForm(excludeUserIds: readonly string[] = []): FormDescriptor<ResponsibleCreateFormValues> {
  return {
    name: 'responsible-create',
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
          { value: 'Lead', label: 'Líder' },
          { value: 'Member', label: 'Miembro' },
        ],
      },
    ],
  }
}
