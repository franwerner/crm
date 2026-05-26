import { z } from '@hono/zod-openapi'

const SourceChannelEnum = z.enum(['Instagram', 'WhatsApp', 'Referral', 'Email', 'Other'])
const InterestLevelEnum = z.enum(['Cold', 'Warm', 'Hot'])
const ContactTypeEnum = z.enum(['Person', 'Company'])
const SexEnum = z.enum(['Male', 'Female', 'Other', 'Unspecified'])

export const UpdateContactBodySchema = z
  .object({
    name: z.string().min(1).optional().openapi({ description: 'Contact full name', example: 'Jane Doe' }),
    contactType: ContactTypeEnum.optional().openapi({ description: 'Contact type', example: 'Person' }),
    sex: SexEnum.nullable().optional().openapi({ description: 'Sex (only for Person contacts)', example: 'Female' }),
    addressStreet: z.string().nullable().optional().openapi({ description: 'Street name', example: 'Av. Corrientes' }),
    addressNumber: z.string().nullable().optional().openapi({ description: 'Street number', example: '1234' }),
    addressPostalCode: z.string().nullable().optional().openapi({ description: 'Postal code', example: 'C1043' }),
    addressCity: z.string().nullable().optional().openapi({ description: 'City', example: 'Buenos Aires' }),
    addressProvince: z.string().nullable().optional().openapi({ description: 'Province or state', example: 'CABA' }),
    addressCountry: z.string().nullable().optional().openapi({ description: 'Country', example: 'Argentina' }),
    notes: z.string().nullable().optional().openapi({ description: 'Free-form notes', example: 'Met at trade show' }),
    sourceChannel: SourceChannelEnum.nullable().optional().openapi({ description: 'Acquisition channel' }),
    interestLevel: InterestLevelEnum.nullable().optional().openapi({ description: 'Interest level' }),
  })
  .refine(
    (data) => {
      if (data.contactType === 'Company' && data.sex != null) {
        return false
      }
      return true
    },
    {
      message: 'sex must be null for Company contacts',
      path: ['sex'],
    },
  )
  .openapi('UpdateContactBody')

export type UpdateContactRequest = z.infer<typeof UpdateContactBodySchema>
