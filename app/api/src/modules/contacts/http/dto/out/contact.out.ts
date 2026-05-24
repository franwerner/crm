import { z } from '@hono/zod-openapi'

const PipelineStateEnum = z.enum(['Contact', 'Lead', 'Customer', 'Discarded'])
const SourceChannelEnum = z.enum(['Instagram', 'WhatsApp', 'Referral', 'Email', 'Other'])
const InterestLevelEnum = z.enum(['Cold', 'Warm', 'Hot'])

export const ContactViewSchema = z
  .object({
    id: z.string().openapi({ description: 'Contact UUID', example: '01938b0c-...' }),
    name: z.string().openapi({ example: 'Jane Doe' }),
    phone: z.string().nullable().openapi({ example: '+1234567890' }),
    pipelineState: PipelineStateEnum.openapi({ example: 'Contact' }),
    stateLocked: z.boolean().openapi({ example: false }),
    sourceChannel: SourceChannelEnum.nullable().openapi({ example: 'Instagram' }),
    interestLevel: InterestLevelEnum.nullable().openapi({ example: 'Warm' }),
    createdBy: z.string().openapi({ description: 'User UUID who created this contact' }),
    createdAt: z.string().openapi({ description: 'ISO 8601 timestamp', example: '2024-01-01T00:00:00.000Z' }),
    updatedAt: z.string().openapi({ description: 'ISO 8601 timestamp', example: '2024-01-01T00:00:00.000Z' }),
  })
  .openapi('ContactView')

export type ContactView = z.infer<typeof ContactViewSchema>
