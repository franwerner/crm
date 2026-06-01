import { z } from 'zod/v4'
import type { FormDescriptor } from '@shared/lib/form-view/types'
import type { ContactView } from '@shared/api/types/ContactView'
import { addChannelBodySchema } from '@shared/api/schemas/addChannelBodySchema'
import { channelTypeOptions } from '@features/contacts/constants/contacts.options'

export const channelEditFormSchema = addChannelBodySchema.extend({
  isPrimary: z.boolean(),
})

export type ChannelEditFormValues = z.infer<typeof channelEditFormSchema>

export const channelEditForm: FormDescriptor<ChannelEditFormValues> = {
  name: 'channel-edit',
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

export function getChannelEditDefaults(channel: ContactView['channels'][number]): ChannelEditFormValues {
  return {
    channelType: channel.channelType as ChannelEditFormValues['channelType'],
    value: channel.value,
    isPrimary: channel.isPrimary,
  }
}
