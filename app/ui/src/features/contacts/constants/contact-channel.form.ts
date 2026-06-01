import { z } from 'zod/v4'
import type { FormDescriptor } from '@shared/lib/form-view/types'
import { addChannelBodySchema } from '@shared/api/schemas/addChannelBodySchema'
import { channelTypeOptions } from '@features/contacts/constants/contacts.options'

export const channelCreateFormSchema = addChannelBodySchema.extend({
  isPrimary: z.boolean(),
})

export type ChannelCreateFormValues = z.infer<typeof channelCreateFormSchema>

export const channelCreateDefaultValues: ChannelCreateFormValues = {
  channelType: 'Phone',
  value: '',
  isPrimary: false,
}

export const channelCreateForm: FormDescriptor<ChannelCreateFormValues> = {
  name: 'channel-create',
  fields: [
    {
      key: 'channelType',
      label: 'Tipo',
      widget: 'select',
      required: true,
      options: channelTypeOptions,
    },
    {
      key: 'value',
      label: 'Valor',
      widget: 'text',
      required: true,
      placeholder: 'Número, URL o usuario',
    },
    {
      key: 'isPrimary',
      label: 'Principal',
      widget: 'switch',
    },
  ],
}
