import { z } from '@hono/zod-openapi'
import { paginatedResponseSchema } from '@shared/schemas/pagination.schema'

const PipelineStateEnum = z.enum(['Contact', 'Lead', 'AtRisk', 'Customer', 'Discarded'])
const SourceChannelEnum = z.enum(['Instagram', 'WhatsApp', 'Referral', 'Email', 'Other'])
const InterestLevelEnum = z.enum(['Cold', 'Warm', 'Hot'])
const ContactTypeEnum = z.enum(['Person', 'Company'])
const SexEnum = z.enum(['Male', 'Female', 'Other', 'Unspecified'])
const ChannelTypeEnum = z.enum(['Phone', 'Email', 'WhatsApp', 'Instagram', 'Website', 'Other'])

export const ContactListItemSchema = z
  .object({
    id: z.string().openapi({ description: 'Contact UUID', example: '01938b0c-...' }),
    name: z.string().openapi({ example: 'Jane Doe' }),
    contactType: ContactTypeEnum.openapi({ example: 'Person' }),
    sex: SexEnum.nullable().openapi({ example: 'Female' }),
    notes: z.string().nullable().openapi({ example: 'Met at trade show' }),
    pipelineState: PipelineStateEnum.openapi({ example: 'Contact' }),
    sourceChannel: SourceChannelEnum.nullable().openapi({ example: 'Instagram' }),
    interestLevel: InterestLevelEnum.nullable().openapi({ example: 'Warm' }),
    createdBy: z.string().openapi({ description: 'User UUID who created this contact' }),
    creator: z
      .object({
        id: z.string(),
        name: z.string(),
      })
      .nullable()
      .openapi({ description: 'Creator user data. Null if the creator user no longer exists.' }),
    primaryChannel: z
      .object({
        channelType: ChannelTypeEnum,
        value: z.string(),
      })
      .nullable()
      .openapi({ description: 'Primary communication channel' }),
    createdAt: z.string().openapi({ description: 'ISO 8601 timestamp', example: '2024-01-01T00:00:00.000Z' }),
    updatedAt: z.string().openapi({ description: 'ISO 8601 timestamp', example: '2024-01-01T00:00:00.000Z' }),
  })
  .openapi('ContactListItem')

export const ContactListResponseSchema = paginatedResponseSchema(ContactListItemSchema).openapi('ContactListResponse')

export type ContactListResponse = z.infer<typeof ContactListResponseSchema>
