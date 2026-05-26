import { z } from '@hono/zod-openapi'

const ChannelTypeEnum = z.enum(['Phone', 'Email', 'WhatsApp', 'Instagram', 'Website', 'Other'])

export const AddChannelBodySchema = z
  .object({
    channelType: ChannelTypeEnum.openapi({ description: 'Communication channel type', example: 'Phone' }),
    value: z.string().min(1).openapi({ description: 'Channel value (phone number, URL, handle)', example: '+1234567890' }),
    isPrimary: z.boolean().optional().openapi({ description: 'Whether this is the primary contact channel', example: false }),
  })
  .openapi('AddChannelBody')

export type AddChannelRequest = z.infer<typeof AddChannelBodySchema>

export const UpdateChannelBodySchema = z
  .object({
    channelType: ChannelTypeEnum.optional().openapi({ description: 'Communication channel type', example: 'Phone' }),
    value: z.string().min(1).optional().openapi({ description: 'Channel value (phone number, URL, handle)', example: '+1234567890' }),
    isPrimary: z.boolean().optional().openapi({ description: 'Whether this is the primary contact channel', example: false }),
  })
  .openapi('UpdateChannelBody')

export type UpdateChannelRequest = z.infer<typeof UpdateChannelBodySchema>
