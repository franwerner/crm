import type { FormDescriptor } from '@shared/lib/form-view/types'
import type { CreateContactBody } from '@shared/api/types/CreateContactBody'
import { contactTypeOptions } from '@features/contacts/constants/contacts.options'

export const contactCreateForm: FormDescriptor<CreateContactBody> = {
  name: 'contact-create',
  fields: [
    { key: 'name', label: 'Nombre', widget: 'text', required: true, placeholder: 'Nombre completo' },
    {
      key: 'contactType',
      label: 'Tipo',
      widget: 'select',
      required: true,
      options: contactTypeOptions,
      placeholder: 'Seleccionar tipo…',
    },
    {
      key: 'channels',
      label: 'Canales de comunicación',
      widget: 'text',
    },
  ],
}
