import { z } from '@hono/zod-openapi'
import { paginatedResponseSchema } from '@shared/schemas/pagination.schema'
import { ContactStateChangeViewSchema } from '@modules/contacts/http/dto/out/contact-state-change.out'

export const ContactStateChangeListResponseSchema = paginatedResponseSchema(ContactStateChangeViewSchema).openapi('ContactStateChangeListResponse')

export type ContactStateChangeListResponse = z.infer<typeof ContactStateChangeListResponseSchema>
