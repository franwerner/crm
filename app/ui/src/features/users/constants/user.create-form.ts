import type { FormDescriptor } from '@shared/lib/form-view/types'
import type { CreateUserBody } from '@shared/api/types/CreateUserBody'

export const userCreateForm: FormDescriptor<CreateUserBody> = {
  name: 'user-create',
  fields: [
    { key: 'email', label: 'Email', widget: 'text' },
    { key: 'name', label: 'Nombre', widget: 'text' },
    { key: 'password', label: 'Contraseña', widget: 'text' },
  ],
}
