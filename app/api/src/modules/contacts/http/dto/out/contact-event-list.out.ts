import { z } from '@hono/zod-openapi'
import { paginatedResponseSchema } from '@shared/schemas/pagination.schema'
import { ContactEventViewSchema } from '@modules/contacts/http/dto/out/contact-event.out'

export const ContactEventListResponseSchema = paginatedResponseSchema(ContactEventViewSchema).openapi('ContactEventListResponse')

export type ContactEventListResponse = z.infer<typeof ContactEventListResponseSchema>
