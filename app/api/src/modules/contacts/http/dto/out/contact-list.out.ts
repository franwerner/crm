import { z } from '@hono/zod-openapi'
import { paginatedResponseSchema } from '../../../../../shared/schemas/pagination.schema'
import { ContactViewSchema } from './contact.out'

export const ContactListResponseSchema = paginatedResponseSchema(ContactViewSchema).openapi('ContactListResponse')

export type ContactListResponse = z.infer<typeof ContactListResponseSchema>
