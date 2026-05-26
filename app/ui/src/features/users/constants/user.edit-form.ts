import type { FormDescriptor } from '@shared/lib/form-view/types'
import type { UpdateUserBody } from '@shared/api/types/UpdateUserBody'

export const userEditForm: FormDescriptor<UpdateUserBody> = {
  name: 'user-edit',
  fields: [
    { key: 'name', label: 'Nombre', widget: 'text' },
    { key: 'password', label: 'Contraseña (dejar vacío para no cambiar)', widget: 'text' },
  ],
}
