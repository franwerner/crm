import { z } from '@hono/zod-openapi'
import { getTableColumns } from 'drizzle-orm'
import { contacts } from '@shared/db/schema'
import { buildListRawSchema, toListQuery } from '@shared/db/list-query-schema'
import type { ContactListInput } from '@modules/contacts/application/contact.query'

export const contactColumnMap = getTableColumns(contacts)

export const contactSearchCols = [contacts.name, contacts.phone]

export const contactSortableFields = Object.keys(contactColumnMap)

const contactRawSchema = buildListRawSchema(contactColumnMap).extend({
  populated: z
    .string()
    .optional()
    .openapi({ description: 'When true, resolves creator user data', example: 'true' }),
})

export const contactListQuerySchema = contactRawSchema.transform((raw): ContactListInput => {
  const { populated, ...rest } = raw
  return { ...toListQuery(rest, contactSortableFields), populated: populated === 'true' }
})
