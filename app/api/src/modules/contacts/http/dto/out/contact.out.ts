import { z } from '@hono/zod-openapi'

const PipelineStateEnum = z.enum(['Contact', 'Lead', 'AtRisk', 'Customer', 'Discarded'])
const SourceChannelEnum = z.enum(['Instagram', 'WhatsApp', 'Referral', 'Email', 'Other'])
const InterestLevelEnum = z.enum(['Cold', 'Warm', 'Hot'])
const ContactTypeEnum = z.enum(['Person', 'Company'])
const SexEnum = z.enum(['Male', 'Female', 'Other', 'Unspecified'])
const ChannelTypeEnum = z.enum(['Phone', 'Email', 'WhatsApp', 'Instagram', 'Website', 'Other'])

const ChannelViewSchema = z.object({
  id: z.string(),
  channelType: ChannelTypeEnum,
  value: z.string(),
  isPrimary: z.boolean(),
})

export const ContactViewSchema = z
  .object({
    id: z.string().openapi({ description: 'Contact UUID', example: '01938b0c-...' }),
    name: z.string().openapi({ example: 'Jane Doe' }),
    contactType: ContactTypeEnum.openapi({ example: 'Person' }),
    sex: SexEnum.nullable().openapi({ example: 'Female' }),
    addressStreet: z.string().nullable().openapi({ example: 'Av. Corrientes' }),
    addressNumber: z.string().nullable().openapi({ example: '1234' }),
    addressPostalCode: z.string().nullable().openapi({ example: 'C1043' }),
    addressCity: z.string().nullable().openapi({ example: 'Buenos Aires' }),
    addressProvince: z.string().nullable().openapi({ example: 'CABA' }),
    addressCountry: z.string().nullable().openapi({ example: 'Argentina' }),
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
      .optional()
      .openapi({ description: 'Creator user data. Present on detail endpoint.' }),
    channels: z.array(ChannelViewSchema).openapi({ description: 'Communication channels' }),
    createdAt: z.string().openapi({ description: 'ISO 8601 timestamp', example: '2024-01-01T00:00:00.000Z' }),
    updatedAt: z.string().openapi({ description: 'ISO 8601 timestamp', example: '2024-01-01T00:00:00.000Z' }),
  })
  .openapi('ContactView')

export type ContactView = z.infer<typeof ContactViewSchema>
