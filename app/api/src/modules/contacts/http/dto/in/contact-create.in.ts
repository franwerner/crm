import { z } from '@hono/zod-openapi'

const SourceChannelEnum = z.enum(['Instagram', 'WhatsApp', 'Referral', 'Email', 'Other'])
const InterestLevelEnum = z.enum(['Cold', 'Warm', 'Hot'])

export const CreateContactBodySchema = z
  .object({
    name: z.string().min(1).openapi({ description: 'Contact full name', example: 'Jane Doe' }),
    phone: z
      .string()
      .nullable()
      .optional()
      .openapi({ description: 'Phone number', example: '+1234567890' }),
    sourceChannel: SourceChannelEnum.nullable()
      .optional()
      .openapi({ description: 'Acquisition channel' }),
    interestLevel: InterestLevelEnum.nullable()
      .optional()
      .openapi({ description: 'Interest level' }),
  })
  .openapi('CreateContactBody')

export type CreateContactRequest = z.infer<typeof CreateContactBodySchema>
